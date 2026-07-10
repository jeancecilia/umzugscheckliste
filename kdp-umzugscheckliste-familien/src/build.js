const { buildInterior } = require("./generate-html");

buildInterior({ previewOnly: process.argv.includes("--preview") });
