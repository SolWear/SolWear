"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Wordmark from "@/components/ui/Wordmark";

const SESSION_KEY = "sw-intro-seen";
const LETTERS = "SOLWEAR".split("");
const PIXELS = Array.from({ length: 56 }, (_, index) => ({
  x: (index * 47 + 11) % 100,
  y: (index * 71 + 7) % 100,
  size: 2 + ((index * 5) % 4),
  delay: (index % 13) * 74,
  drift: ((index * 19) % 42) - 21,
}));

export default function LoadingScreen() {
  const [phase, setPhase] = useState<"loading" | "melting" | "done">("loading");

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      document.documentElement.classList.add("sw-intro-seen");
      setPhase("done");
      return;
    }

    sessionStorage.setItem(SESSION_KEY, "1");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const melt = window.setTimeout(() => setPhase("melting"), reducedMotion ? 350 : 2900);
    const done = window.setTimeout(() => {
      document.documentElement.classList.add("sw-intro-seen");
      setPhase("done");
      document.body.style.overflow = previousOverflow;
    }, reducedMotion ? 400 : 3600);

    return () => {
      window.clearTimeout(melt);
      window.clearTimeout(done);
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  if (phase === "done") return null;

  return (
    <div className={`loading-screen ${phase === "melting" ? "is-melting" : ""}`} aria-label="Loading SolWear">
      <div className="loading-pixels" aria-hidden="true">
        {PIXELS.map((pixel, index) => (
          <i
            key={index}
            style={
              {
                left: `${pixel.x}%`,
                top: `${pixel.y}%`,
                width: pixel.size,
                height: pixel.size,
                "--pixel-delay": `${pixel.delay}ms`,
                "--pixel-drift": `${pixel.drift}px`,
              } as CSSProperties
            }
          />
        ))}
      </div>
      <div className="loading-lockup" role="status">
        <Wordmark size={38} showText={false} className="loading-logo" />
        <span className="loading-type" aria-label="SOLWEAR">
          {LETTERS.map((letter, index) => (
            <span key={index} style={{ "--char-delay": `${500 + index * 115}ms` } as CSSProperties} aria-hidden="true">
              {letter}
            </span>
          ))}
          <i aria-hidden="true" />
        </span>
      </div>
    </div>
  );
}
