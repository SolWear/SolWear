import type { Metadata } from "next";
import { Inter } from "next/font/google";
import ClientBackground from "@/components/ClientBackground";
import EasterEgg from "@/components/EasterEgg";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://solwear.tech"),
  title: "SolWear - Wearable Solana Hardware Signer",
  description:
    "A wearable Solana payment signer for everyday crypto transactions, with the private key kept off your phone.",
  authors: [{ name: "SolWear", url: "https://solwear.tech" }],
  keywords: [
    "solwear",
    "solana wearable",
    "crypto wearable",
    "wearable signer",
    "solana pay",
    "blinks",
    "nfc crypto wallet",
    "solana hardware signer",
    "blockchain wearable",
    "solana hardware wallet",
    "daily crypto payments",
  ],
  creator: "SolWear",
  publisher: "SolWear",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "SolWear - Wearable Solana Hardware Signer",
    description: "Approve everyday Solana payments from your wrist while keeping the signing key off your phone.",
    url: "/",
    type: "website",
    siteName: "SolWear",
    locale: "en_US",
    images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear wearable Solana payment signer" }],
  },
  twitter: {
    card: "summary_large_image",
    site: "@SolWear_",
    creator: "@SolWear_",
    title: "SolWear - Wearable Solana Hardware Signer",
    description: "Approve everyday Solana payments from your wrist while keeping the signing key off your phone.",
    images: ["/sticker.webp"],
  },
  icons: {
    icon: [{ url: "/solwear-logo-white.webp", type: "image/webp" }],
    apple: [{ url: "/solwear-logo-white.webp" }],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": "https://solwear.tech/#website",
      url: "https://solwear.tech",
      name: "SolWear",
      description: "Wearable Solana payment signer",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://solwear.tech/?s={search_term_string}",
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Product",
      "@id": "https://solwear.tech/#product",
      name: "SolWear",
      description: "A wearable hardware signer for everyday Solana payments with a mobile companion app and on-device signing.",
      brand: { "@type": "Brand", name: "SolWear" },
      url: "https://solwear.tech",
      image: "https://solwear.tech/sticker.webp",
      category: "Hardware wallet",
      audience: { "@type": "Audience", audienceType: "Crypto and Web3 enthusiasts" },
      offers: {
        "@type": "Offer",
        availability: "https://schema.org/PreOrder",
        priceCurrency: "USD",
        url: "https://solwear.tech/#purchase",
      },
    },
    {
      "@type": "Organization",
      "@id": "https://solwear.tech/#organization",
      name: "SolWear",
      url: "https://solwear.tech",
      logo: { "@type": "ImageObject", url: "https://solwear.tech/solwear-logo-white.webp" },
      sameAs: [
        "https://x.com/SolWear_",
        "https://instagram.com/so1wear",
        "https://tiktok.com/@so1wear",
        "https://youtube.com/@so1wear",
        "https://github.com/solwear/solwear",
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {/* Google tag (gtag.js) */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-TVB92JGYXE"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
            
              gtag('config', 'G-TVB92JGYXE');
            `,
          }}
        />
      </head>
      <body className="text-white antialiased">
        <ClientBackground />
        <EasterEgg />
        <div className="page-enter">{children}</div>
      </body>
    </html>
  );
}
