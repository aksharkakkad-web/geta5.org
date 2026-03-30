const { PDFParse } = require('pdf-parse');
const fs = require('fs');
const path = process.argv[2];
const startChar = parseInt(process.argv[3] || '0');
const maxPages = parseInt(process.argv[4] || '50');
const buf = fs.readFileSync(path);
const parser = new PDFParse();
parser.parse(buf, {max: maxPages}).then(data => {
  process.stdout.write('TOTALPAGES:' + data.numpages + '\n');
  process.stdout.write(data.text.substring(startChar, startChar + 15000) + '\n');
}).catch(e => {
  process.stderr.write('Error: ' + e.message + '\n');
  process.exit(1);
});
