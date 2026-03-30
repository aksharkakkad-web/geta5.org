const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  Header, Footer, AlignmentType, LevelFormat,
  HeadingLevel, BorderStyle, WidthType, ShadingType,
  PageBreak, PageNumber, TableOfContents
} = require("docx");
const fs = require("fs");
const path = require("path");

const BASE = "public/data";
const OUT = "content-exports";

const MODE_NAMES = {
  definition_to_term: "Definition \u2192 Term",
  significance_to_person: "Significance \u2192 Person",
  significance_to_event: "Significance \u2192 Event",
  significance_to_case: "Significance \u2192 Case",
  name_to_formula: "Name \u2192 Formula",
  concept_mc: "Concept Multiple Choice",
};

const MODE_ORDER = [
  "definition_to_term",
  "significance_to_person",
  "significance_to_event",
  "significance_to_case",
  "name_to_formula",
  "concept_mc",
];

// ── Helpers ──────────────────────────────────────────────────

function diffLabel(d) {
  return d === "easy" ? "Easy" : d === "medium" ? "Medium" : "Hard";
}
function diffColor(d) {
  return d === "easy" ? "16a34a" : d === "medium" ? "d97706" : "dc2626";
}

/** Parse HTML table into rows of cell strings */
function parseHtmlTable(html) {
  if (!html) return [];
  const rows = [];
  const trMatches = html.match(/<tr[^>]*>([\s\S]*?)<\/tr>/gi) || [];
  for (const tr of trMatches) {
    const cells = [];
    const cellMatches = tr.match(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi) || [];
    for (const cell of cellMatches) {
      let text = cell.replace(/<\/?t[hd][^>]*>/gi, "").trim();
      cells.push(text);
    }
    if (cells.length) rows.push(cells);
  }
  return rows;
}

/** Parse structured table data {headers, rows} or {data: {headers, rows}} */
function parseTableData(obj) {
  if (!obj) return [];
  const src = obj.data || obj;
  const headers = src.headers;
  const dataRows = src.rows;
  if (!headers || !dataRows) return [];
  return [headers, ...dataRows];
}

/** Normalize meta.json across different formats */
function normalizeMeta(meta) {
  const subjectName = meta.subject_name || meta.display_name || meta.subject;
  const units = (meta.units || []).map((u, i) => ({
    unit_id: u.unit_id || u.id,
    unit_name: u.unit_name || u.name,
    unit_number: u.unit_number || i + 1,
    weight: u.college_board_percentage
      ? `${u.college_board_percentage}%`
      : u.cb_weight || null,
  }));
  return { subjectName, units, exam_date: meta.exam_date };
}

/** Parse Chart.js config JSON into readable text lines */
function describeChart(jsonStr) {
  try {
    const cfg = JSON.parse(jsonStr);
    const title =
      cfg.options?.plugins?.title?.text || cfg.type + " chart" || "Chart";
    const labels = cfg.data?.labels || [];
    const datasets = cfg.data?.datasets || [];
    const lines = [`[${title}]`];
    for (const ds of datasets) {
      const pairs = labels.map((l, i) => `(${l}, ${ds.data[i]})`).join(", ");
      lines.push(`${ds.label || "Data"}: ${pairs}`);
    }
    return lines;
  } catch {
    return ["[Chart data]"];
  }
}

/** Build TextRun array that renders KaTeX $...$ segments in italic Consolas */
function richText(str, baseOpts = {}) {
  if (!str) return [new TextRun({ text: "", ...baseOpts })];
  const parts = str.split(/(\$[^$]+\$)/g);
  return parts
    .filter((p) => p.length > 0)
    .map((p) => {
      if (p.startsWith("$") && p.endsWith("$")) {
        const inner = p.slice(1, -1);
        return new TextRun({
          text: inner,
          ...baseOpts,
          font: "Consolas",
          italics: true,
        });
      }
      return new TextRun({ text: p, ...baseOpts });
    });
}

// ── Table builder ────────────────────────────────────────────

const thinBorder = {
  style: BorderStyle.SINGLE,
  size: 1,
  color: "BBBBBB",
};
const borders = {
  top: thinBorder,
  bottom: thinBorder,
  left: thinBorder,
  right: thinBorder,
};
const cellMargins = { top: 60, bottom: 60, left: 100, right: 100 };

function buildDocxTable(rows) {
  if (!rows.length) return null;
  const colCount = Math.max(...rows.map((r) => r.length));
  const tableWidth = 9360; // US Letter minus 1" margins
  const colWidth = Math.floor(tableWidth / colCount);
  const columnWidths = Array(colCount).fill(colWidth);
  // adjust last column to absorb rounding
  columnWidths[colCount - 1] = tableWidth - colWidth * (colCount - 1);

  return new Table({
    width: { size: tableWidth, type: WidthType.DXA },
    columnWidths,
    rows: rows.map((cells, ri) =>
      new TableRow({
        children: cells.map((text, ci) =>
          new TableCell({
            borders,
            width: { size: columnWidths[ci], type: WidthType.DXA },
            margins: cellMargins,
            shading:
              ri === 0
                ? { fill: "E8E8F0", type: ShadingType.CLEAR }
                : undefined,
            children: [
              new Paragraph({
                children: richText(text, {
                  size: 20,
                  bold: ri === 0,
                }),
              }),
            ],
          })
        ),
      })
    ),
  });
}

// ── Stimulus renderer ────────────────────────────────────────

function renderStimulus(stimulus, children) {
  if (!stimulus || stimulus.type === "none") return;

  if (stimulus.type === "text") {
    children.push(
      new Paragraph({
        spacing: { before: 80, after: 120 },
        indent: { left: 360, right: 360 },
        border: {
          left: {
            style: BorderStyle.SINGLE,
            size: 6,
            color: "6366f1",
            space: 8,
          },
        },
        children: richText(stimulus.content, {
          italics: true,
          size: 21,
          color: "333333",
        }),
      })
    );
  } else if (stimulus.type === "code") {
    const lines = stimulus.content.split("\n");
    for (const line of lines) {
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "F3F4F6", type: ShadingType.CLEAR },
          indent: { left: 360, right: 360 },
          children: [
            new TextRun({ text: line || " ", font: "Consolas", size: 19 }),
          ],
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
  } else if (stimulus.type === "table") {
    // Three formats: HTML string in content, object {headers,rows} in content, or top-level {data/headers/rows}
    let rows;
    if (typeof stimulus.content === "string") {
      rows = parseHtmlTable(stimulus.content);
    } else if (stimulus.content && typeof stimulus.content === "object") {
      rows = parseTableData(stimulus.content);
    } else {
      rows = parseTableData(stimulus);
    }
    if (rows.length) {
      const tbl = buildDocxTable(rows);
      if (tbl) {
        children.push(tbl);
        children.push(
          new Paragraph({ spacing: { after: 100 }, children: [] })
        );
      }
    }
  } else if (stimulus.type === "chart") {
    const lines = describeChart(stimulus.content);
    for (const line of lines) {
      children.push(
        new Paragraph({
          spacing: { before: 0, after: 0 },
          shading: { fill: "F0F5FF", type: ShadingType.CLEAR },
          indent: { left: 360, right: 360 },
          children: richText(line, { font: "Consolas", size: 19 }),
        })
      );
    }
    children.push(new Paragraph({ spacing: { after: 100 }, children: [] }));
  }
}

// ── Section builders ─────────────────────────────────────────

function buildStudyGuide(sg, children) {
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [new TextRun("Study Guide")],
    })
  );

  // Theme
  children.push(
    new Paragraph({
      spacing: { after: 200 },
      border: {
        left: {
          style: BorderStyle.SINGLE,
          size: 6,
          color: "6366f1",
          space: 8,
        },
      },
      indent: { left: 200 },
      children: richText(sg.theme, { italics: true, color: "444444" }),
    })
  );

  // Core concepts
  for (const c of sg.core_concepts || []) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun(c.title)],
      })
    );
    children.push(
      new Paragraph({
        spacing: { after: 160 },
        children: richText(c.detail),
      })
    );
  }

  // Formulas
  if (sg.formulas && sg.formulas.length) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun("Key Formulas")],
      })
    );

    for (const f of sg.formulas) {
      children.push(
        new Paragraph({
          spacing: { before: 160 },
          children: [new TextRun({ text: f.name, bold: true, size: 23 })],
        })
      );
      children.push(
        new Paragraph({
          shading: { fill: "F5F3FF", type: ShadingType.CLEAR },
          indent: { left: 200 },
          children: [
            new TextRun({
              text: f.katex_string,
              font: "Consolas",
              italics: true,
              size: 22,
            }),
          ],
        })
      );
      if (f.description) {
        children.push(
          new Paragraph({
            indent: { left: 200 },
            children: richText(f.description, { size: 21 }),
          })
        );
      }
      if (f.example) {
        children.push(
          new Paragraph({
            indent: { left: 200 },
            spacing: { after: 120 },
            children: [
              new TextRun({ text: "Example: ", bold: true, size: 21 }),
              ...richText(f.example, { size: 21 }),
            ],
          })
        );
      }
    }
  }

  // Exam tip
  if (sg.exam_tip) {
    children.push(
      new Paragraph({
        spacing: { before: 240, after: 200 },
        shading: { fill: "FEF3C7", type: ShadingType.CLEAR },
        indent: { left: 200, right: 200 },
        children: [
          new TextRun({ text: "Exam Tip:  ", bold: true, size: 22 }),
          new TextRun({ text: sg.exam_tip, size: 21 }),
        ],
      })
    );
  }
}

function buildDrills(drills, children) {
  if (!drills?.cards?.length) return;

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun("Drills"),
        new TextRun({
          text: `  (${drills.cards.length} cards)`,
          bold: false,
          color: "888888",
          size: 22,
        }),
      ],
    })
  );

  // Group by mode in canonical order
  const byMode = {};
  for (const card of drills.cards) {
    if (!byMode[card.mode]) byMode[card.mode] = [];
    byMode[card.mode].push(card);
  }

  const sortedModes = MODE_ORDER.filter((m) => byMode[m]);

  for (const mode of sortedModes) {
    const cards = byMode[mode];
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [
          new TextRun(MODE_NAMES[mode] || mode),
          new TextRun({
            text: `  (${cards.length})`,
            bold: false,
            color: "888888",
            size: 22,
          }),
        ],
      })
    );

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];

      if (mode === "concept_mc") {
        // Multiple choice drill
        children.push(
          new Paragraph({
            spacing: { before: 180 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true }),
              ...richText(card.prompt),
              new TextRun({
                text: `  [${diffLabel(card.difficulty)}]`,
                color: diffColor(card.difficulty),
                size: 18,
              }),
            ],
          })
        );
        for (const ch of card.choices || []) {
          const mark = ch.is_correct ? "\u2713" : "\u2717";
          children.push(
            new Paragraph({
              indent: { left: 720 },
              spacing: { before: 40 },
              children: [
                new TextRun({
                  text: `${mark} `,
                  bold: true,
                  color: ch.is_correct ? "16a34a" : "dc2626",
                }),
                ...richText(ch.text),
              ],
            })
          );
          children.push(
            new Paragraph({
              indent: { left: 1080 },
              spacing: { after: 60 },
              children: richText(ch.explanation, {
                italics: true,
                color: "666666",
                size: 19,
              }),
            })
          );
        }
      } else {
        // Typed-recall drill
        const extras = [];
        if (card.is_key_term) {
          extras.push(
            new TextRun({
              text: "  \u2605 Key Term",
              color: "b45309",
              size: 18,
              bold: true,
            })
          );
        }
        children.push(
          new Paragraph({
            spacing: { before: 100 },
            children: [
              new TextRun({ text: `${i + 1}. `, bold: true }),
              ...richText(card.prompt),
              new TextRun({
                text: `  [${diffLabel(card.difficulty)}]`,
                color: diffColor(card.difficulty),
                size: 18,
              }),
              ...extras,
            ],
          })
        );
        children.push(
          new Paragraph({
            indent: { left: 720 },
            spacing: { after: 60 },
            children: [
              new TextRun({
                text: "Answer: ",
                bold: true,
                color: "16a34a",
                size: 21,
              }),
              ...richText(card.answer, { bold: true, size: 21 }),
            ],
          })
        );
      }
    }
  }
}

function buildMcqs(mcqs, children) {
  if (!mcqs?.questions?.length) return;

  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      children: [
        new TextRun("Multiple Choice Questions"),
        new TextRun({
          text: `  (${mcqs.questions.length} questions)`,
          bold: false,
          color: "888888",
          size: 22,
        }),
      ],
    })
  );

  for (let i = 0; i < mcqs.questions.length; i++) {
    const q = mcqs.questions[i];

    // Question header
    children.push(
      new Paragraph({
        spacing: { before: 280 },
        border: {
          bottom: {
            style: BorderStyle.SINGLE,
            size: 1,
            color: "DDDDDD",
            space: 4,
          },
        },
        children: [
          new TextRun({
            text: `Question ${i + 1}`,
            bold: true,
            size: 23,
          }),
          new TextRun({
            text: `  [${diffLabel(q.difficulty)}]`,
            color: diffColor(q.difficulty),
            size: 18,
          }),
          q.unit_objective
            ? new TextRun({
                text: `  ${q.unit_objective}`,
                color: "888888",
                size: 17,
              })
            : new TextRun(""),
        ],
      })
    );

    // Stimulus
    renderStimulus(q.stimulus, children);

    // Question text
    children.push(
      new Paragraph({
        spacing: { after: 100 },
        children: richText(q.question),
      })
    );

    // Choices
    for (const ch of q.choices) {
      const mark = ch.is_correct ? "\u2713" : "\u2717";
      children.push(
        new Paragraph({
          indent: { left: 360 },
          spacing: { before: 40 },
          children: [
            new TextRun({
              text: `(${ch.id}) `,
              bold: true,
              size: 21,
            }),
            ...richText(ch.text, { size: 21 }),
            new TextRun({
              text: ` ${mark}`,
              bold: true,
              color: ch.is_correct ? "16a34a" : "dc2626",
              size: 21,
            }),
          ],
        })
      );
      children.push(
        new Paragraph({
          indent: { left: 720 },
          spacing: { after: 60 },
          children: richText(ch.explanation, {
            italics: true,
            color: "666666",
            size: 19,
          }),
        })
      );
    }
  }
}

// ── Main document builder ────────────────────────────────────

async function generateDocx(subjectSlug) {
  const rawMeta = JSON.parse(
    fs.readFileSync(path.join(BASE, subjectSlug, "meta.json"))
  );
  const meta = normalizeMeta(rawMeta);
  const subjectName = meta.subjectName;
  const children = [];

  // Count totals for cover page
  let totalDrills = 0,
    totalMcqs = 0;
  for (const unit of meta.units) {
    const dp = path.join(BASE, subjectSlug, "drills", `${unit.unit_id}.json`);
    const mp = path.join(BASE, subjectSlug, "mcq", `${unit.unit_id}.json`);
    if (fs.existsSync(dp))
      totalDrills += JSON.parse(fs.readFileSync(dp)).cards.length;
    if (fs.existsSync(mp))
      totalMcqs += JSON.parse(fs.readFileSync(mp)).questions.length;
  }

  // ── Cover page ──
  children.push(
    new Paragraph({ spacing: { before: 3000 }, children: [] })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: subjectName,
          bold: true,
          size: 56,
          font: "Arial",
          color: "1a1a2e",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: "Complete Content Reference",
          size: 32,
          color: "6366f1",
        }),
      ],
    })
  );
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [
        new TextRun({
          text: `${meta.units.length} Units  \u2022  ${totalDrills} Drill Cards  \u2022  ${totalMcqs} MCQs`,
          size: 22,
          color: "666666",
        }),
      ],
    })
  );
  if (meta.exam_date) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 400 },
        children: [
          new TextRun({
            text: `Exam Date: ${meta.exam_date}`,
            size: 22,
            color: "666666",
          }),
        ],
      })
    );
  }
  children.push(
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 800 },
      children: [
        new TextRun({
          text: `Generated ${new Date().toISOString().slice(0, 10)} by Ascendly (geta5.app)`,
          size: 18,
          color: "AAAAAA",
        }),
      ],
    })
  );

  // ── Table of Contents ──
  children.push(new Paragraph({ children: [new PageBreak()] }));
  children.push(
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun("Table of Contents")],
    })
  );
  children.push(
    new TableOfContents("Table of Contents", {
      hyperlink: true,
      headingStyleRange: "1-3",
    })
  );

  // ── Unit sections ──
  for (const unit of meta.units) {
    children.push(new Paragraph({ children: [new PageBreak()] }));

    // Unit heading
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [
          new TextRun(`Unit ${unit.unit_number}: ${unit.unit_name}`),
        ],
      })
    );

    // College Board weight if available
    if (unit.weight) {
      children.push(
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({
              text: `College Board Exam Weight: ${unit.weight}`,
              color: "6366f1",
              size: 20,
              italics: true,
            }),
          ],
        })
      );
    }

    // Load data
    const drillPath = path.join(
      BASE,
      subjectSlug,
      "drills",
      `${unit.unit_id}.json`
    );
    const mcqPath = path.join(
      BASE,
      subjectSlug,
      "mcq",
      `${unit.unit_id}.json`
    );
    const sgPath = path.join(
      BASE,
      subjectSlug,
      "study-guide",
      `${unit.unit_id}.json`
    );

    const drills = fs.existsSync(drillPath)
      ? JSON.parse(fs.readFileSync(drillPath))
      : null;
    const mcqs = fs.existsSync(mcqPath)
      ? JSON.parse(fs.readFileSync(mcqPath))
      : null;
    const sg = fs.existsSync(sgPath)
      ? JSON.parse(fs.readFileSync(sgPath))
      : null;

    // Study Guide first, then Drills, then MCQs
    if (sg) buildStudyGuide(sg, children);
    buildDrills(drills, children);
    buildMcqs(mcqs, children);
  }

  // ── Build document ──
  const doc = new Document({
    title: `${subjectName} - Content Reference`,
    creator: "Ascendly (geta5.app)",
    styles: {
      default: {
        document: {
          run: { font: "Arial", size: 22 },
          paragraph: { spacing: { line: 276 } },
        },
      },
      paragraphStyles: [
        {
          id: "Heading1",
          name: "Heading 1",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 36, bold: true, font: "Arial", color: "1a1a2e" },
          paragraph: {
            spacing: { before: 360, after: 200 },
            outlineLevel: 0,
          },
        },
        {
          id: "Heading2",
          name: "Heading 2",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 30, bold: true, font: "Arial", color: "2d2d5e" },
          paragraph: {
            spacing: { before: 300, after: 160 },
            outlineLevel: 1,
          },
        },
        {
          id: "Heading3",
          name: "Heading 3",
          basedOn: "Normal",
          next: "Normal",
          quickFormat: true,
          run: { size: 25, bold: true, font: "Arial", color: "444488" },
          paragraph: {
            spacing: { before: 200, after: 120 },
            outlineLevel: 2,
          },
        },
      ],
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 12240, height: 15840 },
            margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: {
                  bottom: {
                    style: BorderStyle.SINGLE,
                    size: 1,
                    color: "DDDDDD",
                    space: 4,
                  },
                },
                children: [
                  new TextRun({
                    text: `${subjectName} \u2014 Content Reference`,
                    color: "999999",
                    size: 17,
                    font: "Arial",
                  }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: "Page ",
                    color: "999999",
                    size: 17,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    color: "999999",
                    size: 17,
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(OUT, `${subjectSlug}.docx`);
  fs.writeFileSync(outPath, buffer);
  const sizeMB = (buffer.length / 1024 / 1024).toFixed(2);
  console.log(
    `  ${subjectName} -> ${outPath} (${sizeMB} MB, ${totalDrills} drills, ${totalMcqs} MCQs)`
  );
}

// ── Run ──────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

  const subjects = fs
    .readdirSync(BASE)
    .filter((s) => {
      const full = path.join(BASE, s);
      return fs.statSync(full).isDirectory() && fs.existsSync(path.join(full, "meta.json"));
    })
    .sort();

  console.log(`Generating ${subjects.length} documents...\n`);

  // Run sequentially to avoid memory pressure
  for (const s of subjects) {
    await generateDocx(s);
  }

  console.log("\nDone! Files in content-exports/");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
