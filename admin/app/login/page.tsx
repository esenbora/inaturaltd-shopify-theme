import { LoginForm } from "./login-form";
import { StimilonSignature } from "@/components/stimilon-signature";

export const metadata = {
  title: "Sign in · INature Admin",
};

/*
 * Rendered per request, not prerendered.
 *
 * The CSP in `proxy.ts` carries a per-request nonce, and Next can only put
 * that nonce on the script tags of a page it renders at request time. Left
 * static, the sign-in page would be served as build-time HTML whose scripts
 * carry no nonce, the browser would refuse to run them, and the form would
 * never submit: a dead page with a CSP error in the console and nothing at
 * all in the server log.
 */
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <main className="flex min-h-full flex-1 items-center justify-center px-6 py-16">
      <div className="w-full max-w-[22rem]">
        <div className="mb-7 text-center">
          <div className="flex items-baseline justify-center gap-2">
            <span className="u-display text-[2.125rem] text-ink">
              INature
            </span>
            <span className="rounded-full bg-sage/12 px-2 py-0.5 text-[0.625rem] font-semibold uppercase tracking-[0.1em] text-sage-dark">
              Admin
            </span>
          </div>
          <p className="mt-3 text-sm text-muted">
            Enter the team password to continue.
          </p>
        </div>

        {/* The form sits on a card so the sign-in screen has a centre of
            gravity. On a bare cream page the single field floated, and the
            screen read as unfinished rather than minimal. */}
        <div className="card p-6 sm:p-7">
          <LoginForm />
        </div>

        <div className="mt-8">
          <StimilonSignature variant="auth" />
        </div>
      </div>
    </main>
  );
}
