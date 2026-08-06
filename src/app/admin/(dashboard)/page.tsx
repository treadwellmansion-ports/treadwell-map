"use client";

import Link from "next/link";
import { useState } from "react";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { StarIcon } from "@/components/map/StarIcon";

const CSV_COLUMNS = [
  "name",
  "category",
  "additionalCategories",
  "description",
  "address",
  "phone",
  "website",
  "hours",
  "published",
  "isSelect",
  "selectNote",
  "displayOrder",
  "lat",
  "lng",
  "walkingDistanceMeters",
  "walkingTimeMinutes",
] as const;

function csvEscape(value: unknown): string {
  const str = value === null || value === undefined ? "" : String(value);
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export default function AdminRecommendationsPage() {
  const { recommendations, loading, reload } = useRecommendations();
  const { categoryStyles } = useCategoryStyles();
  const [error, setError] = useState<string | null>(null);

  const sorted = [...recommendations].sort((a, b) => a.displayOrder - b.displayOrder);

  async function togglePublished(id: string, published: boolean) {
    setError(null);
    const res = await fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ published: !published }),
    });
    if (!res.ok) {
      setError("Couldn't update publish status. Try again.");
      return;
    }
    reload();
  }

  function exportCsv() {
    const lines = [
      CSV_COLUMNS.join(","),
      ...sorted.map((r) => CSV_COLUMNS.map((col) => csvEscape(r[col])).join(",")),
    ];
    const blob = new Blob([lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `treadwell-recommendations-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-[#1B1408]">Recommendations</h1>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={exportCsv}
            disabled={sorted.length === 0}
            className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50 disabled:opacity-40"
          >
            Export CSV
          </button>
          <Link
            href="/admin/recommendations/new"
            className="rounded-full bg-[#1B1408] px-4 py-2 text-sm font-semibold text-[#F4E9D6] hover:bg-[#2a2012]"
          >
            + New Recommendation
          </Link>
        </div>
      </div>

      {error && <p className="mt-3 text-sm font-medium text-red-700">{error}</p>}

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Loading...</p>
      ) : sorted.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No recommendations yet.</p>
      ) : (
        <div className="mt-6 overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-black/5">
          <table className="w-full text-sm">
            <thead className="border-b border-black/10 text-left text-xs font-medium text-neutral-500">
              <tr>
                <th className="px-4 py-3">Star</th>
                <th className="px-4 py-3">Name</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Select</th>
                <th className="px-4 py-3">Published</th>
                <th className="px-4 py-3">Order</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => {
                const style = categoryStyles[r.category];
                return (
                  <tr key={r.id} className="border-b border-black/5 last:border-0">
                    <td className="px-4 py-3">
                      <StarIcon color={style.color} size={18} />
                    </td>
                    <td className="px-4 py-3 font-medium text-[#1B1408]">{r.name}</td>
                    <td className="px-4 py-3 text-neutral-600">
                      {style.label}
                      {r.additionalCategories.length > 0 && (
                        <span
                          className="ml-1.5 text-xs text-neutral-400"
                          title={r.additionalCategories.map((c) => categoryStyles[c].label).join(", ")}
                        >
                          +{r.additionalCategories.length} more
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {r.isSelect && (
                        <span className="rounded-full bg-[#A98235] px-2 py-0.5 text-xs font-semibold text-white">
                          SELECT
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() => togglePublished(r.id, r.published)}
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          r.published ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-500"
                        }`}
                      >
                        {r.published ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-neutral-500">{r.displayOrder}</td>
                    <td className="px-4 py-3 text-right">
                      <Link href={`/admin/recommendations/${r.id}`} className="text-sm font-medium text-[#A98235] hover:underline">
                        Edit
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
