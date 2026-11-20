"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      setError(error.message);
      return;
    }
    // ?next= is attacker-controllable via a crafted link; only follow
    // same-site paths so a login can never bounce an admin to another site.
    const requested = searchParams.get("next");
    const safeNext =
      requested && requested.startsWith("/") && !requested.startsWith("//") && !requested.includes("\\")
        ? requested
        : "/admin";
    router.push(safeNext);
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F4E9D6] p-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-lg">
        <h1 className="text-xl font-semibold text-[#1B1408]">Treadwell Staff Login</h1>
        <p className="mt-1 text-sm text-neutral-500">Manage downtown recommendations</p>

        <label className="mt-6 block text-sm font-medium text-neutral-700">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#A98235]"
          />
        </label>

        <label className="mt-4 block text-sm font-medium text-neutral-700">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm text-black outline-none focus:ring-2 focus:ring-[#A98235]"
          />
        </label>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-[#1B1408] px-4 py-2.5 text-sm font-semibold text-[#F4E9D6] hover:bg-[#2a2012] disabled:opacity-50"
        >
          {submitting ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
