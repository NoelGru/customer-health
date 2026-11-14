import { useEffect, useRef, useState } from "react";
import aiData from "../../data/ai-texts.json";
import type { AiTextData } from "../lib/types";
import { formatDate } from "../lib/format";
import type { CustomerView } from "../lib/view";

// Die Texte wurden einmalig beim Bauen mit Claude erzeugt (data/ai-texts.json).
// Der Button simuliert nur die Wartezeit, es gibt keinen API-Aufruf und keine Kosten.
const { texts } = aiData as AiTextData;

export const hasAiText = (id: string) => id in texts;

type Phase = "idle" | "loading" | "done";

function Sparkle({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={`size-4 ${className}`} fill="currentColor">
      <path d="M12 2l1.9 5.6L19.5 9.5l-5.6 1.9L12 17l-1.9-5.6L4.5 9.5l5.6-1.9L12 2zm7 11l.9 2.6 2.6.9-2.6.9L19 20l-.9-2.6-2.6-.9 2.6-.9L19 13z" />
    </svg>
  );
}

function Hint() {
  return (
    <p className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-dim">
      <Sparkle className="size-3 text-accent" /> Text vorab mit Claude erzeugt
    </p>
  );
}

export function AiReport({ v, asOf }: { v: CustomerView; asOf: string }) {
  const text = texts[v.id];
  const [phase, setPhase] = useState<Phase>("idle");
  const [tab, setTab] = useState<"report" | "email">("report");
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  if (!text) return null;

  const start = () => {
    setPhase("loading");
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    timer.current = window.setTimeout(() => setPhase("done"), reduced ? 300 : 1600);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(`Betreff: ${text.email.subject}\n\n${text.email.body}`);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (phase === "idle") {
    return (
      <div>
        <button
          type="button"
          onClick={start}
          className="inline-flex items-center gap-2.5 rounded-full bg-ink px-[22px] py-3 text-[14.5px] font-semibold text-white shadow-[0_10px_24px_-12px_rgb(80_70_232/0.7)] transition-transform hover:-translate-y-px active:translate-y-0"
        >
          <Sparkle className="text-[#a39dff]" /> Bericht &amp; Mail-Entwurf
        </button>
        <div><Hint /></div>
      </div>
    );
  }

  if (phase === "loading") {
    return (
      <div className="glass-inner rounded-2xl p-4" role="status" aria-live="polite">
        <p className="flex items-center gap-2 text-[13px] font-medium text-accent-2">
          <Sparkle className="animate-spin [animation-duration:2.4s]" />
          Bericht und Mail-Entwurf werden erstellt …
        </p>
        <div className="mt-3 space-y-2" aria-hidden>
          {["w-full", "w-11/12", "w-4/5", "w-2/3"].map((w, i) => (
            <div key={i} className={`shimmer h-2.5 rounded-full ${w}`} style={{ animationDelay: `${i * 120}ms` }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-up">
      <div className="mb-3 inline-flex rounded-full bg-fill p-[3px]" role="tablist" aria-label="Bericht oder Mail">
        {([["report", "Monatsbericht"], ["email", "Mail-Entwurf"]] as const).map(([id, label]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-full px-3.5 py-1.5 font-medium transition-colors ${tab === id ? "bg-ink text-white" : "text-mut hover:text-ink"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "report" ? (
        <div className="glass-inner rounded-2xl p-4" role="tabpanel">
          <p className="font-mono text-[10.5px] uppercase tracking-[0.1em] text-dim">Monatsbericht · Stand {formatDate(asOf, "short")}</p>
          <p className="mt-2 text-[14px] leading-relaxed text-ink-2">{text.report.summary}</p>
          <p className="mt-4 text-[13px] font-semibold text-ink">Empfehlungen</p>
          <ol className="mt-1.5 space-y-1.5">
            {text.report.recommendations.map((r, i) => (
              <li key={i} className="flex gap-2.5 text-[13.5px] text-ink-2">
                <span className="grid size-5 flex-none place-items-center rounded-md bg-accent-soft font-mono text-[11px] text-accent-2">{i + 1}</span>
                {r}
              </li>
            ))}
          </ol>
        </div>
      ) : (
        <div className="glass-inner rounded-2xl" role="tabpanel">
          <dl className="space-y-1 border-b border-line px-4 py-3 text-[13px]">
            <div className="flex gap-2"><dt className="w-16 flex-none text-dim">An</dt><dd className="text-ink-2">{v.contact.name} · {v.contact.role}</dd></div>
            <div className="flex gap-2"><dt className="w-16 flex-none text-dim">Betreff</dt><dd className="font-semibold text-ink">{text.email.subject}</dd></div>
          </dl>
          <p className="whitespace-pre-line px-4 py-3 text-[14px] leading-relaxed text-ink-2">{text.email.body}</p>
          <div className="flex justify-end border-t border-line px-3 py-2.5">
            <button type="button" onClick={copyEmail} className="rounded-full border border-line bg-white px-3.5 py-1.5 text-[13px] font-medium text-ink-2 hover:border-accent/40">
              {copied ? "Kopiert ✓" : "Text kopieren"}
            </button>
          </div>
        </div>
      )}
      <Hint />
    </div>
  );
}
