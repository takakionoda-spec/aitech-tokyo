"use client";

/* =============================================================================
   ArticleView — client-side detail renderer for /articles/[slug]
   -----------------------------------------------------------------------------
   This used to be `page.tsx`. Because Next.js does NOT allow client components
   to export `generateMetadata`, the OG title / description for shared links
   was silently falling back to the root layout's brand-name default. To fix
   that without rewriting the body in RSC, the route is now split:

     - page.tsx (server) → exports generateMetadata, renders this component
     - ArticleView.tsx (client) → reads `slug` from a prop, keeps useLanguage
       and all the client-only interactivity (ReadingProgress, ShareBar, …)
   ========================================================================== */

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { getArticleBySlug, getRelatedArticles } from "@/data/articles";
import AffiliateCTA from "@/components/AffiliateCTA";
import ArticleCard from "@/components/ArticleCard";
import { Container, SectionRule, TriColGrid } from "@/components/GridSystem";
import Newsletter from "@/components/Newsletter";
import ReadingProgress from "@/components/ReadingProgress";
import ShareBar from "@/components/ShareBar";
import SourceCredit from "@/components/SourceCredit";
import { buildArticleJsonLd } from "@/lib/jsonld";
import {
  siteConfig,
  STRUCTURED_FIELDS,
  HAS_STRUCTURED_FIELDS,
  getCategoryDef
} from "@/site.config";
import type { Article } from "@/data/articles";

/** 16:9 cover with the same error-fallback pattern as ToolCard:
 *  if the cover.src image fails to load (e.g. invalid Unsplash photo ID,
 *  RSS image 404, host blocked), swap to a flat category-tone tile with
 *  the article's first character — keeps the layout intact and the page
 *  readable. */
function ArticleCover({ article, alt }: { article: Article; alt: string }) {
  const [errored, setErrored] = useState(false);
  const cat = getCategoryDef(article.category);
  const tile = cat?.coverPool?.[0]?.tone ?? article.cover.tone ?? "#11131c";
  const showTone = !article.cover.src || errored;
  return (
    <div
      className="relative aspect-[16/9] overflow-hidden bg-neutral-900"
      style={{
        background: showTone
          ? `linear-gradient(135deg, ${tile}, #05060a)`
          : tile
      }}
    >
      {!showTone && (
        <Image
          src={article.cover.src}
          alt={alt}
          fill
          priority
          sizes="(min-width: 1280px) 1280px, 100vw"
          className="object-cover"
          onError={() => setErrored(true)}
        />
      )}
      {showTone && (
        <div className="absolute inset-0 flex items-center justify-center">
          <span
            aria-hidden
            className="logo-celine !p-0 text-[6rem] md:text-[8rem] font-extralight text-white/15 select-none"
          >
            {(alt ?? "?").charAt(0).toUpperCase()}
          </span>
        </div>
      )}
    </div>
  );
}

/** Issue label derived from siteConfig.brand.issueBase — matches the
 *  computation in Header.tsx so the masthead and detail page stay in sync. */
function currentIssueNumber(): string {
  const d = new Date();
  const base = siteConfig.brand.issueBase;
  const offset = (d.getFullYear() - base.year) * 12 + (d.getMonth() + 1 - base.month) + 1;
  return String(Math.max(1, offset)).padStart(2, "0");
}

function ParagraphBlock({ raw }: { raw: string }) {
  if (raw.startsWith("## ")) {
    return <h2>{raw.replace(/^##\s+/, "")}</h2>;
  }
  if (raw.startsWith("> ")) {
    return <blockquote>{raw.replace(/^>\s+/, "")}</blockquote>;
  }
  return <p>{raw}</p>;
}

export default function ArticleView({ slug }: { slug: string }) {
  const { lang, dict } = useLanguage();

  const article = getArticleBySlug(slug);
  if (!article) notFound();

  const related = getRelatedArticles(slug, 3);

  const title = article.title[lang];
  const dek = article.dek[lang];
  const author = article.author[lang];
  const location = article.location[lang];
  const categoryLabel = dict.categories[article.category];
  const body = article.body[lang];
  const tags = article.tags;

  const dateFormatter = new Intl.DateTimeFormat(lang === "ja" ? "ja-JP" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric"
  });

  const jsonLd = buildArticleJsonLd(article, lang);

  return (
    <article>
      <ReadingProgress />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ========== Header / Title block ========== */}
      <Container className="pt-10 lg:pt-14 pb-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-6 items-end">
          <div className="lg:col-span-9">
            <p className="eyebrow">
              <Link
                href={`/category/${article.category}`}
                className="editorial-link text-neutral-200 hover:text-white"
              >
                {categoryLabel}
              </Link>
              <span className="mx-3 text-neutral-600">|</span>
              <span className="text-neutral-200">
                {dict.ui.issue} {currentIssueNumber()}
              </span>
            </p>
            <h1 className="mt-6 font-sans font-semibold text-[clamp(2.25rem,5vw,4.5rem)] leading-[1.02] tracking-[-0.022em] text-white">
              {title}
            </h1>
            <p className="mt-6 max-w-3xl text-lg lg:text-xl text-neutral-200 leading-relaxed">
              {dek}
            </p>
          </div>
          <div className="lg:col-span-3 lg:border-l lg:border-white/15 lg:pl-6">
            <dl className="grid grid-cols-2 lg:grid-cols-1 gap-y-4 text-[0.6875rem] tracking-[0.18em] uppercase">
              <div>
                <dt className="text-neutral-400 font-mono">{dict.ui.by}</dt>
                <dd className="mt-1 text-white">{author}</dd>
              </div>
              <div>
                <dt className="text-neutral-400 font-mono">Dateline</dt>
                <dd className="mt-1 text-white">{location}</dd>
              </div>
              <div>
                <dt className="text-neutral-400 font-mono">Date</dt>
                <dd className="mt-1 text-white">
                  {dateFormatter.format(new Date(article.publishedAt))}
                </dd>
              </div>
              <div>
                <dt className="text-neutral-400 font-mono">Time</dt>
                <dd className="mt-1 text-white">
                  {article.readingMinutes} {dict.ui.minRead}
                </dd>
              </div>
            </dl>
            {article.source ? (
              <div className="mt-6 pt-6 border-t border-white/15">
                <SourceCredit source={article.source} variant="block" />
              </div>
            ) : null}
          </div>
        </div>
      </Container>

      {/* ========== Cover ========== */}
      <Container className="pb-12">
        <ArticleCover article={article} alt={title} />
      </Container>

      {/* ========== Body + sidebar ========== */}
      <Container className="pb-section">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12">
          {/* ----- Sidebar ----- */}
          <aside className="lg:col-span-3 order-2 lg:order-1">
            <div className="lg:sticky lg:top-32 space-y-6">
              <div>
                <p className="eyebrow text-white">Tags</p>
                <ul className="mt-4 flex flex-wrap gap-x-2 gap-y-2 text-[0.6875rem] tracking-[0.16em] uppercase">
                  {tags.map((tag) => (
                    <li
                      key={tag[lang]}
                      className="border border-neon-cyan/40 px-2 py-1 text-neutral-200 hover:border-neon-cyan hover:text-white transition-colors"
                    >
                      {tag[lang]}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="silver-rule" />
              <p className="byline text-neutral-300">
                {dict.ui.by} <span className="text-white">{author}</span>
              </p>
              {article.source ? (
                <>
                  <div className="silver-rule" />
                  <SourceCredit source={article.source} variant="block" />
                </>
              ) : null}
              <div className="silver-rule" />
              <ShareBar title={title} slug={article.slug} />
            </div>
          </aside>

          {/* ----- Main column ----- */}
          <div className="lg:col-span-9 order-1 lg:order-2">
            {/* Spec Sheet — all white-on-black, hairline white dividers,
                neon-cyan label tint for headline role only. */}
            {HAS_STRUCTURED_FIELDS && article.structured ? (
              <section
                aria-label="Spec Sheet"
                className="mb-12 lg:mb-14 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7 border-t border-b border-white/15 py-8 lg:py-10"
              >
                {STRUCTURED_FIELDS.filter((f) => f.display.onDetail).map((f) => {
                  const v = article.structured?.[f.key]?.[lang];
                  if (!v) return null;
                  const text = Array.isArray(v) ? v.join("\n\n") : v;
                  if (!text) return null;
                  const isFull =
                    f.display.role === "headline" || f.display.role === "verdict";
                  return (
                    <div key={f.key} className={isFull ? "sm:col-span-2" : ""}>
                      <p
                        className={
                          f.display.role === "headline"
                            ? "eyebrow text-neon-cyan"
                            : "eyebrow text-white"
                        }
                      >
                        {f.label[lang]}
                      </p>
                      <p
                        className={
                          f.display.role === "headline"
                            ? "mt-3 font-sans font-medium text-2xl lg:text-3xl tracking-[-0.012em] leading-tight text-white whitespace-pre-line"
                            : "mt-3 text-base lg:text-[1.0625rem] text-neutral-100 leading-relaxed whitespace-pre-line"
                        }
                      >
                        {text}
                      </p>
                    </div>
                  );
                })}
              </section>
            ) : null}

            {/* Article body — uses .prose-editorial whose text color is now
                fixed to var(--color-ink) (near-white). */}
            <div className="prose-editorial">
              {body.map((block, i) => (
                <ParagraphBlock key={i} raw={block} />
              ))}
            </div>

            {/* Affiliate / partner CTA block. Renders nothing when the layer
                is disabled or the article has no links — sits between the
                body and the Tokyo Take so the reader has finished the
                editorial argument before seeing any commercial CTA. */}
            <AffiliateCTA links={article.affiliate} variant="detail" />

            {/* Closing "view from {city}" block */}
            {article.tokyoView && (article.tokyoView[lang]?.length ?? 0) > 0 ? (
              <aside
                aria-label={`${siteConfig.brand.name} Editorial Commentary`}
                className="mt-16 lg:mt-20 border-t border-b border-white/20 py-10 lg:py-12"
              >
                <p className="eyebrow text-neon-cyan">
                  {siteConfig.pipeline.voice.closingBlock.title[lang]}
                </p>
                <h2 className="mt-4 font-sans font-semibold text-2xl lg:text-3xl tracking-[-0.012em] leading-tight text-white">
                  {siteConfig.pipeline.voice.closingBlock.subheading[lang]}
                </h2>
                <div className="silver-rule mt-6 max-w-xs" />
                <div className="prose-editorial mt-6">
                  {article.tokyoView[lang].map((block, i) => (
                    <ParagraphBlock key={`tv-${i}`} raw={block} />
                  ))}
                </div>
                <p className="mt-8 font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-neutral-400">
                  {lang === "ja"
                    ? `編集：${siteConfig.brand.name} 編集部`
                    : `Editorial: ${siteConfig.brand.name} Editors`}
                </p>
              </aside>
            ) : null}
          </div>
        </div>
      </Container>

      <Container>
        <Newsletter />
      </Container>

      <Container className="pb-section">
        <SectionRule label={dict.ui.related} />
        <div className="mt-10 lg:mt-12">
          <TriColGrid>
            {related.map((a) => (
              <ArticleCard key={a.slug} article={a} variant="standard" />
            ))}
          </TriColGrid>
        </div>
      </Container>

      <Container className="pb-section">
        <Link
          href="/"
          className="editorial-link text-[0.6875rem] tracking-[0.22em] uppercase text-neutral-200 hover:text-white"
        >
          ← {dict.ui.backToHome}
        </Link>
      </Container>
    </article>
  );
}
