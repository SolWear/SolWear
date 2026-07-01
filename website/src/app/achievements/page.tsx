"use client";

import { useEffect, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Achievement = {
  id: number;
  title: string;
  event_name: string;
  description: string;
  date: string;
  place: string;
  image_url: string | null;
};

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

const staticAchievements: Achievement[] = [
  {
    id: 1,
    title: "1st place - Dev3pak Hackathon",
    event_name: "Dev3pak",
    description:
      "SolWear won first place at the Dev3pak hackathon, demonstrating the wearable Solana signer prototype with NFC-based transaction approval.",
    date: "2026-04-01",
    place: "1st",
    image_url: null,
  },
];

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>(staticAchievements);

  useEffect(() => {
    if (!dynamicEnabled) return;
    fetch("/api/achievements/")
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (Array.isArray(data?.achievements) && data.achievements.length > 0) {
          setAchievements(data.achievements);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 pb-24 pt-28">
        <section className="mx-auto max-w-7xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-white/45">achievements</p>
          <h1 className="text-4xl font-bold md:text-6xl">Awards &amp; recognition</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58">
            Hackathon wins and ecosystem milestones for the SolWear project.
          </p>

          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => (
              <article
                key={a.id}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-black/35 shadow-2xl shadow-black/20 backdrop-blur-sm transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
              >
                {a.image_url && (
                  <div className="h-48 overflow-hidden border-b border-white/10">
                    <img
                      src={a.image_url}
                      alt={a.title}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-300/15 text-lg font-bold text-emerald-300">
                      {a.place === "1st" ? "1" : a.place === "2nd" ? "2" : a.place === "3rd" ? "3" : a.place}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-widest text-emerald-300/70">
                      {a.place} place
                    </span>
                  </div>
                  <h2 className="text-lg font-semibold text-white">{a.title}</h2>
                  <p className="mt-1 text-xs font-medium text-white/45">{a.event_name}</p>
                  <p className="mt-4 text-sm leading-6 text-white/58">{a.description}</p>
                  <p className="mt-4 text-xs text-white/30">
                    {new Date(a.date).toLocaleDateString("en-US", { year: "numeric", month: "long" })}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
