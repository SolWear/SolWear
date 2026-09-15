import Wordmark from "@/components/ui/Wordmark";
import WaitlistForm from "@/components/site/WaitlistForm";
import Reveal from "@/components/cubes/Reveal";
import type { SiteSettings } from "@/lib/server/settings";

/** What the public sees while the site is in coming-soon mode. */
export default function ComingSoon({ settings }: { settings: SiteSettings }) {
  return (
    <main id="main" className="relative z-10 flex min-h-screen flex-col justify-between">
      <div className="shell pt-10">
        <Wordmark size={22} />
      </div>

      <div className="shell">
        <Reveal mode="text" as="h1" className="t-display max-w-[16ch]">
          {settings.comingSoonHeadline}
        </Reveal>
        <Reveal mode="box" as="p" delay={160} className="t-lead mt-8 max-w-lg">
          {settings.comingSoonBody}
        </Reveal>
        <Reveal mode="box" delay={240}>
          <WaitlistForm source="coming-soon" />
        </Reveal>
      </div>

      <div className="shell flex flex-wrap items-center gap-x-8 gap-y-3 pb-10">
        <a href={settings.social.x} target="_blank" rel="noreferrer" className="focus-ring t-label hover:text-ink">
          X
        </a>
        <a href={`mailto:${settings.social.email}`} className="focus-ring t-label hover:text-ink">
          CONTACT
        </a>
        <p className="t-label">© {new Date().getFullYear()} SOLWEAR</p>
      </div>
    </main>
  );
}
