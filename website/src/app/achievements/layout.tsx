import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Achievements",
  description: "SolWear hackathon wins, awards, and ecosystem recognition.",
  alternates: { canonical: "https://solwear.tech/achievements/" },
  openGraph: {
    title: "Achievements | SolWear",
    description: "SolWear hackathon wins, awards, and ecosystem recognition.",
    url: "https://solwear.tech/achievements/",
    images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear achievements" }],
  },
};

export default function AchievementsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
