"use client";

import { notFound, useParams } from "next/navigation";
import { CATEGORY_ORDER, type CategoryKey } from "@/lib/i18n";
import { useLanguage } from "@/context/LanguageContext";
import { getArticlesByCategory } from "@/data/articles";
import ArticleCard from "@/components/ArticleCard";
import ToolCard from "@/components/ToolCard";
import { DirectoryGrid } from "@/components/DirectoryGrid";
import { Container, SectionRule, TriColGrid } from "@/components/GridSystem";
import { PageAura } from "@/components/PageAura";
import Newsletter from "@/components/Newsletter";
import { getLayoutMode } from "@/site.config";

const isCategory = (v: string): v is CategoryKey =>
  (CATEGORY_ORDER as readonly string[]).includes(v);

export default function CategoryPage() {
  const params = useParams<{ category: string }>();
  const { dict } = useLanguage();
  const category = params?.category;
  const layoutMode = getLayoutMode();

  if (!category || !isCategory(category)) {
    notFound();
  }

  const list = getArticlesByCategory(category);
  const label = dict.categories[category as CategoryKey];

  return (
    <>
      {/* Per-page aura — Blue (matches home, same "directory" feel) */}
      <PageAura tone="blue" />

      <Container className="pt-12 lg:pt-16 pb-12">
        <p className="eyebrow text-neon-cyan">{dict.ui.moreIn}</p>
        <h1 className="mt-4 font-sans font-semibold text-[clamp(2.75rem,6vw,5rem)] leading-[1.02] tracking-[-0.022em] text-ink">
          {label}
        </h1>
        <p className="mt-6 max-w-[68ch] text-base text-ink-700 leading-relaxed">
          {dict.brand.tagline}
        </p>
        <div className="silver-rule mt-10" />
      </Container>

      <Container className="pb-section">
        <SectionRule label={dict.ui.latest} />
        <div className="mt-10 lg:mt-12">
          {list.length > 0 ? (
            layoutMode === "directory" ? (
              <DirectoryGrid>
                {list.map((a) => (
                  <ToolCard key={a.slug} article={a} />
                ))}
              </DirectoryGrid>
            ) : (
              <TriColGrid>
                {list.map((a) => (
                  <ArticleCard key={a.slug} article={a} variant="standard" />
                ))}
              </TriColGrid>
            )
          ) : (
            <p className="text-base text-ink-600">
              — No tools in this section yet.
            </p>
          )}
        </div>
      </Container>

      <Container>
        <Newsletter />
      </Container>
    </>
  );
}
