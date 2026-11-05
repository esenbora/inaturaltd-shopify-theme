import Link from "next/link";
import {
  recentAudit,
  auditCount,
  type AuditAction,
  type AuditEvent,
} from "@/lib/audit";
import { Card, Empty, Stat, count } from "@/components/dashboard/shell";

export const metadata = {
  title: "Activity · INature Admin",
};

/**
 * Reads in-memory state, so it must never be cached: a prerendered copy would
 * show whatever the ring held at build time and then never change.
 *
 * There is no loading or error state because there is no I/O: the ring is read
 * synchronously from this process. The empty state carries the real caveat,
 * that the list restarts empty on every deploy.
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

type Kind = "security" | "session" | "content";

const KIND: Record<AuditAction, Kind> = {
  "login.success": "session",
  "login.failure": "security",
  "login.throttled": "security",
  logout: "session",
  "article.create": "content",
  "article.update": "content",
  "article.delete": "content",
  "product.update": "content",
  "product.image.add": "content",
  "product.image.delete": "content",
};

type Show = "all" | "security" | "content";

function resolveShow(raw: string | string[] | undefined): Show {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "security" || value === "content" ? value : "all";
}

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

function outcome(event: AuditEvent): { word: string; bad: boolean } {
  if (event.action === "login.throttled") return { word: "Blocked", bad: true };
  if (!event.ok) return { word: "Failed", bad: true };
  return { word: "Done", bad: false };
}

function ShowTabs({
  active,
  counts,
}: {
  active: Show;
  counts: Record<Show, number>;
}) {
  const options: { value: Show; label: string }[] = [
    { value: "all", label: "All" },
    { value: "security", label: "Sign-in problems" },
    { value: "content", label: "Content changes" },
  ];
  return (
    <nav
      className="mb-6 inline-flex flex-wrap gap-1 rounded-lg border border-line bg-card p-1"
      aria-label="Show"
    >
      {options.map((o) => {
        const isActive = o.value === active;
        const alert = o.value === "security" && counts.security > 0 && !isActive;
        return (
          <Link
            key={o.value}
            href={`/activity?show=${o.value}`}
            aria-current={isActive ? "page" : undefined}
            className={`rounded-md px-3 py-1.5 max-sm:py-2.5 text-sm font-medium transition-colors ${
              isActive
                ? "bg-sage text-white"
                : alert
                  ? "bg-terracotta/10 text-terracotta-dark hover:bg-terracotta/15"
                  : "text-muted hover:bg-sand hover:text-ink"
            }`}
          >
            {o.label}
            <span
              className={`ml-1.5 tabular-nums ${isActive ? "text-white/70" : "opacity-70"}`}
            >
              {counts[o.value]}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}

export default async function ActivityPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const show = resolveShow(params.show);

  const events = recentAudit();
  const total = auditCount();

  const security = events.filter((e) => KIND[e.action] === "security");
  const content = events.filter((e) => KIND[e.action] === "content");
  const signIns = events.filter((e) => e.action === "login.success");
  const deletions = content.filter(
    (e) => e.action === "article.delete" || e.action === "product.image.delete",
  );
  const counts: Record<Show, number> = {
    all: events.length,
    security: security.length,
    content: content.length,
  };
  const shown =
    show === "security" ? security : show === "content" ? content : events;
  const latest = events[0];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">Activity</h1>
        <p className="page-standfirst mt-3">
          Who signed in and what was changed through this panel, newest first.
          The list is held in this server&apos;s memory and starts empty after
          every restart or deploy; the copy that survives is the server log,
          where each entry is also written. Failed and blocked sign-ins are the
          lines to look at.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      <Card
        title="Since the last restart"
        tone={events.length === 0 ? undefined : security.length > 0 ? "attention" : "calm"}
        description="Counted from the entries this server has recorded. It holds the most recent 300 and drops the oldest beyond that."
      >
        <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            size="lead"
            label="Sign-in problems"
            value={count(security.length)}
            tone={security.length > 0 ? "attention" : "neutral"}
            note={
              security.length > 0
                ? "Failed or blocked attempts"
                : "No failed or blocked attempts"
            }
          />
          <Stat
            label="Successful sign-ins"
            value={count(signIns.length)}
          />
          <Stat
            label="Content changes"
            value={count(content.length)}
            note={
              deletions.length > 0
                ? `${count(deletions.length)} of them deletions`
                : "No deletions"
            }
          />
          <Stat
            label="Latest entry"
            value={latest ? formatTime(latest.at) : "—"}
            note="UK time"
          />
        </div>
      </Card>

      <div className="mt-6">
        {events.length === 0 ? (
          <Card title="Nothing recorded yet">
            <Empty>
              Entries appear as soon as someone signs in or edits content. An
              empty list right after a deploy is expected, not a fault.
            </Empty>
          </Card>
        ) : (
          <>
            <ShowTabs active={show} counts={counts} />
            {shown.length === 0 ? (
              <Empty>
                {show === "security"
                  ? "No failed or blocked sign-ins since the last restart."
                  : "No content has been changed since the last restart."}{" "}
                <Link
                  href="/activity?show=all"
                  className="font-medium text-sage-dark underline-offset-2 hover:underline"
                >
                  Show everything
                </Link>
              </Empty>
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
                          Time (UK)
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium text-muted">
                          Action
                        </th>
                        <th scope="col" className="px-4 py-3 font-medium text-muted">
                          Result
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
                      {shown.map((event, index) => {
                        const result = outcome(event);
                        return (
                          <tr
                            key={`${event.at}-${event.action}-${index}`}
                            className="border-b border-line/60 last:border-0"
                          >
                            <td className="whitespace-nowrap px-4 py-3 tabular-nums text-muted">
                              {formatTime(event.at)}
                            </td>
                            <td
                              className={`px-4 py-3 ${
                                result.bad
                                  ? "font-medium text-terracotta-dark"
                                  : "text-ink"
                              }`}
                            >
                              {LABELS[event.action]}
                            </td>
                            <td className="whitespace-nowrap px-4 py-3">
                              <span
                                className={`badge ${
                                  result.bad
                                    ? "bg-terracotta/10 text-terracotta-dark"
                                    : "badge-visible"
                                }`}
                              >
                                {result.word}
                              </span>
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
                  Showing {shown.length} of {total} recorded since the last
                  restart.
                  {total > events.length
                    ? " Older entries are in the server log only."
                    : ""}
                </p>
              </>
            )}
          </>
        )}
      </div>
    </main>
  );
}
