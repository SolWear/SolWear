import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Thanks",
  description:
    "The people behind SolWear - builders, testers, and everyone who gave feedback on the Solana smartwatch prototype.",
  alternates: { canonical: "https://solwear.tech/thanks/" },
  openGraph: {
    title: "Thanks | SolWear",
    description: "The people behind SolWear - builders, testers, and feedback givers.",
    url: "https://solwear.tech/thanks/",
    images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear thanks" }],
  },
};

export default function ThanksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
