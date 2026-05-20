"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { defaultSiteContent, defaultSponsors, type SiteContent, type SponsorLogo } from "@/lib/siteContent";
import { SectionShell, CardGrid } from "@/components/ui/SectionHelpers";

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

type Props = {
  initialContent?: SiteContent;
  initialSponsors?: SponsorLogo[];
};

function youtubeEmbedUrl(url: string): string | null {
  if (!url.trim()) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = parsed.pathname.slice(1);
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/watch")) id = parsed.searchParams.get("v") ?? "";
      if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.split("/").filter(Boolean)[1] ?? "";
      }
    }
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

function HeroVisual({ content }: { content: SiteContent }) {
  const embed = youtubeEmbedUrl(content.hero.video.youtubeUrl);

  return (
    <div className="relative">
      <div className="absolute -inset-8 rounded-[2rem] bg-[radial-gradient(circle_at_82%_70%,rgba(20,241,149,0.12),transparent_34%)] blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black/65 p-5 shadow-2xl shadow-black/40 backdrop-blur-md">
        <div className="relative min-h-[360px] overflow-hidden rounded-2xl border border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.09),rgba(255,255,255,0.015))]">
          <Image
            src="/watch-hero.png"
            alt="SolWear wearable signer"
            fill
            priority
            sizes="(min-width: 1024px) 45vw, 100vw"
            className="object-contain object-center p-8 opacity-90 drop-shadow-2xl"
          />
          <div className="absolute inset-x-5 bottom-5 rounded-2xl border border-white/10 bg-black/88 p-5 backdrop-blur-md">
            <p className="text-xl font-semibold text-white">{content.hero.sideTitle}</p>
            <div className="mt-4 space-y-2 text-sm leading-6 text-white/65">
              {content.hero.sideLines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          </div>
        </div>

        <div id="demo" className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
          {embed ? (
            <iframe
              src={embed}
              title={content.hero.video.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              className="aspect-video w-full"
            />
          ) : (
            <div className="flex aspect-video flex-col items-center justify-center gap-4 p-6 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-full border border-white/15 bg-white/[0.06]">
                <svg className="h-5 w-5 translate-x-0.5 text-white/60" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                </svg>
              </div>
              <p className="text-sm font-semibold text-white">Demo coming soon</p>
              <a href="/pitch/" className="text-xs text-white/40 underline underline-offset-2 transition hover:text-white/70">
                View pitch deck instead →
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function SponsorGrid({ content, sponsors }: { content: SiteContent; sponsors: SponsorLogo[] }) {
  return (
    <SectionShell
      eyebrow="sponsors"
      headline={content.sections.sponsors.headline}
      body={[content.sections.sponsors.body]}
    >
      {sponsors.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 lg:grid-cols-6">
          {sponsors.map((sponsor) => {
            const image = (
              <div className="grayscale opacity-60 transition-all duration-300 group-hover:grayscale-0 group-hover:opacity-100">
                <img
                  src={sponsor.logo_url}
                  alt={sponsor.name}
                  className="max-h-10 w-auto max-w-full object-contain"
                  style={{
                    filter: `${sponsor.invert ? "invert(1)" : ""} brightness(${sponsor.brightness})`,
                  }}
                />
              </div>
            );
            return (
              <div
                key={sponsor.id}
                className="group flex min-h-28 items-center justify-center rounded-2xl border border-white/5 bg-black/45 p-6 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/15 hover:bg-white/[0.06]"
              >
                {sponsor.href ? (
                  <a href={sponsor.href} target="_blank" rel="noreferrer" aria-label={sponsor.name}>
                    {image}
                  </a>
                ) : (
                  image
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-white/12 bg-black/20 p-8 text-sm text-white/42">
          Sponsor and ecosystem logos can be added from the admin panel.
        </div>
      )}
    </SectionShell>
  );
}

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? "";

export default function LandingPage({ initialContent = defaultSiteContent, initialSponsors = defaultSponsors }: Props) {
  const [content, setContent] = useState(initialContent);
  const [sponsors, setSponsors] = useState(initialSponsors);
  const [email, setEmail] = useState("");
  const [waitlistStatus, setWaitlistStatus] = useState<"idle" | "pending" | "success" | "error">("idle");
  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileTokenRef = useRef<string>("");

  useEffect(() => {
    if (!TURNSTILE_SITE_KEY || !turnstileRef.current) return;
    // Load Turnstile script once
    if (!document.getElementById("cf-turnstile-script")) {
      const s = document.createElement("script");
      s.id = "cf-turnstile-script";
      s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
      s.async = true;
      document.head.appendChild(s);
    }
    const interval = setInterval(() => {
      if (typeof window !== "undefined" && (window as unknown as Record<string, unknown>).turnstile) {
        clearInterval(interval);
        (window as unknown as { turnstile: { render: (el: HTMLElement, opts: Record<string, unknown>) => void } }).turnstile.render(turnstileRef.current!, {
          sitekey: TURNSTILE_SITE_KEY,
          callback: (token: string) => { turnstileTokenRef.current = token; },
          theme: "dark",
          size: "compact",
        });
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  async function submitWaitlist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setWaitlistStatus("pending");
    try {
      const res = await fetch("/api/notify/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstile: turnstileTokenRef.current }),
      });
      if (res.ok) {
        setWaitlistStatus("success");
        setEmail("");
      } else {
        setWaitlistStatus("error");
      }
    } catch {
      setWaitlistStatus("error");
    }
  }

  useEffect(() => {
    if (!dynamicEnabled) return;
    fetch("/api/site-content/")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.content) setContent(data.content);
        if (Array.isArray(data?.sponsors)) setSponsors(data.sponsors);
      })
      .catch(() => {});
  }, []);

  const section = content.sections;

  return (
    <main className="relative h-screen overflow-y-scroll [scroll-snap-type:y_mandatory]">
      <section id="product" className="relative flex min-h-screen flex-col justify-center overflow-hidden px-6 pb-16 pt-28 md:pb-24 md:pt-36 [scroll-snap-align:start]">
        <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_78%_18%,rgba(20,241,149,0.12),transparent_28%),linear-gradient(180deg,rgba(5,5,5,0),#050505_86%)]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
          <div>
            <h1 className="max-w-4xl whitespace-pre-line text-5xl font-semibold leading-[0.98] text-white md:text-7xl">
              {content.hero.headline}
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/68">
              {content.hero.subheadline}
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href={content.links.waitlistHref}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 py-3 text-sm font-semibold text-black transition hover:bg-white/90"
              >
                {content.hero.primaryButton}
              </a>
              <a
                href={content.links.demoHref}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 py-3 text-sm font-semibold text-white/82 transition hover:border-white/35 hover:text-white"
              >
                {content.hero.secondaryButton}
              </a>
              <a
                href={content.links.pitchHref}
                className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-emerald-300/20 px-7 py-3 text-sm font-semibold text-emerald-100 transition hover:border-emerald-200/45"
              >
                Pitch
              </a>
            </div>
            <p className="mt-6 text-xs tracking-widest text-white/25">
              NFC · On-device signing · Solana Pay · Blinks
            </p>
          </div>
          <HeroVisual content={content} />
        </div>
      </section>

      <SectionShell id="problem" eyebrow="problem" headline={section.problem.headline} body={section.problem.body}>
        <CardGrid cards={section.problem.cards} />
      </SectionShell>

      <SectionShell id="roadmap" eyebrow="roadmap" headline={section.roadmap.headline}>
        <div className="grid gap-4 md:grid-cols-3">
          {section.roadmap.phases.map((phase) => (
            <article key={phase.title} className="rounded-2xl border border-white/10 bg-black/55 p-6 backdrop-blur-sm">
              <h3 className="text-xl font-semibold text-white">{phase.title}</h3>
              <ul className="mt-6 space-y-3">
                {phase.items.map((item) => (
                  <li key={item} className="flex gap-3 text-sm text-white/62">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-300" />
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </SectionShell>

      <SponsorGrid content={content} sponsors={sponsors} />

      <section id="waitlist" className="flex min-h-screen items-center px-6 py-24 [scroll-snap-align:start]">
        <div className="mx-auto max-w-4xl rounded-3xl border border-white/10 bg-white/[0.035] p-8 text-center shadow-2xl shadow-black/30 backdrop-blur-md md:p-12">
          <h2 className="text-4xl font-semibold leading-tight text-white md:text-6xl">{section.finalCta.headline}</h2>
          <div className="mx-auto mt-6 max-w-2xl space-y-3 text-base leading-7 text-white/62">
            {section.finalCta.body.map((line) => (
              <p key={line}>{line}</p>
            ))}
          </div>
          {waitlistStatus === "success" ? (
            <div className="mt-9 rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.06] px-6 py-5">
              <p className="text-sm font-semibold text-emerald-200">You&apos;re on the list.</p>
              <p className="mt-1 text-xs text-white/50">We&apos;ll reach out when SolWear is ready.</p>
            </div>
          ) : (
            <form onSubmit={submitWaitlist} className="mt-9 flex flex-col items-center gap-3">
              <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="focus-ring min-h-12 w-full max-w-xs rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm text-white placeholder-white/30 outline-none backdrop-blur-sm transition focus:border-white/35 sm:w-auto"
                />
                <button
                  type="submit"
                  disabled={waitlistStatus === "pending"}
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full bg-white px-7 text-sm font-semibold text-black transition hover:bg-white/90 disabled:opacity-60"
                >
                  {waitlistStatus === "pending" ? "Joining…" : section.finalCta.primaryButton}
                </button>
                <a
                  href={content.links.xHref}
                  target="_blank"
                  rel="noreferrer"
                  className="focus-ring inline-flex min-h-12 items-center justify-center rounded-full border border-white/15 px-7 text-sm font-semibold text-white/82 transition hover:border-white/35 hover:text-white"
                >
                  {section.finalCta.secondaryButton}
                </a>
              </div>
              {TURNSTILE_SITE_KEY && <div ref={turnstileRef} className="mt-2" />}
            </form>
          )}
          {waitlistStatus === "error" && (
            <p className="mt-3 text-xs text-red-400">Something went wrong — please try again.</p>
          )}
          <p className="mt-9 text-sm text-white/45">{section.finalCta.footerLine}</p>
        </div>
      </section>
    </main>
  );
}
