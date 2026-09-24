/**
 * Search Console'a yeniden tarama sinyali gonderir ve sonucu dogrular.
 *
 * NE YAPAR, NE YAPMAZ. Google'in "bu URL'yi yeniden tara" dugmesinin API
 * karsiligi YOKTUR. URL Inspection API yalnizca okur; indeksleme talebi
 * Search Console arayuzunden, elle, URL basina yapilir. Bu script bu
 * yuzden iki ise yarar:
 *
 *   1. sitemaps.submit - sitemap'i yeniden bildirir. Google'in kabul
 *      ettigi tek programatik "yeniden bak" sinyali budur.
 *      (google.com/ping?sitemap= 2023'te kaldirildi, kullanilmiyor.)
 *   2. urlInspection - onemli sayfalarin gercekte ne durumda oldugunu
 *      okur: indekste mi, en son ne zaman tarandi, Google'in gordugu
 *      surum bizim yayinladigimiz mi.
 *
 * Ikincisi asil degerli olan: sitemap gonderdikten sonra "oldu" demek
 * yerine, Google'in sayfayi ne zaman ve hangi haliyle gordugunu
 * soyler. Elle indeksleme istenecek URL'leri de buradan secersiniz.
 *
 * Calistirma (kimlik bilgileri Railway'de):
 *   railway run --service inature-admin node scripts/gsc-recrawl.mjs
 *   railway run --service inature-admin node scripts/gsc-recrawl.mjs --dry-run
 *
 * GOOGLE_SERVICE_ACCOUNT_JSON ve GSC_SITE_URL gerekir. Servis hesabinin
 * sitemap gonderebilmesi icin GSC'de en az "Full" izni olmali; yalnizca
 * okuma izni varsa submit 403 doner ve script bunu acikca yazar.
 */
import crypto from "node:crypto";

const DRY = process.argv.includes("--dry-run");

function loadAccount(raw) {
  const s = (raw || "").trim();
  try {
    // Env ya ham JSON ya base64. Hata mesajinda degeri ASLA yazdirma:
    // korumasiz bir JSON.parse private key'i log'a dusurur.
    return JSON.parse(s.startsWith("{") ? s : Buffer.from(s, "base64").toString("utf8"));
  } catch {
    throw new Error("service account env cozulemedi (deger gizlendi)");
  }
}

const acct = loadAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const SITE = process.env.GSC_SITE_URL;
if (!SITE) throw new Error("GSC_SITE_URL tanimli degil");

const b64u = (s) => Buffer.from(s).toString("base64url");

async function token(scope) {
  const now = Math.floor(Date.now() / 1000);
  const header = b64u(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64u(JSON.stringify({
    iss: acct.client_email, scope, aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600, iat: now,
  }));
  const sig = crypto.createSign("RSA-SHA256").update(`${header}.${claim}`)
    .sign(acct.private_key.replace(/\\n/g, "\n")).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${header}.${claim}.${sig}`,
    }),
  });
  if (!r.ok) throw new Error(`token alinamadi: ${r.status}`);
  return (await r.json()).access_token;
}

async function api(tok, url, init = {}) {
  const r = await fetch(url, { ...init, headers: { Authorization: `Bearer ${tok}`, ...(init.headers || {}) } });
  const govde = await r.text();
  let json = null;
  try { json = govde ? JSON.parse(govde) : null; } catch { /* submit bos govde doner */ }
  return { ok: r.ok, status: r.status, json, govde: govde.slice(0, 300) };
}

// Google'in once gormesini istedigimiz sayfalar: bu surumde degisen ve
// degisikligi arama sonucunda gorunecek olanlar.
const ONEMLI = [
  "/",
  "/collections/all",
  "/collections/bundles-sets",
  "/collections/sale",
  "/collections/bestsellers-1",
  "/pages/review-reward",
  "/products/incia-natural-foaming-hand-soap-for-kids",
  "/products/personalised-baby-towel-bear-100-cotton-newborn-gift-uk",
];

const kok = SITE.startsWith("sc-domain:") ? "https://inatureltd.co.uk" : SITE.replace(/\/$/, "");

const tok = await token("https://www.googleapis.com/auth/webmasters");
const enc = encodeURIComponent(SITE);

console.log(`site: ${SITE}`);

// 1. Izin seviyesi
const siteler = await api(tok, "https://searchconsole.googleapis.com/webmasters/v3/sites");
const bu = siteler.json?.siteEntry?.find((s) => s.siteUrl === SITE);
console.log(`izin: ${bu?.permissionLevel ?? "okunamadi"}\n`);

// 2. Mevcut sitemap durumu
const smListe = await api(tok, `https://searchconsole.googleapis.com/webmasters/v3/sites/${enc}/sitemaps`);
const mevcut = smListe.json?.sitemap ?? [];
console.log(`kayitli sitemap: ${mevcut.length}`);
for (const s of mevcut) {
  const gonderim = s.lastSubmitted ? s.lastSubmitted.slice(0, 10) : "-";
  const tarama = s.lastDownloaded ? s.lastDownloaded.slice(0, 10) : "hic indirilmedi";
  console.log(`  ${s.path}\n     gonderim ${gonderim} · Google en son indirdi: ${tarama}`);
}

// 3. Sitemap'i yeniden bildir
const sitemapUrl = `${kok}/sitemap.xml`;
if (DRY) {
  console.log(`\n--dry-run: ${sitemapUrl} gonderilmedi.`);
} else {
  const r = await api(tok, `https://searchconsole.googleapis.com/webmasters/v3/sites/${enc}/sitemaps/${encodeURIComponent(sitemapUrl)}`, { method: "PUT" });
  if (r.ok) console.log(`\n✓ sitemap yeniden bildirildi: ${sitemapUrl}`);
  else if (r.status === 403) console.log(`\n✗ sitemap gonderilemedi (403). Servis hesabinin GSC izni okuma duzeyinde; "Full" gerekiyor.`);
  else console.log(`\n✗ sitemap gonderilemedi: ${r.status} ${r.govde}`);
}

// 4. Google sayfalari ne zaman ve hangi haliyle gordu
console.log(`\nGoogle'in gordugu durum:`);
for (const yol of ONEMLI) {
  const url = kok + yol;
  const r = await api(tok, "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inspectionUrl: url, siteUrl: SITE }),
  });
  if (!r.ok) { console.log(`  ${yol}\n     sorgulanamadi (${r.status})`); continue; }
  const s = r.json?.inspectionResult?.indexStatusResult ?? {};
  const tarama = s.lastCrawlTime ? s.lastCrawlTime.slice(0, 10) : "hic taranmadi";
  console.log(`  ${yol}`);
  console.log(`     ${s.coverageState ?? "-"} · son tarama ${tarama} · robots: ${s.robotsTxtState ?? "-"}`);
}

console.log(`\nNot: kalan is elle yapilir. Search Console > URL Inspection'a`);
console.log(`yukaridaki URL'leri tek tek girip "Request indexing" demek,`);
console.log(`sitemap sinyalinden daha hizli sonuc verir. API'de karsiligi yok.`);
