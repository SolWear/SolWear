"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Section } from "@/components/ui/Section";
import { useCommunityTurnstile } from "../useCommunityTurnstile";

const MAX_LENGTH = 240;

type Idea = { id: number; username: string; idea: string; status: string; votes: number; userVoted: boolean };
type User = { id: string; username: string; isAdmin: boolean };

export default function BoardClient() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [csrf, setCsrf] = useState<string | null>(null);
  const [remaining, setRemaining] = useState(0);
  const [idea, setIdea] = useState("");
  const [state, setState] = useState<"idle" | "pending">("idle");
  const [message, setMessage] = useState("");
  const [loaded, setLoaded] = useState(false);
  const turnstile = useCommunityTurnstile();

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/pinboard/?sort=top&limit=50", { cache: "no-store" });
      const data = await res.json();
      setIdeas(data.ideas ?? []);
      setUser(data.user ?? null);
      setCsrf(data.csrfToken ?? null);
      setRemaining(data.quota?.remaining ?? 0);
    } catch {
      setMessage("COULD NOT LOAD THE BOARD.");
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setMessage("");
    if (turnstile.required && !turnstile.getToken()) {
      setMessage(
        turnstile.unavailable
          ? "THE VERIFICATION WIDGET COULD NOT LOAD. DISABLE YOUR BLOCKER AND RELOAD."
          : "COMPLETE THE VERIFICATION CHECK FIRST.",
      );
      return;
    }
    setState("pending");
    try {
      const res = await fetch("/api/pinboard/", {
        method: "POST",
        headers: { "Content-Type": "application/json", ...(csrf ? { "x-csrf-token": csrf } : {}) },
        body: JSON.stringify({ idea, turnstile: turnstile.getToken() }),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; status?: string };
      if (!res.ok) {
        setMessage((data.error ?? "COULD NOT POST.").toUpperCase());
        turnstile.reset();
        return;
      }
      setIdea("");
      setMessage(data.status === "approved" ? "POSTED." : "POSTED — AWAITING REVIEW.");
      await load();
    } catch {
      setMessage("NETWORK ERROR. TRY AGAIN.");
    } finally {
      setState("idle");
    }
  }

  async function vote(id: number) {
    if (!user || !csrf) return;
    // Optimistic: the count reconciles from the server response.
    setIdeas((prev) =>
      prev.map((i) => (i.id === id ? { ...i, userVoted: !i.userVoted, votes: i.votes + (i.userVoted ? -1 : 1) } : i)),
    );
    try {
      const res = await fetch("/api/pinboard/vote/", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-csrf-token": csrf },
        body: JSON.stringify({ idea_id: id }),
      });
      const data = (await res.json()) as { votes?: number; userVoted?: boolean };
      if (typeof data.votes === "number") {
        setIdeas((prev) =>
          prev.map((i) => (i.id === id ? { ...i, votes: data.votes!, userVoted: Boolean(data.userVoted) } : i)),
        );
      }
    } catch {
      await load();
    }
  }

  return (
    <Section className="rule">
      <h1 className="t-h2">IDEA BOARD</h1>
      <p className="t-body mt-6 max-w-xl">
        WHAT SHOULD SOLWEAR DO? POST ONE IDEA, VOTE ON THE REST. THE TOP OF THIS BOARD SHAPES WHAT WE BUILD.
      </p>

      {user ? (
        remaining > 0 ? (
          <form onSubmit={submit} className="mt-10 max-w-2xl">
            <label htmlFor="idea" className="t-label">
              YOUR IDEA — ONE PER ACCOUNT
            </label>
            <textarea
              id="idea"
              required
              rows={3}
              maxLength={MAX_LENGTH}
              value={idea}
              onChange={(e) => setIdea(e.target.value)}
              placeholder="TAP TO PAY FOR COFFEE WITHOUT TOUCHING MY PHONE"
              className="field mt-3 resize-none py-3"
            />
            <p className="t-label mt-2">
              {idea.length} / {MAX_LENGTH}
            </p>
            <div ref={turnstile.containerRef} className="mt-4 empty:mt-0" />
            <button
              type="submit"
              disabled={state === "pending" || idea.trim().length < 6 || turnstile.misconfigured}
              className="btn btn-primary mt-4"
            >
              {state === "pending" ? "POSTING…" : "POST IDEA"}
            </button>
          </form>
        ) : (
          <p className="t-label mt-10">YOU'VE USED YOUR POST. VOTE ON THE REST.</p>
        )
      ) : (
        <a href="/community/" className="btn btn-ghost mt-10">
          SIGN IN TO POST
        </a>
      )}

      {message ? (
        <p role="status" className="t-label mt-4 text-ink">
          {message}
        </p>
      ) : null}

      <ul className="mt-14 border-t border-line">
        {ideas.map((item) => (
          <li key={item.id} className="flex items-start gap-5 border-b border-line py-5">
            <button
              type="button"
              onClick={() => vote(item.id)}
              disabled={!user}
              aria-pressed={item.userVoted}
              aria-label={`Vote for idea by ${item.username}`}
              className={`focus-ring t-mono flex h-11 w-12 shrink-0 flex-col items-center justify-center border transition-colors ${
                item.userVoted ? "border-ink text-ink" : "border-line text-ink-dim hover:border-line-strong"
              } disabled:opacity-40`}
            >
              <span aria-hidden="true">▲</span>
              <span>{item.votes}</span>
            </button>
            <div className="min-w-0">
              <p className="t-body text-ink">{item.idea}</p>
              <p className="t-label mt-2">@{item.username}</p>
            </div>
          </li>
        ))}
      </ul>

      {loaded && ideas.length === 0 ? <p className="t-label mt-10">NO IDEAS YET. BE THE FIRST.</p> : null}
    </Section>
  );
}
