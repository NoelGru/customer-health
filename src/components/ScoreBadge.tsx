import type { HealthStatus } from "../lib/health";
import { STATUS_COLOR, STATUS_LABEL } from "../lib/view";

/** Score als farbiges Kästchen (Übersicht) */
export function ScoreBadge({ score, status }: { score: number; status: HealthStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      title={`${STATUS_LABEL[status]} · Score ${score} von 100`}
      className="inline-grid h-[30px] min-w-10 place-items-center rounded-[9px] px-2 text-sm font-bold tabular-nums"
      style={{ color: `color-mix(in srgb, ${c} 82%, #000)`, background: `color-mix(in srgb, ${c} 12%, transparent)` }}
    >
      {score}
    </span>
  );
}

/** Score als Ring (Detailansicht): Der farbige Anteil entspricht dem Score */
export function ScoreRing({ score, status }: { score: number; status: HealthStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <div
      role="img"
      aria-label={`Score ${score} von 100`}
      className="grid size-16 flex-none place-items-center rounded-full sm:size-[72px]"
      style={{ background: `conic-gradient(${c} ${score}%, rgb(18 18 30 / 0.07) 0)`, boxShadow: `0 10px 24px -14px ${c}` }}
    >
      <span className="grid size-[51px] place-items-center rounded-full bg-white text-[19px] font-extrabold tracking-tight tabular-nums sm:size-[58px] sm:text-[21px]">
        {score}
      </span>
    </div>
  );
}

/** Kleines Etikett "Gefährdet / Beobachten / Stabil" */
export function StatusChip({ status }: { status: HealthStatus }) {
  const c = STATUS_COLOR[status];
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11.5px] font-semibold"
      style={{ color: c, background: `color-mix(in srgb, ${c} 11%, transparent)` }}
    >
      <span className="size-1.5 rounded-full" style={{ background: c }} />
      {STATUS_LABEL[status]}
    </span>
  );
}
