import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Product",
  description:
    "How SolWear works: NFC signing flow, on-device security, use cases, and developer integration details.",
  alternates: { canonical: "https://solwear.tech/product/" },
  openGraph: {
    title: "Product | SolWear",
    description: "How SolWear works: NFC signing, on-device security, and Solana Pay integration.",
    url: "https://solwear.tech/product/",
    images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear product" }],
  },
};

export default function ProductLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
