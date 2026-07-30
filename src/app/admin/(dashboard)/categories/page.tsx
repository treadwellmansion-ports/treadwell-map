"use client";

import { useState } from "react";
import { CATEGORIES, type Category, type CategoryStyleMap } from "@/lib/types";
import { useCategoryStyles } from "@/hooks/useCategoryStyles";
import { StarIcon } from "@/components/map/StarIcon";

export default function CategoriesPage() {
  const { categoryStyles, loading, reload } = useCategoryStyles();

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold text-[#1B1408]">Category Colors</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Changes here affect every marker of that category everywhere, immediately.
      </p>

      {loading ? (
        <p className="mt-6 text-sm text-neutral-500">Loading...</p>
      ) : (
        // Keyed so the editor remounts (and re-seeds its draft state) whenever a
        // reload brings in fresh server data, instead of syncing via an effect.
        <CategoryEditor key={JSON.stringify(categoryStyles)} initial={categoryStyles} reload={reload} />
      )}
    </div>
  );
}

function CategoryEditor({
  initial,
  reload,
}: {
  initial: CategoryStyleMap;
  reload: () => Promise<void>;
}) {
  const [draft, setDraft] = useState<CategoryStyleMap>(initial);
  const [savingCategory, setSavingCategory] = useState<Category | null>(null);
  const [savedCategory, setSavedCategory] = useState<Category | null>(null);
  const [errorByCategory, setErrorByCategory] = useState<Partial<Record<Category, string>>>({});

  async function save(category: Category) {
    setSavingCategory(category);
    setSavedCategory(null);
    setErrorByCategory((prev) => ({ ...prev, [category]: undefined }));
    const style = draft[category];

    try {
      const res = await fetch("/api/categories", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, color: style.color, label: style.label }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(
          data.error ?? (res.status === 401 ? "Your session expired -- sign in again and retry." : `Failed to save (${res.status})`)
        );
      }
      setSavedCategory(category);
      await reload();
    } catch (err) {
      setErrorByCategory((prev) => ({
        ...prev,
        [category]: err instanceof Error ? err.message : "Failed to save",
      }));
    } finally {
      setSavingCategory(null);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      {CATEGORIES.map((category) => {
        const style = draft[category];
        return (
          <div key={category} className="rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <StarIcon color={style.color} size={24} />
              <input
                type="color"
                value={style.color}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [category]: { ...prev[category], color: e.target.value } }))
                }
                className="h-9 w-12 cursor-pointer rounded border border-neutral-300"
              />
              <input
                value={style.color}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [category]: { ...prev[category], color: e.target.value } }))
                }
                className="w-28 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-black"
              />
              <input
                value={style.label}
                onChange={(e) =>
                  setDraft((prev) => ({ ...prev, [category]: { ...prev[category], label: e.target.value } }))
                }
                className="flex-1 rounded-lg border border-neutral-300 px-2 py-1.5 text-sm text-black"
              />
              <button
                type="button"
                onClick={() => save(category)}
                disabled={savingCategory === category}
                className="rounded-full bg-[#1B1408] px-3 py-1.5 text-xs font-semibold text-[#F4E9D6] hover:bg-[#2a2012] disabled:opacity-50"
              >
                {savingCategory === category ? "Saving..." : "Save"}
              </button>
            </div>
            {savedCategory === category && (
              <p className="mt-2 text-xs text-green-700">Saved -- other pages will pick this up next time they load.</p>
            )}
            {errorByCategory[category] && (
              <p className="mt-2 text-xs text-red-600">{errorByCategory[category]}</p>
            )}
          </div>
        );
      })}
    </div>
  );
}
