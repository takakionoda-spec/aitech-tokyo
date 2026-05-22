"use client";

import Link from "next/link";
import LanguageToggle from "./LanguageToggle";
import Navigation from "./Navigation";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/site.config";

// Issue counter derived from siteConfig.brand.issueBase. Vol. 01 corresponds
// to {issueBase.year, issueBase.month}. Updated on every render so the masthead
// stays accurate over months.
function currentIssueLabel(): string {
  const d = new Date();
  const base = siteConfig.brand.issueBase;
  const offset = (d.getFullYear() - base.year) * 12 + (d.getMonth() + 1 - base.month) + 1;
  const vol = Math.max(1, offset);
  return `${String(vol).padStart(2, "0")} — ${d.getFullYear()}`;
}

export default function Header() {
  const { dict, lang } = useLanguage();
  const issueLabel = currentIssueLabel();
  const brand = siteConfig.brand;

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl supports-[backdrop-filter]:bg-paper/40 bg-paper/70">
      {/* Top utility row — hairline pseudo-border, no opaque divider line. */}
      <div className="flex items-center justify-between px-6 lg:px-10 py-2.5 text-[0.625rem] tracking-[0.22em] uppercase text-ink-600">
        <div className="flex items-center font-mono">
          <span className="text-ink-800">
            {new Date().toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric"
            })}
          </span>
          <span className="mx-3 text-ink-600 hidden sm:inline">/</span>
          <span className="hidden sm:inline tracking-[0.28em] text-ink-600">{brand.city.en.toUpperCase()}</span>
          <span className="mx-3 text-ink-600 hidden md:inline">/</span>
          <span className="hidden md:inline tracking-[0.28em] text-ink-600">VOL.{issueLabel}</span>
        </div>
        <div className="flex items-center gap-4 md:gap-6">
          <Link href="/about" className="hidden md:inline hover:text-ink transition-colors">
            {dict.nav.about}
          </Link>
          <Link href="/#newsletter" className="hidden md:inline hover:text-ink transition-colors">
            {dict.nav.subscribe}
          </Link>
          {dict.ui.cta ? (
            <Link
              href={dict.ui.cta.href}
              className="hidden md:inline-flex items-center gap-1.5 btn-neon !py-1.5 !px-3 !text-[0.625rem]"
            >
              {dict.ui.cta.label} <span className="text-neon-cyan">→</span>
            </Link>
          ) : null}
          <LanguageToggle />
        </div>
      </div>

      {/* Masthead — CELINE-style wordmark. Hairline glow rule above and below. */}
      <div className="relative">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />
        <div className="flex flex-col items-center md:flex-row md:items-center md:justify-between gap-3 px-6 lg:px-10 py-6 lg:py-8">
          <Link href="/" aria-label={`${brand.name} — home`} className="block group">
            <span className="logo-celine logo-celine--xl block text-center md:text-left text-[1.5rem] md:text-[1.9rem] lg:text-[2.1rem]">
              {brand.name}
            </span>
            <span className="hidden md:block mt-2.5 text-[0.625rem] tracking-[0.32em] uppercase text-ink-600 font-mono">
              {dict.brand.tagline.length > 80
                ? dict.brand.tagline.slice(0, 78) + "…"
                : dict.brand.tagline}
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-3">
            <span className="inline-block size-1.5 rounded-full bg-neon-acid animate-pulse" aria-hidden />
            <span className="text-[0.625rem] tracking-[0.28em] uppercase text-ink-700 font-mono">
              {lang === "ja" ? "稼働中" : "Live Index"}
            </span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Section nav */}
      <div>
        <div className="px-6 lg:px-10 py-3 overflow-x-auto">
          <Navigation />
        </div>
      </div>
    </header>
  );
}
