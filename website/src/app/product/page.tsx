"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { defaultSiteContent, type SiteContent } from "@/lib/siteContent";

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

// ── Sidebar indicator ──────────────────────────────────────────────────────────
const PRODUCTS = [
  { num: "01", label: "SolWear" },
  { num: "02", label: "SolBand" },
  { num: "03", label: "Maskot" },
];

function Sidebar({ active, onPick }: { active: number; onPick: (i: number) => void }) {
  return (
    <aside className="fixed left-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col gap-5 lg:flex">
      {PRODUCTS.map((p, i) => (
        <button
          key={p.num}
          onClick={() => onPick(i)}
          className="group flex items-center gap-3 text-left"
          aria-label={`Go to ${p.label}`}
        >
          <span
            className={`h-px transition-all duration-300 ${
              active === i ? "w-8 bg-white" : "w-4 bg-white/25 group-hover:bg-white/50"
            }`}
          />
          <span
            className={`text-xs font-semibold transition-colors duration-300 ${
              active === i ? "text-white" : "text-white/30 group-hover:text-white/60"
            }`}
          >
            {p.num} {p.label}
          </span>
        </button>
      ))}
    </aside>
  );
}

// ── Shared card ────────────────────────────────────────────────────────────────
function Card({ title, text }: { title: string; text: string }) {
  return (
    <article className="rounded-2xl border border-white/10 bg-black/55 p-5 backdrop-blur-sm">
      <div className="mb-4 h-px w-8 bg-white/40" />
      <h4 className="text-sm font-semibold text-white">{title}</h4>
      <p className="mt-2 text-xs leading-5 text-white/55">{text}</p>
    </article>
  );
}

// ── SolWear section ────────────────────────────────────────────────────────────
function SolWearSection({ content }: { content: SiteContent }) {
  const s = content.sections;
  return (
    <section className="relative flex h-screen flex-col overflow-y-auto px-6 pt-24 pb-16 [scroll-snap-align:start]">
      <div className="absolute inset-x-0 top-0 h-[600px] bg-[radial-gradient(circle_at_70%_0%,rgba(20,241,149,0.10),transparent_40%)]" />
      <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center gap-14 lg:pl-28">
        {/* Header */}
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-300/80">01 — SolWear</p>
            <h1 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
              Wearable Solana signer.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-white/62">
              Hardware-wallet security at hot-wallet speed. Approve transactions from your wrist — your private key never leaves the device.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a href="/pitch/" className="focus-ring inline-flex min-h-10 items-center rounded-full border border-white/15 px-5 text-sm text-white/75 transition hover:border-white/35 hover:text-white">
                View pitch
              </a>
              <a href="/#waitlist" className="focus-ring inline-flex min-h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90">
                Join waitlist
              </a>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="absolute -inset-6 rounded-[2rem] bg-[radial-gradient(circle_at_60%_40%,rgba(20,241,149,0.10),transparent_50%)]" />
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-4">
              <Image src="/sticker.webp" alt="SolWear watch" width={380} height={320} className="object-contain" />
            </div>
          </div>
        </div>

        {/* How it works */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">How it works</p>
          <div className="grid gap-3 sm:grid-cols-3">
            {s.solution.cards.map((c) => <Card key={c.title} title={c.title} text={c.text} />)}
          </div>
        </div>

        {/* Security */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Security model</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {s.security.cards.map((c) => <Card key={c.title} title={c.title} text={c.text} />)}
          </div>
          <div className="mt-4 rounded-2xl border border-emerald-300/15 bg-emerald-300/[0.055] p-5">
            <p className="text-sm font-semibold text-white">{s.security.noteTitle}</p>
            <p className="mt-2 text-sm leading-6 text-white/62">{s.security.noteBody[0]}</p>
            <p className="mt-3 text-xs font-semibold text-emerald-200">{s.security.noteStrong}</p>
          </div>
        </div>

        {/* Use cases */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Use cases</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {s.useCases.cards.map((c) => <Card key={c.title} title={c.title} text={c.text} />)}
          </div>
        </div>

        {/* Comparison */}
        <div>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/40">Comparison</p>
          <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/35">
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead>
                <tr>
                  {s.comparison.columns.map((col) => (
                    <th key={col} className="border-b border-white/10 px-4 py-3 text-xs font-medium text-white/50">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.comparison.rows.map((row) => (
                  <tr key={row[0]} className={row[0] === "SolWear" ? "bg-emerald-300/[0.055] text-white" : "text-white/62"}>
                    {row.map((cell, i) => (
                      <td key={i} className="border-b border-white/5 px-4 py-3 text-xs">
                        <span className={row[0] === "SolWear" && i === 0 ? "font-semibold text-emerald-100" : ""}>
                          {cell}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SolBand section ────────────────────────────────────────────────────────────
function SolBandSection() {
  return (
    <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-6 [scroll-snap-align:start]">
      <div className="absolute inset-x-0 top-0 h-full bg-[radial-gradient(circle_at_30%_60%,rgba(153,69,255,0.10),transparent_45%)]" />
      <div className="relative mx-auto max-w-5xl lg:pl-28">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-purple-300/80">02 — SolBand</p>
        <h2 className="text-4xl font-semibold leading-tight text-white md:text-6xl">
          Lighter. Faster.<br />Always ready.
        </h2>
        <p className="mt-6 max-w-xl text-base leading-7 text-white/62">
          SolBand brings the same NFC signing power in a slim wristband form factor. Built for everyday payments without the bulk — same key isolation, smaller footprint.
        </p>

        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          {[
            { title: "Same signing core", text: "On-device key storage and physical approval — identical to SolWear." },
            { title: "Band form factor", text: "Slim, lightweight, built for people who prefer a band over a full watch." },
            { title: "Coming soon", text: "SolBand is in development. Join the waitlist to follow progress." },
          ].map((c) => <Card key={c.title} title={c.title} text={c.text} />)}
        </div>

        <div className="mt-8">
          <a href="/#waitlist" className="focus-ring inline-flex min-h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90">
            Join waitlist
          </a>
        </div>
      </div>
    </section>
  );
}

// ── Maskot section ─────────────────────────────────────────────────────────────
function MaskotSection() {
  return (
    <section className="relative flex h-screen flex-col items-center justify-center overflow-hidden px-6 [scroll-snap-align:start]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.03),transparent_60%)]" />
      <div className="relative text-center lg:pl-28">
        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-white/30">03 — Maskot</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2 text-4xl font-semibold leading-tight text-white/20 md:text-7xl select-none">
          {"????????????????????????????????????????????????????????????????????".split("").map((c, i) => (
            <span key={i} className="inline-block transition-all duration-500 hover:text-white/60">{c}</span>
          ))}
        </div>
        <p className="mt-10 text-sm text-white/25">Something is coming.</p>
      </div>
    </section>
  );
}

// ── Main ───────────────────────────────────────────────────────────────────────
export default function ProductPage() {
  const [content, setContent] = useState<SiteContent>(defaultSiteContent);
  const [active, setActive] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const sec0 = useRef<HTMLElement>(null);
  const sec1 = useRef<HTMLElement>(null);
  const sec2 = useRef<HTMLElement>(null);
  const sectionRefs = [sec0, sec1, sec2];

  useEffect(() => {
    if (!dynamicEnabled) return;
    fetch("/api/site-content/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => { if (data?.content) setContent(data.content); })
      .catch(() => {});
  }, []);

  // Track active section via IntersectionObserver
  useEffect(() => {
    const observers = sectionRefs.map((ref, i) => {
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActive(i); },
        { threshold: 0.5 }
      );
      if (ref.current) obs.observe(ref.current);
      return obs;
    });
    return () => observers.forEach((o) => o.disconnect());
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const scrollToSection = (i: number) => {
    sectionRefs[i].current?.scrollIntoView({ behavior: "smooth" });
  };

  // Attach refs to the rendered sections
  const attachRef = (i: number) => (el: HTMLElement | null) => {
    if (el) (sectionRefs[i] as React.MutableRefObject<HTMLElement | null>).current = el;
  };

  return (
    <>
      <Nav />
      <Sidebar active={active} onPick={scrollToSection} />
      <div
        ref={containerRef}
        className="h-screen overflow-y-scroll [scroll-snap-type:y_mandatory]"
      >
        <div ref={attachRef(0) as React.RefCallback<HTMLDivElement>}>
          <SolWearSection content={content} />
        </div>
        <div ref={attachRef(1) as React.RefCallback<HTMLDivElement>}>
          <SolBandSection />
        </div>
        <div ref={attachRef(2) as React.RefCallback<HTMLDivElement>}>
          <MaskotSection />
        </div>
      </div>
    </>
  );
}
