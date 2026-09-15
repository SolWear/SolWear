"use client";

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";
import { registerReveal, type RevealMode } from "@/lib/cubes/CubeField";

/**
 * Visibility is owned here and ONLY here.
 *
 * An earlier version waited for the cube engine to finish assembling before
 * showing the copy — which meant scrolling into a section showed a screenful of
 * drifting cubes and no words. The cubes are an accent, not a gate: an element
 * fades in shortly after it enters the viewport regardless of what the renderer
 * is doing, and the cubes continue their flight underneath.
 */

/** Stagger is capped hard — no element waits long enough to look broken. */
const MAX_DELAY = 260;

type Entry = { reveal: () => void };
const watched = new Map<Element, Entry>();


let observer: IntersectionObserver | null = null;
let sweepTimer: number | null = null;

/**
 * Reveals straight away. The stagger lives in CSS transition-delay instead of a
 * setTimeout, because a busy requestAnimationFrame loop can starve JS timers on
 * weak hardware — and copy must never wait on the renderer's frame budget.
 */
function armed(_el: Element, watch: Entry): void {
  watch.reveal();
}

/**
 * Backstop for cases IntersectionObserver handles poorly: a jump-scroll that
 * skips an element entirely, or callbacks coalesced under heavy load.
 * Self-terminating once everything has been revealed.
 */
function startSweep(): void {
  if (sweepTimer !== null || typeof window === "undefined") return;
  sweepTimer = window.setInterval(() => {
    if (watched.size === 0) {
      window.clearInterval(sweepTimer!);
      sweepTimer = null;
      return;
    }
    const h = window.innerHeight;
    for (const [el, watch] of [...watched]) {
      if (el.getBoundingClientRect().top < h) armed(el, watch);
    }
  }, 250);
}

function getObserver(): IntersectionObserver | null {
  if (typeof IntersectionObserver === "undefined") return null;
  if (observer) return observer;
  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        const watch = watched.get(entry.target);
        if (!watch) continue;
        if (entry.isIntersecting) armed(entry.target, watch);
        else if (entry.boundingClientRect.bottom <= 0) watch.reveal(); // scrolled past
      }
    },
    // Start a little before the element is on screen so it is already legible
    // by the time the reader reaches it.
    { rootMargin: "120px 0px 0px 0px", threshold: 0 },
  );
  return observer;
}

type Props = {
  children: ReactNode;
  /** "text" spells the element out in cubes; "box" traces it; "fill" packs it. */
  mode?: RevealMode;
  delay?: number;
  as?: ElementType;
  className?: string;
  id?: string;
};

/**
 * Wraps real HTML — the content is always in the DOM for search engines and
 * screen readers, and always becomes visible whatever the renderer does.
 */
export default function Reveal({ children, mode = "box", delay = 0, as: Tag = "div", className = "", id }: Props) {
  const ref = useRef<HTMLElement>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const reveal = () => setRevealed(true);
    const entry: Entry = { reveal };
    watched.set(el, entry);

    const io = getObserver();
    io?.observe(el);
    startSweep();

    // The cubes run purely for the visual; they no longer control visibility.
    const unregister = registerReveal(el, mode, delay, () => {});

    return () => {
      unregister();
      watched.delete(el);
      io?.unobserve(el);
    };
  }, [mode, delay]);

  return (
    <Tag
      ref={ref}
      id={id}
      className={`cube-reveal${revealed ? " is-assembled" : ""} ${className}`}
      style={{ transitionDelay: `${Math.min(delay, MAX_DELAY)}ms` }}
    >
      {children}
    </Tag>
  );
}
