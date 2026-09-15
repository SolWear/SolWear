import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://solwear.tech";
  const now = new Date();
  return [
    { url: `${base}/`, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/product/`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/ecosystem/`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/community/`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
  ];
}
