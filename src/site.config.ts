/* =============================================================================
   SITE CONFIG — AITECH TOKYO  (template boundary)
   =============================================================================
   Sister title #2, derived from the ARTEMIS TOKYO template per AGENTS.md.

   What changed vs. ARTEMIS TOKYO (kept intentionally minimal):
     1. `brand`     — re-skinned to AITECH TOKYO, AI-tools subject, Tokyo vantage.
     2. `brand.cta` — NEW (optional). Adds a "Submit Tool" button surfaced in
                      Header / Footer / Home. Backward-compatible: omit on
                      ARTEMIS to hide the CTA.
     3. `layout`    — NEW (optional). `mode: "magazine" | "directory"` switches
                      the homepage between editorial flow and grid-card flow.
                      ARTEMIS keeps "magazine" (default); AITECH uses "directory".
     4. `categories`— AI-tool taxonomy (llm-tools / dev-tools / ai-gadgets /
                      workflow). Same `CategoryDef` shape, same `as const`
                      derivation — `CategoryKey` updates automatically.
     5. `pipeline.sources` — Product Hunt, Hacker News, TechCrunch AI,
                      VentureBeat AI. Per-source `framing` notes preserved.
     6. `pipeline.voice` — Tokyo dev-hacker register (BoF×Brutus → ≪WIRED日本版
                      ×個人開発者ブログ≫), with `structuredFields` (NEW, optional)
                      declaring the 4 per-tool data points the LLM must output:
                        tagline / useCase / vsCompetitor / tokyoTake
     7. `pipeline.voice.closingBlock.outputKey` — repurposed to `tokyo_take`
                      so the existing renderer/cron path keeps working without
                      any code change at the closing-block layer.

   Code-level changes required outside this file are listed in MIGRATION_PLAN.md.
   ========================================================================== */

export type Lang = "en" | "ja";
export type Bilingual<T = string> = { en: T; ja: T };

/* ---------------------------------------------------------------------------
   Category definition — identical shape to ARTEMIS TOKYO so types & helpers
   in src/lib/i18n.ts and src/site.config.ts derivations work unchanged.
   ------------------------------------------------------------------------- */
export type CategoryDef = {
  key: string;
  name: Bilingual;
  /** Definition copy injected into the LLM system prompt so it picks
   *  the right category at edit time. */
  definitionForLlm: string;
  /** Visual cover image pool — Unsplash photo IDs only (no full URL).
   *  For a directory site, this acts as a fallback when the source RSS
   *  has no image. Aim for at least 8 IDs per category, strictly distinct
   *  across categories — cron-publisher pickCover() warns at load. */
  coverPool: { id: string; tone: string }[];
  /** Fallback category keys (in preference order) when the home pool is exhausted. */
  fallback: string[];
};

/* ---------------------------------------------------------------------------
   Source definition (unchanged from ARTEMIS TOKYO).
   ------------------------------------------------------------------------- */
export type SourceDef = {
  name: string;
  url: string;
  parse: "rss" | "atom";
  /** Must match a categories[].key. */
  category: string;
  /** Optional relevance filter — applied to title+summary. */
  filter?: RegExp;
  /** Single-sentence framing note injected per-source into the LLM prompt. */
  framing?: string;
};

/* ---------------------------------------------------------------------------
   NEW: structured-field definition.
   The LLM is asked to emit one bilingual field per entry, keyed by `key`.
   The cron-publisher composes the JSON schema from this array (just like it
   already does for `closingBlock`), and the renderer surfaces these fields on
   each ToolCard / detail page.

   `type` controls the JSON shape requested from the LLM and the render slot:
     - "line"      → 1 short string per language (e.g. tagline)
     - "paragraph" → 1–2 sentence string per language (card body)
     - "block"     → 3–5 paragraph string[] per language (long form)

   `display.role` is a UI hint consumed by ToolCard:
     - "headline"  → render at the top of the card, large
     - "body"      → render under the headline, smaller
     - "footnote"  → render below the body, smallest
     - "verdict"   → render as a tagged callout (e.g. "Tokyo Take")

   Omit `structuredFields` entirely (or set [] ) to disable — ARTEMIS TOKYO
   does not set it, the cron skips the section.
   ------------------------------------------------------------------------- */
export type StructuredFieldType = "line" | "paragraph" | "block";
export type StructuredFieldRole = "headline" | "body" | "footnote" | "verdict";
export type StructuredFieldDef = {
  /** Machine key. Used as JSON key prefix: `${key}_en`, `${key}_ja`. */
  key: string;
  /** Bilingual display label rendered above the field on cards and details. */
  label: Bilingual;
  /** JSON output shape. */
  type: StructuredFieldType;
  /** Soft character limits per language. Mentioned in the LLM prompt; not enforced. */
  charLimit?: Partial<Record<Lang, number>>;
  /** Where the field is rendered. */
  display: { role: StructuredFieldRole; onCard: boolean; onDetail: boolean };
  /** Prompt copy telling the LLM what to put in this field. */
  descriptionForLlm: string;
};

/* ---------------------------------------------------------------------------
   The configuration object itself.
   ------------------------------------------------------------------------- */
export const siteConfig = {
  /* ------------------------------------------------------------------ BRAND */
  brand: {
    /** Display name in uppercase tracking (Header / Footer masthead). */
    name: "AITECH TOKYO",
    /** Wordmark as rendered in Header/Footer (mixed case allowed). */
    wordmark: "Aitech Tokyo",
    /** Canonical site URL — used by SEO, sitemap, JSON-LD, cron User-Agent. */
    siteUrl: "https://aitech-tokyo.vercel.app",
    /** Editorial subject — used in metadata description and the LLM voice. */
    subject: {
      en: "the global wave of AI tools, indie-developer products, and LLM-adjacent gadgets, indexed nightly from a Tokyo desk",
      ja: "世界中の最新AIツール、インディ開発者のプロダクト、LLM関連ガジェットを、東京から毎晩インデックスするディレクトリ"
    },
    /** Vantage city — appears in copy and is offered to the LLM as part of voice. */
    city: { en: "Tokyo", ja: "東京" },
    /** Keywords (SEO). */
    keywords: [
      "AI tools",
      "AI directory",
      "LLM",
      "ChatGPT alternatives",
      "indie hackers",
      "Product Hunt",
      "Hacker News",
      "developer tools",
      "AI gadgets",
      "AI agents",
      "Tokyo",
      "Japan",
      "東京",
      "AIツール"
    ],
    /** Issue counter origin — keep the masthead "Vol. xx — YYYY" rolling. */
    issueBase: { year: 2026, month: 5 },

    /** ----------------------------------------------------------------- NEW
     *  Primary CTA — surfaced in Header (utility row), Footer, and the home
     *  page tail. Used here for paid tool submissions. Optional: omit on
     *  sister titles where no CTA is wanted (ARTEMIS TOKYO omits it).
     *  ------------------------------------------------------------------- */
    cta: {
      label: { en: "Submit Tool", ja: "ツールを掲載する" },
      /** Internal route OR external URL — Header renders <Link> for "/..." and
       *  <a target="_blank"> for "http..." */
      href: "/submit",
      /** Short hint shown next to the button on the home page CTA block. */
      hint: {
        en: "Paid placement — guaranteed top of the grid for one issue.",
        ja: "有料掲載枠 — 1イシュー固定でグリッド最上段に掲載。"
      }
    }
  },

  /* ------------------------------------------------------------------ LAYOUT
     NEW. Selects the page-level rendering mode. Backward-compatible: when
     omitted, the homepage falls back to "magazine" (ARTEMIS TOKYO behavior).
     ---------------------------------------------------------------------- */
  layout: {
    /** "magazine" — hero + lead + tri-col (ARTEMIS TOKYO).
     *  "directory" — grid of cards, no hero, optional editor's picks row. */
    mode: "directory" as const,
    directory: {
      /** Tailwind-style breakpoint → column count. Read by DirectoryGrid. */
      columns: { base: 1, sm: 2, md: 3, lg: 4 },
      /** Show the 3-up "Editor's Picks" row above the main grid. */
      showEditorsPicks: true,
      /** Show the section rule above the grid. */
      showSectionRule: true,
      /** Cap the main grid at N items per page (excluding editor's picks). */
      pageSize: 24,
      /** When TRUE: any cover that came from the Unsplash fallback pool is
       *  re-rendered as a flat category-tone tile (with a single-letter
       *  brand mark) instead of showing the stock photo. FALSE means even
       *  Unsplash fallbacks are rendered as images.
       *  Set to FALSE while the cron is still warming up so real RSS images
       *  show as they arrive; flip to TRUE once the index is dense with
       *  tool-specific thumbnails. */
      preferToneTileOverStockCover: false
    }
  },

  /* ----------------------------------------------------------------- CHROME
     Localized chrome strings. Same shape as ARTEMIS TOKYO so i18n.ts builds
     a Dictionary with no code changes. Copy retuned for a directory site.
     ---------------------------------------------------------------------- */
  chrome: {
    tagline: {
      en: "A nightly index of the AI tools, LLM gadgets, and indie products shipping worldwide — curated and gut-checked from Tokyo.",
      ja: "世界中で生まれるAIツール、LLMガジェット、個人開発プロダクトを、毎晩インデックス — 東京の編集部による辛口キュレーション。"
    },
    legal: {
      en: "© 2026 AITECH TOKYO. All rights reserved.",
      ja: "© 2026 AITECH TOKYO. 全著作権所有。"
    },
    nav: {
      home: { en: "Home", ja: "ホーム" },
      about: { en: "About", ja: "ABOUT" },
      subscribe: { en: "Newsletter", ja: "ニュースレター" }
    },
    ui: {
      readMore: { en: "Open", ja: "開く" },
      by: { en: "Via", ja: "経由" },
      minRead: { en: "min read", ja: "分で読了" },
      featured: { en: "Editor's Picks", ja: "編集部ピック" },
      latest: { en: "Recently Indexed", ja: "最近インデックスされたツール" },
      related: { en: "Adjacent Tools", ja: "関連ツール" },
      backToHome: { en: "Back to grid", ja: "グリッドへ戻る" },
      issue: { en: "Index", ja: "INDEX" },
      moreIn: { en: "More in", ja: "もっと見る:" }
    },
    newsletter: {
      eyebrow: { en: "The Patch Notes", ja: "PATCH NOTES" },
      heading: {
        en: "A weekly patch note on the AI tools worth your week.",
        ja: "今週試す価値のあるAIツール、\n週に一通の Patch Notes。"
      },
      lede: {
        en: "Each Friday: 5 tools that earned a place in our grid this week, 1 we quietly removed, and a short Tokyo-take on what's shifting beneath the launches.",
        ja: "毎週金曜。今週グリッドに残った5本、静かに消した1本、そしてローンチの裏で何が動いているかについての東京視点の短い解説をお届け。"
      },
      placeholder: { en: "Your email address", ja: "メールアドレス" },
      cta: { en: "Subscribe", ja: "購読する" },
      disclaimer: {
        en: "We respect your inbox. Unsubscribe anytime.",
        ja: "受信箱を尊重します。いつでも解除可能。"
      }
    },
    footer: {
      copy: {
        en: "AITECH TOKYO is a bilingual directory of AI tools, LLM-adjacent gadgets, and indie-developer products. Every entry is sourced from Product Hunt, Hacker News, TechCrunch AI, and VentureBeat AI, then gut-checked from Tokyo against three questions: is it useful, what makes it different, and does it work in Japanese.",
        ja: "AITECH TOKYO は、世界中のAIツール・LLM関連ガジェット・個人開発プロダクトのバイリンガル・ディレクトリです。Product Hunt、Hacker News、TechCrunch AI、VentureBeat AI の各ソースから毎晩収集し、「本当に使えるか」「既存ツールと何が違うか」「日本語環境で機能するか」の3つを東京の編集部が辛口で評価して掲載しています。"
      },
      strapline: "Tokyo · LLM-Native · Indie-First"
    },
    languageToggle: { en: "JA", ja: "EN" },
    notFound: {
      title: { en: "404 — not in the index.", ja: "404 — インデックスにありません。" },
      lede: {
        en: "Either the tool was pulled, the URL was malformed, or the index hasn't caught up yet.",
        ja: "ツールが削除されたか、URLが正しくないか、まだインデックスに反映されていません。"
      },
      back: { en: "Back to the grid", ja: "グリッドへ戻る" }
    },
    emptyState: {
      eyebrow: { en: "Indexing", ja: "インデックス中" },
      heading: {
        en: "The first AITECH TOKYO grid is being built.",
        ja: "AITECH TOKYO の最初のグリッドを\n組み立てています。"
      },
      lede: {
        en: "Our nightly pipeline pulls launches from Product Hunt, Hacker News (Top), TechCrunch AI, and VentureBeat AI, then runs each through a Tokyo dev-hacker filter — Is it useful? How is it different from ChatGPT or existing infra? Does it work in Japanese today? — and writes the result here. The first grid appears as soon as the next cycle completes.",
        ja: "AITECH TOKYO の夜間パイプラインは、Product Hunt、Hacker News（Top）、TechCrunch AI、VentureBeat AI から最新のローンチを取得し、「本当に使えるか」「ChatGPTや既存インフラと何が違うか」「日本語環境で今すぐ使えるか」という東京の個人開発者の目線でフィルタした結果をこの場所に並べます。次回のサイクルが完了次第、最初のグリッドが表示されます。"
      },
      nextDispatch: {
        en: "Next index: 03:00 JST",
        ja: "次回インデックス：日本時間 朝3時"
      }
    }
  },

  /* ------------------------------------------------------------------ ABOUT
     The /about page is data, not code — three blocks in a fixed shape.
     ---------------------------------------------------------------------- */
  about: {
    headline: {
      en: "An AI-tool directory, indexed from Tokyo.",
      ja: "AIツール・ディレクトリを、東京から組む。"
    },
    lede: {
      en: "There are now hundreds of new AI tools shipping every week, most of them indistinguishable from each other on a launch-day landing page. AITECH TOKYO indexes them nightly, strips the marketing, and answers three questions an honest builder actually asks: Is it useful? How is it different from what already exists? Does it work in Japan today?",
      ja: "毎週、何百もの新しいAIツールがローンチされ、その多くはローンチ当日のランディングページ上では区別がつかない。AITECH TOKYO は、それらを毎晩インデックスし、マーケティングを削ぎ落とし、誠実なビルダーが本当に問うべき3つの問いに答えるディレクトリだ — 本当に使えるのか。既存のものと何が違うのか。日本で今すぐ動くのか。"
    },
    blocks: [
      {
        eyebrow: { en: "OUR LINE", ja: "編集の線" },
        heading: {
          en: "A directory, not a magazine.",
          ja: "マガジンではなく、ディレクトリ。"
        },
        body: {
          en: "AITECH TOKYO is not here to write features about AI. It is here to maintain an honest, dated, gut-checked index — one card per tool, four lines that matter, source linked. If a tool earns the grid it stays; if it stops shipping it falls off. We are a directory in the old useful sense, not a magazine pretending to be one.",
          ja: "AITECH TOKYO は、AIをめぐる長い特集記事を書く場所ではない。1つのツールに対して、本当に重要な4行だけを書く — タグライン、使いどころ、既存ツールとの違い、東京からの率直な判定。出典は必ずリンクし、ローンチ日を残す。残るに値するツールは残り、止まったツールはグリッドから外れる。古い意味で本当に役に立つ「ディレクトリ」を、私たちは目指している。"
        }
      },
      {
        eyebrow: { en: "OUR CITY", ja: "私たちの街" },
        heading: {
          en: "Why a Tokyo desk indexes this.",
          ja: "なぜ、東京から見るのか。"
        },
        body: {
          en: "Most AI tools are launched in San Francisco, evaluated in San Francisco, and forgotten in San Francisco — three months before a Japanese developer needs to decide whether to use one. Tokyo's job here is the boring but useful one: read every launch, ask whether the Japanese UI actually works, whether the pricing makes sense at JPY, whether the workflow assumes Slack-and-Stripe infrastructure a Japanese SMB does not have. The grid is gut-checked from where the user actually sits.",
          ja: "AIツールの多くは、サンフランシスコでローンチされ、サンフランシスコで評価され、サンフランシスコで忘れられる — 日本の開発者がそれを採用するかどうか判断しなければならない3ヶ月前に。東京の役割は、退屈だが有用なほうだ。日本語UIが実際に動くか、円建てで価格が割に合うか、ワークフローが日本のSMBには存在しないSlack+Stripe前提を置いていないか — それを毎晩、ユーザーが実際に座っている場所から確認する。"
        }
      },
      {
        eyebrow: { en: "OUR METHOD", ja: "編集の方法" },
        heading: {
          en: "Indexed nightly, signed by the editor.",
          ja: "毎晩インデックス、編集部が署名。"
        },
        body: {
          en: "Every card begins with a real dispatch from Product Hunt, Hacker News, TechCrunch AI, or VentureBeat AI. Our pipeline pulls them at 03:00 JST, asks an LLM to fill four mandatory fields — Tagline, Use Case, vs. Competitor, Tokyo Take — and writes the result to the grid. The Tokyo Take is signed by the editorial line, not by the LLM: it states plainly whether the tool earns a slot in a Japanese workflow today. The original source is always linked.",
          ja: "各カードは、Product Hunt、Hacker News、TechCrunch AI、VentureBeat AI のいずれかの一次情報から始まる。パイプラインは毎晩3時（JST）にそれらを取得し、LLM に4つの必須フィールド — タグライン、使いどころ、既存ツールとの違い、東京視点 — を埋めさせ、結果をグリッドに書き出す。「東京視点」は LLM ではなく編集部のラインによって署名される — 日本のワークフローで今すぐ使えるかどうかを、はっきり書く。原文へのリンクは常に保たれる。"
        }
      }
    ]
  },

  /* ------------------------------------------------------------- CATEGORIES
     AI-tool taxonomy. `key` becomes the URL slug and the LLM's category vote.
     Pool counts must keep cron healthy (>=8 distinct Unsplash IDs per
     category — verify each ID before deploy per AGENTS.md Step 2).
     ---------------------------------------------------------------------- */
  categories: [
    {
      key: "llm-tools",
      name: { en: "LLM Tools", ja: "LLMツール" },
      definitionForLlm:
        "consumer- or pro-grade tools built on top of an LLM: chat UIs, prompt builders, RAG apps, AI search, AI writing, AI design, AI voice. The LLM IS the product.",
      fallback: ["workflow", "dev-tools"],
      coverPool: [
        { id: "1620712943543-bccf2f2c1ae9", tone: "#0d0d0f" },
        { id: "1677442136019-21780ecad995", tone: "#0c0d0f" },
        { id: "1655720828018-edd2daec9349", tone: "#0e0f12" },
        { id: "1684391938577-67c3e8b9c7a8", tone: "#0a0a0c" },
        { id: "1701978500311-7ddd0a30a64f", tone: "#101011" },
        { id: "1697577418970-95d99b5a55cf", tone: "#0c0c0e" },
        { id: "1672239497060-46b39e7e23c4", tone: "#0d0e10" },
        { id: "1717501218385-55bc3a95be94", tone: "#0a0a0a" },
        { id: "1620712943543-26fab76e6f5d", tone: "#0c0c0c" }
      ]
    },
    {
      key: "dev-tools",
      name: { en: "Dev Tools", ja: "開発者ツール" },
      definitionForLlm:
        "developer-facing AI tooling: AI code editors and copilots, LLM observability, eval frameworks, agent SDKs, vector DBs, AI dev CLIs. The user is a builder.",
      fallback: ["llm-tools", "workflow"],
      coverPool: [
        { id: "1517694712202-14dd9538aa97", tone: "#0d0f12" },
        { id: "1555066931-4365d14bab8c", tone: "#0c0c0e" },
        { id: "1542831371-29b0f74f9713", tone: "#0e0e10" },
        { id: "1504639725590-34d0984388bd", tone: "#0b0b0d" },
        { id: "1517180102446-f3ece451e9d8", tone: "#0c0c0e" },
        { id: "1581291518857-4e27b48ff24e", tone: "#101012" },
        { id: "1593720213428-28a5b9e94613", tone: "#0d0d0f" },
        { id: "1531403009284-440f080d1e12", tone: "#08080a" }
      ]
    },
    {
      key: "ai-gadgets",
      name: { en: "AI Gadgets", ja: "AIガジェット" },
      definitionForLlm:
        "hardware where AI is the headline feature: AI wearables (Pin, R1), on-device LLM phones, AI cameras, smart-glasses, voice-first devices, robotics-with-LLM.",
      fallback: ["llm-tools", "workflow"],
      coverPool: [
        { id: "1593344484962-796055d4a3a4", tone: "#1a1a1a" },
        { id: "1606293459339-aa5d34a7b0e1", tone: "#0c0c0c" },
        { id: "1546435770-a3e426bf472b", tone: "#161616" },
        { id: "1518770660439-4636190af475", tone: "#0e0e0e" },
        { id: "1556656793-08538906a9f8", tone: "#0d0d0d" },
        { id: "1572569511254-d8f925fe2cbb", tone: "#121212" },
        { id: "1601445638532-3c6f6c3aa1d6", tone: "#0c0c0c" },
        { id: "1611532736597-de2d4265fba3", tone: "#0a0a0a" },
        { id: "1518770660439-4636190af475", tone: "#101010" } // intentional shared fallback w/ gadgets pool
      ]
    },
    {
      key: "workflow",
      name: { en: "Workflow & Agents", ja: "ワークフロー／エージェント" },
      definitionForLlm:
        "AI applied to workflow: agents, automation orchestrators, AI-augmented productivity, AI in CRM / sales / ops, AI meeting / inbox / calendar tools.",
      fallback: ["llm-tools", "dev-tools"],
      coverPool: [
        { id: "1611224923853-80b023f02d71", tone: "#101010" },
        { id: "1551434678-e076c223a692", tone: "#0a0a0c" },
        { id: "1559136555-9303baea8ebd", tone: "#0c0c0e" },
        { id: "1499951360447-b19be8fe80f5", tone: "#0a0a0c" },
        { id: "1486312338219-ce68d2c6f44d", tone: "#0d0d0f" },
        { id: "1551288049-bebda4e38f71", tone: "#0e0e10" },
        { id: "1454165804606-c3d57bc86b40", tone: "#0a0a0a" },
        { id: "1521737604893-d14cc237f11d", tone: "#0c0c0e" }
      ]
    }
  ] as const,

  /* ----------------------------------------------------------- LEGACY MAP
     Map obsolete category strings to current keys so legacy generated JSON
     entries from earlier crawls keep rendering. Empty on day one; populated
     if/when we rename a category. */
  legacyCategoryMap: {
    "ai-tools": "llm-tools", // pre-launch internal label
    productivity: "workflow",
    hardware: "ai-gadgets"
  } as Record<string, string>,

  /* ----------------------------------------------------------------- PIPELINE
     Sources + voice + image-host allowlist. The cron-publisher reads all of
     this verbatim. Sources for AITECH TOKYO match the requirements brief:
     Product Hunt, Hacker News (Top), TechCrunch AI, VentureBeat AI.
     ---------------------------------------------------------------------- */
  pipeline: {
    /* Reusable relevance regexes — referenced from a source's `filter`.
       Hacker News needs filtering because the front page is broader than AI;
       Product Hunt + TC-AI + VB-AI are already domain-scoped. */
    relevanceFilters: {
      ai: /\b(ai|a\.i\.|llm|llms|gpt|gpt-?\d|chatgpt|claude|gemini|mistral|llama|anthropic|openai|huggingface|hugging[- ]face|transformer|diffusion|stable[- ]diffusion|midjourney|sora|veo|copilot|cursor|devin|agentic|agents?|rag|fine[- ]?tun\w*|prompt\w*|inference|embedding\w*|vector[- ]?db|on[- ]device|tts|asr|whisper|multimodal|vision[- ]language|robotic\w*|wearable|smart[- ]?glass\w*)\b/i,
      // Broader "tech product launch" filter — catches indie dev tools that
      // don't strictly mention AI but are clearly part of the LLM-adjacent
      // ecosystem (vector DBs, dev CLIs, eval frameworks).
      aiOrAdjacent:
        /\b(ai|llm|gpt|claude|gemini|copilot|cursor|agent\w*|rag|prompt\w*|inference|embedding\w*|vector|fine[- ]?tun\w*|transformer|diffusion|midjourney|sora|on[- ]device|edge[- ]?ai|tts|asr|whisper|multimodal|wearable|smart[- ]?glass|robot\w*|eval[s]?|observability|tracing|sdk|cli)\b/i
    },

    sources: [
      {
        name: "Product Hunt",
        url: "https://www.producthunt.com/feed",
        parse: "rss",
        category: "llm-tools",
        // PH publishes a wide mix; we keep only items mentioning AI/LLM/etc.
        // to avoid filling the grid with non-AI consumer apps.
        filter:
          /\b(ai|llm|gpt|chatgpt|claude|gemini|mistral|llama|copilot|cursor|agent\w*|rag|prompt|embedding|vector|stable[- ]diffusion|midjourney|sora|on[- ]device|tts|asr|whisper|multimodal|wearable|robot\w*)\b/i,
        framing:
          "(consumer-facing launch — landing page is marketing; read past it to find the real product line, the realistic user, and the per-seat price)"
      },
      {
        name: "Hacker News Top",
        url: "https://hnrss.org/frontpage",
        parse: "rss",
        category: "dev-tools",
        // HN front page is broad — keep only AI-adjacent.
        filter:
          /\b(ai|a\.i\.|llm|llms|gpt|gpt-?\d|chatgpt|claude|gemini|mistral|llama|anthropic|openai|huggingface|transformer|diffusion|copilot|cursor|devin|agent\w*|rag|fine[- ]?tun\w*|prompt\w*|inference|embedding\w*|vector[- ]?db|on[- ]device|tts|asr|whisper|multimodal|robot\w*|wearable)\b/i,
        framing:
          "(HN front-page surface — comments are usually more useful than the headline; assume your reader is technical and skeptical, write to them)"
      },
      {
        name: "TechCrunch AI",
        url: "https://techcrunch.com/category/artificial-intelligence/feed/",
        parse: "rss",
        category: "llm-tools",
        framing:
          "(industry trade — TechCrunch frames everything as 'AI startup raised X'; ignore the funding theatre, isolate the product and what it actually does)"
      },
      {
        name: "VentureBeat AI",
        url: "https://venturebeat.com/category/ai/feed/",
        parse: "rss",
        category: "workflow",
        framing:
          "(enterprise-AI trade publication — write past the buyer's-guide tone; find the actual workflow change implied for an SMB developer in Japan)"
      },
      // Optional 5th source — uncomment once steady state is reached, to feed
      // the ai-gadgets category which the four primary sources under-populate.
      // {
      //   name: "The Verge / AI",
      //   url: "https://www.theverge.com/ai-artificial-intelligence/rss/index.xml",
      //   parse: "rss",
      //   category: "ai-gadgets",
      //   framing:
      //     "(pop-tech gadget coverage — wearables and consumer hardware; treat hardware names plainly, ignore the launch-day hype cycle)"
      // }
    ] as SourceDef[],

    /** Image hosts the deployed `next/image` is allowed to render. Mirror in
     *  next.config.ts → images.remotePatterns. ANY domain that appears here
     *  must also appear in next.config.ts or images silently 404 in
     *  production. Use `**.example.com` to match all subdomains. */
    allowedImageHosts: [
      // --- Unsplash (fallback covers) ---
      "images.unsplash.com",
      "source.unsplash.com",

      // --- Product Hunt — imgix-hosted product thumbnails ---
      "ph-files.imgix.net",
      "ph-static.imgix.net",
      "**.producthunt.com",
      "**.imgix.net",

      // --- Hacker News — front-page articles link out to wide CDNs;
      //     HN itself doesn't host article images. The wildcards at the
      //     bottom catch the long tail of HN-linked outlets.
      "news.ycombinator.com",

      // --- TechCrunch / WordPress-VIP CDN ---
      "techcrunch.com",
      "**.techcrunch.com",
      "**.tcrn.io",
      "**.wp.com",                 // i0.wp.com, i1.wp.com, i2.wp.com — used heavily
      "**.wordpress.com",
      "**.wpengine.com",

      // --- VentureBeat ---
      "venturebeat.com",
      "**.venturebeat.com",

      // --- Common publisher CDNs (HN front-page articles often pull from these) ---
      "**.medium.com",
      "miro.medium.com",
      "**.substackcdn.com",
      "substackcdn.com",
      "**.substack.com",
      "**.ghost.io",
      "**.ghostcdn.io",
      "**.cdn.ghost.io",
      "**.netlify.app",
      "**.vercel.app",
      "**.vercel-storage.com",

      // --- Generic CDN providers ---
      "**.cloudfront.net",
      "**.akamaized.net",
      "**.akamaihd.net",
      "**.fastly.net",
      "**.cdninstagram.com",
      "**.fbcdn.net",
      "**.twimg.com",
      "**.gstatic.com",
      "googleusercontent.com",
      "**.googleusercontent.com",
      "**.cloudinary.com",
      "res.cloudinary.com",
      "**.amazonaws.com",
      "s3.amazonaws.com"
    ],

    /* -------- VOICE -------- The LLM system prompt is composed from this. */
    voice: {
      /** Sentence describing what the magazine covers (subject + format). */
      premise:
        "AITECH TOKYO, an independent bilingual (English / Japanese) directory of AI tools, LLM-adjacent gadgets, and indie-developer products, indexed nightly from a Tokyo desk.",
      /** Tone of voice paragraph. */
      toneOfVoice:
        "A fusion of *WIRED Japan*, *Hacker News' best comments*, and the personal weblog of an opinionated Tokyo indie developer: technically literate, calmly skeptical, allergic to marketing copy.\n- No exclamation marks. No 'revolutionize / disrupt / game-changing' verbs. No phrase that could appear on a landing page.\n- Short declarative sentences. One slightly literary line per piece is allowed; do not perform it.\n- Treat funding announcements, valuations, and 'first AI to ...' claims as background, not as the story. The story is always the product.\n- It is acceptable — encouraged — to say 'this is mostly a wrapper around GPT-4', 'this duplicates what Notion AI already does for free', 'the Japanese UI is machine-translated', when it is true.\n- Cliché block-list: 'groundbreaking', 'cutting-edge', 'next-generation', 'AI-powered', 'unleash', 'supercharge', 'transform your workflow', 'the future of work', 'paradigm shift'.",
      /** The framing question every article must answer somewhere. */
      framingQuestion:
        '"Should a working developer in Tokyo, today, replace any part of their current workflow with this?"',
      framingExpansion:
        "Not 'this AI tool is impressive'. Specifically: what does it do that ChatGPT, Cursor, Claude, Notion AI, or existing free infra (cron, n8n, Zapier) does not already do? Which task in a real developer's week does it shorten? Or — if the honest answer is 'nothing, it is a wrapper' — say that plainly.\n\nThe tool is not interesting because it uses AI. It is interesting only if a builder is meaningfully better off after using it.",
      /** Composition rules (kept tight — directory cards, not feature pieces). */
      compositionRules:
        "- Body: 2–4 short paragraphs in each language. Optional ONE '## subheading' (e.g. '## What it actually is') and ONE '> pull-quote' line from the original dispatch.\n- Open by stating WHAT THE TOOL IS in one sentence — no scene-setting, no narrative ramp.\n- Do NOT repeat the article title as the first body paragraph.\n- Name concrete details: model used (GPT-4o / Claude 3.5 / Llama 3), pricing tier, host country, what infra it integrates with.\n- Do NOT fabricate funding amounts, founder names, model names, dates, or pricing. If a fact is not in the source, omit it. It is better to be quiet than wrong.\n- The four required STRUCTURED FIELDS (tagline / useCase / vsCompetitor / tokyoTake) are emitted in addition to the body — see `structuredFields` below.",
      /** Japanese-specific rules — kept identical in spirit; register slightly more dev-blog. */
      japaneseRules:
        "- The Japanese is a PARALLEL piece in Japanese tech-blog idiom — NOT a translation of the English.\n- Use clean modern Japanese (常体 mostly). Mix kanji and hiragana naturally.\n- Leave proper nouns (GPT-4, Claude, Cursor, Anthropic, OpenAI, Product Hunt) in roman. Avoid katakana-jargon overload; prefer 「LLM」「APIキー」over awkward 「エルエルエム」「エーピーアイ・キー」.\n- Punctuation: 「」for quoted phrases, — (em-dash) for editorial asides.",

      /* -------- NEW: STRUCTURED FIELDS --------
         The four card-surfaced data points the LLM must emit per tool. The
         cron-publisher composes JSON keys `${key}_en` / `${key}_ja` from this
         array, exactly as it already does for `closingBlock.outputKey`. The
         renderer (ToolCard) reads `article.structured[key].{en|ja}`.

         Omit (or set []) to disable on a sister title that doesn't want
         structured cards — ARTEMIS TOKYO omits this field. */
      structuredFields: [
        {
          key: "tagline",
          label: { en: "Tagline", ja: "タグライン" },
          type: "line",
          charLimit: { en: 60, ja: 30 },
          display: { role: "headline", onCard: true, onDetail: true },
          descriptionForLlm:
            "ONE short punchy line that captures what the tool actually does. Not what its landing page says — what a Tokyo developer would tell a friend in one breath. Japanese must be ≤30 full-width characters. English must be ≤60 characters. No exclamation marks. No 'AI-powered', no 'revolutionary'. If the honest tagline is 'a thin wrapper around GPT-4o', say that."
        },
        {
          key: "useCase",
          label: { en: "Who & Why", ja: "誰が、何のために" },
          type: "paragraph",
          charLimit: { en: 220, ja: 110 },
          display: { role: "body", onCard: true, onDetail: true },
          descriptionForLlm:
            "ONE sentence (or at most two) naming the exact user persona and the exact task. Bad: 'for anyone who wants to be more productive'. Good: 'for a solo founder doing weekly customer support in two languages who wants to draft replies before reviewing them'. Be concrete about the persona's job and the task."
        },
        {
          key: "vsCompetitor",
          label: { en: "vs. Existing", ja: "既存ツールとの違い" },
          type: "paragraph",
          charLimit: { en: 240, ja: 120 },
          display: { role: "body", onCard: true, onDetail: true },
          descriptionForLlm:
            "ONE sentence naming a SPECIFIC existing tool or infrastructure this competes with (ChatGPT, Cursor, Claude Code, Notion AI, n8n, Zapier, raw OpenAI API, etc.) and stating concretely what is different. If the difference is 'nothing meaningful', say that explicitly — that is more useful than vague praise. Name the competitor; do not say 'other AI tools'."
        },
        {
          key: "tokyoTake",
          label: { en: "Tokyo Take", ja: "東京視点" },
          type: "paragraph",
          charLimit: { en: 260, ja: 130 },
          display: { role: "verdict", onCard: true, onDetail: true },
          descriptionForLlm:
            "The signed Tokyo-desk verdict in 1–2 sentences. Cover at least one of: (a) does the Japanese UI actually exist and is it human-quality or machine-translated; (b) does pricing make sense for a Japanese solo dev / SMB at JPY; (c) does the tool assume Slack-and-Stripe infra that many Japanese teams don't have; (d) is there a Japanese alternative (e.g. PLAUD, Notta, ELYZA, Sakana) that already does this. Be useful, not diplomatic — say if the answer is 'wait, not yet'."
        }
      ] as StructuredFieldDef[],

      /** Closing "view from {city}" block. KEPT for cross-template compatibility
       *  with cron-publisher; for AITECH TOKYO the four `structuredFields` above
       *  carry the editorial weight, so this block is effectively a one-paragraph
       *  long-form addendum on the detail page only. Set `outputKey: "tokyo_take"`
       *  so the structured field of the same name *or* this legacy block can both
       *  populate `article.tokyoView` without code changes — code reads whichever
       *  is present.
       *
       *  If you want to fully remove the closing block from the LLM contract,
       *  delete this object and the cron's `composeClosingBlock()` will skip it. */
      closingBlock: {
        title: { en: "AITECH TOKYO — Tokyo Take", ja: "AITECH TOKYO 視点" },
        subheading: {
          en: "Does this earn a slot in a Japanese workflow today?",
          ja: "日本のワークフローに、今すぐ入れる価値はあるか。"
        },
        outputKey: "tokyo_take",
        rules:
          "Long-form expansion of the `tokyoTake` structured field — 2–3 paragraphs only on the detail page, not on the card. Reference at least one concrete Japanese AI / infra player when natural: ELYZA, Sakana AI, Preferred Networks, PLAUD, Notta, LINE WORKS, freee, Money Forward, Mercari, Cookpad, JTC dev culture, the ramen-and-conbini infrastructure of Tokyo dev life. No empty patriotism. No defeatism. If the honest answer is 'wait 6 months', say that."
      }
    }
  },

  /* ---------------------------------------------------------------- CRON
     UTC schedule consumed by .github/workflows/daily-publish.yml. 03:00 JST
     for AITECH TOKYO so the grid is fresh when Japanese developers open their
     laptop — ARTEMIS TOKYO uses 06:00 JST, the offset avoids GH Actions
     on-the-hour deprioritization. */
  cron: {
    /** Cron expression in UTC. 03:17 JST = 18:17 UTC previous day. */
    utc: "17 18 * * *",
    /** Human label for documentation and the empty-state copy. */
    localLabel: "03:00 JST"
  }
} as const;

/* ---------------------------------------------------------------------------
   Type derivations & helpers — identical surface to ARTEMIS TOKYO so the
   rest of the codebase (i18n.ts, page.tsx, sitemap, cron-publisher) reads
   from `siteConfig.*` without any change at the type-derivation layer.
   ------------------------------------------------------------------------- */
export type SiteConfig = typeof siteConfig;
export type CategoryKey = (typeof siteConfig.categories)[number]["key"];

/** Ordered list of category keys — used for nav, footer, sitemap, default sort. */
export const CATEGORY_ORDER: CategoryKey[] = siteConfig.categories.map(
  (c) => c.key
) as CategoryKey[];

/** Lookup helper. */
export const getCategoryDef = (key: string): CategoryDef | undefined =>
  siteConfig.categories.find((c) => c.key === key) as CategoryDef | undefined;

/** Map a category key (current or legacy) onto a current key. */
export const normalizeCategory = (v: unknown): CategoryKey => {
  if (typeof v !== "string") return CATEGORY_ORDER[0];
  if ((CATEGORY_ORDER as readonly string[]).includes(v)) return v as CategoryKey;
  const mapped = siteConfig.legacyCategoryMap[v];
  if (mapped && (CATEGORY_ORDER as readonly string[]).includes(mapped)) {
    return mapped as CategoryKey;
  }
  return CATEGORY_ORDER[0];
};

/** Map of category keys → bilingual name. Convenience for components. */
export const categoryNames: Record<CategoryKey, Bilingual> = Object.fromEntries(
  siteConfig.categories.map((c) => [c.key, c.name])
) as Record<CategoryKey, Bilingual>;

/** Build the Unsplash URL for a given pool entry. Same shape as ARTEMIS TOKYO. */
export const coverUrl = (id: string): string =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=2200&q=80`;

/* ---------------------------------------------------------------------------
   NEW helpers — added for the directory layout & structured-fields contract.
   Safely no-op when `layout` / `structuredFields` are absent (i.e. on
   ARTEMIS TOKYO, which doesn't set either).
   ------------------------------------------------------------------------- */

/** Read the layout mode with a safe default. Components should call this
 *  rather than reading `siteConfig.layout?.mode` directly — the optional
 *  chain + null-coalesce makes this safe even on sister titles that strip
 *  the `layout` block entirely (e.g. ARTEMIS TOKYO). */
type WithOptionalLayout = SiteConfig & {
  layout?: { mode?: "magazine" | "directory" };
};
export const getLayoutMode = (): "magazine" | "directory" => {
  return (siteConfig as WithOptionalLayout).layout?.mode ?? "magazine";
};

/** Ordered list of structured-field definitions (empty array if not configured).
 *  Cast through an optional-shape so sister templates that strip
 *  `pipeline.voice.structuredFields` still compile. */
type WithOptionalStructuredFields = SiteConfig & {
  pipeline: SiteConfig["pipeline"] & {
    voice: SiteConfig["pipeline"]["voice"] & {
      structuredFields?: readonly StructuredFieldDef[];
    };
  };
};
export const STRUCTURED_FIELDS: readonly StructuredFieldDef[] =
  (siteConfig as WithOptionalStructuredFields).pipeline.voice.structuredFields ??
  ([] as readonly StructuredFieldDef[]);

/** True iff the LLM contract for this site asks for structured fields. */
export const HAS_STRUCTURED_FIELDS: boolean = STRUCTURED_FIELDS.length > 0;
