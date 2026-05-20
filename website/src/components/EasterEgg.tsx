"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SECRET = "solwear";

export default function EasterEgg() {
  const [show, setShow] = useState(false);
  const [buf, setBuf] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key.length !== 1) return;
      setBuf((prev) => {
        const next = (prev + e.key.toLowerCase()).slice(-SECRET.length);
        if (next === SECRET) {
          setShow(true);
          setTimeout(() => setShow(false), 2800);
        }
        return next;
      });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (!show) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[9998] flex items-center justify-center">
      <div className="animate-easter-egg flex flex-col items-center gap-4 rounded-3xl border border-white/15 bg-black/90 px-10 py-8 text-center shadow-2xl backdrop-blur-xl">
        <Image src="/solwear-logo-white.webp" alt="SolWear" width={40} height={40} />
        <p className="text-2xl">🫡</p>
        <p className="text-sm font-semibold text-white">You found it.</p>
        <p className="text-xs text-white/40">Welcome to the inner circle.</p>
      </div>
    </div>
  );
}
