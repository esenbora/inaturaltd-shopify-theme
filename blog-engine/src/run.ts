import "dotenv/config";
import { BlogGenerator } from "blog-automation";
import { PERMANENT_SYSTEM_PROMPT, buildTopicOverride } from "./prompt.js";
import {
  markProcessed,
  saveProcessedLedger,
  scrapeNewHemnaturePosts,
  type ScrapeOptions,
} from "./scraper.js";
import { ShopifyAdapter } from "./shopify-adapter.js";
import { setTimeout as sleep } from "node:timers/promises";

const DEFAULT_BATCH = 2;
const DEFAULT_MIN_WORDS = 900;
const DEFAULT_PUBLISH_DELAY_MS = 1_250;

async function main(): Promise<void> {
  const dryRun = readBooleanEnv("DRY_RUN", false);
  const batch = readPositiveIntegerEnv("BATCH", DEFAULT_BATCH);
  const ledgerPath = readEnv("PROCESSED_LEDGER_PATH");
  const blogUrl = readEnv("SOURCE_BLOG_URL");
  const sitemapUrl = readEnv("SOURCE_SITEMAP_URL");

  const scrapeOptions: ScrapeOptions = {
    limit: batch,
  };
  if (blogUrl) scrapeOptions.blogUrl = blogUrl;
  if (sitemapUrl) scrapeOptions.sitemapUrl = sitemapUrl;
  if (ledgerPath) scrapeOptions.ledgerPath = ledgerPath;

  const scrapeResult = await scrapeNewHemnaturePosts(scrapeOptions);

  console.info(
    `[blog-engine] Discovered ${scrapeResult.discoveredCount}; skipped ${scrapeResult.skippedProcessedCount}; queued ${scrapeResult.posts.length}`
  );

  if (scrapeResult.posts.length === 0) {
    return;
  }

  const openrouterKey = readEnv("OPENROUTER_API_KEY");
  if (!openrouterKey) {
    if (dryRun) {
      for (const post of scrapeResult.posts) {
        console.info(
          `[dry-run] Would translate "${post.title_tr}" and publish to Shopify (${post.url})`
        );
      }
      console.info("[dry-run] OPENROUTER_API_KEY missing; generation skipped without publishing.");
      return;
    }
    throw new Error("OPENROUTER_API_KEY is required");
  }

  const shopifyShop = readEnv("SHOPIFY_SHOP") ?? "inature-uk";
  const shopifyToken = readEnv("SHOPIFY_ADMIN_TOKEN") ?? "";
  const shopifyBlogHandle = readEnv("SHOPIFY_BLOG_HANDLE") ?? "news";
  const shopifyBlogId = readEnv("SHOPIFY_BLOG_ID");
  const openrouterModel = readEnv("OPENROUTER_MODEL") ?? "anthropic/claude-3.5-sonnet";
  const falKey = readEnv("FAL_KEY") ?? "not-used-with-images-disabled";
  const minWords = readPositiveIntegerEnv("MIN_WORDS", DEFAULT_MIN_WORDS);
  const publishDelayMs = readPositiveIntegerEnv(
    "PUBLISH_DELAY_MS",
    DEFAULT_PUBLISH_DELAY_MS
  );

  if (!dryRun && !shopifyToken) {
    throw new Error("SHOPIFY_ADMIN_TOKEN is required unless DRY_RUN=true");
  }

  let ledger = scrapeResult.ledger;
  let failures = 0;

  for (const post of scrapeResult.posts) {
    try {
      console.info(`[blog-engine] Generating UK article for "${post.title_tr}"`);
      const shopifyConfig: ConstructorParameters<typeof ShopifyAdapter>[0] = {
        shop: shopifyShop,
        accessToken: shopifyToken,
        blogHandle: shopifyBlogHandle,
        dryRun,
        coverImageUrl: post.cover_image_url,
      };
      if (shopifyBlogId) shopifyConfig.blogId = shopifyBlogId;

      const storage = new ShopifyAdapter(shopifyConfig);
      const generator = new BlogGenerator({
        openrouterKey,
        falKey,
        permanentPrompt: PERMANENT_SYSTEM_PROMPT,
        storage,
        topicCategories: ["INCIA Naturals", "natural skincare", "family skincare"],
        imageDomainHint: "natural skincare products for UK families",
        imageCount: 0,
        minWords,
        sourceLanguage: "en",
        llm: {
          defaultModel: openrouterModel,
          referer: "https://inature.co.uk",
          appTitle: "INature Blog Engine",
          maxRetries: 2,
        },
      });

      const result = await generator.run({
        topicOverride: buildTopicOverride(post),
        withImages: false,
        localize: false,
      });

      if (!result.success) {
        failures += 1;
        console.error(`[blog-engine] Generation failed: ${result.error ?? "unknown error"}`);
        continue;
      }

      const savedPost = result.posts.find((item) => item.language === "en") ?? result.posts[0];
      if (!savedPost) {
        failures += 1;
        console.error("[blog-engine] Generation succeeded but no saved post was returned");
        continue;
      }

      if (dryRun) {
        console.info(
          `[dry-run] Would mark processed after Shopify article ${savedPost.id}; ledger unchanged`
        );
      } else {
        ledger = markProcessed(ledger, post, savedPost.id);
        await saveProcessedLedger(ledger, ledgerPath);
        console.info(`[blog-engine] Published Shopify article ${savedPost.id}`);
      }

      await sleep(publishDelayMs);
    } catch (error) {
      failures += 1;
      console.error(`[blog-engine] Post failed: ${errorMessage(error)}`);
    }
  }

  if (failures > 0) {
    process.exitCode = 1;
  }
}

void main().catch((error) => {
  console.error(`[blog-engine] Fatal: ${errorMessage(error)}`);
  process.exitCode = 1;
});

function readEnv(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function readBooleanEnv(name: string, fallback: boolean): boolean {
  const value = readEnv(name);
  if (!value) return fallback;
  return ["1", "true", "yes", "on"].includes(value.toLowerCase());
}

function readPositiveIntegerEnv(name: string, fallback: number): number {
  const value = readEnv(name);
  if (!value) return fallback;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
