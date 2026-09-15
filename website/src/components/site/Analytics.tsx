"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

/**
 * First-party pageview beacon. No cookies, no third party — the server derives
 * a daily-rotating visitor hash from IP + user agent and stores nothing else.
 */
export default function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    if (lastPath.current === pathname) return;
    lastPath.current = pathname;

    const params = new URLSearchParams(window.location.search);
    const source =
      params.get("utm_source") ??
      params.get("ref") ??
      (document.referrer && !document.referrer.includes(window.location.host)
        ? new URL(document.referrer).hostname
        : null);

    const body = JSON.stringify({ event: "pageview", path: pathname, source, referrer: document.referrer || null });
    // Beacon so a fast navigation away still records the view.
    if (navigator.sendBeacon) {
      navigator.sendBeacon("/api/analytics/", new Blob([body], { type: "application/json" }));
    } else {
      fetch("/api/analytics/", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true }).catch(
        () => {},
      );
    }
  }, [pathname]);

  return null;
}

/** Fire-and-forget conversion event. */
export function trackEvent(event: string, path: string): void {
  const body = JSON.stringify({ event, path });
  if (typeof navigator !== "undefined" && navigator.sendBeacon) {
    navigator.sendBeacon("/api/analytics/", new Blob([body], { type: "application/json" }));
  }
}
