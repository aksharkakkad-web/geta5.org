const { PDFParse } = require('pdf-parse');
const fs = require('fs');

const pdfPath = '.planning/phases/07-ap-world-history-content/reference/ap-world-history-modern-course-and-exam-description.pdf';
const outputFile = process.argv[2] || 'pdf-extract.txt';
const maxPages = parseInt(process.argv[3] || '200');

const buf = fs.readFileSync(pdfPath);
const parser = new PDFParse();

parser.parse(buf, {max: maxPages}).then(data => {
  const header = 'TOTALPAGES: ' + data.numpages + '\n\n';
  fs.writeFileSync(outputFile, header + data.text);
  console.log('Done. Pages: ' + data.numpages + ', chars: ' + data.text.length);
}).catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});
