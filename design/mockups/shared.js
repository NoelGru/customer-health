// Gemeinsame Daten für alle drei Mockups: echte Beispieldaten + echter Health Score.
// Läuft nur über den Vite-Dev-Server (npm run dev), weil hier TypeScript importiert wird.
import data from "/data/customers.json";
import { calculateHealth, sortByUrgency, formatPercent } from "/src/lib/health.ts";
import { CHECKLIST, PHASES, readiness } from "/src/lib/onboarding.ts";

export const SEGMENTS = {
  supermarkt: "Supermarkt",
  klinik: "Klinik",
  hotel: "Hotel",
  fitness: "Fitness",
  shopping: "Shopping-Center",
};
export const STATUS_LABEL = { rot: "Gefährdet", gelb: "Beobachten", gruen: "Stabil" };

const { asOf, customers } = data;
export { asOf, formatPercent, PHASES };

export const rows = sortByUrgency(customers, asOf).map((c) => {
  const h = calculateHealth(c, asOf);
  return {
    ...c,
    health: h,
    segmentLabel: SEGMENTS[c.segment],
    phaseLabel: PHASES.find((p) => p.id === c.onboarding.phase).label,
    readiness: readiness(c.onboarding.done),
    lastPayment: c.weekly.length ? c.weekly[c.weekly.length - 1].paymentRate : null,
  };
});

const live = customers.filter((c) => c.weekly.length);
export const kpis = {
  total: customers.length,
  rot: rows.filter((r) => r.health.status === "rot").length,
  gelb: rows.filter((r) => r.health.status === "gelb").length,
  onboarding: customers.filter((c) => c.onboarding.phase !== "live").length,
  avgPayment: live.reduce((s, c) => s + c.weekly[7].paymentRate, 0) / live.length,
};

export const detail = rows.find((r) => r.id === "c07");

export function checklistFor(row) {
  return PHASES.map((p) => ({
    ...p,
    current: p.id === row.onboarding.phase,
    items: CHECKLIST.filter((i) => i.phase === p.id).map((i) => ({ ...i, done: row.onboarding.done.includes(i.id) })),
  }));
}

export const asOfLabel = new Date(asOf).toLocaleDateString("de-DE", { day: "numeric", month: "long", year: "numeric" });

function isoWeek(iso) {
  const d = new Date(iso);
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

/**
 * Kleines Liniendiagramm als SVG-Text.
 * series: [{ values: number[], color, dash? }]
 */
export function lineChart({ series, weeks, width = 520, height = 180, yMin = 0.5, yMax = 1, grid = "#e5e7eb", label = "#8a929b", font = "inherit", stroke = 2, dots = true }) {
  const padL = 34, padR = 8, padT = 10, padB = 24;
  const w = width - padL - padR, h = height - padT - padB;
  const x = (i) => padL + (i / (weeks.length - 1)) * w;
  const y = (v) => padT + (1 - (v - yMin) / (yMax - yMin)) * h;
  const ticks = [yMin, (yMin + yMax) / 2, yMax];
  let svg = `<svg viewBox="0 0 ${width} ${height}" width="100%" role="img" aria-label="Verlauf der letzten 8 Wochen" style="font-family:${font};display:block">`;
  for (const t of ticks) {
    svg += `<line x1="${padL}" x2="${width - padR}" y1="${y(t)}" y2="${y(t)}" stroke="${grid}" stroke-width="1"/>`;
    svg += `<text x="${padL - 6}" y="${y(t) + 4}" text-anchor="end" font-size="10" fill="${label}">${Math.round(t * 100)} %</text>`;
  }
  weeks.forEach((wk, i) => {
    svg += `<text x="${x(i)}" y="${height - 6}" text-anchor="middle" font-size="10" fill="${label}">KW ${isoWeek(wk)}</text>`;
  });
  for (const s of series) {
    const d = s.values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
    svg += `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="${stroke}" stroke-linejoin="round" stroke-linecap="round" ${s.dash ? `stroke-dasharray="${s.dash}"` : ""}/>`;
    if (dots) {
      const last = s.values.length - 1;
      svg += `<circle cx="${x(last)}" cy="${y(s.values[last])}" r="3.5" fill="${s.color}"/>`;
    }
  }
  return svg + "</svg>";
}

/** Diagramm für einen Kunden, oder null, wenn er noch keine Betriebsdaten hat */
export function chartFor(row, colors, opts = {}) {
  if (!row.weekly.length) return null;
  return lineChart({
    ...opts,
    weeks: row.weekly.map((w) => w.week),
    series: [
      { values: row.weekly.map((w) => w.paymentRate), color: colors.payment },
      { values: row.weekly.map((w) => w.occupancy), color: colors.occupancy, dash: colors.dash },
    ],
    yMin: Math.min(0.4, ...row.weekly.map((w) => Math.floor(w.occupancy * 10) / 10)),
  });
}

/** Klick auf eine Zeile/Karte mit data-id öffnet die Detailansicht */
export function wireSelection(container, onSelect) {
  container.addEventListener("click", (e) => {
    const el = e.target.closest("[data-id]");
    if (el) onSelect(rows.find((r) => r.id === el.dataset.id));
  });
}

export const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]);
