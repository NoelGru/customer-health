// Health Score: "Punkteabzug wie beim TÜV".
// Jeder Kunde startet mit 100 Punkten. Jede Regel, die anschlägt, zieht Punkte ab
// und liefert einen Satz als Begründung. Regeln und Gewichte: docs/PLAN.md, Abschnitt 3.

import type { Customer } from "./types";
import { CHECKLIST, PHASES } from "./onboarding";

export type HealthStatus = "gruen" | "gelb" | "rot";
export type RuleId = "R1" | "R2" | "R3" | "R4" | "R5" | "R6";

export interface Reason {
  rule: RuleId;
  /** Abzug als negative Zahl, z. B. -15 */
  points: number;
  text: string;
}

export interface HealthResult {
  score: number;
  status: HealthStatus;
  /** Größter Abzug zuerst */
  reasons: Reason[];
  nextStep: string;
}

// ---------------------------------------------------------------------------
// Alle Schwellen und Gewichte an einer Stelle, damit man sie leicht anpassen kann.

export const STATUS_THRESHOLDS = { green: 85, yellow: 50 };

export const RULES = {
  /** R1: Zahlungsquote der letzten Woche zu niedrig */
  paymentLow: { warnBelow: 0.85, criticalBelow: 0.75, warnPoints: -15, criticalPoints: -25 },
  /** R2: Zahlungsquote fällt (Prozentpunkte gegenüber Schnitt Woche 1 bis 4) */
  paymentDrop: { minDropPoints: 5, points: -15 },
  /** R3: Auslastung fällt (Prozent gegenüber Schnitt Woche 1 bis 4) */
  occupancyDrop: { minDropPercent: 15, points: -20 },
  /** R4: Lange kein Kontakt (Tage) */
  noContact: { warnAfter: 30, criticalAfter: 60, warnPoints: -10, criticalPoints: -20 },
  /** R5: Viele offene Tickets */
  tickets: { warnFrom: 3, criticalFrom: 6, warnPoints: -10, criticalPoints: -20 },
  /** R6: Onboarding hängt (Tage in derselben Phase) */
  onboardingStuck: { warnAfter: 21, criticalAfter: 45, warnPoints: -20, criticalPoints: -35 },
} as const;

export const NEXT_STEPS: Record<RuleId | "none", string> = {
  R1: "Vor-Ort-Check: Beschilderung und Automat prüfen, Zahlungsdaten mit dem Kunden durchgehen.",
  R2: "Vor-Ort-Check: Beschilderung und Automat prüfen, Zahlungsdaten mit dem Kunden durchgehen.",
  R3: "Termin vereinbaren: Hat sich vor Ort etwas geändert (Baustelle, Öffnungszeiten, Parkregeln, Konkurrenz)?",
  R4: "Kurzen Check-in-Call einplanen, mit einer kleinen Auswertung der letzten Wochen als Anlass.",
  R5: "Offene Tickets bündeln, mit dem Support klären und den Kunden proaktiv über den Stand informieren.",
  R6: "Blocker benennen, für jeden offenen Punkt eine verantwortliche Person und ein Datum festlegen.",
  none: "Alles im grünen Bereich: im nächsten Quartals-Review Erfolge teilen und eine Erweiterung ansprechen.",
};

// ---------------------------------------------------------------------------
// Kleine Helfer

const average = (values: number[]) => values.reduce((sum, v) => sum + v, 0) / values.length;

/** 0.734 → "73 %" */
export const formatPercent = (value: number) => `${Math.round(value * 100)} %`;

/** Ganze Tage zwischen zwei ISO-Daten */
export function daysBetween(from: string, to: string): number {
  return Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000);
}

/** Wie viele Wochen in Folge ist der Wert am Ende der Reihe gesunken? */
export function countDecliningWeeks(values: number[]): number {
  let count = 0;
  for (let i = values.length - 1; i > 0 && values[i] < values[i - 1]; i--) count++;
  return count;
}

/** Auf eine Nachkommastelle runden, damit 0,86 − 0,91 nicht als −4,9999 endet */
const round1 = (x: number) => Math.round(x * 10) / 10;

// ---------------------------------------------------------------------------
// Die Regeln

function usageRules(customer: Customer): Reason[] {
  const reasons: Reason[] = [];
  const weeks = customer.weekly;
  if (weeks.length === 0) return reasons;

  const payment = weeks.map((w) => w.paymentRate);
  const occupancy = weeks.map((w) => w.occupancy);
  const lastPayment = payment[payment.length - 1];

  // R1: Zahlungsquote niedrig
  const r1 = RULES.paymentLow;
  if (lastPayment < r1.warnBelow) {
    reasons.push({
      rule: "R1",
      points: lastPayment < r1.criticalBelow ? r1.criticalPoints : r1.warnPoints,
      text: `Zahlungsquote nur ${formatPercent(lastPayment)} (Ziel: mindestens ${formatPercent(r1.warnBelow)})`,
    });
  }

  // R2 und R3 vergleichen "vorher" (Woche 1 bis 4) mit "jetzt". Dafür braucht es genug Wochen.
  if (weeks.length < 6) return reasons;

  // R2: Zahlungsquote fällt
  const paymentBefore = average(payment.slice(0, 4));
  const paymentDropPoints = round1((paymentBefore - lastPayment) * 100);
  if (paymentDropPoints >= RULES.paymentDrop.minDropPoints) {
    const declining = countDecliningWeeks(payment);
    const since = declining >= 2 ? `seit ${declining} Wochen gesunken` : "gesunken";
    reasons.push({
      rule: "R2",
      points: RULES.paymentDrop.points,
      text: `Zahlungsquote ${since} (von ${formatPercent(paymentBefore)} auf ${formatPercent(lastPayment)})`,
    });
  }

  // R3: Auslastung fällt (Schnitt der letzten 2 Wochen gegen Schnitt Woche 1 bis 4)
  const occupancyBefore = average(occupancy.slice(0, 4));
  const occupancyNow = average(occupancy.slice(-2));
  const occupancyDropPercent = round1((1 - occupancyNow / occupancyBefore) * 100);
  if (occupancyDropPercent >= RULES.occupancyDrop.minDropPercent) {
    reasons.push({
      rule: "R3",
      points: RULES.occupancyDrop.points,
      text: `Auslastung um ${Math.round(occupancyDropPercent)} % gefallen (von ${formatPercent(occupancyBefore)} auf ${formatPercent(occupancyNow)})`,
    });
  }

  return reasons;
}

function onboardingRule(customer: Customer, asOf: string): Reason[] {
  const { phase, phaseSince, done } = customer.onboarding;
  if (phase === "live") return [];

  const r6 = RULES.onboardingStuck;
  const days = daysBetween(phaseSince, asOf);
  if (days <= r6.warnAfter) return [];

  const phaseLabel = PHASES.find((p) => p.id === phase)?.label ?? phase;
  const open = CHECKLIST.filter((item) => item.phase === phase && !done.includes(item.id)).map((item) => item.label);
  const openText = open.length > 0 ? `, offen: ${open.join(", ")}` : "";

  return [
    {
      rule: "R6",
      points: days > r6.criticalAfter ? r6.criticalPoints : r6.warnPoints,
      text: `Seit ${days} Tagen in Phase ${phaseLabel}${openText}`,
    },
  ];
}

function relationshipRules(customer: Customer): Reason[] {
  const reasons: Reason[] = [];

  // R4: Lange kein Kontakt
  const r4 = RULES.noContact;
  if (customer.daysSinceContact > r4.warnAfter) {
    reasons.push({
      rule: "R4",
      points: customer.daysSinceContact > r4.criticalAfter ? r4.criticalPoints : r4.warnPoints,
      text: `Seit ${customer.daysSinceContact} Tagen kein Kontakt`,
    });
  }

  // R5: Viele offene Tickets
  const r5 = RULES.tickets;
  if (customer.openTickets >= r5.warnFrom) {
    reasons.push({
      rule: "R5",
      points: customer.openTickets >= r5.criticalFrom ? r5.criticalPoints : r5.warnPoints,
      text: `${customer.openTickets} offene Tickets`,
    });
  }

  return reasons;
}

// ---------------------------------------------------------------------------
// Öffentliche Funktionen

export function statusFromScore(score: number): HealthStatus {
  if (score >= STATUS_THRESHOLDS.green) return "gruen";
  if (score >= STATUS_THRESHOLDS.yellow) return "gelb";
  return "rot";
}

/**
 * Berechnet Score, Ampel, Begründungen und nächsten Schritt für einen Kunden.
 * `asOf` ist der Stichtag der Daten (siehe customers.json).
 */
export function calculateHealth(customer: Customer, asOf: string): HealthResult {
  const reasons = [
    ...usageRules(customer),
    ...onboardingRule(customer, asOf),
    ...relationshipRules(customer),
  ].sort((a, b) => a.points - b.points); // größter Abzug zuerst, bei Gleichstand bleibt die Regel-Reihenfolge

  const score = Math.max(0, 100 + reasons.reduce((sum, r) => sum + r.points, 0));
  const nextStep = NEXT_STEPS[reasons[0]?.rule ?? "none"];

  return { score, status: statusFromScore(score), reasons, nextStep };
}

/**
 * "Dringendste zuerst": niedrigster Score oben.
 * Bei Gleichstand zuerst der größere Kunde (mehr Stellplätze = mehr steht auf dem Spiel).
 */
export function sortByUrgency(customers: Customer[], asOf: string): Customer[] {
  const scores = new Map(customers.map((c) => [c.id, calculateHealth(c, asOf).score]));
  return [...customers].sort((a, b) => scores.get(a.id)! - scores.get(b.id)! || b.spaces - a.spaces);
}
