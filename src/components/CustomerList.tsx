import { PHASES } from "../lib/onboarding";
import { SEGMENT_LABEL, type CustomerView } from "../lib/view";
import { ScoreBadge } from "./ScoreBadge";

const phaseLabel = (v: CustomerView) => PHASES.find((p) => p.id === v.onboarding.phase)?.label;

function PhaseTag({ v }: { v: CustomerView }) {
  return <span className="inline-block whitespace-nowrap rounded-full bg-fill px-2.5 py-0.5 text-[11.5px] font-medium text-ink-2">{phaseLabel(v)}</span>;
}

function MainReason({ v }: { v: CustomerView }) {
  return v.health.reasons[0] ? (
    <span className="line-clamp-2 text-[13.5px] text-ink-2">{v.health.reasons[0].text}</span>
  ) : (
    <span className="text-[13px] text-mut">Keine Auffälligkeiten</span>
  );
}

interface Props {
  views: CustomerView[];
  /** Vom Nutzer gewählter Kunde */
  selectedId: string | null;
  /** Kunde, den die Detailspalte ohne Auswahl zeigt (nur auf breiten Bildschirmen markiert) */
  fallbackId: string | null;
  onSelect: (id: string) => void;
}

const SEL = "bg-accent-soft shadow-[inset_3px_0_0_var(--color-accent)]";
const SEL_WIDE = "lg:bg-accent-soft lg:shadow-[inset_3px_0_0_var(--color-accent)]";

export function CustomerList({ views, selectedId, fallbackId, onSelect }: Props) {
  if (views.length === 0) {
    return <p className="border-t border-line px-4 py-10 text-center text-mut">Kein Kunde passt zu diesen Filtern.</p>;
  }

  return (
    <>
      {/* Ab Tablet-Breite: Tabelle */}
      <table className="hidden w-full border-collapse md:table">
        <thead>
          <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.1em] text-dim">
            <th className="px-4 py-2 font-medium">Kunde</th>
            <th className="hidden px-4 py-2 font-medium xl:table-cell">Segment</th>
            <th className="px-4 py-2 font-medium">Phase</th>
            <th className="px-4 py-2 font-medium">Hauptgrund</th>
            <th className="px-4 py-2 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {views.map((v) => {
            const sel = v.id === selectedId;
            const fallback = !selectedId && v.id === fallbackId;
            return (
              <tr
                key={v.id}
                onClick={() => onSelect(v.id)}
                aria-current={sel || undefined}
                className={`cursor-pointer border-t border-line align-top transition-colors ${sel ? SEL : fallback ? `${SEL_WIDE} hover:bg-white/55` : "hover:bg-white/55"}`}
              >
                <td className="px-4 py-3">
                  <button type="button" className="text-left font-semibold outline-none focus-visible:underline" onClick={(e) => { e.stopPropagation(); onSelect(v.id); }}>
                    {v.name}
                  </button>
                  <div className="text-[12.5px] text-mut">
                    <span className="xl:hidden">{SEGMENT_LABEL[v.segment]} · </span>
                    {v.city} · {v.spaces} Plätze
                  </div>
                </td>
                <td className="hidden whitespace-nowrap px-4 py-3 text-[13px] text-mut xl:table-cell">{SEGMENT_LABEL[v.segment]}</td>
                <td className="px-4 py-3"><PhaseTag v={v} /></td>
                <td className="max-w-[380px] px-4 py-3"><MainReason v={v} /></td>
                <td className="px-4 py-3 text-right"><ScoreBadge score={v.health.score} status={v.health.status} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Handy: Karten */}
      <ul className="md:hidden">
        {views.map((v) => {
          const sel = v.id === selectedId;
          return (
            <li key={v.id} className="border-t border-line">
              <button
                type="button"
                onClick={() => onSelect(v.id)}
                aria-current={sel || undefined}
                className={`grid w-full grid-cols-[minmax(0,1fr)_auto] gap-x-3 gap-y-1 px-4 py-3 text-left ${sel ? SEL : ""}`}
              >
                <span>
                  <span className="block font-semibold">{v.name}</span>
                  <span className="text-[12.5px] text-mut">{SEGMENT_LABEL[v.segment]} · {v.city} </span>
                  <PhaseTag v={v} />
                </span>
                <ScoreBadge score={v.health.score} status={v.health.status} />
                <span className="col-span-2"><MainReason v={v} /></span>
              </button>
            </li>
          );
        })}
      </ul>
    </>
  );
}
