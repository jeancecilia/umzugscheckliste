# Umzugscheckliste für Familien

Dieses Projekt erzeugt den Innenraum, die Cover-Datei und die QA-Artefakte für einen KDP-Planer im Format `8.5 x 11 inch`.

## Voraussetzungen

- Node.js 18+ und `npm`
- Python 3 mit `pip`
- PyMuPDF für PDF-Normalisierung und QA
- Playwright Chromium für PDF-Export

## Setup

```bash
npm install
python -m pip install pymupdf
npx playwright install chromium
```

Die Generatoren betten lokale Open-Source-Fonts in HTML und Cover ein. Dafür müssen die npm-Abhängigkeiten installiert sein, bevor `build`, `pdf` oder `cover` laufen.

## Wichtige Befehle

```bash
npm run build
npm run preview
npm run pdf
npm run cover
npm run qa
npm run build:all
```

- `npm run build` erzeugt `dist/interior.html` und aktualisiert die Preview-Datei.
- `npm run preview` baut das Innenlayout und schreibt die KDP-Vorschau nach `output/umzugscheckliste-familien-interior-preview.html`.
- `npm run pdf` exportiert `output/umzugscheckliste-familien-interior-premium.pdf`.
- `npm run cover` exportiert `output/umzugscheckliste-familien-cover.pdf` sowie die Cover-Hilfsdateien unter `cover/`.
- `npm run qa` prüft Innen-PDF, Cover-Geometrie, Seitenzahl, Platzhalter und schreibt `output/qa-report.md`.
- `npm run build:all` führt Innenraum, Cover und QA in der üblichen Reihenfolge aus.

## Inhaltsquellen

- `content/checklists.json`: Front Matter und Zeitplan
- `content/family-pages.json`: Familie- und Kinderseiten
- `content/packlists.json`: Packsystem und Raum-Packlisten
- `content/budget-pages.json`: Budget- und Kostenverfolgung
- `content/address-change-pages.json`: Adressen, Verträge und Behörden
- `content/handover-pages.json`: Übergabe und Nachbereitung

## Ausgabe

- Ziel-Seitenzahl: `106`
- Innenraum: `Schwarzweiß`
- Cover-Geometrie: wird aus der aktuellen Generator-Seitenzahl berechnet
- Wichtige Dateien:
  - `output/umzugscheckliste-familien-interior-premium.pdf`
  - `output/umzugscheckliste-familien-interior-preview.html`
  - `output/umzugscheckliste-familien-cover.pdf`
  - `output/qa-report.md`

## Letzter Freigabeschritt

Vor einem KDP-Upload immer zusätzlich:

- Innen- und Cover-PDF im KDP Previewer testen
- Spine- und Covermaße gegen das aktuelle `cover-spec.json` prüfen
- Eine physische Probekopie für Linien, Graustufen und Schreibflächen bestellen
