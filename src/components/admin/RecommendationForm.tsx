"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CATEGORIES, MAX_ADDITIONAL_CATEGORIES, type Category, type CategoryStyleMap, type Recommendation } from "@/lib/types";
import { DEFAULT_MAP_CONFIG, SELECTS_CAP, SELECT_RING_COLOR } from "@/lib/constants";
import { StarIcon } from "@/components/map/StarIcon";
import { PhotoUploader } from "./PhotoUploader";
import { MarkerPositionPicker } from "./MarkerPositionPicker";

const INPUT_CLASS =
  "w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#A98235]";

export interface RecommendationFormValues {
  name: string;
  category: Category;
  additionalCategories: Category[];
  description: string;
  address: string;
  lat: number;
  lng: number;
  photos: string[];
  website: string;
  phone: string;
  hours: string;
  published: boolean;
  isSelect: boolean;
  selectNote: string;
  displayOrder: number;
}

function toFormValues(r: Recommendation | null): RecommendationFormValues {
  if (!r) {
    return {
      name: "",
      category: "restaurant",
      additionalCategories: [],
      description: "",
      address: "",
      lat: DEFAULT_MAP_CONFIG.centerLat,
      lng: DEFAULT_MAP_CONFIG.centerLng,
      photos: [],
      website: "",
      phone: "",
      hours: "",
      published: true,
      isSelect: false,
      selectNote: "",
      displayOrder: 0,
    };
  }
  return {
    name: r.name,
    category: r.category,
    additionalCategories: r.additionalCategories,
    description: r.description,
    address: r.address,
    lat: r.lat,
    lng: r.lng,
    photos: r.photos,
    website: r.website ?? "",
    phone: r.phone ?? "",
    hours: typeof r.hours === "string" ? r.hours : r.hours ? JSON.stringify(r.hours) : "",
    published: r.published,
    isSelect: r.isSelect,
    selectNote: r.selectNote ?? "",
    displayOrder: r.displayOrder,
  };
}

export function RecommendationForm({
  recommendation,
  categoryStyles,
  selectsCount,
}: {
  recommendation: Recommendation | null;
  categoryStyles: CategoryStyleMap;
  selectsCount: number;
}) {
  const router = useRouter();
  const [values, setValues] = useState<RecommendationFormValues>(toFormValues(recommendation));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const style = categoryStyles[values.category];
  const wasAlreadySelect = recommendation?.isSelect ?? false;
  const atCap = !wasAlreadySelect && selectsCount >= SELECTS_CAP;

  function set<K extends keyof RecommendationFormValues>(key: K, value: RecommendationFormValues[K]) {
    setValues((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const body = {
      name: values.name,
      category: values.category,
      additionalCategories: values.additionalCategories,
      description: values.description,
      address: values.address,
      lat: values.lat,
      lng: values.lng,
      photos: values.photos,
      website: values.website || null,
      phone: values.phone || null,
      hours: values.hours || null,
      published: values.published,
      isSelect: values.isSelect,
      selectNote: values.isSelect ? values.selectNote || null : null,
      displayOrder: values.displayOrder,
    };

    const res = await fetch(
      recommendation ? `/api/recommendations/${recommendation.id}` : "/api/recommendations",
      {
        method: recommendation ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    setSaving(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Failed to save (${res.status})`);
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  async function handleDelete() {
    if (!recommendation) return;
    if (!confirm(`Delete "${recommendation.name}"? This cannot be undone.`)) return;
    setDeleting(true);
    const res = await fetch(`/api/recommendations/${recommendation.id}`, { method: "DELETE" });
    setDeleting(false);
    if (!res.ok) {
      setError("Failed to delete");
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="grid max-w-3xl gap-6">
      <div className="flex items-center gap-3 rounded-xl bg-white p-4 shadow-sm ring-1 ring-black/5">
        <span className="text-xs font-medium text-neutral-500">Live preview</span>
        <span className="relative flex h-11 w-11 items-center justify-center">
          {values.isSelect && (
            <span
              className="absolute inset-0 rounded-full"
              style={{ boxShadow: `0 0 0 2.5px ${SELECT_RING_COLOR}` }}
            />
          )}
          <StarIcon color={style.color} size={values.isSelect ? 25 : 22} />
        </span>
        <span className="text-sm text-neutral-600">
          {style.label}
          {values.additionalCategories.length > 0 &&
            ` + ${values.additionalCategories.map((c) => categoryStyles[c].label).join(", ")}`}
          {values.isSelect && " -- Treadwell Selects"}
        </span>
      </div>

      <Field label="Name">
        <input
          required
          value={values.name}
          onChange={(e) => set("name", e.target.value)}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Category">
        <select
          value={values.category}
          onChange={(e) => {
            const category = e.target.value as Category;
            setValues((prev) => ({
              ...prev,
              category,
              additionalCategories: prev.additionalCategories.filter((c) => c !== category),
            }));
          }}
          className={INPUT_CLASS}
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {categoryStyles[c].label}
            </option>
          ))}
        </select>
        <p className="mt-1 text-xs text-neutral-500">This drives the star&apos;s color on the map.</p>
      </Field>

      <Field label={`Additional categories (optional, up to ${MAX_ADDITIONAL_CATEGORIES})`}>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.filter((c) => c !== values.category).map((c) => {
            const checked = values.additionalCategories.includes(c);
            const atAdditionalCap = values.additionalCategories.length >= MAX_ADDITIONAL_CATEGORIES;
            return (
              <label
                key={c}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm ${
                  checked ? "border-[#A98235] bg-[#A98235]/10" : "border-neutral-300"
                } ${!checked && atAdditionalCap ? "opacity-40" : ""}`}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={!checked && atAdditionalCap}
                  onChange={(e) =>
                    setValues((prev) => ({
                      ...prev,
                      additionalCategories: e.target.checked
                        ? [...prev.additionalCategories, c]
                        : prev.additionalCategories.filter((x) => x !== c),
                    }))
                  }
                />
                {categoryStyles[c].label}
              </label>
            );
          })}
        </div>
        <p className="mt-1 text-xs text-neutral-500">
          A guest filtering by any of these will also see this recommendation. Its star still only shows in
          its primary category&apos;s color.
        </p>
      </Field>

      <Field label="Description">
        <textarea
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          rows={4}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Address">
        <input
          required
          value={values.address}
          onChange={(e) => set("address", e.target.value)}
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Marker position">
        <MarkerPositionPicker
          lat={values.lat}
          lng={values.lng}
          address={values.address}
          color={style.color}
          onChange={(lat, lng) => setValues((prev) => ({ ...prev, lat, lng }))}
          onAddressChange={(address) => setValues((prev) => ({ ...prev, address }))}
        />
      </Field>

      <Field label="Photos">
        <PhotoUploader photos={values.photos} onChange={(photos) => set("photos", photos)} />
      </Field>

      <Field label="Website">
        <input
          type="url"
          value={values.website}
          onChange={(e) => set("website", e.target.value)}
          placeholder="https://..."
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Phone">
        <input value={values.phone} onChange={(e) => set("phone", e.target.value)} className={INPUT_CLASS} />
      </Field>

      <Field label="Hours">
        <textarea
          value={values.hours}
          onChange={(e) => set("hours", e.target.value)}
          rows={2}
          placeholder="e.g. Mon-Fri 9am-5pm, Sat-Sun 10am-4pm"
          className={INPUT_CLASS}
        />
      </Field>

      <Field label="Display order">
        <input
          type="number"
          value={values.displayOrder}
          onChange={(e) => set("displayOrder", Number(e.target.value))}
          className={`${INPUT_CLASS} w-32`}
        />
      </Field>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={values.published}
          onChange={(e) => set("published", e.target.checked)}
        />
        Published (visible to guests)
      </label>

      <div className="rounded-xl border border-[#A98235]/40 bg-[#A98235]/5 p-4">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input
            type="checkbox"
            checked={values.isSelect}
            disabled={atCap}
            onChange={(e) => set("isSelect", e.target.checked)}
          />
          Treadwell Selects
          <span className="font-normal text-neutral-500">
            ({selectsCount} of {SELECTS_CAP} used)
          </span>
        </label>
        {atCap && (
          <p className="mt-1 text-sm text-amber-700">
            Selects is capped at {SELECTS_CAP}. Remove one from the Selects page before adding another.
          </p>
        )}
        {values.isSelect && (
          <div className="mt-3">
            <label className="block text-sm font-medium text-neutral-700">
              Concierge note (optional)
              <input
                value={values.selectNote}
                onChange={(e) => set("selectNote", e.target.value)}
                placeholder="Ask for the corner table upstairs"
                className={`${INPUT_CLASS} mt-1`}
              />
            </label>
          </div>
        )}
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-full bg-[#1B1408] px-5 py-2.5 text-sm font-semibold text-[#F4E9D6] hover:bg-[#2a2012] disabled:opacity-50"
        >
          {saving ? "Saving..." : recommendation ? "Save changes" : "Create recommendation"}
        </button>
        {recommendation && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            {deleting ? "Deleting..." : "Delete"}
          </button>
        )}
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
