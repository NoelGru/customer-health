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
