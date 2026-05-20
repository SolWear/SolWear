"use client";

import { useEffect, useRef, type ReactNode } from "react";
import type { CopyCard } from "@/lib/siteContent";

function useFadeIn() {
  const ref = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add("is-visible");
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);
  return ref;
}

export function SectionShell({
  id,
  eyebrow,
  headline,
  body,
  children,
}: {
  id?: string;
  eyebrow?: string;
  headline: string;
  body?: string[];
  children?: ReactNode;
}) {
  const ref = useFadeIn();

  return (
    <section
      ref={ref}
      id={id}
      className="fade-section relative flex min-h-screen flex-col justify-center px-6 py-20 [scroll-snap-align:start] md:py-28"
    >
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-3xl">
          {eyebrow && (
            <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/45">
              {eyebrow}
            </p>
          )}
          <h2 className="max-w-4xl whitespace-pre-line text-3xl font-semibold leading-tight text-white md:text-5xl">
            {headline}
          </h2>
          {body && (
            <div className="mt-6 space-y-3 text-base leading-7 text-white/62 md:text-lg">
              {body.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}
        </div>
        {children}
      </div>
    </section>
  );
}

export function CardGrid({ cards, columns = "md:grid-cols-3" }: { cards: CopyCard[]; columns?: string }) {
  return (
    <div className={`grid gap-4 ${columns}`}>
      {cards.map((card, index) => (
        <article
          key={`${card.title}-${index}`}
          className="group rounded-2xl border border-white/10 bg-black/55 p-6 shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-black/45 card-fade-in"
          style={{ animationDelay: `${index * 60}ms` }}
        >
          <div className="mb-6 h-px w-12 bg-white/40" />
          <h3 className="text-lg font-semibold text-white">{card.title}</h3>
          <p className="mt-3 text-sm leading-6 text-white/58">{card.text}</p>
        </article>
      ))}
    </div>
  );
}
