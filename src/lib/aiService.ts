export type AIProvider = "openai" | "openrouter" | "nvidia-nim" | "gemini" | "ollama";

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  model: string;
  baseUrl?: string;
}

// ─── Provider constants ───────────────────────────────────────────────────────

const OPENAI_COMPATIBLE_URLS: Record<string, string> = {
  openai: "https://api.openai.com/v1",
  openrouter: "https://openrouter.ai/api/v1",
  "nvidia-nim": "https://integrate.api.nvidia.com/v1",
};

// Models that support response_format: { type: "json_object" }
const JSON_MODE_PROVIDERS = new Set(["openai", "openrouter"]);

// ─── Block schema for system prompt ──────────────────────────────────────────

const BLOCK_EXAMPLES = `
Block types (each has "id": string, "type": string, "styles": {}):

heading  → {"type":"heading","id":"b1","props":{"content":"Section Title","level":2,"align":"center","color":"#111827"},"styles":{}}
text     → {"type":"text","id":"b2","props":{"content":"<p>Body copy here. Use <strong>bold</strong> for emphasis.</p>","align":"left","fontSize":"base"},"styles":{}}
image    → {"type":"image","id":"b3","props":{"src":"","alt":"Descriptive alt text","objectFit":"cover"},"styles":{}}
button   → {"type":"button","id":"b4","props":{"label":"Get Started","href":"#contact","variant":"primary","size":"md","align":"center"},"styles":{}}
hero     → {"type":"hero","id":"b5","props":{"heading":"Your Main Headline","subheading":"A compelling subtitle","ctaLabel":"Start Free Trial","ctaHref":"#","backgroundOverlay":50,"minHeight":"70vh","align":"center","textColor":"#ffffff"},"styles":{}}
card     → {"type":"card","id":"b6","props":{"heading":"Feature Name","body":"What this feature does and why it matters.","ctaLabel":"Learn More","ctaHref":"#","variant":"default"},"styles":{}}
divider  → {"type":"divider","id":"b7","props":{"style":"solid","color":"#e5e7eb","thickness":1},"styles":{}}
spacer   → {"type":"spacer","id":"b8","props":{"height":48},"styles":{}}
form     → {"type":"form","id":"b9","props":{"submitLabel":"Send Message","successMessage":"Thank you! We will be in touch shortly.","fields":[{"id":"f1","type":"text","label":"Full Name","placeholder":"Your name","required":true},{"id":"f2","type":"email","label":"Email","placeholder":"you@example.com","required":true},{"id":"f3","type":"textarea","label":"Message","placeholder":"How can we help?","required":false}]},"styles":{}}`.trim();

const COLUMN_RULES = `
Column span rules (spans must sum to 12):
  "1"                 → one column,  spans: [12]
  "1/2+1/2"           → two columns, spans: [6, 6]
  "1/3+2/3"           → two columns, spans: [4, 8]
  "2/3+1/3"           → two columns, spans: [8, 4]
  "1/3+1/3+1/3"       → three columns, spans: [4, 4, 4]
  "1/4+1/4+1/4+1/4"  → four columns, spans: [3, 3, 3, 3]`.trim();

// ─── System prompts ───────────────────────────────────────────────────────────

export const SYSTEM_PROMPT_PAGE = `You are a professional web page content generator for a visual CMS builder.

Given a page description, return a complete PageDocument JSON object.

CRITICAL OUTPUT RULES:
- Return ONLY raw JSON. No markdown. No code fences. No explanations.
- Your entire response must be a single JSON object starting with { and ending with }.

=== SCHEMA ===

PageDocument:
{
  "version": 1,
  "meta": {"title": string, "slug": string, "description"?: string},
  "settings": {"headerVisible": true, "footerVisible": true},
  "sections": Section[]
}

Section:
{
  "id": string,
  "columnLayout": "1" | "1/2+1/2" | "1/3+2/3" | "2/3+1/3" | "1/3+1/3+1/3" | "1/4+1/4+1/4+1/4",
  "columns": Column[],
  "styles": {"mobile": {"paddingTop": "64px", "paddingBottom": "64px"}, "tablet": {}, "desktop": {}},
  "containerWidth": "xl"
}

Column: {"id": string, "span": number, "blocks": Block[], "styles": {}}

${COLUMN_RULES}

${BLOCK_EXAMPLES}

=== DESIGN RULES ===
1. Start with a hero block (first section, layout "1") — not just a heading
2. Use card blocks in "1/3+1/3+1/3" sections for features/services/benefits (3 per row)
3. Use "1/4+1/4+1/4+1/4" for 4-item grids (stats, small icons, team members)
4. Use "1/2+1/2" for content-beside-image or two-column text layouts
5. End landing pages with a contact form or strong CTA section
6. Use h1 only in the hero (or never — hero block handles it). Use h2 for section titles, h3 for card headings
7. image src must always be "" — users upload images via the media library
8. text block content must be valid HTML (wrap paragraphs in <p>, use <strong> for bold)
9. Write professional, industry-specific copy — not generic lorem ipsum
10. IDs: sections "s1","s2","s3"; columns "c1a","c1b","c2a","c2b"; blocks "b1","b2","b3" (all unique)
11. Add spacer blocks (height 40–80) between major sections for visual breathing room
12. section styles paddingTop/paddingBottom: "80px" for hero, "64px" for other sections`;

export const SYSTEM_PROMPT_SECTION = `You are a professional web section content generator for a visual CMS builder.

Given a description, return a single Section JSON object.

CRITICAL OUTPUT RULES:
- Return ONLY raw JSON. No markdown. No code fences. No explanations.
- Your entire response must be a single JSON object starting with { and ending with }.

=== SECTION SCHEMA ===

{
  "id": "s1",
  "columnLayout": "1" | "1/2+1/2" | "1/3+2/3" | "2/3+1/3" | "1/3+1/3+1/3" | "1/4+1/4+1/4+1/4",
  "columns": [{"id": "c1a", "span": number, "blocks": Block[], "styles": {}}],
  "styles": {"mobile": {"paddingTop": "64px", "paddingBottom": "64px"}, "tablet": {}, "desktop": {}},
  "containerWidth": "xl"
}

${COLUMN_RULES}

${BLOCK_EXAMPLES}

Write professional, industry-appropriate copy. Use realistic content, not lorem ipsum.
IDs must be unique strings: "s1", columns "c1a","c1b", blocks "b1","b2","b3".
image src must always be "".`;

// ─── JSON extraction ──────────────────────────────────────────────────────────

function extractJson(text: string): unknown {
  const trimmed = text.trim();

  // Try direct parse first
  try { return JSON.parse(trimmed); } catch { /* continue */ }

  // Strip code fences ```json ... ``` or ``` ... ```
  const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    try { return JSON.parse(fenceMatch[1].trim()); } catch { /* continue */ }
  }

  // Find the outermost { ... }
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start !== -1 && end > start) {
    try { return JSON.parse(trimmed.slice(start, end + 1)); } catch { /* continue */ }
  }

  throw new Error("AI returned invalid JSON. Try again or use a different model.");
}

// ─── OpenAI-compatible call (OpenAI, OpenRouter, NVIDIA NIM) ─────────────────

async function callOpenAICompatible(
  config: AIProviderConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const baseUrl =
    config.provider === "ollama"
      ? `${(config.baseUrl ?? "http://localhost:11434").replace(/\/+$/, "")}/v1`
      : OPENAI_COMPATIBLE_URLS[config.provider];
  const useJsonMode = JSON_MODE_PROVIDERS.has(config.provider);

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (config.provider !== "ollama") {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  // OpenRouter requires these headers for routing and rate-limit tracking
  if (config.provider === "openrouter") {
    headers["HTTP-Referer"] = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
    headers["X-Title"] = "NextjsCMS AI Builder";
  }

  const body: Record<string, unknown> = {
    model: config.model,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ],
    temperature: 0.7,
    max_tokens: 4096,
  };

  if (useJsonMode) {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${baseUrl}/chat/completions`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`${config.provider} error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as { choices: Array<{ message: { content: string } }> };
  const content = data?.choices?.[0]?.message?.content;
  if (!content) throw new Error("Empty response from AI provider");
  return content;
}

// ─── Gemini call ──────────────────────────────────────────────────────────────

async function callGemini(
  config: AIProviderConfig,
  systemPrompt: string,
  userPrompt: string
): Promise<string> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${config.model}:generateContent?key=${config.apiKey}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: userPrompt }] }],
      systemInstruction: { parts: [{ text: systemPrompt }] },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 4096,
        responseMimeType: "application/json",
      },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`Gemini error ${res.status}: ${errText}`);
  }

  const data = (await res.json()) as {
    candidates: Array<{ content: { parts: Array<{ text: string }> } }>;
  };
  const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!content) throw new Error("Empty response from Gemini");
  return content;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function generateWithAI(
  config: AIProviderConfig,
  userPrompt: string,
  mode: "page" | "section"
): Promise<unknown> {
  const systemPrompt = mode === "page" ? SYSTEM_PROMPT_PAGE : SYSTEM_PROMPT_SECTION;

  const raw =
    config.provider === "gemini"
      ? await callGemini(config, systemPrompt, userPrompt)
      : await callOpenAICompatible(config, systemPrompt, userPrompt);

  return extractJson(raw);
}
