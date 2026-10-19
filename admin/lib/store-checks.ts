import type { AuditProduct, DiscountCode } from "./types";

/**
 * Checks that read the store and report what has gone quietly wrong.
 *
 * The panel already reports: orders, revenue, rankings, draft counts. Reporting
 * answers "how are we doing". It does not answer "has something broken", and in
 * this store the second question is the one that kept going unanswered.
 *
 * Every fault these checks look for is one that actually happened here and sat
 * unnoticed. A shampoo was listed at 275ml for months and was caught by eye, by
 * the client, not by any system. A gel is still listed at a volume its own
 * shipping weight says it cannot hold. Twenty named discount codes sit active
 * with no end date, no usage cap, no per-customer cap and no minimum basket,
 * the largest at 50% off. Not one product in the catalogue carries a barcode.
 *
 * None of that showed up in a report, because a report shows totals and these
 * are absences. So the checks here count absences and impossibilities.
 *
 * Design rules, learned from `blog-health.ts`:
 *  - Pure functions over data already fetched. No I/O, so they stay testable.
 *  - A finding names the product or code, not just a count. A number nobody can
 *    act on is a number nobody acts on.
 *  - Every check states what to do. "12 products have no barcode" is a fact;
 *    "ask the manufacturer for the EAN list" is a next step.
 *  - A check that cannot run says so rather than reporting zero, because zero
 *    findings and zero coverage look identical on a dashboard and mean the
 *    opposite.
 */

export type Severity = "high" | "medium" | "low";

export interface Finding {
  /** Stable key for React lists. */
  id: string;
  /** The item at fault, as a person would name it. */
  subject: string;
  /** What is wrong with it, specifically and with the numbers. */
  detail: string;
}

export interface CheckResult {
  key: string;
  title: string;
  severity: Severity;
  /** Why this matters, in one sentence. Shown only when there are findings. */
  why: string;
  /** What to do about it. */
  action: string;
  findings: Finding[];
  /**
   * Items the check could not judge, with the reason. Kept apart from findings:
   * these are gaps in coverage, not faults in the store.
   */
  skipped: string | null;
}

// ---------------------------------------------------------------------------
// Stated size against shipping weight
// ---------------------------------------------------------------------------

/**
 * A product's shipping weight has to be at least its stated contents.
 *
 * Cosmetic formulations sit around 0.9 to 1.1 g per ml, and then there is a
 * bottle, a cap and a carton on top. Across this catalogue the ratio of grams
 * to stated millilitres runs from 1.13 to 2.00. A product below 1.0 is not
 * merely unusual, it is claiming to hold more than the parcel weighs.
 *
 * The threshold sits slightly under 1.0 so a light oil in a thin sachet cannot
 * trip it on physics alone. Anything that still fails is a typo somewhere: the
 * volume in the title, or the weight on the variant.
 *
 * The check cannot say which of the two is wrong, and deliberately does not
 * guess. It reports the contradiction and leaves the packaging to settle it.
 */
const MIN_WEIGHT_RATIO = 0.9;

/** Matches a trailing size in a product title: "... 150ml", "... 9.5g". */
const SIZE_IN_TITLE = /(\d+(?:\.\d+)?)\s*(ml|g|gr)\b/i;

interface StatedSize {
  amount: number;
  unit: string;
}

function statedSize(title: string): StatedSize | null {
  const match = SIZE_IN_TITLE.exec(title);
  if (match === null) return null;
  const amount = Number(match[1]);
  if (!Number.isFinite(amount) || amount <= 0) return null;
  return { amount, unit: match[2].toLowerCase() === "ml" ? "ml" : "g" };
}

export function checkStatedSize(products: AuditProduct[]): CheckResult {
  const findings: Finding[] = [];
  let unweighed = 0;
  let unsized = 0;

  for (const product of products) {
    const size = statedSize(product.title);
    if (size === null) {
      unsized += 1;
      continue;
    }

    // One variant per product throughout this catalogue; where there are more,
    // the heaviest is the fair comparison against a single stated size.
    const weights = product.variants
      .map((variant) => variant.grams)
      .filter((grams): grams is number => grams !== null);

    if (weights.length === 0) {
      unweighed += 1;
      continue;
    }

    const grams = Math.max(...weights);
    const ratio = grams / size.amount;
    if (ratio >= MIN_WEIGHT_RATIO) continue;

    findings.push({
      id: product.id,
      subject: product.title,
      detail:
        `States ${formatNumber(size.amount)}${size.unit} but ships at ` +
        `${formatNumber(grams)}g. Contents alone would weigh about ` +
        `${formatNumber(size.amount)}g, so one of the two figures is wrong.`,
    });
  }

  const notes: string[] = [];
  if (unsized > 0) {
    notes.push(
      `${unsized} ${plural(unsized, "product", "products")} state no size in the title`,
    );
  }
  if (unweighed > 0) {
    notes.push(
      `${unweighed} have no shipping weight set`,
    );
  }

  return {
    key: "stated-size",
    title: "Stated size against shipping weight",
    severity: "high",
    why:
      "A size in the title is a promise about what arrives. If it is wrong the " +
      "shopper receives less than they paid for, and nobody notices until one of " +
      "them writes in.",
    action:
      "Check the figure printed on the packaging, then correct whichever of the " +
      "two is wrong: the size in the product title, or the variant weight.",
    findings,
    skipped: notes.length > 0 ? `${notes.join(", ")}, so they were not checked.` : null,
  };
}

// ---------------------------------------------------------------------------
// Barcodes
// ---------------------------------------------------------------------------

/**
 * Branded goods carry a manufacturer barcode and selling channels expect it.
 *
 * Google treats the barcode as the identity of the product: without it a
 * listing is matched on guesswork, which costs visibility in the free product
 * listings and, in some categories, the listing outright. Marketplaces ask for
 * the same number.
 *
 * The number cannot be invented. It belongs to the manufacturer and a wrong one
 * is worse than a blank, so the action is always to ask the manufacturer.
 */
export function checkBarcodes(products: AuditProduct[]): CheckResult {
  const findings: Finding[] = [];

  for (const product of products) {
    const missing = product.variants.filter(
      (variant) => variant.barcode.trim().length === 0,
    );
    if (missing.length === 0) continue;

    findings.push({
      id: product.id,
      subject: product.title,
      detail:
        missing.length === product.variants.length
          ? "No barcode on any variant."
          : `No barcode on ${missing.length} of ${product.variants.length} variants.`,
    });
  }

  return {
    key: "barcodes",
    title: "Missing barcodes",
    severity: findings.length > products.length / 2 ? "medium" : "low",
    why:
      "Google Shopping and the marketplaces identify a product by its barcode. " +
      "Without one a listing is matched on guesswork, or not shown at all.",
    action:
      "Ask the manufacturer for the barcode list, the 13 digits printed under " +
      "the barcode on the packaging. The number cannot be made up: a wrong one " +
      "gets the product rejected, which is worse than leaving it blank.",
    findings,
    skipped: null,
  };
}

// ---------------------------------------------------------------------------
// Discount code guards
// ---------------------------------------------------------------------------

/**
 * A discount code needs a boundary, and these have none.
 *
 * Four things keep a code from running away: an end date, a cap on total uses,
 * a cap per customer, and a minimum basket. A code missing all four can be
 * posted to a voucher site and used without limit, forever, on a single cheap
 * item. The store currently has twenty such codes, the largest at 50% off.
 *
 * One missing guard is a choice. All four missing is an oversight, so the check
 * reports how many are absent rather than flagging each one separately.
 *
 * Only active codes are judged. An expired code cannot be redeemed whatever its
 * settings say, and including them would bury the live ones.
 */
const GUARD_THRESHOLD = 3;

export function checkDiscountGuards(codes: DiscountCode[]): CheckResult {
  const active = codes.filter((code) => code.status === "ACTIVE");
  const findings: Finding[] = [];

  for (const code of active) {
    const missing: string[] = [];
    if (code.endsAt === null) missing.push("no end date");
    if (code.usageLimit === null) missing.push("no total limit");
    if (!code.appliesOncePerCustomer) missing.push("no per-customer limit");
    if (code.minimumSubtotal === null) missing.push("no minimum basket");

    if (missing.length < GUARD_THRESHOLD) continue;

    findings.push({
      id: code.id,
      subject: code.title,
      detail: `${formatDiscount(code)}, used ${code.usageCount} ${plural(
        code.usageCount,
        "time",
        "times",
      )}. Missing: ${missing.join(", ")}.`,
    });
  }

  // Worst first: a 50% code with no guards matters more than a 10% one, so the
  // list is ordered by what a single redemption costs, not by name.
  const cost = new Map(active.map((code) => [code.id, discountCost(code)]));
  findings.sort(
    (a, b) =>
      (cost.get(b.id) ?? 0) - (cost.get(a.id) ?? 0) ||
      a.subject.localeCompare(b.subject),
  );

  return {
    key: "discount-guards",
    title: "Discount codes without limits",
    severity: "high",
    why:
      "A code with no end date, no usage cap and no minimum basket can be " +
      "shared publicly and redeemed without limit on a single cheap item.",
    action:
      "For each code decide whether it was meant for one person or a group, " +
      "then set an end date and the matching usage limits. Leave a code alone " +
      "if you are not sure who it was for.",
    findings,
    skipped:
      active.length === 0
        ? "No active codes were returned, so nothing could be checked."
        : `${active.length} of ${codes.length} codes are active; only those were checked.`,
  };
}

// ---------------------------------------------------------------------------
// Search description
// ---------------------------------------------------------------------------

/**
 * The line a search engine shows under the product's name in results.
 *
 * Left blank, the search engine writes its own from whatever text it finds on
 * the page, which is usually the opening of the description and rarely the
 * sentence that would make someone click. This is low severity because the page
 * still ranks either way; it is the click that suffers.
 */
export function checkSearchDescriptions(products: AuditProduct[]): CheckResult {
  const findings: Finding[] = products
    .filter((product) => product.metaDescription.trim().length === 0)
    .map((product) => ({
      id: product.id,
      subject: product.title,
      detail: "No search description set.",
    }));

  return {
    key: "search-descriptions",
    title: "Products with no search description",
    severity: "low",
    why:
      "Without one, the search engine writes the line under your product name " +
      "itself, usually from the first sentence it finds.",
    action:
      "Add a search description on the product page. One sentence naming what " +
      "the product is and who it suits.",
    findings,
    skipped: null,
  };
}

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

export interface ChecksSummary {
  /** Checks that produced at least one finding. */
  failing: number;
  /** Findings across every check. */
  total: number;
  /** Findings from high-severity checks only. */
  high: number;
}

export function summarise(results: CheckResult[]): ChecksSummary {
  const withFindings = results.filter((result) => result.findings.length > 0);
  return {
    failing: withFindings.length,
    total: withFindings.reduce((sum, result) => sum + result.findings.length, 0),
    high: withFindings
      .filter((result) => result.severity === "high")
      .reduce((sum, result) => sum + result.findings.length, 0),
  };
}

/** One line for the dashboard card, in the register `blogHealthMessage` uses. */
export function checksMessage(summary: ChecksSummary): string {
  if (summary.total === 0) return "Nothing needs attention.";

  const items = `${summary.total} ${plural(summary.total, "thing", "things")}`;
  const across = `${summary.failing} ${plural(summary.failing, "check", "checks")}`;
  if (summary.high === 0) return `${items} to look at, across ${across}.`;
  return `${items} to look at, ${summary.high} needing attention first.`;
}

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

function plural(count: number, one: string, many: string): string {
  return count === 1 ? one : many;
}

/** Drops the trailing zeros a stated size never has: 150, not 150.0. */
function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(1)));
}

/**
 * Rough cost of one redemption, used only to order the list worst-first.
 *
 * A percentage has no cost until it meets a basket, so it is scored against the
 * store's average order rather than left unranked. The figure is not shown
 * anywhere and does not need to be exact, it only needs to put 50% above 10%
 * and a £10 fixed code somewhere sensible between them.
 */
const TYPICAL_BASKET = 25;

function discountCost(code: DiscountCode): number {
  if (code.percentage !== null) return code.percentage * TYPICAL_BASKET;
  if (code.fixedAmount !== null) return code.fixedAmount;
  return 0;
}

function formatDiscount(code: DiscountCode): string {
  if (code.percentage !== null) return `${Math.round(code.percentage * 100)}% off`;
  if (code.fixedAmount !== null) return `£${code.fixedAmount.toFixed(2)} off`;
  return "Discount";
}
