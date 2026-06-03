# F1 Monaco GP 2026 — Mobile Dashboard

Ein mobiloptimiertes Web-Dashboard für das Formel-1-Wochenende in Monaco (5.–7. Juni 2026). Bündelt Sessionzeitplan, lokale Wettervorhersage, Pirelli-Reifenanalyse, Streckenkarte und FIA-Dokumente in einer einzigen Seite.

---

## Features

### Zeitplan
- Alle Sessions mit exakten CEST-Zeiten (FP1, FP2, FP3, Qualifying, Rennen)
- Automatischer Countdown bis zum Rennstart (live, sekundengenau)
- Vergangene Sessions werden automatisch ausgegraut, laufende Sessions hervorgehoben
- Support-Serien (Formel 2, Formel 3, Porsche Supercup)
- Alert-Badges für Streckenbesonderheiten: Stadtkurs, Safety-Car-Risiko (43%), kein Sprint-Format

### Wetter
- Live-Wetterdaten via [Open-Meteo API](https://open-meteo.com) für Monte Carlo (43.74°N, 7.42°E)
- 3-Tages-Karte Freitag–Sonntag mit Temperatur (min/max), Regenwahrscheinlichkeit, Windgeschwindigkeit
- Stündliche Ansicht für den Renntag (12–18 Uhr CEST) mit markiertem Rennstart (15:00)
- Automatische Regen-Risikoanalyse mit Strategie-Empfehlung (Farbe ändert sich je nach Niederschlagswahrscheinlichkeit)
- Fallback auf klimatologische Durchschnittswerte bei fehlendem Internetzugang
- Refresh-Button aktualisiert Wetterdaten manuell

### Reifen
- Pirelli-Compound-Auswahl für Monaco 2026: **C3 (Hard) / C4 (Medium) / C5 (Soft)**
- Hinweis: C6 wurde für die 2026-Saison nicht homologiert
- Visuelle Stint-Längen- und Grip-Balken pro Compound
- Reifenzuteilung pro Fahrer (Sets pro Compound)
- Drei Strategieszenarien: 1-Stop (Standard), 2-Stop (Alternativ), Safety-Car-Szenario
- Regelhinweis: Pflicht-2-Stopp-Regel für Monaco 2026 abgeschafft

### Strecke
- **Echte Streckenkarte** aus dem Wikimedia-SVG (CC BY-SA 3.0, smg / Will Pittenger) mit korrekten Bézier-Kurven
- Alle 19 Kurven mit Namen und exakt platzierten Labels (T1 Sainte Dévote bis T19 Anthony Noghès)
- Pit Lane eingezeichnet
- Keine DRS-Zone (Monaco hat seit 2024 keine DRS-Zone mehr)
- 8 Strecken-Fakten: Streckenlänge (3,337 km), Runden, Pitstop-Zeitverlust (19,4 s), SC-Risiko, Rundenrekord
- Besondere Kurven mit Schwierigkeitsgrad-Badges
- Rennbesonderheiten: Grid = Ergebnis, SC-Häufigkeit, Regen-Chaos

### FIA
- Direktlinks zu FIA-Stewards-Entscheidungen, Event-Dokumenten, formula1.com und Pirelli Pressroom
- Wichtige 2026-Regeländerungen: Abschaffung der Monaco-Pflicht-Stopp-Regel, neues Stewards-Überprüfungsverfahren (Art. 14.1.2 ISC), Pirelli C1–C5 Range
- Platzhalter für Live-Steward-Entscheidungen (erscheinen ab Freitag, 5. Juni)

---

## Technischer Aufbau

```
f1-monaco-2026/
├── index.html   # Haupt-App (Single Page, Tab-Navigation)
├── style.css    # Design System (CSS Custom Properties, Dark/Light Mode)
├── base.css     # CSS Reset & Grundregeln
└── app.js       # Tab-Navigation, Countdown-Timer, Open-Meteo API-Anbindung
```

### Design
- **Mobile-First**, optimiert für 390 px (iPhone) bis 600 px
- Dark Mode by default (F1-Rot `#e10600` als Akzentfarbe), Light Mode per Toggle umschaltbar
- Schriften: [Inter](https://rsms.me/inter/) (Body) + [Barlow Condensed](https://fonts.google.com/specimen/Barlow+Condensed) (Display/Zahlen)
- CSS Custom Properties für alle Farben und Abstände — kein Build-Step nötig
- `env(safe-area-inset-*)` für iPhone-Notch/Dynamic-Island-Kompatibilität

### Wetter-API
- Endpunkt: `https://api.open-meteo.com/v1/forecast`
- Koordinaten: `latitude=43.7384&longitude=7.4246` (Monte Carlo)
- Abgerufene Variablen: `temperature_2m_max/min`, `precipitation_probability_max`, `weathercode`, `windspeed_10m_max` (täglich) + stündliche Auflösung für Renntag
- Zeitzone: `Europe/Berlin` (CEST)
- Kein API-Key erforderlich

### Streckenkarte
- SVG-Pfad: `path3581` aus `Monte_Carlo_Formula_1_track_map.svg` (Wikimedia Commons)
- Lizenz: [CC BY-SA 3.0](https://creativecommons.org/licenses/by-sa/3.0/) — smg / Will Pittenger
- ViewBox: `114 61 1339 956` (ausgeschnittener Bereich des Original-1466×1024-Canvas)
- Pit-Lane-Pfad: `path4351` aus derselben Quelle
- Alle Kurven-Dot-Positionen wurden manuell gegen offizielle Streckendiagramme verifiziert

---

## Nutzung

Einfach `index.html` im Browser öffnen — kein Build-Schritt, kein Server nötig. Für die Live-Wetterdaten wird eine Internetverbindung benötigt; ohne Verbindung greift der klimatologische Fallback.

**Auf dem iPhone als Web-App installieren:** Safari → Teilen → „Zum Home-Bildschirm" — die Seite öffnet sich dann ohne Browser-Chrome als native App.

---

## Datenquellen

| Bereich | Quelle |
|---|---|
| Sessionzeiten | [formula1.com](https://www.formula1.com/en/racing/2026/monaco) |
| Wetter (live) | [Open-Meteo](https://open-meteo.com) |
| Reifenauswahl | [Pirelli Pressroom](https://press.pirelli.com) / [coffeecornermotorsport.com](https://coffeecornermotorsport.com/f1-2026-tyre-compound-range/) |
| FIA-Dokumente | [fia.com](https://www.fia.com/events/fia-formula-one-world-championship/season-2026/monaco-grand-prix) |
| Streckenkarte SVG | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Monte_Carlo_Formula_1_track_map.svg) — CC BY-SA 3.0, smg / Will Pittenger |
| Regeländerungen | [motorsport.com](https://www.motorsport.com/f1/news/monaco-scraps-mandatory-two-stop-rule-for-2026-/10801049/) |
