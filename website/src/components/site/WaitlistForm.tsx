"use client";

import { useState, type FormEvent } from "react";
import { trackEvent } from "@/components/site/Analytics";
import { useTurnstile } from "@/components/site/useTurnstile";

type State = "idle" | "pending" | "joined" | "already" | "error";

export default function WaitlistForm({ source = "site", cta = "JOIN WAITLIST" }: { source?: string; cta?: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");
  const turnstile = useTurnstile();

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    if (turnstile.required && !turnstile.getToken()) {
      setError(
        turnstile.unavailable
          ? "THE VERIFICATION WIDGET COULD NOT LOAD. DISABLE YOUR BLOCKER AND RELOAD."
          : "COMPLETE THE VERIFICATION CHECK FIRST.",
      );
      setState("error");
      return;
    }

    setState("pending");
    try {
      const res = await fetch("/api/waitlist/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, turnstile: turnstile.getToken(), source }),
      });
      const data = (await res.json().catch(() => ({}))) as { created?: boolean; error?: string };

      if (!res.ok) {
        setError((data.error ?? "SOMETHING WENT WRONG. TRY AGAIN.").toUpperCase());
        setState("error");
        turnstile.reset();
        return;
      }

      setEmail("");
      setState(data.created ? "joined" : "already");
      if (data.created) trackEvent("waitlist_join", window.location.pathname);
    } catch {
      setError("NETWORK ERROR. TRY AGAIN.");
      setState("error");
    }
  }

  if (state === "joined" || state === "already") {
    return (
      <div role="status" className="panel mt-8 max-w-lg p-6">
        <p className="t-h3">{state === "joined" ? "YOU'RE ON THE LIST." : "YOU'RE ALREADY ON THE LIST."}</p>
        <p className="t-body mt-2">
          {state === "joined"
            ? "WE'LL EMAIL YOU BEFORE ANYTHING GOES PUBLIC."
            : "THAT EMAIL IS ALREADY REGISTERED. NOTHING ELSE TO DO."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 w-full max-w-lg" noValidate>
      <label htmlFor={`waitlist-email-${source}`} className="t-label">
        EMAIL ADDRESS
      </label>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row">
        <input
          id={`waitlist-email-${source}`}
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          aria-invalid={state === "error"}
          aria-describedby={state === "error" ? `waitlist-error-${source}` : undefined}
          className="field flex-1"
        />
        <button type="submit" disabled={state === "pending" || turnstile.misconfigured} className="btn btn-primary">
          {state === "pending" ? "JOINING…" : cta}
        </button>
      </div>

      <div ref={turnstile.containerRef} className="mt-4 empty:mt-0" />

      {turnstile.misconfigured ? (
        <p role="alert" className="t-label mt-3 text-red-sw">
          SIGN-UP IS TEMPORARILY UNAVAILABLE — VERIFICATION IS NOT CONFIGURED.
        </p>
      ) : null}

      {state === "error" && error ? (
        <p id={`waitlist-error-${source}`} role="alert" className="t-label mt-3 text-red-sw">
          {error}
        </p>
      ) : null}
    </form>
  );
}
