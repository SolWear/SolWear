import Link from "next/link";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import WaitlistForm from "@/components/site/WaitlistForm";
import Reveal from "@/components/cubes/Reveal";
import Card from "@/components/ui/Card";
import StatusTag from "@/components/ui/StatusTag";
import { Section, SectionBody, SectionHeadline, SectionLabel } from "@/components/ui/Section";
import { getSiteContent } from "@/lib/server/siteContent";
import { getSettings } from "@/lib/server/settings";
import { comingSoonFor } from "@/lib/server/maintenance";
import ComingSoon from "@/components/site/ComingSoon";

export default async function EcosystemPage() {
  const holding = await comingSoonFor();
  if (holding) return <ComingSoon settings={holding} />;

  const c = getSiteContent().ecosystem;
  const settings = getSettings();

  return (
    <>
      <SiteNav />
      <main id="main" className="flex min-h-screen flex-col">
        {/* ── INTRO ────────────────────────────────────────────────────────── */}
        <section className="relative z-10 flex min-h-[85svh] items-center pt-28">
          <div className="shell">
            <Reveal mode="box" as="p" className="t-label">
              {c.hero.eyebrow}
            </Reveal>
            <Reveal mode="text" as="h1" delay={80} className="t-display mt-6 max-w-[18ch] whitespace-pre-line">
              {c.hero.headline}
            </Reveal>
            <Reveal mode="box" as="p" delay={220} className="t-lead mt-8 max-w-2xl">
              {c.hero.subheadline}
            </Reveal>
          </div>
        </section>

        {/* ── THE STACK ────────────────────────────────────────────────────── */}
        <Section className="rule">
          <SectionLabel>{c.stack.label}</SectionLabel>
          <SectionHeadline>{c.stack.headline}</SectionHeadline>
          <SectionBody>{c.stack.body}</SectionBody>

          <ol className="mt-16 border-t border-line">
            {c.stack.layers.map((layer, i) => (
              <Reveal
                key={layer.title}
                mode="box"
                as="li"
                delay={i * 70}
                className="flex flex-col gap-4 border-b border-line py-8 md:flex-row md:items-baseline md:gap-10"
              >
                <span className="t-label md:w-16 md:shrink-0">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h2 md:w-80 md:shrink-0">{layer.title}</h3>
                <p className="t-body flex-1">{layer.text}</p>
                <div className="shrink-0">
                  <StatusTag status={layer.status} />
                </div>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* ── PROTOCOL INTEGRATIONS ────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{c.integrations.label}</SectionLabel>
          <SectionHeadline>{c.integrations.headline}</SectionHeadline>
          <SectionBody>{c.integrations.body}</SectionBody>
          <div className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {c.integrations.items.map((item, i) => (
              <Card key={item.title} title={item.title} text={item.text} status={item.status} delay={i * 50} />
            ))}
          </div>
        </Section>

        {/* ── DEVELOPERS ───────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{c.developers.label}</SectionLabel>
          <SectionHeadline>{c.developers.headline}</SectionHeadline>
          <SectionBody>{c.developers.body}</SectionBody>
          <div className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {c.developers.points.map((p, i) => (
              <Card key={p.title} index={String(i + 1).padStart(2, "0")} title={p.title} text={p.text} delay={i * 60} />
            ))}
          </div>
          <Reveal mode="box" delay={220} className="mt-12 flex flex-wrap gap-3">
            <Link href="/community/" className="btn btn-ghost">
              JOIN THE COMMUNITY
            </Link>
            <a href={`mailto:${settings.social.email}`} className="btn btn-ghost">
              TALK TO US
            </a>
          </Reveal>
        </Section>

        {/* ── FUTURE APPLICATIONS ──────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{c.apps.label}</SectionLabel>
          <SectionHeadline>{c.apps.headline}</SectionHeadline>
          <SectionBody>{c.apps.body}</SectionBody>
          <div className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {c.apps.ideas.map((idea, i) => (
              <Card key={idea.title} title={idea.title} text={idea.text} status="PLANNED" delay={i * 60} />
            ))}
          </div>
        </Section>

        {/* ── WAITLIST ─────────────────────────────────────────────────────── */}
        <Section id="waitlist" className="rule">
          <Reveal mode="text" as="h2" className="t-display max-w-[16ch]">
            GET IN EARLY.
          </Reveal>
          <Reveal mode="box" as="p" delay={140} className="t-lead mt-8 max-w-lg">
            THE SDK GOES TO THIS LIST FIRST. SO DOES THE HARDWARE.
          </Reveal>
          <Reveal mode="box" delay={220}>
            <WaitlistForm source="ecosystem" />
          </Reveal>
        </Section>

        <SiteFooter social={settings.social} />
      </main>
    </>
  );
}
