"use client";

import { useLanguage } from "@/context/LanguageContext";

/* AITECH TOKYO language toggle — terminal-style EN | JA segment with the
   active language glowing neon-cyan. Mono font for the keycap feel. */
export default function LanguageToggle({ className = "" }: { className?: string }) {
  const { lang, toggle } = useLanguage();
  const next = lang === "en" ? "JA" : "EN";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch language to ${next}`}
      className={`group inline-flex items-center gap-2 font-mono text-[0.6875rem] tracking-[0.22em] uppercase transition-colors duration-200 ${className}`}
    >
      <span
        aria-hidden
        className={lang === "en"
          ? "text-neon-cyan drop-shadow-[0_0_6px_rgba(0,229,255,0.6)]"
          : "text-ink-400 group-hover:text-ink-800"}
      >
        EN
      </span>
      <span aria-hidden className="h-3 w-px bg-white/15" />
      <span
        aria-hidden
        className={lang === "ja"
          ? "text-neon-magenta drop-shadow-[0_0_6px_rgba(255,45,161,0.6)]"
          : "text-ink-400 group-hover:text-ink-800"}
      >
        JA
      </span>
    </button>
  );
}
