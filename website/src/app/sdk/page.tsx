import type { Metadata } from "next";
import Link from "next/link";
import Reveal from "@/components/cubes/Reveal";
import SiteFooter from "@/components/site/SiteFooter";
import SiteNav from "@/components/site/SiteNav";
import { Section, SectionBody, SectionHeadline, SectionLabel } from "@/components/ui/Section";

export const metadata: Metadata = {
  title: "SOLWEAR",
  description:
    "Build SolWear apps with TypeScript, HTML and CSS using the typed SDK, CLI, host emulator and signed app packaging.",
  alternates: { canonical: "/sdk/" },
};

const features = [
  {
    index: "01 / TYPED",
    title: "A typed runtime",
    text: "Import @solwear/sdk for typed access to system, power, display, sensors, notifications, apps, wallet and NFC APIs.",
  },
  {
    index: "02 / SANDBOXED",
    title: "Capabilities by design",
    text: "Apps run as ordinary web content in a sandboxed iframe. Your manifest declares each capability, and the daemon enforces the gate.",
  },
  {
    index: "03 / REAL SHELL",
    title: "Emulate the real UI",
    text: "The host emulator runs the real SolWear shell against a protocol-compatible mock daemon, with your app loaded inside it.",
  },
  {
    index: "04 / ADAPTIVE",
    title: "Round, square, wide",
    text: "Build adaptive layouts for round or square displays from 240×240 through 800×480 using SDK-provided screen metrics.",
  },
  {
    index: "05 / ONE CLI",
    title: "One tool, full loop",
    text: "Use solwear new, build, run, package, keygen, sign, verify and publish for the complete development loop.",
  },
  {
    index: "06 / VERIFIABLE",
    title: "Packages with provenance",
    text: "Deterministic .swa archives can carry an Ed25519 signature over the canonical SHA-256 list of every packaged file.",
  },
];

const steps = [
  {
    label: "WRITE",
    command: "TS / HTML / CSS",
    text: "Start from an app, watchface or signer template and use the same web platform you already know.",
  },
  {
    label: "EMULATE",
    command: "solwear run",
    text: "Boot the real shell and a mock daemon in under two seconds, then check round, square and wide profiles.",
  },
  {
    label: "SIGN",
    command: "solwear sign",
    text: "Package a deterministic .swa and sign its canonical SHA-256 file list with an Ed25519 publisher key.",
  },
  {
    label: "PUBLISH",
    command: "solwear publish",
    text: "Prepare the registry entry, then submit it as a reviewed pull request to the app registry.",
  },
];

const appCode = `import { solwear, layout } from "@solwear/sdk";

await solwear.ready();
layout(solwear.system.screen);

const time = document.querySelector("#time")!;
const battery = document.querySelector("#battery")!;

function renderTime(epochMs: number) {
  time.textContent = new Date(epochMs).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

const now = await solwear.system.time();
renderTime(now.epochMs);

const status = await solwear.power.status();
battery.textContent = \`${"${status.percent}"}%\`;

solwear.on("tick", ({ epochMs }) => {
  renderTime(epochMs);
});`;

export default function SdkPage() {
  return (
    <>
      <SiteNav />
      <main id="main" className="flex min-h-screen flex-col">
        <section className="relative z-10 flex min-h-[92svh] items-center pt-28">
          <div className="shell grid items-center gap-14 pb-16 lg:grid-cols-[1.05fr_0.95fr] lg:gap-20">
            <div>
              <Reveal mode="box" as="p" className="t-label text-red-sw">
                SOLWEAR SDK / BUILD FOR THE WRIST
              </Reveal>
              <Reveal mode="text" as="h1" delay={80} className="t-display mt-6 max-w-[9ch]">
                YOUR CODE. ON THE WRIST.
              </Reveal>
              <Reveal mode="box" as="p" delay={180} className="t-lead mt-8 max-w-xl">
                Build adaptive SolWear apps with TypeScript, HTML and CSS. Test them in the real shell, then package, sign and publish from one CLI.
              </Reveal>
              <Reveal mode="box" delay={240} className="mt-10 flex flex-wrap gap-3">
                <a href="https://docs.solwear.tech/getting-started/" className="btn btn-primary focus-ring">
                  START BUILDING <span aria-hidden="true">→</span>
                </a>
                <a href="https://docs.solwear.tech/" className="btn btn-ghost focus-ring">
                  BROWSE DOCS
                </a>
              </Reveal>
            </div>

            <Reveal mode="fill" delay={140} className="panel overflow-hidden">
              <div className="flex items-center justify-between border-b border-line px-5 py-4">
                <span className="t-label text-ink">TERMINAL / QUICKSTART</span>
              </div>
              <div className="font-mono text-[0.8125rem] leading-7 text-ink-dim">
                <div className="px-5 py-5 sm:px-7">
                  <p><span className="text-red-sw">$</span> npm install --global @solwear/cli</p>
                  <p><span className="text-red-sw">$</span> solwear new pulse --template app</p>
                  <p><span className="text-red-sw">$</span> cd pulse</p>
                  <p><span className="text-red-sw">$</span> solwear run --profile pi-round-480</p>
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <Section className="rule">
          <SectionLabel>THE CREATOR TOOLKIT</SectionLabel>
          <SectionHeadline>EVERYTHING BETWEEN AN IDEA AND A SIGNED APP.</SectionHeadline>
          <SectionBody>
            A focused runtime and toolchain for building wearable software without leaving familiar web technologies.
          </SectionBody>
          <div className="mt-16 grid gap-px border border-line bg-line md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, index) => (
              <Reveal
                key={feature.title}
                mode="box"
                as="article"
                delay={index * 45}
                className="flex min-h-64 flex-col bg-ground p-6 sm:p-8"
              >
                <p className="t-label text-red-sw">{feature.index}</p>
                <h3 className="t-h3 mt-auto pt-12">{feature.title}</h3>
                <p className="t-body mt-4">{feature.text}</p>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section>
          <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr] lg:items-start lg:gap-20">
            <div className="lg:sticky lg:top-28">
              <SectionLabel>SMALL API. REAL APP.</SectionLabel>
              <SectionHeadline className="max-w-[10ch]">FROM FIRST FRAME TO LIVE DATA.</SectionHeadline>
              <SectionBody>
                The runtime handshakes with the shell, publishes adaptive layout variables and exposes only the capabilities declared by your app.
              </SectionBody>
              <Reveal mode="box" delay={220} className="mt-8 border-l-2 border-red-sw pl-5">
                <p className="t-label text-ink">MANIFEST CAPABILITIES</p>
                <p className="t-mono mt-3 text-ink-dim">[&quot;system&quot;, &quot;power&quot;]</p>
              </Reveal>
            </div>

            <Reveal mode="fill" delay={140} className="docs-prose max-w-none">
              <div className="flex items-center justify-between border border-b-0 border-line bg-ground-raised px-5 py-4">
                <span className="t-label text-ink">SRC / MAIN.TS</span>
                <span className="t-label">TYPESCRIPT</span>
              </div>
              <pre className="!mb-0 !border-l !border-line !p-5 sm:!p-7">
                <code>{appCode}</code>
              </pre>
            </Reveal>
          </div>
        </Section>

        <Section className="rule">
          <SectionLabel>THE BUILD LOOP</SectionLabel>
          <SectionHeadline>WRITE. EMULATE. SIGN. PUBLISH.</SectionHeadline>
          <ol className="mt-16 grid border-l border-line md:grid-cols-2 md:border-l-0 lg:grid-cols-4">
            {steps.map((step, index) => (
              <Reveal
                key={step.label}
                mode="box"
                as="li"
                delay={index * 65}
                className="relative border-b border-r border-t border-line p-6 first:border-l md:p-7"
              >
                <span className="absolute -left-[5px] top-8 h-[9px] w-[9px] bg-red-sw md:left-8 md:top-[-5px]" aria-hidden="true" />
                <p className="t-label text-red-sw">0{index + 1}</p>
                <h3 className="t-h3 mt-10">{step.label}</h3>
                <p className="t-mono mt-3 text-ink">{step.command}</p>
                <p className="t-body mt-5">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </Section>

        <section className="section relative z-10 overflow-hidden">
          <div className="shell">
            <Reveal mode="fill" className="relative border border-line bg-ground-raised px-6 py-14 sm:px-10 sm:py-16 lg:px-16">
              <div className="absolute inset-y-0 left-0 w-1 bg-red-sw" aria-hidden="true" />
              <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <h2 className="t-h2 max-w-3xl">TAKE YOUR FIRST APP FROM SOURCE TO EMULATOR.</h2>
                  <p className="t-body mt-5 max-w-2xl">
                    Follow the getting-started guide to install the CLI, scaffold a project and boot it in the host emulator.
                  </p>
                </div>
                <a href="https://docs.solwear.tech/getting-started/" className="btn btn-primary focus-ring shrink-0">
                  READ THE DOCS <span aria-hidden="true">→</span>
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        <SiteFooter />
      </main>
    </>
  );
}
