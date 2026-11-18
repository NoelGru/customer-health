# Lernnotizen

Nach jeder Phase: Was wurde gebaut, warum so, und drei typische Fragen aus einem Customer-Success-Gespräch mit kurzen Antworten.

---

## Phase 0: Planung

### Was wurde gebaut?

Noch kein Code, sondern der Bauplan (`docs/PLAN.md`):

1. **Ordnerstruktur.** Daten (`data/`), Denklogik (`src/lib/`) und Darstellung (`src/components/`) liegen getrennt. Wie in einer Küche: Vorratsschrank, Rezeptbuch und Teller sind an verschiedenen Orten, damit man eins ändern kann, ohne die anderen anzufassen.
2. **Datenmodell.** Jeder Kunde ist eine Karteikarte: Stammdaten, Onboarding-Häkchen, 8 Wochen Auslastung und Zahlungsquote, offene Tickets, Tage seit letztem Kontakt. Ein fester Stichtag (`asOf`) sorgt dafür, dass die Demo nicht „altert“.
3. **Health-Score-Regeln.** Jeder Kunde startet mit 100 Punkten. Sechs einfache Regeln ziehen Punkte ab und schreiben je einen Satz als Begründung. 85+ ist grün, 50–84 gelb, darunter rot (in Phase 1 von 80 auf 85 angepasst, siehe unten).

### Warum so?

* **Regeln statt KI für den Score:** Ein Score, den niemand erklären kann, wird im Team nicht genutzt. Mit Regeln kann jede Kollegin nachvollziehen, warum ein Kunde rot ist, und die Regeln gemeinsam anpassen.
* **Punkte statt nur Ampel:** Die Ampel ist die Kurzfassung für das Auge. Die Punkte braucht man zum Sortieren: Bei drei roten Kunden steht der mit den wenigsten Punkten oben.
* **Mehrere Signale für Rot:** Ein einzelnes Signal (z. B. 35 Tage ohne Kontakt) ist meist harmlos. Erst wenn mehrere zusammenkommen, wird es ernst. Das vermeidet Alarmmüdigkeit.
* **Begründung und nächster Schritt direkt dabei:** Ein Dashboard soll nicht nur zeigen, *dass* etwas los ist, sondern *was* zu tun ist.

### Drei typische Fragen

**1. Woran erkennst du früh, dass ein Kunde abspringen könnte?**
An Veränderungen, nicht an absoluten Werten. Eine Zahlungsquote, die über drei Wochen fällt, sagt mehr als eine, die konstant bei 86 % liegt. Dazu Beziehungssignale: Der Kunde meldet sich nicht mehr, Tickets häufen sich. Am stärksten ist die Kombination aus beidem.

**2. Wie misst man Customer Health, ohne dass es eine Blackbox wird?**
Mit wenigen, gewichteten Regeln, die das Team versteht. Jede Regel liefert einen Satz als Begründung. Die Gewichte sind ein Startpunkt: Nach ein paar Monaten schaut man, welche Kunden tatsächlich gekündigt haben, und justiert nach.

**3. Warum gewichtest du Zahlungsquote und Auslastung höher als den letzten Kontakt?**
Weil sie zeigen, ob das Produkt beim Kunden wirklich wirkt. Ein Kunde ohne Kontakt, dessen Fläche gut läuft, ist meistens zufrieden. Ein Kunde mit sinkender Zahlungsquote hat dagegen ein echtes Problem vor Ort, auch wenn er sich noch nicht beschwert hat.

---

## Phase 1: Beispieldaten

### Was wurde gebaut?

1. **`data/customers.json`**: 20 erfundene Kunden mit 8 Wochen Verlauf. Ergebnis nach den Regeln: 12 grün, 5 gelb, 3 rot.
2. **`src/lib/types.ts`**: das Datenmodell als TypeScript-Typen. Das ist wie ein Formular mit Pflichtfeldern: Fehlt ein Feld oder steht Text, wo eine Zahl hingehört, meckert der Computer sofort.
3. **`src/lib/onboarding.ts`**: die Checkliste mit 13 Punkten in 4 Phasen, einmal für alle Kunden.

### Warum so?

* **Jeder gefährdete Kunde hat einen anderen Grund.** So zeigt die Demo die ganze Bandbreite: Zahlung, Auslastung, Onboarding, Kontakt, Tickets. Im Gespräch kann man an jedem Kunden eine andere Situation durchspielen.
* **Die Zahlen erzählen eine Geschichte.** Werte schwanken leicht wie im echten Leben, und wo etwas kippt, erklärt die Notiz den Grund (Bauzaun, Baustelle, Konkurrenz, Betriebsrat). Daten ohne Kontext sind nur halb so viel wert.
* **Neues Feld `note`:** eine kurze CRM-Notiz pro Kunde. Sie war im Plan nicht vorgesehen, macht aber Bericht und Mail in Phase 4 konkreter. In der Praxis steht genau dieses Wissen im CRM oder im Kopf der CSM.
* **Grün beginnt jetzt bei 85 statt 80.** Beim Nachrechnen fiel auf: Mit 80 wäre ein Kunde mit einem starken Warnsignal noch grün gewesen. Das ist genau der Fall, den man nicht übersehen will. Regeln an echten Beispielen zu prüfen und dann nachzuschärfen, ist normaler Teil der Arbeit.
* **Drei grüne Kunden mit kleinem Signal:** zeigt, dass der Score nicht nur „Alarm oder nichts“ kennt.

### Drei typische Fragen

**1. Was machst du, wenn ein Onboarding hängt?**
Zuerst den konkreten Blocker benennen, nicht nur „verzögert“. Bei der Athletikhalle sind es zwei Dinge: Freigabe der Schilder durch den Vermieter und der Stromanschluss für den Automaten. Dann für jeden Punkt eine verantwortliche Person und ein Datum festlegen, und den Kunden aktiv informieren, bevor er nachfragen muss.

**2. Wie priorisierst du bei 40 Kunden?**
Nach Risiko und nach Größe. Der Health Score sortiert die Liste, bei Gleichstand kommt der Kunde mit mehr Stellplätzen zuerst. Rote Kunden diese Woche persönlich, gelbe mit einem kurzen Check-in, grüne im normalen Quartalsrhythmus. So bleibt Zeit für die, die sie wirklich brauchen.

**3. Ein Kunde hat seit Wochen nichts gesagt, die Zahlen sind aber gut. Musst du dich melden?**
Ja, aber entspannt. Schweigen ist kein Problem an sich, kann aber eines verdecken (z. B. beim Hotel Seeterrasse: das 30-Tage-Review hat nie stattgefunden). Ein kurzer Anruf mit einem konkreten Anlass, etwa einer kleinen Auswertung der letzten Wochen, wirkt nicht aufdringlich und hält die Beziehung warm.

---

## Phase 2: Health Score

### Was wurde gebaut?

1. **Projekt-Grundgerüst:** Vite, React, TypeScript, Tailwind, Recharts und Vitest sind installiert. `npm run dev` startet die Seite (vorerst nur eine Platzhalter-Liste), `npm test` startet die Tests, `npm run build` baut die fertige Seite.
2. **`src/lib/health.ts`:** die Funktion `calculateHealth(kunde, stichtag)`. Sie gibt zurück: Score, Ampel, Begründungen (größter Abzug zuerst) und den empfohlenen nächsten Schritt. Dazu `sortByUrgency` für „dringendste zuerst“.
3. **`src/lib/health.test.ts`:** 13 Tests, alle grün.
4. **Git:** lokales Repository mit zwei Commits (Phase 0–1 und Phase 2). Autor ist die GitHub-noreply-Adresse, nicht die private E-Mail. Noch nichts hochgeladen.

### Warum so?

* **Alle Schwellen und Gewichte stehen oben in einer Tabelle (`RULES`).** Wie die Einstellungen an einem Thermostat: Will das Team „lange kein Kontakt“ ab 21 statt 30 Tagen, ändert man eine Zahl an einer Stelle.
* **Die Funktion ist „rein“:** gleiche Eingabe, gleiches Ergebnis, wie ein Taschenrechner. Sie liest keine Uhrzeit und keine Datenbank, der Stichtag wird übergeben. Deshalb ist sie leicht zu testen und zu erklären.
* **Begründungen enthalten echte Zahlen.** Nicht „Zahlung auffällig“, sondern „Zahlungsquote seit 4 Wochen gesunken (von 92 % auf 73 %)“. So kann man das Gespräch mit dem Kunden direkt mit Fakten beginnen.
* **Tests sind Probe-Rechnungen.** Jede Regel hat einen eigenen kleinen Fall, dazu die Grenzwerte (genau 30 Tage zählen noch nicht, 31 schon). Ein letzter Test rechnet alle Beispielkunden durch und prüft 12/5/3. Ändert jemand versehentlich eine Regel, fällt das sofort auf.
* **Gleichstand beim Sortieren:** Einkaufspark Nordtor und Athletikhalle Nord haben beide 45 Punkte. Der Einkaufspark (620 Plätze) steht oben, weil dort mehr auf dem Spiel steht.

### Drei typische Fragen

**1. Was machst du, wenn der Score etwas anderes sagt als dein Bauchgefühl?**
Beides ernst nehmen. Der Score sieht nur Zahlen, ich weiß vielleicht, dass der Filialleiter gerade gewechselt hat. Wenn mein Gefühl öfter recht hat, fehlt dem Score ein Signal, dann gehört das ins Team-Gespräch und ggf. als neue Regel hinein. Der Score ist ein Werkzeug, keine Entscheidung.

**2. Wie würdest du prüfen, ob die Gewichte stimmen?**
Rückblickend: Welche Kunden haben in den letzten 12 Monaten gekündigt oder verkleinert, und wie sah ihr Score drei Monate vorher aus? Waren sie gelb oder rot, passt das Modell. Waren sie grün, fehlt ein Signal oder ein Gewicht ist zu niedrig. Das macht man am besten einmal im Quartal.

**3. Die Zahlungsquote eines Kunden sinkt. Was tust du konkret?**
Erst die Ursache vor Ort suchen, bevor ich den Kunden anrufe: Ist ein Schild verdeckt, der Automat defekt, hat sich etwas am Eingang geändert? Dann mit einer konkreten Beobachtung und einem Vorschlag auf den Kunden zugehen. Eine sinkende Zahlungsquote ärgert am Ende vor allem die Besucher des Kunden, deshalb hat er ein eigenes Interesse an einer schnellen Lösung.

---

## Phase 3: Oberfläche

### Was wurde gebaut?

1. **Design zuerst als Mockups** (`design/mockups/`): drei Richtungen (Noel-Stil, Gatekit-Stil, Logbuch), daraus eine Mischung D in drei Runden verfeinert. Erst danach echter Code.
2. **Die App** (`src/App.tsx` und `src/components/`):
   * Kopfzeile mit 4 Kennzahlen: Kunden gesamt, gefährdet (+ beobachten), im Onboarding, Ø Zahlungsquote.
   * Liste mit Ampel-Score, Filtern (Ampel, Segment, Phase) und „dringendste zuerst“.
   * Detailansicht: Score-Ring, Eckdaten (Ansprechperson, Go-live, letzter Kontakt, Tickets), 8-Wochen-Diagramm, Begründungen, nächster Schritt, Readiness mit aufklappbarer Checkliste, letzte Notiz.
3. **`src/lib/view.ts`**: Filter und Kennzahlen als eigene, getestete Funktionen (jetzt 17 Tests).

### Warum so?

* **Erst Mockups, dann Code:** Design-Entscheidungen sind billig, solange es nur Skizzen sind. Wie beim Hausbau: Grundriss auf Papier ändern kostet nichts, eine Wand versetzen schon.
* **Tabelle + Detailspalte:** Links „wer“, rechts „warum und was tun“. Ein Klick genügt, man verliert die Liste nie aus dem Blick.
* **Jeder Kunde hat eine eigene Adresse** (`#/kunde/c07`). Man kann einen Kunden direkt verlinken, z. B. im Team-Chat.
* **Handy:** Die Liste wird zu Karten, die Detailansicht öffnet sich als eigene Seite mit „Zur Übersicht“. Auf dem Desktop zeigt die Detailspalte ohne Auswahl automatisch den dringendsten Kunden.
* **Kleine Details, die im Alltag helfen:** „überfällig“ beim geplanten Go-live, unter „Offen“ nur die Punkte der aktuellen Phase, Filter mit „Zurücksetzen“.
* **Logik bleibt außerhalb der Oberfläche:** Die Komponenten zeigen nur an. Rechnen, filtern und sortieren passiert in `src/lib/` und ist getestet.

### Drei typische Fragen

**1. Was gehört auf ein Customer-Health-Dashboard, und was nicht?**
Nur, was zu einer Handlung führt: Wer braucht Aufmerksamkeit, warum, und was ist der nächste Schritt. Alles andere (Umsatzdetails, Rohdaten) gehört in Berichte. Ein Dashboard, auf dem man erst suchen muss, wird nach zwei Wochen nicht mehr geöffnet.

**2. Wie würdest du so ein Tool im Team einführen?**
Klein anfangen: eine Woche lang im Team-Weekly gemeinsam die roten Kunden durchgehen. Feedback sammeln, welche Begründungen fehlen oder falsch sind, und die Regeln anpassen. Erst wenn das Team dem Score vertraut, wird er zur festen Routine.

**3. Wie gehst du in ein Gespräch mit einem gefährdeten Kunden?**
Vorbereitet und mit Zahlen, aber ohne Vorwurf: „Uns ist aufgefallen, dass die Zahlungsquote seit vier Wochen sinkt, und wir haben eine Vermutung.“ Dann zuhören, eine konkrete Lösung mit Datum anbieten und nach zwei Wochen nachfassen. Die Detailansicht ist genau die Vorbereitung für dieses Gespräch.

---

## Phase 4: KI-Texte (ohne API)

### Was wurde gebaut?

1. **`data/ai-texts.json`**: Für jeden der 8 gelben und roten Kunden ein Monatsbericht (5 Sätze + 3 Empfehlungen) und ein Mail-Entwurf an die Ansprechperson. Einmalig beim Bauen mit Claude geschrieben und von Hand geprüft.
2. **Button „Bericht & Mail-Entwurf“** in der Detailansicht (Abschnitt 4, direkt nach dem nächsten Schritt): kurze Ladeanimation, dann zwei Reiter „Monatsbericht“ und „Mail-Entwurf“, Knopf „Text kopieren“, darunter der Hinweis „Text vorab mit Claude erzeugt“.
3. **`src/lib/ai-texts.test.ts`**: ein automatisches Lektorat. Es prüft für jeden Text: richtiger Kunde, 3 bis 5 Sätze, 2 bis 3 Empfehlungen, passende Anrede (Du oder Sie, keine Mischung), keine Gedankenstriche, keine typischen Floskeln. Jetzt 42 Tests.

### Warum so?

* **Vorab erzeugt statt live:** keine API-Kosten, kein Schlüssel im Projekt, und die Texte sind geprüft, bevor jemand sie sieht. Für eine Demo zählt, dass der Ablauf sichtbar wird, nicht dass jede Sekunde neu generiert wird. Der Hinweis unter dem Button macht das transparent.
* **Die Texte nutzen genau die Daten aus dem Dashboard:** Zahlen, Notiz, Tickets, Tage seit Kontakt. So passt der Bericht zu dem, was man links sieht, und die Mail hat einen konkreten Anlass statt „wollte mich mal melden“.
* **Jede Mail macht einen konkreten Vorschlag mit Termin.** Nicht „bei Fragen melden Sie sich“, sondern „Wir stellen bis Ende nächster Woche Schilder auf. Passt Ihnen Donnerstag?“. Das ist der Unterschied zwischen reagieren und führen.
* **Du oder Sie hängt an der Ansprechperson, nicht am Segment:** Die beiden Fitnessstudios werden geduzt, alle anderen gesiezt. Der Test stellt sicher, dass in einer Sie-Mail kein „du“ rutscht und umgekehrt.
* **Problem beim Kunden, Lösung bei uns:** Die Mails benennen das Problem sachlich und ohne Vorwurf, und der Aufwand liegt bei uns („Ich schicke Ihnen eine Vorlage, die Sie nur weiterleiten müssen“).

### Drei typische Fragen

**1. Wie nutzt du KI im Customer Success, ohne dass es unpersönlich wird?**
Als ersten Entwurf, nie als fertige Nachricht. Die KI fasst Zahlen und Notizen zusammen und spart mir die leere Seite. Ich prüfe jede Aussage, ergänze, was nur ich weiß, und schicke die Mail unter meinem Namen. Die Verantwortung bleibt bei mir.

**2. Wie schreibst du einem Kunden, dass etwas nicht gut läuft?**
Mit einer konkreten Beobachtung, einer Vermutung zur Ursache und einem Vorschlag, der dem Kunden Arbeit abnimmt. Zum Beispiel: „Die Zahlungsquote ist von 92 auf 73 % gefallen, wir vermuten den Bauzaun, wir stellen bis Freitag zusätzliche Schilder auf.“ Kein Schuldzuweisen, kein Fachjargon.

**3. Was wäre der nächste Schritt, um das live zu betreiben?**
Die Texte mit der Claude API erzeugen, wenn ein Kunde gelb oder rot wird, mit Tageslimit für die Kosten und den vorab erzeugten Texten als Rückfall, falls die API nicht erreichbar ist. Die Mail landet nie automatisch beim Kunden, sondern immer als Entwurf bei der zuständigen Person.

---

## Phase 5: Fertigstellen

### Was wurde gemacht?

1. **README** mit Live-Link, Screenshot, Erklärung des Health Scores und dem Abschnitt „So könnte man es live anbinden“ (Claude API mit Tageslimit und Rückfall auf die vorab erzeugten Texte, nur beschrieben).
2. **GitHub:** öffentliches Repo `NoelGru/customer-health`. Alle Commits laufen über die GitHub-noreply-Adresse, die private E-Mail taucht nirgends auf. Vor dem Hochladen wurde das ganze Projekt nach privaten Daten und Schlüsseln durchsucht.
3. **Vercel:** Das Projekt ist mit dem Repo verbunden. Jeder Push auf `main` baut die Seite automatisch neu. Live unter [customer-health-snowy.vercel.app](https://customer-health-snowy.vercel.app).

### Warum so?

* **Ein Link statt einer Datei:** Wer den Link bekommt, klickt einmal und sieht das Tool. Keine Installation, keine Hürde.
* **README als Gebrauchsanweisung für Fremde:** Wer nur zwei Minuten hat, versteht dort Zweck, Logik und Grenzen, ohne Code zu lesen.
* **Automatisches Deployment:** Eine Änderung im Repo ist ein paar Sekunden später live. Kein manueller Upload, der vergessen werden kann.
* **Ehrlich über Grenzen:** Beispieldaten, vorab erzeugte Texte und die Live-Anbindung nur als Beschreibung sind klar benannt. Das schafft mehr Vertrauen als eine Demo, die mehr verspricht, als sie kann.

### Drei typische Fragen

**1. Was würdest du als Erstes ändern, wenn das Tool echte Daten bekäme?**
Die Gewichte der Regeln an der Vergangenheit prüfen: Welche Kunden haben tatsächlich gekündigt, und wie sah ihr Score vorher aus? Außerdem würde ich die Daten täglich automatisch einlesen statt aus einer Datei und den Kontakt direkt aus dem CRM ziehen.

**2. Wie misst du, ob deine Customer-Success-Arbeit wirkt?**
Mit wenigen Zahlen über Zeit: Anteil roter und gelber Kunden, Dauer vom Vertrag bis Go-live, Verlängerungsquote und wie schnell ein roter Kunde wieder grün wird. Wichtig ist der Trend, nicht der einzelne Monatswert.

**3. Warum hast du das gebaut, statt einfach eine Präsentation zu machen?**
Weil man an einem funktionierenden Prototyp sofort sieht, ob eine Idee trägt. Beim Bauen sind mir Dinge aufgefallen, die auf Folien nie aufgefallen wären, etwa dass ein einzelnes starkes Warnsignal mit der ersten Schwelle noch grün gewesen wäre.
