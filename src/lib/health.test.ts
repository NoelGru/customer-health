import { describe, expect, it } from "vitest";
import data from "../../data/customers.json";
import type { Customer, CustomerData } from "./types";
import { calculateHealth, countDecliningWeeks, sortByUrgency, statusFromScore } from "./health";
import { CHECKLIST, readiness } from "./onboarding";

const ASOF = "2026-11-09";
const WEEKS = ["2026-09-14", "2026-09-21", "2026-09-28", "2026-10-05", "2026-10-12", "2026-10-19", "2026-10-26", "2026-11-02"];

/** Baut einen gesunden Live-Kunden. Jeder Test ändert nur das, worum es ihm geht. */
function makeCustomer(overrides: Partial<Customer> & { occupancy?: number[]; payment?: number[] } = {}): Customer {
  const { occupancy = Array(8).fill(0.7), payment = Array(8).fill(0.93), ...rest } = overrides;
  return {
    id: "t01",
    name: "Testmarkt",
    segment: "supermarkt",
    city: "Teststadt",
    spaces: 100,
    contact: { name: "Test Person", role: "Filialleitung", salutation: "sie" },
    onboarding: { phase: "live", phaseSince: "2025-01-01", done: CHECKLIST.map((i) => i.id) },
    goLiveDate: "2025-01-01",
    weekly: WEEKS.map((week, i) => ({ week, occupancy: occupancy[i], paymentRate: payment[i] })),
    openTickets: 0,
    daysSinceContact: 10,
    note: "",
    ...rest,
  };
}

describe("calculateHealth", () => {
  it("gesunder Kunde: 100 Punkte, grün, keine Begründung", () => {
    const h = calculateHealth(makeCustomer(), ASOF);
    expect(h.score).toBe(100);
    expect(h.status).toBe("gruen");
    expect(h.reasons).toEqual([]);
    expect(h.nextStep).toContain("Erfolge teilen");
  });

  it("fallende Zahlungsquote: R1 und R2 mit verständlicher Begründung", () => {
    const h = calculateHealth(makeCustomer({ payment: [0.92, 0.93, 0.91, 0.92, 0.89, 0.84, 0.79, 0.73] }), ASOF);
    expect(h.reasons.map((r) => r.rule)).toEqual(["R1", "R2"]);
    expect(h.reasons[0].text).toBe("Zahlungsquote nur 73 % (Ziel: mindestens 85 %)");
    expect(h.reasons[1].text).toBe("Zahlungsquote seit 4 Wochen gesunken (von 92 % auf 73 %)");
    expect(h.score).toBe(60); // 100 − 25 − 15
    expect(h.nextStep).toContain("Vor-Ort-Check");
  });

  it("ein starkes Signal allein macht gelb (fallende Auslastung, −20)", () => {
    const h = calculateHealth(makeCustomer({ occupancy: [0.64, 0.66, 0.63, 0.65, 0.6, 0.57, 0.53, 0.52] }), ASOF);
    expect(h.reasons).toHaveLength(1);
    expect(h.reasons[0].text).toBe("Auslastung um 19 % gefallen (von 65 % auf 53 %)");
    expect(h.score).toBe(80);
    expect(h.status).toBe("gelb");
  });

  it("ein kleines Signal allein lässt grün, zeigt aber die Begründung", () => {
    const h = calculateHealth(makeCustomer({ daysSinceContact: 33 }), ASOF);
    expect(h.score).toBe(90);
    expect(h.status).toBe("gruen");
    expect(h.reasons[0].text).toBe("Seit 33 Tagen kein Kontakt");
  });

  it("Grenzwerte: genau 30 Tage / 2 Tickets zählen noch nicht, 61 Tage / 6 Tickets zählen stark", () => {
    expect(calculateHealth(makeCustomer({ daysSinceContact: 30, openTickets: 2 }), ASOF).reasons).toEqual([]);
    const h = calculateHealth(makeCustomer({ daysSinceContact: 61, openTickets: 6 }), ASOF);
    expect(h.reasons.map((r) => r.points)).toEqual([-20, -20]);
  });

  it("hängendes Onboarding: R6 nennt die offenen Punkte, Betriebsregeln greifen nicht", () => {
    const h = calculateHealth(
      makeCustomer({
        weekly: [],
        onboarding: {
          phase: "installation",
          phaseSince: "2026-09-21", // 49 Tage vor dem Stichtag
          done: ["vertrag-signed", "vertrag-contact", "vertrag-rules", "install-survey", "install-cameras"],
        },
      }),
      ASOF,
    );
    expect(h.reasons).toHaveLength(1);
    expect(h.reasons[0].points).toBe(-35);
    expect(h.reasons[0].text).toBe(
      "Seit 49 Tagen in Phase Installation, offen: Beschilderung aufgestellt, Zahlungsautomat bzw. QR-Code installiert",
    );
    expect(h.nextStep).toContain("Blocker benennen");
  });

  it("frisches Onboarding ohne Verzug: keine Begründung", () => {
    const h = calculateHealth(
      makeCustomer({ weekly: [], onboarding: { phase: "vertrag", phaseSince: "2026-10-30", done: [] } }),
      ASOF,
    );
    expect(h.score).toBe(100);
  });

  it("schlimmster Fall: alle Regeln schlagen stark an, Score landet bei 0 (nie darunter)", () => {
    const h = calculateHealth(
      makeCustomer({
        payment: [0.95, 0.95, 0.95, 0.95, 0.8, 0.7, 0.6, 0.5],
        occupancy: [0.8, 0.8, 0.8, 0.8, 0.5, 0.4, 0.3, 0.2],
        daysSinceContact: 90,
        openTickets: 10,
      }),
      ASOF,
    );
    expect(h.score).toBe(0);
    expect(h.status).toBe("rot");
  });
});

describe("Helfer", () => {
  it("statusFromScore: 85 grün, 84 gelb, 50 gelb, 49 rot", () => {
    expect([85, 84, 50, 49].map(statusFromScore)).toEqual(["gruen", "gelb", "gelb", "rot"]);
  });

  it("countDecliningWeeks zählt nur die Abwärtsserie am Ende", () => {
    expect(countDecliningWeeks([0.9, 0.8, 0.85, 0.84, 0.83])).toBe(2);
    expect(countDecliningWeeks([0.9, 0.91])).toBe(0);
  });

  it("readiness zählt erledigte Checklisten-Punkte", () => {
    expect(readiness(["vertrag-signed", "vertrag-contact", "gibt-es-nicht"])).toEqual({ done: 2, total: 13, percent: 15 });
  });
});

describe("Beispieldaten (Schutz gegen versehentliche Änderungen)", () => {
  const { asOf, customers } = data as CustomerData;

  it("ergibt 12 grün, 5 gelb, 3 rot", () => {
    const counts = { gruen: 0, gelb: 0, rot: 0 };
    for (const c of customers) counts[calculateHealth(c, asOf).status]++;
    expect(counts).toEqual({ gruen: 12, gelb: 5, rot: 3 });
  });

  it("dringendste zuerst: die drei roten Kunden oben, Klinik Ammertal ganz oben", () => {
    const top3 = sortByUrgency(customers, asOf).slice(0, 3).map((c) => c.id);
    // c03 (620 Plätze) und c10 (40 Plätze) haben beide 45 Punkte: der größere kommt zuerst
    expect(top3).toEqual(["c07", "c03", "c10"]);
  });
});
