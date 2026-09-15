"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import Reveal from "@/components/cubes/Reveal";
import Card from "@/components/ui/Card";
import { Section } from "@/components/ui/Section";
import { trackEvent } from "@/components/site/Analytics";
import type { SiteContent } from "@/lib/siteContent";
import { useCommunityTurnstile } from "./useCommunityTurnstile";

type Me = {
  user: { id: string; username: string; avatarUrl?: string; isAdmin: boolean } | null;
  gatePassed: boolean;
  onWaitlist: boolean;
  email?: string | null;
  role?: string;
};

function StepHeader({ n, title, body, done }: { n: string; title: string; body: string; done?: boolean }) {
  return (
    <div className="flex items-start gap-5">
      <span className={`t-label pt-1 ${done ? "text-ink" : ""}`}>{done ? "✓" : n}</span>
      <div>
        <h2 className="t-h3">{title}</h2>
        <p className="t-body mt-2 max-w-md">{body}</p>
      </div>
    </div>
  );
}

export default function CommunityClient({ content }: { content: SiteContent["community"] }) {
  const [me, setMe] = useState<Me | null>(null);
  const [gatePending, setGatePending] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [joinState, setJoinState] = useState<"idle" | "pending" | "done">("idle");
  const gateTurnstile = useCommunityTurnstile();
  const waitlistTurnstile = useCommunityTurnstile();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/community/", { cache: "no-store" });
      setMe(await res.json());
    } catch {
      setMe({ user: null, gatePassed: false, onWaitlist: false });
    }
  }, []);

  useEffect(() => {
    refresh();
    const params = new URLSearchParams(window.location.search);
    const reason = params.get("reason");
    if (params.get("auth") === "failed") {
      setError(
        reason === "verify_first"
          ? "COMPLETE STEP 01 BEFORE SIGNING IN."
          : "SIGN-IN DID NOT COMPLETE. TRY AGAIN.",
      );
    }
    if (params.get("auth") === "ok") trackEvent("community_register", "/community/");
  }, [refresh]);

  const needsGate = me !== null && !me.user && !me.gatePassed;

  async function passGate() {
    setError("");
    if (gateTurnstile.required && !gateTurnstile.getToken()) {
      setError(
        gateTurnstile.unavailable
          ? "THE VERIFICATION WIDGET COULD NOT LOAD. DISABLE YOUR BLOCKER AND RELOAD."
          : "COMPLETE THE VERIFICATION CHECK FIRST.",
      );
      return;
    }
    setGatePending(true);
    try {
      const res = await fetch("/api/community/gate/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ turnstile: gateTurnstile.getToken() }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError((data.error ?? "VERIFICATION FAILED.").toUpperCase());
        gateTurnstile.reset();
        return;
      }
      await refresh();
    } catch {
      setError("NETWORK ERROR. TRY AGAIN.");
    } finally {
      setGatePending(false);
    }
  }

  async function joinWaitlist(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    if (waitlistTurnstile.required && !waitlistTurnstile.getToken()) {
      setError(
        waitlistTurnstile.unavailable
          ? "THE VERIFICATION WIDGET COULD NOT LOAD. DISABLE YOUR BLOCKER AND RELOAD."
          : "COMPLETE THE VERIFICATION CHECK FIRST.",
      );
      return;
    }
    setJoinState("pending");
    try {
      // The session cookie links this email to the signed-in X account server-side.
      const res = await fetch("/api/waitlist/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "community", turnstile: waitlistTurnstile.getToken() }),
      });
      const data = (await res.json().catch(() => ({}))) as { created?: boolean; error?: string };
      if (!res.ok) {
        setError((data.error ?? "COULD NOT JOIN. TRY AGAIN.").toUpperCase());
        waitlistTurnstile.reset();
        setJoinState("idle");
        return;
      }
      if (data.created) trackEvent("waitlist_join", "/community/");
      setJoinState("done");
      await refresh();
    } catch {
      setError("NETWORK ERROR. TRY AGAIN.");
      setJoinState("idle");
    }
  }

  if (me === null) {
    return (
      <Section>
        <p className="t-label" role="status">
          LOADING…
        </p>
      </Section>
    );
  }

  return (
    <>
      <Section className="rule">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
          <div className="panel flex flex-col gap-10 p-8">
            {/* ── STEP 01 — TURNSTILE ─────────────────────────────────────── */}
            <div>
              <StepHeader
                n="01"
                title={content.gate.turnstileTitle}
                body={content.gate.turnstileBody}
                done={me.gatePassed || Boolean(me.user)}
              />
              {needsGate ? (
                <div className="ml-10 mt-5">
                  <div ref={gateTurnstile.containerRef} />
                  <button
                    type="button"
                    onClick={passGate}
                    disabled={gatePending || gateTurnstile.misconfigured}
                    className="btn btn-ghost mt-4"
                  >
                    {gatePending ? "VERIFYING…" : "VERIFY"}
                  </button>
                  {gateTurnstile.misconfigured ? (
                    <p role="alert" className="t-label mt-3 text-red-sw">
                      VERIFICATION IS NOT CONFIGURED — SIGN-IN IS TEMPORARILY UNAVAILABLE.
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>

            {/* ── STEP 02 — X OAUTH ───────────────────────────────────────── */}
            <div className="rule pt-8">
              <StepHeader n="02" title={content.gate.authTitle} body={content.gate.authBody} done={Boolean(me.user)} />
              {!me.user ? (
                <div className="ml-10 mt-5">
                  <a
                    href="/api/auth/x1/start/?returnTo=/community/"
                    aria-disabled={!me.gatePassed}
                    onClick={(e) => {
                      if (!me.gatePassed) {
                        e.preventDefault();
                        setError("COMPLETE STEP 01 FIRST.");
                      }
                    }}
                    className={`btn ${me.gatePassed ? "btn-primary" : "btn-ghost pointer-events-auto opacity-40"}`}
                  >
                    SIGN IN WITH X
                  </a>
                </div>
              ) : (
                <div className="ml-10 mt-4 flex items-center gap-3">
                  {me.user.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={me.user.avatarUrl} alt="" className="h-9 w-9 rounded-full" referrerPolicy="no-referrer" />
                  ) : null}
                  <p className="t-mono text-ink">@{me.user.username}</p>
                </div>
              )}
            </div>

            {/* ── STEP 03 — WAITLIST STATE ────────────────────────────────── */}
            <div className="rule pt-8">
              <StepHeader
                n="03"
                title={me.onWaitlist || joinState === "done" ? content.joined.title : content.notJoined.title}
                body={me.onWaitlist || joinState === "done" ? content.joined.body : content.notJoined.body}
                done={me.onWaitlist || joinState === "done"}
              />
              {me.user && !me.onWaitlist && joinState !== "done" ? (
                <form onSubmit={joinWaitlist} className="ml-10 mt-5 max-w-md" noValidate>
                  <label htmlFor="community-email" className="t-label">
                    EMAIL ADDRESS
                  </label>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <input
                      id="community-email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@email.com"
                      className="field flex-1"
                    />
                    <button
                      type="submit"
                      disabled={joinState === "pending" || waitlistTurnstile.misconfigured}
                      className="btn btn-primary"
                    >
                      {joinState === "pending" ? "JOINING…" : content.notJoined.cta}
                    </button>
                  </div>
                  <div ref={waitlistTurnstile.containerRef} className="mt-4 empty:mt-0" />
                  {waitlistTurnstile.misconfigured ? (
                    <p role="alert" className="t-label mt-3 text-red-sw">
                      VERIFICATION IS NOT CONFIGURED — WAITLIST SIGNUP IS TEMPORARILY UNAVAILABLE.
                    </p>
                  ) : null}
                </form>
              ) : null}
            </div>

            {error ? (
              <p role="alert" className="t-label text-red-sw">
                {error}
              </p>
            ) : null}

            {me.user ? (
              <form action="/api/auth/logout/" method="post" onSubmit={(e) => {
                e.preventDefault();
                fetch("/api/auth/logout/", { method: "POST" }).then(() => window.location.reload());
              }}>
                <button type="submit" className="focus-ring t-label hover:text-ink">
                  SIGN OUT
                </button>
              </form>
            ) : null}
          </div>

          {/* ── WHAT MEMBERSHIP MEANS ─────────────────────────────────────── */}
          <div className="grid gap-x-10 gap-y-10 sm:grid-cols-2 lg:content-start">
            {content.perks.map((perk, i) => (
              <Card key={perk.title} title={perk.title} text={perk.text} delay={i * 70} />
            ))}
          </div>
        </div>
      </Section>

      {me.user && me.onWaitlist ? (
        <Section className="rule">
          <Reveal mode="text" as="h2" className="t-h2">
            WHAT SHOULD SOLWEAR DO NEXT?
          </Reveal>
          <Reveal mode="box" as="p" delay={140} className="t-body mt-6 max-w-xl">
            THE IDEA BOARD IS WHERE MEMBERS TELL US WHAT TO BUILD. WE READ EVERY POST.
          </Reveal>
          <Reveal mode="box" delay={200} className="mt-8">
            <a href="/community/board/" className="btn btn-ghost">
              OPEN THE IDEA BOARD
            </a>
          </Reveal>
        </Section>
      ) : null}
    </>
  );
}
