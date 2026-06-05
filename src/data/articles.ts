import type { CategoryKey, Lang } from "@/lib/i18n";
import { normalizeCategory } from "@/lib/i18n";
import type { AffiliateLink } from "@/site.config";
import generated from "./generated/articles.json";
import { affiliateBySlug } from "./affiliate";

/* =========================================================
   Article shape
   - Test/dummy articles have been removed.
   - The source of truth is now src/data/generated/articles.json
     which is written by src/scripts/cron-publisher.ts
     from real NASA / Space.com / arXiv feeds.
   ========================================================= */

export type LocalizedString = Record<Lang, string>;
export type LocalizedRichText = Record<Lang, string[]>;

export type ArticleStatus = "draft" | "published";

export type Article = {
  slug: string;
  category: CategoryKey;
  issue: string;
  publishedAt: string; // ISO date
  readingMinutes: number;
  feature: boolean;
  cover: {
    src: string;
    tone: string;
  };
  title: LocalizedString;
  dek: LocalizedString;
  author: LocalizedString;
  location: LocalizedString;
  tags: LocalizedString[];
  body: LocalizedRichText;
  /** Editorial "view from {city}" block — long-form closing commentary
   *  composed by `siteConfig.pipeline.voice.closingBlock`. On AITECH TOKYO
   *  this is the longer, detail-page-only expansion of the `tokyoTake`
   *  structured field; on ARTEMIS TOKYO this is the main "ARTEMIS TOKYO 視点"
   *  block. Optional because legacy articles predate it. */
  tokyoView?: LocalizedRichText;
  /** Card-surfaced structured fields declared by
   *  `siteConfig.pipeline.voice.structuredFields`. The LLM emits one entry
   *  per declared field; the renderer (ToolCard / detail Spec Sheet) reads
   *  values by `structured[fieldKey][lang]`. Empty / absent on sister sites
   *  (e.g. ARTEMIS TOKYO) that don't declare any structured fields. */
  structured?: Record<string, LocalizedString | LocalizedRichText>;
  /** Affiliate / partner CTAs surfaced on the article card and detail page.
   *  Declared via the `src/data/affiliate.ts` slug → AffiliateLink[] overlay
   *  (NOT inside generated/articles.json) so editorial content stays separate
   *  from commercial wiring. Empty / absent on entries with no affiliate
   *  relationship — the CTA section simply doesn't render in that case. */
  affiliate?: AffiliateLink[];
  /** Provenance — every article must record where it came from. */
  source: {
    name: string;
    url: string;
  };
  /** Stable identifier of the upstream item (RSS GUID / arXiv id) — used to
   *  detect and re-edit articles that were previously marked seen but never
   *  got real content. */
  sourceGuid?: string;
  /** "draft" articles are forced through the LLM again on the next cron run. */
  status?: ArticleStatus;
};

// JSON files are imported with broad typing; we narrow here and migrate
// any legacy category (architecture / interview / exploration) on the fly.
// We also fold in the slug → AffiliateLink[] overlay so the rest of the app
// reads a single Article shape regardless of whether the affiliate URLs came
// from generated JSON or from the hand-edited affiliate.ts file.
export const articles: Article[] = (generated as unknown as Article[]).map((a) => {
  const overlay = affiliateBySlug[a.slug];
  return {
    ...a,
    category: normalizeCategory(a.category),
    // overlay wins over any affiliate already on the JSON (which today is
    // never the case — the LLM doesn't emit affiliate URLs).
    affiliate: overlay ?? a.affiliate
  };
});

/* =========================================================
   Query helpers — same surface as before so existing
   components keep working without changes.
   ========================================================= */

export const getArticleBySlug = (slug: string): Article | undefined =>
  articles.find((a) => a.slug === slug);

export const getArticlesByCategory = (category: string): Article[] =>
  articles.filter((a) => a.category === category);

export const getFeaturedArticles = (): Article[] =>
  articles.filter((a) => a.feature);

export const getLatestArticles = (limit = 8): Article[] =>
  [...articles]
    .sort((a, b) => (a.publishedAt < b.publishedAt ? 1 : -1))
    .slice(0, limit);

export const getRelatedArticles = (slug: string, limit = 3): Article[] => {
  const current = getArticleBySlug(slug);
  if (!current) return [];
  return articles
    .filter((a) => a.slug !== slug)
    .sort((a, b) => {
      const aMatch = a.category === current.category ? 0 : 1;
      const bMatch = b.category === current.category ? 0 : 1;
      if (aMatch !== bMatch) return aMatch - bMatch;
      return a.publishedAt < b.publishedAt ? 1 : -1;
    })
    .slice(0, limit);
};
