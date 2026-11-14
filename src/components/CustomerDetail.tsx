import type { ReactNode } from "react";
import { formatDate } from "../lib/format";
import { SEGMENT_LABEL, type CustomerView } from "../lib/view";
import { AiReport, hasAiText } from "./AiReport";
import { ReadinessChecklist } from "./ReadinessChecklist";
import { ScoreRing, StatusChip } from "./ScoreBadge";
import { TrendChart } from "./TrendChart";

const WHY: Record<CustomerView["health"]["status"], string> = { rot: "Warum rot?", gelb: "Warum gelb?", gruen: "Warum grün?" };

function Section({ n, title, children }: { n: number; title: string; children: ReactNode }) {
  return (
    <section className="mt-[22px]">
      <h3 className="eyebrow mb-2.5 flex items-center gap-2">
        <span className="grid size-5 place-items-center rounded-md bg-accent-soft text-[11px] tracking-normal">{n}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

function Fact({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <dt className="font-mono text-[10px] uppercase tracking-[0.1em] text-dim">{label}</dt>
      <dd className="text-[13px] font-medium text-ink-2">{value}</dd>
    </div>
  );
}

interface Props {
  v: CustomerView;
  asOf: string;
  /** Nur auf dem Handy sichtbar: zurück zur Liste */
  onClose: () => void;
}

export function CustomerDetail({ v, asOf, onClose }: Props) {
  const isLive = v.onboarding.phase === "live";
  const overdue = !isLive && v.goLiveDate < asOf; // ISO-Daten lassen sich als Text vergleichen
  const withAi = hasAiText(v.id); // nur gelbe und rote Kunden haben Bericht und Mail

  return (
    <article className="glass p-[18px] sm:p-6" aria-labelledby="detail-title">
      <button type="button" onClick={onClose} className="mb-3 inline-flex items-center gap-1.5 text-[13px] font-medium text-accent-2 lg:hidden">
        ← Zur Übersicht
      </button>

      <header className="flex items-center gap-4">
        <ScoreRing score={v.health.score} status={v.health.status} />
        <div className="min-w-0">
          <StatusChip status={v.health.status} />
          <h2 id="detail-title" className="mt-1.5 text-[20px] font-bold leading-tight tracking-[-0.03em] sm:text-[22px]">{v.name}</h2>
          <p className="text-[12.5px] text-mut">{SEGMENT_LABEL[v.segment]} · {v.city} · {v.spaces} Stellplätze</p>
        </div>
      </header>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-y border-line py-3 sm:grid-cols-4">
        <Fact label="Ansprechperson" value={<>{v.contact.name}<span className="block text-[12px] font-normal text-mut">{v.contact.role}</span></>} />
        <Fact
          label={isLive ? "Live seit" : "Go-live geplant"}
          value={<>{formatDate(v.goLiveDate, "short")}{overdue && <span className="block text-[12px] font-semibold text-rot">überfällig</span>}</>}
        />
        <Fact label="Letzter Kontakt" value={`vor ${v.daysSinceContact} Tagen`} />
        <Fact label="Offene Tickets" value={v.openTickets} />
      </dl>

      <Section n={1} title="Verlauf · 8 Wochen">
        {v.weekly.length > 0 ? (
          <TrendChart weekly={v.weekly} />
        ) : (
          <p className="border-l-2 border-accent/35 pl-3 text-[13px] text-mut">Noch keine Betriebsdaten: Der Kunde ist im Onboarding.</p>
        )}
      </Section>

      <Section n={2} title={WHY[v.health.status]}>
        {v.health.reasons.length > 0 ? (
          <ul className="grid gap-1.5">
            {v.health.reasons.map((r) => (
              <li key={r.rule} className="glass-inner flex items-baseline gap-2.5 rounded-[10px] px-3 py-2.5 text-[13.5px]">
                <b className="flex-none rounded-md bg-rot/8 px-1.5 py-px font-mono text-[11.5px] font-medium text-rot">{r.points}</b>
                {r.text}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13.5px] text-mut">Keine Auffälligkeiten, alle Regeln im grünen Bereich.</p>
        )}
      </Section>

      <Section n={3} title="Nächster Schritt">
        <div className="rounded-2xl border border-accent/30 bg-[linear-gradient(150deg,rgb(80_70_232/0.2),rgb(56_150_255/0.1)_60%,rgb(255_138_76/0.1))] px-4 py-3.5 text-sm text-ink-2">
          <strong className="text-accent-2">Empfehlung:</strong> {v.health.nextStep}
        </div>
      </Section>

      {withAi && (
        <Section n={4} title="Bericht & Mail">
          <AiReport key={v.id} v={v} asOf={asOf} />
        </Section>
      )}

      <Section n={withAi ? 5 : 4} title={`Readiness · ${v.readiness.done}/${v.readiness.total}`}>
        <ReadinessChecklist v={v} />
      </Section>

      <section className="mt-[22px]">
        <h3 className="eyebrow mb-2">Letzte Notiz</h3>
        <p className="border-l-2 border-accent/35 pl-3 text-[13px] text-mut">{v.note}</p>
      </section>
    </article>
  );
}
