const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { buildPageList } = require("./generate-html");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "output");
const contentDir = path.join(rootDir, "content");
const qaPath = path.join(outputDir, "qa-report.md");
const pdfPath = path.join(outputDir, "umzugscheckliste-familien-interior-premium.pdf");

function scanPlaceholders() {
  const placeholders = ["Eintrag 1", "Eintrag 2", "Punkt 1", "Stelle 1", "Eigener Bereich"];
  const files = fs
    .readdirSync(contentDir)
    .filter((fileName) => fileName.endsWith(".json"));

  const hits = [];
  for (const fileName of files) {
    const content = fs.readFileSync(path.join(contentDir, fileName), "utf8");
    for (const token of placeholders) {
      if (content.includes(token)) {
        hits.push(`${fileName}: ${token}`);
      }
    }
  }
  return hits;
}

function inspectPdf() {
  const script = `
import fitz, json, sys
pdf = fitz.open(sys.argv[1])
blank = []
for index, page in enumerate(pdf):
    text = page.get_text("text").strip().replace("\\n", " ").strip()
    if len(text) <= 5:
        blank.append(index + 1)
rect = pdf[0].rect
print(json.dumps({
  "pageCount": pdf.page_count,
  "widthIn": round(rect.width / 72, 6),
  "heightIn": round(rect.height / 72, 6),
  "blankPages": blank
}))
`;

  const raw = execFileSync("python", ["-c", script, pdfPath], {
    cwd: rootDir,
    encoding: "utf8"
  });

  return JSON.parse(raw);
}

function generateQaReport() {
  const pages = buildPageList();
  const pageKinds = new Set(pages.map((page) => page.kind));
  const weeklyPages = pages.filter((page) => page.kind === "weeklyChecklist");
  const placeholderHits = scanPlaceholders();
  const pdf = inspectPdf();

  const weeklyRanges = weeklyPages.map(
    (page) => `${page.title}: ${page.items.length} Aufgaben`
  );

  const report = `# QA Report

- PDF-Datei: \`output/umzugscheckliste-familien-interior-premium.pdf\`
- Preview-Datei: \`output/umzugscheckliste-familien-interior-preview.html\`
- Seitenzahl: \`${pdf.pageCount}\`
- PDF-Format: \`${pdf.widthIn} x ${pdf.heightIn} inch\`
- Leerseiten erkannt: \`${pdf.blankPages.length}\`
- Unterschiedliche Seitentypen: \`${pageKinds.size}\`
- Platzhaltertreffer: \`${placeholderHits.length}\`

## Wöchentliche Checklisten

${weeklyRanges.map((line) => `- ${line}`).join("\n")}

## Prüfungen

- Keine versehentlichen Leerseiten: ${pdf.blankPages.length === 0 ? "ja" : `nein (${pdf.blankPages.join(", ")})`}
- Seitenzahl im Zielbereich 96-112: ${pdf.pageCount >= 96 && pdf.pageCount <= 112 ? "ja" : "nein"}
- Mindestens 8 Seitentypen: ${pageKinds.size >= 8 ? "ja" : "nein"}
- Platzhaltertext entfernt: ${placeholderHits.length === 0 ? "ja" : "nein"}
- Wöchentliche Seiten mit 10-14 Aufgaben: ${weeklyPages.every((page) => page.items.length >= 10 && page.items.length <= 14) ? "ja" : "nein"}

## Hinweise

${placeholderHits.length === 0 ? "- Keine Roh-Platzhalter in den JSON-Dateien gefunden." : placeholderHits.map((line) => `- ${line}`).join("\n")}

- KDP Previewer muss weiterhin manuell mit den finalen PDFs geprüft werden.
`;

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(qaPath, report, "utf8");
  console.log(`Generated ${qaPath}`);
}

generateQaReport();
