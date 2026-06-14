export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { getTenantDb } from "@/db/tenant";
import { orders, products, digitalDeliveries, siteSettings } from "@/db/schema/tenant";
import { isAddonEnabled } from "@/lib/addonService";
import { generateId } from "@/lib/utils";
import { eq, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

interface CartItem {
  productId: string;
  variantId?: string;
  qty: number;
  price: number;
  name: string;
  image?: string;
}

async function getStripeKey(tenantSlug: string): Promise<string | null> {
  try {
    const db = getTenantDb(tenantSlug);
    const row = await db.select().from(siteSettings).where(eq(siteSettings.key, "stripe_secret_key")).get();
    return row?.value?.trim() || null;
  } catch { return null; }
}

function generateOrderNumber(): string {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `ORD-${Date.now().toString(36).toUpperCase()}-${n}`;
}

export async function POST(req: NextRequest) {
  const hdrs = await headers();
  const tenantSlug = hdrs.get("x-tenant-slug") ?? "default";
  if (!await isAddonEnabled(tenantSlug, "shop")) {
    return NextResponse.json({ error: "Shop addon not enabled" }, { status: 403 });
  }

  const body = await req.json();
  const { cart, billing, shipping, paymentMethod = "stripe" } = body as {
    cart: CartItem[];
    billing: { name: string; email: string; address: string; city: string; state: string; postcode: string; country: string };
    shipping?: Record<string, string>;
    paymentMethod?: string;
  };

  if (!cart?.length || !billing?.email) {
    return NextResponse.json({ error: "Missing cart or billing info" }, { status: 400 });
  }

  const db = getTenantDb(tenantSlug);

  // Validate cart items against DB
  const productIds = [...new Set(cart.map((i) => i.productId))];
  const dbProducts = await db.select().from(products).where(inArray(products.id, productIds));
  const productMap = Object.fromEntries(dbProducts.map((p) => [p.id, p]));

  let subtotal = 0;
  const validatedItems = cart.map((item) => {
    const dbProduct = productMap[item.productId];
    const unitPrice = dbProduct ? (dbProduct.salePrice ?? dbProduct.price) : Math.round(item.price * 100);
    subtotal += unitPrice * item.qty;
    return { ...item, price: unitPrice };
  });

  const shippingCost = 0; // Flat free shipping (configurable in future)
  const tax = 0;
  const total = subtotal + shippingCost + tax;

  const orderId = generateId();
  const orderNumber = generateOrderNumber();
  const now = new Date();

  // Try Stripe payment intent
  let clientSecret: string | null = null;
  let stripePaymentIntentId: string | null = null;

  const stripeKey = await getStripeKey(tenantSlug);
  if (paymentMethod === "stripe" && stripeKey) {
    try {
      const Stripe = (await import("stripe")).default;
      const stripe = new Stripe(stripeKey, { apiVersion: "2026-05-27.dahlia" });
      const intent = await stripe.paymentIntents.create({
        amount: total,
        currency: "aud",
        metadata: { orderId, orderNumber, tenantSlug },
        receipt_email: billing.email,
      });
      clientSecret = intent.client_secret;
      stripePaymentIntentId = intent.id;
    } catch (err) {
      console.error("Stripe error:", err);
    }
  }

  // Create order record
  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    status: "pending",
    customerEmail: billing.email,
    customerName: billing.name,
    billingAddress: JSON.stringify(billing),
    shippingAddress: JSON.stringify(shipping ?? billing),
    items: JSON.stringify(validatedItems),
    subtotal,
    shippingCost,
    tax,
    total,
    paymentMethod: stripePaymentIntentId ? "stripe" : "manual",
    paymentStatus: "unpaid",
    paymentRef: stripePaymentIntentId ?? null,
    createdAt: now,
    updatedAt: now,
  });

  return NextResponse.json({
    orderId,
    orderNumber,
    total,
    clientSecret,
    requiresPayment: !!clientSecret,
  });
}
