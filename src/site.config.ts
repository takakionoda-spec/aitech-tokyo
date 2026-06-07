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
   NEW: monetization types.
   The site supports three monetization layers stacked behind a single config
   block under `siteConfig.monetization`:

     1. Affiliate links — per-article / per-tool CTAs (Amazon Associates,
        SaaS partner programs, ASP networks like A8 / もしも).
        Surfaced as a small CTA row on cards and a prominent CTA section on
        article detail pages. Always rendered with rel="sponsored noopener
        nofollow" per Google's link-attribution guidance.

     2. Sponsor slots — paid placements injected into the directory grid
        (NOT IMPLEMENTED YET — placeholder type for the next iteration).

     3. Display ads — env-driven AdSense slots
        (NOT IMPLEMENTED YET — placeholder type for the next iteration).

   The disclosure string is shown in the Footer and on /about per JP 特商法 /
   景表法 and Google publisher policy. Keep it always-on as long as any
   affiliate link exists anywhere on the site.
   ------------------------------------------------------------------------- */
export type AffiliateNetwork = "amazon" | "partner" | "asp" | "other";

/** A single affiliate / partner CTA attached to an article (= tool entry on
 *  AITECH TOKYO). The `network` field controls the small badge shown next to
 *  the button and is also used for compliance accounting (Amazon Associates
 *  has stricter copy rules than generic ASPs). */
export type AffiliateLink = {
  /** Destination URL — the full affiliate / partner URL, NOT the bare product
   *  page. The renderer attaches rel="sponsored noopener nofollow" and
   *  target="_blank" automatically. */
  url: string;
  /** Network. Used to pick the badge label from
   *  `monetization.affiliate.networkLabels`. */
  network: AffiliateNetwork;
  /** Optional bilingual button label. Falls back to
   *  `monetization.affiliate.defaultLabel` when omitted. */
  label?: Bilingual<string>;
  /** Optional one-line note shown under the button (e.g. "30-day free trial",
   *  "Japanese UI available"). */
  note?: Bilingual<string>;
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
    siteUrl: "https://www.aitech-tokyo.com",
    /** Editorial subject — used in metadata description and the LLM voice. */
    subject: {
      en: "the global AI tech conversation — translated into Japanese and read through a Tokyo business lens, every morning",
      ja: "世界で話題のAI Techニュースを日本語に翻訳し、東京のビジネスパーソンの目線で読み解くバイリンガル・ディレクトリ"
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
      en: "The AI tech news the world is talking about — translated into Japanese and read from Tokyo, every morning. A bilingual directory bridging global launches and Tokyo's business context.",
      ja: "AI Techの最新情報を、毎朝日本語へ。世界と東京をつなぐバイリンガル・ディレクトリ。海外で英語でしか流れない一次情報を、東京のビジネスパーソンの視点で読み解きます。"
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
      eyebrow: { en: "The Briefing", ja: "ブリーフィング" },
      heading: {
        en: "World AI tech, read from Tokyo. Once a week, in Japanese.",
        ja: "世界のAI Techを、東京から。\n週に一通の日本語ブリーフィング。"
      },
      lede: {
        en: "Each Friday: the five global AI tech stories Japanese business professionals should know about this week, translated and read through a Tokyo lens — what it means for Japan, what to act on, what to keep watching.",
        ja: "毎週金曜。日本のビジネスパーソンが今週知っておくべき海外AI Techニュースを5本厳選し、日本語に翻訳して東京視点で解説。何が動いたか、日本にとってどう意味があるか、何を見ておくべきか。"
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
        en: "AITECH TOKYO is a bilingual directory that bridges the global AI tech conversation and Tokyo's business context. We index the world's AI news every morning — from Product Hunt, Hacker News, TechCrunch AI, and VentureBeat AI — translate the worth-knowing into Japanese, and add the layer machine translation can't: what this means for a business professional working in Japan today.",
        ja: "AITECH TOKYO は、世界のAI Techと東京のビジネス文脈をつなぐバイリンガル・ディレクトリです。Product Hunt、Hacker News、TechCrunch AI、VentureBeat AI から毎朝収集し、知っておくべき一次情報を日本語に翻訳します。さらに機械翻訳では届かないレイヤー —「これは日本で働くビジネスパーソンにとって何を意味するのか」— を東京の編集部が補完してお届けしています。"
      },
      strapline: "Tokyo · Bilingual · Business-Grade"
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
        en: "The first AITECH TOKYO index is being built.",
        ja: "AITECH TOKYO の最初のインデックスを\n組み立てています。"
      },
      lede: {
        en: "Each morning, our pipeline pulls the AI tech stories the world is talking about — from Product Hunt, Hacker News (Top), TechCrunch AI, and VentureBeat AI — translates the items worth knowing into Japanese, and adds the Tokyo business angle that machine translation alone can't provide: what does this mean for a professional working in Japan? The first index will appear here as soon as the next cycle completes.",
        ja: "AITECH TOKYO のパイプラインは毎朝、世界で話題のAI Tech情報 — Product Hunt、Hacker News（Top）、TechCrunch AI、VentureBeat AI — を取得し、知っておくべき一次情報を日本語に翻訳します。さらに機械翻訳では届かない『これは日本で働くビジネスパーソンにとって何を意味するのか』というレイヤーを、東京の編集部が加えてここに並べます。次回サイクルが完了次第、最初のインデックスが表示されます。"
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
      en: "World AI tech, read from Tokyo.",
      ja: "世界のAI Techを、東京から読む。"
    },
    lede: {
      en: "Every day, hundreds of AI tech stories ship in English. Most never reach Japanese readers — and the few that do arrive as machine translation, missing the one layer a Tokyo business professional actually needs: what does this mean for working in Japan? AITECH TOKYO closes both gaps. We translate the worth-knowing into Japanese every morning, then add the Tokyo business lens that translation alone can't.",
      ja: "毎日、世界では数百のAI Techストーリーが英語でローンチされる。そのほとんどは日本語に届かない。届いたとしても機械翻訳のままで、東京のビジネスパーソンが本当に必要としているレイヤー —「これは日本で働く我々にとって何を意味するのか」— が抜け落ちている。AITECH TOKYO は、その 2 つのギャップを埋める。世界のAI Techを毎朝日本語に翻訳し、翻訳だけでは届かない『東京のビジネス視点』を加えてお届けする。"
    },
    blocks: [
      {
        eyebrow: { en: "OUR LINE", ja: "編集の線" },
        heading: {
          en: "Bilingual, not just translated.",
          ja: "ただの翻訳ではなく、バイリンガル編集。"
        },
        body: {
          en: "Machine translation can read English. It can't ask 'does this make sense in Japan?' AITECH TOKYO is a bilingual editorial directory — not an automated feed, not a translation layer. We index the world's AI tech news every morning, pick the items a Tokyo business professional should know about, and translate them into Japanese with the editorial judgement a translator alone can't bring: which stories matter, which are press-release fluff, which deserve a line of context, and which are best summarised in one sentence and skipped.",
          ja: "機械翻訳は英語を読める。しかし「これは日本で意味があるのか」という問いは立てられない。AITECH TOKYO は、自動フィードでもなく単なる翻訳レイヤーでもない — バイリンガル編集のディレクトリだ。毎朝、世界のAI Techニュースをインデックスし、東京のビジネスパーソンが知っておくべきトピックを選び、翻訳者単独では下せない編集判断を加えながら日本語に置き換える。どのストーリーが本当に意味を持つのか。どれがプレスリリースの誇張か。どれに一文の補足が必要で、どれは要約だけで十分か。"
        }
      },
      {
        eyebrow: { en: "OUR CITY", ja: "私たちの街" },
        heading: {
          en: "Why a Tokyo desk picks the lens.",
          ja: "なぜ、東京の編集部がレンズを決めるのか。"
        },
        body: {
          en: "AI tech is mostly written in San Francisco — for San Francisco. Launches assume US payment rails, English-only UI, and team structures built around Slack, Stripe, and venture capital. Japanese readers don't see any of this from a translated press release. AITECH TOKYO sits in the middle: bilingual enough to read the source, embedded enough in Tokyo's business reality to tell you which tools actually fit a Japanese workflow — and which ones assume an infrastructure you don't have. That second judgement is the layer machine translation will never deliver.",
          ja: "AI Tech のほとんどは、サンフランシスコで書かれ、サンフランシスコのために書かれている。USの決済インフラ、英語UI、Slack/Stripe/ベンチャーキャピタル前提のチーム構造を当然のものとしている。日本の読者には、翻訳されたプレスリリースからそれは見えない。AITECH TOKYO は、その中間に立つ — 一次情報を英語で読める程度にバイリンガルで、東京のビジネスリアリティに足を置いている程度に現地的。だから「どのツールが日本のワークフローに合うのか」「どのツールが日本にないインフラを前提にしているのか」を見分けられる。機械翻訳が決して届けないのは、まさにこのレイヤーだ。"
        }
      },
      {
        eyebrow: { en: "OUR METHOD", ja: "編集の方法" },
        heading: {
          en: "Four lines per story. Same four, every time.",
          ja: "ひとつのトピックに、4 つの答え。毎回、同じ 4 つ。"
        },
        body: {
          en: "Every entry in AITECH TOKYO gets the same four structured fields answered: a tagline that says what it actually is (not what marketing claims), the use case (who in Japan would actually use it and for what task), versus existing alternatives (ChatGPT, Notion AI, the raw OpenAI API, established Japanese tools), and the Tokyo Take — does this earn a slot in a Japanese workflow today, in Japanese, at a Japanese price, with a Japanese team structure? Same four questions, every entry. The press-release voice is left at the door, and the source is always linked.",
          ja: "AITECH TOKYO の全エントリーには、同じ 4 つの構造化フィールドの答えが付く — タグライン（マーケコピーではなく、本当のところそれが何なのか）、使いどころ（日本では誰が、何の業務のために使うのか）、既存ツールとの違い（ChatGPT、Notion AI、生の OpenAI API、すでにある日本のツールなどとの比較）、そして東京視点（日本のワークフローに、日本語で、日本の価格で、日本のチーム規模で、今すぐ入れる価値があるか）。毎エントリー、同じ 4 つの問い。プレスリリースの声色は入口に置いてくる。原文へのリンクは必ず保つ。"
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
        "AITECH TOKYO, an independent bilingual (English / Japanese) directory that bridges the world's AI tech news cycle and Tokyo's business context — translating the global conversation into Japanese and adding the lens of a Tokyo business desk.",
      /** Tone of voice paragraph. */
      toneOfVoice:
        "A fusion of *WIRED Japan*'s editorial confidence, the calm skepticism of a senior Tokyo business analyst, and the cleanliness of *Quartz's* daily briefing voice: technically informed but not inside-baseball, opinionated yet never gossipy, allergic to marketing copy.\n- No exclamation marks. No 'revolutionize / disrupt / game-changing' verbs. No phrase that could appear on a landing page.\n- Short declarative sentences. One slightly literary line per piece is allowed; do not perform it.\n- Treat funding announcements, valuations, and 'first AI to ...' claims as background, not as the story. The story is always the product and what it changes for a working professional.\n- It is acceptable — encouraged — to say 'this is mostly a wrapper around GPT-4', 'this duplicates what Notion AI already does for free', 'the Japanese UI is machine-translated', when it is true.\n- Cliché block-list: 'groundbreaking', 'cutting-edge', 'next-generation', 'AI-powered', 'unleash', 'supercharge', 'transform your workflow', 'the future of work', 'paradigm shift'.",
      /** The framing question every article must answer somewhere. */
      framingQuestion:
        '"What does this AI tech story mean for a business professional working in Tokyo today — and would it actually change a part of how they work?"',
      framingExpansion:
        "Not 'this AI story is impressive'. Specifically: what concretely changes for a Tokyo-based professional — a PM, a marketer, an ops manager, an analyst, an indie founder, an engineer — after reading this and acting on it? Does it shorten a task in their week? Does it open a workflow that wasn't possible in Japanese before? Or — if the honest answer is 'nothing, it is a wrapper / it doesn't ship in Japan / it duplicates a free Japanese alternative' — say that plainly.\n\nThe story is not interesting because AI is involved. It is interesting only if a Tokyo professional is meaningfully better informed or better equipped after reading it.",
      /** Composition rules (kept tight — directory cards, not feature pieces). */
      compositionRules:
        "- Body: 5–8 SELF-CONTAINED paragraphs in each language. A reader who never clicks through to the source must come away knowing exactly what happened, what the tool is, who built it, what it costs, what it competes with, and what it concretely changes for a working professional. Treat this article as the primary record, not a summary that points elsewhere.\n- Open by stating WHAT THE TOOL IS in one sentence — no scene-setting, no narrative ramp.\n- Do NOT repeat the article title as the first body paragraph.\n- Required factual coverage somewhere in the body (omit ONLY if the source genuinely doesn't have it, never fabricate): who built/launched it, when, the model or stack it runs on (GPT-4o / Claude 3.5 / Llama 3 / proprietary), the pricing tier in concrete numbers, the host country, the named existing tools it competes with, and the concrete user task or workflow it changes.\n- Optional ONE '## subheading' (e.g. '## What it actually is') and ONE '> pull-quote' line from the original dispatch.\n- The Japanese version must be fully understandable in Japanese alone — readers who never look at the English version must come away with the same complete understanding. Do not leave context implicit because it appears in the English version.\n- Do NOT fabricate funding amounts, founder names, model names, dates, or pricing. If a fact is not in the source, omit it. It is better to be quiet than wrong.\n- The four required STRUCTURED FIELDS (tagline / useCase / vsCompetitor / tokyoTake) are emitted in addition to the body — see `structuredFields` below.",
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
            "ONE sentence (or at most two) naming the exact business persona and the exact task. The audience is Tokyo business professionals — PMs, marketers, ops managers, analysts, indie founders, engineers. Bad: 'for anyone who wants to be more productive'. Good: 'for a Tokyo-based product manager preparing weekly executive briefings who wants AI to draft the first version in two languages'. Be concrete about the persona's role and the task they would actually delegate to this tool."
        },
        {
          key: "vsCompetitor",
          label: { en: "vs. Existing", ja: "既存ツールとの違い" },
          type: "paragraph",
          charLimit: { en: 240, ja: 120 },
          display: { role: "body", onCard: true, onDetail: true },
          descriptionForLlm:
            "ONE sentence naming a SPECIFIC existing tool or infrastructure this competes with (ChatGPT, Claude, Notion AI, Notta, PLAUD, n8n, Zapier, raw OpenAI API, established Japanese SaaS, etc.) and stating concretely what is different. If the difference is 'nothing meaningful', say that explicitly — that is more useful than vague praise. Name the competitor; do not say 'other AI tools'."
        },
        {
          key: "tokyoTake",
          label: { en: "Tokyo Take", ja: "東京視点" },
          type: "paragraph",
          charLimit: { en: 260, ja: 130 },
          display: { role: "verdict", onCard: true, onDetail: true },
          descriptionForLlm:
            "The signed Tokyo business-desk verdict in 1–2 sentences. Address what a Tokyo professional needs to know that English coverage typically omits. Cover at least one of: (a) does Japanese-language support actually exist, and is it human-quality or machine-translated; (b) does pricing make sense for a Japanese SMB or solo professional at JPY; (c) does the tool assume Slack / Stripe / US-style infra that many Japanese organisations don't have; (d) is there a Japanese alternative (e.g. PLAUD, Notta, ELYZA, Sakana AI, Money Forward, freee) that already covers this for Tokyo workflows. Be useful, not diplomatic — if the answer is 'interesting abroad, wait six months for Japan', say that."
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
        title: { en: "The Tokyo Editor's Read", ja: "東京編集部の読み解き" },
        subheading: {
          en: "What this AI story could mean for Tokyo in the years ahead.",
          ja: "このニュースは、近い将来、東京の暮らしに何をもたらしうるか。"
        },
        outputKey: "tokyo_take",
        rules:
          "This block is the magazine's plain-language editorial commentary on the AI / tech news — written for readers living in Tokyo, in a register a 60-year-old and a 10-year-old can both follow.\n\nNO jargon without a parenthetical translation. Avoid 'AI ecosystem', 'paradigm shift', 'leveraging', 'transformative', 'next-generation'. If 'API', 'LLM', 'SaaS' is genuinely necessary, gloss it the first time. In Japanese use です・ます (warm explainer register) even though the body uses 常体. In English use plain, direct second person.\n\nABSOLUTE RULE — speak to Tokyo readers in the ABSTRACT only.\n  - DO write: 「東京で暮らす読者にとって」「Tokyo readers」.\n  - DO NOT write: specific occupations, neighbourhoods, ages tied to occupations, or other demographic personas. Forbidden: 'convenience-store cashier', 'school teacher in Nerima', 'salaryman commuting from Saitama', 'grandmother arranging a hospital visit', 'Akihabara indie dev', 'a balcony in Setagaya', 'your aunt who reads the Asahi Shimbun', or any analogous construction. These read as stereotyping. The Tokyo reader is one reader, treated as one reader.\n\nIT IS A GIVEN that most newly-announced AI tech does not immediately change daily life in Tokyo — do NOT spend a paragraph saying so. The block's job is to look forward: what plausible future impact, on what timeframe, with what gating factor.\n\nThe block MUST answer these FOUR questions in order, in 4–6 paragraphs per language, each question taking roughly one paragraph:\n\n(1) WHAT HAPPENED, IN PLAIN WORDS — Re-explain the news without assuming the reader knows what a model, an API, or a SaaS is. Use real-world analogies (a translator who never sleeps; a notebook that types itself; a recorder that remembers every word from yesterday's meeting). This is a TRANSLATION of the news into ordinary Japanese, not a summary.\n\n(2) WHAT PLAUSIBLE NEAR-FUTURE IMPACT FOR TOKYO READERS — Look ahead, not at today. Name 1–3 concrete DOMAINS where Tokyo readers might feel this — banking interfaces, transit apps, hospital reception, language learning, hiring, customer support, government paperwork, retail checkout, restaurant reservations, content recommendation, creative work, the cost of digital services. Be specific about the KIND of change (faster, cheaper, available in Japanese, available without staff, available 24h). Name the situation or service, not a person.\n\n(3) ON WHAT TIMEFRAME — Give an honest interval with a gating factor. Examples: 'within 6 months, once the Japanese model is fine-tuned'; '12–24 months, once a Japanese partner licenses it (see how Notta did with PLAUD)'; '3–5 years, after the underlying cost per token drops by another order of magnitude'; 'already today — the Japanese App Store carries it'. Don't hedge into vagueness. Name the specific bottleneck (Japanese-language fine-tuning / payment in JPY / regulatory approval / a domestic partnership) when you can.\n\n(4) JAPANESE COUNTERPART — Name a SPECIFIC Japanese company, organisation, or product already moving in a comparable direction. Choose accurately from: ELYZA, Sakana AI, Preferred Networks, PLAUD, Notta, LINE WORKS, freee, Money Forward, Mercari, Cookpad, NTT, SoftBank, Rakuten, the University of Tokyo Matsuo Lab, METI's GENIAC programme, JETRO, JIDF — or a clearly relevant alternative. Do NOT force a name; if no Japanese counterpart exists yet, say so plainly and name the closest adjacent player and what gap remains.\n\nTone: warm, concrete, useful, forward-looking. NO empty patriotism. NO defeatism. NO 'in conclusion' / 'in summary' wrap-up sentences — end on a concrete observation, not a tidy closing."
      }
    }
  },

  /* --------------------------------------------------------- MONETIZATION
     Affiliate / sponsor / display-ad configuration. Read by:
       - <AffiliateCTA />  → renders the per-link CTA block (cards + detail)
       - <Footer />        → renders the short disclosure line on every page
       - <AboutPage />     → renders the long disclosure block

     Per-article affiliate links are NOT declared here — they live in
     `src/data/affiliate.ts` as a `slug → AffiliateLink[]` overlay, so the
     LLM-generated articles.json stays a pure content artefact and affiliate
     URLs stay editorial / commercial.

     Disable the layer entirely on a sister title by setting `affiliate.enabled`
     to false — the Footer / About disclosure and all CTAs go away.
     ---------------------------------------------------------------------- */
  monetization: {
    affiliate: {
      enabled: true,
      /** Networks the site is allowed to surface. Mirror the actual programs
       *  you are signed up for. The renderer ignores any AffiliateLink whose
       *  `network` is not in this list (so you can stage links in
       *  affiliate.ts before a program is approved without breaking the UI). */
      networks: ["amazon", "partner", "asp"] as readonly AffiliateNetwork[],
      /** Small badge shown next to each CTA. Keep the JP wording compliant
       *  with 景表法 / 特商法 — "PR" or "アフィリエイト" is safer than
       *  ambiguous neutral language. */
      networkLabels: {
        amazon: { en: "Amazon", ja: "Amazon" },
        partner: { en: "Partner", ja: "公式パートナー" },
        asp: { en: "PR", ja: "PR" },
        other: { en: "Sponsored", ja: "PR" }
      } as Record<AffiliateNetwork, Bilingual<string>>,
      /** Fallback CTA label when an AffiliateLink doesn't ship its own. */
      defaultLabel: { en: "Visit site", ja: "公式サイトへ" },
      /** Short single-line disclosure surfaced in the Footer of every page. */
      disclosureShort: {
        en: "Some links on AITECH TOKYO are affiliate links. We may earn a commission when you sign up, at no extra cost to you.",
        ja: "AITECH TOKYO の一部リンクはアフィリエイト・リンクを含みます。リンク経由でのご利用により当サイトが報酬を受け取る場合がありますが、ご利用料金は変わりません。"
      },
      /** Long-form disclosure surfaced on /about and the dedicated
       *  /transparency page (TODO). Spell out the actual networks per
       *  Amazon Associates Operating Agreement §5(a) and 景表法 ステマ規制
       *  (2023/10 施行) — generic wording is not sufficient. */
      disclosureLong: {
        en: "AITECH TOKYO participates in the Amazon Associates Program, partner / referral programs run by individual AI tool vendors, and Japanese affiliate networks (ASPs). When a story or directory entry includes a button marked PR / Partner / Amazon, the link is an affiliate link: clicking through and signing up may earn AITECH TOKYO a commission, at no additional cost to you. Affiliate relationships do not determine editorial coverage, do not change the four structured fields a tool is evaluated on (tagline / use case / vs. existing / Tokyo Take), and do not soften the Tokyo Take when the honest answer is 'wait six months'.",
        ja: "AITECH TOKYO は、Amazon アソシエイト・プログラム、AI ツール各社が運営するパートナー／リファラル・プログラム、および国内アフィリエイト・サービス・プロバイダー（ASP）に参加しています。記事内またはディレクトリエントリーに「PR」「公式パートナー」「Amazon」と表示されたボタンが含まれる場合、当該リンクはアフィリエイト・リンクです。リンク経由でご登録／ご購入いただくと当サイトが報酬を受け取ることがありますが、ユーザーの支払金額は変わりません。アフィリエイト関係は編集方針に影響を与えず、各ツールを評価する 4 つの構造化フィールド（タグライン／使いどころ／既存ツールとの違い／東京視点）の判断、および「半年待った方がよい」と書くべき場面での率直さを変えるものではありません。"
      }
    },
    /** Sponsor slots — paid placements injected into the directory grid.
     *  Reserved shape for the next iteration. Empty array means no sponsor
     *  is currently active and the grid renders as today. */
    sponsors: [] as readonly {
      id: string;
      title: Bilingual<string>;
      blurb: Bilingual<string>;
      href: string;
      sponsoredBy: Bilingual<string>;
      validUntil: string; // ISO date — past this, the slot self-expires
    }[],
    /** Display ads — env-driven AdSense slots.
     *  Reserved shape for the next iteration. Setting `client` to "" disables
     *  the layer entirely at runtime regardless of env. */
    ads: {
      provider: "adsense" as const,
      client: "",
      slots: {
        feedTop: "",
        feedMid: "",
        articleInline: ""
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

/* ---------------------------------------------------------------------------
   Monetization helpers — same defensive shape as the structured-field helpers
   above. Sister titles that strip the `monetization` block must still compile.
   ------------------------------------------------------------------------- */
type WithOptionalMonetization = SiteConfig & {
  monetization?: {
    affiliate?: {
      enabled?: boolean;
      networks?: readonly AffiliateNetwork[];
      networkLabels?: Record<AffiliateNetwork, Bilingual<string>>;
      defaultLabel?: Bilingual<string>;
      disclosureShort?: Bilingual<string>;
      disclosureLong?: Bilingual<string>;
    };
  };
};

/** True iff the affiliate layer is active for this site. Renderers should
 *  bail early on this before doing any other work — keeps sister titles that
 *  don't ship monetization (e.g. ARTEMIS TOKYO before the propagation lands)
 *  visually identical to today. */
export const AFFILIATE_ENABLED: boolean = Boolean(
  (siteConfig as WithOptionalMonetization).monetization?.affiliate?.enabled
);

/** Networks the site is allowed to surface. Empty array if the layer is off. */
export const AFFILIATE_NETWORKS: readonly AffiliateNetwork[] =
  (siteConfig as WithOptionalMonetization).monetization?.affiliate?.networks ??
  ([] as readonly AffiliateNetwork[]);

/** Resolve the bilingual badge label for a given network. Returns a safe
 *  fallback when the site config omits one — never throws. */
export const getAffiliateNetworkLabel = (
  network: AffiliateNetwork
): Bilingual<string> => {
  const labels = (siteConfig as WithOptionalMonetization).monetization?.affiliate
    ?.networkLabels;
  return (
    labels?.[network] ?? {
      en: "Sponsored",
      ja: "PR"
    }
  );
};

/** Resolve the fallback CTA button label (used when an AffiliateLink omits
 *  its own `label`). */
export const getAffiliateDefaultLabel = (): Bilingual<string> => {
  return (
    (siteConfig as WithOptionalMonetization).monetization?.affiliate
      ?.defaultLabel ?? { en: "Visit site", ja: "公式サイトへ" }
  );
};

/** Short disclosure line for the Footer. Empty string when not configured. */
export const getAffiliateDisclosureShort = (): Bilingual<string> => {
  return (
    (siteConfig as WithOptionalMonetization).monetization?.affiliate
      ?.disclosureShort ?? { en: "", ja: "" }
  );
};

/** Long disclosure block for /about and /transparency. Empty string when not configured. */
export const getAffiliateDisclosureLong = (): Bilingual<string> => {
  return (
    (siteConfig as WithOptionalMonetization).monetization?.affiliate
      ?.disclosureLong ?? { en: "", ja: "" }
  );
};

/** True iff this network is whitelisted for the current site. Used by
 *  AffiliateCTA to silently drop links to programs we're not signed up for —
 *  prevents stale affiliate.ts entries from showing as broken CTAs. */
export const isAffiliateNetworkActive = (
  network: AffiliateNetwork
): boolean => {
  if (!AFFILIATE_ENABLED) return false;
  return AFFILIATE_NETWORKS.includes(network);
};
