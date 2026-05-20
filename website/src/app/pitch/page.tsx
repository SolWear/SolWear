"use client";

import { useEffect, useMemo, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

const PDF_URL = "/pitch/solwear-pitch.pdf";
const PPTX_URL = "/pitch/solwear-pitch.pptx";
const PPTX_VIEWER = `https://view.officeapps.live.com/op/embed.aspx?src=https://solwear.tech/pitch/solwear-pitch.pptx`;
const SLIDE_COUNT = 13;
const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

type DeckTab = "pdf" | "pptx";

function youtubeEmbedUrl(url: string): string | null {
  if (!url?.trim()) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be") id = parsed.pathname.slice(1);
    if (host === "youtube.com" || host === "m.youtube.com") {
      if (parsed.pathname.startsWith("/watch")) id = parsed.searchParams.get("v") ?? "";
      if (parsed.pathname.startsWith("/shorts/") || parsed.pathname.startsWith("/embed/")) {
        id = parsed.pathname.split("/").filter(Boolean)[1] ?? "";
      }
    }
    return id ? `https://www.youtube-nocookie.com/embed/${id}` : null;
  } catch {
    return null;
  }
}

export default function PitchPage() {
  const [page, setPage] = useState(1);
  const [deckTab, setDeckTab] = useState<DeckTab>("pdf");
  const [pitchVideoUrl, setPitchVideoUrl] = useState("");
  const pdfSrc = useMemo(() => `${PDF_URL}#page=${page}&view=FitH`, [page]);
  const embed = youtubeEmbedUrl(pitchVideoUrl);

  useEffect(() => {
    if (!dynamicEnabled) return;
    fetch("/api/site-content/")
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        const url = data?.content?.hero?.pitchVideo?.youtubeUrl;
        if (url) setPitchVideoUrl(url);
      })
      .catch(() => {});
  }, []);

  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 pb-20 pt-28">
        <section className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <h1 className="text-4xl font-semibold md:text-6xl">SolWear pitch</h1>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">
                Browse the deck inline, download the PDF, or open the original PowerPoint file.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={PDF_URL}
                download="solwear-pitch.pdf"
                className="focus-ring inline-flex min-h-11 items-center rounded-full bg-white px-5 text-sm font-semibold text-black"
              >
                Download PDF
              </a>
              <a
                href={PPTX_URL}
                download="solwear-pitch.pptx"
                className="focus-ring inline-flex min-h-11 items-center rounded-full border border-white/15 px-5 text-sm text-white/75"
              >
                Download PPTX
              </a>
            </div>
          </div>

          {embed && (
            <div className="mb-8 overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-2xl shadow-black/30">
              <div className="border-b border-white/10 px-5 py-4">
                <p className="text-sm font-medium text-white/70">Pitch video</p>
              </div>
              <iframe
                src={embed}
                title="SolWear pitch video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="aspect-video w-full"
              />
            </div>
          )}

          <div className="overflow-hidden rounded-3xl border border-white/10 bg-black/50 shadow-2xl shadow-black/30">
            {/* Tab bar */}
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div className="flex gap-1">
                {(["pdf", "pptx"] as DeckTab[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDeckTab(t)}
                    className={`rounded-full px-4 py-1.5 text-xs font-medium transition ${
                      deckTab === t
                        ? "bg-white text-black"
                        : "text-white/50 hover:text-white"
                    }`}
                  >
                    {t === "pdf" ? "PDF viewer" : "Presentation (PPTX)"}
                  </button>
                ))}
              </div>

              {deckTab === "pdf" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/45">
                    Slide <span className="font-semibold text-white">{page}</span> of {SLIDE_COUNT}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="focus-ring min-h-9 rounded-full border border-white/15 px-3 text-sm text-white/70 disabled:opacity-35"
                  >
                    &#8592;
                  </button>
                  <button
                    type="button"
                    onClick={() => setPage((p) => Math.min(SLIDE_COUNT, p + 1))}
                    disabled={page === SLIDE_COUNT}
                    className="focus-ring min-h-9 rounded-full border border-white/15 px-3 text-sm text-white/70 disabled:opacity-35"
                  >
                    &#8594;
                  </button>
                </div>
              )}
            </div>

            {deckTab === "pdf" ? (
              <iframe
                key={pdfSrc}
                src={pdfSrc}
                title="SolWear pitch deck"
                className="h-[72vh] w-full bg-white"
              />
            ) : (
              <iframe
                src={PPTX_VIEWER}
                title="SolWear pitch presentation"
                className="h-[72vh] w-full"
                allowFullScreen
              />
            )}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
