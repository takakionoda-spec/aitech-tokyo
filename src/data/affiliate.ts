/* =============================================================================
   AFFILIATE OVERLAY — AITECH TOKYO
   -----------------------------------------------------------------------------
   This file maps article slugs (from src/data/generated/articles.json) to the
   affiliate / partner / Amazon URLs that should be surfaced as CTAs on the
   matching card + detail page. Keep it hand-edited; do NOT generate it from
   the cron.

   How an entry works:

     "<article-slug>": [
       {
         url: "https://...",                 // Full affiliate URL
         network: "amazon" | "partner" | "asp" | "other",
         label?: { en: "...", ja: "..." },   // Optional: button text override
         note?:  { en: "...", ja: "..." }    // Optional: small line under button
       },
       { ... }   // second link — e.g. an Amazon book recommendation
     ]

   Compliance notes:
     - The renderer adds rel="sponsored noopener nofollow" and target="_blank"
       automatically — do NOT write those into the URL.
     - Each network's badge label comes from site.config.ts → monetization.
       Amazon links auto-get an "Amazon" pill; partner links get "公式パート
       ナー"; ASP links get "PR". This is required by 景表法 (2023/10 ステマ
       規制) — every affiliate placement must be visibly disclosed at the unit
       of placement, not only in a site-wide footer.
     - If a network is not listed in site.config.ts → monetization.affiliate
       .networks, the link is silently dropped. Useful for staging an entry
       before a program is approved.

   Example shape (replace with real slugs from your generated/articles.json):

     export const affiliateBySlug: Record<string, AffiliateLink[]> = {
       "cursor-launches-vibe-coding": [
         {
           url: "https://cursor.com/?ref=aitechtokyo",
           network: "partner",
           label: { en: "Try Cursor", ja: "Cursor を試す" },
           note: { en: "14-day free trial", ja: "14日間の無料トライアル" }
         },
         {
           url: "https://www.amazon.co.jp/dp/XXXXXXXXXX?tag=aitechtokyo-22",
           network: "amazon",
           label: { en: "Related book", ja: "関連書籍" }
         }
       ]
     };

   ========================================================================== */

import type { AffiliateLink } from "@/site.config";

/** Slug-keyed overlay. Each entry maps a slug (from generated/articles.json)
 *  to one or more affiliate CTAs that should appear on the matching card +
 *  detail page. Add entries below as affiliate programs are signed up.
 *
 *  The Amazon short URLs from SiteStripe (https://amzn.to/xxxxx) already
 *  carry the associate tracking ID — no need to append ?tag=. */
export const affiliateBySlug: Record<string, AffiliateLink[]> = {
  "airbnb-to-launch-dedicated-ai-lab": [
    {
      url: "https://amzn.to/4vywXWt",
      network: "amazon",
      label: { en: "Related book", ja: "関連書籍" }
    }
  ]
};
