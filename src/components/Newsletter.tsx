"use client";

import { FormEvent, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";

/* =============================================================================
   Newsletter — async-submitting signup form
   -----------------------------------------------------------------------------
   POSTs to /api/subscribe and reflects the response in the UI:
     idle    → input + button
     loading → input disabled, button shows ⌛ label, ignores extra submits
     success → form replaced with thank-you block + small "subscribe another"
               link to re-arm
     error   → button enabled again, inline error message under the field

   Provider-agnostic: the route handler decides whether to log or to forward to
   Resend / Loops / Mailchimp / Google Sheets. This component only knows
   { success: true } vs { success: false, error: ... }.
   ========================================================================== */

type Status = "idle" | "loading" | "success" | "error";

type SubscribeResponse = {
  success: boolean;
  error?: "invalid_email" | "duplicate" | "rate_limited" | "server_error" | "upstream_error";
  provider?: string;
};

/** Bilingual UI strings local to this component. Kept inline (rather than
 *  threaded through siteConfig.chrome.newsletter.states) because they're
 *  transient — visible only during the 200ms after the user clicks submit. */
const COPY = {
  en: {
    loading: "Subscribing…",
    success: "Thanks — you're on the list. See you in the next dispatch.",
    successAgain: "Subscribe another",
    invalid: "That email looks malformed. Please double-check.",
    duplicate: "This address is already on the list.",
    rate: "Too many attempts — please try again in a minute.",
    server: "Something went wrong on our end. Please try again.",
    upstream: "Our newsletter provider is having a moment. Try again shortly."
  },
  ja: {
    loading: "送信中…",
    success: "登録ありがとうございます。次回の Patch Notes でお会いしましょう。",
    successAgain: "別のメールアドレスで登録",
    invalid: "メールアドレスの形式を確認してください。",
    duplicate: "このアドレスは既に登録されています。",
    rate: "短時間に何度も送信されました。少し時間をおいて再度お試しください。",
    server: "サーバーで一時的なエラーが発生しました。もう一度お試しください。",
    upstream: "ニュースレター連携先で問題が発生しています。少し経ってからお試しください。"
  }
} as const;

export default function Newsletter() {
  const { lang, dict } = useLanguage();
  const t = COPY[lang];

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState<string>("");

  function pickErrorMessage(code: SubscribeResponse["error"]): string {
    switch (code) {
      case "invalid_email":
        return t.invalid;
      case "duplicate":
        return t.duplicate;
      case "rate_limited":
        return t.rate;
      case "upstream_error":
        return t.upstream;
      case "server_error":
      default:
        return t.server;
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (status === "loading") return;

    const trimmed = email.trim();
    if (!trimmed) {
      setStatus("error");
      setErrorMsg(t.invalid);
      return;
    }

    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmed })
      });
      const data = (await res.json().catch(() => ({}))) as SubscribeResponse;

      if (res.ok && data.success) {
        setStatus("success");
        setEmail("");
        return;
      }

      setStatus("error");
      setErrorMsg(pickErrorMessage(data.error));
    } catch (err) {
      // Network / fetch threw — treat as server error.
      console.error("[Newsletter] submit failed:", err);
      setStatus("error");
      setErrorMsg(t.server);
    }
  }

  function reset() {
    setStatus("idle");
    setErrorMsg("");
    setEmail("");
  }

  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const hasError = status === "error";

  return (
    <section
      id="newsletter"
      className="glass glow-aurora p-8 lg:p-12 my-section"
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-10 gap-y-8 items-end">
        <div className="lg:col-span-6">
          <p className="eyebrow text-neon-cyan">{dict.ui.newsletter.eyebrow}</p>
          <h2 className="mt-5 font-sans font-semibold text-[clamp(1.75rem,3.5vw,2.75rem)] leading-[1.1] tracking-[-0.012em] whitespace-pre-line text-ink">
            {dict.ui.newsletter.heading}
          </h2>
          <p className="mt-5 max-w-xl text-base text-ink-600 leading-relaxed">
            {dict.ui.newsletter.lede}
          </p>
        </div>

        <div className="lg:col-span-6">
          {isSuccess ? (
            <div
              className="flex flex-col gap-4"
              role="status"
              aria-live="polite"
            >
              <p className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-neon-acid">
                ✓ {lang === "ja" ? "登録完了" : "Confirmed"}
              </p>
              <p className="text-base lg:text-lg text-ink leading-relaxed">
                {t.success}
              </p>
              <button
                type="button"
                onClick={reset}
                className="self-start editorial-link text-[0.6875rem] tracking-[0.22em] uppercase text-ink-600 hover:text-ink"
              >
                ← {t.successAgain}
              </button>
            </div>
          ) : (
            <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
              <label
                htmlFor="newsletter-email"
                className="font-mono text-[0.6875rem] tracking-[0.22em] uppercase text-ink-600"
              >
                Email
              </label>
              <div className="flex items-center gap-3 glass-flat rounded-full px-4 py-1">
                <input
                  id="newsletter-email"
                  type="email"
                  required
                  autoComplete="email"
                  placeholder={dict.ui.newsletter.placeholder}
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (hasError) {
                      setStatus("idle");
                      setErrorMsg("");
                    }
                  }}
                  disabled={isLoading}
                  aria-invalid={hasError || undefined}
                  aria-describedby={hasError ? "newsletter-error" : undefined}
                  className="flex-1 bg-transparent text-base text-ink outline-none placeholder:text-ink-500 px-2 py-3 disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={isLoading || !email.trim()}
                  className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-white/18 disabled:hover:text-ink disabled:hover:shadow-none"
                >
                  {isLoading ? t.loading : dict.ui.newsletter.cta}
                </button>
              </div>

              {hasError ? (
                <p
                  id="newsletter-error"
                  role="alert"
                  aria-live="assertive"
                  className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-neon-magenta"
                >
                  ✗ {errorMsg}
                </p>
              ) : (
                <p className="font-mono text-[0.6875rem] tracking-[0.18em] uppercase text-ink-600">
                  {dict.ui.newsletter.disclaimer}
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
