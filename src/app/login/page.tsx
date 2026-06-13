"use client";

import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";

interface CMSBranding {
  cms_name: string;
  cms_tagline: string;
  cms_logo_url: string;
  cms_primary_color: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [tenantSlug, setTenantSlug] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [branding, setBranding] = useState<CMSBranding>({
    cms_name: "NextjsCMS",
    cms_tagline: "Sign in to your dashboard",
    cms_logo_url: "",
    cms_primary_color: "#6366f1",
  });

  useEffect(() => {
    fetch("/api/setup")
      .then((r) => r.json())
      .then((d: CMSBranding) => setBranding(d))
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const result = await signIn("credentials", {
      email,
      password,
      tenantSlug: tenantSlug || "__superadmin__",
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setError("Invalid credentials. Check email, password and site ID.");
      return;
    }
    if (!tenantSlug) {
      router.push("/superadmin");
    } else {
      router.push("/admin");
    }
    router.refresh();
  }

  const primaryColor = branding.cms_primary_color || "#6366f1";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="text-center mb-6">
          {branding.cms_logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={branding.cms_logo_url}
              alt={branding.cms_name}
              className="h-12 mx-auto mb-3 object-contain"
            />
          ) : (
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
              style={{ backgroundColor: primaryColor }}
            >
              <Sparkles size={18} className="text-white" />
            </div>
          )}
          <h1 className="text-2xl font-bold text-gray-900">{branding.cms_name}</h1>
          <p className="text-sm text-gray-500 mt-1">{branding.cms_tagline}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Site ID</label>
            <input
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              placeholder="Leave empty for Super Admin"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input
              type="password"
              required
              className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 rounded p-2">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-white rounded-lg font-medium disabled:opacity-50 transition-colors"
            style={{ backgroundColor: primaryColor }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>

        <p className="text-center text-xs text-gray-400 mt-6">
          First time?{" "}
          <a href="/setup" className="text-indigo-600 hover:underline">Run setup wizard</a>
        </p>
      </div>
    </div>
  );
}
