import type { ReactNode } from "react";
import Reveal from "@/components/cubes/Reveal";

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Reveal mode="box" as="p" className="t-label">
      {children}
    </Reveal>
  );
}

/** Headline that literally assembles out of cubes before the HTML fades in. */
export function SectionHeadline({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <Reveal mode="text" as="h2" delay={90} className={`t-h2 mt-5 max-w-4xl whitespace-pre-line ${className}`}>
      {children}
    </Reveal>
  );
}

export function SectionBody({ children }: { children: ReactNode }) {
  return (
    <Reveal mode="box" as="p" delay={160} className="t-body mt-6 max-w-2xl">
      {children}
    </Reveal>
  );
}

export function Section({
  id,
  children,
  className = "",
}: {
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={`accent-section section relative z-10 ${className}`}>
      <div className="shell">{children}</div>
    </section>
  );
}
