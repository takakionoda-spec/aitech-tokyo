"use client";

import Link from "next/link";
import ArticleCard from "@/components/ArticleCard";
import ToolCard from "@/components/ToolCard";
import { DirectoryGrid } from "@/components/DirectoryGrid";
import { PageAura } from "@/components/PageAura";
import Newsletter from "@/components/Newsletter";
import {
  Container,
  HeroGrid,
  LeadGrid,
  SectionRule,
  TriColGrid
} from "@/components/GridSystem";
import { useLanguage } from "@/context/LanguageContext";
import {
  getFeaturedArticles,
  getLatestArticles,
  articles
} from "@/data/articles";
import { siteConfig, CATEGORY_ORDER, getLayoutMode } from "@/site.config";

export default function HomePage() {
  const mode = getLayoutMode();
  return (
    <>
      {/* Per-page aura — Deep Blue × Cyan, "cutting edge" mood */}
      <PageAura tone="blue" />
      {mode === "directory" ? <DirectoryHome /> : <MagazineHome />}
    </>
  );
}

/* ---------------------------------------------------------------------------
   MagazineHome — the existing ARTEMIS TOKYO layout (kept verbatim except for
   the CATEGORY_ORDER fix). Active whenever siteConfig.layout.mode !== "directory".
   ------------------------------------------------------------------------- */
function MagazineHome() {
  const { lang, dict } = useLanguage();
  const empty = siteConfig.chrome.emptyState;

  const featured = getFeaturedArticles();
  const hero = featured[0] ?? articles[0];
  const heroAside =
    featured.slice(1, 3).length > 0 ? featured.slice(1, 3) : articles.slice(1, 3);
  const lead = articles.find((a) => a !== hero && !heroAside.includes(a));
  const minimal = articles
    .filter((a) => a !== hero && !heroAside.includes(a) && a !== lead)
    .slice(0, 3);
  const latest = getLatestArticles(6);

  if (!hero) {
    return (
      <Container className="py-section">
        <div className="max-w-[68ch]">
          <p className="eyebrow">{empty.eyebrow[lang]}</p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.95] tracking-[-0.025em] whitespace-pre-line">
            {empty.heading[lang]}
          </h1>
          <p className="mt-6 text-lg text-ink-600 leading-relaxed">
            {empty.lede[lang]}
          </p>
          <div className="silver-rule mt-12" />
          <p className="mt-10 byline">{empty.nextDispatch[lang]}</p>
        </div>
        <div className="mt-20">
          <Newsletter />
        </div>
      </Container>
    );
  }

  return (
    <>
      <Container className="pt-10 lg:pt-14 pb-section">
        <SectionRule
          label={dict.ui.featured}
          action={
            dict.ui.issue +
            " — " +
            new Date().toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
              year: "numeric",
              month: "long"
            })
          }
        />
        <div className="mt-10 lg:mt-12">
          <HeroGrid
            left={<ArticleCard article={hero} variant="hero" priority />}
            right={
              <>
                {heroAside.map((a) => (
                  <ArticleCard key={a.slug} article={a} variant="lead" />
                ))}
              </>
            }
          />
        </div>
      </Container>

      {lead ? (
        <Container className="pb-section">
          <SectionRule
            label={dict.ui.latest}
            action={
              <Link
                href={`/category/${CATEGORY_ORDER[0]}`}
                className="hover:text-ink"
              >
                {dict.ui.moreIn} {dict.categories[CATEGORY_ORDER[0]]}
              </Link>
            }
          />
          <div className="mt-10 lg:mt-12">
            <LeadGrid
              lead={<ArticleCard article={lead} variant="lead" />}
              items={
                <>
                  {minimal.map((a, i) => (
                    <div key={a.slug} className={i === 0 ? "" : "pt-8"}>
                      <ArticleCard article={a} variant="minimal" />
                    </div>
                  ))}
                </>
              }
            />
          </div>
        </Container>
      ) : null}

      <Container>
        <Newsletter />
      </Container>

      {latest.length > 0 ? (
        <Container className="pb-section">
          <SectionRule label={dict.ui.latest} />
          <div className="mt-10 lg:mt-12">
            <TriColGrid>
              {latest.map((a) => (
                <ArticleCard key={a.slug} article={a} variant="standard" />
              ))}
            </TriColGrid>
          </div>
        </Container>
      ) : null}
    </>
  );
}

/* ---------------------------------------------------------------------------
   DirectoryHome — AITECH TOKYO grid-card layout. Active when
   siteConfig.layout.mode === "directory". Reads `directory.pageSize`,
   `directory.showEditorsPicks`, `directory.showSectionRule` from config.
   ------------------------------------------------------------------------- */
function DirectoryHome() {
  const { lang, dict } = useLanguage();
  const empty = siteConfig.chrome.emptyState;
  const dirCfg = siteConfig.layout?.directory;
  const pageSize = dirCfg?.pageSize ?? 24;
  const showPicks = dirCfg?.showEditorsPicks ?? false;
  const showRule = dirCfg?.showSectionRule ?? true;

  const featured = getFeaturedArticles().slice(0, 3);
  const all = getLatestArticles(pageSize);

  // Empty state — same copy/shape as Magazine, just no hero column.
  if (all.length === 0) {
    return (
      <Container className="py-section">
        <div className="max-w-[68ch]">
          <p className="eyebrow">{empty.eyebrow[lang]}</p>
          <h1 className="mt-6 font-display text-[clamp(2.75rem,6vw,5rem)] leading-[0.95] tracking-[-0.025em] whitespace-pre-line">
            {empty.heading[lang]}
          </h1>
          <p className="mt-6 text-lg text-ink-600 leading-relaxed">
            {empty.lede[lang]}
          </p>
          <div className="silver-rule mt-12" />
          <p className="mt-10 byline">{empty.nextDispatch[lang]}</p>
        </div>
        <div className="mt-20">
          <Newsletter />
        </div>
      </Container>
    );
  }

  return (
    <>
      {/* Editor's Picks — 3-up at the top, only if config asks for it AND
          there are featured items. Falls back silently otherwise. */}
      {showPicks && featured.length > 0 ? (
        <Container className="pt-10 lg:pt-14 pb-section">
          <SectionRule
            label={dict.ui.featured}
            action={
              dict.ui.issue +
              " — " +
              new Date().toLocaleDateString(lang === "ja" ? "ja-JP" : "en-US", {
                year: "numeric",
                month: "long"
              })
            }
          />
          <div className="mt-10 lg:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-8">
            {featured.map((a, i) => (
              <ToolCard key={a.slug} article={a} priority={i === 0} />
            ))}
          </div>
        </Container>
      ) : null}

      {/* Main grid — driven by `directory.columns` in site.config.ts. */}
      <Container className={`pb-section ${showPicks ? "" : "pt-10 lg:pt-14"}`}>
        {showRule ? <SectionRule label={dict.ui.latest} /> : null}
        <div className={showRule ? "mt-10 lg:mt-12" : ""}>
          <DirectoryGrid>
            {all.map((a) => (
              <ToolCard key={a.slug} article={a} />
            ))}
          </DirectoryGrid>
        </div>
      </Container>

      {/* Submit Tool CTA block — only if siteConfig.brand.cta is declared.
          Cyber-glass panel with neon outline CTA. */}
      {dict.ui.cta ? (
        <Container className="pb-section">
          <div className="glass glow-aurora p-8 lg:p-10 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="max-w-xl">
              <p className="eyebrow text-neon-magenta">{dict.ui.cta.label}</p>
              <p className="mt-4 text-base lg:text-lg text-ink-700 leading-relaxed">
                {dict.ui.cta.hint}
              </p>
            </div>
            <Link
              href={dict.ui.cta.href}
              className="btn-neon btn-neon--magenta self-start md:self-end"
            >
              {dict.ui.cta.label} <span aria-hidden>→</span>
            </Link>
          </div>
        </Container>
      ) : null}

      <Container>
        <Newsletter />
      </Container>
    </>
  );
}
