# QA Report

- PDF-Datei: `output/umzugscheckliste-familien-interior-premium.pdf`
- Preview-Datei: `output/umzugscheckliste-familien-interior-preview.html`
- Cover-Datei: `output/umzugscheckliste-familien-cover.pdf`
- Geplante Seiten aus JSON/Generator: `106`
- Ziel-Seitenzahl aus Config: `106`
- Tatsächliche Innen-PDF-Seiten: `106`
- Innen-PDF-Formate: `8.5 x 11 inch`
- Leerseiten per Textprüfung: `0`
- Leerseiten per Bildprüfung: `0`
- Unterschiedliche Seitentypen: `17`
- Platzhaltertreffer: `0`
- Sensible Formulierungen: `0`
- Verdaechtige Innenraum-Farbtreffer im HTML/CSS: `0`
- Maximale gemessene Saettigung im Innen-PDF: `0.225`
- Innen-PDF-Schriften: `AAAAAA+SourceSans3ExtraLight-Bold, BAAAAA+MontserratThin-Bold, CAAAAA+SourceSans3ExtraLight-Regular, DAAAAA+SourceSans3ExtraLight-SemiBold, EAAAAA+MontserratThin-SemiBold`
- Cover-PDF-Schriften: `AAAAAA+MontserratThin-Bold, BAAAAA+MontserratThin-SemiBold`

## Wöchentliche Checklisten

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

- Innen-Seitenzahl für das Cover: `106`
- Rückenbreite: `0.238712 inch`
- Cover-Gesamtgröße: `17.488712 x 11.25 inch`
- Rücken-Text aktiviert: `nein`

## Prüfungen

- Exakte Seitenzahl erreicht: ja
- Geplante DOM-Seitenzahl stimmt mit PDF überein: ja
- Keine versehentlichen Leerseiten: ja
- Alle Innen-PDF-Seiten haben dasselbe Format: ja
- Innen-PDF entspricht 8.5 x 11 inch: ja
- Cover-PDF entspricht berechneter KDP-Größe: ja
- Cover-Template entspricht berechneter KDP-Größe: ja
- Cover nutzt dieselbe Seitenzahl wie der Innenraum: ja
- Rücken-Text bei dünnem Rücken deaktiviert: ja
- Innen-PDF enthält die Projektfonts Montserrat und Source Sans 3: ja
- Cover-PDF enthält die eingebettete Projektfont Montserrat: ja
- Keine offensichtlichen Times-New-Roman-Fallbacks im Innen-PDF: ja
- Keine offensichtlichen Times-New-Roman-Fallbacks im Cover-PDF: ja
- Keine verdaechtigen Magenta-/Pink-/Debug-Stile im Innenraum-HTML/CSS: ja
- Keine hochgesaettigten Farben im Innen-PDF: ja
- Mindestens 8 Seitentypen: ja
- Platzhaltertext entfernt: ja
- Keine Passwort-/Zugangsdaten-Aufforderung im Druckprodukt: ja
- Wöchentliche Seiten mit 10-14 Aufgaben: ja
- Inhaltsübersicht hat Seitenbereiche für alle nummerierten Abschnitte: ja
- How-to-Übersicht hat Seitenbereiche für alle nummerierten Abschnitte: ja

## Hinweise

- Keine Roh-Platzhalter in den JSON-Dateien gefunden.
- Keine problematischen Passwort-/Zugangsdaten-Hinweise gefunden.
- Keine verdächtigen Magenta-/Pink-/Debug-Tokens in `styles/*.css` oder `dist/interior.html` gefunden.
- Keine hochgesättigten Farbflächen im gerenderten Innen-PDF erkannt.
- Manuelle Sichtprüfung bleibt erforderlich für Titel-, Divider-, Budget-, Prozess- und Coverseiten.
- KDP Previewer und eine physische Probekopie bleiben der letzte Freigabeschritt.
