import type { HealthStatus } from "../lib/health";
import { PHASES } from "../lib/onboarding";
import type { OnboardingPhase, Segment } from "../lib/types";
import { NO_FILTERS, SEGMENT_LABEL, STATUS_COLOR, type Filters } from "../lib/view";

const STATUS_OPTIONS: { id: HealthStatus | "alle"; label: string }[] = [
  { id: "alle", label: "Alle" },
  { id: "rot", label: "Rot" },
  { id: "gelb", label: "Gelb" },
  { id: "gruen", label: "Grün" },
];

const selectClass = "glass-inner rounded-full py-[7px] pl-3.5 pr-8 text-ink-2 outline-none focus-visible:ring-2 focus-visible:ring-accent/40";

interface Props {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}

export function FilterBar({ filters, onChange, resultCount }: Props) {
  const active = filters.status !== "alle" || filters.segment !== "alle" || filters.phase !== "alle";

  return (
    <div className="flex flex-wrap items-center gap-2 px-4 pb-3 pt-3.5">
      <div className="inline-flex rounded-full bg-fill p-[3px]" role="group" aria-label="Nach Ampel filtern">
        {STATUS_OPTIONS.map((o) => {
          const on = filters.status === o.id;
          return (
            <button
              key={o.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...filters, status: o.id })}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-medium transition-colors ${on ? "bg-ink text-white" : "text-mut hover:text-ink"}`}
            >
              {o.id !== "alle" && <span className="size-[7px] rounded-full" style={{ background: STATUS_COLOR[o.id] }} />}
              {o.label}
            </button>
          );
        })}
      </div>

      <select
        aria-label="Nach Segment filtern"
        className={selectClass}
        value={filters.segment}
        onChange={(e) => onChange({ ...filters, segment: e.target.value as Segment | "alle" })}
      >
        <option value="alle">Alle Segmente</option>
        {Object.entries(SEGMENT_LABEL).map(([id, label]) => (
          <option key={id} value={id}>{label}</option>
        ))}
      </select>

      <select
        aria-label="Nach Onboarding-Phase filtern"
        className={selectClass}
        value={filters.phase}
        onChange={(e) => onChange({ ...filters, phase: e.target.value as OnboardingPhase | "alle" })}
      >
        <option value="alle">Alle Phasen</option>
        {PHASES.map((p) => (
          <option key={p.id} value={p.id}>{p.label}</option>
        ))}
      </select>

      {active && (
        <button type="button" onClick={() => onChange(NO_FILTERS)} className="px-2 text-[13px] font-medium text-accent-2 hover:underline">
          Zurücksetzen
        </button>
      )}

      <span className="w-full font-mono text-[10.5px] uppercase tracking-[0.08em] text-dim md:ml-auto md:w-auto">
        {resultCount} {resultCount === 1 ? "Kunde" : "Kunden"} · ↓ Dringendste zuerst
      </span>
    </div>
  );
}
