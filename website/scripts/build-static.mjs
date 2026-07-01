import { spawnSync } from "node:child_process";
import { cpSync, existsSync, rmSync } from "node:fs";
import { join } from "node:path";

const env = {
  ...process.env,
  SOLWEAR_STATIC_EXPORT: "1",
  NEXT_PUBLIC_SOLWEAR_DYNAMIC: "0",
};

const apiDir = join(process.cwd(), "src", "app", "api");
const hiddenApiDir = join(process.cwd(), "src", "app", "_api_server_only");
let apiHidden = false;

try {
  if (existsSync(apiDir)) {
    rmSync(hiddenApiDir, { recursive: true, force: true });
    cpSync(apiDir, hiddenApiDir, { recursive: true });
    rmSync(apiDir, { recursive: true, force: true });
    apiHidden = true;
  }

  const result = spawnSync("npx", ["next", "build"], {
    stdio: "inherit",
    shell: process.platform === "win32",
    env,
  });

  process.exitCode = result.status ?? 1;
} finally {
  if (apiHidden && existsSync(hiddenApiDir)) {
    rmSync(apiDir, { recursive: true, force: true });
    cpSync(hiddenApiDir, apiDir, { recursive: true });
    rmSync(hiddenApiDir, { recursive: true, force: true });
  }
}
