# Cover-Arbeitsbereich

Der Innenraum liegt aktuell bei 106 Seiten. Das Cover wird direkt aus der Generator-Seitenzahl berechnet und auf Basis der offiziellen KDP-Formeln für Paperback-Cover aufgebaut:

- Format: `8.5 x 11 inch`
- Innenraum: `black and white`
- Papier: `white paper`
- Seitenzahl: `106`
- Finish: `matte`

## Generierte Dateien

- `cover-source.svg`: editierbare Vektor-Quelldatei, direkt in Figma importierbar
- `cover-spec.json`: berechnete Cover-Geometrie aus der aktuellen Innen-Seitenzahl
- `kdp-cover-template.svg`: Guide-Layer mit Trim, Safe Area, Spine und Barcode-Bereich
- `kdp-cover-template.pdf`: druckbares Guide-PDF
- `cover-export.pdf`: finales Cover-PDF
- `../output/umzugscheckliste-familien-cover.pdf`: Cover-PDF für den Upload

## Geometrie

- Spine-Breite: `0.238712 inch`
- Gesamtgröße Cover-PDF: `17.488712 x 11.25 inch`
- Barcode-Freihaltebereich: `2 x 1.2 inch` auf der Rückseite
- Rücken-Text: bewusst deaktiviert, weil der 106-Seiten-Rücken für sauberen KDP-Sicherheitsabstand zu schmal ist

## Front-Cover-Text

**Titel**  
Umzugscheckliste für Familien

**Untertitel**  
Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern

**Nutzenzeile**  
Mit Wochenplan, Packlisten, Budgetplaner, Adressänderungen, Kinder-Checklisten und Übergabeprotokoll

## Back-Cover-Text

Ein Umzug mit Kindern bringt viele Aufgaben, Termine und kleine Details mit sich. Dieser praktische Umzugsplaner hilft Familien dabei, den Überblick zu behalten und den Umzug Schritt für Schritt zu organisieren.

Enthalten sind Wochen-Checklisten, Packlisten für jedes Zimmer, Budgetseiten, Adressänderungen, Kinder-Checklisten, Notfalltaschen, Erste-Nacht-Planung und Übergabeprotokolle.

Ideal für Familien, die ihren Umzug strukturierter, ruhiger und besser vorbereitet angehen möchten.

## Gestaltungshinweise

- ruhige, warme, vertrauenswürdige Optik
- keine stockfotoartige Familienaufnahme
- offene Sicherheitsränder nach KDP-Vorgaben einhalten
- Barcode-Bereich freihalten
- SVG-Datei bei Bedarf in Figma oder Affinity nachjustieren und anschließend erneut als PDF exportieren
