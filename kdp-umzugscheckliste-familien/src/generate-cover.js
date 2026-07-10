const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");
const { chromium } = require("playwright");

const rootDir = path.resolve(__dirname, "..");
const coverDir = path.join(rootDir, "cover");
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, "output");

const trimWidthIn = 8.5;
const trimHeightIn = 11;
const bleedIn = 0.125;
const pageCount = 128;
const spineWidthIn = pageCount * 0.002252;
const totalWidthIn = bleedIn + trimWidthIn + spineWidthIn + trimWidthIn + bleedIn;
const totalHeightIn = trimHeightIn + bleedIn + bleedIn;
const pt = (inches) => inches * 72;

const palette = {
  paper: "#f4eee6",
  sand: "#e8dccb",
  terracotta: "#c97d64",
  sage: "#92a28f",
  blue: "#7f95a6",
  ink: "#23303a",
  muted: "#5f6b74",
  white: "#ffffff",
  line: "#d3cabd"
};

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

function textBlock({ x, y, width, text, fontSize, lineHeight, fill, fontWeight = 400 }) {
  const maxChars = Math.max(18, Math.floor(width / (fontSize * 0.55)));
  const lines = wrapText(text, maxChars);
  return `
    <text x="${x}" y="${y}" font-size="${fontSize}" fill="${fill}" font-family="Trebuchet MS, Segoe UI, Arial, sans-serif" font-weight="${fontWeight}">
      ${lines
        .map((line, index) => {
          const dy = index === 0 ? 0 : lineHeight;
          return `<tspan x="${x}" dy="${dy}">${escapeXml(line)}</tspan>`;
        })
        .join("")}
    </text>`;
}

function paragraphBlock({ x, y, width, paragraphs, fontSize, lineHeight, gap, fill }) {
  const blocks = [];
  let cursor = y;

  for (const paragraph of paragraphs) {
    const maxChars = Math.max(22, Math.floor(width / (fontSize * 0.53)));
    const lines = wrapText(paragraph, maxChars);
    blocks.push(`
      <text x="${x}" y="${cursor}" font-size="${fontSize}" fill="${fill}" font-family="Segoe UI, Arial, sans-serif">
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

function buildCoverSvg() {
  const {
    totalWidth,
    totalHeight,
    bleed,
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

  const backTextX = backX + 52;
  const backTextWidth = 355;
  const frontTextX = frontX + 56;
  const frontTextWidth = 450;
  const titleLines = ["Umzugscheckliste", "für Familien"];
  const benefitText =
    "Mit Wochenplan, Packlisten, Budgetplaner, Adressänderungen, Kinder-Checklisten und Übergabeprotokoll";
  const backParagraphs = [
    "Ein Umzug mit Kindern bringt viele Aufgaben, Termine und kleine Details mit sich. Dieser praktische Umzugsplaner hilft Familien dabei, den Überblick zu behalten und den Umzug Schritt für Schritt zu organisieren.",
    "Enthalten sind Wochen-Checklisten, Packlisten für jedes Zimmer, Budgetseiten, Adressänderungen, Kinder-Checklisten, Notfalltaschen, Erste-Nacht-Planung und Übergabeprotokolle.",
    "Ideal für Familien, die ihren Umzug strukturierter, ruhiger und besser vorbereitet angehen möchten."
  ];

  const frontTitle = `
    <text x="${frontTextX}" y="${frontY + 228}" font-size="36" fill="${palette.ink}" font-family="Trebuchet MS, Segoe UI, Arial, sans-serif" font-weight="700">
      <tspan x="${frontTextX}" dy="0">${titleLines[0]}</tspan>
      <tspan x="${frontTextX}" dy="42">${titleLines[1]}</tspan>
    </text>`;

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${totalWidth}pt" height="${totalHeight}pt" viewBox="0 0 ${totalWidth} ${totalHeight}">
  <rect x="0" y="0" width="${totalWidth}" height="${totalHeight}" fill="${palette.paper}" />

  <rect x="${spineX}" y="${backY}" width="${spineWidth}" height="${trimHeight}" fill="${palette.sage}" />

  <path d="M ${frontX + 110} ${frontY + 95} C ${frontX + 280} ${frontY + 10}, ${frontX + 500} ${frontY + 30}, ${frontX + 570} ${frontY + 170} L ${frontX + 570} ${frontY + 310} C ${frontX + 450} ${frontY + 275}, ${frontX + 330} ${frontY + 285}, ${frontX + 180} ${frontY + 355} C ${frontX + 80} ${frontY + 300}, ${frontX + 45} ${frontY + 210}, ${frontX + 110} ${frontY + 95} Z" fill="${palette.sand}" />
  <circle cx="${frontX + 520}" cy="${frontY + 130}" r="54" fill="${palette.terracotta}" opacity="0.18" />
  <circle cx="${frontX + 145}" cy="${frontY + 165}" r="38" fill="${palette.blue}" opacity="0.16" />

  <path d="M ${frontX + 336} ${frontY + 150} L ${frontX + 432} ${frontY + 88} L ${frontX + 528} ${frontY + 150} L ${frontX + 528} ${frontY + 330} L ${frontX + 336} ${frontY + 330} Z" fill="none" stroke="${palette.blue}" stroke-width="4" stroke-linejoin="round" />
  <path d="M ${frontX + 386} ${frontY + 330} L ${frontX + 386} ${frontY + 240} L ${frontX + 478} ${frontY + 240} L ${frontX + 478} ${frontY + 330}" fill="none" stroke="${palette.blue}" stroke-width="4" stroke-linejoin="round" />
  <rect x="${frontX + 112}" y="${frontY + 430}" width="90" height="74" rx="6" fill="${palette.terracotta}" opacity="0.65" />
  <rect x="${frontX + 178}" y="${frontY + 394}" width="112" height="92" rx="6" fill="${palette.sand}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${frontX + 178} ${frontY + 424} H ${frontX + 290}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${frontX + 234} ${frontY + 394} V ${frontY + 486}" stroke="${palette.line}" stroke-width="1.5" />

  <rect x="${frontX + 386}" y="${frontY + 415}" width="132" height="112" rx="10" fill="${palette.white}" stroke="${palette.blue}" stroke-width="2" />
  <path d="M ${frontX + 412} ${frontY + 448} l 10 10 l 18 -22" fill="none" stroke="${palette.sage}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M ${frontX + 440} ${frontY + 444} H ${frontX + 496}" stroke="${palette.ink}" stroke-width="2" stroke-linecap="round" />
  <path d="M ${frontX + 412} ${frontY + 478} l 10 10 l 18 -22" fill="none" stroke="${palette.sage}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />
  <path d="M ${frontX + 440} ${frontY + 474} H ${frontX + 496}" stroke="${palette.ink}" stroke-width="2" stroke-linecap="round" />

  <circle cx="${frontX + 446}" cy="${frontY + 615}" r="16" fill="${palette.blue}" />
  <circle cx="${frontX + 488}" cy="${frontY + 603}" r="20" fill="${palette.sage}" />
  <circle cx="${frontX + 534}" cy="${frontY + 617}" r="16" fill="${palette.terracotta}" />
  <path d="M ${frontX + 430} ${frontY + 664} C ${frontX + 435} ${frontY + 630}, ${frontX + 455} ${frontY + 625}, ${frontX + 469} ${frontY + 639}" fill="none" stroke="${palette.blue}" stroke-width="6" stroke-linecap="round" />
  <path d="M ${frontX + 466} ${frontY + 665} C ${frontX + 474} ${frontY + 626}, ${frontX + 504} ${frontY + 620}, ${frontX + 520} ${frontY + 646}" fill="none" stroke="${palette.sage}" stroke-width="7" stroke-linecap="round" />
  <path d="M ${frontX + 515} ${frontY + 664} C ${frontX + 523} ${frontY + 632}, ${frontX + 543} ${frontY + 628}, ${frontX + 552} ${frontY + 646}" fill="none" stroke="${palette.terracotta}" stroke-width="6" stroke-linecap="round" />

  <path d="M ${backX + 65} ${backY + 120} C ${backX + 160} ${backY + 30}, ${backX + 330} ${backY + 44}, ${backX + 414} ${backY + 135} C ${backX + 370} ${backY + 195}, ${backX + 254} ${backY + 204}, ${backX + 124} ${backY + 190} C ${backX + 82} ${backY + 168}, ${backX + 58} ${backY + 147}, ${backX + 65} ${backY + 120} Z" fill="${palette.sand}" />
  <circle cx="${backX + 470}" cy="${backY + 180}" r="48" fill="${palette.sage}" opacity="0.22" />
  <rect x="${backX + 54}" y="${backY + 544}" width="116" height="90" rx="8" fill="${palette.terracotta}" opacity="0.64" />
  <rect x="${backX + 118}" y="${backY + 500}" width="142" height="104" rx="8" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${backX + 118} ${backY + 534} H ${backX + 260}" stroke="${palette.line}" stroke-width="1.5" />
  <path d="M ${backX + 189} ${backY + 500} V ${backY + 604}" stroke="${palette.line}" stroke-width="1.5" />

  <rect x="${barcode.x}" y="${barcode.y}" width="${barcode.width}" height="${barcode.height}" fill="${palette.white}" />

  ${textBlock({
    x: backTextX,
    y: backY + 255,
    width: backTextWidth,
    text: "Ein Umzug mit Kindern muss nicht chaotisch sein.",
    fontSize: 20,
    lineHeight: 24,
    fill: palette.ink,
    fontWeight: 700
  })}
  ${paragraphBlock({
    x: backTextX,
    y: backY + 300,
    width: backTextWidth,
    paragraphs: backParagraphs,
    fontSize: 14,
    lineHeight: 18,
    gap: 18,
    fill: palette.muted
  })}

  <rect x="${frontTextX}" y="${frontY + 118}" width="136" height="24" rx="12" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.2" />
  <text x="${frontTextX + 18}" y="${frontY + 135}" font-size="11" fill="${palette.muted}" font-family="Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="1.6">FAMILIENPLANER</text>

  ${frontTitle}
  ${textBlock({
    x: frontTextX,
    y: frontY + 328,
    width: frontTextWidth,
    text: "Der praktische Umzugsplaner für einen stressfreien Umzug mit Kindern",
    fontSize: 18,
    lineHeight: 22,
    fill: palette.muted
  })}

  <rect x="${frontTextX}" y="${frontY + 710}" width="462" height="86" rx="12" fill="${palette.white}" stroke="${palette.line}" stroke-width="1.5" />
  ${textBlock({
    x: frontTextX + 20,
    y: frontY + 740,
    width: 420,
    text: benefitText,
    fontSize: 13,
    lineHeight: 17,
    fill: palette.ink,
    fontWeight: 600
  })}

  <text x="${frontTextX}" y="${frontY + 826}" font-size="14" fill="${palette.muted}" font-family="Segoe UI, Arial, sans-serif" font-weight="600">Planvoll Familie</text>

  <g transform="translate(${spineX + spineWidth / 2}, ${backY + trimHeight / 2}) rotate(90)">
    <text x="0" y="0" text-anchor="middle" font-size="8.5" fill="${palette.ink}" font-family="Trebuchet MS, Segoe UI, Arial, sans-serif" font-weight="700" letter-spacing="0.8">Umzugscheckliste für Familien</text>
  </g>
</svg>`;
}

function buildTemplateSvg() {
  const {
    totalWidth,
    totalHeight,
    bleed,
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

  <text x="${backX + 18}" y="${backY - 12}" font-size="12" fill="#2f6fed" font-family="Segoe UI, Arial, sans-serif" font-weight="700">TRIM AREA BACK COVER</text>
  <text x="${frontX + 18}" y="${frontY - 12}" font-size="12" fill="#2f6fed" font-family="Segoe UI, Arial, sans-serif" font-weight="700">TRIM AREA FRONT COVER</text>
  <text x="${spineX + 6}" y="${backY - 12}" font-size="12" fill="#2f6fed" font-family="Segoe UI, Arial, sans-serif" font-weight="700">SPINE</text>
  <text x="${barcode.x + 16}" y="${barcode.y + 40}" font-size="16" fill="#d73a49" font-family="Segoe UI, Arial, sans-serif" font-weight="700">BARCODE AREA</text>
  <text x="${barcode.x + 16}" y="${barcode.y + 62}" font-size="11" fill="#d73a49" font-family="Segoe UI, Arial, sans-serif">2.0 in x 1.2 in</text>
  <text x="${barcode.x + 16}" y="${barcode.y + 80}" font-size="11" fill="#d73a49" font-family="Segoe UI, Arial, sans-serif">Keep clear for KDP barcode</text>

  <text x="${totalWidth / 2}" y="${totalHeight - 18}" text-anchor="middle" font-size="11" fill="#555" font-family="Segoe UI, Arial, sans-serif">
    8.5 x 11 in paperback | 128 pages | black and white interior | white paper | total cover size ${totalWidthIn.toFixed(6)} x ${totalHeightIn.toFixed(2)} in | spine ${spineWidthIn.toFixed(6)} in
  </text>
</svg>`;
}

async function exportPdfFromSvg(svg, outputPath) {
  const html = `<!doctype html>
  <html>
    <head>
      <meta charset="utf-8" />
      <style>
        @page { size: ${totalWidthIn}in ${totalHeightIn}in; margin: 0; }
        html, body { margin: 0; padding: 0; width: ${totalWidthIn}in; height: ${totalHeightIn}in; }
        body { background: #fff; }
        svg { display: block; width: ${totalWidthIn}in; height: ${totalHeightIn}in; }
      </style>
    </head>
    <body>${svg}</body>
  </html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: {
      width: Math.ceil(totalWidthIn * 120),
      height: Math.ceil(totalHeightIn * 120)
    }
  });
  await page.setContent(html, { waitUntil: "load" });
  await page.pdf({
    path: outputPath,
    width: `${totalWidthIn}in`,
    height: `${totalHeightIn}in`,
    margin: { top: "0in", right: "0in", bottom: "0in", left: "0in" },
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();
}

function normalizePdfSize(sourcePath, targetPath) {
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
    ["-c", script, sourcePath, targetPath, String(totalWidthIn), String(totalHeightIn)],
    { stdio: "inherit" }
  );
}

async function generateCover() {
  fs.mkdirSync(coverDir, { recursive: true });
  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const coverSvg = buildCoverSvg();
  const templateSvg = buildTemplateSvg();

  const coverSvgPath = path.join(coverDir, "cover-source.svg");
  const templateSvgPath = path.join(coverDir, "kdp-cover-template.svg");
  const templatePdfPath = path.join(coverDir, "kdp-cover-template.pdf");
  const coverPdfPath = path.join(coverDir, "cover-export.pdf");
  const outputPdfPath = path.join(outputDir, "umzugscheckliste-familien-cover.pdf");
  const templateRawPdfPath = path.join(coverDir, "kdp-cover-template.raw.pdf");
  const coverRawPdfPath = path.join(coverDir, "cover-export.raw.pdf");

  fs.writeFileSync(coverSvgPath, coverSvg, "utf8");
  fs.writeFileSync(templateSvgPath, templateSvg, "utf8");

  await exportPdfFromSvg(templateSvg, templateRawPdfPath);
  await exportPdfFromSvg(coverSvg, coverRawPdfPath);
  normalizePdfSize(templateRawPdfPath, templatePdfPath);
  normalizePdfSize(coverRawPdfPath, coverPdfPath);
  fs.copyFileSync(coverPdfPath, outputPdfPath);
  fs.rmSync(templateRawPdfPath, { force: true });
  fs.rmSync(coverRawPdfPath, { force: true });

  console.log(`Generated ${coverSvgPath}`);
  console.log(`Generated ${templateSvgPath}`);
  console.log(`Generated ${templatePdfPath}`);
  console.log(`Generated ${coverPdfPath}`);
  console.log(`Generated ${outputPdfPath}`);
}

generateCover().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
