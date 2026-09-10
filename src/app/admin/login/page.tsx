"use client";

import { useState, useTransition, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loginAdmin } from "@/lib/actions/admin-auth";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await loginAdmin(email, password);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      const from = searchParams.get("from") || "/admin";
      router.push(from);
      router.refresh();
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-forest px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <h1 className="text-xl font-bold text-forest-dark">Admin Login</h1>
        <p className="mt-1 text-sm text-foreground/60">Big H Recreations LLC</p>

        <label className="mt-6 flex flex-col text-sm font-medium text-forest-dark">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>
        <label className="mt-4 flex flex-col text-sm font-medium text-forest-dark">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 rounded-lg border border-sand-dark/50 px-3 py-2"
          />
        </label>

        {error && <p className="mt-4 text-sm text-clay">{error}</p>}

        <button
          type="submit"
          disabled={isPending}
          className="mt-6 w-full rounded-full bg-river px-4 py-2.5 font-semibold text-white transition hover:bg-river-dark disabled:opacity-60"
        >
          {isPending ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
