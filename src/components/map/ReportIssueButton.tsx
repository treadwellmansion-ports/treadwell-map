"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function ReportIssueButton({
  recommendationId,
  recommendationName,
}: {
  recommendationId: string;
  recommendationName: string;
}) {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    const supabase = createClient();
    const { error } = await supabase.from("issue_reports").insert({
      recommendation_id: recommendationId,
      recommendation_name: recommendationName,
      message: message.trim() || null,
    });
    setSubmitting(false);
    if (!error) setSubmitted(true);
  }

  if (submitted) {
    return <p className="mt-4 text-xs text-neutral-500">Thanks -- the front desk has been notified.</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-4 text-xs text-neutral-400 underline decoration-dotted hover:text-neutral-600"
      >
        Report an issue with this listing
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 rounded-lg bg-black/[0.03] p-3">
      <label className="block text-xs font-medium text-neutral-600">
        What&apos;s wrong? (optional)
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={2}
          placeholder="e.g. Closed, moved, wrong phone number..."
          className="mt-1 w-full rounded-md border border-neutral-300 px-2 py-1.5 text-sm text-black outline-none focus:ring-2 focus:ring-[#A98235]"
        />
      </label>
      <div className="mt-2 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full px-3 py-1.5 text-xs text-neutral-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="rounded-full bg-[#1B1408] px-3 py-1.5 text-xs font-semibold text-[#F4E9D6] disabled:opacity-50"
        >
          {submitting ? "Sending..." : "Send"}
        </button>
      </div>
    </form>
  );
}
