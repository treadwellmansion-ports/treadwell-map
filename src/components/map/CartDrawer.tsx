"use client";

import { useState } from "react";
import type { CategoryStyleMap, Recommendation } from "@/lib/types";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { CategoryIcon } from "./CategoryIcon";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function CartDrawer({
  recommendations,
  categoryStyles,
  onRemove,
  onClose,
  onSent,
}: {
  recommendations: Recommendation[];
  categoryStyles: CategoryStyleMap;
  onRemove: (id: string) => void;
  onClose: () => void;
  onSent: () => void;
}) {
  const isLandscape = useMediaQuery("(orientation: landscape)");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const containerClass = isLandscape
    ? "absolute top-0 right-0 h-full w-full max-w-sm overflow-y-auto bg-[var(--seasonal-card)] shadow-2xl transition-colors duration-[600ms]"
    : "absolute inset-x-0 bottom-0 max-h-[75vh] overflow-y-auto rounded-t-2xl bg-[var(--seasonal-card)] shadow-2xl transition-colors duration-[600ms]";

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedEmail = email.trim();
    if (!EMAIL_PATTERN.test(trimmedEmail)) {
      setError("Enter a valid email address.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/cart/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: name.trim() || null,
          recommendationIds: recommendations.map((r) => r.id),
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Something went wrong sending your list.");
      }
      setSent(true);
      setTimeout(onSent, 2200);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong sending your list.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={`${containerClass} pointer-events-auto z-40`}>
      <div className="sticky top-0 flex items-center justify-between bg-[var(--seasonal-card)] p-4 transition-colors duration-[600ms]">
        <h2 className="text-lg font-semibold text-[var(--ink)]">Your List</h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="flex h-11 w-11 items-center justify-center rounded-full bg-black/5 text-xl text-[var(--ink-secondary)] hover:bg-black/10"
        >
          ×
        </button>
      </div>

      <div className="px-4 pb-8">
        {sent ? (
          <div className="py-10 text-center">
            <p className="text-lg font-semibold text-[var(--ink)]">Sent!</p>
            <p className="mt-2 text-sm text-[var(--ink-secondary)]">
              Check your email for your Treadwell picks.
            </p>
          </div>
        ) : recommendations.length === 0 ? (
          <p className="py-10 text-center text-sm text-[var(--ink-secondary)]">
            Tap &ldquo;+ Add to List&rdquo; on any recommendation to save it here.
          </p>
        ) : (
          <>
            <div className="flex flex-col gap-2">
              {recommendations.map((r) => {
                const style = categoryStyles[r.category];
                return (
                  <div
                    key={r.id}
                    className="flex items-center gap-3 rounded-xl bg-[var(--row-bg)] p-3 transition-colors duration-[600ms]"
                  >
                    <span
                      className="flex shrink-0 items-center justify-center rounded-full"
                      style={{ width: 32, height: 32, backgroundColor: style.color }}
                    >
                      <CategoryIcon category={r.category} size={18} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-medium text-[var(--ink)]">{r.name}</span>
                      <span className="block truncate text-xs text-[var(--ink-secondary)]">{r.address}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => onRemove(r.id)}
                      aria-label={`Remove ${r.name} from your list`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[var(--ink-secondary)] hover:bg-black/10"
                    >
                      ×
                    </button>
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSend} className="mt-5 flex flex-col gap-3 border-t border-black/10 pt-4">
              <label className="block text-sm font-medium text-[var(--ink)]">
                Your name (optional)
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Jane Smith"
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </label>
              <label className="block text-sm font-medium text-[var(--ink)]">
                Email address
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-1 w-full rounded-lg border border-black/15 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[var(--gold)]"
                />
              </label>

              {error && <p className="text-sm text-red-700">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="mt-1 flex items-center justify-center rounded-full bg-[var(--cta-bg)] px-4 py-3 text-sm font-semibold text-[var(--cta-text)] transition-colors duration-[600ms] hover:opacity-90 disabled:opacity-50"
              >
                {submitting ? "Sending..." : "Email My List"}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
