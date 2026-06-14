"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle, XCircle, Circle, Loader2, Palette, Sparkles,
  ArrowRight, AlertTriangle, Server, RefreshCw,
} from "lucide-react";

type Step = "welcome" | "syscheck" | "branding" | "done";

const COLOR_SWATCHES = [
  { label: "Indigo", value: "#6366f1" },
  { label: "Blue", value: "#3b82f6" },
  { label: "Emerald", value: "#10b981" },
  { label: "Orange", value: "#f97316" },
  { label: "Rose", value: "#f43f5e" },
  { label: "Slate", value: "#64748b" },
];

const STEPS: { id: Step; label: string }[] = [
  { id: "welcome", label: "Welcome" },
  { id: "syscheck", label: "System" },
  { id: "branding", label: "Branding" },
  { id: "done", label: "Done" },
];

interface SysCheck {
  nodeVersion: string; nodeVersionOk: boolean;
  sqliteOk: boolean;
  dataDirPath: string; dataDirWritable: boolean;
  uploadsDirWritable: boolean;
  authSecretSet: boolean; authUrlSet: boolean; superadminEmailSet: boolean;
  platform: string; hostname: string; allOk: boolean;
}

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex((s) => s.id === current);
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.id} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            {i < idx ? (
              <CheckCircle size={16} className="text-indigo-500" />
            ) : i === idx ? (
              <div className="w-4 h-4 rounded-full bg-indigo-600" />
            ) : (
              <Circle size={16} className="text-gray-300" />
            )}
            <span className={`text-xs font-medium ${i <= idx ? "text-indigo-700" : "text-gray-400"}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && <div className="w-6 h-px bg-gray-200" />}
        </div>
      ))}
    </div>
  );
}

function Check({ ok, label, detail, fix }: { ok: boolean | null; label: string; detail?: string; fix?: string }) {
  return (
    <div className="flex items-start gap-2.5">
      {ok === null ? <Loader2 size={15} className="text-gray-300 animate-spin mt-0.5 shrink-0" />
        : ok ? <CheckCircle size={15} className="text-green-500 mt-0.5 shrink-0" />
          : <XCircle size={15} className="text-red-500 mt-0.5 shrink-0" />}
      <div className="min-w-0">
        <p className={`text-sm font-medium ${ok === false ? "text-red-700" : "text-gray-800"}`}>{label}</p>
        {detail && <p className="text-xs text-gray-400 break-all">{detail}</p>}
        {!ok && fix && (
          <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1 mt-1">{fix}</p>
        )}
      </div>
    </div>
  );
}

export default function SetupPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("welcome");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alreadyDone, setAlreadyDone] = useState(false);
  const [sysCheck, setSysCheck] = useState<SysCheck | null>(null);
  const [sysLoading, setSysLoading] = useState(false);

  // Branding
  const [cmsName, setCmsName] = useState("My CMS");
  const [cmsTagline, setCmsTagline] = useState("Sign in to your dashboard");
  const [cmsLogoUrl, setCmsLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#6366f1");

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((data) => {
        if (data.setup_complete === "true") setAlreadyDone(true);
        if (data.cms_name && data.cms_name !== "NextjsCMS") setCmsName(data.cms_name);
        if (data.cms_tagline) setCmsTagline(data.cms_tagline);
        if (data.cms_logo_url) setCmsLogoUrl(data.cms_logo_url);
        if (data.cms_primary_color) setPrimaryColor(data.cms_primary_color);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function runSysCheck() {
    setSysLoading(true);
    const r = await fetch("/api/setup/syscheck");
    const data: SysCheck = await r.json();
    setSysCheck(data);
    setSysLoading(false);
  }

  function goToSysCheck() {
    setStep("syscheck");
    runSysCheck();
  }

  async function completeBranding() {
    setSaving(true);
    try {
      await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cms_name: cmsName.trim() || "My CMS",
          cms_tagline: cmsTagline.trim(),
          cms_logo_url: cmsLogoUrl.trim(),
          cms_primary_color: primaryColor,
          setup_complete: "true",
        }),
      });
      setStep("done");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 size={24} className="animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-3">
            <Sparkles size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-900">CMS Setup Wizard</h1>
          <p className="text-sm text-gray-500 mt-1">Get your CMS ready in 3 steps</p>
        </div>

        {alreadyDone && step !== "done" && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            Setup was already completed. You can re-run checks or update branding below.
          </div>
        )}

        <StepIndicator current={step} />

        {/* ── WELCOME ──────────────────────────────────────────────── */}
        {step === "welcome" && (
          <div className="flex flex-col gap-5">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 mb-1">Welcome</h2>
              <p className="text-sm text-gray-600">
                This wizard configures your CMS and verifies your server meets all requirements.
                Works on local dev, VPS, and cPanel shared hosting.
              </p>
            </div>

            {/* cPanel quick info */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Server size={14} className="text-blue-600" />
                <p className="text-xs font-semibold text-blue-800">cPanel Deployment Checklist</p>
              </div>
              <ul className="text-xs text-blue-700 flex flex-col gap-1.5">
                <li className="flex items-start gap-1.5"><CheckCircle size={11} className="mt-0.5 shrink-0" /><span><strong>Node.js Selector</strong> enabled in cPanel (ask host if unsure — SiteGround, HostGator, Namecheap support it)</span></li>
                <li className="flex items-start gap-1.5"><CheckCircle size={11} className="mt-0.5 shrink-0" /><span><strong>Node.js 18+</strong> selected in Node.js Selector</span></li>
                <li className="flex items-start gap-1.5"><CheckCircle size={11} className="mt-0.5 shrink-0" /><span>App uploaded to a folder <strong>outside public_html</strong> (e.g. <code className="bg-blue-100 px-0.5 rounded">~/nextjscms/</code>)</span></li>
                <li className="flex items-start gap-1.5"><CheckCircle size={11} className="mt-0.5 shrink-0" /><span><strong>Startup file:</strong> <code className="bg-blue-100 px-0.5 rounded">server.js</code></span></li>
                <li className="flex items-start gap-1.5"><CheckCircle size={11} className="mt-0.5 shrink-0" /><span>Env vars set in cPanel Node.js Selector → <em>Environment Variables</em> section</span></li>
                <li className="flex items-start gap-1.5"><AlertTriangle size={11} className="mt-0.5 shrink-0 text-amber-500" /><span>Set <code className="bg-blue-100 px-0.5 rounded">DATA_DIR</code> to a path <strong>outside public_html</strong>, e.g. <code className="bg-blue-100 px-0.5 rounded">/home/username/cms-data</code></span></li>
              </ul>
            </div>

            <button
              onClick={goToSysCheck}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Run System Check <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── SYSTEM CHECK ─────────────────────────────────────────── */}
        {step === "syscheck" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">System Check</h2>
              <button onClick={runSysCheck} disabled={sysLoading}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:underline disabled:opacity-40">
                <RefreshCw size={12} className={sysLoading ? "animate-spin" : ""} /> Re-run
              </button>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex flex-col gap-3">
              {sysLoading || !sysCheck ? (
                <div className="flex items-center justify-center py-6 gap-2 text-gray-400 text-sm">
                  <Loader2 size={16} className="animate-spin" /> Checking...
                </div>
              ) : (
                <>
                  <Check ok={sysCheck.nodeVersionOk} label={`Node.js ${sysCheck.nodeVersion}`}
                    detail={sysCheck.nodeVersionOk ? "Version OK (18+ required)" : "Node.js 18 or higher required"}
                    fix="In cPanel → Node.js Selector → change version to 18.x or 20.x" />
                  <Check ok={sysCheck.sqliteOk} label="SQLite (better-sqlite3)"
                    detail={sysCheck.sqliteOk ? "Native module loaded" : "Module failed to load"}
                    fix="Run: npm rebuild better-sqlite3 — or reinstall dependencies after selecting Node.js version in cPanel" />
                  <Check ok={sysCheck.dataDirWritable} label="Data directory writable"
                    detail={sysCheck.dataDirPath}
                    fix={`Set DATA_DIR env var to a writable path outside public_html, e.g. /home/${sysCheck?.hostname?.split(".")[0] ?? "username"}/cms-data`} />
                  <Check ok={sysCheck.uploadsDirWritable} label="Uploads directory writable"
                    detail="public/uploads/"
                    fix="Run: chmod 755 public/uploads — or create the folder and set permissions in cPanel File Manager" />
                  <Check ok={sysCheck.authSecretSet} label="NEXTAUTH_SECRET set"
                    detail={sysCheck.authSecretSet ? "Secret looks good" : "Using default placeholder — must change"}
                    fix={'Set NEXTAUTH_SECRET in cPanel Node.js Selector → Environment Variables. Generate with: openssl rand -base64 32'} />
                  <Check ok={sysCheck.authUrlSet} label="NEXTAUTH_URL set"
                    detail={sysCheck.authUrlSet ? "URL configured" : "Not set — login will fail"}
                    fix="Set NEXTAUTH_URL=https://yourdomain.com in cPanel Environment Variables" />
                  <Check ok={sysCheck.superadminEmailSet} label="SUPERADMIN_EMAIL set"
                    detail={sysCheck.superadminEmailSet ? "Super-admin email configured" : "Not set"}
                    fix="Set SUPERADMIN_EMAIL and SUPERADMIN_PASSWORD in cPanel Environment Variables" />
                </>
              )}
            </div>

            {sysCheck && !sysCheck.allOk && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Fix the red items above, then click Re-run. You can still proceed but the app may not work correctly.</span>
              </div>
            )}

            {sysCheck?.allOk && (
              <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg text-xs text-green-800">
                <CheckCircle size={14} />
                All checks passed — ready to configure branding.
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setStep("welcome")} className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">
                Back
              </button>
              <button onClick={() => setStep("branding")} disabled={sysLoading}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
                Next <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── BRANDING ─────────────────────────────────────────────── */}
        {step === "branding" && (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 mb-1">
              <Palette size={16} className="text-indigo-600" />
              <h2 className="text-lg font-semibold text-gray-900">CMS Branding</h2>
            </div>
            <p className="text-sm text-gray-500 -mt-2">
              Clients see this on the login page and admin header.
            </p>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">CMS Name *</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={cmsName} onChange={(e) => setCmsName(e.target.value)} placeholder="Webright CMS" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Login Page Tagline</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={cmsTagline} onChange={(e) => setCmsTagline(e.target.value)} placeholder="Sign in to your website dashboard" />
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-1">Logo URL (optional)</label>
              <input className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                value={cmsLogoUrl} onChange={(e) => setCmsLogoUrl(e.target.value)} placeholder="https://youragency.com/logo.png" />
              {cmsLogoUrl && (
                <div className="mt-1.5 w-20 h-10 rounded border flex items-center justify-center overflow-hidden bg-gray-50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={cmsLogoUrl} alt="Logo preview" className="max-h-full max-w-full object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="text-xs font-medium text-gray-700 block mb-2">Primary Color</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {COLOR_SWATCHES.map((s) => (
                  <button key={s.value} onClick={() => setPrimaryColor(s.value)} title={s.label}
                    className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${primaryColor === s.value ? "ring-2 ring-offset-2 ring-gray-400 scale-110" : ""}`}
                    style={{ backgroundColor: s.value }} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-10 h-8 rounded border cursor-pointer" />
                <input className="flex-1 border rounded-lg px-3 py-1.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-400"
                  value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#6366f1" />
              </div>
            </div>

            {/* Live preview */}
            <div className="rounded-xl border border-gray-200 overflow-hidden">
              <div className="bg-gray-100 px-3 py-1.5 text-xs text-gray-500 font-medium">Login page preview</div>
              <div className="p-4 bg-gray-50 flex items-center justify-center">
                <div className="w-full max-w-[200px] bg-white rounded-xl border p-4 text-center shadow-sm">
                  {cmsLogoUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cmsLogoUrl} alt="logo" className="h-8 mx-auto mb-2 object-contain" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: primaryColor }}>
                      <Sparkles size={14} className="text-white" />
                    </div>
                  )}
                  <p className="text-xs font-bold text-gray-900">{cmsName || "My CMS"}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5 leading-tight">{cmsTagline || "Sign in to your dashboard"}</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button onClick={() => setStep("syscheck")} className="flex-1 py-2 border rounded-lg text-sm text-gray-600 hover:bg-gray-50">Back</button>
              <button onClick={completeBranding} disabled={saving || !cmsName.trim()}
                className="flex-1 flex items-center justify-center gap-2 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-medium rounded-lg transition-colors">
                {saving ? <Loader2 size={14} className="animate-spin" /> : null}
                Save & Finish
              </button>
            </div>
          </div>
        )}

        {/* ── DONE ─────────────────────────────────────────────────── */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-5 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={32} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">You&apos;re all set!</h2>
              <p className="text-sm text-gray-500 mt-1"><strong>{cmsName}</strong> is configured and ready.</p>
            </div>

            <div className="w-full bg-gray-50 rounded-xl p-4 text-left flex flex-col gap-2 text-sm">
              <p className="font-semibold text-gray-700 text-xs uppercase tracking-wide mb-1">Next steps</p>
              <p className="text-gray-600">1. Log in as super-admin at <code className="text-xs bg-gray-100 px-1 rounded">/superadmin</code></p>
              <p className="text-gray-600">2. Create your first client site</p>
              <p className="text-gray-600">3. Log in as the client and start building pages</p>
              <p className="text-gray-600">4. Enable Shop addon from Admin → Addons if needed</p>
            </div>

            <button onClick={() => router.push("/login")}
              className="w-full flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg">
              Go to Login <ArrowRight size={15} />
            </button>
            <button onClick={() => router.push("/superadmin")}
              className="w-full py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50">
              Go to Super Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
