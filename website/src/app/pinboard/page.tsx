"use client";

import { FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

type Idea = {
  id: number;
  username: string;
  idea: string;
  status: string;
  created_at: string;
  votes: number;
  userVoted: boolean;
};

type User = {
  id: string;
  username: string;
  followsSolWear: boolean;
  isAdmin: boolean;
};

type Quota = {
  submitted: number;
  remaining: number;
};

type PinboardResponse = {
  user: User | null;
  ideas: Idea[];
  quota?: Quota;
  csrfToken?: string | null;
  maxIdeasPerAccount?: number;
};

type Tab = "ideas" | "made";

const dynamicEnabled = process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";

export default function PinboardPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [quota, setQuota] = useState<Quota>({ submitted: 0, remaining: 0 });
  const [maxIdeas, setMaxIdeas] = useState(1);
  const [authBanner, setAuthBanner] = useState<string | null>(null);
  const bannerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [csrfToken, setCsrfToken] = useState<string | null>(null);
  const [idea, setIdea] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [tab, setTab] = useState<Tab>("ideas");
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 50;

  const boardIdeas = ideas.length ? ideas : (dynamicEnabled ? [] : previewIdeas);
  const canPost = dynamicEnabled && !!user && user.followsSolWear && quota.remaining > 0;
  const boardTitle = useMemo(() => {
    if (!dynamicEnabled) return "Preview board";
    if (!user) return "Sign in to pin";
    if (!user.followsSolWear) return "Follow SolWear first";
    if (quota.remaining <= 0) return "Idea limit reached";
    return `${quota.remaining}/${maxIdeas} pins left`;
  }, [maxIdeas, quota.remaining, user]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const auth = params.get("auth");
    if (auth === "ok") setAuthBanner("Signed in - you can now pin your idea.");
    else if (auth === "follow") setAuthBanner("Signed in - follow @SolWear_ to unlock pinning.");
    else if (auth === "failed") {
      const reason = params.get("reason");
      setAuthBanner(`Sign in failed${reason ? ` (${reason})` : ""} - please try again.`);
    }

    if (auth) {
      const timer = setTimeout(() => setAuthBanner(null), 5000);
      bannerTimerRef.current = timer;
      const url = new URL(window.location.href);
      url.searchParams.delete("auth");
      url.searchParams.delete("reason");
      window.history.replaceState({}, "", url.toString());
    }
    return () => {
      if (bannerTimerRef.current) clearTimeout(bannerTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!dynamicEnabled) return;
    setIdeas([]);
    setOffset(0);
    setHasMore(false);
    loadIdeas(0, tab, true);
  }, [tab]);

  async function loadIdeas(fromOffset: number, currentTab: Tab, replace: boolean) {
    try {
      const params = new URLSearchParams({ offset: String(fromOffset) });
      if (currentTab === "made") params.set("tab", "made");
      const res = await fetch(`/api/pinboard/?${params}`);
      const data = (await res.json()) as PinboardResponse;
      const incoming = data.ideas || [];
      if (replace) {
        setIdeas(incoming);
      } else {
        setIdeas((prev) => [...prev, ...incoming]);
      }
      setUser(data.user || null);
      setQuota(data.quota || { submitted: 0, remaining: 0 });
      setCsrfToken(data.csrfToken || null);
      setMaxIdeas(data.maxIdeasPerAccount || 1);
      setHasMore(incoming.length === PAGE_SIZE);
      setOffset(fromOffset + incoming.length);
    } catch {
      setStatus("Pinboard API is offline.");
    }
  }

  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    await loadIdeas(offset, tab, false);
    setLoadingMore(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingMore, hasMore, offset, tab]);

  // Infinite scroll via IntersectionObserver on sentinel div
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) loadMore(); },
      { rootMargin: "200px" }
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [loadMore]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!dynamicEnabled) {
      setStatus("The live pinboard opens on the Docker/VPS deployment.");
      return;
    }
    if (!csrfToken) {
      setStatus("Refresh the page before posting.");
      return;
    }
    setPending(true);
    setStatus(null);
    try {
      const res = await fetch("/api/pinboard/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ idea }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not submit idea");
      setIdea("");
      setQuota(data.quota || quota);
      setStatus(data.status === "approved" ? "Pinned." : "Submitted for review.");
      setComposerOpen(false);
      setIdeas([]);
      setOffset(0);
      loadIdeas(0, tab, true);
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Could not submit idea");
    } finally {
      setPending(false);
    }
  }

  async function adminSetStatus(id: number, newStatus: string) {
    try {
      await fetch("/api/admin/pinboard/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: newStatus }),
      });
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, status: newStatus } : i))
      );
    } catch {
      setStatus("Action failed.");
    }
  }

  async function adminDelete(id: number) {
    try {
      await fetch("/api/admin/pinboard/", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      setIdeas((prev) => prev.filter((i) => i.id !== id));
    } catch {
      setStatus("Delete failed.");
    }
  }

  async function toggleVote(id: number) {
    if (!user || !csrfToken) return;
    try {
      const res = await fetch("/api/pinboard/vote/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-csrf-token": csrfToken,
        },
        body: JSON.stringify({ idea_id: id }),
      });
      const data = await res.json();
      if (res.ok) {
        setIdeas((prev) =>
          prev.map((i) =>
            i.id === id ? { ...i, votes: data.votes, userVoted: data.userVoted } : i
          )
        );
      }
    } catch {
      // silent
    }
  }

  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 pb-24 pt-28">
        {authBanner && (
          <div className="fixed left-1/2 top-20 z-50 -translate-x-1/2 border border-white/20 bg-black/90 px-5 py-3 text-sm text-white shadow-2xl backdrop-blur-sm">
            <span>{authBanner}</span>
            <button
              type="button"
              onClick={() => setAuthBanner(null)}
              className="ml-4 text-white/50 hover:text-white"
              aria-label="Dismiss"
            >
              x
            </button>
          </div>
        )}
        <section className="mx-auto max-w-7xl">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h1 className="text-4xl font-bold md:text-6xl">SolWear community</h1>
              <p className="mt-5 max-w-2xl text-sm leading-7 text-white/58">
                A live board for follower ideas. Sign in with X, follow @SolWear_, then pin your idea.
              </p>
            </div>
            <div className="text-sm text-white/58 md:text-right">
              {user ? (
                <>
                  <p className="font-semibold text-white">{boardTitle}</p>
                  <p className="mt-1">@{user.username}</p>
                </>
              ) : dynamicEnabled ? (
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href="/api/auth/x1/start/?returnTo=/pinboard/"
                    className="focus-ring inline-flex min-h-11 items-center justify-center bg-white px-5 py-3 text-sm font-semibold text-black"
                  >
                    Sign in with X
                  </a>
                  <button
                    type="button"
                    onClick={connectWallet}
                    className="focus-ring inline-flex min-h-11 items-center justify-center border border-white/20 px-5 py-3 text-sm font-semibold text-white/80 transition hover:border-white/40 hover:text-white"
                  >
                    Connect Wallet
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {dynamicEnabled && (
            <div className="mt-8 flex gap-1 border-b border-white/10">
              {(["ideas", "made"] as Tab[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTab(t)}
                  className={`px-5 py-2 text-sm font-medium capitalize transition ${
                    tab === t
                      ? "border-b-2 border-white text-white"
                      : "text-white/45 hover:text-white/75"
                  }`}
                >
                  {t === "ideas" ? "Ideas" : "Made"}
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 min-h-[520px] border border-white/10 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] p-4 md:p-8">
            {boardIdeas.length === 0 && dynamicEnabled ? (
              <p className="text-sm text-white/40">No ideas yet.</p>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {boardIdeas.map((item, index) => (
                  <article
                    key={item.id}
                    className="relative min-h-40 border border-white/10 bg-white p-5 text-black shadow-[0_18px_40px_rgba(0,0,0,0.28)]"
                    style={{ transform: `rotate(${[-1.2, 0.8, -0.4, 1.1, -0.8][index % 5]}deg)` }}
                  >
                    {user?.isAdmin && (
                      <div className="mb-3 flex flex-wrap gap-1">
                        {["approved", "pending", "rejected", "made"].map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => adminSetStatus(item.id, s)}
                            className={`rounded px-2 py-0.5 text-[10px] font-semibold capitalize transition ${
                              item.status === s
                                ? "bg-black text-white"
                                : "bg-black/10 text-black/60 hover:bg-black/20"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                        <button
                          type="button"
                          onClick={() => adminDelete(item.id)}
                          className="rounded bg-red-500 px-2 py-0.5 text-[10px] font-semibold text-white hover:bg-red-600"
                        >
                          delete
                        </button>
                      </div>
                    )}
                    <div className="mb-4 h-2 w-2 rounded-full bg-solwear-red shadow-[0_0_0_5px_rgba(224,0,15,0.12)]" />
                    <p className="text-sm leading-6">{item.idea}</p>
                    <div className="mt-5 flex items-center justify-between">
                      <p className="text-xs text-black/45">@{item.username}</p>
                      {dynamicEnabled && (
                        <button
                          type="button"
                          onClick={() => toggleVote(item.id)}
                          disabled={!user}
                          className={`flex items-center gap-1 text-xs transition ${
                            item.userVoted
                              ? "text-black font-semibold"
                              : "text-black/40 hover:text-black/70"
                          } disabled:cursor-default`}
                          title={user ? (item.userVoted ? "Remove vote" : "Vote") : "Sign in to vote"}
                        >
                          <span>{item.userVoted ? "+" : "+"}</span>
                          <span>{item.votes ?? 0}</span>
                        </button>
                      )}
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>

          {/* Infinite scroll sentinel */}
          <div ref={sentinelRef} className="mt-4 flex justify-center py-4">
            {loadingMore && <span className="text-xs text-white/30">Loading…</span>}
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            {dynamicEnabled ? (
              user ? (
                <form action="/api/auth/logout/" method="post">
                  <button className="focus-ring min-h-11 border border-white/20 px-5 py-3 text-sm text-white/70" type="submit">
                    Sign out
                  </button>
                </form>
              ) : null
            ) : (
              <a className="focus-ring inline-flex min-h-11 items-center border border-white/20 px-5 py-3 text-sm text-white/80" href="https://x.com/SolWear_" target="_blank" rel="noreferrer">
                Follow @SolWear_
              </a>
            )}
            {status && <p className="text-sm text-white/60">{status}</p>}
          </div>
        </section>

        <button
          type="button"
          onClick={() => {
            setStatus(null);
            setComposerOpen(true);
          }}
          disabled={dynamicEnabled && !canPost}
          className="focus-ring fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-white text-3xl leading-none text-black shadow-[0_18px_40px_rgba(0,0,0,0.35)] disabled:cursor-not-allowed disabled:opacity-45"
          aria-label="Add idea"
          title={dynamicEnabled && !canPost ? boardTitle : "Add idea"}
        >
          +
        </button>

        {composerOpen && (
          <div className="fixed inset-0 z-[60] flex items-end bg-black/72 px-4 py-5 backdrop-blur-sm md:items-center md:justify-center">
            <form onSubmit={submit} className="w-full max-w-lg border border-white/10 bg-[#0b0b0b] p-5 shadow-2xl">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="label-caps mb-1">new pin</p>
                  <h2 className="text-2xl font-semibold">Add an idea</h2>
                </div>
                <button type="button" onClick={() => setComposerOpen(false)} className="focus-ring min-h-10 px-3 text-sm text-white/60">
                  Close
                </button>
              </div>

              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                minLength={6}
                maxLength={240}
                required
                className="mt-5 min-h-36 w-full border border-white/15 bg-black p-3 text-sm text-white outline-none focus:border-white/45"
                placeholder="A wallet clockface that..."
              />
              <div className="mt-2 flex items-center justify-between text-xs text-white/40">
                <span>{quota.remaining}/{maxIdeas} pins left</span>
                <span>{idea.length}/240</span>
              </div>
              <button
                type="submit"
                disabled={pending || !canPost}
                className="focus-ring mt-5 min-h-11 w-full bg-white px-5 py-3 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
              >
                {pending ? "Submitting..." : "Pin idea"}
              </button>
            </form>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function connectWallet() {
  const w = window as unknown as { solana?: { isPhantom?: boolean; connect: () => Promise<{ publicKey: { toString: () => string } }> } };
  if (!w.solana?.isPhantom) {
    alert("Phantom wallet not found. Please install it from phantom.app");
    return;
  }
  w.solana.connect().then(async (resp) => {
    const publicKey = resp.publicKey.toString();
    const challengeRes = await fetch("/api/auth/wallet/challenge/", { method: "POST" });
    const { nonce } = await challengeRes.json();
    const encoded = new TextEncoder().encode(nonce);
    const signed = await (w.solana as unknown as { signMessage: (msg: Uint8Array, enc: string) => Promise<{ signature: Uint8Array }> }).signMessage(encoded, "utf8");
    const signature = Array.from(signed.signature);
    await fetch("/api/auth/wallet/verify/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ publicKey, signature, nonce }),
    });
    window.location.reload();
  }).catch(() => {});
}

const previewIdeas: Idea[] = [
  {
    id: 1,
    username: "SolWear_",
    idea: "Make the NFC sync effect feel like a tiny unlock ritual across phone and watch.",
    created_at: "2026-05-01T00:00:00.000Z",
    status: "approved",
    votes: 0,
    userVoted: false,
  },
  {
    id: 2,
    username: "SolWear_",
    idea: "Add a wallet clockface that shows balance, NFC armed state, and last sync.",
    created_at: "2026-05-01T00:00:00.000Z",
    status: "approved",
    votes: 0,
    userVoted: false,
  },
  {
    id: 3,
    username: "SolWear_",
    idea: "Let the watch show a tiny receipt card after every successful NFC wallet sync.",
    created_at: "2026-05-01T00:00:00.000Z",
    status: "approved",
    votes: 0,
    userVoted: false,
  },
];
