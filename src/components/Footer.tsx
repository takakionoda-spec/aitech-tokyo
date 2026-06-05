"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_ORDER } from "@/lib/i18n";
import {
  AFFILIATE_ENABLED,
  getAffiliateDisclosureShort,
  siteConfig
} from "@/site.config";

export default function Footer() {
  const { dict, lang } = useLanguage();
  const disclosureShort = AFFILIATE_ENABLED
    ? getAffiliateDisclosureShort()[lang]
    : "";

  return (
    <footer className="mt-section relative">
      {/* Hairline gradient rule on top — mirrors the masthead. */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="px-6 lg:px-10 py-14 lg:py-20 grid grid-cols-1 md:grid-cols-12 gap-10">
        <div className="md:col-span-6">
          <p className="logo-celine logo-celine--xl text-[1.5rem] md:text-[1.8rem]">
            {siteConfig.brand.name}
          </p>
          <p className="mt-5 max-w-[68ch] text-sm leading-relaxed text-ink-600">
            {dict.ui.footer.copy}
          </p>
          <div className="silver-rule mt-8 max-w-xs" />
          <div className="mt-6 flex items-center gap-3">
            <span aria-hidden className="size-1.5 rounded-full bg-neon-acid animate-pulse" />
            <span className="font-mono text-[0.625rem] tracking-[0.28em] uppercase text-ink-600">
              {lang === "ja" ? "次回インデックス" : "Next index"} · {siteConfig.cron.localLabel}
            </span>
          </div>
        </div>

        <div className="md:col-span-3">
          <h4 className="eyebrow text-ink-800">
            {lang === "ja" ? "セクション" : "Sections"}
          </h4>
          <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
            {CATEGORY_ORDER.map((key) => (
              <li key={key}>
                <Link href={`/category/${key}`} className="editorial-link hover:text-ink">
                  {dict.categories[key]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="md:col-span-3">
          <h4 className="eyebrow text-ink-800">
            {lang === "ja" ? "編集部" : "Editorial"}
          </h4>
          <ul className="mt-5 space-y-2.5 text-sm text-ink-700">
            <li>
              <Link href="/about" className="editorial-link hover:text-ink">
                {dict.nav.about}
              </Link>
            </li>
            <li>
              <Link href="/#newsletter" className="editorial-link hover:text-ink">
                {dict.nav.subscribe}
              </Link>
            </li>
            {dict.ui.cta ? (
              <li>
                <Link href={dict.ui.cta.href} className="editorial-link hover:text-ink">
                  {dict.ui.cta.label}
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
      </div>

      {/* Affiliate disclosure — required at the unit of placement, but a
          site-wide footer line gives the reader the persistent context. The
          per-link badges (PR / Amazon / 公式パートナー) carry the
          placement-level disclosure required by 景表法 ステマ規制. Render
          NOTHING when the monetization layer is disabled site-wide so sister
          titles without affiliate stay visually identical. */}
      {disclosureShort ? (
        <div className="relative">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/8 to-transparent" />
          <div className="px-6 lg:px-10 py-4 max-w-[88ch]">
            <p className="text-[0.6875rem] leading-relaxed text-ink-600">
              {disclosureShort}{" "}
              <Link
                href="/about#affiliate"
                className="editorial-link text-ink-700 hover:text-ink"
              >
                {lang === "ja" ? "詳細はこちら" : "Learn more"}
              </Link>
            </p>
          </div>
        </div>
      ) : null}

      {/* Hairline gradient rule above the strapline */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="px-6 lg:px-10 py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 font-mono text-[0.625rem] tracking-[0.22em] uppercase text-ink-600">
          <span>{dict.brand.legal}</span>
          <span className="text-ink-600">{siteConfig.chrome.footer.strapline}</span>
        </div>
      </div>
    </footer>
  );
}
