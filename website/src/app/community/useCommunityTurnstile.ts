"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  reset: (widgetId?: string) => void;
};

type Config = { turnstileSiteKey: string; turnstileRequired: boolean };

let configPromise: Promise<Config> | null = null;
function loadConfig(): Promise<Config> {
  if (!configPromise) {
    configPromise = fetch("/api/config/")
      .then((response) => response.ok ? response.json() : { turnstileSiteKey: "", turnstileRequired: false })
      .catch(() => ({ turnstileSiteKey: "", turnstileRequired: false }));
  }
  return configPromise;
}

let scriptPromise: Promise<TurnstileApi | null> | null = null;
function loadScript(): Promise<TurnstileApi | null> {
  if (scriptPromise) return scriptPromise;
  scriptPromise = new Promise((resolve) => {
    const browser = window as unknown as { turnstile?: TurnstileApi };
    if (browser.turnstile) return resolve(browser.turnstile);

    const pollForApi = () => {
      const poll = window.setInterval(() => {
        if (browser.turnstile) {
          window.clearInterval(poll);
          resolve(browser.turnstile);
        }
      }, 60);
      window.setTimeout(() => {
        window.clearInterval(poll);
        resolve(browser.turnstile ?? null);
      }, 10000);
    };

    const existing = document.getElementById("cf-turnstile-script");
    if (existing) return pollForApi();
    const script = document.createElement("script");
    script.id = "cf-turnstile-script";
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    script.async = true;
    script.onload = pollForApi;
    script.onerror = () => resolve(null);
    document.head.appendChild(script);
  });
  return scriptPromise;
}

export function useCommunityTurnstile() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);
  const [config, setConfig] = useState<Config | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const tokenRef = useRef("");
  const widgetIdRef = useRef<string | null>(null);
  const apiRef = useRef<TurnstileApi | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadConfig().then((value) => { if (!cancelled) setConfig(value); });
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!container || !config?.turnstileSiteKey || widgetIdRef.current) return;
    let cancelled = false;
    loadScript().then((api) => {
      if (cancelled) return;
      if (!api) return setUnavailable(true);
      apiRef.current = api;
      widgetIdRef.current = api.render(container, {
        sitekey: config.turnstileSiteKey,
        theme: "dark",
        callback: (token: string) => { tokenRef.current = token; },
        "expired-callback": () => { tokenRef.current = ""; },
        "error-callback": () => { tokenRef.current = ""; },
      });
    });
    return () => { cancelled = true; };
  }, [config, container]);

  const containerRef = useCallback((element: HTMLDivElement | null) => setContainer(element), []);
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
