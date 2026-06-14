export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getTenantDb } from "@/db/tenant";
import { orders, products, digitalDeliveries, siteSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import { generateId } from "@/lib/utils";
import { nanoid } from "nanoid";

async function getTenantFromPaymentIntent(paymentIntentId: string, tenantSlug: string) {
  const db = await getTenantDb(tenantSlug);
  return db.select().from(orders).where(eq(orders.paymentRef, paymentIntentId)).get();
}

async function generateDigitalDeliveries(tenantSlug: string, orderId: string) {
  const db = await getTenantDb(tenantSlug);
  const order = await db.select().from(orders).where(eq(orders.id, orderId)).get();
  if (!order) return;

  const items: Array<{ productId: string; qty: number }> = JSON.parse(order.items);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const now = new Date();

  for (const item of items) {
    const product = await db.select().from(products).where(eq(products.id, item.productId)).get();
    if (!product || product.type !== "digital") continue;

    const files: Array<{ name: string; url: string }> = JSON.parse(product.downloadFiles);
    if (!files.length) continue;

    await db.insert(digitalDeliveries).values({
      id: generateId(),
      orderId,
      productId: item.productId,
      token: nanoid(32),
      downloadLimit: 3,
      downloadCount: 0,
      expiresAt,
      createdAt: now,
    });
  }
}

export async function POST(req: NextRequest) {
  // Stripe sends webhook to /api/checkout/webhook
  // Tenant is identified from the payment intent metadata
  const body = await req.text();
  const sig = req.headers.get("stripe-signature");

  // The tenant slug must be passed as a query param when registering the webhook URL
  // e.g. /api/checkout/webhook?tenant=acme
  const tenantSlug = req.nextUrl.searchParams.get("tenant") ?? "default";

  try {
    const db = await getTenantDb(tenantSlug);
    const secretRow = await db.select().from(siteSettings).where(eq(siteSettings.key, "stripe_webhook_secret")).get();
    const webhookSecret = secretRow?.value;

    let event: any;
    if (webhookSecret && sig) {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? "", { apiVersion: "2026-05-27.dahlia" });
      event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
    } else {
      event = JSON.parse(body);
    }

    if (event.type === "payment_intent.succeeded") {
      const intent = event.data.object;
      const order = await db.select().from(orders).where(eq(orders.paymentRef, intent.id)).get();
      if (order) {
        await db.update(orders).set({
          status: "processing",
          paymentStatus: "paid",
          updatedAt: new Date(),
        }).where(eq(orders.id, order.id));
        await generateDigitalDeliveries(tenantSlug, order.id);
      }
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ error: "Webhook failed" }, { status: 400 });
  }
}
