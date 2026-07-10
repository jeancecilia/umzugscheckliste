const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");
const { buildPageList } = require("./generate-html");
const { getEmbeddedFontCss } = require("./font-assets");

const rootDir = path.resolve(__dirname, "..");
const coverDir = path.join(rootDir, "cover");
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, "output");

const trimWidthIn = 8.5;
const trimHeightIn = 11;
const bleedIn = 0.125;
const pt = (inches) => inches * 72;

const palette = {
  paper: "#f4eee6",
  sand: "#e8dccb",
  terracotta: "#c97d64",
  sage: "#97a793",
  blue: "#7f95a6",
  ink: "#23303a",
  muted: "#55616b",
  white: "#ffffff",
  line: "#d1c6b8"
};

const headingFontFamily = "Montserrat, Arial, sans-serif";
const bodyFontFamily = headingFontFamily;

function getCoverSpec() {
  const pageCount = buildPageList().length;
  const spineWidthIn = Number((pageCount * 0.002252).toFixed(6));
  const totalWidthIn = Number((bleedIn + trimWidthIn + spineWidthIn + trimWidthIn + bleedIn).toFixed(6));
  const totalHeightIn = trimHeightIn + bleedIn + bleedIn;
  const includeSpineText = spineWidthIn >= 0.35;

  const geometry = {
    bleed: pt(bleedIn),
    trimWidth: pt(trimWidthIn),
    trimHeight: pt(trimHeightIn),
    spineWidth: pt(spineWidthIn),
    totalWidth: pt(totalWidthIn),
    totalHeight: pt(totalHeightIn)
  };

  geometry.backX = geometry.bleed;
  geometry.backY = geometry.bleed;
  geometry.frontX = geometry.bleed + geometry.trimWidth + geometry.spineWidth;
  geometry.frontY = geometry.bleed;
  geometry.spineX = geometry.bleed + geometry.trimWidth;

  return {
    pageCount,
    spineWidthIn,
    totalWidthIn,
    totalHeightIn,
    includeSpineText,
    geometry
  };
}

function escapeXml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function wrapText(text, maxChars) {
  const words = text.split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function textBlock({ x, y, width, text, fontSize, lineHeight, fill, fontWeight = 400, family }) {
  const maxChars = Math.max(18, Math.floor(width / (fontSize * 0.56)));
  const lines = wrapText(text, maxChars);
  return `
    <text x="${x}" y="${y}" font-size="${fontSize}" fill="${fill}" font-family="${family}" font-weight="${fontWeight}">
      ${lines
        .map((line, index) => {
          const dy = index === 0 ? 0 : lineHeight;
          return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
        })
        .join("")}
    </text>`;
}

function paragraphBlock({ x, y, width, paragraphs, fontSize, lineHeight, gap, fill, family }) {
  const blocks = [];
  let cursor = y;

  for (const paragraph of paragraphs) {
    const maxChars = Math.max(22, Math.floor(width / (fontSize * 0.54)));
    const lines = wrapText(paragraph, maxChars);
    blocks.push(`
      <text x="${x}" y="${cursor}" font-size="${fontSize}" fill="${fill}" font-family="${family}">
        ${lines
          .map((line, index) => {
            const dy = index === 0 ? 0 : lineHeight;
            return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
          })
          .join("")}
      </text>`);
    cursor += fontSize + (lines.length - 1) * lineHeight + gap;
  }

  return blocks.join("");
}

function buildCoverSvg(spec) {
  const { geometry } = spec;
  const {
    totalWidth,
    totalHeight,
    trimWidth,
    trimHeight,
    spineWidth,
    backX,
    backY,
    frontX,
    frontY,
    spineX
  } = geometry;

  const barcode = {
    x: backX + trimWidth - pt(0.25) - pt(2),
    y: backY + trimHeight - pt(0.25) - pt(1.2),
    width: pt(2),
    height: pt(1.2)
  };

  const safeInset = pt(0.25);
  const backTextX = backX + 44;
  const backTextWidth = 336;
  const frontTextX = frontX + 50;
  const frontTextWidth = 428;

  const titleLines = ["Umzugscheckliste", "für Familien"];
  const benefitText =
    "Mit Wochenplan, Packlisten, Budgetplaner, Adressänderungen, Kinder-Checklisten und Übergabeprotokoll";
  const backParagraphs = [
    "Ein Umzug mit Kindern bringt viele Aufgaben, Termine und kleine Details mit sich. Dieser praktische Umzugsplaner hilft Familien dabei, den Überblick zu behalten und den Umzug Schritt für Schritt zu organisieren.",
    "Enthalten sind Wochen-Checklisten, Packlisten für jedes Zimmer, Budgetseiten, Adressänderungen, Kinder-Checklisten, Notfalltaschen, Erste-Nacht-Planung und Übergabeprotokolle.",
    "Ideal für Familien, die ihren Umzug strukturierter, ruhiger und besser vorbereitet angehen möchten."
  ];

  const frontTitle = `
    <text x="${frontTextX}" y="${frontY + 206}" font-size="35" fill="${palette.ink}" font-family="${headingFontFamily}" font-weight="700">
      <tspan x="${frontTextX}" dy="0">${titleLines[0]}</tspan>
      <tspan x="${frontTextX}" dy="41">${titleLines[1]}</tspan>
    </text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}pt" height="${totalHeight}pt" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${palette.paper}" />

  <rect x="${spineX}" y="${backY}" width="${spineWidth}" height="${trimHeight}" fill="${palette.sage}" />

  <path d="M ${frontX + 92} ${frontY + 94} C ${frontX + 274} ${frontY + 8}, ${frontX + 500} ${frontY + 36}, ${frontX + 566} ${frontY + 178} L ${frontX + 566} ${frontY + 304} C ${frontX + 452} ${frontY + 276}, ${frontX + 320} ${frontY + 286}, ${frontX + 176} ${frontY + 352} C ${frontX + 72} ${frontY + 304}, ${frontX + 38} ${frontY + 210}, ${frontX + 92} ${frontY + 94} Z" fill="${palette.sand}" />
  <circle cx="${frontX + 508}" cy="${frontY + 132}" r="56" fill="${palette.terracotta}" opacity="0.18" />
  <circle cx="${frontX + 148}" cy="${frontY + 172}" r="42" fill="${palette.blue}" opacity="0.16" />

  <path d="M ${frontX + 344} ${frontY + 142} L ${frontX + 434} ${frontY + 84} L ${frontX + 524} ${frontY + 142} L ${frontX + 524} ${frontY + 328} L ${frontX + 344} ${frontY + 328} Z" fill="none" stroke="${palette.blue}" stroke-width="4" stroke-linejoin="round" />
  <path d="M ${frontX + 392} ${frontY + 328} L ${frontX + 392} ${frontY + 240} L ${frontX + 478} ${frontY + 240} L ${frontX + 478} ${frontY + 328}" fill="none" stroke="${palette.blue}" stroke-width="4" stroke-linejoin="round" />
  <rect x="${frontX + 116}" y="${frontY + 432}" width="94" height="76" rx="8" fill="${palette.terracotta}" opacity="0.66" />
  <rect x="${frontX + 188}" y="${frontY + 392}" width="122" height="98" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${frontX + 188} ${frontY + 424} H ${frontX + 310}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${frontX + 248} ${frontY + 392} V ${frontY + 490}" stroke="${palette.line}" stroke-width="1.5" />

  <rect x="${frontX + 386}" y="${frontY + 418}" width="138" height="116" rx="10" fill="${palette.white}" stroke="${palette.blue}" stroke-width="2" />
  <path d="M ${frontX + 412} ${frontY + 454} l 10 10 l 18 -22" fill="none" stroke="${palette.sage}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M ${frontX + 440} ${frontY + 450} H ${frontX + 498}" stroke="${palette.ink}" stroke-width="2" stroke-linecap="round" />
  <path d="M ${frontX + 412} ${frontY + 488} l 10 10 l 18 -22" fill="none" stroke="${palette.sage}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M ${frontX + 440} ${frontY + 484} H ${frontX + 498}" stroke="${palette.ink}" stroke-width="2" stroke-linecap="round" />

  <circle cx="${frontX + 442}" cy="${frontY + 612}" r="16" fill="${palette.blue}" />
  <circle cx="${frontX + 486}" cy="${frontY + 602}" r="20" fill="${palette.sage}" />
  <circle cx="${frontX + 532}" cy="${frontY + 614}" r="16" fill="${palette.terracotta}" />
  <path d="M ${frontX + 426} ${frontY + 658} C ${frontX + 432} ${frontY + 626}, ${frontX + 452} ${frontY + 620}, ${frontX + 466} ${frontY + 636}" fill="none" stroke="${palette.blue}" stroke-width="6" stroke-linecap="round" />
  <path d="M ${frontX + 464} ${frontY + 660} C ${frontX + 472} ${frontY + 620}, ${frontX + 500} ${frontY + 616}, ${frontX + 516} ${frontY + 644}" fill="none" stroke="${palette.sage}" stroke-width="7" stroke-linecap="round" />
  <path d="M ${frontX + 512} ${frontY + 658} C ${frontX + 520} ${frontY + 628}, ${frontX + 540} ${frontY + 624}, ${frontX + 550} ${frontY + 642}" fill="none" stroke="${palette.terracotta}" stroke-width="6" stroke-linecap="round" />

  <path d="M ${backX + 62} ${backY + 124} C ${backX + 154} ${backY + 36}, ${backX + 328} ${backY + 52}, ${backX + 412} ${backY + 144} C ${backX + 370} ${backY + 198}, ${backX + 254} ${backY + 208}, ${backX + 126} ${backY + 196} C ${backX + 82} ${backY + 176}, ${backX + 56} ${backY + 152}, ${backX + 62} ${backY + 124} Z" fill="${palette.sand}" />
  <circle cx="${backX + 484}" cy="${backY + 174}" r="44" fill="${palette.sage}" opacity="0.2" />
  <rect x="${backX + 48}" y="${backY + 556}" width="126" height="96" rx="8" fill="${palette.terracotta}" opacity="0.58" />
  <rect x="${backX + 126}" y="${backY + 508}" width="150" height="112" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${backX + 126} ${backY + 544} H ${backX + 276}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${backX + 200} ${backY + 508} V ${backY + 620}" stroke="${palette.line}" stroke-width="1.5" />

  <rect x="${barcode.x}" y="${barcode.y}" width="${barcode.width}" height="${barcode.height}" fill="${palette.white}" />

  ${textBlock({
    x: backTextX,
    y: backY + 256,
    width: backTextWidth,
    text: "Ein Umzug mit Kindern muss nicht chaotisch sein.",
    fontSize: 20,
    lineHeight: 24,
    fill: palette.ink,
    fontWeight: 700,
    family: headingFontFamily
  })}
  ${paragraphBlock({
    x: backTextX,
    y: backY + 304,
    width: backTextWidth,
    paragraphs: backParagraphs,
    fontSize: 13.8,
    lineHeight: 18,
    gap: 18,
    fill: palette.muted,
    family: bodyFontFamily
  })}

  <rect x="${frontTextX}" y="${frontY + 118}" width="148" height="25" rx="12" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.2" />
  <text x="${frontTextX + 18}" y="${frontY + 136}" font-size="11" fill="${palette.muted}" font-family="${headingFontFamily}" font-weight="700" letter-spacing="1.3">FAMILIENPLANER</text>

  ${frontTitle}
  ${textBlock({
    x: frontTextX,
    y: frontY + 312,
    width: frontTextWidth,
    text: "Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern",
    fontSize: 18,
    lineHeight: 22,
    fill: palette.muted,
    family: bodyFontFamily
  })}

  <rect x="${frontTextX}" y="${frontY + 668}" width="438" height="84" rx="12" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.5" />
  ${textBlock({
    x: frontTextX + 20,
    y: frontY + 698,
    width: 394,
    text: benefitText,
    fontSize: 13,
    lineHeight: 17,
    fill: palette.ink,
    fontWeight: 600,
    family: bodyFontFamily
  })}

  <text x="${frontTextX}" y="${frontY + trimHeight - safeInset - 8}" font-size="13.5" fill="${palette.muted}" font-family="${headingFontFamily}" font-weight="600">Planvoll Familie</text>
</svg>`;
}

function buildTemplateSvg(spec) {
  const { geometry, pageCount, spineWidthIn, totalWidthIn, totalHeightIn } = spec;
  const {
    totalWidth,
    totalHeight,
    trimWidth,
    trimHeight,
    spineWidth,
    backX,
    backY,
    frontX,
    frontY,
    spineX
  } = geometry;

  const safeInset = pt(0.25);
  const spineSafeInset = pt(0.0625);
  const barcode = {
    x: backX + trimWidth - pt(0.25) - pt(2),
    y: backY + trimHeight - pt(0.25) - pt(1.2),
    width: pt(2),
    height: pt(1.2)
  };

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}pt" height="${totalHeight}pt" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="#ffffff" />
  <rect x="0.5" y="0.5" width="${totalWidth - 1}" height="${totalHeight - 1}" fill="none" stroke="#888" stroke-width="1" />
  <rect x="${backX}" y="${backY}" width="${trimWidth}" height="${trimHeight}" fill="none" stroke="#2f6fed" stroke-width="1.5" />
  <rect x="${frontX}" y="${frontY}" width="${trimWidth}" height="${trimHeight}" fill="none" stroke="#2f6fed" stroke-width="1.5" />
  <rect x="${spineX}" y="${backY}" width="${spineWidth}" height="${trimHeight}" fill="none" stroke="#2f6fed" stroke-width="1.5" />

  <rect x="${backX + safeInset}" y="${backY + safeInset}" width="${trimWidth - safeInset * 2}" height="${trimHeight - safeInset * 2}" fill="none" stroke="#d73a49" stroke-width="1" stroke-dasharray="6 4" />
  <rect x="${frontX + safeInset}" y="${frontY + safeInset}" width="${trimWidth - safeInset * 2}" height="${trimHeight - safeInset * 2}" fill="none" stroke="#d73a49" stroke-width="1" stroke-dasharray="6 4" />
  <rect x="${spineX + spineSafeInset}" y="${backY + safeInset}" width="${Math.max(1, spineWidth - spineSafeInset * 2)}" height="${trimHeight - safeInset * 2}" fill="none" stroke="#d73a49" stroke-width="1" stroke-dasharray="4 4" />
  <rect x="${barcode.x}" y="${barcode.y}" width="${barcode.width}" height="${barcode.height}" fill="#ffffff" stroke="#d73a49" stroke-width="1.5" stroke-dasharray="6 4" />

  <text x="${backX + 18}" y="${backY - 12}" font-size="12" fill="#2f6fed" font-family="${headingFontFamily}" font-weight="700">TRIM AREA BACK COVER</text>
  <text x="${frontX + 18}" y="${frontY - 12}" font-size="12" fill="#2f6fed" font-family="${headingFontFamily}" font-weight="700">TRIM AREA FRONT COVER</text>
  <text x="${spineX + 6}" y="${backY - 12}" font-size="12" fill="#2f6fed" font-family="${headingFontFamily}" font-weight="700">SPINE</text>
  <text x="${barcode.x + 16}" y="${barcode.y + 40}" font-size="16" fill="#d73a49" font-family="${headingFontFamily}" font-weight="700">BARCODE AREA</text>
  <text x="${barcode.x + 16}" y="${barcode.y + 62}" font-size="11" fill="#d73a49" font-family="${bodyFontFamily}">2.0 in x 1.2 in</text>
  <text x="${barcode.x + 16}" y="${barcode.y + 80}" font-size="11" fill="#d73a49" font-family="${bodyFontFamily}">Keep clear for KDP barcode</text>

  <text x="${totalWidth / 2}" y="${totalHeight - 18}" text-anchor="middle" font-size="11" fill="#555" font-family="${bodyFontFamily}">
    8.5 x 11 in paperback | ${pageCount} pages | black and white interior | white paper | total cover size ${totalWidthIn.toFixed(6)} x ${totalHeightIn.toFixed(2)} in | spine ${spineWidthIn.toFixed(6)} in
  </text>
</svg>`;
}

async function exportPdfFromSvg(svg, outputPath, spec) {
  const fontCss = getEmbeddedFontCss();
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        ${fontCss}
        @page { size: ${spec.totalWidthIn}in ${spec.totalHeightIn}in; margin: 0; }
        html, body { margin: 0; padding: 0; width: ${spec.totalWidthIn}in; height: ${spec.totalHeightIn}in; }
        body { background: #fff; }
        svg { display: block; width: ${spec.totalWidthIn}in; height: ${spec.totalHeightIn}in; }
      </style>
    </head>
    <body>${svg}</body>
  </html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: {
      width: Math.ceil(spec.totalWidthIn * 120),
      height: Math.ceil(spec.totalHeightIn * 120)
    }
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: outputPath,
    width: `${spec.totalWidthIn}in`,
    height: `${spec.totalHeightIn}in`,
    margin: { top: "0in", right: "0in", bottom: "0in", left: "0in" },
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
}

function normalizePdfSize(sourcePath, targetPath, spec) {
  const script = `
import fitz, sys
src, dst, width_in, height_in = sys.argv[1], sys.argv[2], float(sys.argv[3]), float(sys.argv[4])
src_doc = fitz.open(src)
dst_doc = fitz.open()
page = dst_doc.new_page(width=width_in * 72, height=height_in * 72)
page.show_pdf_page(fitz.Rect(0, 0, width_in * 72, height_in * 72), src_doc, 0)
dst_doc.save(dst)
dst_doc.close()
src_doc.close()
`;

  execFileSync(
    "python",
    ["-c", script, sourcePath, targetPath, String(spec.totalWidthIn), String(spec.totalHeightIn)],
    { stdio: "inherit" }
  );
}

async function generateCover() {
  const spec = getCoverSpec();

  fs.mkdirSync(coverDir, { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const coverSvg = buildCoverSvg(spec);
  const templateSvg = buildTemplateSvg(spec);

  const coverSvgPath = path.join(coverDir, "cover-source.svg");
  const templateSvgPath = path.join(coverDir, "kdp-cover-template.svg");
  const templatePdfPath = path.join(coverDir, "kdp-cover-template.pdf");
  const coverPdfPath = path.join(coverDir, "cover-export.pdf");
  const outputPdfPath = path.join(outputDir, "umzugscheckliste-familien-cover.pdf");
  const templateRawPdfPath = path.join(coverDir, "kdp-cover-template.raw.pdf");
  const coverRawPdfPath = path.join(coverDir, "cover-export.raw.pdf");
  const coverSpecPath = path.join(coverDir, "cover-spec.json");

  fs.writeFileSync(coverSvgPath, coverSvg, "utf8");
  fs.writeFileSync(templateSvgPath, templateSvg, "utf8");
  fs.writeFileSync(
    coverSpecPath,
    JSON.stringify(
      {
        pageCount: spec.pageCount,
        spineWidthIn: spec.spineWidthIn,
        totalWidthIn: spec.totalWidthIn,
        totalHeightIn: spec.totalHeightIn,
        includeSpineText: spec.includeSpineText,
        trimWidthIn,
        trimHeightIn,
        bleedIn
      },
      null,
      2
    ),
    "utf8"
  );

  await exportPdfFromSvg(templateSvg, templateRawPdfPath, spec);
  await exportPdfFromSvg(coverSvg, coverRawPdfPath, spec);
  normalizePdfSize(templateRawPdfPath, templatePdfPath, spec);
  normalizePdfSize(coverRawPdfPath, coverPdfPath, spec);
  fs.copyFileSync(coverPdfPath, outputPdfPath);
  fs.rmSync(templateRawPdfPath, { force: true });
  fs.rmSync(coverRawPdfPath, { force: true });

  console.log(`Generated ${coverSvgPath}`);
  console.log(`Generated ${templateSvgPath}`);
  console.log(`Generated ${coverSpecPath}`);
  console.log(`Generated ${templatePdfPath}`);
  console.log(`Generated ${coverPdfPath}`);
  console.log(`Generated ${outputPdfPath}`);
}

if (require.main === module) {
  generateCover().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

module.exports = { getCoverSpec };
