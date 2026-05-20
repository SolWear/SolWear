import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pitch",
  description:
    "Browse the SolWear pitch deck, watch the pitch video, or download the PDF and PPTX files.",
  alternates: { canonical: "https://solwear.tech/pitch/" },
  openGraph: {
    title: "SolWear Pitch Deck",
    description: "Browse or download the SolWear investor pitch deck.",
    url: "https://solwear.tech/pitch/",
    images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear pitch deck" }],
  },
};

export default function PitchLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
