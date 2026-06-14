"use client";

import { useState, useEffect } from "react";
import { Inbox, Loader2, ChevronDown, ChevronUp } from "lucide-react";

interface Submission {
  id: string;
  formId: string;
  data: string;
  submittedAt: number | string;
  ipAddress: string | null;
}

function parseData(raw: string): Record<string, unknown> {
  try { return JSON.parse(raw); } catch { return { raw }; }
}

function formatDate(val: number | string) {
  const d = typeof val === "number" ? new Date(val * 1000) : new Date(val);
  return d.toLocaleString();
}

export default function FormsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/forms/submissions")
      .then((r) => r.json())
      .then((data) => { setSubmissions(data); setLoading(false); });
  }, []);

  // Group by formId
  const groups = submissions.reduce<Record<string, Submission[]>>((acc, s) => {
    (acc[s.formId] ||= []).push(s);
    return acc;
  }, {});

  return (
    <div className="p-8 max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <Inbox size={22} className="text-blue-600" />
        <h1 className="text-2xl font-bold text-gray-900">Form Submissions</h1>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 className="animate-spin text-gray-400" />
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Inbox size={40} className="mx-auto mb-3 opacity-30" />
          <p>No submissions yet</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {Object.entries(groups).map(([formId, rows]) => (
            <div key={formId} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <button
                className="w-full flex items-center justify-between px-5 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                onClick={() => setExpanded(expanded === formId ? null : formId)}
              >
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-gray-800 font-mono">{formId}</span>
                  <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                    {rows.length} {rows.length === 1 ? "submission" : "submissions"}
                  </span>
                </div>
                {expanded === formId ? <ChevronUp size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
              </button>

              {expanded === formId && (
                <div className="divide-y divide-gray-100">
                  {rows.map((sub) => {
                    const data = parseData(sub.data);
                    return (
                      <div key={sub.id} className="px-5 py-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-gray-400">{formatDate(sub.submittedAt)}</span>
                          {sub.ipAddress && (
                            <span className="text-xs text-gray-300 font-mono">{sub.ipAddress}</span>
                          )}
                        </div>
                        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                          {Object.entries(data).map(([key, val]) => (
                            <div key={key}>
                              <dt className="text-xs font-medium text-gray-500 capitalize">{key}</dt>
                              <dd className="text-sm text-gray-800 break-words">{String(val)}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
