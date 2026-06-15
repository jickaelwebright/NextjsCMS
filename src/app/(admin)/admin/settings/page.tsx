"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Save, Eye, EyeOff, ExternalLink, Upload, CheckCircle, XCircle, Loader2 } from "lucide-react";

type Tab = "site" | "header" | "footer" | "ai" | "ftp" | "shop";

interface AISettings {
  ai_openai_key: string;
  ai_openrouter_key: string;
  ai_nim_key: string;
  ai_gemini_key: string;
}

function MaskedInput({
  label,
  value,
  onChange,
  placeholder,
  helpText,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  helpText?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          className="w-full border rounded-lg px-3 py-2 text-sm pr-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete="off"
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {show ? <EyeOff size={15} /> : <Eye size={15} />}
        </button>
      </div>
      {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}
    </div>
  );
}

interface FTPSettings {
  ftp_host: string;
  ftp_port: string;
  ftp_user: string;
  ftp_password: string;
  ftp_remote_path: string;
  ftp_secure: string;
}

type DeployLogEntry = { slug: string; ok: boolean; message: string };

export default function SettingsPage() {
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [siteUrl, setSiteUrl] = useState("");
  const [orgName, setOrgName] = useState("");
  const [orgLogoUrl, setOrgLogoUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<Tab>("site");

  // AI settings
  const [aiKeys, setAiKeys] = useState<AISettings>({
    ai_openai_key: "",
    ai_openrouter_key: "",
    ai_nim_key: "",
    ai_gemini_key: "",
  });
  const [savingAI, setSavingAI] = useState(false);

  // FTP settings
  const [ftp, setFtp] = useState<FTPSettings>({
    ftp_host: "",
    ftp_port: "21",
    ftp_user: "",
    ftp_password: "",
    ftp_remote_path: "/public_html",
    ftp_secure: "false",
  });
  const [savingFTP, setSavingFTP] = useState(false);
  const [testingFTP, setTestingFTP] = useState(false);
  const [deployingFTP, setDeployingFTP] = useState(false);
  const [ftpTestResult, setFtpTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [deployLog, setDeployLog] = useState<DeployLogEntry[]>([]);

  // Load all settings on mount
  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data: Record<string, string>) => {
        if (data.siteName) setSiteName(data.siteName);
        setSiteDescription(data.siteDescription ?? "");
        setSiteUrl(data.site_url ?? "");
        setOrgName(data.org_name ?? "");
        setOrgLogoUrl(data.org_logo_url ?? "");
        setAiKeys({
          ai_openai_key: data.ai_openai_key ?? "",
          ai_openrouter_key: data.ai_openrouter_key ?? "",
          ai_nim_key: data.ai_nim_key ?? "",
          ai_gemini_key: data.ai_gemini_key ?? "",
        });
        setFtp({
          ftp_host: data.ftp_host ?? "",
          ftp_port: data.ftp_port ?? "21",
          ftp_user: data.ftp_user ?? "",
          ftp_password: data.ftp_password ?? "",
          ftp_remote_path: data.ftp_remote_path ?? "/public_html",
          ftp_secure: data.ftp_secure ?? "false",
        });
      })
      .catch(() => {});
  }, []);

  async function saveSettings() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ siteName, siteDescription, site_url: siteUrl, org_name: orgName, org_logo_url: orgLogoUrl }),
    });
    toast.success("Settings saved");
    setSaving(false);
  }

  async function saveAISettings() {
    setSavingAI(true);
    // Only send non-empty keys to avoid overwriting with empty string
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(aiKeys)) {
      if (v.trim()) payload[k] = v.trim();
    }
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    toast.success("AI keys saved");
    setSavingAI(false);
  }

  async function saveFTPSettings() {
    setSavingFTP(true);
    const payload: Record<string, string> = {};
    for (const [k, v] of Object.entries(ftp)) {
      if (v.trim() || k === "ftp_secure") payload[k] = v;
    }
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    toast.success("FTP credentials saved");
    setSavingFTP(false);
  }

  async function testFTP() {
    setTestingFTP(true);
    setFtpTestResult(null);
    try {
      const r = await fetch("/api/deploy/ftp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "test" }),
      });
      const data = await r.json();
      setFtpTestResult({ ok: data.ok, message: data.ok ? "Connection successful!" : data.error });
    } catch {
      setFtpTestResult({ ok: false, message: "Network error" });
    } finally {
      setTestingFTP(false);
    }
  }

  async function deployFTP() {
    setDeployingFTP(true);
    setDeployLog([]);
    try {
      const r = await fetch("/api/deploy/ftp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "deploy" }),
      });
      const data = await r.json();
      if (!r.ok) {
        toast.error(data.error ?? "Deploy failed");
        return;
      }
      const log: DeployLogEntry[] = [];
      for (const p of data.uploaded ?? []) {
        log.push({ slug: p, ok: true, message: "Uploaded" });
      }
      for (const e of data.uploadErrors ?? []) {
        log.push({ slug: e.path, ok: false, message: e.error });
      }
      for (const e of data.fetchErrors ?? []) {
        log.push({ slug: e.slug, ok: false, message: `Render error: ${e.error}` });
      }
      setDeployLog(log);
      toast.success(`Deployed ${data.deployed}/${data.total} pages`);
    } catch {
      toast.error("Deploy failed — check FTP credentials");
    } finally {
      setDeployingFTP(false);
    }
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "site", label: "Site Settings" },
    { id: "header", label: "Header Editor" },
    { id: "footer", label: "Footer Editor" },
    { id: "ai", label: "AI Integration" },
    { id: "ftp", label: "FTP Deploy" },
    { id: "shop", label: "Shop" },
  ];

  return (
    <div className="p-8 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Settings</h1>

      <div className="flex gap-1 mb-6 border-b border-gray-200">
        {TABS.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors -mb-px ${
              tab === id
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Site Settings */}
      {tab === "site" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-3">General</h3>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Site Name</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={siteName} onChange={(e) => setSiteName(e.target.value)} placeholder="My Business" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Site Description</label>
                <textarea rows={2} className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none"
                  value={siteDescription} onChange={(e) => setSiteDescription(e.target.value)}
                  placeholder="Brief description of your site (used in meta and JSON-LD)" />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-800 mb-1">SEO & Schema</h3>
            <p className="text-xs text-gray-400 mb-3">Used for canonical URLs, sitemap.xml, and Organization structured data.</p>
            <div className="flex flex-col gap-3">
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Site URL</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 font-mono"
                  value={siteUrl} onChange={(e) => setSiteUrl(e.target.value)} placeholder="https://example.com" />
                <p className="text-xs text-gray-400 mt-1">No trailing slash. Used in sitemap, canonical, and JSON-LD.</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Organization Name</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Acme Pty Ltd" />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700 block mb-1">Organization Logo URL</label>
                <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={orgLogoUrl} onChange={(e) => setOrgLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" />
              </div>
            </div>
          </div>

          <button
            onClick={saveSettings}
            disabled={saving}
            className="flex items-center gap-2 self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={14} /> Save Settings
          </button>
        </div>
      )}

      {/* Header / Footer editors */}
      {(tab === "header" || tab === "footer") && (
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <p className="text-sm text-gray-600 mb-4">
            Build your site {tab} using the visual editor.
          </p>
          <Link
            href={`/builder/global-${tab}`}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Edit {tab.charAt(0).toUpperCase() + tab.slice(1)} in Builder →
          </Link>
        </div>
      )}

      {/* AI Integration */}
      {tab === "ai" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">AI Page Generator</h2>
            <p className="text-sm text-gray-500">
              Add API keys for the providers you want to use. Keys are encrypted and stored in your
              tenant database — never shared or sent to third parties. You only need one provider to get started.
            </p>
          </div>

          <MaskedInput
            label="OpenAI API Key"
            value={aiKeys.ai_openai_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_openai_key: v }))}
            placeholder="sk-..."
            helpText={
              <>
                Get a key at{" "}
                <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  platform.openai.com <ExternalLink size={10} />
                </a>
                . Models: GPT-4o, GPT-4o Mini.
              </>
            }
          />

          <MaskedInput
            label="OpenRouter API Key"
            value={aiKeys.ai_openrouter_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_openrouter_key: v }))}
            placeholder="sk-or-..."
            helpText={
              <>
                Get a key at{" "}
                <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  openrouter.ai <ExternalLink size={10} />
                </a>
                . Includes free-tier models (Gemini Flash, Llama 3.3, Mistral).
              </>
            }
          />

          <MaskedInput
            label="NVIDIA NIM API Key"
            value={aiKeys.ai_nim_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_nim_key: v }))}
            placeholder="nvapi-..."
            helpText={
              <>
                Get a key at{" "}
                <a href="https://build.nvidia.com" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  build.nvidia.com <ExternalLink size={10} />
                </a>
                . Free trial credits included. Models: Llama 3.3, Nemotron.
              </>
            }
          />

          <MaskedInput
            label="Google Gemini API Key"
            value={aiKeys.ai_gemini_key}
            onChange={(v) => setAiKeys((k) => ({ ...k, ai_gemini_key: v }))}
            placeholder="AIza..."
            helpText={
              <>
                Get a free key at{" "}
                <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="underline inline-flex items-center gap-0.5">
                  aistudio.google.com <ExternalLink size={10} />
                </a>
                . Gemini 2.0 Flash is fast and free-tier eligible.
              </>
            }
          />

          <button
            onClick={saveAISettings}
            disabled={savingAI}
            className="flex items-center gap-2 self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={14} />
            {savingAI ? "Saving…" : "Save AI Keys"}
          </button>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <strong>How to use:</strong> In the page builder, click the{" "}
            <strong>✦ AI</strong> tab in the left panel, describe your page, choose a provider and
            model, then click <strong>Generate Full Page</strong> or <strong>Add Section</strong>.
          </div>
        </div>
      )}

      {/* FTP Deploy */}
      {tab === "ftp" && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">FTP Deploy</h2>
            <p className="text-sm text-gray-500">
              Export all published pages as static HTML and push them to the client&apos;s cPanel FTP
              hosting. CSS and JS are served from this CMS server; only the HTML files are uploaded.
            </p>
          </div>

          {/* Credentials */}
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700 block mb-1">FTP Host</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={ftp.ftp_host}
                onChange={(e) => setFtp((f) => ({ ...f, ftp_host: e.target.value }))}
                placeholder="ftp.clientdomain.com"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Port</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={ftp.ftp_port}
                onChange={(e) => setFtp((f) => ({ ...f, ftp_port: e.target.value }))}
                placeholder="21"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Username</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={ftp.ftp_user}
                onChange={(e) => setFtp((f) => ({ ...f, ftp_user: e.target.value }))}
                placeholder="ftpuser@clientdomain.com"
                autoComplete="off"
              />
            </div>
            <div className="col-span-2">
              <MaskedInput
                label="FTP Password"
                value={ftp.ftp_password}
                onChange={(v) => setFtp((f) => ({ ...f, ftp_password: v }))}
                placeholder="FTP account password"
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs font-medium text-gray-700 block mb-1">Remote Path</label>
              <input
                className="w-full border rounded-lg px-3 py-2 text-sm"
                value={ftp.ftp_remote_path}
                onChange={(e) => setFtp((f) => ({ ...f, ftp_remote_path: e.target.value }))}
                placeholder="/public_html"
              />
              <p className="text-xs text-gray-400 mt-1">
                Root directory on the FTP server where HTML files will be uploaded.
                Usually <code>/public_html</code> on cPanel.
              </p>
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ftp.ftp_secure === "true"}
                  onChange={(e) => setFtp((f) => ({ ...f, ftp_secure: e.target.checked ? "true" : "false" }))}
                />
                <span className="text-sm text-gray-700">Use FTPS (secure FTP)</span>
              </label>
            </div>
          </div>

          <button
            onClick={saveFTPSettings}
            disabled={savingFTP}
            className="flex items-center gap-2 self-start px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
          >
            <Save size={14} />
            {savingFTP ? "Saving…" : "Save Credentials"}
          </button>

          <hr className="border-gray-200" />

          {/* Test + Deploy */}
          <div className="flex gap-3">
            <button
              onClick={testFTP}
              disabled={testingFTP || !ftp.ftp_host}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 disabled:opacity-40"
            >
              {testingFTP ? <Loader2 size={14} className="animate-spin" /> : null}
              Test Connection
            </button>
            <button
              onClick={deployFTP}
              disabled={deployingFTP || !ftp.ftp_host}
              className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-40"
            >
              {deployingFTP ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              {deployingFTP ? "Deploying…" : "Deploy Published Pages"}
            </button>
          </div>

          {/* Test result */}
          {ftpTestResult && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${ftpTestResult.ok ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
              {ftpTestResult.ok
                ? <CheckCircle size={16} />
                : <XCircle size={16} />}
              {ftpTestResult.message}
            </div>
          )}

          {/* Deploy log */}
          {deployLog.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-3 py-2 text-xs font-semibold text-gray-700">Deploy Log</div>
              <div className="divide-y divide-gray-100 max-h-56 overflow-y-auto">
                {deployLog.map((entry, i) => (
                  <div key={i} className="flex items-start gap-2 px-3 py-2 text-xs">
                    {entry.ok
                      ? <CheckCircle size={13} className="text-green-500 mt-0.5 shrink-0" />
                      : <XCircle size={13} className="text-red-500 mt-0.5 shrink-0" />}
                    <div>
                      <span className="font-mono text-gray-700">{entry.slug}</span>
                      {!entry.ok && <span className="text-red-600 ml-2">{entry.message}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-xs text-amber-800 flex flex-col gap-1">
            <strong>Note:</strong>
            <span>• HTML files are uploaded to <code>{ftp.ftp_remote_path || "/public_html"}</code>: home → <code>index.html</code>, /about → <code>about/index.html</code></span>
            <span>• CSS, JS and images are loaded from this CMS server — the client&apos;s FTP only serves the HTML</span>
            <span>• Contact forms in static pages will not submit (no backend) — use a service like Formspree for static forms</span>
          </div>
        </div>
      )}

      {/* Shop Settings */}
      {tab === "shop" && <ShopSettings />}
    </div>
  );
}

function ShopSettings() {
  const [stripePublishable, setStripePublishable] = useState("");
  const [stripeSecret, setStripeSecret] = useState("");
  const [stripeWebhook, setStripeWebhook] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/settings?keys=stripe_publishable_key,stripe_secret_key,stripe_webhook_secret")
      .then((r) => r.ok ? r.json() : {})
      .then((d: Record<string, string>) => {
        setStripePublishable(d.stripe_publishable_key ?? "");
        setStripeSecret(d.stripe_secret_key ?? "");
        setStripeWebhook(d.stripe_webhook_secret ?? "");
      });
  }, []);

  async function save() {
    setSaving(true);
    await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        stripe_publishable_key: stripePublishable,
        stripe_secret_key: stripeSecret,
        stripe_webhook_secret: stripeWebhook,
      }),
    });
    toast.success("Shop settings saved");
    setSaving(false);
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 flex flex-col gap-5">
      <div>
        <h3 className="text-sm font-semibold text-gray-800 mb-1">Stripe Payments</h3>
        <p className="text-xs text-gray-500 mb-4">Add your Stripe keys to enable credit card payments at checkout. Leave blank to use manual order processing.</p>
        <div className="flex flex-col gap-3">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Publishable Key</label>
            <input className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="pk_live_..." value={stripePublishable} onChange={(e) => setStripePublishable(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Secret Key</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="sk_live_..." value={stripeSecret} onChange={(e) => setStripeSecret(e.target.value)} autoComplete="off" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Webhook Secret</label>
            <input type="password" className="w-full border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              placeholder="whsec_..." value={stripeWebhook} onChange={(e) => setStripeWebhook(e.target.value)} autoComplete="off" />
            <p className="text-xs text-gray-400 mt-1">
              Register your webhook URL in Stripe: <code className="bg-gray-100 px-1 rounded">/api/checkout/webhook?tenant=YOUR_SLUG</code>
            </p>
          </div>
        </div>
      </div>
      <div>
        <button onClick={save} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          Save Shop Settings
        </button>
      </div>
    </div>
  );
}
