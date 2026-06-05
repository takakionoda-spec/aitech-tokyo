"use client";

/* =============================================================================
   AffiliateCTA — AITECH TOKYO
   -----------------------------------------------------------------------------
   Renders the affiliate / partner CTA block for an article. Designed to drop
   into two slots:

     - <ToolCard />  → variant="card"   (compact, single primary button)
     - article/[slug] → variant="detail" (full block with all links + badges)

   Behaviour:
     - Renders nothing when:
         (a) `monetization.affiliate.enabled` is false, OR
         (b) article has no `affiliate` array / it's empty, OR
         (c) every link in the array targets a network not in
             `monetization.affiliate.networks` (silently filtered).
     - Adds rel="sponsored noopener nofollow" and target="_blank" on every <a>
       per Google publisher policy (≒ link attribution requirement).
     - Surfaces a per-link badge (Amazon / 公式パートナー / PR) so the
       disclosure happens AT the unit of placement, not only in the footer —
       this matches 景表法 ステマ規制 (2023/10) and Amazon Associates §5(a).
   ========================================================================== */

import { useLanguage } from "@/context/LanguageContext";
import type { AffiliateLink, AffiliateNetwork } from "@/site.config";
import {
  AFFILIATE_ENABLED,
  getAffiliateDefaultLabel,
  getAffiliateNetworkLabel,
  isAffiliateNetworkActive
} from "@/site.config";

type Variant = "card" | "detail";

type Props = {
  links?: AffiliateLink[];
  variant?: Variant;
};

/** Tailwind classes per network — keeps the visual ranking subtle but legible
 *  (partner = neon-cyan, ASP = neon-magenta, Amazon = soft amber, other =
 *  neutral). All four still read as small, clearly-marked pills, not as a
 *  loud banner. */
const BADGE_CLASS: Record<AffiliateNetwork, string> = {
  amazon: "border-amber-400/40 text-amber-200",
  partner: "border-neon-cyan/40 text-neon-cyan",
  asp: "border-neon-magenta/40 text-neon-magenta",
  other: "border-white/30 text-ink-700"
};

export default function AffiliateCTA({ links, variant = "card" }: Props) {
  const { lang } = useLanguage();

  // Layer disabled at the site level → render nothing.
  if (!AFFILIATE_ENABLED) return null;

  // No links on this article → render nothing.
  if (!links || links.length === 0) return null;

  // Filter to active networks only. If everything got filtered out, render
  // nothing (covers the case where affiliate.ts holds staged entries for a
  // program that hasn't been approved yet).
  const visible = links.filter((l) => isAffiliateNetworkActive(l.network));
  if (visible.length === 0) return null;

  const defaultLabel = getAffiliateDefaultLabel();

  if (variant === "card") {
    // Card variant: only render the FIRST link as a compact button so the
    // card layout stays scannable. Detail page handles multi-link cases.
    const primary = visible[0];
    const label = primary.label?.[lang] ?? defaultLabel[lang];
    const badge = getAffiliateNetworkLabel(primary.network)[lang];

    return (
      <div className="mt-4 pt-4 border-t border-white/8">
        <a
          href={primary.url}
          target="_blank"
          rel="sponsored noopener nofollow"
          // Stop the parent <Link> on the card from intercepting the click.
          onClick={(e) => e.stopPropagation()}
          className="group/cta inline-flex items-center gap-2 text-[0.8125rem] font-medium text-ink hover:text-neon-cyan transition-colors"
        >
          <span>{label}</span>
          <span aria-hidden className="transition-transform group-hover/cta:translate-x-0.5">↗</span>
          <span
            className={`ml-1 inline-block border px-1.5 py-0.5 font-mono text-[0.5625rem] tracking-[0.16em] uppercase ${BADGE_CLASS[primary.network]}`}
          >
            {badge}
          </span>
        </a>
        {primary.note ? (
          <p className="mt-1 font-mono text-[0.625rem] tracking-[0.12em] uppercase text-ink-600">
            {primary.note[lang]}
          </p>
        ) : null}
      </div>
    );
  }

  // Detail variant: render every active link as its own button + badge.
  return (
    <section
      aria-label={lang === "ja" ? "関連リンク（PR を含む）" : "Related links (sponsored)"}
      className="mt-12 lg:mt-14 border-t border-b border-white/15 py-8 lg:py-10"
    >
      <p className="eyebrow text-white">
        {lang === "ja" ? "関連リンク" : "Related links"}
      </p>
      <div className="mt-5 flex flex-col gap-4">
        {visible.map((link, i) => {
          const label = link.label?.[lang] ?? defaultLabel[lang];
          const badge = getAffiliateNetworkLabel(link.network)[lang];
          return (
            <div
              key={`${link.url}-${i}`}
              className="flex flex-col sm:flex-row sm:items-center gap-y-1 sm:gap-x-4"
            >
              <a
                href={link.url}
                target="_blank"
                rel="sponsored noopener nofollow"
                className="group/cta inline-flex items-center gap-2 text-base font-medium text-ink hover:text-neon-cyan transition-colors"
              >
                <span>{label}</span>
                <span aria-hidden className="transition-transform group-hover/cta:translate-x-0.5">↗</span>
              </a>
              <span
                className={`inline-block self-start sm:self-auto border px-2 py-0.5 font-mono text-[0.625rem] tracking-[0.18em] uppercase ${BADGE_CLASS[link.network]}`}
              >
                {badge}
              </span>
              {link.note ? (
                <span className="font-mono text-[0.6875rem] tracking-[0.14em] uppercase text-ink-600">
                  {link.note[lang]}
                </span>
              ) : null}
            </div>
          );
        })}
      </div>
      <p className="mt-6 font-mono text-[0.625rem] tracking-[0.22em] uppercase text-ink-600">
        {lang === "ja"
          ? "上記リンクの一部はアフィリエイト・リンクです。"
          : "Some links above are affiliate links."}
      </p>
    </section>
  );
}
