import { CHECKLIST, PHASES } from "../lib/onboarding";
import type { CustomerView } from "../lib/view";

/** Fortschritt je Phase als Balken, darunter offene Punkte und die ganze Checkliste zum Aufklappen */
export function ReadinessChecklist({ v }: { v: CustomerView }) {
  const done = new Set(v.onboarding.done);
  // "Offen" zeigt nur die Punkte der aktuellen Phase: Das ist, woran gerade gearbeitet wird.
  const phase = v.onboarding.phase;
  const phaseLabel = PHASES.find((p) => p.id === phase)?.label;
  const open = CHECKLIST.filter((i) => i.phase === phase && !done.has(i.id));

  return (
    <div>
      <div className="grid grid-cols-4 gap-1.5">
        {PHASES.map((p) => {
          const items = CHECKLIST.filter((i) => i.phase === p.id);
          const share = items.filter((i) => done.has(i.id)).length / items.length;
          const current = p.id === v.onboarding.phase;
          return (
            <div key={p.id} className={`text-xs ${current ? "font-semibold text-ink" : "text-mut"}`}>
              <div className="mb-1.5 h-1.5 overflow-hidden rounded-full bg-fill">
                <div className="h-full rounded-full bg-gradient-to-r from-accent to-blue" style={{ width: `${share * 100}%` }} />
              </div>
              {p.label}
            </div>
          );
        })}
      </div>

      {open.length > 0 && (
        <p className="mt-2.5 text-[12.5px] text-mut">
          <span className="font-semibold text-ink-2">Offen in Phase {phaseLabel}:</span> {open.map((i) => i.label).join(" · ")}
        </p>
      )}

      <details className="group mt-2.5">
        <summary className="cursor-pointer list-none text-[12.5px] font-medium text-accent-2 hover:underline">
          <span className="group-open:hidden">Ganze Checkliste anzeigen</span>
          <span className="hidden group-open:inline">Checkliste ausblenden</span>
        </summary>
        <div className="mt-2 grid gap-x-6 gap-y-3 sm:grid-cols-2">
          {PHASES.map((p) => (
            <div key={p.id}>
              <p className="mb-1 font-mono text-[10.5px] uppercase tracking-[0.1em] text-dim">{p.label}</p>
              <ul className="space-y-0.5">
                {CHECKLIST.filter((i) => i.phase === p.id).map((i) => (
                  <li key={i.id} className={`flex gap-2 text-[13px] ${done.has(i.id) ? "text-mut" : "text-ink"}`}>
                    <span aria-hidden className={done.has(i.id) ? "text-gruen" : "text-dim"}>{done.has(i.id) ? "✓" : "○"}</span>
                    <span>
                      {i.label}
                      <span className="sr-only">{done.has(i.id) ? " (erledigt)" : " (offen)"}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </details>
    </div>
  );
}
