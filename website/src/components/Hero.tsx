"use client";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import Image from "next/image";
import RedDot from "./ui/RedDot";

export default function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, 80]);

  const words = ["CRYPTO WALLETS", "DIGITAL ASSETS", "OWNERSHIP", "SELF-CUSTODY"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, 2500);
    return () => clearInterval(timer);
  }, [words.length]);

  return (
    <section
      id="watch"
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0d0d0d 0%, #111 50%, #0a0a0a 100%)" }}
    >
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 pt-24 pb-16 grid md:grid-cols-2 gap-12 items-center w-full">
        {/* Text */}
        <div className="z-10">
          <motion.div
            className="flex items-center gap-3 mb-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <RedDot size={8} />
            <span className="label-caps">Frontier Hackathon 2026</span>
          </motion.div>

          <motion.h1
            className="hero-text text-white mb-6 flex flex-col uppercase"
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: { transition: { staggerChildren: 0.12, delayChildren: 0.2 } },
            }}
          >
            <motion.span
              className="inline-block"
              variants={{
                hidden: { opacity: 0, y: 40, filter: "blur(8px)" },
                visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: [0.2, 0.8, 0.2, 1] } },
              }}
            >
              REIMAGINING
            </motion.span>
            <span className="relative block h-[1.2em] overflow-visible text-white/30 truncate">
              <AnimatePresence mode="popLayout">
                <motion.span
                  key={index}
                  className="absolute left-0"
                  initial={{ opacity: 0, y: 30, filter: "blur(8px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -30, filter: "blur(8px)" }}
                  transition={{ duration: 0.6, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  {words[index]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          <motion.p
            className="text-white/50 text-lg leading-relaxed mb-10 max-w-md"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
          >
            Your Solana wallet. Your wrist. Always with you.
          </motion.p>

          <motion.div
            className="flex items-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
          >
            <button
              onClick={() => document.querySelector("#purchase")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3 bg-white text-black text-sm font-semibold tracking-wider hover:bg-white/90 transition-colors"
            >
              GET NOTIFIED
            </button>
            <button
              onClick={() => document.querySelector("#explore")?.scrollIntoView({ behavior: "smooth" })}
              className="px-7 py-3 border border-white/20 text-white/70 text-sm font-semibold tracking-wider hover:border-white/40 hover:text-white transition-all"
            >
              LEARN MORE
            </button>
          </motion.div>
        </div>

        {/* Watch image */}
        <motion.div
          className="relative flex justify-center md:justify-end"
          style={{ y }}
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, delay: 0.3, ease: "easeOut" }}
        >
          <div className="relative animate-float">
            <Image
              src="/sticker.webp?v=1"
              alt="SolWear Watches"
              width={420}
              height={500}
              className="relative z-10 drop-shadow-2xl object-contain"
              priority
            />
            {/* Red dot on watch face */}
            <div className="absolute top-[22%] right-[22%] z-20">
              <RedDot size={12} />
            </div>
            {/* Glow */}
            <div className="absolute inset-0 rounded-full blur-[80px] opacity-10 bg-[#e0000f] scale-75" />
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-scroll">
        <span className="label-caps">scroll</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-white/40">
          <path d="M7 1 L7 13 M2 8 L7 13 L12 8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </section>
  );
}
