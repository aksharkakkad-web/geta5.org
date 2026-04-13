#!/usr/bin/env python3
"""
AP Psychology FRQ Extractor v2
Extracts FRQ questions and scoring guidelines from PDFs into structured JSON files.

Handles two distinct formats:
  - 2021-2024: Traditional scenario-based (Part A bullets + Part B bullets), 7 pts each
    Bullets can be U+0081 (older PDFs) or U+2022 "•" (newer PDFs)
  - 2025: New AAQ (parts A-F) + EBQ (parts A, B-i, B-ii, C-i, C-ii), 7 pts each

Output: psych-{year}-set{set}-frq-{frq_num}.json
"""

import pdfplumber
import json
import os
import re
import sys

sys.stdout.reconfigure(encoding='utf-8', errors='replace')

QUESTIONS_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-psychology\questions'
SG_DIR = r'C:\Ascendly\content-sources\frq-pdfs\ap-psychology\scoring-guidelines'
OUTPUT_DIR = r'C:\Ascendly\public\data\ap-psychology\frq'

# (year, set_num, questions_filename, sg_filename)
EXAM_FILES = [
    (2025, 1, '2025 psych set 1 frq.pdf', '2025 psych sg set 1.pdf'),
    (2025, 2, '2025 psych set 2 frq.pdf', '2025 sg psych set 2.pdf'),
    (2024, 1, '2024 psych set 1 frq.pdf', '2024 sg psych set 1.pdf'),
    (2024, 2, '2024 psych set 2 frq.pdf', '2024 sg psych set 2.pdf'),
    (2023, 1, '2023 psych set 1 frq.pdf', '2023 sg psych set 1.pdf'),
    (2023, 2, '2023 psych set 2 frq.pdf', '2023 sg psych set 2.pdf'),
    (2022, 1, '2022 psych set 1 frq.pdf', '2022 sg psych set 1.pdf'),
    (2022, 2, '2022 psych set 2 frq.pdf', '2022 sg psych set 2.pdf'),
    (2021, 1, '2021 psych set 1 frq.pdf', '2021 sg psych set 1.pdf'),
    (2021, 2, '2021 psych set 2 frq.pdf', '2021 sg psych set 2.pdf'),
]

# Bullet characters found in these PDFs (NOT including '-' which is used in hyphenated words)
BULLET_CHARS = {'\x81', '\u2022', '\u2023', '\u2219', '\u25e6', '\uf0b7'}

BOILERPLATE_PATTERNS = [
    r'^©\s*20\d\d College Board',
    r'Visit College Board on the web',
    r'AP Central is the official',
    r'^AP®?\s*(PSYCHOLOGY|Psychology)\s+20\d\d\s+(Free-Response|Scoring|FREE-RESPONSE)',
    r'^AP PSYCHOLOGY 20\d\d\s*[n●]\s*(FREE-RESPONSE|Scoring)',
    r'GO ON TO THE NEXT PAGE',
    r'^STOP\s*$',
    r'^END OF EXAM',
    r'^\d+\s*$',
    r'collegeboard\.org\s*$',
    r'apcentral\.collegeboard\.org',
    r'^Begin your response to this question',
    r'^fill in the appropriate circle',
    r'^_+\s*$',
]
BOILERPLATE_RE = re.compile('|'.join(BOILERPLATE_PATTERNS), re.IGNORECASE)


def extract_pdf_pages(path):
    """Extract list of (page_num, text) from a PDF."""
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


def clean_line(line):
    """Remove boilerplate from a single line."""
    return BOILERPLATE_RE.search(line.strip()) is None


def normalize_bullets(text):
    """Replace all bullet variants with standard •."""
    result = []
    for char in text:
        if char in BULLET_CHARS and char != '\u2022':
            result.append('\u2022')
        else:
            result.append(char)
    return ''.join(result)


def clean_text(text):
    """Remove boilerplate lines and normalize bullets."""
    text = normalize_bullets(text)
    lines = text.split('\n')
    cleaned = []
    for line in lines:
        stripped = line.strip()
        if not stripped:
            cleaned.append('')
            continue
        if BOILERPLATE_RE.search(stripped):
            continue
        cleaned.append(line)
    result = re.sub(r'\n{3,}', '\n\n', '\n'.join(cleaned))
    return result.strip()


# ─────────────────────────────────────────────
# AP PSYCHOLOGY UNIT MAPPING
# ─────────────────────────────────────────────
PSYCH_UNIT_KEYWORDS = {
    1: [
        'scientific method', 'research method', 'experiment', 'correlational', 'case study',
        'survey', 'naturalistic observation', 'hypothesis', 'operational definition',
        'independent variable', 'dependent variable', 'random assignment', 'random selection',
        'control group', 'experimental group', 'confounding variable', 'placebo',
        'double-blind', 'replication', 'statistical', 'standard deviation', 'mean', 'median',
        'mode', 'normal distribution', 'informed consent', 'debriefing', 'ethics',
        'institutional review', 'sampling', 'bias', 'third variable', 'correlation',
        'scatter', 'longitudinal', 'cross-sectional', 'metacognition', 'levels of processing',
        'central tendency', 'statistically significant', 'generalizable', 'generalizability',
        'misinformation effect', 'operational', 'halo effect', 'confound', 'reliability',
        'validity', 'replication', 'primacy effect', 'recency effect',
    ],
    2: [
        'neuron', 'synapse', 'neurotransmitter', 'action potential', 'axon', 'dendrite',
        'myelin', 'cerebral cortex', 'frontal lobe', 'parietal lobe', 'temporal lobe',
        'occipital lobe', 'hippocampus', 'amygdala', 'cerebellum', 'brain stem', 'thalamus',
        'hypothalamus', 'limbic', 'motor cortex', 'somatosensory', 'broca', 'wernicke',
        'corpus callosum', 'lateralization', 'plasticity', 'neuroplasticity', 'efferent',
        'afferent', 'somatic', 'autonomic', 'sympathetic', 'parasympathetic', 'endocrine',
        'hormone', 'pituitary', 'adrenal', 'cortisol', 'epinephrine', 'dopamine',
        'serotonin', 'gaba', 'glutamate', 'acetylcholine', 'endorphin', 'reuptake',
        'agonist', 'antagonist', 'fmri', 'pet scan', 'eeg', 'split-brain', 'lesion',
    ],
    3: [
        'sensation', 'perception', 'transduction', 'threshold', 'absolute threshold',
        'difference threshold', 'just noticeable difference', 'weber', 'signal detection',
        'sensory adaptation', 'vision', 'retina', 'rods', 'cones', 'optic nerve',
        'blind spot', 'feature detectors', 'color vision', 'trichromatic', 'opponent process',
        'depth perception', 'binocular', 'monocular', 'interposition', 'linear perspective',
        'gestalt', 'figure-ground', 'perceptual constancy', 'hearing', 'cochlea',
        'frequency', 'amplitude', 'pitch', 'loudness', 'place theory', 'frequency theory',
        'vestibular', 'kinesthesia', 'proprioception', 'taste', 'smell', 'gate control',
        'pain', 'top-down', 'bottom-up', 'soundwave', 'wavelength',
    ],
    4: [
        'classical conditioning', 'operant conditioning', 'pavlov', 'skinner', 'reinforcement',
        'punishment', 'positive reinforcement', 'negative reinforcement', 'positive punishment',
        'negative punishment', 'conditioned', 'unconditioned', 'extinction', 'spontaneous recovery',
        'generalization', 'discrimination', 'shaping', 'schedule', 'fixed ratio', 'variable ratio',
        'fixed interval', 'variable interval', 'continuous reinforcement', 'observational learning',
        'social learning', 'bandura', 'modeling', 'latent learning', 'cognitive map',
        'insight', 'preparedness', 'learned helplessness', 'token economy', 'behavior modification',
        'systematic desensitization', 'discriminative stimulus', 'chaining', 'vicarious reinforcement',
        'self-efficacy',
    ],
    5: [
        'memory', 'encoding', 'storage', 'retrieval', 'sensory memory', 'short-term memory',
        'long-term memory', 'working memory', 'serial position', 'primacy', 'recency',
        'chunking', 'elaborative rehearsal', 'maintenance rehearsal', 'deep processing',
        'shallow processing', 'mnemonic', 'method of loci', 'schema', 'semantic',
        'episodic', 'procedural memory', 'explicit', 'implicit', 'priming', 'recall', 'recognition',
        'relearning', 'context-dependent', 'state-dependent', 'mood congruent',
        'proactive interference', 'retroactive interference', 'tip of the tongue',
        'forgetting curve', 'repression', 'misinformation', 'source monitoring',
        'flashbulb', 'eidetic', 'amnesia', 'alzheimer', 'problem-solving',
        'algorithm', 'heuristic', 'mental set', 'functional fixedness',
        'confirmation bias', 'representativeness', 'availability heuristic', 'divergent thinking',
        'convergent thinking', 'creativity', 'language', 'morpheme', 'phoneme', 'syntax',
        'semantics', 'linguistic relativity', 'whorf',
    ],
    6: [
        'developmental', 'piaget', 'vygotsky', 'kohlberg', 'erikson', 'bronfenbrenner',
        'assimilation', 'accommodation', 'sensorimotor', 'preoperational',
        'concrete operational', 'formal operational', 'object permanence', 'conservation',
        'egocentrism', 'theory of mind', 'zone of proximal development', 'scaffolding',
        'attachment', 'ainsworth', 'secure attachment', 'insecure attachment', 'avoidant attachment',
        'anxious attachment', 'strange situation', 'harlow', 'critical period', 'imprinting',
        'parenting', 'authoritative parenting', 'authoritarian parenting', 'permissive parenting',
        'uninvolved', 'temperament', 'puberty', 'identity', 'adolescence', 'emerging adulthood',
        'crystallized intelligence', 'fluid intelligence', 'aging',
    ],
    7: [
        'motivation', 'emotion', 'personality', 'maslow', 'hierarchy of needs',
        'intrinsic motivation', 'extrinsic motivation', 'incentive theory', 'drive reduction',
        'arousal theory', 'yerkes-dodson', 'instinct', 'set point', 'hunger', 'thirst',
        'ghrelin', 'leptin', 'sexual motivation', 'achievement motivation',
        'self-determination', 'autonomy', 'basic emotions', 'james-lange', 'cannon-bard',
        'two-factor', 'schachter-singer', 'facial feedback', 'display rules', 'stress',
        'general adaptation syndrome', 'hardiness', 'coping', 'social support',
        'big five', 'openness', 'conscientiousness', 'extraversion', 'agreeableness',
        'neuroticism', 'freud', 'id', 'ego', 'superego', 'defense mechanism',
        'projection', 'rationalization', 'displacement', 'sublimation', 'regression',
        'denial', 'psychoanalytic', 'psychosexual', 'oedipus', 'jung', 'adler', 'neo-freudian',
        'humanistic', 'rogers', 'self-concept', 'unconditional positive regard', 'self-actualization',
        'trait theory', 'locus of control', 'self-efficacy', 'reciprocal determinism',
        'rorschach', 'thematic apperception', 'projective test', 'minnesota multiphasic',
    ],
    8: [
        'psychological disorder', 'dsm', 'abnormal', 'anxiety disorder', 'phobia',
        'panic disorder', 'generalized anxiety', 'ocd', 'obsessive-compulsive', 'ptsd',
        'trauma', 'dissociative', 'dissociative identity', 'major depressive', 'depression',
        'bipolar', 'mania', 'schizophrenia', 'positive symptoms', 'negative symptoms',
        'delusion', 'hallucination', 'psychosis', 'eating disorder', 'anorexia', 'bulimia',
        'personality disorder', 'antisocial', 'borderline', 'somatic', 'conversion',
        'attention-deficit', 'adhd', 'autism spectrum', 'biomedical therapy', 'psychotherapy',
        'cognitive behavioral therapy', 'cbt', 'psychoanalytic therapy', 'humanistic therapy',
        'systematic desensitization', 'exposure therapy', 'aversive conditioning',
        'antidepressant', 'antipsychotic', 'lithium', 'ssri',
        'electroconvulsive therapy', 'ect', 'clinical psychology', 'diagnosis',
    ],
    9: [
        'social psychology', 'attribution', 'fundamental attribution error', 'dispositional',
        'situational', 'actor-observer', 'self-serving bias', 'attitude', 'cognitive dissonance',
        'conformity', 'asch', 'obedience', 'milgram', 'social influence', 'social norms',
        'social facilitation', 'social loafing', 'deindividuation', 'group polarization',
        'groupthink', 'bystander effect', 'diffusion of responsibility', 'prosocial behavior',
        'altruism', 'empathy', 'helping behavior', 'aggression', 'frustration-aggression',
        'stereotyping', 'prejudice', 'discrimination', 'implicit bias', 'in-group', 'out-group',
        'contact hypothesis', 'scapegoat', 'just-world', 'persuasion', 'central route',
        'peripheral route', 'foot-in-the-door', 'door-in-the-face', 'reciprocity norm',
        'mere-exposure effect', 'mere exposure', 'social exchange', 'equity theory',
        'romantic love', 'proximity', 'physical attractiveness', 'similarity',
        'industrial organizational', 'industrial/organizational', 'management style',
        'halo effect', 'leadership', 'workplace',
    ],
}


def identify_units(text):
    """Map question text to AP Psychology unit numbers."""
    lower = text.lower()
    units = set()
    for unit_num, keywords in PSYCH_UNIT_KEYWORDS.items():
        for kw in keywords:
            if kw in lower:
                units.add(unit_num)
                break
    if not units:
        units.add(1)
    return sorted(list(units))


def get_title_from_text(q_text, frq_num, year):
    """Generate a descriptive title for the FRQ."""
    lower = q_text.lower()

    if year == 2025:
        if frq_num == 1:
            return 'Article Analysis Question (AAQ)'
        else:
            return 'Evidence-Based Question (EBQ)'

    checks = [
        (['research method', 'experiment', 'correlational', 'independent variable',
          'dependent variable', 'operational definition', 'random assignment',
          'confounding variable', 'statistically significant', 'hypothesis',
          'control group', 'experimental group', 'generalizable', 'third variable'],
         'Research Methods & Experimental Design'),
        (['classical conditioning', 'operant conditioning', 'reinforcement', 'punishment',
          'schedule', 'shaping', 'extinction', 'pavlov', 'skinner'],
         'Learning & Conditioning'),
        (['memory', 'encoding', 'retrieval', 'serial position', 'interference',
          'long-term memory', 'short-term memory', 'working memory',
          'context-dependent', 'levels of processing'],
         'Memory & Cognition'),
        (['attribution', 'social facilitation', 'conformity', 'obedience', 'bystander',
          'diffusion of responsibility', 'prejudice', 'stereotype', 'attitude',
          'persuasion', 'helping behavior', 'prosocial', 'reciprocity norm',
          'mere-exposure', 'industrial/organizational', 'management', 'halo effect'],
         'Social Psychology'),
        (['neuron', 'brain', 'cerebral cortex', 'motor cortex', 'neurotransmitter',
          'dopamine', 'serotonin', 'synapse', 'nervous system', 'efferent', 'afferent'],
         'Biological Bases of Behavior'),
        (['piaget', 'vygotsky', 'attachment', 'assimilation', 'accommodation',
          'egocentrism', 'developmental', 'parenting', 'adolescence', 'erikson'],
         'Developmental Psychology'),
        (['maslow', 'motivation', 'emotion', 'big five', 'personality', 'stress',
          'locus of control', 'incentive', 'arousal', 'yerkes-dodson',
          'neuroticism', 'conscientiousness', 'freud', 'jung', 'humanistic'],
         'Motivation, Emotion & Personality'),
        (['sensation', 'perception', 'threshold', 'vestibular', 'depth perception',
          'retina', 'cones', 'rods', 'gestalt', 'monocular', 'binocular', 'soundwave'],
         'Sensation & Perception'),
        (['psychological disorder', 'depression', 'anxiety', 'schizophrenia', 'therapy',
          'cbt', 'psychotherapy', 'dsm', 'phobia', 'bipolar', 'ocd'],
         'Clinical Psychology & Treatment'),
    ]

    for keywords, title in checks:
        for kw in keywords:
            if kw in lower:
                return title

    return 'Psychology Concept Application'


# ─────────────────────────────────────────────
# PDF TEXT EXTRACTION
# ─────────────────────────────────────────────

def get_question_pages(pages):
    """
    Return cleaned pages. We clean all pages but then extract question content
    by finding "1." markers in the full text.
    """
    content_pages = []
    for pnum, raw in pages:
        cleaned = clean_text(raw)
        if not cleaned.strip():
            continue
        content_pages.append((pnum, cleaned))
    return content_pages


def get_sg_pages(pages):
    """Return cleaned scoring guidelines pages (skip cover)."""
    sg_pages = []
    for pnum, raw in pages:
        cleaned = clean_text(raw)
        if not cleaned.strip():
            continue
        # Skip pure cover page
        if re.match(r'^\d{4}\s*\n?AP', cleaned.strip(), re.IGNORECASE):
            if len(cleaned) < 300:
                continue
        sg_pages.append((pnum, cleaned))
    return sg_pages


def extract_right_column_from_page(pdf_path, page_idx):
    """
    Extract only the RIGHT column text from a 2025 SG page using bounding box filtering.
    The right column (earn-this-point criteria) starts at approx x=306 (half page width).
    Returns cleaned right-column text.
    """
    try:
        with pdfplumber.open(pdf_path) as pdf:
            if page_idx >= len(pdf.pages):
                return ''
            page = pdf.pages[page_idx]
            width = page.width
            midpoint = width * 0.50

            words = page.extract_words()

            from collections import defaultdict
            rows = defaultdict(list)
            for w in words:
                row_y = round(w['top'] / 4) * 4
                rows[row_y].append(w)

            right_lines = []
            for y in sorted(rows.keys()):
                row_words = sorted(rows[y], key=lambda w: w['x0'])
                right_words = [w['text'] for w in row_words if w['x0'] >= midpoint]
                if right_words:
                    right_lines.append(' '.join(right_words))

            return '\n'.join(right_lines)
    except Exception:
        return ''


# ─────────────────────────────────────────────
# TRADITIONAL FORMAT (2021-2024)
# ─────────────────────────────────────────────

def split_traditional_questions(pages):
    """
    Split into Q1 text and Q2 text for traditional format.
    Q1 starts at "1." or "1. Part A", Q2 starts at "2.".
    Skips cover/directions preamble.
    Returns (q1_text, q2_text).
    """
    full_text = '\n'.join(t for _, t in pages)

    # Remove trailing cleanup markers (these appear AFTER the last question)
    full_text = re.sub(r'_{10,}[^1-9]*$', '', full_text, flags=re.DOTALL).strip()
    # Remove "and fill in the appropriate circle..." lines (appear between questions)
    full_text = re.sub(r'and fill in the appropriate circle[^\n]*\n?', '',
                       full_text, flags=re.IGNORECASE)

    # Find where question 1 starts: "\n1. " or "\n1. Part A"
    q1_match = re.search(r'\n\s*1\.\s+', full_text)
    if not q1_match:
        # Try without newline (might be at start)
        q1_match = re.search(r'^\s*1\.\s+', full_text)

    if q1_match:
        # Everything before Q1 is directions preamble — skip it
        content = full_text[q1_match.start():].strip()
    else:
        content = full_text

    # Now find "2." that begins Q2 within the remaining content
    # "2." followed by text (not "2. Compare" — wait, that's fine for Q2 too)
    # Must be at the start of a line
    q2_match = re.search(r'\n\s*2\.\s+(?=\S)', content)
    if q2_match:
        q1_raw = content[:q2_match.start()].strip()
        q2_raw = content[q2_match.start():].strip()
        # Remove leading "1." or "2."
        q1 = re.sub(r'^\s*1\.\s*', '', q1_raw).strip()
        q2 = re.sub(r'^\s*2\.\s*', '', q2_raw).strip()
        return q1, q2

    # No Q2 found — return all as Q1
    q1 = re.sub(r'^\s*1\.\s*', '', content).strip()
    return q1, ''


def parse_traditional_question(q_text):
    """
    Parse a 2021-2024 traditional question.
    Returns: {
        'stimulus': str,  # the scenario narrative
        'parts': [{'label': 'A'/'B', 'instruction': str, 'bullets': [str], 'sub_scenario': str}]
    }
    """
    # Remove leading "1." if present
    q_text = re.sub(r'^1\.\s*', '', q_text.strip())

    result = {
        'stimulus': '',
        'parts': []
    }

    # Check if question starts directly with "Part A" (2023 style: "1. Part A\n...")
    if re.match(r'^Part [A-C]\b', q_text, re.IGNORECASE):
        # No pre-part stimulus — parse Part A/B from the top
        # The initial "Part A" is at the start of the text (index 0 after split contains it)
        # We need to handle: [0]="Part A...", [1]="Part B", [2]=content_b
        part_splits = re.split(r'\n(Part [A-C])\b', q_text)

        # First segment contains "Part A" + its content
        if part_splits:
            first_seg = part_splits[0]
            # Extract "Part A" label and content
            m_first = re.match(r'^Part ([A-C])\b\s*(.*)', first_seg, re.DOTALL | re.IGNORECASE)
            if m_first:
                label = m_first.group(1).upper()
                content = m_first.group(2).strip()
                bullets, instruction, sub_scenario = extract_bullets_and_instruction(content)
                result['parts'].append({
                    'label': label,
                    'instruction': instruction,
                    'bullets': bullets,
                    'sub_scenario': sub_scenario,
                })

        # Remaining part_splits: [label, content, label, content, ...]
        i = 1
        while i < len(part_splits) - 1:
            label = part_splits[i].split()[-1].upper()  # "Part B" -> "B"
            content = part_splits[i + 1].strip() if i + 1 < len(part_splits) else ''
            bullets, instruction, sub_scenario = extract_bullets_and_instruction(content)
            result['parts'].append({
                'label': label,
                'instruction': instruction,
                'bullets': bullets,
                'sub_scenario': sub_scenario,
            })
            i += 2

        return result

    # Find all "Part A" and "Part B" markers (standard format)
    part_splits = re.split(r'\n(Part [A-C])\b', q_text)

    if len(part_splits) == 1:
        # No "Part A/B" found — look if the entire thing is just bullets (no Part labels)
        # This happens for Q2 style with direct bullet questions and no Part A/B
        bullets, instruction, scenario = extract_bullets_and_instruction(q_text)
        result['stimulus'] = scenario
        if bullets:
            result['parts'].append({
                'label': 'A',
                'instruction': instruction,
                'bullets': bullets,
                'sub_scenario': '',
            })
        else:
            result['stimulus'] = q_text
        return result

    # part_splits is: [before_first_part, 'Part A', content_a, 'Part B', content_b, ...]
    result['stimulus'] = part_splits[0].strip()

    i = 1
    while i < len(part_splits) - 1:
        label_str = part_splits[i]  # "Part A", "Part B", etc.
        label = label_str.split()[-1].upper()  # 'A', 'B', 'C'
        content = part_splits[i + 1].strip() if i + 1 < len(part_splits) else ''
        bullets, instruction, sub_scenario = extract_bullets_and_instruction(content)

        result['parts'].append({
            'label': label,
            'instruction': instruction,
            'bullets': bullets,
            'sub_scenario': sub_scenario,
        })
        i += 2

    return result


QUESTION_VERB_RE = re.compile(
    r'^(Identify|State|Calculate|Compare|Explain why|Explain how|Explain what|'
    r'Suppose|Describe|Define|Evaluate|Analyze|Discuss)',
    re.IGNORECASE
)


def is_question_bullet(text):
    """
    Returns True if a bullet item is an actual question (direct question or concept name).
    Returns False if it's a data/scenario bullet (e.g., "In Store A, the manager has...").
    """
    # Direct question verbs = always a question
    if QUESTION_VERB_RE.match(text):
        return True
    # Short concept names (under 60 chars, no narrative language) = concept application bullet
    if len(text) < 65 and not re.search(r'\b(the manager|the store|the participant|he|she|they)\b',
                                         text, re.IGNORECASE):
        return True
    # Data/scenario bullets: "In Store X...", "Participant...", "The results..."
    if re.match(r'^In (Store|Group|Condition)', text, re.IGNORECASE):
        return False
    return True


def extract_bullets_and_instruction(text):
    """
    From a Part block, extract:
    - bullets: list of question bullet items
    - instruction: the "Explain how each of the following..." line
    - sub_scenario: any narrative paragraph before the instruction

    Returns (bullets, instruction, sub_scenario)

    Handles two bullet formats:
    1. "Explain how each of the following..." + bullet list (concept application)
    2. Direct question bullets: "• Identify the DV", "• Explain how..."

    Note: Stimulus/data bullets (e.g., "In Store A, the manager...") are filtered out
    and added to sub_scenario instead.
    """
    lines = text.split('\n')
    bullets = []
    instruction = ''
    sub_scenario_lines = []
    in_bullets = False
    has_instruction = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Bullet line (• character)
        if stripped.startswith('\u2022'):
            in_bullets = True
            item = stripped.lstrip('\u2022 ').strip()
            if item:
                if has_instruction or is_question_bullet(item):
                    bullets.append(item)
                else:
                    # This is a stimulus/data bullet — add to sub_scenario
                    sub_scenario_lines.append(item)
            continue

        if in_bullets:
            # Continuation line of a multi-line bullet (wrapping)
            if not re.match(r'^(Part [A-C]|Explain how each|Suppose)', stripped, re.IGNORECASE):
                if bullets:
                    bullets[-1] = bullets[-1] + ' ' + stripped
            continue

        # Before bullets section
        if re.match(r'^Explain how (each of the following|the following)', stripped, re.IGNORECASE):
            instruction = stripped
            has_instruction = True
        elif re.match(r'^Explain how each of the following (relates|could|might)', stripped, re.IGNORECASE):
            instruction = stripped
            has_instruction = True
        else:
            # Narrative scenario text
            sub_scenario_lines.append(stripped)

    sub_scenario = ' '.join(sub_scenario_lines).strip()
    return bullets, instruction, sub_scenario


# ─────────────────────────────────────────────
# TRADITIONAL SCORING GUIDELINES PARSER
# ─────────────────────────────────────────────

def parse_traditional_sg(sg_pages, frq_num):
    """
    Parse traditional-format scoring guidelines for a given question number.
    Returns list of dicts: [{concept, criteria, notes, point_value}]
    """
    # Collect pages for this question
    # Q1 pages come before "Question 2:" marker; Q2 pages come after
    q1_parts = []
    q2_parts = []
    in_q2 = False

    for pnum, text in sg_pages:
        # Check for Q2 header
        if re.search(r'^Question\s+2\s*:', text, re.MULTILINE | re.IGNORECASE):
            in_q2 = True

        if in_q2:
            q2_parts.append(text)
        else:
            q1_parts.append(text)

    target_parts = q2_parts if frq_num == 2 else q1_parts
    sg_text = '\n\n'.join(target_parts)

    return extract_sg_entries(sg_text)


def extract_sg_entries(sg_text):
    """
    Extract per-concept scoring entries from SG text.

    Each entry looks like:
        [Concept Name / Term] 1 point
        The response must indicate...
        Acceptable explanations include:
        • ...
        Unacceptable explanations include:
        • ...

    Returns list of dicts: [{concept, criterion, acceptable, notes}]
    """
    entries = []

    # Split on "[Concept] 1 point" lines
    # These are lines that end with "1 point" (and optionally point value after concept name)
    # The concept name can be multi-word
    lines = sg_text.split('\n')

    # Find boundaries: lines matching "... 1 point" at end of line
    # (must have substantial text before "1 point")
    concept_line_idxs = []
    for i, line in enumerate(lines):
        stripped = line.strip()
        if re.search(r'\b1\s+point\s*$', stripped, re.IGNORECASE):
            # Make sure it's a concept name, not a criteria line
            pre_text = re.sub(r'\s*1\s+point\s*$', '', stripped, flags=re.IGNORECASE).strip()
            if len(pre_text) > 3 and not pre_text.lower().startswith('the response must'):
                concept_line_idxs.append(i)

    if not concept_line_idxs:
        # Fallback: try to extract any structured content
        return []

    # Extract content between concept headers
    for idx, start_line_idx in enumerate(concept_line_idxs):
        end_line_idx = concept_line_idxs[idx + 1] if idx + 1 < len(concept_line_idxs) else len(lines)

        concept_line = lines[start_line_idx].strip()
        concept = re.sub(r'\s*1\s+point\s*$', '', concept_line, flags=re.IGNORECASE).strip()

        entry_lines = lines[start_line_idx + 1:end_line_idx]
        entry_text = '\n'.join(entry_lines)

        criterion, acceptable, notes = parse_sg_entry_text(entry_text, concept)

        entries.append({
            'concept': concept,
            'criterion': criterion,
            'acceptable': acceptable,
            'notes': notes,
        })

    return entries


def parse_sg_entry_text(text, concept):
    """Parse the body of a single SG entry."""
    lines = text.split('\n')
    criterion_lines = []
    acceptable_lines = []
    notes_lines = []
    section = 'criterion'

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        if re.match(r'^Acceptable (explanations|responses) include', stripped, re.IGNORECASE):
            section = 'acceptable'
            continue
        if re.match(r'^Unacceptable (explanations|responses) include', stripped, re.IGNORECASE):
            section = 'unacceptable'
            continue
        if re.match(r'^(Accept|Note:|Must|Do not|Additional)', stripped, re.IGNORECASE):
            notes_lines.append(stripped)
            continue

        if section == 'criterion':
            if stripped and not stripped.startswith('\u2022'):
                criterion_lines.append(stripped)
        elif section == 'acceptable':
            if stripped.startswith('\u2022'):
                acceptable_lines.append(stripped.lstrip('\u2022 ').strip())
        # skip unacceptable

    criterion = ' '.join(criterion_lines).strip()
    if not criterion:
        criterion = f'Correctly applies {concept} to the scenario.'

    notes = ' | '.join(notes_lines) if notes_lines else None

    return criterion, acceptable_lines, notes


# ─────────────────────────────────────────────
# BUILD TRADITIONAL FRQ JSON
# ─────────────────────────────────────────────

def build_traditional_frq_json(year, set_num, frq_num, q_text, sg_entries, full_q_text):
    """Build JSON object for a traditional 2021-2024 FRQ."""
    frq_id = f'psych-{year}-set{set_num}-frq-{frq_num}'

    parsed = parse_traditional_question(q_text)
    stimulus = parsed['stimulus'] if parsed['stimulus'] and len(parsed['stimulus']) > 20 else None

    parts = []
    part_letter_idx = 0
    letters = 'abcdefghijklmno'

    # Map SG entries to question bullets in order
    sg_idx = 0

    for part in parsed['parts']:
        label = part['label']
        instruction = part.get('instruction', '')
        sub_scenario = part.get('sub_scenario', '')
        bullets = part.get('bullets', [])

        for bullet in bullets:
            letter = letters[part_letter_idx]
            part_letter_idx += 1

            # Get matching SG entry
            sg_entry = sg_entries[sg_idx] if sg_idx < len(sg_entries) else None
            sg_idx += 1

            if sg_entry:
                criterion = sg_entry['criterion']
                acceptable = sg_entry['acceptable']
                notes = sg_entry['notes']
                concept = sg_entry['concept']
            else:
                criterion = f'Correctly applies {bullet} to the scenario.'
                acceptable = []
                notes = None
                concept = bullet

            # Build criteria list
            criteria = [f'1 pt: {criterion}']
            if acceptable:
                criteria.append('Acceptable: ' + '; '.join(acceptable[:2]))

            # Build prompt
            # If bullet starts with a verb (direct question), use it as-is
            is_direct_question = re.match(
                r'^(Identify|State|Calculate|Compare|Explain why|Explain how|Explain what|'
                r'Suppose|Describe|Define|Evaluate|Analyze)',
                bullet, re.IGNORECASE
            )

            if is_direct_question:
                # Direct question bullet — use as-is, optionally prefix with sub-scenario
                prompt = bullet
            elif instruction and 'each of the following' in instruction.lower():
                # Generic: "Explain how [bullet] [verb phrase]"
                verb_match = re.search(r'(relates to|could apply to|might relate to|might apply to|apply to)',
                                       instruction, re.IGNORECASE)
                verb = verb_match.group(1) if verb_match else 'relates to'
                prompt = f'Explain how {bullet} {verb} the scenario.'
            elif instruction:
                prompt = f'{instruction} {bullet}'
            else:
                prompt = f'Explain how {bullet} relates to the scenario.'

            # For Part B with sub-scenario, prepend the new scenario context
            if sub_scenario and label == 'B' and not is_direct_question:
                prompt = f'{sub_scenario} {prompt}'
            elif sub_scenario and label == 'B' and is_direct_question:
                prompt = f'{sub_scenario} {prompt}'

            parts.append({
                'letter': letter,
                'prompt': prompt.strip(),
                'point_value': 1,
                'rubric_criteria': criteria,
                'scoring_notes': notes,
                'requires_drawing': False,
                'reference_image': None,
            })

    # If no parts extracted, create a fallback
    if not parts:
        parts = [{
            'letter': 'a',
            'prompt': q_text.strip()[:500],
            'point_value': 7,
            'rubric_criteria': ['1 pt per correctly applied concept (7 total)'],
            'scoring_notes': None,
            'requires_drawing': False,
            'reference_image': None,
        }]

    units = identify_units(full_q_text)
    title = get_title_from_text(full_q_text, frq_num, year)

    return {
        'id': frq_id,
        'subject': 'ap-psychology',
        'year': year,
        'source': 'released',
        'title': title,
        'frq_type': 'multi_part_text',
        'related_units': units,
        'calculator_allowed': False,
        'total_points': 7,
        'stimulus': stimulus,
        'stimulus_image': None,
        'documents': None,
        'parts': parts,
    }


# ─────────────────────────────────────────────
# 2025 FORMAT PARSERS
# ─────────────────────────────────────────────

def split_2025_questions(pages):
    """Split 2025 format into Q1 (AAQ) and Q2 (EBQ)."""
    full_text = '\n'.join(t for _, t in pages)

    # Q2 starts with "2. Using the sources provided"
    q2_match = re.search(r'\n\s*2\.\s+Using the sources provided', full_text, re.IGNORECASE)
    if q2_match:
        q1 = full_text[:q2_match.start()].strip()
        q2 = re.sub(r'^\s*2\.\s*', '', full_text[q2_match.start():].strip()).strip()
        return q1, q2

    return full_text, ''


def parse_2025_aaq_parts(q_text):
    """
    Parse 2025 AAQ question text.
    Returns: {
        'parts': {'A': str, 'B': str, ...},
        'stimulus': str  # the research article text
    }
    """
    parts = {}

    # Find the numbered parts block "1. Your response..."
    # Then parse A. B. C. D. E. F. individual part prompts
    lines = q_text.split('\n')

    current_part = None
    current_content = []
    in_parts_block = False

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Start of parts block: "1. Your response to the question should be provided in"
        if re.match(r'^1\.\s+Your response', stripped, re.IGNORECASE):
            in_parts_block = True
            continue

        if in_parts_block:
            # Individual part: "A. Identify the research method..."
            m = re.match(r'^([A-F])\.\s+(.*)', stripped)
            if m:
                if current_part and current_content:
                    parts[current_part] = ' '.join(current_content).strip()
                current_part = m.group(1)
                current_content = [m.group(2)]
                continue

            # Part content continuation
            if current_part:
                # Stop if we hit "Introduction" — that's the stimulus start
                if stripped == 'Introduction':
                    if current_part and current_content:
                        parts[current_part] = ' '.join(current_content).strip()
                    in_parts_block = False
                    current_part = None
                    break
                current_content.append(stripped)

    if current_part and current_content:
        parts[current_part] = ' '.join(current_content).strip()

    # Extract stimulus (everything from "Introduction" up to the EBQ section)
    # The EBQ section starts with "This question has three parts: Part A, Part B, and Part C"
    intro_idx = q_text.find('\nIntroduction\n')
    if intro_idx < 0:
        intro_idx = q_text.find('\nIntroduction ')
    if intro_idx >= 0:
        stim_text = q_text[intro_idx:]
        # Truncate at EBQ instruction block
        ebq_cutoff = re.search(
            r'\nThis question has (three|two) parts', stim_text, re.IGNORECASE
        )
        if ebq_cutoff:
            stim_text = stim_text[:ebq_cutoff.start()]
        stimulus = stim_text.strip()
    else:
        stimulus = None

    return parts, stimulus


def parse_2025_ebq_parts(q_text):
    """
    Parse 2025 EBQ question text.
    Returns: {
        'main_question': str,
        'parts': {'A': str, 'B': str, 'B_i': str, 'B_ii': str, 'C_i': str, 'C_ii': str},
        'stimulus': str  # Source 1, Source 2, Source 3 text
    }
    """
    parts = {}

    # Find main question
    main_q_match = re.search(r'Using the sources provided.*?(?=\nA\.)', q_text, re.DOTALL | re.IGNORECASE)
    main_question = main_q_match.group(0).strip() if main_q_match else ''

    # Parse labeled parts
    lines = q_text.split('\n')
    current_part = None
    current_content = []

    for line in lines:
        stripped = line.strip()
        if not stripped:
            continue

        # Stop at Source 1
        if re.match(r'^Source\s+\d+\s*$', stripped):
            if current_part and current_content:
                parts[current_part] = ' '.join(current_content).strip()
            current_part = None
            current_content = []
            break

        # Main part "A.", "B.", "C."
        m = re.match(r'^([ABC])\.\s*(.*)', stripped)
        if m:
            if current_part and current_content:
                parts[current_part] = ' '.join(current_content).strip()
            current_part = m.group(1)
            current_content = [m.group(2)] if m.group(2) else []
            continue

        # Sub-part "i.", "ii."
        m2 = re.match(r'^(i{1,3})\.\s+(.*)', stripped, re.IGNORECASE)
        if m2 and current_part in ('B', 'C', 'B_saved', 'C_saved'):
            parent = current_part[0] if len(current_part) == 1 else current_part[0]
            if current_part and current_content:
                parts[current_part] = ' '.join(current_content).strip()
            sub_label = m2.group(1).lower()
            current_part = f'{parent}_{sub_label}'
            current_content = [m2.group(2)]
            continue

        if current_part:
            current_content.append(stripped)

    if current_part and current_content:
        parts[current_part] = ' '.join(current_content).strip()

    # Extract stimulus (all source text)
    source_idx = q_text.find('\nSource 1')
    if source_idx < 0:
        source_idx = q_text.find('Source 1')
    stimulus = q_text[source_idx:].strip() if source_idx >= 0 else None

    return main_question, parts, stimulus


def parse_2025_sg(sg_pages, frq_num, sg_pdf_path=None):
    """
    Parse 2025 scoring guidelines.
    Returns dict: {part_key: {criteria: [], notes: str|None, max_pts: int}}

    The 2025 SG PDFs have a 2-column layout (0-points | 1-point).
    We use right-column extraction (via bounding box) to get clean 1-point criteria.
    """
    # Split into Q1 and Q2 sections
    q1_pages = []
    q2_pages = []
    q1_page_nums = []
    q2_page_nums = []
    in_q2 = False

    for i, (pnum, text) in enumerate(sg_pages):
        if re.search(r'^FRQ 2:', text, re.MULTILINE | re.IGNORECASE):
            in_q2 = True
        if in_q2:
            q2_pages.append((i, pnum, text))
            q2_page_nums.append(i)
        else:
            q1_pages.append((i, pnum, text))
            q1_page_nums.append(i)

    target_pages = q2_pages if frq_num == 2 else q1_pages
    target_text = '\n\n'.join(t for _, _, t in target_pages)

    result = {}

    # For each page in this FRQ's SG section, extract part info
    for page_local_idx, (global_idx, pnum, text) in enumerate(target_pages):
        # Determine part letter(s) on this page
        # Each 2025 SG page typically covers one part
        part_match = re.search(r'\bPart\s+([A-F])\s*(?:\(([ivx]{1,3})\))?',
                                text, re.IGNORECASE)
        if not part_match:
            continue

        part_letter = part_match.group(1).upper()
        sub_num = part_match.group(2)
        part_key = f'{part_letter}_{sub_num}' if sub_num else part_letter

        # Detect max points
        max_pts = 1
        if re.search(r'0 points\s+1 point\s+2 points', text[:600]):
            max_pts = 2

        criteria = []
        notes = None

        # Use right-column extraction if sg_pdf_path is available
        # pnum is 1-indexed PDF page number; convert to 0-indexed for PyMuPDF/pdfplumber
        pdf_page_idx = pnum - 1
        if sg_pdf_path:
            right_col = extract_right_column_from_page(sg_pdf_path, pdf_page_idx)
            if right_col:
                criteria = extract_criteria_from_right_column(right_col, part_letter, max_pts)

        # Fallback: extract from full merged text using best-effort
        if not criteria:
            criteria = extract_criteria_from_merged_sg_text(text, part_letter, max_pts)

        if not criteria:
            criteria = [f'Correctly responds to Part {part_letter}.']

        # Additional notes from full text
        note_match = re.search(r'Additional Notes?:(.*?)(?=Reporting|AP®|\Z)',
                                text, re.DOTALL | re.IGNORECASE)
        if note_match:
            note_text = note_match.group(1).strip()
            note_text = re.sub(r'\s+', ' ', note_text).strip()
            notes = note_text[:400] if note_text else None

        result[part_key] = {
            'criteria': criteria[:5],
            'notes': notes,
            'max_pts': max_pts,
        }

    return result


def extract_criteria_from_right_column(right_col_text, part_letter, max_pts):
    """
    Extract criteria from right-column (earn-point side) of 2025 SG.

    Right column structure:
    - "Scoring Criteria" / "1 point" (header - skip)
    - "[Description of what earns the point]" (1-2 lines)
    - "Rules and Scoring Notes" (skip)
    - "Responses that earn this point:" (header)
    - bullet criteria (keep)
    - "Examples that earn this point:" (header)
    - quoted example bullets (keep, strip leading junk from left column)
    """
    criteria = []
    lines = right_col_text.split('\n')

    in_description = False
    in_earn_bullets = False
    in_examples = False
    description_lines = []
    current_bullet = None

    skip_patterns = re.compile(
        r'^(Scoring Criteria|1 point|2 points|Rules and Scoring Notes|'
        r'Responses that earn this point:|Examples that earn this point:|'
        r'Examples that earn \d+ points:|©|AP®)',
        re.IGNORECASE
    )

    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue

        if re.search(r'Scoring Criteria', stripped, re.IGNORECASE) and len(stripped) < 30:
            in_description = True
            in_earn_bullets = False
            in_examples = False
            continue

        if re.search(r'^(1 point|2 points)\s*$', stripped, re.IGNORECASE):
            in_description = True
            in_earn_bullets = False
            in_examples = False
            continue

        if re.search(r'Rules and Scoring Notes', stripped, re.IGNORECASE):
            in_description = False
            continue

        if re.search(r'Responses that earn (this point|1 point|2 points):', stripped, re.IGNORECASE):
            in_earn_bullets = True
            in_description = False
            in_examples = False
            current_bullet = None
            continue

        if re.search(r'earn \d+ points?:|earn this point:', stripped, re.IGNORECASE) and \
                re.search(r'Examples', stripped, re.IGNORECASE):
            if current_bullet:
                criteria.append(current_bullet[:250])
                current_bullet = None
            in_examples = True
            in_earn_bullets = False
            continue

        if re.search(r'Additional Notes?', stripped, re.IGNORECASE):
            break

        if stripped.startswith('©') or stripped.startswith('AP®'):
            continue

        if in_description:
            # These are the header descriptions of what earns the point
            # Clean away left-column fragments (short word fragments appearing at start)
            if len(stripped) > 20:
                description_lines.append(stripped)

        elif in_earn_bullets:
            # Bullet criteria lines — bullet may have left-col garbage before it
            bullet_pos = -1
            for bi, bc in enumerate(stripped):
                if bc in '\u2022\u2023':
                    bullet_pos = bi
                    break
            if bullet_pos >= 0:
                if current_bullet:
                    criteria.append(current_bullet[:250])
                # Everything after the bullet marker is the criterion
                current_bullet = stripped[bullet_pos:].lstrip('\u2022\u2023 ').strip()
            elif current_bullet:
                # Continuation line — strip potential left-col fragments (very short leading word)
                # If line starts with 1-2 short words followed by a longer portion, strip them
                cont = re.sub(r'^(?:[a-z]{1,6}\s){1,2}(?=[A-Z])', '', stripped)
                if len(cont) > 10:
                    current_bullet += ' ' + cont
                elif len(stripped) > 10:
                    current_bullet += ' ' + stripped
            elif len(stripped) > 20:
                # Non-bullet but substantive — might be left-col fragment mixed in
                # Only include if it looks like a complete sentence
                if re.match(r'^The response (proposes|accurately|uses|identifies|states)',
                             stripped, re.IGNORECASE):
                    current_bullet = stripped

        elif in_examples:
            # Example bullets — bullet may have left-col garbage before it
            bullet_pos = -1
            for bi, bc in enumerate(stripped):
                if bc in '\u2022\u2023':
                    bullet_pos = bi
                    break
            if bullet_pos >= 0:
                if current_bullet:
                    criteria.append(current_bullet[:250])
                    current_bullet = None
                item = stripped[bullet_pos:].lstrip('\u2022\u2023 ').strip()
                if len(item) < 10:
                    continue
                # Remove leading quote markers
                item_clean = re.sub(r'^["\u201c]', '', item.strip()).strip()
                if len(item_clean) > 15:
                    current_bullet = item_clean
            elif current_bullet:
                # Continuation of example — strip left-col fragments
                clean_cont = re.sub(r'^["\u201c]', '', stripped).strip()
                clean_cont = re.sub(r'^(?:[a-z]{1,6}\s){1,2}(?=[A-Z])', '', clean_cont)
                if len(clean_cont) > 5:
                    current_bullet += ' ' + clean_cont
            else:
                # Could be left-column interference — short stray words
                pass

    if current_bullet:
        criteria.append(current_bullet[:250])

    # If no bullet criteria found but we have description, use it
    if not criteria and description_lines:
        for desc in description_lines[:2]:
            # Clean up mixed-column fragments (short words at beginning)
            clean_desc = re.sub(r'^\w{1,4}\s+', '', desc).strip()
            if len(clean_desc) > 20:
                criteria.append(clean_desc[:250])

    return criteria


def extract_criteria_from_merged_sg_text(text, part_letter, max_pts):
    """Fallback: extract criteria from merged (2-column interleaved) SG text."""
    criteria = []

    # Look for "Responses that earn this point:" section
    earn_match = re.search(
        r'Responses that earn this point:(.*?)(?=Examples that do not earn|Examples that earn|\Z)',
        text, re.DOTALL | re.IGNORECASE
    )
    if earn_match:
        earn_text = earn_match.group(1)
        current = None
        for line in earn_text.split('\n'):
            s = line.strip()
            if not s:
                continue
            if s.startswith(('\u2022', '\u2023')):
                if current:
                    criteria.append(current[:250])
                current = s.lstrip('\u2022\u2023 ')
            elif current:
                current += ' ' + s
        if current:
            criteria.append(current[:250])

    # Extract quoted examples from "earn" section
    earn_ex_match = re.search(
        r'Examples that earn(?:\s+\d+\s+points?)?:(.*?)(?=Examples that|Additional|©|\Z)',
        text, re.DOTALL | re.IGNORECASE
    )
    if earn_ex_match:
        for line in earn_ex_match.group(1).split('\n'):
            s = line.strip()
            if s.startswith(('\u2022', '\u2023')):
                s_clean = s.lstrip('\u2022\u2023 ')
                if s_clean.startswith(('"', '\u201c')):
                    clean = s_clean.strip('\u201c\u201d"')
                    if clean and len(clean) > 15 and clean not in criteria:
                        criteria.append(clean[:200])

    return criteria


def build_2025_frq_json(year, set_num, frq_num, q_text, sg_pages, sg_pdf_path=None):
    """Build JSON for a 2025-format FRQ."""
    frq_id = f'psych-{year}-set{set_num}-frq-{frq_num}'
    sg_data = parse_2025_sg(sg_pages, frq_num, sg_pdf_path=sg_pdf_path)

    parts = []

    if frq_num == 1:
        # AAQ: 6 parts A-F
        part_defs, stimulus = parse_2025_aaq_parts(q_text)
        title = 'Article Analysis Question (AAQ)'

        part_order = ['A', 'B', 'C', 'D', 'E', 'F']
        for part_label in part_order:
            prompt = part_defs.get(part_label, '')
            if not prompt:
                continue

            sg_info = sg_data.get(part_label, {})
            criteria = sg_info.get('criteria', [f'Correctly responds to Part {part_label}.'])
            notes = sg_info.get('notes')
            max_pts = sg_info.get('max_pts', 1)

            parts.append({
                'letter': part_label.lower(),
                'prompt': prompt,
                'point_value': max_pts,
                'rubric_criteria': criteria,
                'scoring_notes': notes,
                'requires_drawing': False,
                'reference_image': None,
            })

    else:
        # EBQ: parts A, Bi, Bii, Ci, Cii
        main_question, part_defs, stimulus = parse_2025_ebq_parts(q_text)
        title = 'Evidence-Based Question (EBQ)'

        # Default prompts if parsing missed them
        default_prompts = {
            'A': 'Propose a specific and defensible claim based in psychological science that responds to the question.',
            'B_i': 'Support your claim using at least one piece of specific and relevant evidence from one of the sources. Cite the source used.',
            'B_ii': 'Explain how the evidence from Part B(i) supports your claim using a psychological perspective, theory, concept, or research finding learned in AP Psychology.',
            'C_i': 'Support your claim using an additional piece of specific and relevant evidence from a different source than the one used in Part B(i). Cite the source used.',
            'C_ii': 'Explain how the evidence from Part C(i) supports your claim using a different psychological perspective, theory, concept, or research finding than the one used in Part B(ii).',
        }

        ebq_parts = [
            ('A', 'a'),
            ('B_i', 'b'),
            ('B_ii', 'c'),
            ('C_i', 'd'),
            ('C_ii', 'e'),
        ]

        for sg_key, letter in ebq_parts:
            prompt = part_defs.get(sg_key, '') or default_prompts.get(sg_key, '')

            sg_info = sg_data.get(sg_key, {})
            criteria = sg_info.get('criteria', [f'Correctly responds to this part.'])
            notes = sg_info.get('notes')
            max_pts = sg_info.get('max_pts', 1)

            parts.append({
                'letter': letter,
                'prompt': prompt,
                'point_value': max_pts,
                'rubric_criteria': criteria,
                'scoring_notes': notes,
                'requires_drawing': False,
                'reference_image': None,
            })

    all_text = q_text + ' ' + ' '.join(t for _, t in sg_pages)
    units = identify_units(all_text)

    return {
        'id': frq_id,
        'subject': 'ap-psychology',
        'year': year,
        'source': 'released',
        'title': title,
        'frq_type': 'multi_part_text',
        'related_units': units,
        'calculator_allowed': False,
        'total_points': 7,
        'stimulus': stimulus,
        'stimulus_image': None,
        'documents': None,
        'parts': parts,
    }


# ─────────────────────────────────────────────
# MAIN PROCESSING
# ─────────────────────────────────────────────

def process_exam(year, set_num, q_filename, sg_filename):
    """Process one exam (year + set)."""
    q_path = os.path.join(QUESTIONS_DIR, q_filename)
    sg_path = os.path.join(SG_DIR, sg_filename)

    if not os.path.exists(q_path):
        print(f'  SKIP {year} set {set_num}: questions PDF not found ({q_filename})')
        return []
    if not os.path.exists(sg_path):
        print(f'  SKIP {year} set {set_num}: SG PDF not found ({sg_filename})')
        return []

    print(f'\nProcessing {year} Set {set_num}...')

    q_pages_raw = extract_pdf_pages(q_path)
    sg_pages_raw = extract_pdf_pages(sg_path)

    q_pages = get_question_pages(q_pages_raw)
    sg_pages = get_sg_pages(sg_pages_raw)

    filenames = []

    if year == 2025:
        q1_text, q2_text = split_2025_questions(q_pages)

        for frq_num, q_text in [(1, q1_text), (2, q2_text)]:
            if not q_text.strip():
                print(f'  SKIP FRQ {frq_num}: no question text')
                continue

            frq_json = build_2025_frq_json(year, set_num, frq_num, q_text, sg_pages,
                                              sg_pdf_path=sg_path)

            filename = f'psych-{year}-set{set_num}-frq-{frq_num}'
            out_path = os.path.join(OUTPUT_DIR, f'{filename}.json')
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(frq_json, f, indent=2, ensure_ascii=False)

            print(f'  {filename}.json — {len(frq_json["parts"])} parts, '
                  f'{frq_json["total_points"]} pts, units {frq_json["related_units"]}')
            filenames.append(filename)

    else:
        # 2021-2024 traditional format
        q1_text, q2_text = split_traditional_questions(q_pages)

        for frq_num, q_text in [(1, q1_text), (2, q2_text)]:
            if not q_text.strip():
                print(f'  SKIP FRQ {frq_num}: no question text')
                continue

            sg_entries = parse_traditional_sg(sg_pages, frq_num)
            all_text = q_text + ' ' + ' '.join(t for _, t in sg_pages)
            frq_json = build_traditional_frq_json(year, set_num, frq_num, q_text, sg_entries, all_text)

            filename = f'psych-{year}-set{set_num}-frq-{frq_num}'
            out_path = os.path.join(OUTPUT_DIR, f'{filename}.json')
            with open(out_path, 'w', encoding='utf-8') as f:
                json.dump(frq_json, f, indent=2, ensure_ascii=False)

            print(f'  {filename}.json — {len(frq_json["parts"])} parts, '
                  f'{frq_json["total_points"]} pts, units {frq_json["related_units"]}')
            filenames.append(filename)

    return filenames


def main():
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    os.makedirs(os.path.join(OUTPUT_DIR, 'images'), exist_ok=True)

    all_filenames = []

    for year, set_num, q_fname, sg_fname in EXAM_FILES:
        filenames = process_exam(year, set_num, q_fname, sg_fname)
        all_filenames.extend(filenames)

    manifest_path = os.path.join(OUTPUT_DIR, 'manifest.json')
    with open(manifest_path, 'w', encoding='utf-8') as f:
        json.dump(all_filenames, f, indent=2)

    print(f'\nDone! Generated {len(all_filenames)} FRQ files.')
    print(f'Manifest: {manifest_path}')
    return all_filenames


if __name__ == '__main__':
    main()
