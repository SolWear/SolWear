import Image from "next/image";
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

export default async function ProductPage() {
  const holding = await comingSoonFor();
  if (holding) return <ComingSoon settings={holding} />;

  const c = getSiteContent().product;
  const settings = getSettings();

  return (
    <>
      <SiteNav />
      <main id="main" className="flex min-h-screen flex-col">
        {/* ── INTRO ────────────────────────────────────────────────────────── */}
        <section className="relative z-10 flex min-h-[90svh] items-center pt-28">
          <div className="shell grid items-center gap-12 lg:grid-cols-2">
            <div>
              <Reveal mode="box" as="p" className="t-label">
                {c.hero.eyebrow}
              </Reveal>
              <Reveal mode="text" as="h1" delay={80} className="t-display mt-6">
                {c.hero.headline}
              </Reveal>
              <Reveal mode="box" as="p" delay={200} className="t-lead mt-8 max-w-lg">
                {c.hero.subheadline}
              </Reveal>
              <Reveal mode="box" delay={280} className="mt-10 flex flex-wrap gap-3">
                <Link href="#waitlist" className="btn btn-primary">
                  JOIN WAITLIST
                </Link>
                <Link href="#specifications" className="btn btn-ghost">
                  SPECIFICATIONS
                </Link>
              </Reveal>
            </div>
            <Reveal mode="fill" delay={140} className="order-first lg:order-last">
              <Image
                src={c.hero.image}
                alt={c.hero.imageAlt}
                width={625}
                height={722}
                priority
                sizes="(max-width: 1024px) 70vw, 40vw"
                className="mx-auto h-auto w-full max-w-sm lg:max-w-md"
              />
            </Reveal>
          </div>
        </section>

        {/* ── WHY IT EXISTS ────────────────────────────────────────────────── */}
        <Section className="rule">
          <SectionLabel>{c.why.label}</SectionLabel>
          <SectionHeadline>{c.why.headline}</SectionHeadline>
          <SectionBody>{c.why.body}</SectionBody>
          <div className="mt-16 grid items-center gap-12 lg:grid-cols-[1fr_1fr]">
            <Reveal mode="fill" className="order-last lg:order-first">
              <Image
                src={c.why.image}
                alt={c.why.imageAlt}
                width={545}
                height={400}
                sizes="(max-width: 1024px) 90vw, 45vw"
                className="h-auto w-full border border-line"
              />
            </Reveal>
            <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-1">
              {c.why.points.map((p, i) => (
                <Card key={p.title} title={p.title} text={p.text} delay={i * 70} />
              ))}
            </div>
          </div>
        </Section>

        {/* ── DESIGN ───────────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{c.design.label}</SectionLabel>
          <SectionHeadline>{c.design.headline}</SectionHeadline>
          <SectionBody>{c.design.body}</SectionBody>
          <div className="mt-16 grid gap-12 lg:grid-cols-[1fr_1.1fr] lg:items-center">
            <Reveal mode="fill" className="order-last lg:order-first">
              <Image
                src={c.design.image}
                alt={c.design.imageAlt}
                width={625}
                height={722}
                sizes="(max-width: 1024px) 70vw, 40vw"
                className="mx-auto h-auto w-full max-w-sm"
              />
            </Reveal>
            <dl className="grid gap-px border border-line bg-line sm:grid-cols-2">
              {c.design.details.map((d, i) => (
                <Reveal key={d.title} mode="box" delay={i * 60} className="bg-ground p-6">
                  <dt className="t-h3">{d.title}</dt>
                  <dd className="t-body mt-3">{d.text}</dd>
                </Reveal>
              ))}
            </dl>
          </div>
        </Section>

        {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{c.howItWorks.label}</SectionLabel>
          <SectionHeadline>{c.howItWorks.headline}</SectionHeadline>
          <ol className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
            {c.howItWorks.steps.map((step, i) => (
              <Reveal key={step.step} mode="box" as="li" delay={i * 80} className="rule pt-5">
                <span className="t-label">{step.step}</span>
                <h3 className="t-h3 mt-4">{step.title}</h3>
                <p className="t-body mt-3">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Section>

        {/* ── TECHNOLOGY — every claim carries its real status ─────────────── */}
        <Section>
          <SectionLabel>{c.technology.label}</SectionLabel>
          <SectionHeadline>{c.technology.headline}</SectionHeadline>
          <SectionBody>{c.technology.body}</SectionBody>
          <ul className="mt-16 border-t border-line">
            {c.technology.items.map((item, i) => (
              <Reveal
                key={item.title}
                mode="box"
                as="li"
                delay={i * 50}
                className="flex flex-col gap-3 border-b border-line py-6 md:flex-row md:items-start md:gap-10"
              >
                <div className="md:w-72 md:shrink-0">
                  <h3 className="t-h3">{item.title}</h3>
                </div>
                <p className="t-body flex-1">{item.text}</p>
                <div className="md:pt-1">
                  <StatusTag status={item.status} />
                </div>
              </Reveal>
            ))}
          </ul>
        </Section>

        {/* ── SPECIFICATIONS ───────────────────────────────────────────────── */}
        <Section id="specifications">
          <SectionLabel>{c.specs.label}</SectionLabel>
          <SectionHeadline>{c.specs.headline}</SectionHeadline>
          <Reveal mode="box" as="p" delay={140} className="t-label mt-6 max-w-xl text-red-sw">
            {c.specs.note}
          </Reveal>
          <div className="mt-16 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {c.specs.groups.map((group, i) => (
              <Reveal key={group.name} mode="box" delay={i * 60} className="bg-ground p-6">
                <h3 className="t-label">{group.name}</h3>
                <dl className="mt-5 flex flex-col gap-4">
                  {group.specs.map((spec) => (
                    <div key={spec.label} className="flex flex-col gap-1">
                      <dt className="t-label">{spec.label}</dt>
                      <dd className="t-mono text-ink">{spec.value}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </div>
        </Section>

        {/* ── WHAT'S NEXT ──────────────────────────────────────────────────── */}
        <Section>
          <SectionLabel>{c.next.label}</SectionLabel>
          <SectionHeadline>{c.next.headline}</SectionHeadline>
          <SectionBody>{c.next.body}</SectionBody>
          <div className="mt-16 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
            {c.next.items.map((item, i) => (
              <Card key={item.title} title={item.title} text={item.text} status={item.status} delay={i * 60} />
            ))}
          </div>
        </Section>

        {/* ── WAITLIST ─────────────────────────────────────────────────────── */}
        <Section id="waitlist" className="rule">
          <Reveal mode="text" as="h2" className="t-display max-w-[14ch]">
            WANT ONE?
          </Reveal>
          <Reveal mode="box" as="p" delay={140} className="t-lead mt-8 max-w-lg">
            MK1 IS NOT FOR SALE YET. THE WAITLIST IS HOW YOU GET TOLD FIRST WHEN IT IS.
          </Reveal>
          <Reveal mode="box" delay={220}>
            <WaitlistForm source="product" />
          </Reveal>
        </Section>

        <SiteFooter social={settings.social} />
      </main>
    </>
  );
}
