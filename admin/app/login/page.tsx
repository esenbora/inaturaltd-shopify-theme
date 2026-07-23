"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (response.ok) {
        router.push("/");
        router.refresh();
        return;
      }

      if (response.status === 401) {
        setError("Invalid password. Please try again.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } catch {
      setError("Couldn't reach the server. Check your connection and retry.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mb-3 flex items-baseline justify-center gap-2">
            <span className="u-serif text-2xl font-semibold text-ink">
              INature
            </span>
            <span className="rounded-full bg-sage/15 px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wider text-sage-dark">
              Admin
            </span>
          </div>
          <p className="text-sm text-muted">
            Enter the team password to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card p-6">
          <label htmlFor="password" className="label">
            Team password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            autoFocus
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            disabled={submitting}
            aria-invalid={error !== null}
            aria-describedby={error !== null ? "password-error" : undefined}
            className="input"
          />

          {error !== null ? (
            <p id="password-error" role="alert" className="mt-3 text-sm text-terracotta-dark">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary mt-5 w-full"
          >
            {submitting ? "Signing in…" : "Sign in"}
          </button>
        </form>
      </div>
    </main>
  );
}
