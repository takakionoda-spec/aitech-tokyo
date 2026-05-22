"use client";

import { ReactNode } from "react";

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mx-auto max-w-[1440px] px-6 lg:px-10 ${className}`}>{children}</div>
  );
}

export function SectionRule({ label, action }: { label: string; action?: ReactNode }) {
  return (
    <div className="relative flex items-end justify-between gap-4 pt-5">
      {/* Hairline gradient rule, not a solid line — matches Header/Footer. */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent"
      />
      <h2 className="eyebrow text-ink">{label}</h2>
      {action ? (
        <div className="font-mono text-[0.625rem] tracking-[0.22em] uppercase text-ink-600">
          {action}
        </div>
      ) : null}
    </div>
  );
}

export function HeroGrid({ left, right }: { left: ReactNode; right: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12">
      <div className="lg:col-span-8 lg:border-r lg:border-ink-200 lg:pr-8">{left}</div>
      <aside className="lg:col-span-4 flex flex-col gap-10">{right}</aside>
    </div>
  );
}

export function TriColGrid({ children }: { children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
      {children}
    </div>
  );
}

export function LeadGrid({ lead, items }: { lead: ReactNode; items: ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-12">
      <div className="lg:col-span-7">{lead}</div>
      <div className="lg:col-span-5 grid grid-cols-1 gap-8 divide-y divide-ink-200">
        {items}
      </div>
    </div>
  );
}
