import Link from "next/link";
import type { ReactNode } from "react";
import { listArticles } from "@/lib/shopify";
import { getSalesSummary } from "@/lib/sales";
import { assessBlogHealth, blogHealthMessage } from "@/lib/blog-health";

/**
 * Content dashboard.
 *
 * This page used to be four static links, so nothing about the store's state
 * was visible until you clicked into a section. Drafts piled up for a month
 * unnoticed that way. Each card now carries the one number you would act on.
 *
 * Only blog and sales get live figures. Search rankings and index coverage are
 * behind per-URL Google API calls that are slow and rate-limited, which is the
 * wrong cost to pay on a landing page — those stay plain links.
 */

export const dynamic = "force-dynamic";

// Matches the local helpers on the Sales and Analytics pages.
function money(n: number): string {
  return `£${n.toFixed(2)}`;
}

type Tone = "neutral" | "attention";

function SectionCard({
  href,
  title,
  description,
  stat,
  tone = "neutral",
}: {
  href: string;
  title: string;
  description: string;
  stat?: ReactNode;
  tone?: Tone;
}) {
  return (
    <Link
      href={href}
      className="card group flex flex-col p-6 transition-colors hover:border-sage/50"
    >
      <h2 className="u-serif text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      {stat && (
        <p
          className={`mt-4 text-sm font-medium ${
            tone === "attention" ? "text-terracotta-dark" : "text-ink"
          }`}
        >
          {stat}
        </p>
      )}
      <span className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-sage-dark transition-transform group-hover:translate-x-0.5">
        Open
        <span aria-hidden>&rarr;</span>
      </span>
    </Link>
  );
}

/** Shown in place of a figure when its source could not be reached. */
function Unavailable() {
  return <span className="text-muted">Figures unavailable right now.</span>;
}

export default async function Home() {
  // One failing source must not take the whole dashboard down with it.
  const [articlesResult, salesResult] = await Promise.allSettled([
    listArticles(),
    getSalesSummary(30),
  ]);

  let blogStat: ReactNode = <Unavailable />;
  let blogTone: Tone = "neutral";
  if (articlesResult.status === "fulfilled") {
    const articles = articlesResult.value;
    const health = assessBlogHealth(articles);
    if (health.pendingDrafts > 0 || health.level !== "ok") {
      blogStat = blogHealthMessage(health);
      blogTone = "attention";
    } else {
      blogStat = `${articles.length} articles published.`;
    }
  }

  let salesStat: ReactNode = <Unavailable />;
  let salesTone: Tone = "neutral";
  if (salesResult.status === "fulfilled") {
    const sales = salesResult.value;
    const headline = `${sales.orders} orders · ${money(sales.revenue)} in 30 days.`;
    if (sales.abandoned.count > 0) {
      salesStat = (
        <>
          {headline}{" "}
          <span className="block">
            {money(sales.abandoned.value)} left in {sales.abandoned.count}{" "}
            baskets, {sales.abandoned.withEmail} with an email address.
          </span>
        </>
      );
      salesTone = "attention";
    } else {
      salesStat = headline;
    }
  }

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-14">
      <header className="mb-10">
        <p className="text-sm font-medium text-terracotta">INature UK</p>
        <h1 className="u-serif mt-1 text-3xl font-semibold text-ink">
          Content dashboard
        </h1>
        <p className="mt-2 text-muted">
          Manage the storefront content for the INature UK Shopify store.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <SectionCard
          href="/articles"
          title="Blog articles"
          description="Write, edit and publish Shopify blog articles."
          stat={blogStat}
          tone={blogTone}
        />
        <SectionCard
          href="/sales"
          title="Sales"
          description="Orders, revenue, where they come from, and baskets left behind."
          stat={salesStat}
          tone={salesTone}
        />
        <SectionCard
          href="/products"
          title="Products"
          description="Edit product descriptions and manage product photos."
        />
        <SectionCard
          href="/analytics"
          title="Analytics"
          description="Search rankings and traffic from Search Console and GA4."
        />
      </div>
    </main>
  );
}
