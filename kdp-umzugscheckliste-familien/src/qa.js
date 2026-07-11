const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { buildPageList } = require("./generate-html");
const { getCoverSpec } = require("./generate-cover");

const rootDir = path.resolve(__dirname, "..");
const outputDir = path.join(rootDir, "output");
const qaRenderDir = path.join(outputDir, "qa-renders");
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

const ALLOWED_WRITING_SURFACE_COLORS = new Set(["250,248,244", "255,255,255"]);

function getQaRenderPages(pages) {
  const requiredTitles = new Set([
    "Umzugscheckliste für Familien",
    "Willkommen & Nutzungshinweis",
    "So nutzt ihr diesen Planer",
    "Inhaltsübersicht",
    "12 Wochen vorher",
    "Farbcodes nach Zimmern",
    "Umzugsunternehmen Kostenvergleich",
    "Bezahlte Rechnungen",
    "Gesamtkosten-Auswertung",
    "Packliste Dokumente",
    "Nachsendeauftrag",
    "Familie & Freunde",
    "Reinigungsplan alte Wohnung",
    "Reinigungsplan neue Wohnung",
    "Fotos / Dokumentationsliste",
    "Verträge kündigen / ummelden",
    "Neue Verträge einrichten",
    "Zählerstände",
    "Schlüsselübergabe",
    "Wichtige Erfahrungen für den nächsten Umzug"
  ]);

  const renderPages = new Set();

  for (const page of pages) {
    if (page.kind === "divider" || page.kind === "publicationPage" || requiredTitles.has(page.title)) {
      renderPages.add(page.sequenceNumber);
    }
  }

  return [...renderPages].sort((left, right) => left - right);
}
function loadConfig() {
  return JSON.parse(fs.readFileSync(path.join(contentDir, "book-config.json"), "utf8"));
}

function scanPlaceholders() {
  const placeholders = ["Eintrag 1", "Eintrag 2", "Punkt 1", "Stelle 1", "Eigener Bereich"];
  const files = fs.readdirSync(contentDir).filter((fileName) => fileName.endsWith(".json"));
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
      token: "Passw\u00f6rter / Zug\u00e4nge",
      replacement: "Keine Passw\u00f6rter in Druckprodukten notieren"
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

function findUpdatedPdfCopies() {
  return fs
    .readdirSync(outputDir, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith("-updated.pdf"))
    .map((entry) => entry.name);
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

function sizeMatchesExactOrTolerance(actualSize, expectedWidth, expectedHeight, tolerance = 0.001) {
  if (!actualSize) {
    return false;
  }

  return (
    Math.abs(actualSize[0] - expectedWidth) <= tolerance &&
    Math.abs(actualSize[1] - expectedHeight) <= tolerance
  );
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
    color_ratio = colored / total
    if page_max > max_saturation:
        max_saturation = page_max
    if color_ratio >= 0.0005:
        saturated_pages.append({
            "page": index + 1,
            "ratio": round(color_ratio, 6),
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

function renderQaPagesAndInspectNotesBox(pdfFilePath, renderPages, coverSpec, notesBoxPageNumber) {
  fs.rmSync(qaRenderDir, { recursive: true, force: true });
  const script = `
import fitz, json, os, sys
from collections import Counter

pdf = fitz.open(sys.argv[1])
output_dir = sys.argv[2]
pages_to_render = json.loads(sys.argv[3])
allowed = {(250, 248, 244), (255, 255, 255)}
cover_pdf_path = sys.argv[4]
cover_geometry = json.loads(sys.argv[5])
notes_box_page_number = int(sys.argv[6])

os.makedirs(output_dir, exist_ok=True)
rendered = []
cover_renders = []

def saturation(rgb):
    r, g, b = [value / 255 for value in rgb]
    channel_max = max(r, g, b)
    channel_min = min(r, g, b)
    return 0.0 if channel_max == 0 else (channel_max - channel_min) / channel_max

def quantize(rgb, step=1):
    return tuple(max(0, min(255, int(round(value / step) * step))) for value in rgb)

def is_magenta_like(rgb):
    r, g, b = rgb
    return r >= 150 and b >= 150 and (r - g) >= 25 and (b - g) >= 25

for page_number in pages_to_render:
    page = pdf[page_number - 1]
    pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), colorspace=fitz.csRGB, alpha=False)
    file_name = f"page-{page_number:03d}.png"
    file_path = os.path.join(output_dir, file_name)
    pix.save(file_path)
    rendered.append({
        "page": page_number,
        "file": file_name,
        "width": pix.width,
        "height": pix.height
    })

cover_pdf = fitz.open(cover_pdf_path)
cover_page = cover_pdf[0]
cover_pix = cover_page.get_pixmap(matrix=fitz.Matrix(1.6, 1.6), colorspace=fitz.csRGB, alpha=False)
cover_sheet_file = "cover-sheet.png"
cover_pix.save(os.path.join(output_dir, cover_sheet_file))
cover_renders.append({
    "name": "sheet",
    "file": cover_sheet_file,
    "width": cover_pix.width,
    "height": cover_pix.height
})

front_rect = fitz.Rect(
    cover_geometry["frontX"],
    cover_geometry["frontY"],
    cover_geometry["frontX"] + cover_geometry["trimWidth"],
    cover_geometry["frontY"] + cover_geometry["trimHeight"]
)
back_rect = fitz.Rect(
    cover_geometry["backX"],
    cover_geometry["backY"],
    cover_geometry["backX"] + cover_geometry["trimWidth"],
    cover_geometry["backY"] + cover_geometry["trimHeight"]
)

for name, rect in [("front", front_rect), ("back", back_rect)]:
    pix = cover_page.get_pixmap(matrix=fitz.Matrix(1.8, 1.8), clip=rect, colorspace=fitz.csRGB, alpha=False)
    file_name = f"cover-{name}.png"
    pix.save(os.path.join(output_dir, file_name))
    cover_renders.append({
        "name": name,
        "file": file_name,
        "width": pix.width,
        "height": pix.height
    })

notes_page = pdf[notes_box_page_number - 1]
matches = notes_page.search_for("HINWEISE")
if not matches:
    matches = notes_page.search_for("Hinweise")
if not matches:
    words = notes_page.get_text("words")
    hint_words = [word for word in words if str(word[4]).upper().startswith("HINWEIS")]
    if hint_words:
        x0 = min(word[0] for word in hint_words)
        y0 = min(word[1] for word in hint_words)
        x1 = max(word[2] for word in hint_words)
        y1 = max(word[3] for word in hint_words)
        matches = [fitz.Rect(x0, y0, x1, y1)]
if not matches:
    raise RuntimeError(f"Notes-box label on page {notes_box_page_number} not found.")

label = matches[0]
outer_left = max(0, label.x0 - 12)
outer_right = min(notes_page.rect.width, notes_page.rect.width - outer_left)
sample_region = fitz.Rect(
    outer_left + 14,
    label.y1 + 10,
    outer_right - 14,
    min(notes_page.rect.height - 55, label.y1 + 110)
)

crop_pix = notes_page.get_pixmap(matrix=fitz.Matrix(2, 2), clip=sample_region, colorspace=fitz.csRGB, alpha=False)
crop_path = os.path.join(output_dir, f"page-{notes_box_page_number:03d}-notes-box-crop.png")
crop_pix.save(crop_path)

samples = crop_pix.samples
background_counter = Counter()
background_pixels = 0
max_saturation = 0.0
max_channel_diff = 0
magenta_pixels = 0
high_saturation_pixels = 0

for offset in range(0, len(samples), 3):
    rgb = (samples[offset], samples[offset + 1], samples[offset + 2])
    if sum(rgb) / 3 < 180:
        continue
    background_pixels += 1
    bucket = quantize(rgb)
    background_counter[bucket] += 1
    sat = saturation(rgb)
    diff = max(rgb) - min(rgb)
    if sat > max_saturation:
        max_saturation = sat
    if diff > max_channel_diff:
        max_channel_diff = diff
    if is_magenta_like(rgb):
        magenta_pixels += 1
    if sat >= 0.15 or diff > 25:
        high_saturation_pixels += 1

dominant_colors = []
for rgb, count in background_counter.most_common(8):
    dominant_colors.append({
        "rgb": list(rgb),
        "count": count,
        "ratio": round(count / max(1, background_pixels), 6),
        "saturation": round(saturation(rgb), 4),
        "channelDiff": max(rgb) - min(rgb),
        "allowedFill": rgb in allowed
    })

allowed_fill_pixels = sum(count for rgb, count in background_counter.items() if rgb in allowed)
allowed_fill_ratio = round(allowed_fill_pixels / max(1, background_pixels), 6)

print(json.dumps({
    "renderedPages": rendered,
    "coverRenders": cover_renders,
    "notesBox": {
        "page": notes_box_page_number,
        "labelRect": [round(label.x0, 2), round(label.y0, 2), round(label.x1, 2), round(label.y1, 2)],
        "sampleRegion": [round(sample_region.x0, 2), round(sample_region.y0, 2), round(sample_region.x1, 2), round(sample_region.y1, 2)],
        "cropFile": f"page-{notes_box_page_number:03d}-notes-box-crop.png",
        "backgroundPixelCount": background_pixels,
        "dominantColors": dominant_colors,
        "maxSaturation": round(max_saturation, 4),
        "maxChannelDiff": int(max_channel_diff),
        "magentaPixelCount": magenta_pixels,
        "highSaturationPixelCount": high_saturation_pixels,
        "allowedFillRatio": allowed_fill_ratio
    }
}))
`;

  const raw = execFileSync(
    "python",
    [
      "-c",
      script,
      pdfFilePath,
      qaRenderDir,
      JSON.stringify(renderPages),
      coverPdfPath,
      JSON.stringify(coverSpec.geometry),
      String(notesBoxPageNumber)
    ],
    {
      cwd: rootDir,
      encoding: "utf8"
    }
  );

  const result = JSON.parse(raw);
  fs.writeFileSync(
    path.join(qaRenderDir, "qa-render-report.json"),
    JSON.stringify(result, null, 2),
    "utf8"
  );
  return result;
}

function inspectContentsCoverage(pages) {
  const contentsPage = pages.find((page) => page.kind === "contentsPage");

  const contentsMarkers = contentsPage
    ? contentsPage.entries.filter((entry) => entry.marker || entry.range).length
    : 0;

  return {
    contentsMarkers,
    expectedContentsMarkers: contentsPage ? contentsPage.entries.length - 1 : 0
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

function renderList(items) {
  return items.map((item) => `- ${item}`).join("\n");
}

function generateQaReport() {
  const config = loadConfig();
  const pages = buildPageList();
  const pageKinds = new Set(pages.map((page) => page.kind));
  const weeklyPages = pages.filter((page) => page.kind === "weeklyChecklist");
  const placeholderHits = scanPlaceholders();
  const sensitiveHits = scanSensitiveCopy();
  const updatedPdfCopies = findUpdatedPdfCopies();
  const interiorSourceScan = inspectInteriorSourceColors();
  const interiorPdf = inspectPdf(pdfPath);
  const cover = inspectCover();
  const qaRenderPages = getQaRenderPages(pages);
  const notesBoxPage = pages.find((page) => page.kind === "snapshot" && page.title === "Unser Umzug auf einen Blick");
  const qaRenderData = renderQaPagesAndInspectNotesBox(
    pdfPath,
    qaRenderPages,
    cover.spec,
    notesBoxPage ? notesBoxPage.sequenceNumber : 5
  );
  const contentsCoverage = inspectContentsCoverage(pages);
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
  const notesBox = qaRenderData.notesBox;
  const notesBoxPass =
    notesBox.backgroundPixelCount > 0 &&
    notesBox.magentaPixelCount === 0 &&
    notesBox.highSaturationPixelCount === 0 &&
    notesBox.maxChannelDiff <= 25 &&
    notesBox.allowedFillRatio >= 0.9;

  const weeklyRanges = weeklyPages.map(
    (page) => `${page.title}: ${page.items.length} Aufgaben`
  );

  const exactPageTarget = config.book.pageTarget || pages.length;
  const plannedMatchesPdf = pages.length === interiorPdf.pageCount;
  const trimMatches =
    interiorPdf.pageSizes.length === 1 && sizeMatchesExactOrTolerance(interiorPdf.pageSizes[0], 8.5, 11);
  const coverSizeMatches =
    cover.outputPdf.pageSizes.length === 1 &&
    sizeMatchesExactOrTolerance(
      cover.outputPdf.pageSizes[0],
      Number(cover.spec.totalWidthIn.toFixed(6)),
      Number(cover.spec.totalHeightIn.toFixed(6))
    );
  const templateSizeMatches =
    cover.templatePdf.pageSizes.length === 1 &&
    sizeMatchesExactOrTolerance(
      cover.templatePdf.pageSizes[0],
      Number(cover.spec.totalWidthIn.toFixed(6)),
      Number(cover.spec.totalHeightIn.toFixed(6))
    );

  const report = `# QA Report

- PDF-Datei: \`output/umzugscheckliste-familien-interior-premium.pdf\`
- Preview-Datei: \`output/umzugscheckliste-familien-interior-preview.html\`
- Cover-Datei: \`output/umzugscheckliste-familien-cover.pdf\`
- QA-Renders: \`output/qa-renders/\`
- Geplante Seiten aus JSON/Generator: \`${pages.length}\`
- Ziel-Seitenzahl aus Config: \`${exactPageTarget}\`
- Tatsaechliche Innen-PDF-Seiten: \`${interiorPdf.pageCount}\`
- Innen-PDF-Formate: \`${interiorPdf.pageSizes.map((size) => size.join(" x ")).join(", ")} inch\`
- Leerseiten per Textpruefung: \`${interiorPdf.blankPages.length}\`
- Leerseiten per Bildpruefung: \`${interiorPdf.visualBlankPages.length}\`
- Unterschiedliche Seitentypen: \`${pageKinds.size}\`
- Platzhaltertreffer: \`${placeholderHits.length}\`
- Sensible Formulierungen: \`${sensitiveHits.length}\`
- Verdaechtige Innenraum-Farbtreffer im HTML/CSS: \`${interiorSourceScan.suspiciousColors.length + interiorSourceScan.suspiciousTokens.length}\`
- Maximale gemessene Saettigung im Innen-PDF: \`${interiorPdf.maxSaturation}\`
- Notes-Box auf Seite \`${notesBox.page}\` dominante Farben: \`${notesBox.dominantColors
    .slice(0, 3)
    .map((entry) => `${entry.rgb.join("/")}:${entry.ratio}`)
    .join(", ")}\`
- Notes-Box auf Seite \`${notesBox.page}\` erlaubter Fuellanteil: \`${notesBox.allowedFillRatio}\`
- Gerenderte QA-Seiten: \`${qaRenderData.renderedPages.map((entry) => entry.page).join(", ")}\`
- Cover-QA-Renders: \`${qaRenderData.coverRenders.map((entry) => entry.file).join(", ")}\`
- Verbotene *-updated.pdf-Dateien: \`${updatedPdfCopies.length}\`
- Innen-PDF-Schriften: \`${interiorPdf.fonts.join(", ")}\`
- Cover-PDF-Schriften: \`${cover.outputPdf.fonts.join(", ")}\`

## Woechentliche Checklisten

${renderList(weeklyRanges)}

## Cover-Geometrie

- Innen-Seitenzahl fuer das Cover: \`${cover.spec.pageCount}\`
- Rueckenbreite: \`${cover.spec.spineWidthIn.toFixed(6)} inch\`
- Cover-Gesamtgroesse: \`${cover.spec.totalWidthIn.toFixed(6)} x ${cover.spec.totalHeightIn.toFixed(2)} inch\`
- Ruecken-Text aktiviert: \`${cover.spec.includeSpineText ? "ja" : "nein"}\`

## Pruefungen

- Exakte Seitenzahl erreicht: ${interiorPdf.pageCount === exactPageTarget ? "ja" : "nein"}
- Geplante DOM-Seitenzahl stimmt mit PDF ueberein: ${plannedMatchesPdf ? "ja" : "nein"}
- Keine versehentlichen Leerseiten: ${
    interiorPdf.blankPages.length === 0 && interiorPdf.visualBlankPages.length === 0
      ? "ja"
      : `nein (Text: ${interiorPdf.blankPages.join(", ") || "-"} | Bild: ${interiorPdf.visualBlankPages.join(", ") || "-"})`
  }
- Alle Innen-PDF-Seiten haben dasselbe Format: ${interiorPdf.pageSizes.length === 1 ? "ja" : "nein"}
- Innen-PDF entspricht 8.5 x 11 inch: ${trimMatches ? "ja" : "nein"}
- Cover-PDF entspricht berechneter KDP-Groesse: ${coverSizeMatches ? "ja" : "nein"}
- Cover-Template entspricht berechneter KDP-Groesse: ${templateSizeMatches ? "ja" : "nein"}
- Cover nutzt dieselbe Seitenzahl wie der Innenraum: ${cover.spec.pageCount === exactPageTarget ? "ja" : "nein"}
- Ruecken-Text bei duennem Ruecken deaktiviert: ${!cover.spec.includeSpineText ? "ja" : "nein"}
- Innen-PDF enthaelt die Projektfonts Montserrat und Source Sans 3: ${interiorHasProjectFonts ? "ja" : "nein"}
- Cover-PDF enthaelt die eingebettete Projektfont Montserrat: ${coverHasProjectFonts ? "ja" : "nein"}
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
- Seite-${notesBox.page}-Box "Zusatzliche Hinweise" ist neutral und einfarbig: ${
    notesBoxPass
      ? "ja"
      : `nein (Diff ${notesBox.maxChannelDiff}, Saettigung ${notesBox.maxSaturation}, Magenta-Pixel ${notesBox.magentaPixelCount}, High-Sat-Pixel ${notesBox.highSaturationPixelCount})`
  }
- Keine manuellen *-updated.pdf-Dateien mehr vorhanden: ${updatedPdfCopies.length === 0 ? "ja" : `nein (${updatedPdfCopies.join(", ")})`}
- Mindestens 8 Seitentypen: ${pageKinds.size >= 8 ? "ja" : "nein"}
- Platzhaltertext entfernt: ${placeholderHits.length === 0 ? "ja" : "nein"}
- Keine Passwort-/Zugangsdaten-Aufforderung im Druckprodukt: ${sensitiveHits.length === 0 ? "ja" : "nein"}
- Woechentliche Seiten mit 10-14 Aufgaben: ${weeklyPages.every((page) => page.items.length >= 10 && page.items.length <= 14) ? "ja" : "nein"}
- Inhaltsuebersicht hat Seitenbereiche fuer alle nummerierten Abschnitte: ${
    contentsCoverage.contentsMarkers === contentsCoverage.expectedContentsMarkers ? "ja" : "nein"
  }

## Hinweise

${placeholderHits.length === 0 ? "- Keine Roh-Platzhalter in den JSON-Dateien gefunden." : renderList(placeholderHits)}
${sensitiveHits.length === 0 ? "- Keine problematischen Passwort-/Zugangsdaten-Hinweise gefunden." : renderList(sensitiveHits)}
- ${
    noSaturatedInteriorSource
      ? "Keine verdaechtigen Magenta-/Pink-/Debug-Tokens in styles/*.css oder dist/interior.html gefunden."
      : renderList([...interiorSourceScan.suspiciousTokens, ...interiorSourceScan.suspiciousColors])
  }
- ${
    noSaturatedInteriorPdf
      ? "Keine hochgesaettigten Farbflaechen im gerenderten Innen-PDF erkannt."
      : renderList(
          interiorPdf.saturatedPages.map(
            (entry) =>
              `Innen-PDF Seite ${entry.page}: Anteil farbiger Pixel ${entry.ratio}, maximale Saettigung ${entry.maxSaturation}`
          )
        )
  }
- ${
    notesBoxPass
      ? `Die analysierte Seite-${notesBox.page}-Notes-Box bleibt neutral; erlaubte Fuellfarben decken ${notesBox.allowedFillRatio} des Hintergrunds ab (${[...ALLOWED_WRITING_SURFACE_COLORS].join(" | ")}).`
      : renderList(
          notesBox.dominantColors.map(
            (entry) =>
              `Dominante Farbe ${entry.rgb.join("/")}, Ratio ${entry.ratio}, allowedFill=${entry.allowedFill}`
          )
        )
  }
- Die PNG-QA-Renders fuer die risikoreichen Innen- und Coverseiten liegen in \`output/qa-renders/\`.
- Manuelle Sichtpruefung bleibt erforderlich, auch wenn die Render-Abdeckung jetzt Titel-, Divider-, Tabellen-, Prozess- und Coverseiten umfasst.
- KDP Previewer und eine physische Probekopie bleiben der letzte Freigabeschritt.
`;

  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(qaPath, report, "utf8");
  console.log(`Generated ${qaPath}`);

  const failures = [];
  if (!noSaturatedInteriorSource) {
    failures.push("suspicious interior CSS/HTML colors");
  }
  if (!noSaturatedInteriorPdf) {
    failures.push("saturated colors in rendered interior PDF");
  }
  if (!notesBoxPass) {
    failures.push("page 5 notes box is not neutral");
  }
  if (updatedPdfCopies.length > 0) {
    failures.push("stale *-updated.pdf copies still exist");
  }

  if (failures.length) {
    console.error(`QA failed: ${failures.join("; ")}.`);
    process.exitCode = 1;
  }
}

generateQaReport();
