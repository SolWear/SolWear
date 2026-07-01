"use client";

import { motion, useReducedMotion } from "framer-motion";

const steps = [
  "Watch exposes a Type 4 NDEF sync record",
  "Phone reads wallet data and fires the sync sheet",
  "Fallback mode lets the watch read phone HCE if target mode misses",
];

export default function NfcDemo() {
  const reduceMotion = useReducedMotion();

  return (
    <section id="nfc" className="border-y border-white/10 bg-white/[0.03] px-6 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[1fr_1.05fr] lg:items-center">
        <div>
          <p className="label-caps mb-3">nfc rescue</p>
          <h2 className="text-3xl font-bold text-white md:text-5xl">Phone meets watch. Both wake up.</h2>
          <p className="mt-5 max-w-xl text-sm leading-7 text-white/58">
            The demo path is dual-mode over the existing PN532 I2C wiring. Primary is phone-reader
            to watch-target. Fallback is watch-reader to phone-HCE. The visual sync effect is the
            first guaranteed success, wallet sync follows when the NDEF payload lands.
          </p>
          <div className="mt-8 space-y-3">
            {steps.map((step) => (
              <div key={step} className="flex items-center gap-3 text-sm text-white/72">
                <span className="h-2 w-2 bg-white" aria-hidden="true" />
                {step}
              </div>
            ))}
          </div>
        </div>

        <div className="relative min-h-[320px] overflow-hidden border border-white/10 bg-black p-8">
          <div className="absolute inset-0 opacity-[0.08] [background-image:linear-gradient(#fff_1px,transparent_1px),linear-gradient(90deg,#fff_1px,transparent_1px)] [background-size:32px_32px]" />
          <div className="relative flex h-[280px] items-center justify-center">
            <div className="h-40 w-24 border border-white/25 bg-white/[0.05] p-2">
              <div className="flex h-full flex-col justify-between border border-white/15 bg-black p-3">
                <span className="text-xs text-white/50">SOL</span>
                <span className="font-mono text-lg text-white">0.042</span>
                <span className="h-2 w-2 bg-solwear-red" />
              </div>
            </div>

            <motion.div
              className="mx-8 h-px w-28 bg-white/50"
              initial={reduceMotion ? false : { scaleX: 0.35, opacity: 0.35 }}
              animate={reduceMotion ? undefined : { scaleX: [0.35, 1, 0.35], opacity: [0.35, 1, 0.35] }}
              transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="h-48 w-28 rounded-[8px] border border-white/25 bg-white/[0.07] p-2">
              <div className="h-full rounded-[6px] border border-white/15 bg-black p-4">
                <span className="label-caps text-white/40">mobile</span>
                <div className="mt-16 h-10 border border-white/20 bg-white text-center text-xs font-semibold leading-10 text-black">
                  SYNC
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
