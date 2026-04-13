const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel,
  AlignmentType, BorderStyle, Table, TableRow, TableCell,
  WidthType, ShadingType, PageBreak, TabStopType, TabStopPosition
} = require('docx');

const DATA = 'C:/Ascendly/public/data/ap-calculus-bc';
const meta = require(path.join(DATA, 'meta.json'));

// Strip KaTeX delimiters for readable plain-text math
function cleanMath(str) {
  if (!str) return '';
  return str
    .replace(/\$\$/g, '')
    .replace(/\$/g, '')
    .replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
    .replace(/\\sqrt\{([^}]+)\}/g, 'sqrt($1)')
    .replace(/\\lim_\{([^}]+)\}/g, 'lim[$1]')
    .replace(/\\int_\{([^}]+)\}\^\{?([^}\s]+)\}?/g, 'integral[$1 to $2]')
    .replace(/\\int/g, 'integral')
    .replace(/\\infty/g, 'infinity')
    .replace(/\\pi/g, 'pi')
    .replace(/\\theta/g, 'theta')
    .replace(/\\sin/g, 'sin')
    .replace(/\\cos/g, 'cos')
    .replace(/\\tan/g, 'tan')
    .replace(/\\ln/g, 'ln')
    .replace(/\\log/g, 'log')
    .replace(/\\arctan/g, 'arctan')
    .replace(/\\arcsin/g, 'arcsin')
    .replace(/\\arccos/g, 'arccos')
    .replace(/\\mathbf\{([^}]+)\}/g, '$1')
    .replace(/\\langle/g, '<')
    .replace(/\\rangle/g, '>')
    .replace(/\\left/g, '')
    .replace(/\\right/g, '')
    .replace(/\\cdot/g, '*')
    .replace(/\\times/g, 'x')
    .replace(/\\leq/g, '<=')
    .replace(/\\geq/g, '>=')
    .replace(/\\neq/g, '!=')
    .replace(/\\to/g, '->')
    .replace(/\\,/g, ' ')
    .replace(/\\!/g, '')
    .replace(/\\quad/g, '  ')
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\displaystyle/g, '')
    .replace(/\\begin\{cases\}/g, '{ ')
    .replace(/\\end\{cases\}/g, ' }')
    .replace(/\\\\/g, ' | ')
    .replace(/\\checkmark/g, 'check')
    .replace(/\\[a-zA-Z]+/g, (m) => m.slice(1))  // strip remaining backslash commands
    .replace(/\{/g, '(')
    .replace(/\}/g, ')')
    .replace(/\^/g, '^')
    .replace(/_/g, '_')
    .replace(/\s+/g, ' ')
    .trim();
}

function makeQuestion(q, idx) {
  const correct = q.choices.find(c => c.is_correct);
  const paragraphs = [];

  // Question number + difficulty badge
  paragraphs.push(new Paragraph({
    spacing: { before: 240, after: 80 },
    children: [
      new TextRun({ text: `${idx}. `, bold: true, size: 22 }),
      new TextRun({ text: `[${q.difficulty.toUpperCase()}] `, bold: true, size: 20, color: q.difficulty === 'easy' ? '2E7D32' : q.difficulty === 'medium' ? 'E65100' : 'C62828' }),
      new TextRun({ text: cleanMath(q.question), size: 22 }),
    ],
  }));

  // Stimulus if present
  if (q.stimulus && q.stimulus.type && q.stimulus.type !== 'none' && q.stimulus.text) {
    paragraphs.push(new Paragraph({
      spacing: { before: 60, after: 60 },
      indent: { left: 360 },
      children: [
        new TextRun({ text: '[Stimulus] ', bold: true, italics: true, size: 20, color: '555555' }),
        new TextRun({ text: cleanMath(q.stimulus.text), italics: true, size: 20, color: '555555' }),
      ],
    }));
  }

  // Choices
  q.choices.forEach(c => {
    const isCorrect = c.is_correct;
    paragraphs.push(new Paragraph({
      spacing: { before: 40, after: 40 },
      indent: { left: 480 },
      children: [
        new TextRun({ text: isCorrect ? `${c.id}. ` : `${c.id}. `, bold: isCorrect, size: 21, color: isCorrect ? '1B5E20' : '000000' }),
        new TextRun({ text: isCorrect ? '>>> ' : '', bold: true, size: 21, color: '1B5E20' }),
        new TextRun({ text: cleanMath(c.text), bold: isCorrect, size: 21, color: isCorrect ? '1B5E20' : '000000' }),
      ],
    }));
  });

  // Answer key line
  paragraphs.push(new Paragraph({
    spacing: { before: 80, after: 40 },
    indent: { left: 480 },
    children: [
      new TextRun({ text: `Correct Answer: ${correct ? correct.id : '?'}`, bold: true, size: 20, color: '1B5E20' }),
    ],
  }));

  // Explanations
  q.choices.forEach(c => {
    paragraphs.push(new Paragraph({
      spacing: { before: 20, after: 20 },
      indent: { left: 720 },
      children: [
        new TextRun({ text: `${c.id}: `, bold: true, size: 19, color: c.is_correct ? '1B5E20' : '888888' }),
        new TextRun({ text: cleanMath(c.explanation), size: 19, color: '444444', italics: true }),
      ],
    }));
  });

  // Objective
  if (q.unit_objective) {
    paragraphs.push(new Paragraph({
      spacing: { before: 40, after: 120 },
      indent: { left: 480 },
      children: [
        new TextRun({ text: `CED: ${q.unit_objective}`, size: 18, color: '777777' }),
      ],
    }));
  }

  // Separator
  paragraphs.push(new Paragraph({
    spacing: { after: 80 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'CCCCCC' } },
    children: [],
  }));

  return paragraphs;
}

function makeDrillCard(card, idx) {
  const paragraphs = [];
  paragraphs.push(new Paragraph({
    spacing: { before: 160, after: 60 },
    children: [
      new TextRun({ text: `${idx}. `, bold: true, size: 21 }),
      new TextRun({ text: `[${card.mode || 'recall'}] `, size: 19, color: '6A1B9A' }),
      new TextRun({ text: card.is_key_term ? '[KEY] ' : '', bold: true, size: 19, color: 'D84315' }),
      new TextRun({ text: cleanMath(card.front), size: 21 }),
    ],
  }));
  paragraphs.push(new Paragraph({
    spacing: { before: 40, after: 80 },
    indent: { left: 480 },
    children: [
      new TextRun({ text: 'Answer: ', bold: true, size: 20, color: '1B5E20' }),
      new TextRun({ text: cleanMath(card.back), size: 20 }),
    ],
  }));
  if (card.choices && card.choices.length > 0) {
    card.choices.forEach(c => {
      paragraphs.push(new Paragraph({
        spacing: { before: 20, after: 20 },
        indent: { left: 720 },
        children: [
          new TextRun({ text: `${c.id || '-'}. `, size: 19 }),
          new TextRun({ text: cleanMath(c.text), size: 19, bold: c.is_correct, color: c.is_correct ? '1B5E20' : '000000' }),
        ],
      }));
    });
  }
  return paragraphs;
}

function makeStudyGuide(sg) {
  const paragraphs = [];

  if (sg.theme) {
    paragraphs.push(new Paragraph({
      spacing: { before: 120, after: 80 },
      children: [
        new TextRun({ text: 'Theme: ', bold: true, size: 22 }),
        new TextRun({ text: cleanMath(sg.theme), size: 22 }),
      ],
    }));
  }

  if (sg.core_concepts && sg.core_concepts.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: 'Core Concepts', bold: true, size: 22, underline: {} })],
    }));
    sg.core_concepts.forEach((c, i) => {
      paragraphs.push(new Paragraph({
        spacing: { before: 40, after: 40 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: `${i + 1}. `, bold: true, size: 20 }),
          new TextRun({ text: cleanMath(typeof c === 'string' ? c : c.concept || c.text || JSON.stringify(c)), size: 20 }),
        ],
      }));
    });
  }

  if (sg.formulas && sg.formulas.length > 0) {
    paragraphs.push(new Paragraph({
      spacing: { before: 160, after: 60 },
      children: [new TextRun({ text: 'Formulas', bold: true, size: 22, underline: {} })],
    }));
    sg.formulas.forEach((f, i) => {
      paragraphs.push(new Paragraph({
        spacing: { before: 60, after: 20 },
        indent: { left: 360 },
        children: [
          new TextRun({ text: `${f.name || 'Formula ' + (i + 1)}: `, bold: true, size: 20 }),
          new TextRun({ text: cleanMath(f.formula || f.expression || ''), size: 20 }),
        ],
      }));
      if (f.description) {
        paragraphs.push(new Paragraph({
          indent: { left: 600 },
          children: [new TextRun({ text: cleanMath(f.description), size: 19, italics: true, color: '555555' })],
        }));
      }
      if (f.example) {
        paragraphs.push(new Paragraph({
          indent: { left: 600 },
          children: [
            new TextRun({ text: 'Example: ', bold: true, size: 19, color: '1565C0' }),
            new TextRun({ text: cleanMath(f.example), size: 19, color: '1565C0' }),
          ],
        }));
      }
    });
  }

  if (sg.exam_tip) {
    paragraphs.push(new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({ text: 'Exam Tip: ', bold: true, size: 20, color: 'BF360C' }),
        new TextRun({ text: cleanMath(sg.exam_tip), size: 20, color: 'BF360C' }),
      ],
    }));
  }

  return paragraphs;
}

async function main() {
  const sections = [];

  // Title page section
  sections.push({
    children: [
      new Paragraph({ spacing: { before: 3000 } }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        children: [new TextRun({ text: 'AP Calculus BC', bold: true, size: 56 })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [new TextRun({ text: 'Complete Question Bank & Study Material', size: 32, color: '555555' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 400 },
        children: [new TextRun({ text: 'Ascendly — geta5.app', size: 24, color: '888888' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 200 },
        children: [new TextRun({ text: `Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, size: 22, color: '888888' })],
      }),
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 600 },
        children: [new TextRun({ text: '10 Units | 546 MCQs | 319 Drill Cards | 10 Study Guides', size: 22, color: '666666' })],
      }),
    ],
  });

  for (const unit of meta.units) {
    const unitParagraphs = [];

    // Unit header
    unitParagraphs.push(new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      children: [new TextRun({ text: `${unit.id.replace('unit-', 'Unit ')}: ${unit.name}`, bold: true, size: 32 })],
    }));

    unitParagraphs.push(new Paragraph({
      spacing: { after: 200 },
      children: [new TextRun({ text: `College Board Weight: ${unit.cb_weight}`, size: 20, color: '666666' })],
    }));

    // MCQs
    try {
      const mcqData = JSON.parse(fs.readFileSync(path.join(DATA, 'mcq', `${unit.id}.json`), 'utf8'));
      const qs = mcqData.questions || [];
      unitParagraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 120 },
        children: [new TextRun({ text: `Multiple Choice Questions (${qs.length})`, bold: true, size: 26 })],
      }));
      qs.forEach((q, i) => unitParagraphs.push(...makeQuestion(q, i + 1)));
    } catch (e) {
      unitParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'No MCQ data available.', italics: true, color: '999999' })] }));
    }

    // Drills
    try {
      const drillData = JSON.parse(fs.readFileSync(path.join(DATA, 'drills', `${unit.id}.json`), 'utf8'));
      const cards = drillData.cards || [];
      unitParagraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
        children: [new TextRun({ text: `Drill Cards (${cards.length})`, bold: true, size: 26 })],
      }));
      cards.forEach((c, i) => unitParagraphs.push(...makeDrillCard(c, i + 1)));
    } catch (e) {
      unitParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'No drill data available.', italics: true, color: '999999' })] }));
    }

    // Study Guide
    try {
      const sgData = JSON.parse(fs.readFileSync(path.join(DATA, 'study-guide', `${unit.id}.json`), 'utf8'));
      unitParagraphs.push(new Paragraph({
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 400, after: 120 },
        children: [new TextRun({ text: 'Study Guide', bold: true, size: 26 })],
      }));
      unitParagraphs.push(...makeStudyGuide(sgData));
    } catch (e) {
      unitParagraphs.push(new Paragraph({ children: [new TextRun({ text: 'No study guide available.', italics: true, color: '999999' })] }));
    }

    sections.push({
      properties: { page: { margin: { top: 1000, bottom: 1000, left: 1200, right: 1200 } } },
      children: unitParagraphs,
    });
  }

  const doc = new Document({
    creator: 'Ascendly',
    title: 'AP Calculus BC - Complete Question Bank',
    description: 'MCQs, Drills, and Study Guides for all 10 units',
    sections,
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = 'C:/Ascendly/AP-Calculus-BC-Question-Bank.docx';
  fs.writeFileSync(outPath, buffer);
  console.log('Exported to: ' + outPath);
  console.log('Size: ' + (buffer.length / 1024 / 1024).toFixed(2) + ' MB');
}

main().catch(e => { console.error(e); process.exit(1); });
