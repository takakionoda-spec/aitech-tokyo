"use client";

import { ReactNode } from "react";
import { siteConfig } from "@/site.config";

/* =============================================================================
   DirectoryGrid
   -----------------------------------------------------------------------------
   Responsive grid driven by `siteConfig.layout.directory.columns`. The
   breakpoint → column-count mapping is read from config at render so changing
   `columns: { base, sm, md, lg }` in site.config.ts changes the layout without
   editing this file.

   Tailwind safelist note: the class strings are PRE-COMPOSED literals so the
   JIT compiler keeps them. See `globals.css` `@layer base` safelist comment
   if column counts beyond 1–4 are needed.
   ========================================================================== */

const COL_CLASS = {
  1: "grid-cols-1",
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-4",
  5: "grid-cols-5",
  6: "grid-cols-6"
} as const;

const SM_COL_CLASS = {
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
  4: "sm:grid-cols-4",
  5: "sm:grid-cols-5",
  6: "sm:grid-cols-6"
} as const;

const MD_COL_CLASS = {
  1: "md:grid-cols-1",
  2: "md:grid-cols-2",
  3: "md:grid-cols-3",
  4: "md:grid-cols-4",
  5: "md:grid-cols-5",
  6: "md:grid-cols-6"
} as const;

const LG_COL_CLASS = {
  1: "lg:grid-cols-1",
  2: "lg:grid-cols-2",
  3: "lg:grid-cols-3",
  4: "lg:grid-cols-4",
  5: "lg:grid-cols-5",
  6: "lg:grid-cols-6"
} as const;

type ColumnCount = keyof typeof COL_CLASS;

function clampColumns(n: number | undefined, fallback: ColumnCount): ColumnCount {
  const v = Math.max(1, Math.min(6, n ?? fallback));
  return v as ColumnCount;
}

export function DirectoryGrid({ children }: { children: ReactNode }) {
  const c = siteConfig.layout?.directory?.columns ?? {
    base: 1,
    sm: 2,
    md: 3,
    lg: 4
  };

  const base = clampColumns(c.base, 1);
  const sm = clampColumns(c.sm, 2);
  const md = clampColumns(c.md, 3);
  const lg = clampColumns(c.lg, 4);

  return (
    <div
      className={`grid ${COL_CLASS[base]} ${SM_COL_CLASS[sm]} ${MD_COL_CLASS[md]} ${LG_COL_CLASS[lg]} gap-x-6 gap-y-8`}
    >
      {children}
    </div>
  );
}
