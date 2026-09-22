/**
 * Bundle the real OS shell into this package so the published emulator is
 * self-contained.
 *
 * `solwear run` for a monorepo checkout serves os/shell/dist directly. A user
 * who installed @solwear/emulator-host from npm has no monorepo, so at publish
 * time we build the shell and copy its dist into ./shell, which the emulator's
 * resolveShell() prefers over the tiny reference shell in web/shell.
 *
 * Runs from prepublishOnly. It needs the monorepo (the shell source lives
 * there); publishing always happens from a checkout, so that is fine.
 */

import { execSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const hostDir = resolve(here, ".."); // emulator/host
const monorepo = resolve(hostDir, "..", ".."); // repo root
const shellSrc = join(monorepo, "os", "shell");
const shellDist = join(shellSrc, "dist");
const out = join(hostDir, "shell");

if (!existsSync(shellSrc)) {
  console.error(`[bundle-shell] Cannot find the OS shell at ${shellSrc}.`);
  console.error("[bundle-shell] Publish @solwear/emulator-host from inside the SolWear monorepo.");
  process.exit(1);
}

const run = (cmd) => execSync(cmd, { cwd: shellSrc, stdio: "inherit" });

console.log("[bundle-shell] building os/shell");
if (!existsSync(join(shellSrc, "node_modules"))) run("npm install --no-audit --no-fund");
run("npm run build");

if (!existsSync(join(shellDist, "index.html"))) {
  console.error(`[bundle-shell] Shell build produced no index.html in ${shellDist}.`);
  process.exit(1);
}

rmSync(out, { recursive: true, force: true });
mkdirSync(out, { recursive: true });
cpSync(shellDist, out, { recursive: true });
console.log(`[bundle-shell] copied ${shellDist} -> ${out}`);
