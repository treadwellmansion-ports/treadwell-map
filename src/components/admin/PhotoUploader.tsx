"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function PhotoUploader({
  photos,
  onChange,
}: {
  photos: string[];
  onChange: (photos: string[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const supabase = createClient();
    const uploaded: string[] = [];

    for (const file of Array.from(files)) {
      const path = `${crypto.randomUUID()}-${file.name}`;
      const { error } = await supabase.storage.from("recommendation-photos").upload(path, file);
      if (error) {
        setError(error.message);
        continue;
      }
      const { data } = supabase.storage.from("recommendation-photos").getPublicUrl(path);
      uploaded.push(data.publicUrl);
    }

    onChange([...photos, ...uploaded]);
    setUploading(false);
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {photos.map((src) => (
          <div key={src} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt="" className="h-24 w-32 rounded-lg object-cover" />
            <button
              type="button"
              onClick={() => onChange(photos.filter((p) => p !== src))}
              className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-xs text-white"
              aria-label="Remove photo"
            >
              ×
            </button>
          </div>
        ))}
      </div>

      <label className="mt-3 inline-block cursor-pointer rounded-full border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-50">
        {uploading ? "Uploading..." : "Upload photos"}
        <input
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
        />
      </label>

      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
}
