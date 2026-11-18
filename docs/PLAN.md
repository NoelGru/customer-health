# Plan: Customer-Health-Dashboard (Phase 0)

Prototyp von Noel Gruber · Beispieldaten

Dieses Dokument hält fest, **was** gebaut wird und **warum so**. Es ist die Grundlage für alle weiteren Phasen.

---

## 1. Ordnerstruktur

```
customer-health-dashboard/
├─ data/
│  ├─ customers.json         ← Phase 1: ~20 erfundene Kunden
│  └─ ai-texts.json          ← Phase 4: vorab erzeugte Berichte & Mail-Entwürfe
├─ docs/
│  ├─ PLAN.md                ← dieses Dokument
│  └─ LEARNING.md            ← Lernnotizen nach jeder Phase
├─ src/
│  ├─ lib/
│  │  ├─ types.ts            ← Datenmodell als TypeScript-Typen
│  │  ├─ onboarding.ts       ← Checklisten-Vorlage (4 Phasen)
│  │  ├─ health.ts           ← Health-Score-Berechnung (Phase 2)
│  │  └─ health.test.ts      ← Tests mit Vitest (Phase 2)
│  ├─ components/
│  │  ├─ KpiBar.tsx          ← 4 Kennzahlen oben
│  │  ├─ Filters.tsx         ← Filter: Ampel, Segment, Onboarding-Phase
│  │  ├─ CustomerTable.tsx   ← Liste mit Ampel, „dringendste zuerst“
│  │  ├─ CustomerDetail.tsx  ← Detailansicht
│  │  ├─ TrendChart.tsx      ← 8-Wochen-Diagramm (Recharts)
│  │  ├─ ReadinessChecklist.tsx
│  │  └─ AiReport.tsx        ← Phase 4: Button „Bericht & Mail-Entwurf“
│  ├─ App.tsx
│  ├─ main.tsx
│  └─ index.css              ← Tailwind
├─ index.html · package.json · vite.config.ts · tsconfig.json
└─ README.md                 ← Phase 5
```

**Warum so?**
* `data/` liegt bewusst **außerhalb** von `src/`: Daten und Code sind getrennt. Wer die Beispieldaten ändern will, muss keinen Code anfassen.
* `src/lib/` enthält die „Denklogik“ (Score, Regeln) ohne jede Oberfläche. Dadurch lässt sie sich testen, ohne den Browser zu öffnen.
* `src/components/` enthält nur Darstellung. Jede Komponente macht eine Sache.
* Kein Router, kein Backend, keine Datenbank. Die Detailansicht wird über die Adresse `#/kunde/c07` geöffnet, damit man einen Kunden direkt verlinken kann (praktisch zum Teilen im Team).

---

## 2. Datenmodell

Analogie: Jeder Kunde ist eine **Karteikarte**. Oben stehen die Stammdaten, darunter die Onboarding-Checkliste, ganz unten ein kleines Wochenprotokoll der letzten 8 Wochen.

### Datei `data/customers.json`

```json
{
  "asOf": "2026-11-09",
  "customers": [ /* ~20 Kunden */ ]
}
```

`asOf` ist der **Stichtag** der Daten. Alle „seit X Tagen“-Angaben beziehen sich darauf. So sieht die Demo in drei Monaten noch genauso aus wie heute.

### Ein Kunde

| Feld | Typ | Beispiel | Bedeutung |
|---|---|---|---|
| `id` | Text | `"c07"` | interne Kennung |
| `name` | Text | `"Frischemarkt Lindenhof"` | erfunden |
| `segment` | Auswahl | `"supermarkt"` | `supermarkt`, `klinik`, `hotel`, `fitness`, `shopping` |
| `city` | Text | `"Augsburg"` | Ort der Parkfläche |
| `spaces` | Zahl | `120` | Anzahl Stellplätze |
| `contact` | Objekt | `{ "name": "Petra Hauser", "role": "Filialleitung", "salutation": "sie" }` | erfundene Ansprechperson; `salutation` ist `du` oder `sie` (für den Mail-Entwurf) |
| `onboarding.phase` | Auswahl | `"live"` | `vertrag` → `installation` → `testbetrieb` → `live` |
| `onboarding.phaseSince` | Datum | `"2026-08-04"` | seit wann der Kunde in dieser Phase ist |
| `onboarding.done` | Liste | `["vertrag-signed", "install-cameras", …]` | welche Checklisten-Punkte erledigt sind |
| `goLiveDate` | Datum | `"2026-08-04"` | tatsächliches oder geplantes Go-live |
| `weekly` | Liste (8 Einträge) | `[{ "week": "2026-09-14", "occupancy": 0.72, "paymentRate": 0.93 }, …]` | Wochenwerte; leer, solange der Kunde nicht live ist |
| `openTickets` | Zahl | `2` | offene Support-Tickets |
| `daysSinceContact` | Zahl | `45` | Tage seit dem letzten persönlichen Kontakt (Call, Termin, Mail mit Antwort) |
| `note` | Text | `"Seit Oktober Bauzaun am Haupteingang …"` | letzte Notiz aus dem Kundenkontakt, wie im CRM (in Phase 1 ergänzt: liefert den Kontext für Bericht und Mail in Phase 4) |

Begriffe:
* **Auslastung** (`occupancy`): Wie voll ist die Fläche im Wochenschnitt, 0 bis 1 (0,72 = 72 %).
* **Zahlungsquote** (`paymentRate`): Anteil der Parkvorgänge, die korrekt bezahlt wurden, 0 bis 1. Wenn sie sinkt, ist das oft ein Zeichen für ein **praktisches** Problem vor Ort: Schild schlecht sichtbar, Automat defekt, Parkende verstehen das System nicht. Für den Kunden heißt das: mehr Ärger mit seinen eigenen Besuchern.

### Checkliste als Vorlage (`src/lib/onboarding.ts`)

Analogie: Die Checkliste ist ein **vorgedrucktes Formular**. Im Code steht das Formular einmal, beim Kunden stehen nur seine Häkchen (`onboarding.done`). So ist die Liste bei allen Kunden gleich und man kann sie an einer Stelle ändern.

| Phase | Punkte |
|---|---|
| **Vertrag** | Vertrag unterschrieben · Ansprechperson benannt · Parkregeln festgelegt (z. B. 90 Min. frei) |
| **Installation** | Standortbegehung erledigt · Kameras montiert · Beschilderung aufgestellt · Zahlungsautomat bzw. QR-Code installiert |
| **Testbetrieb** | Kennzeichenerkennung geprüft · Testzahlungen erfolgreich · Ausnahmeliste hinterlegt (z. B. Mitarbeitende, Lieferanten) · Team des Kunden eingewiesen |
| **Live** | Go-live an Parkende kommuniziert · Review-Gespräch nach 30 Tagen |

**Readiness** = Anteil erledigter Punkte (z. B. 9 von 13 = 69 %). Das ist die Zahl für „Customer-Readiness-Tracking“.

---

## 3. Health Score: einfache, gewichtete Regeln

### Grundidee

Analogie: **Punkteabzug wie beim TÜV.** Jeder Kunde startet mit **100 Punkten**. Jede Regel, die anschlägt, zieht Punkte ab und schreibt **einen Satz als Begründung** dazu. Keine Blackbox: Man kann jede Ampel mit dem Finger auf der Tabelle nachrechnen.

### Regeln

| # | Signal | Wann schlägt die Regel an? | Abzug | Beispiel-Begründung |
|---|---|---|---|---|
| R1 | Zahlungsquote niedrig | letzte Woche unter 85 % (unter 75 %: stärker) | −15 / −25 | „Zahlungsquote nur 78 % (Ziel: mindestens 85 %)“ |
| R2 | Zahlungsquote fällt | letzte Woche mind. 5 Prozentpunkte unter dem Schnitt der Wochen 1–4 | −15 | „Zahlungsquote seit 3 Wochen gesunken (von 92 % auf 81 %)“ |
| R3 | Auslastung fällt | Schnitt der letzten 2 Wochen mind. 15 % unter dem Schnitt der Wochen 1–4 | −20 | „Auslastung um 22 % gefallen (von 68 % auf 53 %)“ |
| R4 | Lange kein Kontakt | über 30 Tage (über 60 Tage: stärker) | −10 / −20 | „Seit 45 Tagen kein Kontakt“ |
| R5 | Viele offene Tickets | ab 3 Tickets (ab 6: stärker) | −10 / −20 | „4 offene Tickets“ |
| R6 | Onboarding hängt | nicht live und über 21 Tage in derselben Phase (über 45 Tage: stärker) | −20 / −35 | „Seit 38 Tagen in Phase Installation, offen: Beschilderung“ |

R1 bis R3 gelten nur für Kunden, die **live** sind (vorher gibt es keine Betriebsdaten). R6 gilt nur für Kunden **im Onboarding**. R4 und R5 gelten für alle.

### Von Punkten zur Ampel

| Score | Ampel | Bedeutung |
|---|---|---|
| 85–100 | 🟢 grün | läuft, normaler Rhythmus |
| 50–84 | 🟡 gelb | beobachten, diese Woche melden |
| 0–49 | 🔴 rot | gefährdet, sofort handeln |

Ein einzelnes kleines oder mittleres Signal (−10 oder −15) lässt einen Kunden **grün**, die Begründung steht trotzdem dabei. Ein starkes Signal (ab −20) oder zwei kleine machen ihn **gelb**.

> Änderung in Phase 1: Ursprünglich begann Grün bei 80. Beim Nachrechnen mit den Beispieldaten fiel auf, dass ein Kunde mit genau einem starken Signal (−20) dann noch grün wäre. Das widerspricht der Idee „ein starkes Signal = gelb“. Deshalb beginnt Grün jetzt bei 85. Rot wird ein Kunde erst, wenn **mehrere** Dinge gleichzeitig schieflaufen. Das verhindert Fehlalarme.

### Warum diese Gewichte?

* **Geld- und Nutzungssignale wiegen am meisten** (R1–R3): Sie zeigen, ob das Produkt beim Kunden wirklich funktioniert. Sie gehen dem Abspringen meist voraus.
* **Hängendes Onboarding wiegt viel** (R6): Solange ein Kunde nicht live ist, hat er nur Kosten und Aufwand, aber keinen Nutzen. Und der erste Eindruck entsteht genau hier.
* **Beziehungssignale wiegen weniger** (R4, R5): Kein Kontakt oder Tickets allein sind kein Drama, aber zusammen mit sinkenden Zahlen ein deutliches Warnzeichen.

### Sortierung „dringendste zuerst“

Der Score ist der Sortierschlüssel: niedrigster Score oben. Bei Gleichstand kommt der größere Kunde (mehr Stellplätze) zuerst, weil dort mehr auf dem Spiel steht.

### Empfohlener nächster Schritt

Auch regelbasiert: Die Regel mit dem **größten Abzug** bestimmt den nächsten Schritt.

| Stärkste Regel | Nächster Schritt |
|---|---|
| R1/R2 Zahlung | Vor-Ort-Check: Beschilderung und Automat prüfen, Zahlungsdaten mit dem Kunden durchgehen |
| R3 Auslastung | Termin vereinbaren: Gibt es Änderungen vor Ort (Baustelle, Öffnungszeiten, Parkregeln)? |
| R4 Kontakt | Kurzen Check-in-Call einplanen |
| R5 Tickets | Tickets bündeln, mit Support klären, Kunde proaktiv über den Stand informieren |
| R6 Onboarding | Blocker benennen, Verantwortliche und Termin für den offenen Punkt festlegen |
| keine Regel | Alles im grünen Bereich: im nächsten Quartals-Review Erfolge teilen, Erweiterung ansprechen |

### Ergebnis der Funktion (Phase 2)

```ts
calculateHealth(customer, asOf) → {
  score: 75,
  status: "gelb",
  reasons: [
    { rule: "R2", points: -15, text: "Zahlungsquote seit 3 Wochen gesunken (von 92 % auf 81 %)" },
    { rule: "R4", points: -10, text: "Seit 41 Tagen kein Kontakt" }
  ],
  nextStep: "Vor-Ort-Check: Beschilderung und Automat prüfen …"
}
```

---

## 4. Beispieldaten (Phase 1, umgesetzt)

20 erfundene Kunden in `data/customers.json`: **12 grün, 5 gelb, 3 rot**. 15 sind live, 5 im Onboarding. Segmente: 5 Supermärkte, 4 Kliniken, 4 Hotels, 4 Fitnessstudios, 3 Shopping-Center. Stichtag: 9. November 2026.

Die gelben und roten Kunden, jeweils mit einem anderen Grund:

| Kunde | Ampel | Score | Was ist los? |
|---|---|---|---|
| c07 Kreisklinikum Ammertal | 🔴 | 40 | Zahlungsquote fällt seit 4 Wochen auf 73 %, 52 Tage kein Kontakt, 3 Tickets. Notiz: Bauzaun verdeckt den Automaten. |
| c03 Einkaufspark Nordtor | 🔴 | 45 | Auslastung um 23 % gefallen, 7 Tickets, Zahlungsquote 84 %. Notiz: Baustelle an der Zufahrt. |
| c10 Athletikhalle Nord | 🔴 | 45 | Seit 49 Tagen in der Installation, Schilder und Automat fehlen, 3 Tickets, 34 Tage kein Kontakt. |
| c06 Frischekontor Hanse | 🟡 | 75 | Zahlungsquote seit 4 Wochen gesunken (93 % auf 86 %), 38 Tage kein Kontakt. |
| c12 Hotel Seeterrasse | 🟡 | 80 | Seit 71 Tagen kein Kontakt, 30-Tage-Review nie stattgefunden. |
| c14 Gesundheitszentrum Stadtpark | 🟡 | 80 | Seit 28 Tagen im Testbetrieb, Ausnahmeliste für Mitarbeitende fehlt. |
| c15 Studio Puls | 🟡 | 80 | Auslastung um 19 % gefallen. Notiz: Konkurrenz mit Gratis-Parkplatz. |
| c18 Klinik Westpark | 🟡 | 80 | 4 Tickets und 36 Tage kein Kontakt. |

Drei grüne Kunden haben bewusst **ein kleines Signal** (c04: 33 Tage kein Kontakt, c05: 3 Tickets, c11: Zahlungsquote 84 %). So sieht man: Auch grüne Kunden zeigen ihre Begründung, ohne Alarm auszulösen.

Größen realistisch: Fitnessstudio 40 bis 70 Plätze, Klinik 140 bis 320, Shopping-Center 310 bis 620.

---

## 5. Technik (Kurzfassung)

Vite + React + TypeScript · Tailwind CSS · Recharts · Vitest · Deployment als statische Seite auf Vercel. Keine API-Schlüssel, keine Secrets, kein Backend.

Design (entschieden in Phase 3, nach vier Mockups in `design/mockups/`): Mockup D. App-Aufbau mit Tabelle und Detailspalte, Glas-Karten auf hellem Farbverlauf, Schrift Inter + JetBrains Mono, Ampelfarben nur für den Status. Akzentfarbe ist ein kräftiges Violett (#5046E8). Footer: „Prototyp von Noel Gruber · Beispieldaten · Datenstand …“.
