import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import Reveal from "@/components/cubes/Reveal";
import CommunityClient from "./CommunityClient";
import { getSiteContent } from "@/lib/server/siteContent";
import { getSettings } from "@/lib/server/settings";
import { comingSoonFor } from "@/lib/server/maintenance";
import ComingSoon from "@/components/site/ComingSoon";

export default async function CommunityPage() {
  const holding = await comingSoonFor();
  if (holding) return <ComingSoon settings={holding} />;

  const content = getSiteContent().community;
  const settings = getSettings();

  return (
    <>
      <SiteNav />
      <main id="main" className="flex min-h-screen flex-col">
        <section className="relative z-10 pb-8 pt-40">
          <div className="shell">
            <Reveal mode="box" as="p" className="t-label">
              {content.hero.eyebrow}
            </Reveal>
            <Reveal mode="text" as="h1" delay={80} className="t-display mt-6 max-w-[18ch]">
              {content.hero.headline}
            </Reveal>
            <Reveal mode="box" as="p" delay={200} className="t-lead mt-8 max-w-2xl">
              {content.hero.subheadline}
            </Reveal>
          </div>
        </section>

        <CommunityClient content={content} />

        <SiteFooter social={settings.social} />
      </main>
    </>
  );
}
