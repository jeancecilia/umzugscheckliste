const fs = require("fs");
const path = require("path");
const { getEmbeddedFontCss } = require("./font-assets");

const rootDir = path.resolve(__dirname, "..");
const contentDir = path.join(rootDir, "content");
const templateDir = path.join(rootDir, "templates");
const styleDir = path.join(rootDir, "styles");
const distDir = path.join(rootDir, "dist");
const outputDir = path.join(rootDir, "output");

function loadJson(fileName) {
  return JSON.parse(fs.readFileSync(path.join(contentDir, fileName), "utf8"));
}

function loadTemplate(fileName) {
  return fs.readFileSync(path.join(templateDir, fileName), "utf8");
}

function replaceTokens(template, data) {
  return template.replace(/{{\s*([\w.-]+)\s*}}/g, (_, key) => {
    const value = data[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function normalizeLookupKey(value) {
  return String(value || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function padRows(values, minCount) {
  const rows = [...values];
  while (rows.length < minCount) {
    rows.push("");
  }
  return rows;
}

function renderFooter(page) {
  if (!page.showFooter) {
    return "";
  }

  return `
    <div class="page-footer ${page.bookSide === "left" ? "is-left-page" : "is-right-page"}">
      <div class="footer-left">${escapeHtml(page.footerSection || "")}</div>
      <div class="footer-center"><span class="footer-center-line"></span></div>
      <div class="footer-right">${page.printNumber || ""}</div>
    </div>`;
}

function renderSvgIcon(iconName, className = "planner-icon") {
  const paths = {
    "house-heart": `
      <path d="M5.5 14.5L16 6l10.5 8.5"></path>
      <path d="M8 13.5V27h16V13.5"></path>
      <path d="M13 27v-7h6v7"></path>
      <path d="M16 14.2c-1.1-1.6-4-1.1-4 1.3c0 2.8 4 4.8 4 4.8s4-2 4-4.8c0-2.4-2.9-2.9-4-1.3z"></path>`,
    "calendar-check": `
      <rect x="5" y="7" width="22" height="20" rx="4"></rect>
      <path d="M10 4v6"></path>
      <path d="M22 4v6"></path>
      <path d="M5 12h22"></path>
      <path d="M11 19l3 3l7-8"></path>`,
    "users-round": `
      <circle cx="12" cy="12" r="4"></circle>
      <circle cx="22" cy="13" r="3.5"></circle>
      <path d="M5 26c1.5-4 4.6-6 7-6c2.8 0 5.5 2.1 7 6"></path>
      <path d="M18 26c0.8-2.7 2.7-4.4 5.3-4.4c2 0 3.6 1 4.7 4.4"></path>`,
    boxes: `
      <path d="M5 13l7-4l7 4l-7 4l-7-4z"></path>
      <path d="M12 17v10"></path>
      <path d="M5 13v10l7 4l7-4V13"></path>
      <path d="M19 17l6-3.5l-6-3.5l-6 3.5"></path>
      <path d="M20 18.5l6-3.5v8l-6 3.5"></path>
      <path d="M20 27v-8.5"></path>`,
    "wallet-cards": `
      <rect x="5" y="10" width="22" height="14" rx="4"></rect>
      <path d="M9 10V8c0-1.7 1.3-3 3-3h8"></path>
      <path d="M17 16h7"></path>
      <path d="M10 19h4"></path>
      <path d="M22 10V7"></path>`,
    "file-text": `
      <path d="M9 4h10l4 4v20H9z"></path>
      <path d="M19 4v5h5"></path>
      <path d="M12 14h8"></path>
      <path d="M12 18h8"></path>
      <path d="M12 22h5"></path>`,
    "clipboard-check": `
      <rect x="8" y="6" width="16" height="22" rx="3"></rect>
      <path d="M12 6h8v3h-8z"></path>
      <path d="M12 17l3 3l5-6"></path>
      <path d="M12 24h8"></path>`
  };

  const iconMarkup = paths[iconName] || paths["file-text"];

  return `
    <svg class="${className}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      ${iconMarkup}
    </svg>`;
}

function resolveFeatureIcon(title) {
  const key = normalizeLookupKey(title);

  if (key.includes("zeitplan")) {
    return "calendar-check";
  }
  if (key.includes("familie") || key.includes("kinder")) {
    return "users-round";
  }
  if (key.includes("packen") || key.includes("kartons")) {
    return "boxes";
  }
  if (key.includes("budget") || key.includes("ubergabe")) {
    return "wallet-cards";
  }

  return "file-text";
}

function resolveSectionIcon(sectionId) {
  const iconBySection = {
    timeline: "calendar-check",
    family: "users-round",
    packing: "boxes",
    budget: "wallet-cards",
    address: "file-text",
    handover: "clipboard-check"
  };

  return iconBySection[sectionId] || "file-text";
}

function renderFeatureCards(items = []) {
  return items
    .map(
      (item) => `
        <div class="feature-card">
          <div class="feature-icon-wrap">${renderSvgIcon(resolveFeatureIcon(item.title), "planner-icon feature-icon")}</div>
          <div class="feature-copy">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </div>
        </div>`
    )
    .join("");
}

function renderTitlePillars(items = []) {
  return items
    .map(
      (item, index) => `
        <div class="title-pillar">
          <div class="title-pillar-index">${index + 1}</div>
          <div class="title-pillar-copy">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.text)}</span>
          </div>
        </div>`
    )
    .join("");
}

function renderInfoCards(items = []) {
  return items
    .map(
      (item) => `
        <div class="info-card">
          <strong>${escapeHtml(item.title)}</strong>
          <p>${escapeHtml(item.text)}</p>
        </div>`
    )
    .join("");
}

function renderStepCards(items = []) {
  return items
    .map(
      (item, index) => `
        <div class="step-card">
          <span>${index + 1}</span>
          <p>${escapeHtml(item)}</p>
        </div>`
    )
    .join("");
}

function renderHowToStepCards(items = []) {
  return items
    .map(
      (item, index) => `
        <div class="howto-editorial-step">
          <div class="howto-editorial-step-number">${index + 1}</div>
          <p>${escapeHtml(item)}</p>
        </div>`
    )
    .join("");
}

function renderContentsCards(items = []) {
  return items
    .map((item) => {
      const marker = item.range || item.marker || "";

      if (!marker) {
        return `
        <div class="contents-card no-range">
          <div class="contents-text">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.description)}</span>
          </div>
        </div>`;
      }

      return `
        <div class="contents-card">
          <div class="contents-range">${escapeHtml(marker)}</div>
          <div class="contents-text">
            <strong>${escapeHtml(item.title)}</strong>
            <span>${escapeHtml(item.description)}</span>
          </div>
        </div>`;
    })
    .join("");
}

function getSnapshotLineCount(label) {
  const key = normalizeLookupKey(label);

  if (
    key.includes("adresse") ||
    key.includes("priorit") ||
    key.includes("reparatur") ||
    key.includes("druck") ||
    key.includes("funktionieren muss")
  ) {
    return 2;
  }

  return 1;
}

function renderSnapshotWriteLines(lineCount = 1) {
  return Array.from({ length: lineCount }, () => '<div class="snapshot-line"></div>').join("");
}

function renderSnapshotCards(items = []) {
  return items
    .map((item) => {
      const lineCount = getSnapshotLineCount(item);

      return `
        <div class="snapshot-card">
          <div class="field-label">${escapeHtml(item)}</div>
          <div class="snapshot-write${lineCount > 1 ? " multi-line" : ""}">
            ${renderSnapshotWriteLines(lineCount)}
          </div>
        </div>`;
    })
    .join("");
}

function renderChecklistRows(items = [], minimumRows = 10, options = {}) {
  const customRowLabel = options.customRowLabel || "Eigene Ergänzung";
  let customRowCount = 0;

  return padRows(items, minimumRows)
    .map((item) => {
      const isCustomRow = !item;
      if (isCustomRow) {
        customRowCount += 1;
      }

      const label = isCustomRow && customRowCount === 1 ? customRowLabel : item;
      const labelMarkup = label ? escapeHtml(label) : "&nbsp;";

      return `
        <div class="checklist-row">
          <span class="checkbox"></span>
          <span class="row-label${isCustomRow && customRowCount === 1 ? " custom-row-label" : ""}">${labelMarkup}</span>
          <span class="row-line"></span>
        </div>`;
    })
    .join("");
}

function renderPromptCards(items = []) {
  return items
    .map(
      (item) => `
        <div class="prompt-card">
          <div class="field-label">${escapeHtml(item.title)}</div>
          <p>${escapeHtml(item.text)}</p>
        </div>`
    )
    .join("");
}

function renderLines(lineCount = 18) {
  return Array.from({ length: lineCount }, () => '<div class="line"></div>').join("");
}

function renderWritingGuideLines(lineCount = 6) {
  return Array.from({ length: lineCount }, () => '<div class="writing-line"></div>').join("");
}

function renderNotesBox(label, options = {}) {
  const classes = ["notes-box"];

  if (options.fill) {
    classes.push("fill");
  }
  if (options.compact) {
    classes.push("compact");
  }
  if (options.medium) {
    classes.push("medium");
  }
  if (options.lined !== false) {
    classes.push("lined");
  }

  return `
    <div class="${classes.join(" ")}">
      <div class="field-label">${escapeHtml(label)}</div>
      <div class="writing-guides">
        ${renderWritingGuideLines(options.lineCount || 6)}
      </div>
    </div>`;
}

function renderProfileFields(fields = []) {
  return fields
    .map(
      (field) => `
        <div class="profile-field">
          <div class="field-label">${escapeHtml(field)}</div>
          <div class="profile-write"></div>
        </div>`
    )
    .join("");
}

function renderPackRows(items = [], minimumRows = 11) {
  return padRows(items, minimumRows)
    .map(
      (item) => `
        <div class="packlist-row">
          <div class="pack-col">${escapeHtml(item || " ")}</div>
          <div class="pack-col"></div>
          <div class="pack-col"></div>
          <div class="pack-col"></div>
          <div class="pack-col"></div>
        </div>`
    )
    .join("");
}

function renderBudgetRows(items = [], minimumRows = 9) {
  return padRows(items, minimumRows)
    .map(
      (item) => `
        <div class="budget-row">
          <div>${escapeHtml(item || " ")}</div>
          <div></div>
          <div></div>
          <div class="paid-box"><span class="checkbox small"></span></div>
          <div></div>
          <div></div>
        </div>`
    )
    .join("");
}

function renderAddressRows(items = [], minimumRows = 9) {
  return padRows(items, minimumRows)
    .map(
      (item) => `
        <div class="address-row">
          <div>${escapeHtml(item || " ")}</div>
          <div class="center"><span class="checkbox small"></span></div>
          <div class="center"><span class="checkbox small"></span></div>
          <div></div>
        </div>`
    )
    .join("");
}

function renderHandoverRows(items = [], minimumRows = 9) {
  return padRows(items, minimumRows)
    .map(
      (item) => `
        <div class="handover-row">
          <div>${escapeHtml(item || " ")}</div>
          <div></div>
          <div class="center"><span class="checkbox small"></span></div>
          <div></div>
          <div></div>
        </div>`
    )
    .join("");
}

function renderContactRows(rowCount = 8) {
  return Array.from({ length: rowCount }, () => `
    <div class="contact-row">
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>`).join("");
}

function renderDividerHighlights(items = []) {
  return items
    .map(
      (item) => `
        <li>${escapeHtml(item)}</li>`
    )
    .join("");
}

function buildInfoPageMeta(page) {
  const notes = [];

  if (page.disclaimer) {
    notes.push(`<div class="info-small-note">${escapeHtml(page.disclaimer)}</div>`);
  }
  if (page.imprint) {
    notes.push(`<div class="info-small-note info-imprint">${escapeHtml(page.imprint)}</div>`);
  }

  return notes.join("");
}

function normalizeCustomTableRow(item, columnCount) {
  if (Array.isArray(item)) {
    return item.slice(0, columnCount);
  }

  if (item && typeof item === "object") {
    if (Array.isArray(item.cells)) {
      return item.cells.slice(0, columnCount);
    }
    if (item.label) {
      return [item.label];
    }
  }

  if (typeof item === "string") {
    return [item];
  }

  return [];
}

function renderCustomTableHead(columns = []) {
  return columns
    .map((column) => {
      const classes = ["custom-table-cell"];
      if (column.align === "center" || column.type === "checkbox") {
        classes.push("center");
      }

      return `<div class="${classes.join(" ")}">${escapeHtml(column.label || "")}</div>`;
    })
    .join("");
}

function renderCustomTableRows(items = [], columns = [], minimumRows = 8) {
  const paddedRows = padRows(items, minimumRows);

  return paddedRows
    .map((item) => {
      const cells = normalizeCustomTableRow(item, columns.length);

      return `
        <div class="custom-table-row">
          ${columns
            .map((column, columnIndex) => {
              const rawValue = cells[columnIndex];
              const classes = ["custom-table-cell"];
              if (column.align === "center" || column.type === "checkbox") {
                classes.push("center");
              }

              let content = "&nbsp;";
              if (column.type === "checkbox") {
                content = '<span class="checkbox small"></span>';
              } else if (rawValue) {
                content = escapeHtml(rawValue);
              }

              return `<div class="${classes.join(" ")}">${content}</div>`;
            })
            .join("")}
        </div>`;
    })
    .join("");
}

function decoratePageMarkup(markup, page) {
  const classes = [
    page.numbering === "body" ? "body-page" : "front-page",
    `section-${page.sectionId || "start"}`,
    `book-${page.bookSide || "right"}`
  ].join(" ");

  return markup.replace(/class="page([^"]*)"/, `class="page ${classes}$1"`);
}

function formatPageCounter(current, total) {
  return `${String(current || "").padStart(2, "0")} / ${String(total || "").padStart(2, "0")}`;
}

function renderPage(page) {
  const shared = {
    sectionLabel: escapeHtml(page.sectionLabel || ""),
    title: escapeHtml(page.title || ""),
    subtitle: escapeHtml(page.subtitle || ""),
    intro: escapeHtml(page.intro || ""),
    footer: renderFooter(page),
    pageCounter: escapeHtml(formatPageCounter(page.sequenceNumber, page.totalPageCount)),
    brandName: escapeHtml(page.brandName || "")
  };

  switch (page.kind) {
    case "titlePage":
      return replaceTokens(loadTemplate("title-page.html"), {
        ...shared,
        promise: escapeHtml(page.promise || ""),
        features: renderTitlePillars(page.features || []),
        benefit: escapeHtml(page.benefit || ""),
        heroIcon: renderSvgIcon("house-heart", "planner-icon title-visual-icon")
      });
    case "infoPage":
      return replaceTokens(loadTemplate("info-page.html"), {
        ...shared,
        cards: renderInfoCards(page.cards || []),
        note: escapeHtml(page.note || ""),
        metaNotes: buildInfoPageMeta(page)
      });
    case "howToUse":
      return replaceTokens(loadTemplate("how-to-use-page.html"), {
        ...shared,
        steps: renderHowToStepCards(page.steps || []),
        note: escapeHtml(page.note || "")
      });
    case "contentsPage":
      return replaceTokens(loadTemplate("contents-page.html"), {
        ...shared,
        entries: renderContentsCards(page.entries || []),
        noteBox: page.note ? `<div class="tip-box">${escapeHtml(page.note)}</div>` : ""
      });
    case "snapshot":
      return replaceTokens(loadTemplate("snapshot-page.html"), {
        ...shared,
        cards: renderSnapshotCards(page.fields || []),
        notesBox: renderNotesBox(page.notesLabel || "Zusätzliche Hinweise", {
          fill: true,
          lineCount: 6
        })
      });
    case "contacts":
      return replaceTokens(loadTemplate("contacts-page.html"), {
        ...shared,
        rows: renderContactRows(page.rowCount || 8),
        notesBox: renderNotesBox(page.notesLabel || "Zusätzliche Kontakte", {
          fill: true,
          lineCount: 6
        })
      });
    case "divider":
      return replaceTokens(loadTemplate("divider-page.html"), {
        ...shared,
        description: escapeHtml(page.description || ""),
        motif: escapeHtml(page.motif || ""),
        sectionTag: escapeHtml(page.sectionTag || ""),
        pageRange: escapeHtml(page.pageRange || ""),
        worksheetCount: escapeHtml(page.worksheetCountLabel || ""),
        outcome: escapeHtml(page.outcome || ""),
        icon: renderSvgIcon(resolveSectionIcon(page.sectionId), "planner-icon divider-icon"),
        highlights: renderDividerHighlights(page.highlights || [])
      });
    case "weeklyChecklist":
      return replaceTokens(loadTemplate("weekly-checklist-page.html"), {
        ...shared,
        priority: escapeHtml(page.priority || ""),
        appointments: escapeHtml(page.appointments || ""),
        familyReminder: escapeHtml(page.familyReminder || ""),
        rows: renderChecklistRows(page.items || [], 12, {
          customRowLabel: page.customRowLabel || "Eigene Ergänzung"
        }),
        notesBox: renderNotesBox("Notizen", {
          fill: true,
          lineCount: 7
        })
      });
    case "checklist":
      return replaceTokens(loadTemplate("checklist-page.html"), {
        ...shared,
        focusLabel: escapeHtml(page.focusLabel || "Heute im Blick"),
        focusText: escapeHtml(page.focusText || ""),
        notesBox: renderNotesBox(page.notesLabel || "Notizen", {
          fill: true,
          lineCount: 7
        }),
        rows: renderChecklistRows(page.items || [], page.minimumRows || 9, {
          customRowLabel: page.customRowLabel || "Eigene Ergänzung"
        })
      });
    case "familyGuide":
      return replaceTokens(loadTemplate("family-guide-page.html"), {
        ...shared,
        prompts: renderPromptCards(page.prompts || []),
        rows: renderChecklistRows(page.items || [], page.minimumRows || 10, {
          customRowLabel: page.customRowLabel || "Eigene Ergänzung"
        }),
        notesBox: renderNotesBox(page.notesLabel || "Familien-Notizen", {
          fill: true,
          lineCount: 7
        })
      });
    case "familyProfile":
      return replaceTokens(loadTemplate("family-profile-page.html"), {
        ...shared,
        fields: renderProfileFields(page.fields || [])
      });
    case "journal":
      return replaceTokens(loadTemplate("journal-page.html"), {
        ...shared,
        prompts: renderPromptCards(page.prompts || []),
        lines: renderLines(page.lineCount || 18)
      });
    case "packlist":
      return replaceTokens(loadTemplate("packlist-page.html"), {
        ...shared,
        room: escapeHtml(page.room || ""),
        rows: renderPackRows(page.items || [], page.minimumRows || 11)
      });
    case "budget":
      return replaceTokens(loadTemplate("budget-page.html"), {
        ...shared,
        rows: renderBudgetRows(page.items || [], page.minimumRows || 9),
        leftNotesBox: renderNotesBox(page.leftLabel || "Was wir im Blick behalten wollen", {
          medium: true,
          lineCount: 5
        }),
        rightNotesBox: renderNotesBox(page.rightLabel || "Nächster Betrag / offene Frage", {
          medium: true,
          lineCount: 5
        })
      });
    case "addressChange":
      return replaceTokens(loadTemplate("address-change-page.html"), {
        ...shared,
        rows: renderAddressRows(page.items || [], page.minimumRows || 9),
        leftNotesBox: renderNotesBox(page.leftLabel || "Fehlende Unterlagen und Angaben", {
          medium: true,
          lineCount: 5
        }),
        rightNotesBox: renderNotesBox(page.rightLabel || "Rückmeldung / Frist", {
          medium: true,
          lineCount: 5
        })
      });
    case "handover":
      return replaceTokens(loadTemplate("handover-page.html"), {
        ...shared,
        rows: renderHandoverRows(page.items || [], page.minimumRows || 9),
        leftNotesBox: renderNotesBox(page.leftLabel || "Besonders wichtig auf dieser Seite", {
          medium: true,
          lineCount: 5
        }),
        rightNotesBox: renderNotesBox(page.rightLabel || "Wer kümmert sich / bis wann", {
          medium: true,
          lineCount: 5
        })
      });
    case "customTable":
      return replaceTokens(loadTemplate("custom-table-page.html"), {
        ...shared,
        callout: page.callout
          ? `<div class="data-callout">${escapeHtml(page.calloutLabel || "Fokus")}: ${escapeHtml(page.callout)}</div>`
          : "",
        tableVariant: escapeHtml(page.tableVariant || ""),
        columnLayout: escapeHtml((page.columns || []).map((column) => column.width || "1fr").join(" ")),
        head: renderCustomTableHead(page.columns || []),
        rows: renderCustomTableRows(
          page.items || [],
          page.columns || [],
          page.minimumRows || Math.max((page.items || []).length, 8)
        ),
        leftNotesBox: renderNotesBox(page.leftLabel || "Besondere Hinweise", {
          medium: true,
          lineCount: 5
        }),
        rightNotesBox: renderNotesBox(page.rightLabel || "Nächster Schritt / Rückfrage", {
          medium: true,
          lineCount: 5
        })
      });
    default:
      throw new Error(`Unsupported page kind: ${page.kind}`);
  }
}

function addSectionRanges(pages, sections) {
  const rangeBySectionTitle = new Map();
  const absoluteRangeBySectionTitle = new Map();

  for (const section of sections) {
    const sectionPages = pages.filter((page) => page.sectionId === section.id && page.sequenceNumber);
    const numberedPages = pages.filter(
      (page) => page.sectionId === section.id && page.numbering === "body" && page.printNumber
    );

    if (sectionPages.length) {
      const firstAbsolute = sectionPages[0].sequenceNumber;
      const lastAbsolute = sectionPages[sectionPages.length - 1].sequenceNumber;
      const absoluteMarker = `S. ${firstAbsolute}-${lastAbsolute}`;
      absoluteRangeBySectionTitle.set(normalizeLookupKey(section.title), absoluteMarker);
      if (section.footerName) {
        absoluteRangeBySectionTitle.set(normalizeLookupKey(section.footerName), absoluteMarker);
      }
      if (section.label) {
        absoluteRangeBySectionTitle.set(normalizeLookupKey(section.label), absoluteMarker);
      }
    }

    if (!numberedPages.length) {
      continue;
    }

    const firstNumber = numberedPages[0].printNumber;
    const lastNumber = numberedPages[numberedPages.length - 1].printNumber;
    const marker = `S. ${firstNumber}-${lastNumber}`;
    rangeBySectionTitle.set(normalizeLookupKey(section.title), marker);
    if (section.footerName) {
      rangeBySectionTitle.set(normalizeLookupKey(section.footerName), marker);
    }
    if (section.label) {
      rangeBySectionTitle.set(normalizeLookupKey(section.label), marker);
    }
  }

  const rangeNote =
    "Die Seitenbereiche beziehen sich auf die gedruckten Fußnummern ab dem Zeitplan. Die Einstiegsseiten vorne bleiben bewusst ohne Seitenzahl.";

  for (const page of pages) {
    if (page.kind === "howToUse" && Array.isArray(page.sections)) {
      page.sections = page.sections.map((entry) => {
        const marker = rangeBySectionTitle.get(normalizeLookupKey(entry.title));
        const absoluteMarker = absoluteRangeBySectionTitle.get(normalizeLookupKey(entry.title));
        return {
          ...entry,
          ...(marker ? { marker } : {}),
          ...(absoluteMarker ? { absoluteMarker } : {})
        };
      });
    }

    if (page.kind === "contentsPage" && Array.isArray(page.entries)) {
      page.entries = page.entries.map((entry) => {
        const marker = rangeBySectionTitle.get(normalizeLookupKey(entry.title));
        const absoluteMarker = absoluteRangeBySectionTitle.get(normalizeLookupKey(entry.title));
        return {
          ...entry,
          ...(marker ? { marker } : {}),
          ...(absoluteMarker ? { absoluteMarker } : {})
        };
      });
      page.note = page.note ? `${page.note} ${rangeNote}` : rangeNote;
    }
  }
}

function formatSectionPageRange(firstNumber, lastNumber) {
  if (!firstNumber || !lastNumber) {
    return "";
  }

  return firstNumber === lastNumber ? `S. ${firstNumber}` : `S. ${firstNumber}-${lastNumber}`;
}

function addDividerMetadata(pages, sections) {
  for (const section of sections) {
    const dividerPage = pages.find((page) => page.kind === "divider" && page.sectionId === section.id);
    if (!dividerPage) {
      continue;
    }

    const worksheetPages = pages.filter(
      (page) => page.sectionId === section.id && page.numbering === "body" && page.kind !== "divider"
    );

    if (!worksheetPages.length) {
      continue;
    }

    dividerPage.pageRange = formatSectionPageRange(
      worksheetPages[0].printNumber,
      worksheetPages[worksheetPages.length - 1].printNumber
    );
    dividerPage.worksheetCountLabel =
      worksheetPages.length === 1 ? "1 Arbeitsseite" : `${worksheetPages.length} Arbeitsseiten`;
    dividerPage.outcome = section.outcome || "";
  }
}

function buildPageList() {
  const config = loadJson("book-config.json");
  const sections = loadJson("sections.json");
  const checklists = loadJson("checklists.json");
  const familyPages = loadJson("family-pages.json");
  const packlists = loadJson("packlists.json");
  const budgetPages = loadJson("budget-pages.json");
  const addressPages = loadJson("address-change-pages.json");
  const handoverPages = loadJson("handover-pages.json");

  const contentBySection = {
    start: checklists.frontMatter,
    timeline: checklists.timeline,
    family: familyPages.pages,
    packing: packlists.pages,
    budget: budgetPages.pages,
    address: addressPages.pages,
    handover: handoverPages.pages
  };

  const pages = [];
  const dividerSections = sections.filter((section) => section.divider);
  let dividerIndex = 0;

  for (const section of sections) {
    if (section.divider) {
      dividerIndex += 1;
      pages.push({
        kind: "divider",
        title: section.title,
        description: section.description,
        highlights: section.highlights,
        motif: section.motif,
        sectionTag: `Abschnitt ${dividerIndex} von ${dividerSections.length}`,
        sectionId: section.id,
        sectionLabel: section.label,
        footerSection: section.footerName || section.title,
        showFooter: section.numbering === "body",
        numbering: section.numbering
      });
    }

    for (const page of contentBySection[section.id] || []) {
      pages.push({
        ...page,
        sectionId: section.id,
        sectionLabel: page.sectionLabel || section.label,
        footerSection: section.footerName || section.title,
        showFooter: page.showFooter !== undefined ? page.showFooter : section.numbering === "body",
        numbering: section.numbering,
        brandName: config.book.authorPlaceholder || ""
      });
    }
  }

  let printedNumber = 0;
  for (const [index, page] of pages.entries()) {
    page.sequenceNumber = index + 1;
    page.bookSide = (index + 1) % 2 === 0 ? "left" : "right";
    if (page.numbering === "body") {
      printedNumber += 1;
      page.printNumber = printedNumber;
    } else {
      page.printNumber = "";
    }
  }

  for (const page of pages) {
    page.totalPageCount = pages.length;
  }

  addDividerMetadata(pages, sections);
  addSectionRanges(pages, sections);

  return pages;
}

function getStyles() {
  const files = ["theme.css", "components.css", "print.css"];
  return [getEmbeddedFontCss(), ...files.map((fileName) => fs.readFileSync(path.join(styleDir, fileName), "utf8"))].join("\n");
}

function buildInterior(options = {}) {
  const config = loadJson("book-config.json");
  const baseTemplate = loadTemplate("base.html");
  const styles = getStyles();
  const pages = buildPageList();

  const finalHtml = replaceTokens(baseTemplate, {
    title: escapeHtml(config.book.title),
    subtitle: escapeHtml(config.book.subtitle),
    inlineStyles: styles,
    pages: pages.map((page) => decoratePageMarkup(renderPage(page), page)).join("\n")
  });

  fs.mkdirSync(distDir, { recursive: true });
  fs.mkdirSync(outputDir, { recursive: true });

  const distPath = path.join(distDir, "interior.html");
  const previewPath = path.join(outputDir, "umzugscheckliste-familien-interior-preview.html");

  fs.writeFileSync(distPath, finalHtml, "utf8");
  fs.writeFileSync(previewPath, finalHtml, "utf8");

  const pageCount = pages.length;
  console.log(`Generated ${distPath}`);
  console.log(`Generated ${previewPath}`);
  console.log(`Estimated page count: ${pageCount}`);

  if (options.previewOnly) {
    console.log("Preview build complete.");
  }

  if (config.book.pageTarget && pageCount !== config.book.pageTarget) {
    console.warn(
      `Configured page target is ${config.book.pageTarget}, current output is ${pageCount}.`
    );
  }

  return {
    pageCount,
    pages,
    distPath,
    previewPath,
    html: finalHtml
  };
}

if (require.main === module) {
  buildInterior({ previewOnly: process.argv.includes("--preview") });
}

module.exports = { buildInterior, buildPageList };
