"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

interface TopRow {
  label: string;
  count: number;
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [topViewed, setTopViewed] = useState<TopRow[]>([]);
  const [viewModeSplit, setViewModeSplit] = useState<TopRow[]>([]);
  const [topSearches, setTopSearches] = useState<TopRow[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const [{ data: viewEvents }, { data: toggleEvents }, { data: searchEvents }, { data: recommendations }] =
        await Promise.all([
          supabase
            .from("analytics_events")
            .select("recommendation_id")
            .eq("event_type", "view_recommendation")
            .limit(5000),
          supabase.from("analytics_events").select("view_mode").eq("event_type", "view_toggle").limit(5000),
          supabase.from("analytics_events").select("query").eq("event_type", "search").limit(5000),
          supabase.from("recommendations").select("id, name"),
        ]);

      const nameById = new Map((recommendations ?? []).map((r) => [r.id as string, r.name as string]));

      const viewCounts = new Map<string, number>();
      for (const e of viewEvents ?? []) {
        if (!e.recommendation_id) continue;
        viewCounts.set(e.recommendation_id, (viewCounts.get(e.recommendation_id) ?? 0) + 1);
      }
      const topViewedRows = [...viewCounts.entries()]
        .map(([id, count]) => ({ label: nameById.get(id) ?? "(deleted recommendation)", count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      const modeCounts = new Map<string, number>();
      for (const e of toggleEvents ?? []) {
        if (!e.view_mode) continue;
        modeCounts.set(e.view_mode, (modeCounts.get(e.view_mode) ?? 0) + 1);
      }
      const viewModeRows = [...modeCounts.entries()]
        .map(([label, count]) => ({ label: label === "map" ? "Map view" : "List view", count }))
        .sort((a, b) => b.count - a.count);

      const searchCounts = new Map<string, number>();
      for (const e of searchEvents ?? []) {
        const q = e.query?.trim().toLowerCase();
        if (!q) continue;
        searchCounts.set(q, (searchCounts.get(q) ?? 0) + 1);
      }
      const topSearchRows = [...searchCounts.entries()]
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10);

      setTopViewed(topViewedRows);
      setViewModeSplit(viewModeRows);
      setTopSearches(topSearchRows);
      setTotalEvents((viewEvents?.length ?? 0) + (toggleEvents?.length ?? 0) + (searchEvents?.length ?? 0));
      setLoading(false);
    }
    load();
  }, []);

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;

  if (totalEvents === 0) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-xl font-semibold text-[#1B1408]">Analytics</h1>
        <p className="mt-4 text-sm text-neutral-500">
          No guest activity logged yet. Data collects automatically as people use the map, list view, and
          search on the kiosk, mobile, and embed surfaces.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-[#1B1408]">Analytics</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Lightweight, self-hosted usage data -- no third-party tracker involved.
      </p>

      <Section title="Most-viewed recommendations">
        {topViewed.length === 0 ? (
          <Empty />
        ) : (
          <RankedList rows={topViewed} />
        )}
      </Section>

      <Section title="Map vs. list view">
        {viewModeSplit.length === 0 ? <Empty /> : <RankedList rows={viewModeSplit} />}
      </Section>

      <Section title="Top searches">
        {topSearches.length === 0 ? <Empty /> : <RankedList rows={topSearches} />}
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <h2 className="text-sm font-semibold text-neutral-700">{title}</h2>
      <div className="mt-2 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">{children}</div>
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-neutral-400">Not enough data yet.</p>;
}

function RankedList({ rows }: { rows: TopRow[] }) {
  const max = Math.max(...rows.map((r) => r.count), 1);
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-3 text-sm">
          <span className="w-40 shrink-0 truncate text-[#1B1408]">{r.label}</span>
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-[#A98235]"
              style={{ width: `${(r.count / max) * 100}%` }}
            />
          </div>
          <span className="w-8 shrink-0 text-right text-neutral-500">{r.count}</span>
        </div>
      ))}
    </div>
  );
}
