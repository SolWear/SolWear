export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing ${name}`);
  return value;
}

export function dataDir(): string {
  return process.env.SOLWEAR_DATA_DIR || "/data";
}
