import type { SalesSummary } from "./sales";
import type { AnalyticsSummary } from "./google";
import type { BlogHealth } from "./blog-health";
import type { SeoMeasurement } from "./seo-measure";
import {
  addDays,
  relativeChange,
  WINDOW_DAYS,
  LOW_VOLUME_IMPRESSIONS,
  type ChangeMeasurement,
  type Comparison,
  type ProductLogState,
} from "./seo-changes";

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
  /**
   * The SEO change log and its measurement. Omitted leaves the subsection
   * out; a null part prints a sentence saying that part could not be read.
   */
  seo?: SeoReportInput | null;
  /** Report date; injected so the output is deterministic in tests. */
  now?: Date;
}

export interface SeoReportInput {
  /** False when `data/seo-changes.json` did not validate. */
  logValid: boolean;
  measurement: SeoMeasurement | null;
  state: ProductLogState[] | null;
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

  // Search Console bu pencerede hic satir dondurmediyse rakamlar "0" degil,
  // "henuz veri yok" demektir. Sifir basmak musteriye olculmus bir basarisizlik
  // gibi okunur; olculmemis olan olculmemis diye yazilir.
  if (analytics.gsc.noDataInRange) {
    const through = analytics.gsc.dataThrough;
    return [
      through
        ? `Search Console bu pencere için henüz veri yayınlamadı. Google'ın yayınladığı son gün: ${through}. Rakamlar birkaç gün gecikmeyle gelir, bu yüzden bu bölüm bir sonraki raporda dolacaktır.`
        : "Search Console bu mülk için henüz veri yayınlamadı. Yeni doğrulanan mülklerde ilk veri birkaç gün sonra görünmeye başlar.",
    ];
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

/** "2026-11-26" -> "26 Kasım 2026", read as a calendar day, not a moment. */
function trDay(iso: string): string {
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${iso}T00:00:00Z`));
}

/** "%12 artış", "%8 düşüş", "değişmedi", or "sıfırdan" with no base. */
function trChange(before: number, after: number): string {
  if (before === 0 && after === 0) return "iki dönemde de yok";
  const change = relativeChange(before, after);
  if (change === null) return "sıfırdan";
  const rounded = Math.round(change * 100);
  if (rounded === 0) return "değişmedi";
  return `%${Math.abs(rounded)} ${rounded > 0 ? "artış" : "düşüş"}`;
}

function trPosition(before: number | null, after: number | null): string {
  if (before === null || after === null) return "ölçülemedi";
  const moved = before - after;
  if (Math.abs(moved) < 0.05) return `${after.toFixed(1)}, değişmedi`;
  return `${before.toFixed(1)} → ${after.toFixed(1)} (${Math.abs(moved).toFixed(1)} sıra ${moved > 0 ? "yukarı" : "aşağı"})`;
}

function seoResultLines(entry: ChangeMeasurement): string[] {
  const long = entry.stage.kind === "twelve-week" ? entry.long.figures : null;
  const figures: Comparison | null = long ?? entry.short.figures;
  const days = long ? 84 : WINDOW_DAYS;
  if (!figures || !figures.page.after || !figures.control.after) return [];

  const { page, control } = figures;
  const after = page.after!;
  const controlAfter = control.after!;
  const lines = [
    `- **${entry.change.product}** (${trDay(entry.change.date)} değişikliği, ${days} gün önce ve sonra): ` +
      `gösterim ${int(page.before.impressions)} → ${int(after.impressions)} (${trChange(page.before.impressions, after.impressions)}), ` +
      `tıklama ${int(page.before.clicks)} → ${int(after.clicks)} (${trChange(page.before.clicks, after.clicks)}), ` +
      `tıklama oranı %${(page.before.ctr * 100).toFixed(1)} → %${(after.ctr * 100).toFixed(1)}, ` +
      `ortalama sıra ${trPosition(page.before.position, after.position)}.`,
    `  Değiştirilmeyen ürün sayfaları aynı dönemde: gösterim ${trChange(control.before.impressions, controlAfter.impressions)}, ` +
      `tıklama ${trChange(control.before.clicks, controlAfter.clicks)}.`,
  ];
  if (figures.lowVolume) {
    lines.push(
      `  Dönemlerden birinde gösterim ${LOW_VOLUME_IMPRESSIONS}'ün altında; bu fark tesadüf olabilir, sonuç değil yön olarak okunmalı.`,
    );
  }
  return lines;
}

function seoWaitingLines(entry: ChangeMeasurement): string[] {
  const { change, stage } = entry;
  if (stage.kind === "superseded") {
    return [
      `- ${change.product} (${trDay(change.date)}): ${trDay(stage.byDate)} tarihindeki yeni değişiklik ilk 28 güne denk geldiği için bu değişiklik ayrıca ölçülmüyor, ölçüm yeniden başladı.`,
    ];
  }
  if (stage.kind === "collecting") {
    return [
      `- ${change.product} (${trDay(change.date)}): ${stage.days}/${WINDOW_DAYS} gün yayınlandı. Pencere ${trDay(stage.windowEnds)} tarihinde kapanıyor, Google verisi birkaç gün gecikmeli geldiği için sonuç yaklaşık ${trDay(addDays(stage.windowEnds, 5))} sonrasında okunabilir.`,
    ];
  }
  return [];
}

/**
 * The SEO subsection of section 3.
 *
 * Three headings the client asked for by name: progress (complete windows
 * only, always beside the unchanged pages), not enough data yet, and the next
 * step. An empty heading says so in a sentence instead of disappearing, so
 * "nothing ready yet" cannot be mistaken for "nothing was done".
 */
function seoSection(seo: SeoReportInput): string[] {
  const lines = [
    "### SEO değişiklikleri",
    "",
    "Panelde: **SEO** sekmesi (/seo). Her değişikliğin ne, neden ve ne zaman yapıldığı, önceki ve sonraki metinle birlikte orada.",
    "",
  ];

  if (!seo.logValid) {
    return [...lines, "Değişiklik kaydı okunamadı, bu bölüm bu rapor için hazırlanamadı."];
  }

  const measurement = seo.measurement;
  const entries =
    measurement && measurement.configured ? measurement.entries : [];

  lines.push("**İlerleme**", "");
  if (measurement === null) {
    lines.push("- Search Console verisi çekilemedi. Değişiklik kaydı panelde eksiksiz duruyor, rakamlar bir sonraki raporda.");
  } else if (!measurement.configured) {
    lines.push("- Search Console panele bağlı değil, bu yüzden değişiklikler ölçülemiyor.");
  } else {
    const ready = entries.flatMap(seoResultLines);
    lines.push(
      ...(ready.length > 0 ? ready : ["- Henüz 4 haftası dolan değişiklik yok."]),
    );
  }

  lines.push("", "**Yeterli veri yok**", "");
  const waiting = entries.flatMap(seoWaitingLines);
  lines.push(
    ...(waiting.length > 0
      ? waiting
      : measurement?.configured
        ? ["- Bekleyen değişiklik yok."]
        : ["- Ölçüm yapılamadığı için durum gösterilemiyor."]),
  );

  lines.push("", "**Sonraki adım**", "");
  if (seo.state === null) {
    lines.push("- Ürünlerin canlı SEO metni Shopify'dan okunamadı, sonraki değişiklik tarihleri panelde.");
    return lines;
  }
  const byDate = new Map<string, string[]>();
  for (const row of seo.state) {
    byDate.set(row.nextEligible, [...(byDate.get(row.nextEligible) ?? []), row.product]);
  }
  for (const [date, products] of [...byDate].sort(([a], [b]) => a.localeCompare(b))) {
    lines.push(`- ${trDay(date)} itibarıyla yeniden değiştirilebilir: ${products.join(", ")}.`);
  }
  for (const row of seo.state) {
    if (!row.found) {
      lines.push(`- Uyarı: ${row.product} artık aktif ürünler arasında görünmüyor.`);
    }
    for (const d of row.drift) {
      lines.push(
        `- Uyarı: ${row.product} ürününün canlı ${d.field === "title" ? "SEO başlığı" : "meta açıklaması"} kayıttaki metinden farklı. Kayda girmeyen değişiklik ölçümü bozar, kayda eklenmeli ya da geri alınmalı.`,
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
  const { rangeDays, sales, analytics, blog, seo } = input;

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
    ...(seo ? [...seoSection(seo), ""] : []),
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
