import type { Metadata, Viewport } from "next";
import { Archivo, JetBrains_Mono } from "next/font/google";
import CubeCanvas from "@/components/cubes/CubeCanvas";
import Analytics from "@/components/site/Analytics";
import { getSettings } from "@/lib/server/settings";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  style: ["normal", "italic"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
  display: "swap",
});

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = getSettings();
  return {
    metadataBase: new URL("https://solwear.tech"),
    // The browser title is exactly SOLWEAR, on every route.
    title: { default: "SOLWEAR", template: "SOLWEAR" },
    description: settings.seoDescription,
    applicationName: "SOLWEAR",
    creator: "SolWear",
    publisher: "SolWear",
    keywords: [
      "solwear",
      "wearable solana",
      "solana wearable interface",
      "wearable crypto payments",
      "nfc solana",
      "solana pay wearable",
      "on-device signing",
      "solana hardware signer",
    ],
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large" } },
    alternates: { canonical: "/" },
    openGraph: {
      title: "SOLWEAR",
      description: settings.seoDescription,
      url: "/",
      siteName: "SOLWEAR",
      type: "website",
      locale: "en_US",
      images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear wearable interface for Solana" }],
    },
    twitter: {
      card: "summary_large_image",
      site: "@SolWear_",
      creator: "@SolWear_",
      title: "SOLWEAR",
      description: settings.seoDescription,
      images: ["/sticker.webp"],
    },
    icons: { icon: [{ url: "/solwear-logo-white.webp", type: "image/webp" }], apple: [{ url: "/solwear-logo-white.webp" }] },
  };
}

export const viewport: Viewport = {
  themeColor: "#050505",
  colorScheme: "dark",
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": "https://solwear.tech/#organization",
      name: "SolWear",
      url: "https://solwear.tech",
      logo: { "@type": "ImageObject", url: "https://solwear.tech/solwear-logo-white.webp" },
      sameAs: ["https://x.com/SolWear_", "https://github.com/solwear/solwear"],
    },
    {
      "@type": "WebSite",
      "@id": "https://solwear.tech/#website",
      url: "https://solwear.tech",
      name: "SOLWEAR",
      publisher: { "@id": "https://solwear.tech/#organization" },
    },
    {
      "@type": "Product",
      "@id": "https://solwear.tech/#mk1",
      name: "SolWear MK1",
      description:
        "A wearable interface for the Solana ecosystem. Prototype hardware that signs Solana transactions on-device over NFC.",
      brand: { "@type": "Brand", name: "SolWear" },
      url: "https://solwear.tech/product/",
      image: "https://solwear.tech/watch-transparent.png",
      // PreOrder, not InStock — the device is not shipping.
      offers: { "@type": "Offer", availability: "https://schema.org/PreOrder", url: "https://solwear.tech/#waitlist" },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${archivo.variable} ${mono.variable}`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(sessionStorage.getItem('sw-intro-seen'))document.documentElement.classList.add('sw-intro-seen')}catch(e){}`,
          }}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
if(!document.createElement('canvas').getContext('webgl2'))return;
var d=document.documentElement;d.classList.add('cubes-active');
/* If the bundle never hydrates, un-hide everything rather than show a blank page. */
window.__swCubesBoot=setTimeout(function(){d.classList.remove('cubes-active');},2500);
}catch(e){}})();`,
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      </head>
      <body className="min-h-screen">
        <a href="#main" className="skip-link">
          SKIP TO CONTENT
        </a>
        <CubeCanvas />
        <Analytics />
        {children}
      </body>
    </html>
  );
}
