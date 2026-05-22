"use client";

import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";
import { CATEGORY_ORDER } from "@/lib/i18n";

/* AITECH TOKYO navigation — wide-tracked sans uppercase pills that morph into
   neon-underline links on hover. No borders, no dividers. */
export default function Navigation({
  variant = "primary"
}: {
  variant?: "primary" | "compact";
}) {
  const { dict } = useLanguage();

  const baseClass =
    variant === "primary"
      ? "flex items-center gap-7 text-[0.6875rem] tracking-[0.32em] uppercase font-medium"
      : "flex items-center gap-5 text-[0.625rem] tracking-[0.28em] uppercase font-medium text-ink-600";

  return (
    <nav aria-label="Sections" className={baseClass}>
      {CATEGORY_ORDER.map((key) => (
        <Link
          key={key}
          href={`/category/${key}`}
          className="editorial-link text-ink-800 hover:text-ink"
        >
          {dict.categories[key]}
        </Link>
      ))}
    </nav>
  );
}
