"use client";

import Link from "next/link";
import { useRecommendations } from "@/hooks/useRecommendations";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { SELECTS_CAP } from "@/lib/constants";
import { StarIcon } from "@/components/map/StarIcon";

export default function SelectsAuditPage() {
  const { recommendations, loading, reload } = useRecommendations();
  const { categoryStyles } = useCategoryStyles();

  const selects = recommendations
    .filter((r) => r.isSelect)
    .sort((a, b) => a.displayOrder - b.displayOrder);

  async function removeFromSelects(id: string) {
    await fetch(`/api/recommendations/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isSelect: false, selectNote: null }),
    });
    reload();
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold text-[#1B1408]">Treadwell Selects</h1>
        <span
          className={`text-sm font-medium ${selects.length >= SELECTS_CAP ? "text-amber-700" : "text-neutral-500"}`}
        >
          {selects.length} of {SELECTS_CAP} used
        </span>
      </div>
      <p className="mt-1 text-sm text-neutral-500">
        Selects only mean something if they&apos;re scarce -- audit and prune here.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Loading...</p>
      ) : selects.length === 0 ? (
        <p className="mt-6 text-sm text-neutral-500">No Selects yet.</p>
      ) : (
        <div className="mt-6 flex flex-col gap-2">
          {selects.map((r) => {
            const style = categoryStyles[r.category];
            return (
              <div
                key={r.id}
                className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm ring-1 ring-black/5"
              >
                <StarIcon color={style.color} size={20} />
                <div className="flex-1">
                  <p className="font-medium text-[#1B1408]">{r.name}</p>
                  <p className="text-xs text-neutral-500">
                    {style.label}
                    {r.selectNote ? ` -- "${r.selectNote}"` : ""}
                  </p>
                </div>
                <Link href={`/admin/recommendations/${r.id}`} className="text-sm font-medium text-[#A98235] hover:underline">
                  Edit
                </Link>
                <button
                  type="button"
                  onClick={() => removeFromSelects(r.id)}
                  className="rounded-full border border-neutral-300 px-3 py-1.5 text-xs font-medium hover:bg-neutral-50"
                >
                  Remove from Selects
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
