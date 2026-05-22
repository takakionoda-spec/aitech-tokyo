import type { NextConfig } from "next";

/* -----------------------------------------------------------------------------
   IMPORTANT: this list MUST mirror siteConfig.pipeline.allowedImageHosts in
   src/site.config.ts. The cron uses that allowlist when DECIDING which RSS
   image URL to write into articles.json. Next.js Image uses THIS list when
   actually rendering at runtime. Keep them in sync.
   ----------------------------------------------------------------------------- */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      // --- Unsplash (fallback covers) -------------------------------------
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "source.unsplash.com" },

      // --- Product Hunt — imgix-hosted product thumbnails -----------------
      { protocol: "https", hostname: "ph-files.imgix.net" },
      { protocol: "https", hostname: "ph-static.imgix.net" },
      { protocol: "https", hostname: "**.producthunt.com" },
      { protocol: "https", hostname: "**.imgix.net" },

      // --- Hacker News -----------------------------------------------------
      { protocol: "https", hostname: "news.ycombinator.com" },

      // --- TechCrunch / Wordpress-VIP -------------------------------------
      { protocol: "https", hostname: "techcrunch.com" },
      { protocol: "https", hostname: "**.techcrunch.com" },
      { protocol: "https", hostname: "**.tcrn.io" },
      { protocol: "https", hostname: "**.wp.com" },
      { protocol: "https", hostname: "**.wordpress.com" },
      { protocol: "https", hostname: "**.wpengine.com" },

      // --- VentureBeat -----------------------------------------------------
      { protocol: "https", hostname: "venturebeat.com" },
      { protocol: "https", hostname: "**.venturebeat.com" },

      // --- Common publisher CDNs (HN-linked outlets) ----------------------
      { protocol: "https", hostname: "**.medium.com" },
      { protocol: "https", hostname: "miro.medium.com" },
      { protocol: "https", hostname: "**.substackcdn.com" },
      { protocol: "https", hostname: "substackcdn.com" },
      { protocol: "https", hostname: "**.substack.com" },
      { protocol: "https", hostname: "**.ghost.io" },
      { protocol: "https", hostname: "**.ghostcdn.io" },
      { protocol: "https", hostname: "**.cdn.ghost.io" },
      { protocol: "https", hostname: "**.netlify.app" },
      { protocol: "https", hostname: "**.vercel.app" },
      { protocol: "https", hostname: "**.vercel-storage.com" },

      // --- Generic CDN providers ------------------------------------------
      { protocol: "https", hostname: "**.cloudfront.net" },
      { protocol: "https", hostname: "**.akamaized.net" },
      { protocol: "https", hostname: "**.akamaihd.net" },
      { protocol: "https", hostname: "**.fastly.net" },
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.twimg.com" },
      { protocol: "https", hostname: "**.gstatic.com" },
      { protocol: "https", hostname: "googleusercontent.com" },
      { protocol: "https", hostname: "**.googleusercontent.com" },
      { protocol: "https", hostname: "**.cloudinary.com" },
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "**.amazonaws.com" },
      { protocol: "https", hostname: "s3.amazonaws.com" }
    ]
  }
};

export default nextConfig;
