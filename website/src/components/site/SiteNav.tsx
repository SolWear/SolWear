"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Wordmark from "@/components/ui/Wordmark";

const LINKS = [
  { label: "PRODUCT", href: "/product/" },
  { label: "SDK", href: "/sdk/" },
  { label: "ECOSYSTEM", href: "/ecosystem/" },
  { label: "COMMUNITY", href: "/community/" },
];

export default function SiteNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Trap the page behind the mobile sheet without losing scroll position.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const isActive = (href: string) =>
    pathname === href || pathname === href.slice(0, -1) || pathname.startsWith(href);

  return (
    <header
      className={`site-nav fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? "border-b border-line bg-ground/85 backdrop-blur-xl" : "border-b border-transparent"
      }`}
    >
      <nav aria-label="Primary" className="shell flex h-16 items-center justify-between md:h-[4.5rem]">
        <Link href="/" className="focus-ring -m-2 p-2" aria-label="SolWear — home">
          <Wordmark size={20} />
        </Link>

        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-9 md:flex">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? "page" : undefined}
                className={`focus-ring t-label transition-colors hover:text-ink ${
                  isActive(link.href) ? "text-ink" : ""
                }`}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <Link href="/#waitlist" className="btn btn-primary hidden h-10 min-h-0 md:inline-flex">
            JOIN WAITLIST
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? "Close menu" : "Open menu"}
            className="focus-ring flex h-10 w-10 flex-col items-center justify-center gap-[5px] border border-line md:hidden"
          >
            <span className={`h-px w-4 bg-ink transition-transform ${open ? "translate-y-[3px] rotate-45" : ""}`} />
            <span className={`h-px w-4 bg-ink transition-transform ${open ? "-translate-y-[3px] -rotate-45" : ""}`} />
          </button>
        </div>
      </nav>

      <div
        id="mobile-nav"
        hidden={!open}
        className="border-t border-line bg-ground/95 backdrop-blur-xl md:hidden"
      >
        <ul className="shell flex flex-col py-2">
          {LINKS.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="focus-ring t-label block py-4 text-ink">
                {link.label}
              </Link>
            </li>
          ))}
          <li className="py-4">
            <Link href="/#waitlist" className="btn btn-primary w-full">
              JOIN WAITLIST
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}
