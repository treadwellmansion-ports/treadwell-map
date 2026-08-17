"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface CartSubmission {
  id: string;
  guest_email: string;
  guest_name: string | null;
  delivery_method: string;
  status: "sent" | "failed";
  failure_reason: string | null;
  recommendation_snapshot: { id: string; name: string; address: string }[];
  created_at: string;
}

export default function CartEmailsPage() {
  const [submissions, setSubmissions] = useState<CartSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("cart_submissions")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setSubmissions((data as CartSubmission[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const failedCount = submissions.filter((s) => s.status === "failed").length;

  function copyAllEmails() {
    const unique = [...new Set(submissions.map((s) => s.guest_email))];
    navigator.clipboard.writeText(unique.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-[#1B1408]">Guest Emails</h1>
        <span className="text-sm text-neutral-500">
          {submissions.length} submission{submissions.length === 1 ? "" : "s"}
          {failedCount > 0 && `, ${failedCount} failed to send`}
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Every email a guest entered when sending themselves a list from the map, including ones
        that failed to send (e.g. before a sending domain was verified) so no contact is lost.
      </p>

      <button
        type="button"
        onClick={copyAllEmails}
        disabled={submissions.length === 0}
        className="mt-4 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50 disabled:opacity-40"
      >
        {copied ? "Copied!" : "Copy all emails"}
      </button>

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Loading...</p>
      ) : submissions.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No guest cart sends yet.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {submissions.map((s) => (
            <div key={s.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1B1408]">
                    {s.guest_name ? `${s.guest_name} -- ` : ""}
                    {s.guest_email}
                  </p>
                  <p className="mt-1 text-xs text-neutral-400">
                    {new Date(s.created_at).toLocaleString()} -- via {s.delivery_method}
                  </p>
                </div>
                {s.status === "sent" ? (
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                    Sent
                  </span>
                ) : (
                  <span
                    className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-800"
                    title={s.failure_reason ?? undefined}
                  >
                    Failed
                  </span>
                )}
              </div>
              <ul className="mt-2 space-y-0.5 text-sm text-neutral-600">
                {s.recommendation_snapshot.map((r) => (
                  <li key={r.id}>
                    {r.name} -- <span className="text-neutral-400">{r.address}</span>
                  </li>
                ))}
              </ul>
              {s.status === "failed" && s.failure_reason && (
                <p className="mt-2 text-xs text-red-700">{s.failure_reason}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
