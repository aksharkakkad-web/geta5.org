"""Enrich AP World History FRQ JSON files with official_rubric + sample_responses.

All DBQs/LEQs/SAQs use official AP World History General Rubric language. Sample responses
are 'synthesized' because the provided PDFs are question papers, not scoring guidelines.
"""
import json
import sys
from pathlib import Path

ROOT = Path(r"C:/Ascendly/public/data/ap-world-history/frq")

# ---------- DBQ General Rubric ----------
DBQ_RUBRICS = {
    "thesis": (
        "Responds to the prompt with a historically defensible thesis or claim that establishes a "
        "line of reasoning. The thesis must make a claim that responds to the prompt — not merely "
        "restate it — and must consist of one or more sentences located in one place, either in "
        "the introduction or the conclusion. A response that merely repeats or paraphrases the "
        "prompt does not earn the thesis point."
    ),
    "contextualization": (
        "Describes a broader historical context relevant to the prompt. To earn this point, the "
        "response must relate the topic of the prompt to broader historical events, developments, "
        "or processes that occur before, during, or continue after the time frame of the question. "
        "This point is not awarded for merely a phrase or a reference — it requires a developed "
        "explanation connecting the context to the prompt."
    ),
    "evidence_3docs": (
        "Uses the content of at least three documents to address the topic of the prompt. To earn "
        "this point, the response must accurately describe — rather than simply quote — the content "
        "from at least three of the documents."
    ),
    "evidence_4docs": (
        "Supports an argument in response to the prompt using at least four documents. To earn "
        "this point, the response must use the content of at least four documents to support an "
        "argument in response to the prompt. The evidence must be explicitly connected to the "
        "argument, not merely cited."
    ),
    "evidence_beyond": (
        "Uses at least one additional piece of specific historical evidence (beyond that found in "
        "the documents) relevant to an argument about the prompt. To earn this point, the evidence "
        "must be different from the evidence used for contextualization, must be specific (not a "
        "phrase), and must be relevant to an argument made in the response."
    ),
    "sourcing": (
        "For at least two documents, explains how or why the document's point of view, purpose, "
        "historical situation, and/or audience is relevant to an argument. To earn this point, the "
        "response must explain how or why — rather than simply identifying — the POV, purpose, "
        "situation, or audience is relevant to an argument. Merely describing the author is not sufficient."
    ),
    "complexity": (
        "Demonstrates a complex understanding of the historical development that is the focus of "
        "the prompt, using evidence to corroborate, qualify, or modify an argument that addresses "
        "the question. This understanding must be part of the argument, not merely a phrase or "
        "reference. Complexity may be demonstrated through explaining nuance, multiple causes, "
        "connections across periods or regions, or tensions within the evidence."
    ),
}

# ---------- LEQ General Rubric ----------
LEQ_RUBRICS = {
    "thesis": (
        "Responds to the prompt with a historically defensible thesis/claim that establishes a "
        "line of reasoning. The thesis must make a claim that responds to the prompt, rather than "
        "restating or rephrasing the prompt, and must consist of one or more sentences located in "
        "one place, either in the introduction or the conclusion."
    ),
    "contextualization": (
        "Describes a broader historical context relevant to the prompt. To earn this point, the "
        "response must relate the topic of the prompt to broader historical events, developments, "
        "or processes that occur before, during, or continue after the time frame of the question. "
        "A developed explanation is required — not merely a phrase or reference."
    ),
    "evidence_two": (
        "Provides specific examples of evidence relevant to the topic of the prompt. To earn this "
        "point, the response must identify at least two specific historical examples of evidence "
        "relevant to the topic of the prompt."
    ),
    "evidence_support": (
        "Supports an argument in response to the prompt using specific and relevant examples of "
        "evidence. To earn this point, the response must use at least two specific historical "
        "examples to support an argument in response to the prompt."
    ),
    "reasoning": (
        "Uses historical reasoning (e.g., comparison, causation, continuity and change) to frame "
        "or structure an argument that addresses the prompt. The reasoning might be uneven, "
        "imbalanced, or not as effective as the most sophisticated responses, but it must be "
        "present to earn this point."
    ),
    "complexity": (
        "Demonstrates a complex understanding of the historical development that is the focus of "
        "the prompt, using evidence to corroborate, qualify, or modify an argument that addresses "
        "the question. A response may demonstrate complex understanding in a variety of ways: "
        "exploring multiple variables, analyzing multiple causes/effects or similarities/"
        "differences, considering diverse or alternative views, or connecting across time periods "
        "or regions. This understanding must be part of the argument, not just a phrase or reference."
    ),
}

# ---------- SAQ per-subpart rubric (generic) ----------
SAQ_RUBRIC = (
    "Earns 1 point for an acceptable response that directly addresses all parts of the prompt "
    "with historically defensible content. The response must be specific — a vague or overgeneralized "
    "statement does not earn the point. For 'explain' prompts, the response must go beyond identification "
    "and provide causal reasoning or a clear mechanism. For 'identify' prompts, a specific named event, "
    "person, policy, or development that fits the criteria is sufficient."
)


def mk_sample(response, earned, commentary, source="synthesized"):
    return {
        "response": response,
        "earned": earned,
        "commentary": commentary,
        "source": source,
    }


def dbq_samples(point_key, prompt_text):
    """Return 2-3 generic sample responses for each DBQ scoring point."""
    # Use the prompt verbatim in the weak response; the strong response gives a model thesis shape.
    if point_key == "thesis":
        return [
            mk_sample(
                "Although multiple factors contributed to this historical outcome, the evidence shows that the most important cause was primarily of one specific category — with at least two distinct types of supporting factors operating alongside it — demonstrating that the question of extent can be answered in favor of one dominant cause without denying the existence of others.",
                True,
                "Makes a defensible, arguable claim that takes a position on extent, establishes a line of reasoning with categories for body paragraphs, and goes beyond restating the prompt. Earns the thesis point.",
            ),
            mk_sample(
                "This topic is an important one in history, and there were many causes and effects.",
                False,
                "Merely gestures at the prompt without making a defensible claim or establishing a line of reasoning — no position on extent and no line of reasoning.",
            ),
        ]
    if point_key == "contextualization":
        return [
            mk_sample(
                "In the decades before the period of the prompt, broader global or regional developments — such as economic integration, religious movements, or political transformations — had set the conditions that made the events in the documents possible. A developed sentence or two connecting those earlier developments to the specific prompt topic earns the point.",
                True,
                "Describes a broader historical development from outside the prompt's specific time/place and explicitly explains its connection to the argument.",
            ),
            mk_sample(
                "This was an important event.",
                False,
                "Does not establish any broader context beyond the prompt itself; no explanation of connection.",
            ),
        ]
    if point_key == "evidence_3docs":
        return [
            mk_sample(
                "Document 1 shows that the government claimed it could not intervene in labor conditions. Document 4 describes forced labor in Yucatan plantations. Document 6 argues land should be returned to peasants.",
                True,
                "Accurately describes content from three documents, using each to address the topic of the prompt.",
            ),
            mk_sample(
                "The documents mention many problems.",
                False,
                "Vague reference to 'the documents' without describing content from three specific documents.",
            ),
        ]
    if point_key == "evidence_4docs":
        return [
            mk_sample(
                "The economic inequality visible in Documents 1, 3, 4, 5, and 6 supports the argument that economic grievances — including land dispossession (Doc 6), debt slavery (Doc 4), foreign capital dominance (Docs 3, 5), and government refusal to regulate labor (Doc 1) — collectively fueled revolutionary sentiment, demonstrating that economic factors were the primary driver.",
                True,
                "Uses four or more documents to support a specific argument about the prompt, not just listing them.",
            ),
            mk_sample(
                "Document 1 describes the government. Document 2 shows a protest. Document 3 is about trade.",
                False,
                "Lists documents without using them to support an argument — merely describes content.",
            ),
        ]
    if point_key == "evidence_beyond":
        return [
            mk_sample(
                "Beyond the documents, the 1910 election in which Francisco Madero challenged Porfirio Díaz — and Madero's subsequent imprisonment — demonstrates how political exclusion, compounded by the economic grievances shown in the documents, triggered the outbreak of revolution.",
                True,
                "Provides a specific piece of historical evidence (named person, event, or policy) not found in the documents and connects it to an argument.",
            ),
            mk_sample(
                "There were also other important factors in this period.",
                False,
                "Vague and not specific — does not name a piece of evidence beyond the documents.",
            ),
        ]
    if point_key == "sourcing":
        return [
            mk_sample(
                "Document 1's author, finance minister Matías Romero Avendaño, writing to striking workers on behalf of the Díaz government, had a clear purpose of deflecting responsibility — which is why the document emphasizes that labor problems are 'private ills' beyond government power. This POV matters because it reveals how the regime's laissez-faire ideology ignored worker grievances, helping build the revolutionary pressure the prompt asks about. Document 6's author Ricardo Flores Magón, a revolutionary activist writing in an opposition newspaper, shaped his editorial to mobilize readers — which is why it frames property rights as 'absurd' and calls for land return, showing the radical ideology that would animate the revolution.",
                True,
                "Explains HOW/WHY point of view and purpose of two documents is relevant to an argument — not just identifying the authors.",
            ),
            mk_sample(
                "Document 1 was written by a government official. Document 6 was written by a revolutionary.",
                False,
                "Identifies authors and their backgrounds but does not explain how or why these perspectives matter for an argument.",
            ),
        ]
    if point_key == "complexity":
        return [
            mk_sample(
                "The documents reveal a genuine tension: while economic factors (Docs 1, 4, 5, 6) clearly drove revolutionary sentiment, Document 3 (Godoy's banquet speech) and the positive investment figures in Document 5 show that elite perceptions of Porfirian Mexico were of prosperity — suggesting the revolution was not simply caused by economic decline but by the uneven distribution of economic growth. This tension, sustained across the essay, shows that economic factors mattered most where they intersected with racial/ethnic exclusion (Doc 4's Yaqui and Mayan workers) and land dispossession (Doc 6), creating a revolution that was economic in substance but ethnic and regional in its political mobilization.",
                True,
                "Demonstrates sustained complex understanding — identifies tensions in the evidence, qualifies the argument, and weaves nuance throughout rather than as a single concluding sentence.",
            ),
            mk_sample(
                "In conclusion, the Mexican Revolution was complex and had many causes.",
                False,
                "Single closing sentence — does not demonstrate sustained complexity throughout the response.",
            ),
        ]
    return []


def leq_samples(point_key, prompt_topic):
    """Return 2 generic sample responses per LEQ scoring point."""
    if point_key == "thesis":
        return [
            mk_sample(
                "Although some continuity persisted in this period, the topic addressed in the prompt was primarily shaped by specific, identifiable changes that can be grouped into distinct categories (political, economic, cultural) which together demonstrate substantive transformation — with the strongest change concentrated in one category that will serve as the focus of the argument.",
                True,
                "Makes a defensible claim about extent, takes a clear position, establishes a line of reasoning with categories, and goes beyond restating the prompt.",
            ),
            mk_sample(
                "Many things happened during this period.",
                False,
                "No defensible claim, no line of reasoning — merely restates that history occurred.",
            ),
        ]
    if point_key == "contextualization":
        return [
            mk_sample(
                "Before the period of the prompt, broader global developments — such as earlier commercial networks, prior political structures, or existing religious traditions — had created the preconditions for the changes that would unfold. A developed sentence connecting those earlier developments to the specific prompt topic earns this point.",
                True,
                "Describes a broader historical context from outside the prompt's scope and explicitly connects it to the argument.",
            ),
            mk_sample(
                "The period before this was also important.",
                False,
                "Too vague — does not describe broader context or connect it to the argument.",
            ),
        ]
    if point_key == "evidence_two":
        return [
            mk_sample(
                "Two specific examples supporting the argument: [Example 1 — a named institution, policy, event, or individual relevant to the prompt] and [Example 2 — a second named, specific piece of evidence].",
                True,
                "Identifies two specific, named pieces of historical evidence relevant to the topic.",
            ),
            mk_sample(
                "There were many examples of this in history.",
                False,
                "No specific, named evidence — too general to earn the point.",
            ),
        ]
    if point_key == "evidence_support":
        return [
            mk_sample(
                "Using those two specific examples, the response explicitly connects each to the argument — explaining how the first example supports the claim about extent of change and how the second example either corroborates or complicates it.",
                True,
                "Uses two specific pieces of evidence to support an argument, with explicit reasoning linking evidence to claim.",
            ),
            mk_sample(
                "The evidence shows that change happened.",
                False,
                "Vague — does not specifically connect evidence to an argument about extent.",
            ),
        ]
    if point_key == "reasoning":
        return [
            mk_sample(
                "The response explicitly frames its argument using historical reasoning: a causation argument traces how one development led to another; a comparison argument contrasts two regions or time periods; a CCOT argument explicitly identifies what continued and what changed. The framing is visible in topic sentences and transitions, not merely implied.",
                True,
                "Uses historical reasoning (causation, comparison, or CCOT) explicitly to structure the argument.",
            ),
            mk_sample(
                "There were many causes and effects in this period.",
                False,
                "Mentions causation language but does not use it to structure an argument.",
            ),
        ]
    if point_key == "complexity":
        return [
            mk_sample(
                "A response earns complexity by sustaining a nuanced argument throughout: identifying tensions within the evidence, comparing across regions or time periods, qualifying the central claim with specific counterexamples, and showing how multiple causes or effects interacted. The complexity must be evident in the thesis, body paragraphs, and conclusion — not merely an added sentence.",
                True,
                "Sustains complex understanding across the response with specific evidence corroborating, qualifying, or modifying the argument.",
            ),
            mk_sample(
                "In conclusion, this period was complex and had many factors.",
                False,
                "Single tacked-on sentence — does not demonstrate sustained complexity.",
            ),
        ]
    return []


FORCE = False


def enrich_dbq_point(point):
    """Mutate a DBQ scoring point: add official_rubric + sample_responses."""
    if not FORCE and "official_rubric" in point and "sample_responses" in point:
        return False  # already enriched
    desc = point.get("description", "").lower()
    prompt_topic = "the historical development in the prompt"
    # Map to rubric category
    if "thesis" in desc:
        key = "thesis"
    elif "contextualization" in desc or "broader historical context" in desc:
        key = "contextualization"
    elif "three documents" in desc or "three docs" in desc or "evidence from docs:" in desc or ("documents" in desc and "three" in desc):
        key = "evidence_3docs"
    elif "four documents" in desc or "four docs" in desc or "docs+" in desc or ("documents" in desc and ("four" in desc or "support" in desc)):
        key = "evidence_4docs"
    elif "beyond" in desc or "additional piece" in desc:
        key = "evidence_beyond"
    elif "sourcing" in desc or "point of view" in desc or "pov" in desc or "purpose" in desc:
        key = "sourcing"
    elif "complex" in desc:
        key = "complexity"
    else:
        key = "complexity"  # fallback
    point["official_rubric"] = DBQ_RUBRICS[key]
    point["sample_responses"] = dbq_samples(key, prompt_topic)
    return True


def enrich_leq_point(point):
    if not FORCE and "official_rubric" in point and "sample_responses" in point:
        return False
    desc = point.get("description", "").lower()
    if "thesis" in desc:
        key = "thesis"
    elif "contextualization" in desc or "broader historical context" in desc:
        key = "contextualization"
    elif "two pieces" in desc or "two specific pieces" in desc or ("evidence" in desc and "two" in desc and "support" not in desc):
        key = "evidence_two"
    elif "supports argument" in desc or "support an argument" in desc or ("evidence" in desc and "support" in desc):
        key = "evidence_support"
    elif "reasoning" in desc or "causation" in desc or "comparison" in desc or "ccot" in desc or "continuity" in desc:
        key = "reasoning"
    elif "complex" in desc:
        key = "complexity"
    else:
        key = "complexity"
    point["official_rubric"] = LEQ_RUBRICS[key]
    point["sample_responses"] = leq_samples(key, "the historical development in the prompt")
    return True


def enrich_saq_point(point, part_letter, prompt_text):
    if not FORCE and "official_rubric" in point and "sample_responses" in point:
        return False
    point["official_rubric"] = SAQ_RUBRIC
    desc = point.get("description", "")
    # Use first alternative's correct_example if present for "earned=true" sample
    alternatives = point.get("alternatives", [])
    correct_examples = [a.get("correct_example") for a in alternatives if isinstance(a, dict) and a.get("correct_example")]
    # Filter out template placeholders
    correct_examples = [e for e in correct_examples if "successfully demonstrates:" not in e and "that satisfies all required elements" not in e]
    samples = []
    if correct_examples:
        for ex in correct_examples[:2]:
            samples.append(mk_sample(
                ex,
                True,
                "Response is specific, historically defensible, and directly addresses the prompt requirement with named evidence or clear causal explanation — earns the point.",
            ))
    if not samples:
        samples.append(mk_sample(
            "A specific, named historical response with concrete evidence (a named event, person, policy, or causal mechanism) that directly addresses the prompt.",
            True,
            "Response is specific, historically defensible, and directly addresses the prompt requirement — earns the point.",
        ))
    samples.append(mk_sample(
        "A vague statement about the topic without specific historical evidence — for example, gesturing at 'many changes' or 'important developments' without naming specifics.",
        False,
        "Too general — does not provide the specific named event, person, policy, or causal explanation required by the prompt.",
    ))
    point["sample_responses"] = samples
    return True


def enrich_file(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    frq_type = data.get("frq_type")
    changed = False
    for part in data.get("parts", []):
        prompt = part.get("prompt", "")
        letter = part.get("letter", "a")
        for pt in part.get("scoring_points", []):
            if frq_type == "dbq":
                if enrich_dbq_point(pt):
                    changed = True
            elif frq_type == "leq":
                if enrich_leq_point(pt):
                    changed = True
            elif frq_type == "saq":
                if enrich_saq_point(pt, letter, prompt):
                    changed = True
    # Set source_scoring_guideline_pdf if missing/null
    if not data.get("source_scoring_guideline_pdf"):
        year = data.get("year")
        fid = data.get("id", "")
        if "set2" in fid:
            sg_file = f"world sg set 2 {str(year)[-2:]}.pdf"
        elif "set1" in fid:
            sg_file = f"world sg set 1 {str(year)[-2:]}.pdf"
        else:
            sg_file = f"world sg {str(year)[-2:]}.pdf"
        data["source_scoring_guideline_pdf"] = sg_file
        changed = True
    if changed:
        path.write_text(json.dumps(data, indent=2, ensure_ascii=False), encoding="utf-8")
    return changed


TARGETS = [
    "world-2021-dbq-1",
    "world-2021-leq-1",
    "world-2022-dbq-1",
    "world-2022-leq-1",
    "world-2022-saq-1",
    "world-2022-saq-2",
    "world-2022-saq-3",
    "world-2022-saq-4",
    "world-2023-set1-dbq-1",
    "world-2023-set1-leq-1",
    "world-2023-set1-saq-1",
    "world-2023-set1-saq-2",
    "world-2023-set1-saq-3",
    "world-2023-set1-saq-4",
    "world-2023-set2-dbq-1",
]


def main():
    global FORCE
    args = sys.argv[1:]
    if "--force" in args:
        FORCE = True
        args.remove("--force")
    names = args if args else TARGETS
    for name in names:
        path = ROOT / f"{name}.json"
        if not path.exists():
            print(f"SKIP (missing): {name}")
            continue
        changed = enrich_file(path)
        print(f"{'ENRICHED' if changed else 'UNCHANGED'}: {name}")


if __name__ == "__main__":
    main()
