import { recentAudit, auditCount, type AuditAction } from "@/lib/audit";

export const metadata = {
  title: "Activity · INature Admin",
};

/**
 * Reads in-memory state, so it must never be cached: a prerendered copy would
 * show whatever the ring held at build time and then never change.
 */
export const dynamic = "force-dynamic";

/** How the panel describes each recorded action. */
const LABELS: Record<AuditAction, string> = {
  "login.success": "Signed in",
  "login.failure": "Failed sign-in",
  "login.throttled": "Sign-in blocked",
  logout: "Signed out",
  "article.create": "Article created",
  "article.update": "Article updated",
  "article.delete": "Article deleted",
  "product.update": "Product updated",
  "product.image.add": "Product image added",
  "product.image.delete": "Product image removed",
};

/**
 * Which entries are worth a second look rather than a glance.
 * A failed or blocked sign-in is the line that matters on this page.
 */
const SECURITY_ACTIONS = new Set<AuditAction>([
  "login.failure",
  "login.throttled",
]);

function formatTime(at: number): string {
  // Fixed locale and an explicit zone, so the timestamp means the same thing
  // whoever opens the page: the store trades in the UK.
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "Europe/London",
    hour12: false,
  }).format(new Date(at));
}

export default function ActivityPage() {
  const events = recentAudit();
  const total = auditCount();

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-6">
        <h1 className="u-serif text-2xl font-semibold text-ink">Activity</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          Sign-ins and every change made through this panel, newest first. Each
          entry is also written to the server log, which is the copy that
          survives: this list is held in memory and starts empty after a
          restart or deploy.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-sm font-medium text-ink">Nothing recorded yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-muted">
            Entries appear as soon as someone signs in or edits content. An
            empty list right after a deploy is expected, not a fault.
          </p>
        </div>
      ) : (
        <>
          <div className="card table-scroll">
            <table className="w-full border-collapse text-sm">
              <caption className="sr-only">
                Recorded panel activity, newest first
              </caption>
              <thead>
                <tr className="border-b border-line text-left">
                  <th scope="col" className="px-4 py-3 font-medium text-muted">
                    Time
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">
                    Action
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">
                    Subject
                  </th>
                  <th scope="col" className="px-4 py-3 font-medium text-muted">
                    From
                  </th>
                </tr>
              </thead>
              <tbody>
                {events.map((event, index) => {
                  const flagged = !event.ok || SECURITY_ACTIONS.has(event.action);
                  return (
                    <tr
                      key={`${event.at}-${event.action}-${index}`}
                      className="border-b border-line/60 last:border-0"
                    >
                      <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                        {formatTime(event.at)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={
                            flagged
                              ? "font-medium text-terracotta-dark"
                              : "text-ink"
                          }
                        >
                          {LABELS[event.action]}
                        </span>
                        {!event.ok && !SECURITY_ACTIONS.has(event.action) ? (
                          <span className="ml-2 text-xs text-muted">failed</span>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-muted">
                        {event.subject ?? "—"}
                        {event.detail ? (
                          <span className="block text-xs text-muted/80">
                            {event.detail}
                          </span>
                        ) : null}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted">
                        {event.ip}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <p className="mt-3 text-xs text-muted">
            Showing {events.length} of {total} recorded since the last restart.
            {total > events.length
              ? " Older entries are in the server log only."
              : ""}
          </p>
        </>
      )}
    </main>
  );
}
