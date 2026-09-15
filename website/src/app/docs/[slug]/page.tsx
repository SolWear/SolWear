import type { Metadata } from "next";
import { notFound } from "next/navigation";
import DocView from "@/components/docs/DocView";
import { findItem, pageSlugs, OVERVIEW_SLUG } from "@/lib/docs";

export function generateStaticParams() {
  return pageSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const item = findItem(slug);
  return item
    ? { title: "SOLWEAR", alternates: { canonical: `https://docs.solwear.tech/${slug}/` } }
    : {};
}

export default async function DocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  // The overview lives at /docs, not /docs/index.
  if (slug === OVERVIEW_SLUG || !findItem(slug)) notFound();
  return <DocView slug={slug} />;
}
