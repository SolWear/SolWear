import Image from "next/image";
import Link from "next/link";
import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import WaitlistForm from "@/components/site/WaitlistForm";
import Reveal from "@/components/cubes/Reveal";
import Card from "@/components/ui/Card";
import StatusTag from "@/components/ui/StatusTag";
import { Section, SectionBody, SectionHeadline, SectionLabel } from "@/components/ui/Section";
import { getAchievements, getSiteContent, getSponsorLogos } from "@/lib/server/siteContent";
import { getSettings } from "@/lib/server/settings";
import { comingSoonFor } from "@/lib/server/maintenance";
import ComingSoon from "@/components/site/ComingSoon";
import LoadingScreen from "@/components/site/LoadingScreen";

export default async function Home() {
  const holding = await comingSoonFor();
  if (holding) return <ComingSoon settings={holding} />;

  const content = getSiteContent().home;
  const settings = getSettings();
  const achievements = getAchievements();
  const partners = getSponsorLogos();
  const hasProof = achievements.length > 0 || partners.length > 0;

  return (
    <>
      <LoadingScreen />
      <SiteNav />
      <main id="main" className="flex min-h-screen flex-col">
        {/* ── HERO ─────────────────────────────────────────────────────────── */}
        <section className="relative z-10 flex min-h-[100svh] items-center pt-24">
          <div className="shell grid items-center gap-10 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <Reveal mode="box" as="p" className="t-label">
              {content.hero.eyebrow}
            </Reveal>

            <Reveal mode="text" as="h1" delay={80} className="t-display mt-6 max-w-[16ch] whitespace-pre-line">
              {content.hero.headline}
            </Reveal>

            <Reveal mode="box" as="p" delay={220} className="t-lead mt-8 max-w-xl">
              {content.hero.subheadline}
            </Reveal>

            <Reveal mode="box" delay={320} className="mt-10 flex flex-wrap gap-3">
              <a href="#waitlist" className="btn btn-primary">
                {content.hero.primaryCta}
              </a>
              <Link href="/product/" className="btn btn-ghost">
                {content.hero.secondaryCta}
              </Link>
            </Reveal>

          </div>

            <Reveal mode="fill" delay={240} className="order-first lg:order-last">
              <Image
                src={content.hero.image}
                alt={content.hero.imageAlt}
                width={625}
                height={722}
                priority
                sizes="(max-width: 1024px) 60vw, 38vw"
                className="mx-auto h-auto w-full max-w-[19rem] lg:max-w-none"
              />
            </Reveal>
          </div>
        </section>

        {/* ── SOCIAL PROOF — real relationships only ───────────────────────── */}
        {hasProof ? (
          <section className="relative z-10 rule py-10">
            <div className="shell flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <Reveal mode="box" as="p" className="t-label shrink-0">
                {content.proof.label}
              </Reveal>
              <Reveal mode="box" delay={80} className="flex flex-wrap items-center gap-x-10 gap-y-4">
                {achievements.map((a) => (
                  <span key={`a-${a.id}`} className="t-mono text-ink">
                    {a.place.toUpperCase()} — {a.event_name.toUpperCase()}
                  </span>
                ))}
                {partners.map((p) =>
                  p.href ? (
                    <a
                      key={`p-${p.id}`}
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="focus-ring t-mono text-ink-dim transition-colors hover:text-ink"
                    >
                      {p.name.toUpperCase()}
                    </a>
                  ) : (
                    <span key={`p-${p.id}`} className="t-mono text-ink-dim">
                      {p.name.toUpperCase()}
                    </span>
                  ),
                )}
              </Reveal>
            </div>
          </section>
        ) : null}

        {/* ── THE PROBLEM ──────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{content.problem.label}</SectionLabel>
          <SectionHeadline>{content.problem.headline}</SectionHeadline>
          <SectionBody>{content.problem.body}</SectionBody>
          <div className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {content.problem.points.map((point, i) => (
              <Card key={point.title} title={point.title} text={point.text} delay={i * 70} />
            ))}
          </div>
        </Section>

        {/* ── THE SOLUTION ─────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{content.solution.label}</SectionLabel>
          <SectionHeadline>{content.solution.headline}</SectionHeadline>
          <SectionBody>{content.solution.body}</SectionBody>
          <div className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {content.solution.points.map((point, i) => (
              <Card key={point.title} title={point.title} text={point.text} delay={i * 70} />
            ))}
          </div>
        </Section>

        {/* ── BENEFITS — outcomes, not a feature dump ──────────────────────── */}
        <Section>
          <SectionLabel>{content.benefits.label}</SectionLabel>
          <SectionHeadline>{content.benefits.headline}</SectionHeadline>
          <div className="mt-16 grid gap-x-10 gap-y-12 md:grid-cols-2">
            {content.benefits.items.map((item, i) => (
              <Card
                key={item.title}
                index={String(i + 1).padStart(2, "0")}
                title={item.title}
                text={item.text}
                delay={i * 70}
              />
            ))}
          </div>
        </Section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{content.howItWorks.label}</SectionLabel>
          <SectionHeadline>{content.howItWorks.headline}</SectionHeadline>
          <ol className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-3">
            {content.howItWorks.steps.map((step, i) => (
              <Reveal key={step.step} mode="box" as="li" delay={i * 90} className="rule pt-5">
                <span className="t-label">{step.step}</span>
                <h3 className="t-h2 mt-4">{step.title}</h3>
                <p className="t-body mt-3">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* ── THE DEVICE ───────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{content.device.label}</SectionLabel>
          <div className="mt-5 grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal mode="text" as="h2" delay={80} className="t-h2">
                {content.device.headline}
              </Reveal>
              <Reveal mode="box" as="p" delay={160} className="t-body mt-6 max-w-md">
                {content.device.body}
              </Reveal>
              <Reveal mode="box" delay={220} className="mt-10">
                <dl className="grid grid-cols-2 gap-px border border-line bg-line">
                  {content.device.specs.map((spec) => (
                    <div key={spec.label} className="bg-ground p-5">
                      <dt className="t-label">{spec.label}</dt>
                      <dd className="t-mono mt-2 text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
              <Reveal mode="box" delay={280} className="mt-8">
                <Link href="/product/" className="btn btn-ghost">
                  {content.device.cta}
                </Link>
              </Reveal>
            </div>

            <Reveal mode="fill" delay={120} className="relative order-first lg:order-last">
              <Image
                src={content.device.image}
                alt={content.device.imageAlt}
                width={625}
                height={722}
                className="h-auto w-full max-w-md mx-auto"
                priority={false}
              />
            </Reveal>
          </div>
        </Section>

        {/* ── ECOSYSTEM TEASER ─────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{content.ecosystem.label}</SectionLabel>
          <SectionHeadline>{content.ecosystem.headline}</SectionHeadline>
          <SectionBody>{content.ecosystem.body}</SectionBody>
          <ol className="mt-16 grid gap-px border border-line bg-line md:grid-cols-4">
            {content.ecosystem.layers.map((layer, i) => (
              <Reveal key={layer.title} mode="box" as="li" delay={i * 70} className="flex flex-col gap-3 bg-ground p-6">
                <span className="t-label">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="t-h3">{layer.title}</h3>
                <p className="t-body flex-1">{layer.text}</p>
                <StatusTag status={layer.status} />
              </Reveal>
            ))}
          </ol>
          <Reveal mode="box" delay={200} className="mt-10">
            <Link href="/ecosystem/" className="btn btn-ghost">
              {content.ecosystem.cta}
            </Link>
          </Reveal>
        </Section>

        {/* ── WAITLIST ─────────────────────────────────────────────────────── */}
        <Section id="waitlist" className="rule">
          <Reveal mode="text" as="h2" className="t-display max-w-[14ch]">
            {content.waitlist.headline}
          </Reveal>
          <Reveal mode="box" as="p" delay={140} className="t-lead mt-8 max-w-lg">
            {content.waitlist.body}
          </Reveal>
          <Reveal mode="box" delay={220}>
            <WaitlistForm source="home" cta={content.waitlist.cta} />
          </Reveal>
        </Section>

        <SiteFooter social={settings.social} />
      </main>
    </>
  );
}
