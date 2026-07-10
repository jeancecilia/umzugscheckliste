const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const { chromium } = require("playwright");
const { buildInterior } = require("./generate-html");

async function exportPdf() {
  const rootDir = path.resolve(__dirname, "..");
  const distPath = path.join(rootDir, "dist", "interior.html");
  const outputDir = path.join(rootDir, "output");
  const outputPath = path.join(
    outputDir,
    "umzugscheckliste-familien-interior-premium.pdf"
  );

  buildInterior();
  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto(pathToFileURL(distPath).href, { waitUntil: "networkidle" });
  await page.pdf({
    path: outputPath,
    printBackground: true,
    preferCSSPageSize: true
  });
  await browser.close();

  console.log(`Generated ${outputPath}`);
}

exportPdf().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
