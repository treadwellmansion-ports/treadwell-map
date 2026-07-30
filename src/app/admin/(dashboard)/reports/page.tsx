"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface IssueReport {
  id: string;
  recommendation_id: string | null;
  recommendation_name: string;
  message: string | null;
  status: "open" | "resolved";
  created_at: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showResolved, setShowResolved] = useState(false);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("issue_reports")
      .select("*")
      .order("created_at", { ascending: false });
    setReports((data as IssueReport[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("issue_reports")
        .select("*")
        .order("created_at", { ascending: false });
      if (cancelled) return;
      setReports((data as IssueReport[]) ?? []);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function resolve(id: string) {
    const supabase = createClient();
    await supabase.from("issue_reports").update({ status: "resolved" }).eq("id", id);
    load();
  }

  const visible = reports.filter((r) => (showResolved ? true : r.status === "open"));
  const openCount = reports.filter((r) => r.status === "open").length;

  return (
    <div className="max-w-2xl">
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-[#1B1408]">Reported Issues</h1>
        <span className="text-sm text-neutral-500">{openCount} open</span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Flagged by guests or staff from the map&apos;s detail panel.
      </p>

      <label className="mt-4 flex items-center gap-2 text-sm text-neutral-600">
        <input type="checkbox" checked={showResolved} onChange={(e) => setShowResolved(e.target.checked)} />
        Show resolved
      </label>

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Loading...</p>
      ) : visible.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No open reports.</p>
      ) : (
        <div className="mt-4 flex flex-col gap-2">
          {visible.map((r) => (
            <div key={r.id} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-medium text-[#1B1408]">{r.recommendation_name}</p>
                  {r.message && <p className="mt-1 text-sm text-neutral-600">{r.message}</p>}
                  <p className="mt-1 text-xs text-neutral-400">{new Date(r.created_at).toLocaleString()}</p>
                </div>
                {r.status === "open" ? (
                  <button
                    type="button"
                    onClick={() => resolve(r.id)}
                    className="shrink-0 rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                  >
                    Mark resolved
                  </button>
                ) : (
                  <span className="shrink-0 rounded-full bg-green-100 px-2.5 py-1 text-xs font-medium text-green-800">
                    Resolved
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
