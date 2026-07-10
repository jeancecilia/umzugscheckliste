# QA Report

- PDF-Datei: `output/umzugscheckliste-familien-interior-premium.pdf`
- Preview-Datei: `output/umzugscheckliste-familien-interior-preview.html`
- Cover-Datei: `output/umzugscheckliste-familien-cover.pdf`
- QA-Renders: `output/qa-renders/`
- Geplante Seiten aus JSON/Generator: `106`
- Ziel-Seitenzahl aus Config: `106`
- Tatsaechliche Innen-PDF-Seiten: `106`
- Innen-PDF-Formate: `8.5 x 11 inch`
- Leerseiten per Textpruefung: `0`
- Leerseiten per Bildpruefung: `0`
- Unterschiedliche Seitentypen: `17`
- Platzhaltertreffer: `0`
- Sensible Formulierungen: `0`
- Verdaechtige Innenraum-Farbtreffer im HTML/CSS: `0`
- Maximale gemessene Saettigung im Innen-PDF: `0.225`
- Seite-5-Notes-Box dominante Farben: `255/255/255:0.945274, 202/194/180:0.00995, 216/210/199:0.004975`
- Seite-5-Notes-Box erlaubter Fuellanteil: `0.945274`
- Gerenderte QA-Seiten: `1, 2, 3, 4, 11, 12, 29, 47, 50, 71, 73, 79, 81, 90, 91, 92, 93, 96, 97, 106`
- Cover-QA-Renders: `cover-sheet.png, cover-front.png, cover-back.png`
- Verbotene *-updated.pdf-Dateien: `0`
- Innen-PDF-Schriften: `AAAAAA+SourceSans3ExtraLight-Bold, BAAAAA+MontserratThin-Bold, CAAAAA+SourceSans3ExtraLight-Regular, DAAAAA+SourceSans3ExtraLight-SemiBold, EAAAAA+MontserratThin-SemiBold`
- Cover-PDF-Schriften: `AAAAAA+MontserratThin-Bold, BAAAAA+MontserratThin-SemiBold`

## Woechentliche Checklisten

- 12 Wochen vorher: 11 Aufgaben
- 10 Wochen vorher: 11 Aufgaben
- 8 Wochen vorher: 11 Aufgaben
- 6 Wochen vorher: 12 Aufgaben
- 4 Wochen vorher: 12 Aufgaben
- 3 Wochen vorher: 11 Aufgaben
- 2 Wochen vorher: 11 Aufgaben
- 1 Woche vorher: 11 Aufgaben
- 3 Tage vorher: 11 Aufgaben
- 1 Tag vorher: 11 Aufgaben
- Umzugstag - Morgen: 11 Aufgaben
- Umzugstag - Mittag: 11 Aufgaben
- Umzugstag - Abend: 11 Aufgaben
- Erste Nacht: 10 Aufgaben
- Erste Woche danach: 11 Aufgaben
- Erster Monat danach: 10 Aufgaben

## Cover-Geometrie

- Innen-Seitenzahl fuer das Cover: `106`
- Rueckenbreite: `0.238712 inch`
- Cover-Gesamtgroesse: `17.488712 x 11.25 inch`
- Ruecken-Text aktiviert: `nein`

## Pruefungen

- Exakte Seitenzahl erreicht: ja
- Geplante DOM-Seitenzahl stimmt mit PDF ueberein: ja
- Keine versehentlichen Leerseiten: ja
- Alle Innen-PDF-Seiten haben dasselbe Format: ja
- Innen-PDF entspricht 8.5 x 11 inch: ja
- Cover-PDF entspricht berechneter KDP-Groesse: ja
- Cover-Template entspricht berechneter KDP-Groesse: ja
- Cover nutzt dieselbe Seitenzahl wie der Innenraum: ja
- Ruecken-Text bei duennem Ruecken deaktiviert: ja
- Innen-PDF enthaelt die Projektfonts Montserrat und Source Sans 3: ja
- Cover-PDF enthaelt die eingebettete Projektfont Montserrat: ja
- Keine offensichtlichen Times-New-Roman-Fallbacks im Innen-PDF: ja
- Keine offensichtlichen Times-New-Roman-Fallbacks im Cover-PDF: ja
- Keine verdaechtigen Magenta-/Pink-/Debug-Stile im Innenraum-HTML/CSS: ja
- Keine hochgesaettigten Farben im Innen-PDF: ja
- Seite-5-Box "Zusatzliche Hinweise" ist neutral und einfarbig: ja
- Keine manuellen *-updated.pdf-Dateien mehr vorhanden: ja
- Mindestens 8 Seitentypen: ja
- Platzhaltertext entfernt: ja
- Keine Passwort-/Zugangsdaten-Aufforderung im Druckprodukt: ja
- Woechentliche Seiten mit 10-14 Aufgaben: ja
- Inhaltsuebersicht hat Seitenbereiche fuer alle nummerierten Abschnitte: ja

## Hinweise

- Keine Roh-Platzhalter in den JSON-Dateien gefunden.
- Keine problematischen Passwort-/Zugangsdaten-Hinweise gefunden.
- Keine verdaechtigen Magenta-/Pink-/Debug-Tokens in styles/*.css oder dist/interior.html gefunden.
- Keine hochgesaettigten Farbflaechen im gerenderten Innen-PDF erkannt.
- Die analysierte Seite-5-Notes-Box bleibt neutral; erlaubte Fuellfarben decken 0.945274 des Hintergrunds ab (250,248,244 | 255,255,255).
- Die PNG-QA-Renders fuer die risikoreichen Innen- und Coverseiten liegen in `output/qa-renders/`.
- Manuelle Sichtpruefung bleibt erforderlich, auch wenn die Render-Abdeckung jetzt Titel-, Divider-, Tabellen-, Prozess- und Coverseiten umfasst.
- KDP Previewer und eine physische Probekopie bleiben der letzte Freigabeschritt.
