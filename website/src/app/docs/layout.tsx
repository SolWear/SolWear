import type { Metadata } from "next";
import { headers } from "next/headers";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import DocsSidebar from "@/components/docs/DocsSidebar";
import { getSettings } from "@/lib/server/settings";

export const metadata: Metadata = {
  title: "SOLWEAR",
  description:
    "SolWear OS documentation — build web apps for a wearable operating system: the SDK, the CLI, the emulator, packaging and signing, and the JSON-RPC API.",
  alternates: { canonical: "https://docs.solwear.tech/" },
};

export default async function DocsLayout({ children }: { children: React.ReactNode }) {
  const settings = getSettings();
  const requestHeaders = await headers();
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "").split(":")[0];
  const cleanRoot = host === "docs.solwear.tech";
  return (
    <>
      <SiteNav />
      <main id="main" className="relative z-10 flex min-h-screen flex-col pt-24">
        <div className="shell w-full flex-1 pb-24">
          <div className="docs-stage grid gap-x-12 gap-y-8 lg:grid-cols-[15rem_minmax(0,1fr)]">
            <DocsSidebar cleanRoot={cleanRoot} />
            <div className="docs-fog min-w-0">{children}</div>
          </div>
        </div>
        <SiteFooter social={settings.social} />
      </main>
    </>
  );
}
