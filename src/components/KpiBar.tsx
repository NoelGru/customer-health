import { formatPercent } from "../lib/health";
import type { PortfolioKpis } from "../lib/view";

function Kpi({ label, value, sub, highlight, valueClass = "" }: { label: string; value: string | number; sub: string; highlight?: boolean; valueClass?: string }) {
  return (
    <div
      className={`glass rounded-2xl! px-[18px] py-4 ${highlight ? "bg-[linear-gradient(150deg,rgb(80_70_232/0.2),rgb(56_150_255/0.1)_60%,rgb(255_255_255/0.5))]!" : ""}`}
    >
      <p className="eyebrow">{label}</p>
      <div className={`mt-1.5 text-[28px] font-extrabold leading-tight tracking-[-0.045em] tabular-nums sm:text-[32px] ${valueClass}`}>{value}</div>
      <div className="text-[13px] text-mut">{sub}</div>
    </div>
  );
}

export function KpiBar({ kpis }: { kpis: PortfolioKpis }) {
  return (
    <div className="mb-[18px] grid grid-cols-2 gap-2.5 sm:gap-3.5 lg:grid-cols-4">
      <Kpi label="Kunden" value={kpis.total} sub="Parkflächen gesamt" />
      <Kpi label="Gefährdet" value={kpis.rot} sub={`+ ${kpis.gelb} beobachten`} highlight valueClass="text-rot" />
      <Kpi label="Onboarding" value={kpis.onboarding} sub="noch nicht live" />
      <Kpi label="Ø Zahlungsquote" value={formatPercent(kpis.avgPayment)} sub="letzte Woche, live" />
    </div>
  );
}
