import type { OnboardingPhase } from "./types";

// Das "vorgedruckte Formular": Diese Checkliste ist für alle Kunden gleich.
// Beim Kunden selbst stehen nur die IDs der erledigten Punkte (onboarding.done).

export interface ChecklistItem {
  id: string;
  phase: OnboardingPhase;
  label: string;
}

export const PHASES: { id: OnboardingPhase; label: string }[] = [
  { id: "vertrag", label: "Vertrag" },
  { id: "installation", label: "Installation" },
  { id: "testbetrieb", label: "Testbetrieb" },
  { id: "live", label: "Live" },
];

export const CHECKLIST: ChecklistItem[] = [
  { id: "vertrag-signed", phase: "vertrag", label: "Vertrag unterschrieben" },
  { id: "vertrag-contact", phase: "vertrag", label: "Ansprechperson benannt" },
  { id: "vertrag-rules", phase: "vertrag", label: "Parkregeln festgelegt (z. B. 90 Min. frei)" },

  { id: "install-survey", phase: "installation", label: "Standortbegehung erledigt" },
  { id: "install-cameras", phase: "installation", label: "Kameras montiert" },
  { id: "install-signs", phase: "installation", label: "Beschilderung aufgestellt" },
  { id: "install-payment", phase: "installation", label: "Zahlungsautomat bzw. QR-Code installiert" },

  { id: "test-recognition", phase: "testbetrieb", label: "Kennzeichenerkennung geprüft" },
  { id: "test-payments", phase: "testbetrieb", label: "Testzahlungen erfolgreich" },
  { id: "test-exceptions", phase: "testbetrieb", label: "Ausnahmeliste hinterlegt (z. B. Mitarbeitende, Lieferanten)" },
  { id: "test-training", phase: "testbetrieb", label: "Team des Kunden eingewiesen" },

  { id: "live-announced", phase: "live", label: "Go-live an Parkende kommuniziert" },
  { id: "live-review30", phase: "live", label: "Review-Gespräch nach 30 Tagen" },
];
