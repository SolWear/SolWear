import type { ReactNode } from "react";
import Reveal from "@/components/cubes/Reveal";
import StatusTag from "@/components/ui/StatusTag";
import type { Status } from "@/lib/siteContent";

/**
 * The one card in the system: a hairline, a title, a line of copy, and an
 * optional honesty tag. Nothing floats, nothing glows.
 */
export default function Card({
  title,
  text,
  status,
  index,
  delay = 0,
  children,
}: {
  title: string;
  text: string;
  status?: Status;
  index?: string;
  delay?: number;
  children?: ReactNode;
}) {
  return (
    <Reveal mode="box" as="article" delay={delay} className="accent-card rule flex flex-col gap-3 pt-5">
      <div className="flex items-start justify-between gap-4">
        {index ? <span className="t-label">{index}</span> : null}
        {status ? <StatusTag status={status} /> : null}
      </div>
      <h3 className="t-h3">{title}</h3>
      <p className="t-body">{text}</p>
      {children}
    </Reveal>
  );
}
