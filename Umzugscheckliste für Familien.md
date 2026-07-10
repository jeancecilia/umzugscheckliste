## Ticket: Create Amazon KDP Product — “Umzugscheckliste für Familien”

## 1. Objective

Create a print-ready Amazon KDP paperback product titled:

## Umzugscheckliste für Familien

The product should be a practical German-language moving planner for families, not a generic checklist notebook. It should help parents organize a move before, during, and after moving day, with special focus on children, school, Kita, packing, budget, address changes, handover, and first-night organization.

The final output must include:

- 1. Print-ready interior PDF

- 2. Print-ready cover PDF

- 3. Editable source files

- 4. KDP metadata draft

- 5. QA checklist before upload

## 2. Product Positioning

## Main product angle

## Stressfrei umziehen mit Kindern

The product should solve the emotional and practical chaos of moving with a family.

## Target audience

German-speaking families who are:

- moving with children

- changing school or Kita

- organizing a household move

- looking for a structured printable planner

- overwhelmed by deadlines, packing, documents, helpers, and handovers

## Product type

Paperback planner / workbook / checklist book.


## Recommended format

- Language: German

- Interior: black and white

- Format: large planner format, ideally 8.5 x 11 inch or similar large KDP paperback size

- Page count target: 110–130 pages

- Cover: matte, clean, warm, family-oriented

- Interior style: practical, structured, minimal, easy to write in

## 3. Final Title and Subtitle

## Title

## Umzugscheckliste für Familien

## Subtitle

Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern

## Optional cover benefit line

Mit Wochenplan, Packlisten, Budgetplaner, Adressänderungen, Kinder-Checklisten & Übergabeprotokoll

## 4. Technical Stack

## Interior creation

## Use:

- VS Code

- HTML

- CSS print layout

- JSON content files

- Playwright or Puppeteer for PDF export

## Cover creation

## Use one of:

- Figma

- Canva

- Affinity Publisher

- Affinity Designer

Recommended: Figma for better control, Canva for faster execution.


## PDF generation

Use Playwright or Puppeteer to export the final interior PDF.

## KDP validation

## Use:

- KDP Previewer

- KDP cover calculator/template

- Manual PDF inspection

KDP offers paperback/hardcover manuscript templates and requires correct print formatting for trim size, margins, and bleed.

## 5. Repository / Folder Structure

Create the following structure:

```
kdp-umzugscheckliste-familien/
package.json
README.md
content/
book-config.json
sections.json
checklists.json
packlists.json
budget.json
address-changes.json
handover.json
notes.json
src/
build.js
generate-html.js
generate-pdf.js
templates/
base.html
cover-page.html
checklist-page.html
weekly-checklist-page.html
packlist-page.html
budget-page.html
address-change-page.html
handover-page.html
notes-page.html
divider-page.html
```


```
styles/
print.css
components.css
dist/
interior.html
output/
umzugscheckliste-familien-interior.pdf
umzugscheckliste-familien-cover.pdf
cover/
kdp-cover-template.pdf
cover-source.fig
cover-export.pdf
qa/
print-checklist.md
upload-checklist.md
```

## 6. Interior Page Plan

Target page count: approximately 120 pages

## Section 1: Front Matter — 6 pages

- 1. Title page

- 2. Copyright / disclaimer page

- 3. Willkommen page

- 4. So benutzt du diesen Umzugsplaner

- 5. Unser Umzug auf einen Blick

- 6. Wichtige Kontakte

## Section 2: Master Moving Overview — 8 pages

- 1. Umzugsdaten & Fristen

- 2. Alte Wohnung — Übersicht

- 3. Neue Wohnung — Übersicht

- 4. Mietvertrag & wichtige Dokumente

- 5. Schlüssel, Termine & Ansprechpartner

- 6. Helferübersicht

- 7. Umzugsunternehmen vergleichen

- 8. Prioritätenliste für die Familie

## Section 3: Timeline Checklists — 22 pages

- 1. 12 Wochen vor dem Umzug

- 2. 10 Wochen vor dem Umzug


3. 8 Wochen vor dem Umzug 4. 6 Wochen vor dem Umzug 5. 4 Wochen vor dem Umzug 6. 3 Wochen vor dem Umzug 7. 2 Wochen vor dem Umzug 8. 1 Woche vor dem Umzug 9. 3 Tage vor dem Umzug 10. 1 Tag vor dem Umzug 11. Umzugstag — Morgen 12. Umzugstag — Mittag 13. Umzugstag — Abend 14. Erste Nacht im neuen Zuhause 15. Erste Woche nach dem Umzug 16. Erster Monat nach dem Umzug 31–36. Additional weekly planning pages

## Section 4: Family & Children Pages — 16 pages

1. Kinder auf den Umzug vorbereiten 2. Gesprächsnotizen mit den Kindern 3. Lieblingssachen-Box pro Kind 4. Erste-Nacht-Box für Kinder 5. Kita-Wechsel Checkliste 6. Schulwechsel Checkliste 7. Neue Wege: Schule, Kita, Arzt 8. Kinderbetreuung am Umzugstag 9. Baby- und Kleinkind-Checkliste 10. Medikamente & Notfalltasche 11. Familienroutine vor dem Umzug 12. Familienroutine nach dem Umzug 13. Emotionale To-dos für Kinder 14. Abschied von alter Wohnung / Nachbarschaft 15. Ankommen im neuen Zuhause 16. Familien-Notizen

## Section 5: Packing System — 28 pages

1. Packstrategie 2. Kartonnummern-System 3. Farbcodes nach Zimmern 4. Packliste Küche 5. Packliste Bad 6. Packliste Elternschlafzimmer 7. Packliste Kinderzimmer 1 8. Packliste Kinderzimmer 2 9. Packliste Wohnzimmer 10. Packliste Arbeitszimmer 11. Packliste Keller / Abstellraum 12. Packliste Balkon / Garten 13. Packliste Dokumente 14. Packliste Kleidung 15. Packliste Spielzeug


16. Packliste Technik 17. Packliste Reinigungsmittel 18. Packliste Haustiere 19. Zerbrechliche Gegenstände 20. Möbel-Abbau Plan 21. Möbel-Aufbau Plan 22. Was zuerst ausgepackt werden muss 23. Erste-Nacht-Box Familie 24. Notfalltasche Umzugstag 77–80. Blank packlist pages

## Section 6: Budget & Costs — 10 pages

- 1. Umzugsbudget Übersicht 2. Umzugsunternehmen Kostenvergleich 3. Transportkosten 4. Renovierungskosten 5. Neue Möbel / Anschaffungen 6. Kaution / Mietkosten 7. Schule / Kita / Familie Zusatzkosten 8. Unerwartete Kosten 9. Bezahlte Rechnungen 10. Gesamtkosten-Auswertung

## Section 7: Address Changes & Contracts — 12 pages

1. Adressänderungen Übersicht 2. Behörden & Ämter 3. Banken & Versicherungen 4. Arbeitgeber & Schule / Kita 5. Internet, Strom, Gas, Wasser 6. Streaming, Abos & Mitgliedschaften 7. Ärzte & Apotheken 8. Familie & Freunde 9. Nachsendeauftrag 10. Verträge kündigen / ummelden 11. Neue Verträge einrichten 12. Offene Rückmeldungen

## Section 8: Apartment Handover — 10 pages

1. Alte Wohnung Übergabe 2. Neue Wohnung Übergabe 3. Zählerstände 4. Schlüsselübergabe 5. Schäden & Mängel dokumentieren 6. Renovierungsarbeiten 7. Reinigungsplan alte Wohnung 8. Reinigungsplan neue Wohnung 9. Fotos / Dokumentationsliste 10. Übergabe-Notizen


## Section 9: Back Matter / Notes — 8–18 pages

1. Was noch offen ist 2. Dinge, die wir nicht vergessen dürfen 3. Einkaufsliste nach dem Umzug 4. Erste Woche Essensplan 5. Neue Umgebung erkunden 6. Wichtige Erfahrungen für den nächsten Umzug 119–128. Blank notes pages, depending on final page count

## 7. Content Requirements

## Tone

German, clear, practical, family-friendly.

## Avoid:

- overcomplicated legal language • generic filler pages • empty repetitive pages without value • AI-sounding text

- overly childish wording

Use phrases like:

- “Erledigt” • “Notizen” • “Wichtig” • “Termin” • “Ansprechpartner” • “Für jedes Kind” • “Nicht vergessen” • “Vor dem Umzug”

- “Nach dem Umzug”

## Checklist style

Each checklist page should include:

- Page title • Short helpful intro, 1–2 sentences max • Checklist table • Notes section

- Optional “Wichtigste Aufgabe dieser Woche” field

Example structure:


- 4 Wochen vor dem Umzug

Jetzt beginnt die konkrete Vorbereitung. In dieser Phase sollten Verträge, Adressänderungen und die wichtigsten Familientermine organisiert werden.

[ ] Nachsendeauftrag vorbereiten

[ ] Stromanbieter informieren

[ ] Internetvertrag ummelden

[ ] Schule oder Kita über den Umzug informieren

[ ] Kinderbetreuung für den Umzugstag planen

[ ] Wichtige Dokumente separat sammeln

Wichtigste Aufgabe dieser Woche:

\________________________________________

Notizen:

\________________________________________

## 8. JSON Content Model

Create structured data like this:

```
{
"book": {
"title": "Umzugscheckliste für Familien",
"subtitle":
"Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern",
"language": "de",
"trimSize": "8.5x11",
"pageTarget": 120
},
"sections": [
{
"type": "weeklyChecklist",
"title": "4 Wochen vor dem Umzug",
"intro": "Jetzt beginnt die konkrete Vorbereitung. In dieser Phase
sollten Verträge, Adressänderungen und die wichtigsten Familientermine
organisiert werden.",
"items": [
"Nachsendeauftrag vorbereiten",
"Stromanbieter informieren",
"Internetvertrag ummelden",
"Schule oder Kita über den Umzug informieren",
"Kinderbetreuung für den Umzugstag planen",
"Wichtige Dokumente separat sammeln"
]
}
```


```
]
}
```

## 9. Interior Design Requirements

## General style

- Clean and practical

- Minimal decoration

- Good writing space

- Clear hierarchy

- No heavy ink usage

- No full black backgrounds

- No complicated graphics

## Typography

Use free commercial fonts only.

## Recommended:

- Headings: Montserrat, Poppins, or Lato

- Body: Open Sans, Arial, or Source Sans 3

## Layout rules

- Large page title at top

- Thin divider line below title

- Tables with enough writing space

- Checkboxes should be large enough to use

- Avoid text too close to page edges

- Use consistent spacing

- Every major section should have a divider page

## Print CSS example

```
@page {
size: 8.5in 11in;
margin: 0.55in;
}
body {
font-family: Arial, sans-serif;
font-size: 11pt;
color: #111;
}
.page {
page-break-after: always;
```


```
min-height: 9.9in;
}
h1 {
font-size: 24pt;
margin-bottom: 8px;
}
.subtitle {
font-size: 11pt;
color: #444;
margin-bottom: 18px;
}
.checklist-row {
display: grid;
grid-template-columns: 28px 1fr 150px;
border-bottom: 1px solid #ccc;
padding: 9px 0;
}
.checkbox {
width: 14px;
height: 14px;
border: 1.5px solid #111;
display: inline-block;
}
.notes-box {
border: 1px solid #bbb;
min-height: 120px;
margin-top: 16px;
padding: 10px;
}
```

## 10. Required Page Components

Create reusable templates for:

## Checklist page

Fields:

- title

- intro

- checklist items

- notes area


## Weekly checklist page

## Fields:

- week label • priority field • checklist • appointment field

- notes

## Packlist page

## Fields:

- room name

- item list

- box number

- priority

- notes

## Budget page

## Fields:

- cost category • planned cost • actual cost • paid checkbox

- notes

## Address-change page

## Fields:

- institution / person • old address updated? • confirmation received?

- notes

## Handover page

## Fields:

- room • condition • damages • photos taken • notes


## Notes page

## Fields:

- title

- lined writing area

## 11. Cover Design Ticket

## Cover goal

Create a trustworthy, clean, warm paperback cover for German families.

## Cover style

Modern, calm, organized, family-friendly.

## Visual direction

## Use:

- moving boxes

- house outline

- checklist icon

- family silhouette or simple illustration

- warm neutral colors

- soft blue, beige, green, or terracotta accents

## Avoid:

- childish cartoon style

- cluttered design

- stock-photo-looking family images

- too many icons

- dark heavy background

## Front cover text

```
Umzugscheckliste für Familien
Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern
Mit Wochenplan, Packlisten, Budgetplaner, Adressänderungen, Kinder-Checklisten & Übergabeprotokoll
```


## Back cover text

Ein Umzug mit Kindern bringt viele Aufgaben, Termine und kleine Details mit sich. Dieser praktische Umzugsplaner hilft Familien dabei, den Überblick zu behalten und den Umzug Schritt für Schritt zu organisieren.

Enthalten sind Wochen-Checklisten, Packlisten für jedes Zimmer, Budgetseiten, Adressänderungen, Kinder-Checklisten, Notfalltaschen, Erste-Nacht-Planung und Übergabeprotokolle.

Ideal für Familien, die ihren Umzug strukturierter, ruhiger und besser vorbereitet angehen möchten.

## Spine

Use spine text only if page count is safely above KDP’s minimum for spine text. KDP says spine text requires at least 79 pages for uploaded covers; otherwise the cover can be rejected.

Spine text:

Umzugscheckliste für Familien

## 12. KDP Metadata Draft

## Title

Umzugscheckliste für Familien

## Subtitle

Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern

## Author / Publisher

Use the selected KDP pen name or brand name.

## Description

Umziehen mit Kindern muss nicht chaotisch sein.

Dieser praktische Umzugsplaner hilft Familien dabei, den gesamten Umzug Schritt für Schritt zu organisieren — von den ersten Vorbereitungen bis zur Wohnungsübergabe und dem Ankommen im neuen Zuhause.

Enthalten sind übersichtliche Wochen-Checklisten, Packlisten für jedes Zimmer, Budgetseiten, Adressänderungslisten, Übergabeprotokolle und spezielle


Familienseiten für Kinder, Schule, Kita, Notfalltaschen und die erste Nacht im neuen Zuhause.

Ideal für Familien, die ihren Umzug strukturiert planen und nichts Wichtiges vergessen möchten.

## Inhalt:

- \- Umzugschecklisten für jede Phase

- \- Packlisten für Küche, Bad, Kinderzimmer, Schlafzimmer und Wohnzimmer

- \- Budgetplaner für Umzugskosten

- \- Adressänderungs- und Behördenlisten

- \- Checklisten für Schule, Kita und Kinderbetreuung

- \- Erste-Nacht-Box und Notfalltasche

- \- Wohnungsübergabe und Zählerstände

- \- Platz für Notizen und eigene Planung

Ein praktischer Begleiter für einen ruhigeren, besser organisierten Familienumzug.

## Keyword ideas

Use these as KDP backend keyword candidates:

umzugscheckliste familie umzugsplaner familien umzug mit kindern checkliste umzug organisieren planer packliste umzug familie wohnungsübergabe protokoll umzug stressfrei umziehen mit kindern

## Category direction

Choose the closest available KDP categories around:

- Haushalt

- Familie

- Ratgeber

- Organisation

- Wohnen

- Umzug

- Selbstmanagement

## 13. Development Tasks

## Task 1: Project setup

- Create VS Code project


- Initialize Node.js project

- Install Playwright or Puppeteer

- Create folder structure

- Add build scripts

## Acceptance criteria:

- npm run build creates HTML

- npm run pdf creates PDF

- Output folder contains generated interior PDF

## Task 2: Create content files

- Create book-config.json

- Create all section JSON files

- Add all checklist content in German

- Add all packlist content

- Add all budget pages

- Add all handover pages

- Add all family-specific pages

## Acceptance criteria:

- All planned pages exist in structured JSON

- No obvious duplicate filler pages

- All German text is readable and natural

- Family-specific content is clearly included

## Task 3: Build HTML generator

## Create script that:

- reads JSON content

- applies page templates

- generates dist/interior.html

- inserts page breaks correctly

- adds section divider pages

- counts pages approximately

## Acceptance criteria:

- HTML renders all planned sections

- Each page starts and ends cleanly

- No content overlaps across page breaks


## Task 4: Create print CSS

Create print-focused CSS with:

- KDP-safe margins

- consistent typography

- checklist rows

- budget tables

- notes boxes

- divider pages

- blank notes pages

- no excessive ink usage

## Acceptance criteria:

- PDF has consistent margins

- Text is not too close to edges

- Tables are readable

- Checkboxes print clearly

- Writing areas have enough space

## Task 5: PDF export

Use Playwright/Puppeteer to export:

output/umzugscheckliste-familien-interior.pdf

## Acceptance criteria:

- PDF opens correctly

- PDF has correct page size

- Page count is 110–130 pages

- No broken fonts

- No cut-off content

- No accidental blank pages except intentional notes pages

## Task 6: Cover design

- Download official KDP cover template based on final trim size, page count, ink type, and paper type

- Create front, spine, and back cover

- Export print-ready PDF

- Ensure barcode area remains clear

## Acceptance criteria:

- Cover matches exact KDP template

- Front cover title is readable at thumbnail size


- Back cover text is readable

- Spine text included only if page count qualifies

- Barcode area is not covered

- Final file exports as PDF

## Task 7: QA review

## Check:

- spelling and grammar

- page order

- page count

- margins

- trim size

- cover dimensions

- interior PDF rendering

- no duplicate pages by accident

- no copyrighted images

- no trademark-heavy design

- no misleading claims

- no medical/legal advice beyond simple organization

## Acceptance criteria:

- Interior passes manual review

- Cover passes manual review

- Product is ready for KDP Previewer

## Task 8: KDP upload preparation

## Prepare:

- title

- subtitle

- author name

- description

- keywords

- categories

- AI disclosure answer

- print options

- price suggestion

- interior PDF

- cover PDF

## Acceptance criteria:

- All upload fields are prepared before opening KDP

- AI usage is documented honestly

- KDP Previewer shows no layout errors


## 14. Quality Rules

The product must feel like a real planner.

## Do not create:

- 100 pages of repeated blank checklists

- generic “notes” filler

- obviously AI-generated German

- messy tables

- tiny writing areas

- thin content that feels cheap

The product should include enough family-specific value that a buyer can immediately understand why it exists.

## Minimum quality standard:

- At least 30 pages should be strongly family-specific or moving-specific

- At least 20 pages should be practical checklists

- At least 20 pages should be packlists / organization pages

- At least 8 pages should cover budget and cost tracking

- At least 8 pages should cover handover, documents, and address changes

## 15. Definition of Done

This ticket is complete when:

- 1. Interior PDF is generated from VS Code

- 2. Interior has 110–130 pages

- 3. German text is reviewed and corrected

- 4. Page layout is consistent

- 5. Cover PDF is created using KDP template

- 6. Metadata draft is complete

- 7. AI disclosure decision is documented

- 8. KDP Previewer shows no critical errors

- 9. Product is ready for upload to Amazon KDP

## 16. Recommended Milestones

## Milestone 1: Content architecture

## Deliver:

- full page plan

- JSON structure


- first 20 pages of content

## Milestone 2: Interior generator

## Deliver:

- HTML templates

- CSS print layout

- generated test PDF

## Milestone 3: Full interior

## Deliver:

- complete 110–130 page PDF

- reviewed German text

- final page order

## Milestone 4: Cover and upload assets

## Deliver:

- final cover PDF

- KDP metadata

- upload checklist

## 17. Final Deliverables

```
umzugscheckliste-familien-interior.pdf
umzugscheckliste-familien-cover.pdf
book-config.json
sections.json
checklists.json
packlists.json
budget.json
address-changes.json
handover.json
print.css
build.js
kdp-metadata.txt
qa-checklist.md
```
