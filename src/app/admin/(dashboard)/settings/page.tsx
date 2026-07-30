"use client";

import { useState } from "react";
import { useMapConfig } from "@/hooks/useMapConfig";
import type { MapConfig } from "@/lib/types";

const INPUT_CLASS = "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#A98235]";

export default function MapSettingsPage() {
  const { mapConfig, loading } = useMapConfig();

  if (loading) return <p className="text-sm text-neutral-500">Loading...</p>;

  // Keyed so the form remounts (and re-seeds its draft state) whenever fresh
  // server data loads, instead of syncing via an effect.
  return <MapSettingsForm key={JSON.stringify(mapConfig)} initial={mapConfig} />;
}

function MapSettingsForm({ initial }: { initial: MapConfig }) {
  const [draft, setDraft] = useState<MapConfig>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  function num(value: string) {
    return Number(value);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setSaved(false);
    await fetch("/api/map-config", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(draft),
    });
    setSaving(false);
    setSaved(true);
  }

  return (
    <form onSubmit={handleSave} className="max-w-xl">
      <h1 className="text-xl font-semibold text-[#1B1408]">Map Settings</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Downtown framing, zoom limits, and pan bounds -- no code deploy needed.
      </p>

      <div className="mt-6 grid gap-4 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Center latitude">
            <input
              type="number"
              step="0.0001"
              value={draft.centerLat}
              onChange={(e) => setDraft({ ...draft, centerLat: num(e.target.value) })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Center longitude">
            <input
              type="number"
              step="0.0001"
              value={draft.centerLng}
              onChange={(e) => setDraft({ ...draft, centerLng: num(e.target.value) })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Field label="Default zoom">
            <input
              type="number"
              step="0.1"
              value={draft.zoom}
              onChange={(e) => setDraft({ ...draft, zoom: num(e.target.value) })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Min zoom">
            <input
              type="number"
              step="0.1"
              value={draft.minZoom}
              onChange={(e) => setDraft({ ...draft, minZoom: num(e.target.value) })}
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Max zoom">
            <input
              type="number"
              step="0.1"
              value={draft.maxZoom}
              onChange={(e) => setDraft({ ...draft, maxZoom: num(e.target.value) })}
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <p className="text-sm font-medium text-neutral-700">Pan bounds (max bounds box)</p>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Southwest longitude">
            <input
              type="number"
              step="0.0001"
              value={draft.maxBounds[0][0]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  maxBounds: [[num(e.target.value), draft.maxBounds[0][1]], draft.maxBounds[1]],
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Southwest latitude">
            <input
              type="number"
              step="0.0001"
              value={draft.maxBounds[0][1]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  maxBounds: [[draft.maxBounds[0][0], num(e.target.value)], draft.maxBounds[1]],
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Northeast longitude">
            <input
              type="number"
              step="0.0001"
              value={draft.maxBounds[1][0]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  maxBounds: [draft.maxBounds[0], [num(e.target.value), draft.maxBounds[1][1]]],
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
          <Field label="Northeast latitude">
            <input
              type="number"
              step="0.0001"
              value={draft.maxBounds[1][1]}
              onChange={(e) =>
                setDraft({
                  ...draft,
                  maxBounds: [draft.maxBounds[0], [draft.maxBounds[1][0], num(e.target.value)]],
                })
              }
              className={INPUT_CLASS}
            />
          </Field>
        </div>

        <Field label="Custom style URL (optional -- escape hatch for a self-hosted antique MapLibre style)">
          <input
            value={draft.styleUrl ?? ""}
            onChange={(e) => setDraft({ ...draft, styleUrl: e.target.value || null })}
            placeholder="https://tiles.openfreemap.org/styles/liberty (default)"
            className={INPUT_CLASS}
          />
        </Field>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#1B1408] px-5 py-2.5 text-sm font-semibold text-[#F4E9D6] hover:bg-[#2a2012] disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save settings"}
        </button>
        {saved && <span className="text-sm text-green-700">Saved.</span>}
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-neutral-700">{label}</span>
      {children}
    </label>
  );
}
