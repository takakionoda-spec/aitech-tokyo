"use client";

import Link from "next/link";
import { Container } from "@/components/GridSystem";
import { PageAura } from "@/components/PageAura";
import { useLanguage } from "@/context/LanguageContext";
import { siteConfig } from "@/site.config";

/* =============================================================================
   /submit — paid placement form (placeholder for now)
   -----------------------------------------------------------------------------
   This is the destination of `siteConfig.brand.cta.href`. Currently a static
   "under construction" panel. Wire up to a real form (Tally / Notion API /
   Stripe Checkout) when ready.
   ========================================================================== */

export default function SubmitPage() {
  const { lang, dict } = useLanguage();
  const cta = siteConfig.brand.cta;
  if (!cta) {
    // CTA disabled — shouldn't be reachable, but render a graceful fallback.
    return (
      <Container className="py-section">
        <p className="text-ink-600">Not configured.</p>
      </Container>
    );
  }

  return (
    <Container className="py-section">
      {/* Per-page aura — Cyber Yellow × Magenta, "marketplace" mood */}
      <PageAura tone="amber" />
      <div className="max-w-[68ch]">
        <p className="eyebrow">{cta.label[lang]}</p>
        <h1 className="mt-6 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-[0.98] tracking-[-0.022em]">
          {lang === "ja"
            ? "ツールを掲載する"
            : "Submit a Tool"}
        </h1>
        <p className="mt-6 text-lg text-ink-600 leading-relaxed">{cta.hint[lang]}</p>

        <div className="silver-rule mt-12" />

        <div className="mt-10 space-y-6 text-sm text-ink-600 leading-relaxed">
          <p>
            {lang === "ja"
              ? "現在、申込フォームを準備中です。それまでの間、メール（hello@aitech-tokyo.example）で以下を送ってください："
              : "The submission form is being prepared. In the meantime, email hello@aitech-tokyo.example with:"}
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              {lang === "ja"
                ? "ツール名・URL・スクリーンショット 1〜2 枚"
                : "tool name, URL, 1–2 screenshots"}
            </li>
            <li>
              {lang === "ja"
                ? "1 行のタグライン（30文字以内）"
                : "a one-line tagline (under 60 characters)"}
            </li>
            <li>
              {lang === "ja"
                ? "対象ユーザー、既存ツールとの違い、日本語対応状況"
                : "target user, what's different vs. existing tools, Japanese-language support status"}
            </li>
          </ul>
        </div>

        <div className="mt-12">
          <Link
            href="/"
            className="editorial-link text-[0.6875rem] tracking-[0.22em] uppercase"
          >
            ← {dict.ui.backToHome}
          </Link>
        </div>
      </div>
    </Container>
  );
}
