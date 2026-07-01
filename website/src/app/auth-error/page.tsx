import type { Metadata } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Login not configured",
  robots: { index: false },
};

const REQUIRED_VARS = [
  { name: "SESSION_SECRET", desc: "Random secret for signing session cookies (any long random string)" },
  { name: "X_CLIENT_ID", desc: "OAuth 2.0 Client ID from developer.twitter.com" },
  { name: "X_CLIENT_SECRET", desc: "OAuth 2.0 Client Secret from developer.twitter.com" },
  { name: "X_CALLBACK_URL", desc: "Must match the callback URL in your Twitter app (e.g. https://solwear.tech/api/auth/x/callback/)" },
  { name: "SOLWEAR_X_USER_ID", desc: "Numeric Twitter user ID of @SolWear_ (find via twitter API or a lookup tool)" },
  { name: "NEXT_PUBLIC_SOLWEAR_DYNAMIC", desc: "Set to 1 to enable live features" },
];

export default function AuthErrorPage() {
  return (
    <>
      <Nav />
      <main className="min-h-screen px-6 pb-24 pt-28">
        <section className="mx-auto max-w-2xl">
          <p className="label-caps mb-3 text-[var(--sw-red)]">configuration error</p>
          <h1 className="text-4xl font-bold">Twitter login not configured</h1>
          <p className="mt-5 text-sm leading-7 text-white/58">
            The Twitter / X OAuth credentials are missing. Add the following environment variables
            to your <code className="rounded bg-white/10 px-1 py-0.5 text-xs">.env.local</code> file and restart the server.
          </p>

          <div className="mt-8 space-y-3">
            {REQUIRED_VARS.map((v) => (
              <div key={v.name} className="border border-white/10 bg-white/[0.04] p-4">
                <p className="font-mono text-sm font-semibold text-white">{v.name}</p>
                <p className="mt-1 text-xs text-white/50">{v.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-3">
            <a
              href="/"
              className="focus-ring inline-flex min-h-11 items-center bg-white px-5 py-3 text-sm font-semibold text-black"
            >
              Back to home
            </a>
            <a
              href="https://developer.twitter.com/en/portal/dashboard"
              target="_blank"
              rel="noreferrer"
              className="focus-ring inline-flex min-h-11 items-center border border-white/20 px-5 py-3 text-sm text-white/70"
            >
              Twitter Developer Portal
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
