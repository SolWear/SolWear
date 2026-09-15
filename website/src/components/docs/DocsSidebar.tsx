"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DOC_NAV, href } from "@/lib/docs";

export default function DocsSidebar({ cleanRoot }: { cleanRoot: boolean }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Normalise trailing slashes so /docs and /docs/ both match the Overview.
  const norm = (p: string) => (p.length > 1 && p.endsWith("/") ? p.slice(0, -1) : p);
  const current = norm(pathname);
  const isActive = (slug: string) => norm(href(slug, cleanRoot)) === current;

  const activeTitle =
    DOC_NAV.flatMap((g) => g.items).find((i) => isActive(i.slug))?.title ?? "Documentation";

  return (
    <nav aria-label="Documentation" className="lg:sticky lg:top-[5.5rem] lg:self-start">
      {/* Mobile: a disclosure that names the current page and reveals the tree. */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="docs-tree"
        className="focus-ring t-label flex w-full items-center justify-between border border-line px-4 py-3 text-ink lg:hidden"
      >
        <span>{activeTitle}</span>
        <span aria-hidden className={`transition-transform ${open ? "rotate-180" : ""}`}>
          ▾
        </span>
      </button>

      <div id="docs-tree" hidden={open ? undefined : true} className="mt-2 lg:mt-0 lg:!block">
        <ul className="flex flex-col gap-8">
          {DOC_NAV.map((group) => (
            <li key={group.title}>
              <p className="t-label mb-3">{group.title}</p>
              <ul className="flex flex-col gap-px">
                {group.items.map((item) => {
                  const active = isActive(item.slug);
                  return (
                    <li key={item.slug}>
                      <Link
                        href={href(item.slug, cleanRoot)}
                        aria-current={active ? "page" : undefined}
                        onClick={() => setOpen(false)}
                        className={`focus-ring t-mono block border-l py-1.5 pl-3 transition-colors ${
                          active
                            ? "border-l-[var(--sw-red)] text-ink"
                            : "border-l-line text-ink-dim hover:border-l-[var(--sw-line-strong)] hover:text-ink"
                        }`}
                      >
                        {item.title}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
