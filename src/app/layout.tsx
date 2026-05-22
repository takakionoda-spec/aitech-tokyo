import type { Metadata } from "next";
import "./globals.css";
import { LanguageProvider } from "@/context/LanguageContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { buildOrganizationJsonLd } from "@/lib/jsonld";
import { siteConfig } from "@/site.config";

const brand = siteConfig.brand;
const aboutHeadline = siteConfig.about.headline.en;
const subject = siteConfig.brand.subject.en;

// SEO-tight description derived from brand.subject. Both OG and Twitter use
// the same string so the social-card preview is consistent across platforms.
// Capitalize the first letter (subject.en is written sentence-fragment style
// to read naturally inside metadata description fields).
const seoDescription = subject.charAt(0).toUpperCase() + subject.slice(1) + ".";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? brand.siteUrl),
  title: {
    default: `${brand.name} — ${aboutHeadline}`,
    template: `%s · ${brand.name}`
  },
  description: seoDescription,
  keywords: [...brand.keywords],
  openGraph: {
    title: brand.name,
    description: seoDescription,
    url: "/",
    siteName: brand.name,
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: brand.name,
    description: seoDescription
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const orgJsonLd = buildOrganizationJsonLd();
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-neutral-950 text-ink antialiased min-h-screen flex flex-col">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
        />
        <LanguageProvider initialLang="en">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </LanguageProvider>
      </body>
    </html>
  );
}
