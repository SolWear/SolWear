"use client";

import { useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  reset: (id?: string) => void;
};

type Config = { turnstileSiteKey: string; turnstileRequired: boolean };

// One fetch and one script load, however many widgets are on the page.
let configPromise: Promise<Config> | null = null;
function loadConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = fetch("/api/config/")
      .then((r) => (r.ok ? r.json() : { turnstileSiteKey: "", turnstileRequired: false }))
      .catch(() => ({ turnstileSiteKey: "", turnstileRequired: false }));
  }
  return configPromise;
}

let scriptPromise: Promise<TurnstileApi | null> | null = null;
function loadScript(): Promise<TurnstileApi | null> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const w = window as unknown as { turnstile?: TurnstileApi };
    if (w.turnstile) return resolve(w.turnstile);

    const settle = () => {
      const poll = window.setInterval(() => {
        if (w.turnstile) {
          window.clearInterval(poll);
          resolve(w.turnstile);
        }
      }, 60);
      window.setTimeout(() => {
        window.clearInterval(poll);
        resolve(w.turnstile ?? null);
      }, 10000);
    };

    const existing = document.getElementById("cf-turnstile-script");
    if (existing) return settle();

    const s = document.createElement("script");
    s.id = "cf-turnstile-script";
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = settle;
    s.onerror = () => resolve(null);
    document.head.appendChild(s);
  });
  return scriptPromise;
}

export type Turnstile = {
  /** Attach to the element the widget should render into. */
  containerRef: React.RefObject<HTMLDivElement | null>;
  /** A verification token is needed before submitting. */
  required: boolean;
  /** Server wants Turnstile but no site key is configured — submissions would always fail. */
  misconfigured: boolean;
  /** Whether the widget could not be loaded (blocked, offline). */
  unavailable: boolean;
  getToken: () => string;
  reset: () => void;
};

/** Shared Turnstile widget wiring, used by every protected form. */
export function useTurnstile(): Turnstile {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const tokenRef = useRef("");
  const widgetIdRef = useRef<string | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => {
    let cancelled = false;

    loadConfig().then(async (cfg) => {
      if (cancelled) return;
      setConfig(cfg);
      if (!cfg.turnstileSiteKey) return;

      const api = await loadScript();
      if (cancelled) return;
      if (!api) {
        setUnavailable(true);
        return;
      }
      if (!containerRef.current || widgetIdRef.current) return;

      apiRef.current = api;
      widgetIdRef.current = api.render(containerRef.current, {
        sitekey: cfg.turnstileSiteKey,
        theme: "dark",
        callback: (token: string) => {
          tokenRef.current = token;
        },
        "expired-callback": () => {
          tokenRef.current = "";
        },
        "error-callback": () => {
          tokenRef.current = "";
        },
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    containerRef,
    required: Boolean(config?.turnstileRequired || config?.turnstileSiteKey),
    misconfigured: Boolean(config && config.turnstileRequired && !config.turnstileSiteKey),
    unavailable,
    getToken: () => tokenRef.current,
    reset: () => {
      tokenRef.current = "";
      apiRef.current?.reset(widgetIdRef.current ?? undefined);
    },
  };
}
