const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { buildPageList } = require("./generate-html");
const { getCoverSpec } = require("./generate-cover");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "output");
const contentDir = path.join(rootDir, "content");
const coverDir = path.join(rootDir, "cover");
const styleDir = path.join(rootDir, "styles");
const distDir = path.join(rootDir, "dist");
const qaPath = path.join(outputDir, "qa-report.md");
const pdfPath = path.join(outputDir, "umzugscheckliste-familien-interior-premium.pdf");
const coverPdfPath = path.join(outputDir, "umzugscheckliste-familien-cover.pdf");
const templatePdfPath = path.join(coverDir, "kdp-cover-template.pdf");
const interiorHtmlPath = path.join(distDir, "interior.html");

const INTERIOR_SOURCE_FILES = [
  path.join(styleDir, "theme.css"),
  path.join(styleDir, "components.css"),
  path.join(styleDir, "print.css"),
  interiorHtmlPath
];

const DISALLOWED_STYLE_TOKENS = [
  "magenta",
  "hotpink",
  "deeppink",
  "fuchsia",
  "pink",
  "debug",
  "highlight"
];

function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(contentDir, "book-config.json"), "utf8"));
}

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

function scanSensitiveCopy() {
  const warnings = [];
  const checks = [
    {
      token: "Passwörter / Zugänge",
      replacement: "Keine Passwörter in Druckprodukten notieren"
    },
    {
      token: "Zugangsdaten sicher notieren",
      replacement: "Lieber Passwortmanager statt gedruckter Zugangsliste"
    }
  ];

  for (const fileName of fs.readdirSync(contentDir).filter((name) => name.endsWith(".json"))) {
    const content = fs.readFileSync(path.join(contentDir, fileName), "utf8");
    for (const check of checks) {
      if (content.includes(check.token)) {
        warnings.push(`${fileName}: ${check.token} -> ${check.replacement}`);
      }
    }
  }

  return warnings;
}

function normalizeFontName(fontName) {
  return String(fontName || "")
    .replace(/^[A-Z]{6}\+/, "")
    .replace(/[^a-z0-9]+/gi, "")
    .toLowerCase();
}

function hasFontFamily(fonts, expectedFamily) {
  const normalizedFonts = fonts.map(normalizeFontName);
  return normalizedFonts.some((font) => font.includes(expectedFamily));
}

function findFallbackFonts(fonts) {
  return fonts.filter((font) => /timesnewroman/i.test(font));
}

function clampChannel(value) {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function getColorSaturation(rgb) {
  const [r, g, b] = rgb.map((value) => value / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return max === 0 ? 0 : (max - min) / max;
}

function normalizeHexColor(hex) {
  const raw = hex.slice(1).toLowerCase();

  if (raw.length === 3 || raw.length === 4) {
    return [
      parseInt(raw[0] + raw[0], 16),
      parseInt(raw[1] + raw[1], 16),
      parseInt(raw[2] + raw[2], 16)
    ];
  }

  if (raw.length === 6 || raw.length === 8) {
    return [
      parseInt(raw.slice(0, 2), 16),
      parseInt(raw.slice(2, 4), 16),
      parseInt(raw.slice(4, 6), 16)
    ];
  }

  return null;
}

function normalizeRgbColor(match) {
  const channels = [match[1], match[2], match[3]].map((value) =>
    value.trim().endsWith("%")
      ? clampChannel((parseFloat(value) / 100) * 255)
      : clampChannel(parseFloat(value))
  );

  if (channels.some((value) => Number.isNaN(value))) {
    return null;
  }

  return channels;
}

function inspectInteriorSourceColors() {
  const suspiciousColors = [];
  const suspiciousTokens = [];

  const hexColorPattern = /#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})\b/gi;
  const rgbColorPattern =
    /rgba?\(\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)\s*,\s*([0-9.]+%?)(?:\s*,\s*([0-9.]+%?))?\s*\)/gi;

  for (const filePath of INTERIOR_SOURCE_FILES) {
    if (!fs.existsSync(filePath)) {
      continue;
    }

    const content = fs.readFileSync(filePath, "utf8");
    const scanContent = content.replace(/data:font\/woff2;base64,[A-Za-z0-9+/=]+/g, "");
    const relativePath = path.relative(rootDir, filePath);
    const lowerContent = scanContent.toLowerCase();

    for (const token of DISALLOWED_STYLE_TOKENS) {
      if (lowerContent.includes(token)) {
        suspiciousTokens.push(`${relativePath}: token "${token}" gefunden`);
      }
    }

    let hexMatch;
    while ((hexMatch = hexColorPattern.exec(scanContent)) !== null) {
      const rgb = normalizeHexColor(hexMatch[0]);
      if (!rgb) {
        continue;
      }

      const saturation = getColorSaturation(rgb);
      if (saturation >= 0.35) {
        suspiciousColors.push(
          `${relativePath}: ${hexMatch[0]} (Saettigung ${saturation.toFixed(2)})`
        );
      }
    }

    let rgbMatch;
    while ((rgbMatch = rgbColorPattern.exec(scanContent)) !== null) {
      const rgb = normalizeRgbColor(rgbMatch);
      if (!rgb) {
        continue;
      }

      const saturation = getColorSaturation(rgb);
      if (saturation >= 0.35) {
        suspiciousColors.push(
          `${relativePath}: ${rgbMatch[0]} (Saettigung ${saturation.toFixed(2)})`
        );
      }
    }
  }

  return {
    suspiciousColors: [...new Set(suspiciousColors)],
    suspiciousTokens: [...new Set(suspiciousTokens)]
  };
}

function inspectPdf(pdfFilePath) {
  const script = `
import fitz, json, sys
pdf = fitz.open(sys.argv[1])
blank = []
visual_blank = []
sizes = []
fonts = []
saturated_pages = []
max_saturation = 0.0
for index, page in enumerate(pdf):
    text = page.get_text("text").strip().replace("\\n", " ").strip()
    if len(text) <= 5:
        blank.append(index + 1)
    pix = page.get_pixmap(matrix=fitz.Matrix(0.18, 0.18), colorspace=fitz.csGRAY, alpha=False)
    pixels = list(pix.samples)
    nonwhite = sum(1 for value in pixels if value < 245)
    ratio = nonwhite / max(1, len(pixels))
    if ratio < 0.006 and len(text) <= 12:
        visual_blank.append(index + 1)
    rect = page.rect
    sizes.append([round(rect.width / 72, 6), round(rect.height / 72, 6)])
    for font in page.get_fonts():
        base_font = font[3]
        if base_font not in fonts:
            fonts.append(base_font)
    color_pix = page.get_pixmap(matrix=fitz.Matrix(0.22, 0.22), colorspace=fitz.csRGB, alpha=False)
    samples = color_pix.samples
    colored = 0
    total = max(1, len(samples) // 3)
    page_max = 0.0
    for offset in range(0, len(samples), 3):
        r = samples[offset] / 255
        g = samples[offset + 1] / 255
        b = samples[offset + 2] / 255
        channel_max = max(r, g, b)
        channel_min = min(r, g, b)
        saturation = 0 if channel_max == 0 else (channel_max - channel_min) / channel_max
        if saturation > page_max:
            page_max = saturation
        if saturation >= 0.35 and channel_max >= 0.2:
            colored += 1
    ratio = colored / total
    if page_max > max_saturation:
        max_saturation = page_max
    if ratio >= 0.0005:
        saturated_pages.append({
            "page": index + 1,
            "ratio": round(ratio, 6),
            "maxSaturation": round(page_max, 4)
        })

unique_sizes = []
for size in sizes:
    if size not in unique_sizes:
        unique_sizes.append(size)

print(json.dumps({
  "pageCount": pdf.page_count,
  "pageSizes": unique_sizes,
  "blankPages": blank,
  "visualBlankPages": visual_blank,
  "fonts": fonts,
  "saturatedPages": saturated_pages,
  "maxSaturation": round(max_saturation, 4)
}))
`;

  const raw = execFileSync("python", ["-c", script, pdfFilePath], {
    cwd: rootDir,
    encoding: "utf8"
  });

  return JSON.parse(raw);
}

function inspectContentsCoverage(pages) {
  const contentsPage = pages.find((page) => page.kind === "contentsPage");
  const howToPage = pages.find((page) => page.kind === "howToUse");

  const contentsMarkers = contentsPage
    ? contentsPage.entries.filter((entry) => entry.marker || entry.range).length
    : 0;
  const howToMarkers = howToPage
    ? howToPage.sections.filter((entry) => entry.marker || entry.range).length
    : 0;

  return {
    contentsMarkers,
    howToMarkers,
    expectedContentsMarkers: contentsPage ? contentsPage.entries.length - 1 : 0,
    expectedHowToMarkers: howToPage ? howToPage.sections.length - 1 : 0
  };
}

function inspectCover() {
  const spec = getCoverSpec();
  const outputPdf = inspectPdf(coverPdfPath);
  const templatePdf = inspectPdf(templatePdfPath);

  return {
    spec,
    outputPdf,
    templatePdf
  };
}

function generateQaReport() {
  const config = loadConfig();
  const pages = buildPageList();
  const pageKinds = new Set(pages.map((page) => page.kind));
  const weeklyPages = pages.filter((page) => page.kind === "weeklyChecklist");
  const placeholderHits = scanPlaceholders();
  const sensitiveHits = scanSensitiveCopy();
  const interiorPdf = inspectPdf(pdfPath);
  const cover = inspectCover();
  const contentsCoverage = inspectContentsCoverage(pages);
  const interiorSourceScan = inspectInteriorSourceColors();
  const interiorHasProjectFonts =
    hasFontFamily(interiorPdf.fonts, "montserrat") &&
    hasFontFamily(interiorPdf.fonts, "sourcesans3");
  const coverHasProjectFonts = hasFontFamily(cover.outputPdf.fonts, "montserrat");
  const interiorFallbackFonts = findFallbackFonts(interiorPdf.fonts);
  const coverFallbackFonts = findFallbackFonts(cover.outputPdf.fonts);
  const noSaturatedInteriorSource =
    interiorSourceScan.suspiciousColors.length === 0 &&
    interiorSourceScan.suspiciousTokens.length === 0;
  const noSaturatedInteriorPdf = interiorPdf.saturatedPages.length === 0;

  const weeklyRanges = weeklyPages.map(
    (page) => `${page.title}: ${page.items.length} Aufgaben`
  );

  const exactPageTarget = config.book.pageTarget || pages.length;
  const plannedMatchesPdf = pages.length === interiorPdf.pageCount;
  const trimMatches =
    interiorPdf.pageSizes.length === 1 &&
    interiorPdf.pageSizes[0][0] === 8.5 &&
    interiorPdf.pageSizes[0][1] === 11;
  const coverSizeMatches =
    cover.outputPdf.pageSizes.length === 1 &&
    cover.outputPdf.pageSizes[0][0] === Number(cover.spec.totalWidthIn.toFixed(6)) &&
    cover.outputPdf.pageSizes[0][1] === Number(cover.spec.totalHeightIn.toFixed(6));
  const templateSizeMatches =
    cover.templatePdf.pageSizes.length === 1 &&
    cover.templatePdf.pageSizes[0][0] === Number(cover.spec.totalWidthIn.toFixed(6)) &&
    cover.templatePdf.pageSizes[0][1] === Number(cover.spec.totalHeightIn.toFixed(6));

  const report = `# QA Report

- PDF-Datei: \`output/umzugscheckliste-familien-interior-premium.pdf\`
- Preview-Datei: \`output/umzugscheckliste-familien-interior-preview.html\`
- Cover-Datei: \`output/umzugscheckliste-familien-cover.pdf\`
- Geplante Seiten aus JSON/Generator: \`${pages.length}\`
- Ziel-Seitenzahl aus Config: \`${exactPageTarget}\`
- Tatsächliche Innen-PDF-Seiten: \`${interiorPdf.pageCount}\`
- Innen-PDF-Formate: \`${interiorPdf.pageSizes.map((size) => size.join(" x ")).join(", ")} inch\`
- Leerseiten per Textprüfung: \`${interiorPdf.blankPages.length}\`
- Leerseiten per Bildprüfung: \`${interiorPdf.visualBlankPages.length}\`
- Unterschiedliche Seitentypen: \`${pageKinds.size}\`
- Platzhaltertreffer: \`${placeholderHits.length}\`
- Sensible Formulierungen: \`${sensitiveHits.length}\`
- Verdaechtige Innenraum-Farbtreffer im HTML/CSS: \`${interiorSourceScan.suspiciousColors.length + interiorSourceScan.suspiciousTokens.length}\`
- Maximale gemessene Saettigung im Innen-PDF: \`${interiorPdf.maxSaturation}\`
- Innen-PDF-Schriften: \`${interiorPdf.fonts.join(", ")}\`
- Cover-PDF-Schriften: \`${cover.outputPdf.fonts.join(", ")}\`

## Wöchentliche Checklisten

${weeklyRanges.map((line) => `- ${line}`).join("\n")}

## Cover-Geometrie

- Innen-Seitenzahl für das Cover: \`${cover.spec.pageCount}\`
- Rückenbreite: \`${cover.spec.spineWidthIn.toFixed(6)} inch\`
- Cover-Gesamtgröße: \`${cover.spec.totalWidthIn.toFixed(6)} x ${cover.spec.totalHeightIn.toFixed(2)} inch\`
- Rücken-Text aktiviert: \`${cover.spec.includeSpineText ? "ja" : "nein"}\`

## Prüfungen

- Exakte Seitenzahl erreicht: ${interiorPdf.pageCount === exactPageTarget ? "ja" : "nein"}
- Geplante DOM-Seitenzahl stimmt mit PDF überein: ${plannedMatchesPdf ? "ja" : "nein"}
- Keine versehentlichen Leerseiten: ${
    interiorPdf.blankPages.length === 0 && interiorPdf.visualBlankPages.length === 0
      ? "ja"
      : `nein (Text: ${interiorPdf.blankPages.join(", ") || "-"} | Bild: ${interiorPdf.visualBlankPages.join(", ") || "-"})`
  }
- Alle Innen-PDF-Seiten haben dasselbe Format: ${interiorPdf.pageSizes.length === 1 ? "ja" : "nein"}
- Innen-PDF entspricht 8.5 x 11 inch: ${trimMatches ? "ja" : "nein"}
- Cover-PDF entspricht berechneter KDP-Größe: ${coverSizeMatches ? "ja" : "nein"}
- Cover-Template entspricht berechneter KDP-Größe: ${templateSizeMatches ? "ja" : "nein"}
- Cover nutzt dieselbe Seitenzahl wie der Innenraum: ${cover.spec.pageCount === exactPageTarget ? "ja" : "nein"}
- Rücken-Text bei dünnem Rücken deaktiviert: ${!cover.spec.includeSpineText ? "ja" : "nein"}
- Innen-PDF enthält die Projektfonts Montserrat und Source Sans 3: ${interiorHasProjectFonts ? "ja" : "nein"}
- Cover-PDF enthält die eingebettete Projektfont Montserrat: ${coverHasProjectFonts ? "ja" : "nein"}
- Keine offensichtlichen Times-New-Roman-Fallbacks im Innen-PDF: ${interiorFallbackFonts.length === 0 ? "ja" : `nein (${interiorFallbackFonts.join(", ")})`}
- Keine offensichtlichen Times-New-Roman-Fallbacks im Cover-PDF: ${coverFallbackFonts.length === 0 ? "ja" : `nein (${coverFallbackFonts.join(", ")})`}
- Keine verdaechtigen Magenta-/Pink-/Debug-Stile im Innenraum-HTML/CSS: ${
    noSaturatedInteriorSource
      ? "ja"
      : `nein (${[...interiorSourceScan.suspiciousTokens, ...interiorSourceScan.suspiciousColors].join(" | ")})`
  }
- Keine hochgesaettigten Farben im Innen-PDF: ${
    noSaturatedInteriorPdf
      ? "ja"
      : `nein (${interiorPdf.saturatedPages
          .map((entry) => `S. ${entry.page}: Anteil ${entry.ratio}, max. Saettigung ${entry.maxSaturation}`)
          .join(" | ")})`
  }
- Mindestens 8 Seitentypen: ${pageKinds.size >= 8 ? "ja" : "nein"}
- Platzhaltertext entfernt: ${placeholderHits.length === 0 ? "ja" : "nein"}
- Keine Passwort-/Zugangsdaten-Aufforderung im Druckprodukt: ${sensitiveHits.length === 0 ? "ja" : "nein"}
- Wöchentliche Seiten mit 10-14 Aufgaben: ${weeklyPages.every((page) => page.items.length >= 10 && page.items.length <= 14) ? "ja" : "nein"}
- Inhaltsübersicht hat Seitenbereiche für alle nummerierten Abschnitte: ${
    contentsCoverage.contentsMarkers === contentsCoverage.expectedContentsMarkers ? "ja" : "nein"
  }
- How-to-Übersicht hat Seitenbereiche für alle nummerierten Abschnitte: ${
    contentsCoverage.howToMarkers === contentsCoverage.expectedHowToMarkers ? "ja" : "nein"
  }

## Hinweise

${placeholderHits.length === 0 ? "- Keine Roh-Platzhalter in den JSON-Dateien gefunden." : placeholderHits.map((line) => `- ${line}`).join("\n")}
${sensitiveHits.length === 0 ? "- Keine problematischen Passwort-/Zugangsdaten-Hinweise gefunden." : sensitiveHits.map((line) => `- ${line}`).join("\n")}
- ${
    noSaturatedInteriorSource
      ? "Keine verdächtigen Magenta-/Pink-/Debug-Tokens in `styles/*.css` oder `dist/interior.html` gefunden."
      : [...interiorSourceScan.suspiciousTokens, ...interiorSourceScan.suspiciousColors]
          .map((line) => `- ${line}`)
          .join("\n")
  }
- ${
    noSaturatedInteriorPdf
      ? "Keine hochgesättigten Farbflächen im gerenderten Innen-PDF erkannt."
      : interiorPdf.saturatedPages
          .map(
            (entry) =>
              `- Innen-PDF Seite ${entry.page}: Anteil farbiger Pixel ${entry.ratio}, maximale Sättigung ${entry.maxSaturation}`
          )
          .join("\n")
  }
- Manuelle Sichtprüfung bleibt erforderlich für Titel-, Divider-, Budget-, Prozess- und Coverseiten.
- KDP Previewer und eine physische Probekopie bleiben der letzte Freigabeschritt.
`;

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(qaPath, report, "utf8");
  console.log(`Generated ${qaPath}`);

  if (!noSaturatedInteriorSource || !noSaturatedInteriorPdf) {
    console.error("QA failed: saturated or debug-like interior colors detected.");
    process.exitCode = 1;
  }
}

generateQaReport();
