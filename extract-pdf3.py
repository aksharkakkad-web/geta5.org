import sys
from pdfminer.high_level import extract_text

pdf_path = sys.argv[1]
output_path = sys.argv[2] if len(sys.argv) > 2 else 'pdf-text.txt'

text = extract_text(pdf_path)
with open(output_path, 'w', encoding='utf-8') as f:
    f.write(text)

print(f"Done. Extracted {len(text)} chars to {output_path}")
