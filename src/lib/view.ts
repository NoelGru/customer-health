// Ansichtslogik: alles, was die Oberfläche braucht, aber noch keine Oberfläche ist.
// Kunden + Health Score zusammenführen, filtern, Kennzahlen berechnen.

import type { Customer, OnboardingPhase, Segment } from "./types";
import { calculateHealth, sortByUrgency, type HealthResult, type HealthStatus } from "./health";
import { readiness } from "./onboarding";

export const SEGMENT_LABEL: Record<Segment, string> = {
  supermarkt: "Supermarkt",
  klinik: "Klinik",
  hotel: "Hotel",
  fitness: "Fitness",
  shopping: "Shopping-Center",
};

export const STATUS_LABEL: Record<HealthStatus, string> = {
  rot: "Gefährdet",
  gelb: "Beobachten",
  gruen: "Stabil",
};

/** Ampelfarben, auch für Inline-Styles (Ring, Badge) */
export const STATUS_COLOR: Record<HealthStatus, string> = {
  rot: "#dc2626",
  gelb: "#d08700",
  gruen: "#15a34a",
};

export interface CustomerView extends Customer {
  health: HealthResult;
  readiness: { done: number; total: number; percent: number };
}

/** Alle Kunden mit Health Score, sortiert nach "dringendste zuerst" */
export function buildViews(customers: Customer[], asOf: string): CustomerView[] {
  return sortByUrgency(customers, asOf).map((c) => ({
    ...c,
    health: calculateHealth(c, asOf),
    readiness: readiness(c.onboarding.done),
  }));
}

export interface Filters {
  status: HealthStatus | "alle";
  segment: Segment | "alle";
  phase: OnboardingPhase | "alle";
}

export const NO_FILTERS: Filters = { status: "alle", segment: "alle", phase: "alle" };

export function applyFilters(views: CustomerView[], f: Filters): CustomerView[] {
  return views.filter(
    (v) =>
      (f.status === "alle" || v.health.status === f.status) &&
      (f.segment === "alle" || v.segment === f.segment) &&
      (f.phase === "alle" || v.onboarding.phase === f.phase),
  );
}

export interface PortfolioKpis {
  total: number;
  rot: number;
  gelb: number;
  onboarding: number;
  /** Schnitt der Zahlungsquote der letzten Woche über alle Live-Kunden */
  avgPayment: number;
}

export function portfolioKpis(views: CustomerView[]): PortfolioKpis {
  const live = views.filter((v) => v.weekly.length > 0);
  return {
    total: views.length,
    rot: views.filter((v) => v.health.status === "rot").length,
    gelb: views.filter((v) => v.health.status === "gelb").length,
    onboarding: views.filter((v) => v.onboarding.phase !== "live").length,
    avgPayment: live.reduce((s, v) => s + v.weekly[v.weekly.length - 1].paymentRate, 0) / (live.length || 1),
  };
}
