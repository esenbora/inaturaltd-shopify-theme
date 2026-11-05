import { Suspense } from "react";
import { getSalesSummary } from "@/lib/sales";
import { getAnalyticsSummary } from "@/lib/google";
import { listArticles } from "@/lib/shopify";
import { assessBlogHealth } from "@/lib/blog-health";
import { buildMonthlyReport } from "@/lib/monthly-report";
import { RangeTabs, rangeLabel, resolveRange } from "@/components/range-tabs";
import { CopyButton } from "@/components/copy-button";
import { Card, CardSkeleton } from "@/components/dashboard/shell";

/**
 * Monthly report.
 *
 * The service agreement asks for a monthly report in six parts. Three of them
 * are figures the panel already holds, so those write themselves; the other
 * three are judgement, and a generated "work done" section would be invented.
 * This page assembles the first half, leaves honest prompts for the second, and
 * says plainly which sections are which, because a pasted report that mixes
 * measured and unfinished sections is only safe if the sender can tell them
 * apart before it goes out.
 *
 * It used to show the markdown and one line about what was missing. A source
 * failing quietly thins a section into a sentence, and someone skimming the
 * preview could send that sentence to the client without noticing. Each
 * section now carries its own status next to the text it controls.
 */

export const metadata = {
  title: "Monthly report · INature Admin",
};

export const dynamic = "force-dynamic";

type Status = "filled" | "partial" | "missing" | "yours";

/** Glyph and word together, never the colour alone. */
function StatusBadge({ status, label }: { status: Status; label: string }) {
  const style =
    status === "filled"
      ? "badge-visible"
      : status === "missing"
        ? "bg-terracotta/10 text-terracotta-dark"
        : "badge-hidden";
  const glyph =
    status === "filled" ? "✓" : status === "missing" ? "✕" : status === "yours" ? "✎" : "–";
  return (
    <span className={`badge gap-1 whitespace-nowrap ${style}`}>
      <span aria-hidden>{glyph}</span>
      {label}
    </span>
  );
}

interface Section {
  number: number;
  title: string;
  source: string;
  status: Status;
  label: string;
  note: string;
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

async function ReportBody({ range }: { range: number }) {
  // A missing source should thin the report, not fail the page.
  const [salesResult, analyticsResult, articlesResult] =
    await Promise.allSettled([
      getSalesSummary(range),
      getAnalyticsSummary(range),
      listArticles(),
    ]);

  const sales = salesResult.status === "fulfilled" ? salesResult.value : null;
  const analytics =
    analyticsResult.status === "fulfilled" ? analyticsResult.value : null;
  const blog =
    articlesResult.status === "fulfilled"
      ? assessBlogHealth(articlesResult.value)
      : null;

  const markdown = buildMonthlyReport({
    rangeDays: range,
    sales,
    analytics,
    blog,
  });

  const sections: Section[] = [
    {
      number: 1,
      title: "Satış",
      source: "Shopify orders",
      status: sales ? "filled" : "missing",
      label: sales ? "Filled" : "Not reachable",
      note: sales
        ? "Orders, revenue, average order, channels and abandoned baskets."
        : "Shopify could not be read. The report says so in this section instead of showing a number.",
    },
    {
      number: 2,
      title: "Trafik",
      source: "Google Analytics",
      ...(analytics === null
        ? {
            status: "missing" as const,
            label: "Not reachable",
            note: "Google could not be read. The report says so in this section.",
          }
        : !analytics.configured
          ? {
              status: "partial" as const,
              label: "Not connected",
              note: "Google credentials are not set, so the report states that the integration is not configured.",
            }
          : analytics.ga4 === null
            ? {
                status: "missing" as const,
                label: "Not reachable",
                note: "Google Analytics could not be read. The report says so in this section.",
              }
            : {
                status: "filled" as const,
                label: "Filled",
                note: "Sessions, users, conversions and sessions by channel.",
              }),
    },
    {
      number: 3,
      title: "Arama görünürlüğü",
      source: "Search Console",
      ...(analytics === null
        ? {
            status: "missing" as const,
            label: "Not reachable",
            note: "Google could not be read. The report says so in this section.",
          }
        : !analytics.configured
          ? {
              status: "partial" as const,
              label: "Not connected",
              note: "Google credentials are not set, so the report states that the integration is not configured.",
            }
          : analytics.gsc === null
            ? {
                status: "missing" as const,
                label: "Not reachable",
                note: "Search Console could not be read. The report says so in this section.",
              }
            : analytics.gsc.noDataInRange
              ? {
                  status: "partial" as const,
                  label: "No data yet",
                  note: "Google has not published search data for this range, and the report prints zeros here. Check the section before sending, or pick a longer range.",
                }
              : {
                  status: "filled" as const,
                  label: "Filled",
                  note: "Clicks, impressions, click rate, position and the top five queries.",
                }),
    },
    {
      number: 4,
      title: "Yapılan işler",
      source: "Written by you",
      status: "yours",
      label: "Yours to write",
      note: "Work completed in the period. Left as a prompt, because the panel cannot know it.",
    },
    {
      number: 5,
      title: "Bekleyen konular",
      source: "Shopify blog",
      status: blog ? "partial" : "missing",
      label: blog ? "Part filled" : "Not reachable",
      note: blog
        ? "Blog drafts awaiting a decision and a stalled blog schedule fill in. Anything you are waiting on from the client is yours to add."
        : "The blog could not be read, so only the prompt for client items appears.",
    },
    {
      number: 6,
      title: "Sıradaki öncelikler",
      source: "Written by you",
      status: "yours",
      label: "Yours to write",
      note: "Priorities for the next period. Left as a prompt.",
    },
  ];

  const ready = sections.filter((s) => s.status === "filled").length;

  return (
    <>
      <Card
        title="What is in it"
        tone={
          sections.some((s) => s.status === "missing" || s.status === "partial")
            ? "attention"
            : "calm"
        }
        description={`${ready} of 6 sections filled from live figures. The report is in Turkish because that is the language it is delivered in; the section names below are the headings it prints.`}
      >
        <ol className="divide-y divide-line/70">
          {sections.map((s) => (
            <li
              key={s.number}
              className="grid gap-x-4 gap-y-1.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] sm:items-baseline"
            >
              <p className="text-sm font-medium text-ink">
                <span className="tabular-nums text-muted">{s.number}.</span>{" "}
                {s.title}
                <span className="block text-xs font-normal text-muted">
                  {s.source}
                </span>
              </p>
              <p className="text-sm text-muted">{s.note}</p>
              <div className="sm:justify-self-end">
                <StatusBadge status={s.status} label={s.label} />
              </div>
            </li>
          ))}
        </ol>
      </Card>

      <div className="mt-5">
        <Card
          title="Report text"
          description="Markdown, ready to paste into an email or a document. Lines in angle-bracket comments are the prompts for sections 4 to 6."
        >
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-muted">
              {rangeLabel(range)} ending today, read just now.
            </p>
            <CopyButton text={markdown} label="Copy markdown" />
          </div>
          <pre className="max-h-[36rem] overflow-auto whitespace-pre-wrap rounded-lg border border-line bg-cream/60 px-5 py-4 text-sm leading-relaxed text-ink">
            {markdown}
          </pre>
        </Card>
      </div>
    </>
  );
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = resolveRange(params.range);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-10 sm:py-12">
      <header className="mb-7">
        <p className="page-eyebrow">INature UK</p>
        <h1 className="page-title mt-2">Monthly report</h1>
        <p className="page-standfirst mt-3">
          The report the service agreement asks for each month, built from
          Shopify orders, Google Analytics, Search Console and the blog for{" "}
          {rangeLabel(range).toLowerCase()} ending today. Sections 1 to 3 are
          measured; 4 to 6 are written by you. A source that cannot be read
          leaves a sentence saying so in its section, never a made-up figure.
        </p>
        <hr className="rule-soft mt-6" />
      </header>

      <div className="flex flex-wrap items-baseline justify-between gap-x-4">
        <RangeTabs basePath="/report" active={range} />
        <p className="mb-6 text-xs text-muted">
          Rolling window ending today, not a calendar month.
        </p>
      </div>

      <Suspense
        fallback={
          <div className="grid gap-5">
            <CardSkeleton title="What is in it" lines={6} />
            <CardSkeleton title="Report text" lines={8} />
          </div>
        }
      >
        <ReportBody range={range} />
      </Suspense>
    </main>
  );
}
