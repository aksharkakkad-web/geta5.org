#!/usr/bin/env python3
"""
AP World History: Modern FRQ Extractor
Extracts SAQ, DBQ, and LEQ questions + scoring guidelines from PDFs into structured JSON files.

Structure per exam set:
  - SAQ: Questions 1, 2 (mandatory) + Question 3 or 4 (student choice)
  - DBQ: Section II, Question 1 (with 6-7 documents)
  - LEQ: Section II, Questions 2, 3, or 4 (student choice essay)

ID convention:
  - 2021, 2022 (single set): world-{year}-saq-{n}, world-{year}-dbq-1, world-{year}-leq-1
  - 2023-2025 (two sets):    world-{year}-set{n}-saq-{n}, world-{year}-set{n}-dbq-1, world-{year}-set{n}-leq-1

Part label formats across years:
  - 2021, 2022: a)  b)  c)
  - 2023, 2024: a.  b.  c.   (question PDF) | [a] [b] [c] (SG)
  - 2025:       A.  B.  C.   (question PDF) | A   B   C   (SG with space)
"""

import pdfplumber
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTIONS_DIR = 'C:/Ascendly/content-sources/frq-pdfs/ap-world-history/questions'
SG_DIR = 'C:/Ascendly/content-sources/frq-pdfs/ap-world-history/scoring-guidelines'
OUTPUT_DIR = 'C:/Ascendly/public/data/ap-world-history/frq'

# (year, set_number) — set_number=None means single set
EXAMS = [
    (2021, None),
    (2022, None),
    (2023, 1),
    (2023, 2),
    (2024, 1),
    (2024, 2),
    (2025, 1),
    (2025, 2),
]

# SG files for 2021-2023 are question PDFs (no real rubric)
# Only 2024 and 2025 have proper scoring guideline PDFs
HAS_REAL_SG = {2024, 2025}


# ---------------------------------------------------------------------------
# PDF text extraction helpers
# ---------------------------------------------------------------------------

def extract_pdf_pages(path):
    """Return list of (page_num, text) tuples."""
    pages = []
    try:
        with pdfplumber.open(path) as pdf:
            for i, page in enumerate(pdf.pages):
                try:
                    text = page.extract_text() or ''
                    pages.append((i + 1, text))
                except Exception:
                    pages.append((i + 1, ''))
    except Exception as e:
        print(f'  ERROR opening {path}: {e}')
    return pages


def remove_boilerplate(text):
    """Strip College Board headers, footers, page numbers."""
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        s = line.strip()
        if re.match(r'^[©?]\s*20\d\d College Board', s):
            continue
        if 'Visit College Board on the web' in s:
            continue
        if 'AP Central is the official' in s:
            continue
        # Keep lines starting with AP® World History: Modern 20xx Scoring Guidelines (important header)
        # but remove the free-response header versions
        if re.match(r'^AP® World History:\s*Modern\s+20\d\d (Free-Response Questions|Scoring Guidelines)\s*$', s):
            continue
        if s in ('GO ON TO THE NEXT PAGE.', 'GO ON TO THE NEXT PAGE'):
            continue
        cleaned.append(line)
    return '\n'.join(cleaned)


def full_text(pages):
    """Concatenate all pages into one string with boilerplate removed."""
    return '\n'.join(remove_boilerplate(p[1]) for p in pages)


# ---------------------------------------------------------------------------
# World History-specific unit mapping
# ---------------------------------------------------------------------------

WORLD_UNIT_KEYWORDS = {
    1: ['mongol', 'silk road', 'dar al-islam', 'mali', 'song dynasty', 'champa', 'bubonic plague',
        'black death', 'trans-saharan', 'swahili', 'indian ocean trade', 'mansa musa',
        'ibn battuta', 'marco polo', 'confucianism', 'buddhism', 'hinduism', 'diasporic',
        'commerce', 'exchange network', 'mamluk', 'abbasid', '1200', '1450'],
    2: ['columbian exchange', 'encomienda', 'hacienda', 'transatlantic slave trade', 'silver',
        'spanish empire', 'portuguese empire', 'ottoman empire', 'mughal empire', 'safavid',
        'joint-stock company', 'east india company', 'mercantilism', 'coercive labor',
        'plantation', 'atlantic world', 'aztec', 'inca', 'ming dynasty', 'qing dynasty',
        'fur trade', 'vasco da gama', 'columbus', 'gunpowder empire', '1450', '1750'],
    3: ['industrial revolution', 'enlightenment', 'french revolution', 'american revolution',
        'haitian revolution', 'latin american independence', 'simon bolivar', 'napoleon',
        'nationalism', 'abolition', 'abolitionism', 'railroad', 'steam engine',
        'urbanization', 'working class', 'karl marx', 'liberalism', 'conservatism',
        'romanticism', 'reform movement', "women's rights", 'feminist', '1750', '1900'],
    4: ['imperialism', 'colonialism', 'scramble for africa', 'berlin conference', 'suez canal',
        'opium war', 'meiji', 'boxing rebellion', 'anti-colonial', 'social darwinism',
        'white man\'s burden', 'civilizing mission', 'settler colony', 'cash crop',
        'raw material', 'zulu', 'sepoy mutiny', 'scramble', 'protectorate', 'indentured',
        '1850', '1900', '1914'],
    5: ['world war i', 'world war ii', 'great depression', 'russian revolution',
        'chinese revolution', 'cold war', 'fascism', 'totalitarianism', 'propaganda',
        'genocide', 'holocaust', 'treaty of versailles', 'league of nations',
        'interwar', 'new deal', 'stalinism', 'nazism', 'nazi', 'hitler', 'great war'],
    6: ['decolonization', 'cold war', 'proxy war', 'non-aligned', 'korean war', 'vietnam war',
        'cuban missile', 'civil rights', 'independence movement', 'globalization',
        'united nations', 'marshall plan', 'nato', 'warsaw pact',
        'mao zedong', 'gandhi', 'apartheid', 'nasser', 'nehru', '1945', '1980'],
    7: ['globalization', 'digital', 'internet', 'climate change', 'terrorism',
        'post-cold war', 'economic integration', 'free trade', 'world trade organization',
        'environmental', 'migration', 'social media', 'al-qaeda', 'wto', 'imf', 'world bank'],
    8: ['environment', 'disease', 'epidemic', 'pandemic', 'demographic', 'population growth',
        'ecological', 'agricultural revolution', 'tuberculosis', 'cholera'],
    9: ['state building', 'empire building', 'legitimacy', 'taxation', 'standing army',
        'janissary', 'tribute', 'bureaucracy', 'dynasty', 'mandate of heaven'],
}


def identify_units(text):
    """Map question content to AP World History units (1-9)."""
    lower = text.lower()
    units = set()
    for unit_num, keywords in WORLD_UNIT_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                units.add(unit_num)
                break
    if not units:
        return [1, 2, 3, 4, 5, 6]
    return sorted(list(units))


def generate_title(q_text, frq_type):
    """Generate a descriptive title from question text."""
    lower = q_text.lower()

    topic_checks = [
        (['mexican revolution', 'zapata', 'diaz', 'porfirio'], 'Mexican Revolution — Economic Factors'),
        (['mongol', 'silk road', 'afro-eurasia', 'eurasian integration'], 'Mongol Empire & Afro-Eurasian Trade'),
        (['columbian exchange', 'columbus', 'transatlantic slave trade', 'silver mine'], 'Columbian Exchange & Atlantic World'),
        (['industrialization', 'industrial revolution', 'factory worker', 'working class'], 'Industrialization & Social Change'),
        (['enlightenment', 'french revolution', 'american revolution', 'natural rights', 'revolution of 1848'], 'Revolutions & Enlightenment Ideas'),
        (['haitian revolution', 'slavery', 'abolition', 'slave trade'], 'Slavery, Abolition & Atlantic Revolutions'),
        (['imperialism', 'colonialism', 'berlin conference', 'scramble for africa', 'scramble for'], 'Imperialism & Colonialism'),
        (['world war i', 'world war ii', 'great war', 'wwi', 'wwii', 'nazi', 'fascism'], 'World Wars & Global Conflict'),
        (['cold war', 'communism', 'soviet', 'nato', 'proxy war', 'decolonization'], 'Cold War & Decolonization'),
        (['independence movement', 'anti-colonial', 'nationalist movement'], 'Decolonization & Nationalist Movements'),
        (['transport', 'communication', 'telegraph', 'railroad', 'railway', 'steamship'], 'Transportation & Communication Technologies'),
        (['ottoman', 'safavid', 'mughal', 'gunpowder empire'], 'Gunpowder Empires — Ottoman, Safavid, Mughal'),
        (['ming', 'qing', 'confucian'], 'China — State & Society'),
        (['meiji', 'japan'], 'Japan — Meiji Era & Modernization'),
        (['women', 'gender', 'feminist', "women's newspaper"], 'Women & Gender in History'),
        (['islam', 'muslim', 'mamluk', 'sufi'], 'Islamic World & State Building'),
        (['environment', 'climate', 'ecological', 'disease', 'epidemic', 'tuberculosis'], 'Environment, Disease & Demography'),
        (['trade', 'commerce', 'economic factor', 'market'], 'Trade & Economic Development'),
        (['revolution', 'revolt', 'rebellion', 'uprising'], 'Revolutions & Resistance Movements'),
        (['belief system', 'confucianism', 'buddhism', 'hinduism'], 'Belief Systems & Social Order'),
        (['coerced labor', 'enslaved', 'slavery', 'slave'], 'Slavery & Coerced Labor'),
        (['africa', 'african society'], 'Africa — Society & Politics'),
        (['latin america', 'south america', 'caribbean'], 'Latin America & the Caribbean'),
        (['south asia', 'india', 'southeast asia'], 'South & Southeast Asia'),
        (['western imperialism', 'european empire', 'european expansion'], 'European Expansion & Imperialism'),
    ]

    for keywords, title in topic_checks:
        for kw in keywords:
            if kw in lower:
                return title

    if frq_type == 'saq':
        return 'Short Answer Question — AP World History'
    elif frq_type == 'dbq':
        return 'Document-Based Question — AP World History'
    else:
        return 'Long Essay Question — AP World History'


# ---------------------------------------------------------------------------
# SAQ question text extraction
# ---------------------------------------------------------------------------

def get_part_format(year):
    """Return the part label format for a given year."""
    if year <= 2022:
        return 'paren'   # a)  b)  c)
    elif year <= 2024:
        return 'lower_dot'  # a.  b.  c.
    else:
        return 'upper_dot'  # A.  B.  C.


PGSEP = '\x0c'  # form feed used as page separator in concatenated text


def full_text_with_breaks(pages):
    """Concatenate pages with page-break separators (for stimulus detection)."""
    return PGSEP.join(remove_boilerplate(p[1]) for p in pages)


def extract_saqs_from_pages(pages, year, set_num):
    """
    Extract SAQ questions 1-4 from the question PDF pages.
    Returns list of (q_num, q_text, stimulus) tuples.

    Uses page-break markers to associate stimuli that appear on the same page
    as (or the page before) the numbered question.
    """
    # Use page-break-aware text for stimulus extraction
    text_breaks = full_text_with_breaks(pages)
    text_flat = full_text(pages)  # for question/part parsing

    # Isolate Section I (SAQ section) — stop at Section II
    for pattern in [r'SECTION\s+II\b', r'END OF SECTION I']:
        m = re.search(pattern, text_breaks, re.IGNORECASE)
        if m:
            saq_breaks = text_breaks[:m.start()]
            break
    else:
        saq_breaks = text_breaks[:len(text_breaks) // 2]

    # Clean separator lines and headers between questions
    # IMPORTANT: apply line-level removals first, before partial-phrase removals

    # Remove standalone page-number lines (single digit on a line)
    saq_breaks = re.sub(r'(?m)^\d\s*$', '', saq_breaks)
    # Remove "Directions: ..." lines that contain "Answer either"
    saq_breaks = re.sub(r'(?m)^Directions:.*Answer either.*$', '', saq_breaks, flags=re.IGNORECASE)
    # Remove "Directions: Answer either Question N or Question N." lines
    saq_breaks = re.sub(r'(?m)^Directions:.*Question \d+.*$', '', saq_breaks, flags=re.IGNORECASE)
    # Remove "Question N or N" standalone header lines
    saq_breaks = re.sub(r'(?m)^Question\s+\d+\s+or\s+\d+\s*$', '', saq_breaks, flags=re.IGNORECASE)
    # Remove "Answer either Question N or Question N." standalone phrase
    saq_breaks = re.sub(r'Answer either Question \d+ or Question \d+\.?\s*', '', saq_breaks, flags=re.IGNORECASE)
    # Remove "Question N or N" inline if still present
    saq_breaks = re.sub(r'Question \d+ or \d+\s*\n', '', saq_breaks, flags=re.IGNORECASE)
    # Collapse multiple blank lines
    saq_breaks = re.sub(r'\n{3,}', '\n\n', saq_breaks)

    # Replace page-break separators with newlines so regex ^ anchors work correctly
    # Keep a copy with PGSEP for stimulus boundary detection
    saq_pgsep = saq_breaks  # has PGSEP markers
    saq_breaks = saq_breaks.replace(PGSEP, '\n')

    # Find positions of all numbered questions
    # Use a careful pattern: question number must be at start of line and not preceded by non-whitespace
    q_positions = []
    for m in re.finditer(r'(?m)^([1-4])\.\s+', saq_breaks):
        pos = m.start()
        q_num = int(m.group(1))
        # Reject if immediately preceded by a non-whitespace char on same line (e.g. page number)
        if pos > 0 and saq_breaks[pos - 1] not in ('\n', '\r') and not saq_breaks[pos - 1].isspace():
            continue
        q_positions.append((pos, q_num))

    results = []
    for i, (pos, q_num) in enumerate(q_positions):
        # Determine question text block
        if i + 1 < len(q_positions):
            next_pos = q_positions[i + 1][0]
        else:
            next_pos = len(saq_breaks)

        q_block_raw = saq_breaks[pos:next_pos]

        # Extract the question line and parts (strip the leading "N. " prefix)
        q_text_match = re.match(r'^[1-4]\.\s+(.*)', q_block_raw, re.DOTALL)
        q_content = q_text_match.group(1).strip() if q_text_match else q_block_raw.strip()

        # Extract stimulus from text that precedes this question number
        # Use the PGSEP version for page boundary detection
        stimulus = _extract_saq_stimulus(saq_pgsep, pos)

        if len(q_content) < 20:
            continue

        # Attach stimulus to the q_content for context, but store separately
        results.append((q_num, q_content, stimulus))

    return results


def _extract_saq_stimulus(saq_text, q_pos):
    """
    Extract the stimulus (quote, image description, or passage) that precedes a question.

    Strategy:
    1. Get text on the same page (between last PGSEP before q_pos and q_pos)
    2. Within that text, find a Source: attribution
    3. Extract from the opening quote/start of passage to end of Source: line
    """
    text_before = saq_text[:q_pos]

    # Get the most recent page's worth of text
    last_break = text_before.rfind(PGSEP)
    if last_break != -1:
        page_text = text_before[last_break + 1:]
    else:
        page_text = text_before

    page_text = page_text.strip()
    if not page_text:
        return None

    # Check if this page contains a Source: attribution
    source_match = re.search(r'Source:\s*[^\n]+(?:\n[^\n]{0,120}){0,3}', page_text)
    if not source_match:
        # No source attribution — check for image description (e.g. caption text)
        # or just a standalone passage
        if not re.search(r'["\u201c\u201d]', page_text):
            return None
        # Has quote marks — trim directions preamble if present
        return _trim_directions(page_text)

    src_start = source_match.start()
    src_end = source_match.end()

    # Find where the stimulus content starts (before the source attribution)
    content_before_src = page_text[:src_start]

    # Look for opening quote character (indicates a primary/secondary source quote)
    open_quote = max(
        content_before_src.rfind('"'),
        content_before_src.rfind('\u201c'),
    )
    if open_quote != -1:
        stimulus = page_text[open_quote:src_end].strip()
        return stimulus

    # No opening quote — find the last blank line break before source
    last_blank = content_before_src.rfind('\n\n')
    if last_blank != -1:
        stimulus = page_text[last_blank + 2:src_end].strip()
    else:
        # Take everything, then trim leading directions lines
        stimulus = page_text[:src_end].strip()
        stimulus = _trim_directions(stimulus)

    return stimulus if len(stimulus) > 30 else None


def _trim_directions(text):
    """Remove leading lines that are exam directions/headers."""
    skip_patterns = [
        r'^WORLD HISTORY', r'^SECTION I', r'^Time[—-]', r'^Directions:',
        r'^Write your', r'^In your responses', r'^answer either',
        r'^You may', r'^Note:', r'^Answer Question', r'^Use the (passage|image|map|excerpt)',
        r'^Question \d+ or \d+', r'^\d+\.\s*$',
    ]
    lines = text.split('\n')
    while lines:
        l = lines[0].strip()
        if any(re.match(pat, l, re.IGNORECASE) for pat in skip_patterns) or len(l) == 0:
            lines.pop(0)
        else:
            break
    result = '\n'.join(lines).strip()
    return result if len(result) > 30 else None


def parse_saq_parts(q_text, year):
    """
    Parse SAQ parts based on year-specific format.
    Returns (stimulus_text, [{'letter': ..., 'prompt': ...}, ...])
    """
    fmt = get_part_format(year)

    if fmt == 'paren':
        # "a) ..." or "(a) ..."
        return _parse_parts_paren(q_text)
    elif fmt == 'lower_dot':
        # "a. Identify..."
        return _parse_parts_lower_dot(q_text)
    else:
        # "A. Identify..." or "A. ..."
        return _parse_parts_upper_dot(q_text)


def _parse_parts_paren(q_text):
    """Parse 'a)' format (2021, 2022)."""
    # Split on a), b), c) — handle both newline-preceded and start-of-string cases
    sections = re.split(r'(?m)(?:^|\n)([a-c])\)\s*', q_text)
    if len(sections) <= 1:
        sections = re.split(r'([a-c])\)\s+', q_text)

    if len(sections) <= 1:
        return _extract_stimulus(q_text), []

    stimulus = sections[0].strip()
    # Remove the "Use the passage/image/map to answer..." preamble from stimulus
    stimulus = re.sub(r'^Use the (?:passage|image|map|excerpt|source)[^\n]*\n?', '', stimulus, flags=re.IGNORECASE).strip()
    if len(stimulus) < 20:
        stimulus = None

    parts = []
    i = 1
    while i < len(sections) - 1:
        letter = sections[i].strip()
        content = sections[i + 1].strip() if i + 1 < len(sections) else ''
        if letter in ['a', 'b', 'c']:
            parts.append({'letter': letter, 'prompt': content})
        i += 2

    return stimulus, parts


def _parse_parts_lower_dot(q_text):
    """Parse 'a. ...' format (2023, 2024)."""
    # Remove preamble like "Using the excerpt, respond to parts a, b, and c."
    q_clean = re.sub(r'^Using the [^.]+, respond to parts[^\n]*\n', '', q_text, flags=re.IGNORECASE).strip()
    q_clean = re.sub(r'^Respond to parts a, b,? and c\.?\s*\n', '', q_clean, flags=re.IGNORECASE).strip()

    # Split on "a. " "b. " "c. " — handle both newline-preceded and start-of-string cases
    sections = re.split(r'(?m)(?:^|\n)([a-c])\.\s+', q_clean)

    if len(sections) <= 1:
        sections = re.split(r'([a-c])\.\s+(?=[A-Z])', q_clean)

    if len(sections) <= 1:
        return _extract_stimulus(q_text), []

    stimulus_raw = sections[0].strip()
    stimulus = stimulus_raw if len(stimulus_raw) > 30 else None

    parts = []
    i = 1
    while i < len(sections) - 1:
        letter = sections[i].strip()
        content = sections[i + 1].strip() if i + 1 < len(sections) else ''
        if letter in ['a', 'b', 'c']:
            parts.append({'letter': letter, 'prompt': content})
        i += 2

    return stimulus, parts


def _parse_parts_upper_dot(q_text):
    """Parse 'A. ...' format (2025)."""
    # Remove "Respond to parts A, B, and C." preamble
    q_clean = re.sub(r'^Respond to parts A, B,? and C\.?\s*\n?', '', q_text, flags=re.IGNORECASE).strip()

    # Split on "A. " "B. " "C. " — handle both newline-preceded and start-of-string cases
    # Use a lookahead that matches [A-C] at start of line OR start of string
    sections = re.split(r'(?m)(?:^|\n)([A-C])\.\s+', q_clean)

    if len(sections) <= 1:
        # Fallback: split on capital letter + dot + space
        sections = re.split(r'([A-C])\.\s+(?=[A-Z])', q_clean)

    if len(sections) <= 1:
        return _extract_stimulus(q_text), []

    stimulus_raw = sections[0].strip()
    # If sections[0] is empty or very short, no inline stimulus
    stimulus = stimulus_raw if len(stimulus_raw) > 30 else None

    parts = []
    i = 1
    while i < len(sections) - 1:
        letter = sections[i].lower().strip()
        content = sections[i + 1].strip() if i + 1 < len(sections) else ''
        if letter in ['a', 'b', 'c']:
            # Trim any next-question bleeding (stop at next block starting with a quote/stimulus)
            # If content ends with a quote that looks like next question's stimulus, stop there
            next_stim = re.search(r'\n[""\u201c]', content)
            if next_stim and i == len(sections) - 2:
                content = content[:next_stim.start()].strip()
            parts.append({'letter': letter, 'prompt': content})
        i += 2

    return stimulus, parts


def _extract_stimulus(q_text):
    """Try to extract stimulus text from question."""
    # Look for quoted text
    quote_m = re.search(r'[""\u201c].{50,}?[""\u201d]', q_text[:2000], re.DOTALL)
    if quote_m:
        # Get everything up to the parts
        end = re.search(r'\n[a-c][.)]\s', q_text) or re.search(r'\n[A-C]\.\s', q_text)
        if end:
            return q_text[:end.start()].strip()
    return None


# ---------------------------------------------------------------------------
# DBQ extraction
# ---------------------------------------------------------------------------

def extract_dbq_from_pages(pages):
    """
    Extract the DBQ prompt and all documents from Section II.
    Returns (prompt_str, documents_list).
    """
    text = full_text(pages)

    # Find Section II
    s2_match = re.search(r'SECTION\s+II\b', text, re.IGNORECASE)
    if not s2_match:
        return None, []

    section2_text = text[s2_match.start():]

    # DBQ prompt: "1. Evaluate the extent to which..."
    # Sometimes has a map note between prompt and docs
    prompt_match = re.search(
        r'(?m)^1\.\s+(Evaluate the extent to which.*?)(?=\nIn your response|\nNote:|\nDocument\s+1\b)',
        section2_text,
        re.DOTALL
    )
    if not prompt_match:
        # Broader search
        prompt_match = re.search(
            r'(?:^|\n)1\.\s+((?:Evaluate|Assess|Analyze|To what extent)[^\n]+(?:\n(?!Document\s+\d)[^\n]+)*)',
            section2_text,
            re.DOTALL
        )

    if prompt_match:
        prompt = prompt_match.group(1).strip()
        prompt = re.sub(r'\nAnswer Question.*', '', prompt, flags=re.DOTALL).strip()
    else:
        prompt = 'Evaluate the extent to which [see original exam].'

    # Extract documents
    documents = _extract_documents(section2_text)

    return prompt, documents


def _extract_documents(text):
    """
    Extract individual documents from DBQ text.
    Returns list of dicts with doc_number, source, content, image.
    """
    documents = []

    # Split on "Document N" headers (at start of line or after newline)
    doc_splits = re.split(r'(?m)^Document\s+(\d+)\s*$', text)

    if len(doc_splits) < 3:
        # Try with surrounding context
        doc_splits = re.split(r'\nDocument\s+(\d+)\s*\n', text)

    if len(doc_splits) < 3:
        return documents

    i = 1
    while i < len(doc_splits) - 1:
        try:
            doc_num = int(doc_splits[i].strip())
            doc_content = doc_splits[i + 1] if i + 1 < len(doc_splits) else ''

            # Stop if we hit LEQ section
            leq_stop = re.search(
                r'(?:Answer Question [23]|Long Essay|Question 2,\s*3|STOP\s*\n)',
                doc_content, re.IGNORECASE
            )
            if leq_stop:
                doc_content = doc_content[:leq_stop.start()]

            doc_content = doc_content.strip()

            # Extract source attribution — use re.search (not re.match) in case of leading whitespace
            # Source may span multiple lines (up to 4 lines of attribution)
            source_match = re.search(
                r'Source:\s+((?:[^\n]+\n?){1,4}?)(?=\n\n|\n[""\u201c\u201d"]|The |In |A |An |")',
                doc_content, re.DOTALL
            )
            if not source_match:
                source_match = re.search(r'Source:\s+([^\n]+(?:\n[^\n]{0,100}){0,3})', doc_content, re.DOTALL)

            if source_match:
                source = ' '.join(source_match.group(1).split())
                # Remove trailing period from source if followed by content
                source = source.rstrip('.')
                content_start = source_match.end()
                content_body = doc_content[content_start:].strip()
            else:
                source = f'Document {doc_num}'
                content_body = doc_content

            content_body = _clean_doc_content(content_body)

            documents.append({
                'doc_number': doc_num,
                'source': source,
                'content': content_body,
                'image': None
            })
        except (ValueError, IndexError):
            pass
        i += 2

    return documents


def _clean_doc_content(content):
    """Clean up document content text."""
    # Remove footnotes (lines like "1: text" or "*text" at end)
    content = re.sub(r'\n\d+:\s*[^\n]+', '', content)
    content = re.sub(r'\n\*[^\n]+', '', content)
    # Remove trailing page numbers
    content = re.sub(r'\n\d+\s*$', '', content, flags=re.MULTILINE)
    # Remove image credit lines (common pattern from photo documents)
    content = re.sub(r'\n[A-Z][^\n]+/ Alamy[^\n]*', '', content)
    content = re.sub(r'\n[^\n]+Bridgeman Images[^\n]*', '', content)
    # Collapse excess whitespace
    content = re.sub(r'\n{3,}', '\n\n', content)
    return content.strip()


# ---------------------------------------------------------------------------
# LEQ extraction
# ---------------------------------------------------------------------------

def extract_leqs_from_pages(pages):
    """
    Extract LEQ options from Section II.
    Returns list of (q_num, prompt_text) tuples for questions 2, 3, 4.
    """
    text = full_text(pages)

    # Find LEQ section — appears after DBQ documents, before STOP
    # Look for pattern "Answer Question 2 or 3 or 4" or "Question 2, 3, or 4 (Long Essay)"
    leq_start = re.search(
        r'(?:Answer Question [23].{0,30}or Question \d+|'
        r'Question [23],?\s*3,?\s*or\s*4\s*\(Long Essay\)|'
        r'Question 2, 3, or 4)',
        text, re.IGNORECASE
    )

    stop_match = re.search(r'\nSTOP\s*\n|\nEND OF EXAM', text, re.IGNORECASE)

    if leq_start:
        leq_end = stop_match.start() if stop_match else len(text)
        leq_text = text[leq_start.start():leq_end]
    elif stop_match:
        leq_text = text[max(0, stop_match.start() - 4000):stop_match.start()]
    else:
        leq_text = text[-4000:]

    return _parse_leq_prompts(leq_text)


def _parse_leq_prompts(text):
    """
    Parse individual LEQ prompts (questions 2, 3, 4).
    Returns list of (q_num, prompt_text).
    """
    results = []

    # Split on question numbers 2., 3., 4. at line start
    parts = re.split(r'(?m)(?=^[2-4]\.\s)', text)

    for part in parts:
        part = part.strip()
        if not part:
            continue
        m = re.match(r'^([2-4])\.\s+(.*)', part, re.DOTALL)
        if m:
            q_num = int(m.group(1))
            q_content = m.group(2).strip()
            if len(q_content) < 30:
                continue
            # Remove trailing STOP/directions/bullets
            q_content = re.sub(r'\n(?:STOP|END OF|WHEN YOU FINISH|Begin your|____).*', '', q_content,
                                flags=re.DOTALL | re.IGNORECASE).strip()
            q_content = re.sub(r'\n[•\-]\s+.*', '', q_content, flags=re.DOTALL).strip()
            results.append((q_num, q_content))

    return results


# ---------------------------------------------------------------------------
# Scoring guidelines parsing
# ---------------------------------------------------------------------------

def get_sg_part_format(year):
    """Return the SG part label format for a given year."""
    if year <= 2022:
        return None  # No real SG available; use question PDF (same content)
    elif year == 2023:
        return None  # SG files for 2023 are question files
    elif year == 2024:
        return 'bracket'   # [a] [b] [c]
    else:
        return 'upper_space'  # A   B   C  (followed by space then uppercase word)


def extract_saq_rubrics(sg_pages, year, set_num):
    """
    Extract per-question, per-part rubric criteria from scoring guidelines.
    Returns dict: {q_num: {part_letter: [criteria_strings]}}
    """
    if year not in HAS_REAL_SG:
        return {}

    sg_text = full_text(sg_pages)

    # Find where SAQ SG ends (before DBQ Q1 section)
    dbq_section_match = re.search(
        r'\nQuestion 1:\s*Document-Based Question',
        sg_text, re.IGNORECASE
    )
    if dbq_section_match:
        saq_sg_text = sg_text[:dbq_section_match.start()]
    else:
        saq_sg_text = sg_text[:len(sg_text) // 3]

    # Split on "Question N:" pattern (SAQ headers)
    splits = re.split(r'\nQuestion\s+(\d+)\s*:', saq_sg_text)

    q_blocks = {}
    i = 1
    while i < len(splits) - 1:
        try:
            q_num = int(splits[i].strip())
            content = splits[i + 1] if i + 1 < len(splits) else ''
            q_blocks[q_num] = content.strip()
        except (ValueError, IndexError):
            pass
        i += 2

    # For each question block, extract per-part criteria
    rubrics = {}
    fmt = get_sg_part_format(year)
    for q_num, q_block in q_blocks.items():
        if 1 <= q_num <= 4:
            part_rubrics = _extract_saq_part_rubrics(q_block, fmt)
            if part_rubrics:
                rubrics[q_num] = part_rubrics

    return rubrics


def _extract_saq_part_rubrics(q_block, fmt):
    """
    Extract per-part rubric text from one SAQ SG block.
    Returns dict: {letter: rubric_text}
    """
    result = {}

    if fmt == 'bracket':
        # [a] Identify ONE... 1 point
        parts = re.split(r'\[([a-c])\]\s+', q_block)
        if len(parts) > 1:
            i = 1
            while i < len(parts) - 1:
                letter = parts[i].strip().lower()
                content = parts[i + 1] if i + 1 < len(parts) else ''
                if letter in ['a', 'b', 'c']:
                    result[letter] = content.strip()
                i += 2

    elif fmt == 'upper_space':
        # "A Identify one claim ... 1 point\n"
        # Letter is a standalone uppercase followed by space and text
        parts = re.split(r'\n([A-C])\s+(?=[A-Z])', q_block)
        if len(parts) > 1:
            i = 1
            while i < len(parts) - 1:
                letter = parts[i].strip().lower()
                content = parts[i + 1] if i + 1 < len(parts) else ''
                if letter in ['a', 'b', 'c']:
                    result[letter] = content.strip()
                i += 2

    return result


def extract_saq_criteria(part_text, year):
    """
    Extract rubric criteria bullet points from part SG text.
    Returns list of criterion strings.
    """
    criteria = []

    # Look for bullet points after "Examples of acceptable responses" or "Examples that earn"
    examples_match = re.search(
        r'(?:Examples of acceptable responses|Examples that earn this point)[^\n]*\n(.*?)(?=\nTotal for|\n[©\[]|\Z)',
        part_text, re.DOTALL | re.IGNORECASE
    )

    if examples_match:
        examples_text = examples_match.group(1)
        bullets = re.findall(r'•\s+([^\n•]+(?:\n(?!\n•)[^\n•]+)*)', examples_text)
        criteria = ['1 pt: ' + b.strip().replace('\n', ' ') for b in bullets[:5]]

    if not criteria:
        # Fall back: take non-empty lines that look like example answers
        lines = [l.strip() for l in part_text.split('\n') if l.strip() and l.strip().startswith('•')]
        criteria = ['1 pt: ' + l.lstrip('•').strip() for l in lines[:4]]

    if not criteria:
        criteria = ['1 pt: Historically defensible response addressing the prompt.']

    return criteria


def extract_scoring_notes(part_text):
    """Extract scoring notes (Accept/Note/Do not accept) from SG text."""
    notes = []
    for line in part_text.split('\n'):
        line = line.strip()
        if re.match(r'^(?:Accept|Do not|Note:|Must)', line, re.IGNORECASE):
            notes.append(line)
        elif '[Note:' in line:
            notes.append(line)
    return ' '.join(notes) if notes else None


def extract_dbq_rubric(sg_pages, year):
    """
    Extract DBQ scoring rubric.
    Returns a list of rubric criteria strings (one per point).
    """
    if year not in HAS_REAL_SG:
        return _default_dbq_rubric()

    return _default_dbq_rubric()


def _default_dbq_rubric():
    return [
        '1 pt (Thesis): Historically defensible thesis/claim that establishes a line of reasoning.',
        '1 pt (Contextualization): Describe a broader historical context relevant to the prompt.',
        '1 pt (Evidence from Docs): Use content of at least three documents to address the topic of the prompt.',
        '1 pt (Evidence from Docs+): Support an argument using at least four documents.',
        '1 pt (Evidence Beyond): Use at least one additional piece of specific historical evidence beyond the documents.',
        '1 pt (Sourcing): Explain how/why the point of view, purpose, historical situation, or audience of at least two documents is relevant to an argument.',
        '1 pt (Complexity): Demonstrate a complex understanding through sophisticated argumentation and/or effective use of evidence.',
    ]


def _default_leq_rubric():
    return [
        '1 pt (Thesis): Historically defensible thesis/claim that establishes a line of reasoning.',
        '1 pt (Contextualization): Describe broader historical context relevant to the prompt.',
        '1 pt (Evidence): Provide at least two specific examples of evidence relevant to the topic.',
        '1 pt (Evidence+): Use at least two pieces of specific evidence to support an argument.',
        '1 pt (Analysis): Use historical reasoning (comparison, causation, CCOT) to frame or structure an argument.',
        '1 pt (Complexity): Demonstrate complex understanding through sophisticated argumentation.',
    ]


# ---------------------------------------------------------------------------
# JSON construction
# ---------------------------------------------------------------------------

def id_prefix(year, set_num):
    """Return the ID prefix for a given year/set."""
    if set_num is None:
        return f'world-{year}'
    return f'world-{year}-set{set_num}'


def build_saq_json(year, set_num, q_num, q_text, sg_rubrics, pre_stimulus=None):
    """Build JSON for one SAQ question."""
    prefix = id_prefix(year, set_num)
    q_id = f'{prefix}-saq-{q_num}'

    # Parse parts — the q_text contains the "Respond to parts..." + A/B/C prompts
    # The stimulus was extracted separately and passed in as pre_stimulus
    _, parts_raw = parse_saq_parts(q_text, year)

    # If format detection failed, try the other formats
    if not parts_raw:
        for alt_year in [2021, 2023, 2025]:
            if alt_year != year:
                _, parts_raw = parse_saq_parts(q_text, alt_year)
                if parts_raw:
                    break

    # Use pre-extracted stimulus; fall back to inline stimulus detection
    stimulus = pre_stimulus
    if not stimulus:
        stimulus, _ = parse_saq_parts(q_text, year)  # may return stimulus from preamble

    q_sg = sg_rubrics.get(q_num, {})
    units = identify_units(q_text)
    title = generate_title(q_text, 'saq')

    parts = []
    for p in parts_raw:
        letter = p['letter']
        prompt = p['prompt'].strip()
        sg_part_text = q_sg.get(letter, '')
        criteria = extract_saq_criteria(sg_part_text, year) if sg_part_text else ['1 pt: Historically defensible response addressing the prompt.']
        notes = extract_scoring_notes(sg_part_text) if sg_part_text else None

        parts.append({
            'letter': letter,
            'prompt': prompt,
            'point_value': 1,
            'rubric_criteria': criteria,
            'scoring_notes': notes,
            'requires_drawing': False,
            'reference_image': None
        })

    # Ensure 3 parts
    if len(parts) < 3:
        default_prompts = [
            'Identify one claim the author/source makes.',
            'Describe one historical context relevant to the source.',
            'Explain one way to support or challenge the author\'s argument.',
        ]
        for i in range(len(parts), 3):
            letter = chr(ord('a') + i)
            parts.append({
                'letter': letter,
                'prompt': default_prompts[i] if i < len(default_prompts) else f'See part {letter} of original question.',
                'point_value': 1,
                'rubric_criteria': ['1 pt: Historically defensible response addressing the prompt.'],
                'scoring_notes': None,
                'requires_drawing': False,
                'reference_image': None
            })

    return {
        'id': q_id,
        'subject': 'ap-world-history',
        'year': year,
        'source': 'released',
        'title': title,
        'frq_type': 'saq',
        'related_units': units,
        'calculator_allowed': False,
        'total_points': 3,
        'stimulus': stimulus,
        'stimulus_image': None,
        'documents': None,
        'parts': parts
    }


def build_dbq_json(year, set_num, prompt, documents, sg_pages):
    """Build JSON for the DBQ."""
    prefix = id_prefix(year, set_num)
    q_id = f'{prefix}-dbq-1'

    criteria = extract_dbq_rubric(sg_pages, year)
    all_text = prompt + ' ' + ' '.join(d['content'] for d in documents)
    units = identify_units(all_text)
    title = generate_title(prompt, 'dbq')

    # DBQ has one "part" — the essay prompt (7 points total)
    parts = [{
        'letter': 'a',
        'prompt': prompt,
        'point_value': 7,
        'rubric_criteria': criteria,
        'scoring_notes': 'Full rubric: Thesis (1), Contextualization (1), Evidence from Documents (2), Evidence Beyond Documents (1), Sourcing (1), Complexity (1). Total: 7 points.',
        'requires_drawing': False,
        'reference_image': None
    }]

    return {
        'id': q_id,
        'subject': 'ap-world-history',
        'year': year,
        'source': 'released',
        'title': title,
        'frq_type': 'dbq',
        'related_units': units,
        'calculator_allowed': False,
        'total_points': 7,
        'stimulus': None,
        'stimulus_image': None,
        'documents': documents if documents else None,
        'parts': parts
    }


def build_leq_json(year, set_num, leq_prompts, sg_pages):
    """Build JSON for the LEQ — all options presented as separate parts."""
    prefix = id_prefix(year, set_num)
    q_id = f'{prefix}-leq-1'

    all_text = ' '.join(p for _, p in leq_prompts)
    units = identify_units(all_text)
    title = generate_title(leq_prompts[0][1] if leq_prompts else '', 'leq')

    # Each LEQ option becomes a separate part (a, b, c)
    parts = []
    for idx, (q_num, prompt) in enumerate(leq_prompts):
        letter = chr(ord('a') + idx)
        option_label = chr(ord('A') + idx)
        criteria = _default_leq_rubric()

        parts.append({
            'letter': letter,
            'prompt': f'[Option {option_label}] {prompt}',
            'point_value': 6,
            'rubric_criteria': criteria,
            'scoring_notes': 'Student selects ONE option. Full rubric: Thesis (1), Contextualization (1), Evidence (2), Analysis & Reasoning (2). Total: 6 points.',
            'requires_drawing': False,
            'reference_image': None
        })

    if not parts:
        parts = [{
            'letter': 'a',
            'prompt': 'Develop an argument addressing the prompt.',
            'point_value': 6,
            'rubric_criteria': _default_leq_rubric(),
            'scoring_notes': 'Full rubric: Thesis (1), Contextualization (1), Evidence (2), Analysis & Reasoning (2). Total: 6 points.',
            'requires_drawing': False,
            'reference_image': None
        }]

    return {
        'id': q_id,
        'subject': 'ap-world-history',
        'year': year,
        'source': 'released',
        'title': title,
        'frq_type': 'leq',
        'related_units': units,
        'calculator_allowed': False,
        'total_points': 6,
        'stimulus': None,
        'stimulus_image': None,
        'documents': None,
        'parts': parts
    }


# ---------------------------------------------------------------------------
# Main processing
# ---------------------------------------------------------------------------

def get_file_paths(year, set_num):
    """Return (q_path, sg_path) for an exam."""
    yr2 = str(year)[-2:]
    if set_num is None:
        q_name = f'world frq {yr2}.pdf'
        sg_name = f'world sg {yr2}.pdf'
    else:
        q_name = f'world frq set {set_num} {yr2}.pdf'
        sg_name = f'world sg set {set_num} {yr2}.pdf'

    q_path = os.path.join(QUESTIONS_DIR, q_name)
    sg_path = os.path.join(SG_DIR, sg_name)
    return q_path, sg_path


def process_exam(year, set_num):
    """Process one exam set and return list of output filenames."""
    q_path, sg_path = get_file_paths(year, set_num)
    set_label = f'{year} set{set_num}' if set_num else str(year)

    if not os.path.exists(q_path):
        print(f'  SKIP {set_label}: questions PDF not found: {q_path}')
        return []

    print(f'\nProcessing {set_label}...')

    q_pages = extract_pdf_pages(q_path)

    # For SG: use real SG if available, otherwise use question PDF (no rubric extracted)
    if year in HAS_REAL_SG and os.path.exists(sg_path):
        sg_pages = extract_pdf_pages(sg_path)
        has_sg = True
    else:
        sg_pages = q_pages  # placeholder (won't extract meaningful rubric)
        has_sg = False

    filenames = []

    # ---- SAQs ----
    saq_data = extract_saqs_from_pages(q_pages, year, set_num)
    sg_rubrics = extract_saq_rubrics(sg_pages, year, set_num) if has_sg else {}

    print(f'  SAQ questions found: {[q_num for q_num, _, _ in saq_data]}')
    if has_sg:
        print(f'  SG rubric questions found: {sorted(sg_rubrics.keys())}')

    for q_num, q_text, pre_stimulus in saq_data:
        frq_json = build_saq_json(year, set_num, q_num, q_text, sg_rubrics, pre_stimulus)
        out_filename = frq_json['id']
        out_path = os.path.join(OUTPUT_DIR, f'{out_filename}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(frq_json, f, indent=2, ensure_ascii=False)
        part_count = len(frq_json['parts'])
        print(f'  {out_filename}.json — {part_count} parts, {frq_json["total_points"]} pts, units {frq_json["related_units"]}')
        filenames.append(out_filename)

    # ---- DBQ ----
    dbq_prompt, documents = extract_dbq_from_pages(q_pages)
    if dbq_prompt:
        dbq_json = build_dbq_json(year, set_num, dbq_prompt, documents, sg_pages)
        out_filename = dbq_json['id']
        out_path = os.path.join(OUTPUT_DIR, f'{out_filename}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(dbq_json, f, indent=2, ensure_ascii=False)
        doc_count = len(dbq_json['documents']) if dbq_json['documents'] else 0
        print(f'  {out_filename}.json — {doc_count} docs, 7 pts, units {dbq_json["related_units"]}')
        filenames.append(out_filename)

    # ---- LEQ ----
    leq_prompts = extract_leqs_from_pages(q_pages)
    print(f'  LEQ options found: {[q_num for q_num, _ in leq_prompts]}')
    if leq_prompts:
        leq_json = build_leq_json(year, set_num, leq_prompts, sg_pages)
        out_filename = leq_json['id']
        out_path = os.path.join(OUTPUT_DIR, f'{out_filename}.json')
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump(leq_json, f, indent=2, ensure_ascii=False)
        print(f'  {out_filename}.json — {len(leq_prompts)} options, 6 pts, units {leq_json["related_units"]}')
        filenames.append(out_filename)

    return filenames


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'images'), exist_ok=True)

    all_filenames = []
    for year, set_num in EXAMS:
        filenames = process_exam(year, set_num)
        all_filenames.extend(filenames)

    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(all_filenames, f, indent=2)

    print(f'\nDone! Generated {len(all_filenames)} FRQ files.')
    print(f'Manifest: {manifest_path}')
    return all_filenames


if __name__ == '__main__':
    main()
