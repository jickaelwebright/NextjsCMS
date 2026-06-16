export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { z } from "zod";

const TestSchema = z.object({
  provider: z.enum(["openai", "openrouter", "nvidia-nim", "gemini", "ollama"]),
  key: z.string().min(1),
});

const OPENAI_COMPAT_BASE: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = TestSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const { provider, key } = parsed.data;

  try {
    if (provider === "ollama") {
      const baseUrl = key.replace(/\/+$/, "");
      const res = await fetch(`${baseUrl}/api/version`, {
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) {
        return NextResponse.json({ ok: false, error: `HTTP ${res.status}: ${res.statusText}` });
      }
      let models: string[] = [];
      try {
        const tagsRes = await fetch(`${baseUrl}/api/tags`, { signal: AbortSignal.timeout(8000) });
        if (tagsRes.ok) {
          const data = await tagsRes.json();
          models = (data.models ?? []).map((m: { name: string }) => m.name);
        }
      } catch { /* ignore */ }
      return NextResponse.json({ ok: true, models });
    }

    if (provider === "gemini") {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${encodeURIComponent(key)}`,
        { signal: AbortSignal.timeout(8000) }
      );
      if (!res.ok) {
        let errText = res.statusText;
        try {
          const d = await res.json();
          errText = d?.error?.message ?? errText;
        } catch { /* use statusText */ }
        return NextResponse.json({ ok: false, error: errText });
      }
      return NextResponse.json({ ok: true });
    }

    // OpenAI-compatible providers
    const baseUrl = OPENAI_COMPAT_BASE[provider];
    const headers: Record<string, string> = { Authorization: `Bearer ${key}` };
    if (provider === "openrouter") {
      headers["HTTP-Referer"] = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    }
    const res = await fetch(`${baseUrl}/models`, {
      headers,
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) {
      let errText = res.statusText;
      try {
        const d = await res.json();
        errText = String(d?.error?.message ?? d?.error ?? errText);
      } catch { /* use statusText */ }
      return NextResponse.json({ ok: false, error: errText.slice(0, 200) });
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Connection failed";
    return NextResponse.json({ ok: false, error: message });
  }
}
