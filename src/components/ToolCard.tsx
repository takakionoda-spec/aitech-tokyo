"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import type { Article } from "@/data/articles";
import AffiliateCTA from "@/components/AffiliateCTA";
import {
  STRUCTURED_FIELDS,
  getCategoryDef,
  siteConfig,
  CATEGORY_ORDER
} from "@/site.config";

/* =============================================================================
   ToolCard — AITECH TOKYO cyber-glass card
   -----------------------------------------------------------------------------
   Image strategy (in order):
     1. If `article.cover.src` resolves to a real image → render via next/image
     2. If next/image errors at load time → fall back to category tone tile
     3. If config flag `preferToneTileOverStockCover` is true AND the cover
        came from the Unsplash fallback pool → skip the image entirely and
        render the tone tile directly (saves the image request)
   The tone tile is a category-tinted panel with the tool's first letter as
   a quiet brand mark.
   ========================================================================== */

type Props = {
  article: Article;
  priority?: boolean;
};

const NEON_BY_CATEGORY: Record<string, string> = {};
CATEGORY_ORDER.forEach((key, i) => {
  const palette = [
    "pill--neon-cyan",
    "pill--neon-magenta",
    "pill--neon-acid",
    "pill--neon-amber"
  ];
  NEON_BY_CATEGORY[key] = palette[i % palette.length];
});

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v);
}

export default function ToolCard({ article, priority = false }: Props) {
  const { lang, dict } = useLanguage();
  const [imgErrored, setImgErrored] = useState(false);

  const cat = getCategoryDef(article.category);
  const tile = cat?.coverPool?.[0]?.tone ?? "#11131c";

  // Is the cover an Unsplash fallback?
  const isFromUnsplash =
    article.cover.src.includes("images.unsplash.com") ||
    article.cover.src.includes("source.unsplash.com");

  // Config asks us to swap Unsplash → tile? Coerce through the optional
  // chain rather than `=== true` so the value can be flipped in
  // site.config.ts without breaking the literal-type narrowing.
  const preferTone: boolean = Boolean(
    siteConfig.layout?.directory?.preferToneTileOverStockCover
  );

  // Final decision: render the tone tile (no image fetch) if
  //  (a) the config wants it for Unsplash fallbacks, OR
  //  (b) the image previously failed to load at runtime, OR
  //  (c) cover.src is empty / clearly invalid.
  const showTone =
    !article.cover.src ||
    imgErrored ||
    (preferTone && isFromUnsplash);

  const pillClass = NEON_BY_CATEGORY[article.category] ?? "pill--neon-cyan";

  // Glass / glow lives on the <article> so we can attach an AffiliateCTA
  // outside the navigational <Link> without breaking nested-anchor rules
  // (the CTA's own <a target="_blank" rel="sponsored ..."> would otherwise be
  // nested inside the card's wrapping <Link>, which is invalid HTML).
  const hasAffiliate = (article.affiliate?.length ?? 0) > 0;

  return (
    <article className="group relative glass glow-aurora overflow-hidden">
      <Link
        href={`/articles/${article.slug}`}
        className="block"
      >
        {/* Cover — real image OR a category-tone tile with first letter */}
        <div
          className="relative aspect-[4/3] overflow-hidden"
          style={{
            background: showTone
              ? `linear-gradient(135deg, ${tile}, #05060a)`
              : tile
          }}
        >
          {!showTone && (
            <Image
              src={article.cover.src}
              alt={article.title[lang]}
              fill
              priority={priority}
              sizes="(min-width:1024px) 25vw, (min-width:640px) 50vw, 100vw"
              className="object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover:scale-[1.05]"
              onError={() => setImgErrored(true)}
              unoptimized={isFromUnsplash ? false : false}
            />
          )}
          {showTone && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                aria-hidden
                className="logo-celine !p-0 text-[5rem] md:text-[6rem] font-extralight text-white/15 select-none"
              >
                {(article.title[lang] ?? "?").charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          {/* Inner gradient sheen */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5" />
        </div>

        <div className={`p-5 lg:p-6 ${hasAffiliate ? "pb-3 lg:pb-4" : ""}`}>
          <span className={`pill ${pillClass}`}>
            {dict.categories[article.category]}
          </span>

          <h3 className="mt-4 font-sans text-[1.15rem] lg:text-[1.2rem] font-semibold leading-[1.2] tracking-[-0.005em] text-ink line-clamp-2">
            {article.title[lang]}
          </h3>

          {STRUCTURED_FIELDS.filter((f) => f.display.onCard).map((f) => {
            const v = article.structured?.[f.key]?.[lang];
            if (!v) return null;
            const text = isStringArray(v) ? v[0] : v;
            if (!text) return null;

            if (f.display.role === "headline") {
              return (
                <p
                  key={f.key}
                  className="mt-3 text-[0.95rem] lg:text-base text-ink-900 font-medium leading-snug line-clamp-2"
                >
                  {text}
                </p>
              );
            }
            if (f.display.role === "verdict") {
              return (
                <div key={f.key} className="mt-4 pt-4 border-t border-white/8">
                  <span className="font-mono text-[0.625rem] tracking-[0.22em] uppercase text-neon-cyan">
                    {f.label[lang]}
                  </span>
                  <p className="mt-1.5 text-[0.8125rem] text-ink-700 leading-relaxed line-clamp-3">
                    {text}
                  </p>
                </div>
              );
            }
            if (f.display.role === "footnote") {
              return (
                <p
                  key={f.key}
                  className="mt-2 font-mono text-[0.6875rem] text-ink-600 leading-relaxed line-clamp-2"
                >
                  {text}
                </p>
              );
            }
            return (
              <div key={f.key} className="mt-3">
                <span className="font-mono text-[0.625rem] tracking-[0.20em] uppercase text-ink-600">
                  {f.label[lang]}
                </span>
                <p className="mt-1 text-[0.8125rem] text-ink-700 leading-relaxed line-clamp-2">
                  {text}
                </p>
              </div>
            );
          })}

          <div className="mt-5 flex items-center justify-between">
            <span className="byline">
              {dict.ui.by}{" "}
              <span className="text-ink-700">{article.source.name}</span>
            </span>
            <span
              aria-hidden
              className="font-mono text-[0.625rem] tracking-[0.22em] uppercase text-ink-600 group-hover:text-neon-cyan transition-colors"
            >
              →
            </span>
          </div>
        </div>
      </Link>

      {/* Affiliate CTA — rendered OUTSIDE the <Link> so the affiliate <a> is
          not a nested anchor. The component itself bails when the layer is
          disabled or the article has no links. */}
      {hasAffiliate ? (
        <div className="px-5 lg:px-6 pb-5 lg:pb-6">
          <AffiliateCTA links={article.affiliate} variant="card" />
        </div>
      ) : null}
    </article>
  );
}
