import { useEffect, useMemo, useState } from "react";
import data from "../data/customers.json";
import type { CustomerData } from "./lib/types";
import { applyFilters, buildViews, NO_FILTERS, portfolioKpis, type Filters } from "./lib/view";
import { useHashSelection } from "./lib/useHashSelection";
import { formatDate } from "./lib/format";
import { TopBar } from "./components/TopBar";
import { KpiBar } from "./components/KpiBar";
import { FilterBar } from "./components/FilterBar";
import { CustomerList } from "./components/CustomerList";
import { CustomerDetail } from "./components/CustomerDetail";

const { asOf, customers } = data as CustomerData;
const views = buildViews(customers, asOf);
const kpis = portfolioKpis(views);
const attention = kpis.rot + kpis.gelb;

// Desktop: Die Detailspalte bleibt oben stehen, ist höchstens so hoch wie das Fenster
// und hat einen eigenen Scrollbereich. So lässt sie sich unabhängig von der Liste scrollen.
// Ist ihr Ende erreicht, scrollt die Seite weiter (kein "Festhängen" ganz oben auf der Seite).
const DESKTOP_PANE =
  "detail-pane lg:sticky lg:top-20 lg:max-h-[calc(100dvh-6rem)] lg:overflow-y-auto lg:overscroll-auto lg:rounded-[22px]";

export default function App() {
  const [filters, setFilters] = useState<Filters>(NO_FILTERS);
  const [selectedId, select] = useHashSelection();
  const visible = useMemo(() => applyFilters(views, filters), [filters]);

  // Desktop: Ohne Auswahl zeigt die Detailspalte den dringendsten sichtbaren Kunden.
  // Handy: Die Detailansicht öffnet sich erst nach einem Tipp, als eigene Seite über der Liste.
  const selected = views.find((v) => v.id === selectedId) ?? null;
  const shown = selected ?? visible[0] ?? null;

  // Blendet ein Filter den geöffneten Kunden aus, wird die Auswahl aufgehoben.
  const changeFilters = (f: Filters) => {
    setFilters(f);
    if (selected && !applyFilters([selected], f).length) select(null);
  };

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && select(null);
    window.addEventListener("keydown", onKey);
    const mobile = window.matchMedia("(max-width: 1023px)").matches;
    if (mobile) document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [selected, select]);

  // Neuer Kunde in der Detailansicht: deren Scrollbereich wieder nach oben setzen
  useEffect(() => {
    document.getElementById("detail-scroll")?.scrollTo(0, 0);
  }, [shown?.id]);

  return (
    <>
      <TopBar />

      <main className="mx-auto max-w-[1360px] px-4 sm:px-7">
        <header className="pb-4 pt-5 sm:pb-5 sm:pt-7">
          <p className="eyebrow">Customer Success · Paid Parking</p>
          <h1 className="mt-2 text-[26px] font-extrabold leading-[1.12] tracking-[-0.035em] sm:text-[34px]">
            Wer braucht <span className="gradient-text">heute</span> Aufmerksamkeit?
          </h1>
          <p className="mt-1 text-[15px] text-mut">
            {attention} von {kpis.total} Kunden brauchen Aufmerksamkeit. Jede Ampel mit Begründung.
          </p>
        </header>

        <KpiBar kpis={kpis} />

        <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,1fr)]">
          <section className="glass overflow-hidden" aria-label="Kundenliste">
            <FilterBar filters={filters} onChange={changeFilters} resultCount={visible.length} />
            <CustomerList views={visible} selectedId={selected?.id ?? null} fallbackId={shown?.id ?? null} onSelect={select} />
          </section>

          {shown && (
            <aside
              id="detail-scroll"
              aria-label="Kundendetails"
              className={
                selected
                  ? `overlay-bg fixed inset-0 z-30 overflow-y-auto overscroll-contain p-3 sm:p-6 lg:z-auto lg:bg-transparent lg:p-0 lg:backdrop-filter-none ${DESKTOP_PANE}`
                  : `hidden lg:block ${DESKTOP_PANE}`
              }
            >
              <CustomerDetail v={shown} asOf={asOf} onClose={() => select(null)} />
            </aside>
          )}
        </div>

        <footer className="py-7 font-mono text-[11.5px] text-dim">
          Prototyp von Noel Gruber · Beispieldaten · nicht mit Wemolo verbunden · Datenstand {formatDate(asOf, "short")}
        </footer>
      </main>
    </>
  );
}
