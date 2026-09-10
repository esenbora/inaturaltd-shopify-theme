import { getSalesSummary } from "@/lib/sales";
import { getAnalyticsSummary } from "@/lib/google";
import { listArticles } from "@/lib/shopify";
import { assessBlogHealth } from "@/lib/blog-health";
import { buildMonthlyReport } from "@/lib/monthly-report";
import { RangeTabs, rangeLabel, resolveRange } from "@/components/range-tabs";
import { CopyButton } from "@/components/copy-button";

export const metadata = {
  title: "Monthly report · INature Admin",
};

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ReportPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const range = resolveRange(params.range);

  // A missing source should thin the report, not fail the page.
  const [salesResult, analyticsResult, articlesResult] =
    await Promise.allSettled([
      getSalesSummary(range),
      getAnalyticsSummary(range),
      listArticles(),
    ]);

  const markdown = buildMonthlyReport({
    rangeDays: range,
    sales: salesResult.status === "fulfilled" ? salesResult.value : null,
    analytics:
      analyticsResult.status === "fulfilled" ? analyticsResult.value : null,
    blog:
      articlesResult.status === "fulfilled"
        ? assessBlogHealth(articlesResult.value)
        : null,
  });

  const missing = [
    salesResult.status === "rejected" ? "sales" : null,
    analyticsResult.status === "rejected" ? "analytics" : null,
    articlesResult.status === "rejected" ? "articles" : null,
  ].filter((name): name is string => name !== null);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="u-serif text-2xl font-semibold text-ink">
            Monthly report
          </h1>
          <p className="mt-1 text-sm text-muted">
            Sales, traffic and search figures for {rangeLabel(range)}, assembled
            ready to send. Sections 4 to 6 are yours to write.
          </p>
        </div>
        <CopyButton text={markdown} label="Copy markdown" />
      </div>

      <RangeTabs basePath="/report" active={range} />

      {missing.length > 0 && (
        <div
          className="mb-6 rounded-xl border border-terracotta/30 bg-terracotta/5 px-4 py-3 text-sm text-terracotta-dark"
          role="status"
        >
          Could not reach: {missing.join(", ")}. Those sections say so in the
          report rather than showing a wrong number.
        </div>
      )}

      <pre className="card overflow-x-auto whitespace-pre-wrap px-5 py-4 text-sm leading-relaxed text-ink">
        {markdown}
      </pre>
    </main>
  );
}
