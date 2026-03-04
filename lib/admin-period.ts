export type Period = "24h" | "7d" | "30d";

export const PERIOD_MS: Record<Period, number> = {
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
};

export function parsePeriod(url: string): Period {
  const raw = new URL(url).searchParams.get("period");
  if (raw === "24h" || raw === "7d" || raw === "30d") return raw;
  return "7d";
}
