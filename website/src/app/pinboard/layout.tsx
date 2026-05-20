import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Community",
  description:
    "The SolWear community board. Sign in with X, follow @SolWear_, and share your ideas for the Solana smartwatch.",
  alternates: { canonical: "https://solwear.tech/pinboard/" },
  openGraph: {
    title: "SolWear Community - Share Your Ideas",
    description:
      "Follow @SolWear_ and share your ideas for the Solana smartwatch.",
    url: "https://solwear.tech/pinboard/",
    images: [{ url: "/sticker.webp", width: 1200, height: 630, alt: "SolWear pinboard" }],
  },
};

export default function PinboardLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
