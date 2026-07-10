# Umzugscheckliste für Familien

Dieses Projekt erzeugt eine Premium-Innenseite für ein Amazon-KDP-Paperback auf Basis strukturierter JSON-Inhalte, HTML-Templates und druckoptimierter CSS-Dateien.

## Premium-Workflow

```bash
npm install
npm run build
npm run preview
npm run pdf
npm run qa
```

- `npm run build` erzeugt das Generator-HTML in `dist/interior.html`
- `npm run preview` schreibt zusätzlich die KDP-Vorschau nach `output/umzugscheckliste-familien-interior-preview.html`
- `npm run pdf` exportiert `output/umzugscheckliste-familien-interior-premium.pdf`
- `npm run qa` erzeugt `output/qa-report.md`

## Inhaltsquellen

- `content/checklists.json`: Front Matter und Zeitplan
- `content/family-pages.json`: Familie- und Kinderseiten
- `content/packlists.json`: Packsystem und Raum-Packlisten
- `content/budget-pages.json`: Budget- und Kostenverfolgung
- `content/address-change-pages.json`: Adressen, Verträge und Behörden
- `content/handover-pages.json`: Übergabe und Nachbereitung

## Ausgabe

Die Premium-Ausgabe zielt auf `106` Seiten im Format `8.5 x 11 inch` und ist für einen schwarzweißen KDP-Innenraum optimiert.
