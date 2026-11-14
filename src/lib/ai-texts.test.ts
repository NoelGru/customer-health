// Qualitätsprüfung der vorab erzeugten Texte. Wie ein Lektorat, nur automatisch.
import { describe, expect, it } from "vitest";
import customerData from "../../data/customers.json";
import aiData from "../../data/ai-texts.json";
import type { AiTextData, CustomerData } from "./types";
import { calculateHealth } from "./health";

const { asOf, customers } = customerData as CustomerData;
const { texts } = aiData as AiTextData;
const atRisk = customers.filter((c) => calculateHealth(c, asOf).status !== "gruen");

// Satzende = Punkt/!/? nach einem Nicht-Ziffer-Zeichen, damit "19. Oktober" nicht als Satzende zählt
const sentences = (s: string) => s.split(/(?<=[^\d\s][.!?])\s+(?=[A-ZÄÖÜ])/).length;
const allText = (id: string) => {
  const t = texts[id];
  return [t.report.summary, ...t.report.recommendations, t.email.subject, t.email.body].join("\n");
};

describe("Vorab erzeugte Texte", () => {
  it("es gibt genau für jeden gelben und roten Kunden einen Text", () => {
    expect(Object.keys(texts).sort()).toEqual(atRisk.map((c) => c.id).sort());
  });

  it.each(atRisk.map((c) => [c.name, c] as const))("%s: Länge passt (3 bis 5 Sätze, 2 bis 3 Empfehlungen)", (_, c) => {
    const t = texts[c.id];
    expect(sentences(t.report.summary)).toBeGreaterThanOrEqual(3);
    expect(sentences(t.report.summary)).toBeLessThanOrEqual(5);
    expect(t.report.recommendations.length).toBeGreaterThanOrEqual(2);
    expect(t.report.recommendations.length).toBeLessThanOrEqual(3);
  });

  it.each(atRisk.map((c) => [c.name, c] as const))("%s: Anrede passt (Du oder Sie)", (_, c) => {
    const body = texts[c.id].email.body;
    const [first, ...rest] = c.contact.name.split(" ");
    if (c.contact.salutation === "du") {
      expect(body.startsWith(`Hallo ${first},`)).toBe(true);
      expect(body).not.toMatch(/\b(Sie|Ihnen|Ihr|Ihre)\b/);
    } else {
      expect(body).toMatch(new RegExp(`^Sehr geehrte[r]? (Frau|Herr) ${rest.join(" ")},`));
      expect(body).not.toMatch(/\b(du|dir|dich|dein|deine)\b/);
    }
  });

  it.each(atRisk.map((c) => [c.name, c] as const))("%s: keine Gedankenstriche, keine Floskeln", (_, c) => {
    const text = allText(c.id);
    expect(text).not.toMatch(/[–—]/);
    for (const floskel of ["Ich hoffe", "zögern Sie nicht", "zögere nicht", "stehe ich Ihnen", "Mit freundlichen Grüßen", "an dieser Stelle"]) {
      expect(text).not.toContain(floskel);
    }
  });
});
