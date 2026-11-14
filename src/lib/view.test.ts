import { describe, expect, it } from "vitest";
import data from "../../data/customers.json";
import type { CustomerData } from "./types";
import { applyFilters, buildViews, NO_FILTERS, portfolioKpis } from "./view";
import { formatPercent } from "./health";
import { formatDate, isoWeek } from "./format";

const { asOf, customers } = data as CustomerData;
const views = buildViews(customers, asOf);

describe("Ansichtslogik", () => {
  it("ohne Filter: alle 20 Kunden, dringendster zuerst", () => {
    const list = applyFilters(views, NO_FILTERS);
    expect(list).toHaveLength(20);
    expect(list[0].name).toBe("Kreisklinikum Ammertal");
  });

  it("Filter lassen sich kombinieren", () => {
    expect(applyFilters(views, { ...NO_FILTERS, status: "rot" })).toHaveLength(3);
    expect(applyFilters(views, { ...NO_FILTERS, segment: "klinik" })).toHaveLength(4);
    expect(applyFilters(views, { ...NO_FILTERS, phase: "installation" }).map((v) => v.id)).toEqual(["c10", "c17"]);
    expect(applyFilters(views, { status: "gelb", segment: "klinik", phase: "alle" }).map((v) => v.id)).toEqual(["c18", "c14"]);
  });

  it("Kennzahlen für die Kopfzeile", () => {
    const k = portfolioKpis(views);
    expect(k).toMatchObject({ total: 20, rot: 3, gelb: 5, onboarding: 5 });
    expect(formatPercent(k.avgPayment)).toBe("90 %");
  });
});

describe("Formatierung", () => {
  it("Kalenderwochen und Datum", () => {
    expect(isoWeek("2026-09-14")).toBe(38);
    expect(isoWeek("2026-11-02")).toBe(45);
    expect(formatDate("2026-11-09")).toBe("9. November 2026");
  });
});
