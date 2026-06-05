"use client";

import { Container } from "@/components/GridSystem";
import { PageAura } from "@/components/PageAura";
import { useLanguage } from "@/context/LanguageContext";
import Newsletter from "@/components/Newsletter";
import {
  AFFILIATE_ENABLED,
  getAffiliateDisclosureLong,
  siteConfig
} from "@/site.config";

export default function AboutPage() {
  const { lang, dict } = useLanguage();
  const about = siteConfig.about;
  const disclosureLong = AFFILIATE_ENABLED
    ? getAffiliateDisclosureLong()[lang]
    : "";

  return (
    <>
      {/* Per-page aura — Neon Green × Cyan, "autonomous agents" mood */}
      <PageAura tone="green" />

      <Container className="pt-12 lg:pt-16 pb-12">
        <p className="eyebrow text-neon-acid">{dict.nav.about}</p>
        <h1 className="mt-6 font-sans font-semibold text-[clamp(2.5rem,6vw,5rem)] leading-[1.02] tracking-[-0.022em] max-w-5xl text-ink">
          {about.headline[lang]}
        </h1>
        <p className="mt-8 max-w-[68ch] text-lg text-ink-700 leading-relaxed">
          {about.lede[lang]}
        </p>
        <div className="silver-rule mt-12" />
      </Container>

      <Container className="pb-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-16">
          {about.blocks.map((block, i) => (
            <article
              key={i}
              className="lg:col-span-12 glass p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-4"
            >
              <div className="lg:col-span-3">
                <p className="eyebrow text-neon-acid">{block.eyebrow[lang]}</p>
              </div>
              <div className="lg:col-span-9">
                <h2 className="font-sans font-semibold text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] tracking-[-0.012em] text-ink max-w-3xl">
                  {block.heading[lang]}
                </h2>
                <p className="mt-6 max-w-[68ch] text-base text-ink-700 leading-relaxed">
                  {block.body[lang]}
                </p>
              </div>
            </article>
          ))}
        </div>
      </Container>

      {/* Affiliate disclosure block — anchored at #affiliate so the
          Footer's "Learn more" link lands here. Renders nothing when the
          monetization layer is disabled site-wide. */}
      {disclosureLong ? (
        <Container className="pb-section">
          <article
            id="affiliate"
            className="glass p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-4 scroll-mt-32"
          >
            <div className="lg:col-span-3">
              <p className="eyebrow text-neon-acid">
                {lang === "ja" ? "アフィリエイト開示" : "Affiliate Disclosure"}
              </p>
            </div>
            <div className="lg:col-span-9">
              <h2 className="font-sans font-semibold text-[clamp(1.6rem,3vw,2.4rem)] leading-[1.1] tracking-[-0.012em] text-ink max-w-3xl">
                {lang === "ja"
                  ? "PR と編集判断は別の引き出しに置く。"
                  : "Commercial links live in a separate drawer from editorial judgement."}
              </h2>
              <p className="mt-6 max-w-[68ch] text-base text-ink-700 leading-relaxed">
                {disclosureLong}
              </p>
            </div>
          </article>
        </Container>
      ) : null}

      <Container>
        <Newsletter />
      </Container>
    </>
  );
}
