"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

/**
 * The sign-in form.
 *
 * Split out of `page.tsx` so the page itself can stay a server component and
 * be rendered per request: the CSP nonce in `proxy.ts` only reaches a page
 * Next renders at request time.
 */
export function LoginForm() {
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

      if (response.status === 429) {
        // Say how long, because otherwise a locked-out colleague reads the
        // refusal as a wrong password and keeps trying, which extends the
        // lockout they are already serving.
        const seconds = Number(response.headers.get("Retry-After"));
        const wait =
          Number.isFinite(seconds) && seconds > 0
            ? seconds >= 60
              ? `${Math.ceil(seconds / 60)} min`
              : `${seconds} sec`
            : "a moment";
        setError(`Too many attempts. Try again in ${wait}.`);
      } else if (response.status === 401) {
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
        <p
          id="password-error"
          role="alert"
          className="mt-3 text-sm text-terracotta-dark"
        >
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
  );
}
