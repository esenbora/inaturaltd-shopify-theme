/**
 * Search Console "striking distance" report.
 *
 * Lists the queries sitting between positions 8 and 20, where a small ranking
 * lift converts into real clicks, and groups them by the page that ranks. Run it
 * before and after a page edit to see whether the edit moved anything.
 *
 * Needs GOOGLE_SERVICE_ACCOUNT_JSON and GSC_SITE_URL, which live on the
 * inature-admin Railway service:
 *
 *   cd admin && railway run --service inature-admin node ../scripts/gsc-striking.mjs 28
 *
 * The trailing number is the window in days (default 28).
 */
import crypto from "node:crypto";

function loadAccount(raw) {
  const s = (raw || "").trim();
  try {
    // The env holds either raw JSON or base64-encoded JSON. Decode without ever
    // echoing it: an unguarded JSON.parse would print the private key on failure.
    return JSON.parse(s.startsWith("{") ? s : Buffer.from(s, "base64").toString("utf8"));
  } catch {
    throw new Error("service account env could not be parsed (value withheld)");
  }
}

const acct = loadAccount(process.env.GOOGLE_SERVICE_ACCOUNT_JSON);
const SITE = process.env.GSC_SITE_URL;
const DAYS = Number(process.argv[2] || 28);
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
  const j = await r.json();
  if (!j.access_token) throw new Error("token request failed");
  return j.access_token;
}

const iso = (d) => d.toISOString().slice(0, 10);
// Search Console finalises data on a lag, so end two days back.
const end = new Date(Date.now() - 2 * 864e5);
const start = new Date(end.getTime() - DAYS * 864e5);

const t = await token("https://www.googleapis.com/auth/webmasters.readonly");

async function query(dimensions) {
  const r = await fetch(
    `https://searchconsole.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`,
    {
      method: "POST",
      headers: { Authorization: `Bearer ${t}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        startDate: iso(start), endDate: iso(end),
        dimensions, rowLimit: 500, dataState: "final",
      }),
    },
  );
  const j = await r.json();
  if (j.error) throw new Error(JSON.stringify(j.error).slice(0, 200));
  return j.rows || [];
}

console.log(`site: ${SITE}`);
console.log(`window: ${iso(start)} to ${iso(end)} (${DAYS} days)\n`);

const rows = await query(["query"]);
const tot = rows.reduce((a, r) => ({ i: a.i + r.impressions, c: a.c + r.clicks }), { i: 0, c: 0 });
console.log(`TOTAL: ${rows.length} queries | ${tot.i} impressions | ${tot.c} clicks\n`);

const band = (lo, hi) => rows.filter((r) => r.position >= lo && r.position < hi);
console.log("=== POSITION SPREAD ===");
for (const [lo, hi, label] of [
  [1, 4, "1-3 (most clicks land here)"],
  [4, 8, "4-7"],
  [8, 11, "8-10   <- target"],
  [11, 21, "11-20  <- target"],
  [21, 101, "21+"],
]) {
  const b = band(lo, hi);
  const imp = b.reduce((a, r) => a + r.impressions, 0);
  const clk = b.reduce((a, r) => a + r.clicks, 0);
  console.log(`  ${label.padEnd(28)} ${String(b.length).padStart(3)} q | ${String(imp).padStart(4)} imp | ${clk} clicks`);
}

const strike = band(8, 21).sort((a, b) => b.impressions - a.impressions);
console.log(`\n=== QUERIES IN 8-20 (${strike.length}, top 22) ===`);
console.log("  imp  clk    pos   ctr    query");
for (const r of strike.slice(0, 22)) {
  console.log(`  ${String(r.impressions).padStart(3)}  ${String(r.clicks).padStart(3)}  ${r.position.toFixed(1).padStart(5)}  ${(r.ctr * 100).toFixed(1).padStart(4)}%  ${r.keys[0]}`);
}

const qp = await query(["query", "page"]);
const map = new Map();
for (const r of qp) {
  if (r.position < 8 || r.position >= 21) continue;
  const page = r.keys[1];
  if (!map.has(page)) map.set(page, { imp: 0, clicks: 0, qs: [] });
  const e = map.get(page);
  e.imp += r.impressions;
  e.clicks += r.clicks;
  e.qs.push({ q: r.keys[0], i: r.impressions, p: r.position });
}
const pages = [...map.entries()].sort((a, b) => b[1].imp - a[1].imp);
console.log(`\n=== WHICH PAGE TO FIX (${pages.length} pages in the band) ===`);
for (const [page, e] of pages) {
  console.log(`\n  ${page.replace("https://inatureltd.co.uk", "")}`);
  console.log(`    ${e.imp} imp / ${e.clicks} clicks`);
  for (const q of e.qs.sort((a, b) => b.i - a.i).slice(0, 6)) {
    console.log(`      pos ${q.p.toFixed(1).padStart(4)} | ${String(q.i).padStart(2)} imp | ${q.q}`);
  }
}
