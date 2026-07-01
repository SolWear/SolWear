export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function dataDir(): string {
  return process.env.SOLWEAR_DATA_DIR || "/data";
}

export function publicDynamicEnabled(): boolean {
  return process.env.NEXT_PUBLIC_SOLWEAR_DYNAMIC === "1";
}
