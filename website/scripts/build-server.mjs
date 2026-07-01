import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  SOLWEAR_STATIC_EXPORT: "0",
  NEXT_PUBLIC_SOLWEAR_DYNAMIC: "1",
};

const result = spawnSync("npx", ["next", "build"], {
  stdio: "inherit",
  shell: process.platform === "win32",
  env,
});

process.exit(result.status ?? 1);
