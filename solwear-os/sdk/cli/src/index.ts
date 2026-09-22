/** Command dispatch for the `solwear` CLI. */

import { createRequire } from "node:module";
import { parseArgs, boolFlag, closest } from "./args.js";
import { HELP, printHelp } from "./help.js";
import { CliError, reportError } from "./log.js";
import { buildCommand } from "./commands/build.js";
import { doctorCommand } from "./commands/doctor.js";
import { installCommand } from "./commands/install.js";
import { newCommand } from "./commands/new.js";
import { packageCommand } from "./commands/package.js";
import { publishCommand } from "./commands/publish.js";
import { runCommand } from "./commands/run.js";
import { keygenCommand, signCommand } from "./commands/sign.js";
import { verifyCommand } from "./commands/verify.js";

/** Read from package.json so the reported version can never drift from it. */
export const VERSION: string = (() => {
  try {
    const require = createRequire(import.meta.url);
    return (require("../package.json") as { version: string }).version;
  } catch {
    return "0.0.0";
  }
})();

type Handler = (args: ReturnType<typeof parseArgs>) => Promise<void>;

const COMMANDS: Record<string, Handler> = {
  new: newCommand,
  build: buildCommand,
  run: runCommand,
  package: packageCommand,
  sign: signCommand,
  keygen: keygenCommand,
  verify: verifyCommand,
  install: installCommand,
  publish: publishCommand,
  doctor: doctorCommand,
};

export async function main(argv: string[]): Promise<number> {
  const args = parseArgs(argv);

  if (args.flags["version"] === true || args.flags["v"] === true || args.command === "version") {
    process.stdout.write(`solwear ${VERSION}\n`);
    return 0;
  }

  if (!args.command || args.command === "help") {
    printHelp(args.positionals[0]);
    return 0;
  }

  const handler = COMMANDS[args.command];
  if (!handler) {
    const suggestion = closest(args.command, Object.keys(COMMANDS));
    return reportError(
      new CliError(`"${args.command}" is not a solwear command.`, {
        hint: suggestion ? `Did you mean \`solwear ${suggestion}\`?` : "Run `solwear help` to see them all.",
      }),
    );
  }

  if (boolFlag(args, "help") || boolFlag(args, "h")) {
    printHelp(args.command in HELP ? args.command : undefined);
    return 0;
  }

  try {
    await handler(args);
    return process.exitCode === undefined ? 0 : Number(process.exitCode);
  } catch (error) {
    return reportError(error);
  }
}
