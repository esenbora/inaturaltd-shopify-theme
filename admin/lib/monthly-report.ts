import type { SalesSummary } from "./sales";
import type { AnalyticsSummary } from "./google";
import type { BlogHealth } from "./blog-health";

/**
 * Builds the monthly report the service agreement requires (clause 2: sales,
 * traffic, search visibility, work done, pending items, next priorities).
 *
 * The first three sections come from data the panel already holds, so the
 * recurring half of the report writes itself. The last three are judgement and
 * stay as prompts for a human to fill in — a generated "work done" section
 * would be fiction.
 *
 * Output is Turkish markdown because that is the language the report is
 * delivered in, and markdown because it pastes cleanly into mail or a doc.
 *
 * Note on the fee: clause 7.3 measures Net Sales from Shopify's own reports on
 * the third business day after month end. These figures are for the narrative,
 * not the invoice, so a rolling window here does not conflict with it.
 */

export interface ReportInput {
  rangeDays: number;
  /** Null when the source could not be reached. */
  sales: SalesSummary | null;
  analytics: AnalyticsSummary | null;
  blog: BlogHealth | null;
  /** Report date; injected so the output is deterministic in tests. */
  now?: Date;
}

function money(n: number): string {
  return `£${n.toFixed(2)}`;
}

function int(n: number): string {
  return new Intl.NumberFormat("en-GB").format(Math.round(n));
}

function trDate(date: Date): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function salesSection(sales: SalesSummary | null): string[] {
  if (!sales) return ["Satış verisi bu rapor için çekilemedi."];

  const lines = [
    `- Sipariş: **${int(sales.orders)}**`,
    `- Ciro: **${money(sales.revenue)}**`,
    `- Ortalama sepet: **${money(sales.aov)}**`,
  ];

  if (sales.channels.length > 0) {
    lines.push("", "Kanal kırılımı:");
    for (const channel of sales.channels) {
      lines.push(`- ${channel.channel}: ${money(channel.revenue)}`);
    }
  }

  if (sales.abandoned.count > 0) {
    lines.push(
      "",
      `Terk edilmiş sepet: **${int(sales.abandoned.count)}** adet, **${money(sales.abandoned.value)}**. ` +
        `${int(sales.abandoned.withEmail)} tanesinin e-posta adresi elimizde.`,
    );
  }

  return lines;
}

function trafficSection(analytics: AnalyticsSummary | null): string[] {
  if (!analytics) return ["Analitik verisi bu rapor için çekilemedi."];
  if (!analytics.configured) {
    return ["Analitik entegrasyonu henüz yapılandırılmadı."];
  }
  if (!analytics.ga4) {
    return ["GA4 verisi çekilemedi."];
  }

  const { sessions, users, conversions } = analytics.ga4.totals;
  const lines = [
    `- Oturum: **${int(sessions)}**`,
    `- Kullanıcı: **${int(users)}**`,
    `- Dönüşüm: **${int(conversions)}**`,
  ];

  if (analytics.ga4.channels.length > 0) {
    lines.push("", "Trafik kaynağı:");
    for (const row of analytics.ga4.channels) {
      lines.push(`- ${row.channel}: ${int(row.sessions)} oturum`);
    }
  }

  return lines;
}

function searchSection(analytics: AnalyticsSummary | null): string[] {
  // "Not set up" and "set up but unreachable" are different facts, and the
  // client reads this. Do not collapse them into one excuse.
  if (!analytics) return ["Arama görünürlüğü verisi bu rapor için çekilemedi."];
  if (!analytics.configured) {
    return ["Analitik entegrasyonu henüz yapılandırılmadı."];
  }
  if (!analytics.gsc) {
    return ["Search Console verisi çekilemedi."];
  }

  const { clicks, impressions, ctr, position } = analytics.gsc.totals;
  const lines = [
    `- Tıklama: **${int(clicks)}**`,
    `- Gösterim: **${int(impressions)}**`,
    `- Tıklama oranı: **%${(ctr * 100).toFixed(1)}**`,
    `- Ortalama sıra: **${position.toFixed(1)}**`,
  ];

  if (analytics.gsc.topQueries.length > 0) {
    lines.push("", "En çok tıklanan sorgular:");
    for (const row of analytics.gsc.topQueries.slice(0, 5)) {
      lines.push(
        `- "${row.query}": ${int(row.clicks)} tıklama, sıra ${row.position.toFixed(1)}`,
      );
    }
  }

  return lines;
}

/** Items the panel can already see, so they are not left to memory. */
function pendingSection(blog: BlogHealth | null): string[] {
  const lines: string[] = [];

  if (blog && blog.pendingDrafts > 0) {
    lines.push(
      `- Onay bekleyen blog taslağı: **${blog.pendingDrafts}**. Yayın kararı Müşteri'ye ait.`,
    );
  }
  if (blog && blog.level === "stalled") {
    lines.push(
      `- Blog otomasyonundan **${blog.daysSinceNewest} gündür** yeni içerik gelmedi, haftalık koşu durmuş görünüyor.`,
    );
  } else if (blog && blog.level === "late") {
    lines.push(
      `- Blog otomasyonunda bir haftalık koşu atlanmış görünüyor (${blog.daysSinceNewest} gün).`,
    );
  }

  lines.push("- <!-- müşteriden beklenen bilgi/erişim varsa buraya -->");
  return lines;
}

export function buildMonthlyReport(input: ReportInput): string {
  const now = input.now ?? new Date();
  const { rangeDays, sales, analytics, blog } = input;

  const start = new Date(now.getTime() - rangeDays * 24 * 60 * 60 * 1000);
  const period = `${trDate(start)} – ${trDate(now)} (${rangeDays} gün)`;

  return [
    `# INature UK — Aylık Rapor`,
    "",
    `**Dönem:** ${period}`,
    `**Hazırlayan:** Stimilon LLC`,
    "",
    "---",
    "",
    "## 1. Satış",
    "",
    ...salesSection(sales),
    "",
    "## 2. Trafik",
    "",
    ...trafficSection(analytics),
    "",
    "## 3. Arama görünürlüğü",
    "",
    ...searchSection(analytics),
    "",
    "## 4. Yapılan işler",
    "",
    "<!-- bu dönemde tamamlanan işler -->",
    "",
    "## 5. Bekleyen konular",
    "",
    ...pendingSection(blog),
    "",
    "## 6. Sıradaki öncelikler",
    "",
    "<!-- gelecek dönemde yapılacaklar -->",
    "",
  ].join("\n");
}
