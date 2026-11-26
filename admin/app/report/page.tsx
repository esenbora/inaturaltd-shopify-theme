import { Suspense } from "react";
import { getSalesSummary } from "@/lib/sales";
import { getAnalyticsSummary } from "@/lib/google";
import { listArticles } from "@/lib/shopify";
import { assessBlogHealth } from "@/lib/blog-health";
import { buildMonthlyReport, type SeoReportInput } from "@/lib/monthly-report";
import { seoLogStateMetrics, seoMeasurementMetrics } from "@/lib/metrics";
import { readSeoLog } from "@/lib/seo-changes";
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
  /** "3a" for a subsection, printed under its parent. */
  number: string;
  sub?: boolean;
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
  const [
    salesResult,
    analyticsResult,
    articlesResult,
    seoMeasurementResult,
    seoStateResult,
  ] = await Promise.allSettled([
    getSalesSummary(range),
    getAnalyticsSummary(range),
    listArticles(),
    seoMeasurementMetrics(),
    seoLogStateMetrics(),
  ]);

  const sales = salesResult.status === "fulfilled" ? salesResult.value : null;
  const analytics =
    analyticsResult.status === "fulfilled" ? analyticsResult.value : null;
  const blog =
    articlesResult.status === "fulfilled"
      ? assessBlogHealth(articlesResult.value)
      : null;

  let logValid = true;
  try {
    readSeoLog();
  } catch {
    logValid = false;
  }
  const seo: SeoReportInput = {
    logValid,
    measurement:
      seoMeasurementResult.status === "fulfilled"
        ? seoMeasurementResult.value.value
        : null,
    state:
      seoStateResult.status === "fulfilled" ? seoStateResult.value.value : null,
  };
  const seoReady =
    seo.measurement?.configured === true
      ? seo.measurement.entries.filter(
          (e) => e.stage.kind === "four-week" || e.stage.kind === "twelve-week",
        ).length
      : 0;
  const seoDrift =
    seo.state?.filter((row) => !row.found || row.drift.length > 0).length ?? 0;

  const markdown = buildMonthlyReport({
    rangeDays: range,
    sales,
    analytics,
    blog,
    seo,
  });

  const sections: Section[] = [
    {
      number: "1",
      title: "Satış",
      source: "Shopify orders",
      status: sales ? "filled" : "missing",
      label: sales ? "Filled" : "Not reachable",
      note: sales
        ? "Orders, revenue, average order, channels and abandoned baskets."
        : "Shopify could not be read. The report says so in this section instead of showing a number.",
    },
    {
      number: "2",
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
      number: "3",
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
      number: "3a",
      sub: true,
      title: "SEO değişiklikleri",
      source: "Change log + Search Console",
      ...(!seo.logValid
        ? {
            status: "missing" as const,
            label: "Log invalid",
            note: "data/seo-changes.json does not validate, so the report says the subsection could not be prepared.",
          }
        : seo.measurement === null
          ? {
              status: "partial" as const,
              label: "Figures missing",
              note: "Search Console could not be read. The report says so under İlerleme; next-change dates still fill in.",
            }
          : !seo.measurement.configured
            ? {
                status: "partial" as const,
                label: "Not connected",
                note: "Search Console is not connected, so no change is measured. The report states that.",
              }
            : seoDrift > 0
              ? {
                  status: "partial" as const,
                  label: "Check warnings",
                  note: `${seoDrift} product${seoDrift === 1 ? "" : "s"} changed outside the log or no longer active. The report prints the warning under Sonraki adım; check it before sending.`,
                }
              : {
                  status: "filled" as const,
                  label: "Filled",
                  note:
                    seoReady > 0
                      ? `${seoReady} change${seoReady === 1 ? "" : "s"} with a complete result beside the unchanged pages, the rest with their expected dates, and when each product can change next.`
                      : "No change has completed its 28 days yet. The report says so, gives each one's expected date and when each product can change next.",
                }),
    },
    {
      number: "4",
      title: "Yapılan işler",
      source: "Written by you",
      status: "yours",
      label: "Yours to write",
      note: "Work completed in the period. Left as a prompt, because the panel cannot know it.",
    },
    {
      number: "5",
      title: "Bekleyen konular",
      source: "Shopify blog",
      status: blog ? "partial" : "missing",
      label: blog ? "Part filled" : "Not reachable",
      note: blog
        ? "Blog drafts awaiting a decision and a stalled blog schedule fill in. Anything you are waiting on from the client is yours to add."
        : "The blog could not be read, so only the prompt for client items appears.",
    },
    {
      number: "6",
      title: "Sıradaki öncelikler",
      source: "Written by you",
      status: "yours",
      label: "Yours to write",
      note: "Priorities for the next period. Left as a prompt.",
    },
  ];

  const main = sections.filter((s) => !s.sub);
  const ready = main.filter((s) => s.status === "filled").length;

  return (
    <>
      <Card
        title="What is in it"
        tone={
          sections.some((s) => s.status === "missing" || s.status === "partial")
            ? "attention"
            : "calm"
        }
        description={`${ready} of ${main.length} sections filled from live figures. The report is in Turkish because that is the language it is delivered in; the section names below are the headings it prints.`}
      >
        <ol className="divide-y divide-line/70">
          {sections.map((s) => (
            <li
              key={s.number}
              className="grid gap-x-4 gap-y-1.5 py-3 first:pt-0 last:pb-0 sm:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_auto] sm:items-baseline"
            >
              <p
                className={`text-sm font-medium text-ink ${s.sub ? "pl-5" : ""}`}
              >
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
