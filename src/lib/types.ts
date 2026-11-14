// Das Datenmodell: So sieht eine "Karteikarte" pro Kunde aus.
// Details und Begründungen: docs/PLAN.md, Abschnitt 2.

export type Segment = "supermarkt" | "klinik" | "hotel" | "fitness" | "shopping";

export type OnboardingPhase = "vertrag" | "installation" | "testbetrieb" | "live";

export interface WeeklyValue {
  /** Montag der Woche, z. B. "2026-09-14" */
  week: string;
  /** Durchschnittliche Auslastung der Fläche, 0 bis 1 */
  occupancy: number;
  /** Anteil korrekt bezahlter Parkvorgänge, 0 bis 1 */
  paymentRate: number;
}

export interface Contact {
  name: string;
  role: string;
  /** Anrede für den Mail-Entwurf */
  salutation: "du" | "sie";
}

export interface Customer {
  id: string;
  name: string;
  segment: Segment;
  city: string;
  spaces: number;
  contact: Contact;
  onboarding: {
    phase: OnboardingPhase;
    /** Seit wann der Kunde in dieser Phase ist (ISO-Datum) */
    phaseSince: string;
    /** IDs der erledigten Checklisten-Punkte (siehe onboarding.ts) */
    done: string[];
  };
  /** Tatsächliches oder geplantes Go-live (ISO-Datum) */
  goLiveDate: string;
  /** 8 Wochenwerte, älteste zuerst. Leer, solange der Kunde nicht live ist. */
  weekly: WeeklyValue[];
  openTickets: number;
  daysSinceContact: number;
  /** Letzte Notiz aus dem Kundenkontakt, wie in einem CRM */
  note: string;
}

/** Vorab erzeugter Bericht und Mail-Entwurf für einen gefährdeten Kunden (data/ai-texts.json) */
export interface AiText {
  report: {
    /** 3 bis 5 Sätze */
    summary: string;
    /** 2 bis 3 Empfehlungen */
    recommendations: string[];
  };
  email: {
    subject: string;
    body: string;
  };
}

export interface AiTextData {
  generatedAt: string;
  source: string;
  texts: Record<string, AiText>;
}

export interface CustomerData {
  /** Stichtag der Daten (ISO-Datum) */
  asOf: string;
  customers: Customer[];
}
