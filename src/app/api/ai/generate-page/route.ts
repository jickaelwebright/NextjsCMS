export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { getTenantDb } from "@/db/tenant";
import { siteSettings } from "@/db/schema/tenant";
import { eq } from "drizzle-orm";
import { generateWithAI } from "@/lib/aiService";
import type { AIProvider } from "@/lib/aiService";
import { z } from "zod";

const RequestSchema = z.object({
  prompt: z.string().min(1).max(2000),
  provider: z.enum(["openai", "openrouter", "nvidia-nim", "gemini", "ollama"]),
  model: z.string().min(1),
  mode: z.enum(["page", "section"]).default("page"),
});

const AI_KEY_SETTING: Record<AIProvider, string> = {
  openai: "ai_openai_key",
  openrouter: "ai_openrouter_key",
  "nvidia-nim": "ai_nim_key",
  gemini: "ai_gemini_key",
  ollama: "ai_ollama_url",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const tenantSlug = (session.user as any).tenantSlug;
  const db = await getTenantDb(tenantSlug);

  const body = await req.json();
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { prompt, provider, model, mode } = parsed.data;

  // Look up API key from tenant settings
  const keyField = AI_KEY_SETTING[provider];
  const rows = await db.select().from(siteSettings).where(eq(siteSettings.key, keyField));
  const apiKey = rows[0]?.value ?? null;

  if (!apiKey) {
    const errMsg =
      provider === "ollama"
        ? "No Ollama URL configured. Go to Settings → AI Integration to set the Ollama URL."
        : `No API key configured for ${provider}. Go to Settings → AI Integration to add your key.`;
    return NextResponse.json({ error: errMsg, missingKey: true }, { status: 400 });
  }

  try {
    const config =
      provider === "ollama"
        ? { provider, apiKey: "", model, baseUrl: apiKey }
        : { provider, apiKey, model };
    const result = await generateWithAI(config, prompt, mode);
    return NextResponse.json({ result });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
