import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { isoWeek } from "../lib/format";
import type { WeeklyValue } from "../lib/types";

const PAYMENT = "#5046e8";
const OCCUPANCY = "#3896ff";
const AXIS = { fontSize: 10, fill: "#7c7c88", fontFamily: "JetBrains Mono, monospace" };

/** 8-Wochen-Verlauf von Zahlungsquote (durchgezogen) und Auslastung (gestrichelt) */
export function TrendChart({ weekly }: { weekly: WeeklyValue[] }) {
  const data = weekly.map((w) => ({
    kw: `KW ${isoWeek(w.week)}`,
    payment: Math.round(w.paymentRate * 100),
    occupancy: Math.round(w.occupancy * 100),
  }));
  // Untere Grenze der Achse: nächstkleinerer Zehner unter dem kleinsten Wert, höchstens 40 %
  const min = Math.min(40, ...data.map((d) => Math.floor(Math.min(d.payment, d.occupancy) / 10) * 10));

  return (
    <div className="glass-inner rounded-2xl px-2 pb-1.5 pt-3">
      <div className="flex gap-3.5 px-3 pb-1.5 text-xs text-mut">
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: PAYMENT }} />Zahlungsquote</span>
        <span className="inline-flex items-center gap-1.5"><i className="size-2.5 rounded-[3px]" style={{ background: OCCUPANCY }} />Auslastung</span>
      </div>
      <ResponsiveContainer width="100%" height={190}>
        <LineChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -8 }}>
          <CartesianGrid vertical={false} stroke="rgb(18 18 30 / 0.08)" />
          <XAxis dataKey="kw" tick={AXIS} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis domain={[min, 100]} tick={AXIS} tickLine={false} axisLine={false} tickFormatter={(v) => `${v} %`} width={48} ticks={[min, (min + 100) / 2, 100]} />
          <Tooltip
            formatter={(value, name) => [`${value} %`, name === "payment" ? "Zahlungsquote" : "Auslastung"]}
            contentStyle={{ borderRadius: 12, border: "1px solid rgb(18 18 30 / 0.1)", boxShadow: "0 12px 24px -12px rgb(40 34 120 / 0.35)", fontSize: 12 }}
            labelStyle={{ fontFamily: "JetBrains Mono, monospace", fontSize: 11, color: "#535360" }}
          />
          <Line type="monotone" dataKey="payment" stroke={PAYMENT} strokeWidth={2.5} dot={false} activeDot={{ r: 4 }} />
          <Line type="monotone" dataKey="occupancy" stroke={OCCUPANCY} strokeWidth={2.5} strokeDasharray="5 4" dot={false} activeDot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
