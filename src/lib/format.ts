// Kleine Formatierungshelfer für die Oberfläche (deutsche Schreibweise).

/** Kalenderwoche nach ISO 8601, z. B. "2026-09-14" → 38 */
export function isoWeek(iso: string): number {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = Date.UTC(d.getUTCFullYear(), 0, 1);
  return Math.ceil(((d.getTime() - yearStart) / 86_400_000 + 1) / 7);
}

/** "2026-11-09" → "9. Nov. 2026" (kurz) oder "9. November 2026" (lang) */
export function formatDate(iso: string, style: "short" | "long" = "long"): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: style === "short" ? "short" : "long",
    year: "numeric",
    timeZone: "UTC",
  });
}
