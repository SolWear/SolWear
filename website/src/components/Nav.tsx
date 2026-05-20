"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";

type NavLink = { label: string; href: string };

const exploreLinks: NavLink[] = [
  { label: "Overview", href: "/#product" },
  { label: "Problem", href: "/#problem" },
  { label: "Roadmap", href: "/#roadmap" },
  { label: "Waitlist", href: "/#waitlist" },
];

const topLinks: NavLink[] = [
  { label: "Product", href: "/product/" },
  { label: "Pitch", href: "/pitch/" },
  { label: "Achievements", href: "/achievements/" },
];

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

export default function Nav() {
  const [visible, setVisible] = useState(true);
  const [menuOpen, setMenuOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const lastY = useRef(0);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const exploreButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setVisible(y < 60 || y < lastY.current);
      lastY.current = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target as Node) &&
        exploreButtonRef.current && !exploreButtonRef.current.contains(e.target as Node)
      ) {
        setExploreOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const navigate = (href: string) => {
    setMenuOpen(false);
    setExploreOpen(false);
    setMobileExploreOpen(false);
    window.location.href = href;
  };

  return (
    <nav
      className={`fixed left-0 right-0 top-0 z-50 border-b border-white/10 bg-black/62 backdrop-blur-xl transition-transform duration-300 motion-reduce:transition-none ${
        visible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center px-6">
        {/* Logo — always navigates to home */}
        <a
          href="/"
          className="focus-ring flex min-h-10 shrink-0 items-center gap-2 text-white transition hover:text-white/82"
          aria-label="SolWear home"
        >
          <Image src="/solwear-logo-white.webp" alt="SolWear" width={22} height={22} priority />
          <span className="text-sm font-semibold">SolWear</span>
        </a>

        {/* Center nav — absolute positioned to truly center on desktop */}
        <ul className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-6 lg:flex">
          {/* Explore dropdown */}
          <li className="relative">
            <button
              ref={exploreButtonRef}
              onClick={() => setExploreOpen((o) => !o)}
              onMouseEnter={() => setExploreOpen(true)}
              className="focus-ring flex min-h-10 items-center gap-1 text-sm font-medium text-white/58 transition hover:text-white"
            >
              Explore
              <svg
                className={`h-3.5 w-3.5 transition-transform duration-200 ${exploreOpen ? "rotate-180" : ""}`}
                viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8"
              >
                <path d="M2 4l4 4 4-4" />
              </svg>
            </button>

            {/* Animated dropdown */}
            <div
              ref={dropdownRef}
              onMouseLeave={() => setExploreOpen(false)}
              className={`absolute left-0 top-full mt-2 min-w-[180px] overflow-hidden rounded-2xl border border-white/10 bg-black/90 p-1.5 shadow-2xl shadow-black/50 backdrop-blur-xl transition-all duration-200 origin-top ${
                exploreOpen
                  ? "pointer-events-auto translate-y-0 scale-y-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-y-95 opacity-0"
              }`}
            >
              {exploreLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.href)}
                  className="focus-ring flex w-full items-center rounded-xl px-3.5 py-2.5 text-sm text-white/65 transition hover:bg-white/8 hover:text-white"
                >
                  {l.label}
                </button>
              ))}
            </div>
          </li>

          {topLinks.map((l) => (
            <li key={l.label}>
              <a
                href={l.href}
                className="focus-ring min-h-10 text-sm font-medium text-white/58 transition hover:text-white"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        {/* Right-side actions */}
        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {dynamicEnabled && (
            <a
              href="/api/auth/x1/start/?returnTo=/pinboard/"
              className="focus-ring inline-flex min-h-10 items-center gap-1.5 rounded-full border border-white/10 px-4 text-sm font-medium text-white/65 transition hover:border-white/25 hover:text-white"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
              </svg>
              Sign in
            </a>
          )}
          <a
            href="/pinboard/"
            className="focus-ring inline-flex min-h-10 items-center rounded-full border border-white/10 px-4 text-sm font-medium text-white/65 transition hover:border-white/25 hover:text-white"
          >
            Community
          </a>
          <a
            href="/#waitlist"
            className="focus-ring inline-flex min-h-10 items-center rounded-full bg-white px-5 text-sm font-semibold text-black transition hover:bg-white/90"
          >
            Join waitlist
          </a>
        </div>

        {/* Hamburger */}
        <button
          className="focus-ring ml-auto flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-white/10 lg:hidden"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          <span className={`block h-px w-5 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`} />
          <span className={`block h-px w-5 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`block h-px w-5 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`} />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="flex flex-col gap-1 border-t border-white/10 px-4 py-3 lg:hidden">
          <button
            onClick={() => setMobileExploreOpen((o) => !o)}
            className="focus-ring flex min-h-10 items-center justify-between rounded-xl px-2 text-sm font-medium text-white/70 transition hover:text-white"
          >
            Explore
            <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${mobileExploreOpen ? "rotate-180" : ""}`} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M2 4l4 4 4-4" />
            </svg>
          </button>
          {mobileExploreOpen && (
            <div className="ml-3 flex flex-col gap-0.5 border-l border-white/10 pl-3">
              {exploreLinks.map((l) => (
                <button
                  key={l.label}
                  onClick={() => navigate(l.href)}
                  className="focus-ring min-h-9 text-left text-sm text-white/55 transition hover:text-white"
                >
                  {l.label}
                </button>
              ))}
            </div>
          )}
          {topLinks.map((l) => (
            <a key={l.label} href={l.href} className="focus-ring min-h-10 rounded-xl px-2 text-sm font-medium text-white/70 transition hover:text-white">
              {l.label}
            </a>
          ))}
          <a href="/pinboard/" className="focus-ring min-h-10 rounded-xl px-2 text-sm font-medium text-white/70 transition hover:text-white">
            Community
          </a>
          {dynamicEnabled && (
            <a href="/api/auth/x1/start/?returnTo=/pinboard/" className="focus-ring min-h-10 rounded-xl px-2 text-sm font-medium text-white/70 transition hover:text-white">
              Sign in with X
            </a>
          )}
          <a href="/#waitlist" className="focus-ring min-h-10 rounded-xl px-2 text-sm font-medium text-white/70 transition hover:text-white">
            Join waitlist
          </a>
        </div>
      )}
    </nav>
  );
}
