/* =============================================================================
   PageAura — per-page Mesh-Gradient backdrop
   -----------------------------------------------------------------------------
   A fixed full-viewport pseudo-layer that paints a soft, large-radius mesh
   gradient behind the page content. Each page picks its own `tone` and the
   palette swaps so the site reads as "the same publication, three moods".

   Tones:
     - "blue"     (Home / index)     — deep blue × cyan, "cutting edge"
     - "magenta"  (Article detail)   — vivid pink × violet, "intellectual heat"
     - "green"    (About)            — neon green × cyan, "autonomous agents"
     - "amber"    (Submit / paid)    — cyber yellow × magenta, "marketplace"
     - "void"     (404 / errors)     — almost monochrome, dimmest

   The mesh is purely decorative. `pointer-events: none` + `z-index: 0` ensure
   it never blocks interaction. Header / main / footer sit at z-index: 1+.

   Server-component-safe: no client hooks, no state — just CSS.
   ========================================================================== */

type Tone = "blue" | "magenta" | "green" | "amber" | "void";

const TONES: Record<Tone, string> = {
  blue: `
    radial-gradient(42% 50% at 14% 18%, rgba(0, 102, 255, 0.55), transparent 70%),
    radial-gradient(45% 45% at 84% 22%, rgba(0, 229, 255, 0.45), transparent 75%),
    radial-gradient(38% 42% at 50% 92%, rgba(40, 90, 230, 0.42), transparent 75%),
    radial-gradient(50% 50% at 50% 50%, rgba(20, 30, 80, 0.30), transparent 80%)
  `,
  magenta: `
    radial-gradient(40% 50% at 14% 16%, rgba(255, 45, 161, 0.55), transparent 72%),
    radial-gradient(45% 45% at 86% 24%, rgba(176, 102, 255, 0.42), transparent 75%),
    radial-gradient(38% 40% at 50% 92%, rgba(247, 0, 110, 0.42), transparent 78%),
    radial-gradient(50% 50% at 50% 50%, rgba(60, 10, 60, 0.25), transparent 80%)
  `,
  green: `
    radial-gradient(42% 50% at 14% 18%, rgba(109, 255, 75, 0.45), transparent 72%),
    radial-gradient(40% 40% at 86% 22%, rgba(0, 229, 200, 0.38), transparent 75%),
    radial-gradient(38% 40% at 50% 92%, rgba(60, 220, 180, 0.40), transparent 78%),
    radial-gradient(50% 50% at 50% 50%, rgba(15, 60, 30, 0.25), transparent 80%)
  `,
  amber: `
    radial-gradient(42% 50% at 14% 18%, rgba(247, 255, 0, 0.30), transparent 72%),
    radial-gradient(40% 40% at 86% 22%, rgba(255, 145, 0, 0.35), transparent 75%),
    radial-gradient(38% 40% at 50% 92%, rgba(255, 45, 161, 0.30), transparent 78%)
  `,
  void: `
    radial-gradient(45% 45% at 50% 30%, rgba(80, 80, 110, 0.20), transparent 80%),
    radial-gradient(40% 40% at 50% 80%, rgba(40, 40, 70, 0.18), transparent 80%)
  `
};

export function PageAura({
  tone,
  intensity = 1
}: {
  tone: Tone;
  /** 0.4 (whisper) – 1 (default) – 1.5 (heavy). Multiplies the layer opacity. */
  intensity?: number;
}) {
  const clamped = Math.max(0.3, Math.min(1.6, intensity));
  return (
    <div
      aria-hidden
      className="page-aura"
      style={{
        backgroundImage: TONES[tone],
        opacity: clamped
      }}
    />
  );
}

export type { Tone as PageAuraTone };
