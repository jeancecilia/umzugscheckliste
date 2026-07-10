const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");

const fontDefinitions = [
  {
    family: "Source Sans 3",
    weight: 400,
    style: "normal",
    file: path.join(
      "node_modules",
      "@fontsource",
      "source-sans-3",
      "files",
      "source-sans-3-latin-400-normal.woff2"
    )
  },
  {
    family: "Source Sans 3",
    weight: 600,
    style: "normal",
    file: path.join(
      "node_modules",
      "@fontsource",
      "source-sans-3",
      "files",
      "source-sans-3-latin-600-normal.woff2"
    )
  },
  {
    family: "Source Sans 3",
    weight: 700,
    style: "normal",
    file: path.join(
      "node_modules",
      "@fontsource",
      "source-sans-3",
      "files",
      "source-sans-3-latin-700-normal.woff2"
    )
  },
  {
    family: "Montserrat",
    weight: 600,
    style: "normal",
    file: path.join(
      "node_modules",
      "@fontsource",
      "montserrat",
      "files",
      "montserrat-latin-600-normal.woff2"
    )
  },
  {
    family: "Montserrat",
    weight: 700,
    style: "normal",
    file: path.join(
      "node_modules",
      "@fontsource",
      "montserrat",
      "files",
      "montserrat-latin-700-normal.woff2"
    )
  }
];

function getEmbeddedFontCss() {
  return fontDefinitions
    .map((font) => {
      const filePath = path.join(rootDir, font.file);
      if (!fs.existsSync(filePath)) {
        throw new Error(
          `Missing font asset: ${font.file}. Run npm install before building the planner.`
        );
      }

      const base64 = fs.readFileSync(filePath).toString("base64");
      return `
@font-face {
  font-family: "${font.family}";
  font-style: ${font.style};
  font-weight: ${font.weight};
  font-display: swap;
  src: url("data:font/woff2;base64,${base64}") format("woff2");
}`;
    })
    .join("\n");
}

module.exports = { getEmbeddedFontCss };
