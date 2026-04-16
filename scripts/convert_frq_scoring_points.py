#!/usr/bin/env python3
"""
Convert AP World History FRQ rubric_criteria to scoring_points format.
Uses College Board scoring guidelines PDFs for 2024/2025,
and converts rubric_criteria strings for 2021-2023.
"""
import sys
import json
import os
import re
sys.stdout.reconfigure(encoding='utf-8')

FRQ_DIR = r"C:\Ascendly\public\data\ap-world-history\frq"

# ─── SHARED WRONG EXAMPLES / COMMON TRAPS ────────────────────────────────────
SAQ_WRONG_EXAMPLES = [
    "A vague statement without specific historical evidence.",
    "Restating the prompt without providing a defensible response.",
    "Providing an example not relevant to the specific period or region asked.",
]
SAQ_COMMON_TRAPS = [
    "Identifies a person or event without explaining its historical relevance.",
    "Provides multiple examples when only one is needed — focus on quality not quantity.",
]

DBQ_THESIS_WRONG = [
    "A simple restatement of the prompt without taking a position.",
    "A vague claim that does not establish a line of reasoning.",
    "An overgeneralized statement not tied to the specific prompt.",
]
DBQ_THESIS_TRAPS = [
    "Thesis placed in the body of the essay may not be recognized — must be intro or conclusion.",
    "Simply listing facts without making an argument does not earn this point.",
]
DBQ_CONTEXT_WRONG = [
    "A passing reference to a historical event without elaboration.",
    "Context that is not relevant to the specific prompt.",
    "An overgeneralized statement about the entire time period.",
]
DBQ_CONTEXT_TRAPS = [
    "Context must be more than a single sentence — requires elaboration.",
    "Must be connected to the argument, not just mentioned in passing.",
]
DBQ_EVIDENCE_DOCS_WRONG = [
    "Using fewer than three documents.",
    "Simply quoting document text without describing or analyzing it.",
    "Misinterpreting a document's content.",
    "Addressing documents collectively rather than discussing each separately.",
]
DBQ_EVIDENCE_DOCS_TRAPS = [
    "Description, not quotation — must explain what the document shows or argues.",
    "Two correctly used documents does not earn either document evidence point.",
]
DBQ_EVIDENCE_BEYOND_WRONG = [
    "Repeating information already found in the documents.",
    "A vague reference to an event without specific elaboration.",
    "Evidence outside the time period or region of the prompt.",
]
DBQ_EVIDENCE_BEYOND_TRAPS = [
    "Evidence must be specific — general statements about the era do not qualify.",
    "Evidence must differ from what was used for contextualization.",
]
DBQ_SOURCING_WRONG = [
    "Simply identifying the author's occupation without explaining relevance to an argument.",
    "Summarizing document content as 'sourcing' without addressing POV/purpose/situation/audience.",
    "Sourcing only one document.",
]
DBQ_SOURCING_TRAPS = [
    "Must EXPLAIN relevance — not just identify who the author is.",
    "Connect sourcing to a specific argument, not just a general observation.",
]
DBQ_COMPLEXITY_WRONG = [
    "A passing mention of complexity without substantive development.",
    "Simply stating 'there were multiple perspectives' without elaborating.",
    "Using only 5–6 documents and claiming complexity without other demonstration.",
]
DBQ_COMPLEXITY_TRAPS = [
    "Complexity must be part of the sustained argument, not tacked on at the end.",
    "Must be more than a phrase or reference — requires substantive development.",
]

LEQ_REASONING_WRONG = [
    "Providing evidence without any reasoning connecting it to an argument.",
    "Asserting use of historical reasoning without actually demonstrating it.",
]
LEQ_REASONING_TRAPS = [
    "Reasoning must STRUCTURE an argument — not just be mentioned.",
    "Can be uneven — even imperfect historical reasoning earns this point.",
]


# ─── HELPER: build SAQ scoring_points for one part ───────────────────────────
def saq_point(letter, description, alternatives):
    return [{
        "point_id": f"{letter}1",
        "point_value": 1,
        "description": description,
        "alternatives": alternatives,
        "wrong_examples": SAQ_WRONG_EXAMPLES,
        "common_traps": SAQ_COMMON_TRAPS,
    }]


# ─── HELPER: build standard 7-pt DBQ scoring_points ──────────────────────────
def dbq_points(thesis_ex, context_ex, beyond_ex, sourcing_ex, complexity_ex):
    alts = lambda exs: [{"required_elements": [e], "correct_example": e} for e in exs]
    return [
        {
            "point_id": "a1",
            "point_value": 1,
            "description": "Thesis/Claim: Responds with a historically defensible thesis that establishes a line of reasoning.",
            "alternatives": alts(thesis_ex),
            "wrong_examples": DBQ_THESIS_WRONG,
            "common_traps": DBQ_THESIS_TRAPS,
        },
        {
            "point_id": "a2",
            "point_value": 1,
            "description": "Contextualization: Describes broader historical context accurately and connects it to the argument.",
            "alternatives": alts(context_ex),
            "wrong_examples": DBQ_CONTEXT_WRONG,
            "common_traps": DBQ_CONTEXT_TRAPS,
        },
        {
            "point_id": "a3",
            "point_value": 1,
            "description": "Evidence from Documents: Uses the content of at least THREE documents to address the topic of the prompt.",
            "alternatives": [{
                "required_elements": [
                    "Accurately describes content from at least 3 documents",
                    "Does not simply quote without describing",
                    "Content is relevant to the topic"
                ],
                "correct_example": "Accurately describes — rather than simply quotes — the content from at least three of the documents to address the topic of the prompt."
            }],
            "wrong_examples": DBQ_EVIDENCE_DOCS_WRONG,
            "common_traps": DBQ_EVIDENCE_DOCS_TRAPS,
        },
        {
            "point_id": "a4",
            "point_value": 1,
            "description": "Evidence from Documents+: Supports an argument in response to the prompt using at least FOUR documents.",
            "alternatives": [{
                "required_elements": [
                    "Uses content of at least 4 documents",
                    "Connects document content to a specific argument about the prompt"
                ],
                "correct_example": "Uses four or more documents to support a specific argument about the prompt, connecting document evidence to a claim about cause, extent, or significance."
            }],
            "wrong_examples": [
                "Merely describing four documents without connecting them to an argument.",
                "Using four documents but only three in support of an argument.",
            ],
            "common_traps": [
                "The four documents do not need to support a single argument — sub-arguments or counterarguments count.",
                "This point builds on a3 — both are earned independently.",
            ],
        },
        {
            "point_id": "a5",
            "point_value": 1,
            "description": "Evidence Beyond Documents: Uses at least ONE piece of specific historical evidence not found in the documents.",
            "alternatives": alts(beyond_ex),
            "wrong_examples": DBQ_EVIDENCE_BEYOND_WRONG,
            "common_traps": DBQ_EVIDENCE_BEYOND_TRAPS,
        },
        {
            "point_id": "a6",
            "point_value": 1,
            "description": "Sourcing: For at least TWO documents, explains how/why the document's point of view, purpose, historical situation, or audience is relevant to an argument.",
            "alternatives": alts(sourcing_ex),
            "wrong_examples": DBQ_SOURCING_WRONG,
            "common_traps": DBQ_SOURCING_TRAPS,
        },
        {
            "point_id": "a7",
            "point_value": 1,
            "description": "Complexity: Demonstrates a complex understanding through sophisticated argumentation and/or effective use of evidence.",
            "alternatives": alts(complexity_ex),
            "wrong_examples": DBQ_COMPLEXITY_WRONG,
            "common_traps": DBQ_COMPLEXITY_TRAPS,
        },
    ]


# ─── HELPER: build standard 6-pt LEQ scoring_points ──────────────────────────
def leq_points(letter, thesis_ex, context_ex, evidence_ex, evidence_support_ex, reasoning_ex, complexity_ex):
    alts = lambda exs: [{"required_elements": [e], "correct_example": e} for e in exs]
    return [
        {
            "point_id": f"{letter}1",
            "point_value": 1,
            "description": "Thesis/Claim: Responds with a historically defensible thesis that establishes a line of reasoning.",
            "alternatives": alts(thesis_ex),
            "wrong_examples": DBQ_THESIS_WRONG,
            "common_traps": DBQ_THESIS_TRAPS,
        },
        {
            "point_id": f"{letter}2",
            "point_value": 1,
            "description": "Contextualization: Describes broader historical context accurately and connects it to the argument.",
            "alternatives": alts(context_ex),
            "wrong_examples": DBQ_CONTEXT_WRONG,
            "common_traps": DBQ_CONTEXT_TRAPS,
        },
        {
            "point_id": f"{letter}3",
            "point_value": 1,
            "description": "Evidence: Provides specific examples of at least TWO pieces of evidence relevant to the topic.",
            "alternatives": alts(evidence_ex),
            "wrong_examples": [
                "Only one piece of evidence.",
                "Evidence outside the time period or region.",
                "Vague references without specifics.",
            ],
            "common_traps": [
                "Two distinct examples required — one detailed example is not enough.",
                "Evidence must be specific, not general statements.",
            ],
        },
        {
            "point_id": f"{letter}4",
            "point_value": 1,
            "description": "Evidence+: Supports an argument in response to the prompt using at least TWO pieces of specific and relevant evidence.",
            "alternatives": alts(evidence_support_ex),
            "wrong_examples": [
                "Listing two examples without connecting them to an argument.",
                "Evidence that is only tangentially relevant.",
            ],
            "common_traps": [
                "Must SUPPORT an argument — description alone earns point 3 but not point 4.",
                "Both evidence points are earned independently.",
            ],
        },
        {
            "point_id": f"{letter}5",
            "point_value": 1,
            "description": "Analysis & Reasoning: Uses historical reasoning (comparison, causation, or continuity/change over time) to frame or structure an argument.",
            "alternatives": alts(reasoning_ex),
            "wrong_examples": LEQ_REASONING_WRONG,
            "common_traps": LEQ_REASONING_TRAPS,
        },
        {
            "point_id": f"{letter}6",
            "point_value": 1,
            "description": "Complexity: Demonstrates a complex understanding through sophisticated argumentation and/or effective use of evidence.",
            "alternatives": alts(complexity_ex),
            "wrong_examples": DBQ_COMPLEXITY_WRONG,
            "common_traps": DBQ_COMPLEXITY_TRAPS,
        },
    ]


# ═══════════════════════════════════════════════════════════════════════════════
# SCORING DATA FROM COLLEGE BOARD PDFs
# ═══════════════════════════════════════════════════════════════════════════════

SCORING_DATA = {}

# ─────────────────────────────────────────────────────────────────────────────
# 2024 SET 1
# ─────────────────────────────────────────────────────────────────────────────

SCORING_DATA["world-2024-set1-saq-1"] = {
    "a": saq_point("a", "Identify ONE claim the authors make in the first paragraph of the passage", [
        {"required_elements": ["Claim from the first paragraph"], "correct_example": "Hindus and Muslims interacted in many different ways, including economics, politics, social life, the arts, and culture."},
        {"required_elements": ["Claim about Muslim population growth"], "correct_example": "The Muslim population of India grew substantially between 1200 and 1800."},
        {"required_elements": ["Claim about Muslim scholars/Sufis migrating to India"], "correct_example": "Muslim scholars and Sufi religious mystics and saints migrated to India from Iran, Turkey, and Central Asia."},
        {"required_elements": ["Claim about poets migrating from Persia"], "correct_example": "Some of the best poets migrated from Persia to India seeking new cultural opportunities."},
    ]),
    "b": saq_point("b", "Identify ONE piece of evidence the authors use to support their claims about cultural interactions between Hindus and Muslims (second paragraph)", [
        {"required_elements": ["Evidence about artistic innovation from painter interactions"], "correct_example": "Interactions between imperial court painters and Rajput painters resulted in artistic innovations in both styles."},
        {"required_elements": ["Evidence about Kabir and Nanak's poetry and syncretism"], "correct_example": "The poetry of Kabir and Nanak contributed to Hindu, Muslim, and Sikh cultural syncretism."},
        {"required_elements": ["Evidence about mystics attracting followers from other communities"], "correct_example": "Interactions between Muslim and Hindu mystics attracted followers from each others' communities."},
    ]),
    "c": saq_point("c", "Explain ONE reason why Mughal rulers in the period circa 1450–1750 would have encouraged the interactions described in the passage", [
        {"required_elements": ["Reason related to preventing rebellion from non-Muslim subjects"], "correct_example": "Mughal rulers wanted to keep their non-Muslim subjects from rebelling, so they encouraged cross-religious interactions to maintain stability."},
        {"required_elements": ["Reason about Hindus accepting Mughal rule"], "correct_example": "Mughal rulers believed that encouraging close relations between Muslims and non-Muslims would likely lead Hindus to accept Mughal rule."},
        {"required_elements": ["Reason about expanding power through contributions of full population"], "correct_example": "Mughal rulers believed that encouraging close relations could help expand Mughal power by utilizing the economic, political, and military contributions of their full population."},
    ]),
}

SCORING_DATA["world-2024-set1-saq-2"] = {
    "a": saq_point("a", "Identify ONE likely political purpose of the image (German National Socialist Party election poster, 1932)", [
        {"required_elements": ["Political purpose to inspire votes for the Nazi party"], "correct_example": "The poster was created to inspire people to vote for the Nazi party by appealing to fears about unemployment and family instability."},
        {"required_elements": ["Purpose to convince people Nazis would solve economic problems"], "correct_example": "The poster was created to convince people that voting for the Nazi party would solve their economic problems during the Great Depression."},
        {"required_elements": ["Purpose to make people angry with the current government"], "correct_example": "The poster was intended to make people angry with the current government and its management of the economy."},
    ]),
    "b": saq_point("b", "Explain ONE way the image illustrates the economic situation of the period after the First World War", [
        {"required_elements": ["Connection between image and post-WWI economic hardship or Great Depression"], "correct_example": "The image shows the poverty and unemployment that many families in Germany faced because of the Great Depression following WWI."},
        {"required_elements": ["Connection to demand for more active government economic role"], "correct_example": "The image illustrates the growing popularity of the idea that governments should take a more active role in economic life."},
        {"required_elements": ["Connection to German suffering from defeat — unemployment, reparations, or inflation"], "correct_example": "The image shows that Germany suffered greatly following its defeat in the First World War, including widespread unemployment, reparations, or inflation."},
    ]),
    "c": saq_point("c", "Explain ONE way the rise of the German National Socialist Party led to the Second World War", [
        {"required_elements": ["Causal connection: Nazi militarism and invasions led to WWII"], "correct_example": "The rise of the Nazi Party contributed to aggressive militarism and the invasions of other countries, directly triggering WWII."},
        {"required_elements": ["Causal connection: Nazi nationalism and desire for 'living space'"], "correct_example": "The rise of the Nazi Party led to intense nationalism and a desire to create 'living space' for Germans through military expansion and conquest."},
        {"required_elements": ["Causal connection: Hitler's totalitarian control and pursuit of military domination"], "correct_example": "After Hitler and the Nazis gained totalitarian control over Germany, Hitler turned his attention to military domination of Europe, Africa, and other regions."},
    ]),
}

SCORING_DATA["world-2024-set1-saq-3"] = {
    "a": saq_point("a", "Identify ONE method Europeans used to expand their empires in the Americas in the period circa 1450–1750", [
        {"required_elements": ["Method involving military technology or weapons"], "correct_example": "Europeans used gunpowder weapons to conquer new territories in the Americas, giving them a military advantage over Indigenous peoples."},
        {"required_elements": ["Method involving economic systems like the encomienda"], "correct_example": "The Spanish used the encomienda system to expand the areas in their empire under cultivation and extract Indigenous labor."},
        {"required_elements": ["Method involving religion and Christianity"], "correct_example": "Europeans used Christianity to help consolidate and justify their rule over Indigenous peoples in the Americas."},
    ]),
    "b": saq_point("b", "Explain ONE way European colonialism affected Indigenous peoples in the Americas in the period circa 1450–1750", [
        {"required_elements": ["Effect: disease epidemics and demographic collapse"], "correct_example": "Indigenous communities experienced multiple waves of European diseases and epidemics, leading to demographic collapse in many regions."},
        {"required_elements": ["Effect: cultural syncretism or adoption of European/African practices"], "correct_example": "Many Indigenous peoples adopted European and/or African cultural practices that formed new syncretic belief systems."},
        {"required_elements": ["Effect: forced conversion to Christianity"], "correct_example": "European colonial authorities used priests and missionaries to convert Indigenous people to Christianity, undermining traditional religious practices."},
        {"required_elements": ["Effect: new racial social hierarchies like the casta system"], "correct_example": "The casta system resulted in a new racial social hierarchy involving Indigenous and mixed-race families in colonial Latin America."},
        {"required_elements": ["Effect: enslavement or forced labor in mines or haciendas"], "correct_example": "Many Indigenous people were enslaved or forced to work in mines or on European-owned haciendas under brutal conditions."},
    ]),
    "c": saq_point("c", "Explain ONE way European interactions with non-European peoples in the Americas contributed to the development of a global economy in the period circa 1450–1750", [
        {"required_elements": ["Contribution via the Columbian Exchange"], "correct_example": "European interactions with Indigenous peoples in the Americas led to the Columbian Exchange, spreading crops, technologies, goods, and diseases between hemispheres."},
        {"required_elements": ["Contribution via the Trans-Atlantic slave trade"], "correct_example": "The Trans-Atlantic slave trade brought millions of enslaved Africans to the Americas and significantly expanded the Atlantic economy through plantations and cash crops."},
        {"required_elements": ["Contribution via American silver and trans-Pacific trade"], "correct_example": "Silver mined in the Americas using Indigenous labor fueled the purchase of Asian goods by Europeans, especially after the establishment of trans-Pacific maritime trade."},
        {"required_elements": ["Contribution via North Atlantic exchanges like the fur trade"], "correct_example": "Economic exchanges in the North Atlantic, including the fur trade and commercial fishing, connected the Americas to Afro-Eurasia in new ways."},
    ]),
}

SCORING_DATA["world-2024-set1-saq-4"] = {
    "a": saq_point("a", "Identify ONE way Asians resisted Western imperialism in the period circa 1800–1914", [
        {"required_elements": ["Resistance through organized rebellions"], "correct_example": "Asians resisted Western imperialism by organizing rebellions such as the Boxer Rebellion in China or the Sepoy Rebellion in India."},
        {"required_elements": ["Resistance through modernization of states and militaries"], "correct_example": "Some Asian states such as Japan resisted Western imperialism by modernizing their states and militaries to compete with European powers."},
        {"required_elements": ["Resistance through nationalist or anticolonial movements"], "correct_example": "Some Asian leaders began to organize nationalist or anticolonial movements to protest Western imperialism and call for independence."},
        {"required_elements": ["Resistance through nonviolent civil disobedience"], "correct_example": "Mohandas Gandhi and others used nonviolent civil disobedience to resist Western imperialism in India."},
    ]),
    "b": saq_point("b", "Explain ONE way European imperialism changed the cultures of peoples in Asia in the period circa 1800–1914", [
        {"required_elements": ["Cultural change: loss of self-governance and control of laws"], "correct_example": "When Europeans conquered Asian countries, those societies lost the ability to govern themselves and control their own laws and customs."},
        {"required_elements": ["Cultural change: selective Westernization of dress and military structures"], "correct_example": "Some Asian societies or ruling elites chose to selectively Westernize by adopting Western-style clothing and military structures."},
        {"required_elements": ["Cultural change: spread of Christianity by Western missionaries"], "correct_example": "Western Christian missionaries spread their religion and culture in many regions of Asia, undermining indigenous religious practices."},
        {"required_elements": ["Cultural change: turning away from traditional culture and adopting Western material culture"], "correct_example": "The spread of European influence contributed to a turning away from traditional culture and the adoption of Western material culture, especially among elites."},
    ]),
    "c": saq_point("c", "Explain ONE way European imperialism in Asia contributed to changes in the global economy in the period circa 1800–1914", [
        {"required_elements": ["Economic change: Japan successfully industrialized to compete with Europe"], "correct_example": "The global economy changed because Japan successfully industrialized to compete with European states, emerging as a new economic power."},
        {"required_elements": ["Economic change: weakening of Asian economies like India and China"], "correct_example": "European imperialism greatly weakened Asian states such as India and China by making them uncompetitive globally and harming or destroying their manufacturing industries."},
        {"required_elements": ["Economic change: spheres of influence in China after Opium Wars"], "correct_example": "Following the Opium Wars, Europeans and the United States created economic spheres of influence in China, affecting the global balance of power."},
        {"required_elements": ["Economic change: forced raw material exports and dependency on European finished goods"], "correct_example": "Local populations in Asian colonies were forced to export raw materials at discount rates and buy finished European goods, deepening global economic inequalities."},
    ]),
}

SCORING_DATA["world-2024-set1-dbq-1"] = {
    "a": dbq_points(
        thesis_ex=[
            "Communism benefited workers, peasants, and women because it abolished many social and economic practices that had been holding these groups down.",
            "Communist rule transformed Soviet and Chinese societies by creating new opportunities for some groups, while brutally repressing those who challenged communist rule.",
        ],
        context_ex=[
            "Marx and Engels believed that only workers could carry out the communist revolution, but Mao believed that peasants could also lead a communist revolution, adapting Marxist theory to Chinese conditions.",
            "The development of socialist and workers' parties in the late nineteenth century laid the groundwork for communist revolutions in Russia and China.",
        ],
        beyond_ex=[
            "In the Soviet Union, the KGB was the secret police that could arrest, torture, and imprison citizens without due process, showing how communist rule used repression to maintain power.",
            "The Great Leap Forward was an economic and social campaign launched by Mao Zedong to transform China from an agrarian economy into an industrialized society through collectivization, resulting in a catastrophic famine.",
        ],
        sourcing_ex=[
            "[Document 2]: As a former prisoner and member of the Communist Party, the author's account offers credible eyewitness evidence of the political terror in the Soviet Union in the 1930s, supporting an argument about how communist rule used state violence to transform society.",
            "[Document 5]: The report blames local officials who were 'afraid of making mistakes or being accused of disloyalty to the Party,' effectively shifting responsibility to the local level, supporting an argument about how the Chinese Communist Party's centralization caused human suffering.",
        ],
        complexity_ex=[
            "Analyzing how even though women gained formal rights in both the USSR and China under communist rule, they also continued to bear the main responsibility for raising children and managing the household, showing the limits of communist transformation.",
            "Arguing that communist rule had a multi-faceted impact on societies — benefiting some groups like workers and women in certain respects, while brutally harming others through purges, gulags, and engineered famines.",
        ]
    )
}

SCORING_DATA["world-2024-set1-leq-1"] = {
    "a": leq_points("a",
        thesis_ex=[
            "Within the Mongol khanates trade networks flourished under the Pax Mongolica, which made travel safer and thus led to the spread of cultural practices like Buddhism and Islam.",
            "The expansion of European transoceanic trading empires contributed to cultural change in Afro-Eurasia mostly through the spread of Christianity, though it also led to new syncretic religious practices.",
        ],
        context_ex=[
            "For centuries, the Silk Roads had connected China with Central Asia, the Middle East, and even Europe, facilitating the exchange of goods, technologies, and ideas across Afro-Eurasia.",
            "The spread of Chinese culture led to the adoption of Confucianism in parts of Southeast Asia, demonstrating the pre-existing pattern of cultural diffusion along trade routes.",
        ],
        evidence_ex=[
            "Eastern inventions like the compass, the astrolabe, and gunpowder were adopted by Europeans, greatly improving maritime knowledge and shipbuilding.",
            "After being expelled from Spain and other European countries, Jewish populations settled in the Ottoman Empire, bringing their own cultural practices.",
        ],
        evidence_support_ex=[
            "Eastern inventions like the compass and gunpowder were adopted by Europeans, improving maritime knowledge and ultimately leading to Portuguese trading posts in Africa and India where missionaries spread Christianity.",
            "After being expelled from Spain, Jewish populations settled in the Ottoman Empire, contributing to cultural flourishing by bringing specialized commercial and intellectual skills that enriched both Jewish and Ottoman culture.",
        ],
        reasoning_ex=[
            "Using causation to explain how Muslim merchants brought crops from South and East Asia westward, leading to social changes such as the development of the plantation system related to sugar cultivation.",
            "Using continuity and change to show how the voyages of Zheng He expanded tribute-trade between China and Asian societies, but this practice declined after the Ming Dynasty ended maritime exploration.",
        ],
        complexity_ex=[
            "Explaining how trade along the African coast enriched European slave traders and merchants while depleting African resources, demonstrating how exchange networks produced both benefits and harms simultaneously.",
            "Explaining how the spread of Islam transformed sub-Saharan African societies by showing that Muslim rulers of the Mali Empire sponsored Islamic learning in Timbuktu while also building monumental religious architecture combining Islamic and African styles.",
        ]
    ),
    "b": leq_points("b",
        thesis_ex=[
            "Industrialization changed economies from mostly agricultural to industrial factory production, which often led to improved standards of living but also created new forms of exploitation.",
            "The spread of industrialization across Europe and North America transformed societies by changing patterns of employment, altering family structures, and causing large-scale population movements from rural areas to cities.",
        ],
        context_ex=[
            "European imperialism contributed to the spread of industrialization by spreading European economic practices and connecting colonial markets with European economies.",
            "Scientific advances made industrialization possible by providing new technologies such as the steam engine, which transformed methods of production.",
        ],
        evidence_ex=[
            "The construction of railways across Europe and North America transformed transportation, enabled the mass movement of goods and people, and contributed to the growth of industrial cities.",
            "Workers left places where there was famine, like Ireland and China, and moved to industrial countries, most notably the United States, in search of factory employment.",
        ],
        evidence_support_ex=[
            "Industrialization forced people off the land into the cities, where they became the new working class, and the terrible working conditions they found in the cities led to the rise of socialist movements.",
            "The mass production of new consumer products, such as ready-made clothing, the rise of large-scale retailers such as department stores, and widespread advertising contributed to the growth of consumer culture.",
        ],
        reasoning_ex=[
            "Using causation to explain how the use of mechanization in textile production allowed British producers to undercut the prices of Indian textiles, leading to the decline of Indian manufacturing.",
            "Using comparison to show how industrialization led to different outcomes in Britain versus India — enriching the colonizer while impoverishing the colonized.",
        ],
        complexity_ex=[
            "Explaining how industrialization contributed to rapid economic growth and modernization for some states, while also disrupting traditional ways of living for many poor or rural populations in Europe, Asia, Africa, and the Americas.",
            "Explaining how rapid industrialization in Germany and the United States influenced Japanese military and economic innovations, which led to Japan's corresponding bid for Great Power status and imperialism.",
        ]
    ),
    "c": leq_points("c",
        thesis_ex=[
            "New transportation technologies like airplanes and container ships brought people into much closer contact and increased the availability of many new products, improving lives for many.",
            "During the twentieth century, significant improvements in medicine and pharmaceutical research reduced child mortality and lowered deaths from infectious diseases, but new technologies also created new risks.",
        ],
        context_ex=[
            "The Green Revolution relied on biotechnology to create more resilient crop varieties and advances in chemical engineering allowing mass production of fertilizers and pesticides.",
            "Late nineteenth-century inventions like the telegraph and telephone started a communication revolution that accelerated throughout the twentieth century.",
        ],
        evidence_ex=[
            "The development and global distribution of vaccines and antibiotics reduced deaths from infectious diseases like smallpox and tuberculosis, contributing to rapid population growth.",
            "The creation of the internet and cellular communications provided individuals around the world with fast, direct communications, enabling new forms of entrepreneurship and social connection.",
        ],
        evidence_support_ex=[
            "The availability of modern medicine, especially vaccines and antibiotics, as well as advances in agriculture like the Green Revolution, contributed to huge gains in public health and longer life expectancies.",
            "The use of technologies to automate economic production led some workers to organize into labor unions which succeeded in negotiating legal protections for workers, improving their working conditions.",
        ],
        reasoning_ex=[
            "Using causation to explain how the creation of vaccines significantly reduced deaths from diseases like smallpox, which improved people's lives and contributed to rapid population growth in the twentieth century.",
            "Using continuity and change to show how nuclear technology provided new energy sources through power plants while also creating the persistent threat of nuclear war and weapons proliferation throughout the Cold War.",
        ],
        complexity_ex=[
            "Explaining how nuclear technologies provided new sources of energy through nuclear power plants but also introduced new risks including long-term disposal of nuclear waste, radiation from accidents like Chernobyl, and the threat of nuclear war.",
            "Considering how new communications technologies like the internet informed many people about global issues related to human rights, while also sparking protest movements against globalization and Western cultural influence.",
        ]
    ),
}

# ─────────────────────────────────────────────────────────────────────────────
# 2024 SET 2 — from PDF content
# ─────────────────────────────────────────────────────────────────────────────

# Read the Set 2 2024 data - extracted content from the PDF
# Question 1: SAQ - Indian Ocean Trade Networks
# Question 2: SAQ - Ottoman Empire
# Question 3: SAQ - No Stimulus
# Question 4: SAQ - No Stimulus
# DBQ: Industrialization and Global Economic Inequality
# LEQ: Options on trade/imperialism/modern era

# We'll use the rubric_criteria fallback for Set 2 since we need to read the PDF separately
# The fallback converter handles this correctly

# ─────────────────────────────────────────────────────────────────────────────
# 2025 SET 1 AND SET 2 — use fallback converter
# ─────────────────────────────────────────────────────────────────────────────

# ─────────────────────────────────────────────────────────────────────────────
# 2021, 2022, 2023 — use fallback converter
# ─────────────────────────────────────────────────────────────────────────────


# ═══════════════════════════════════════════════════════════════════════════════
# FALLBACK: Convert rubric_criteria strings to scoring_points
# ═══════════════════════════════════════════════════════════════════════════════

def convert_rubric_criteria_to_scoring_points(part):
    """
    Convert legacy rubric_criteria strings to scoring_points.
    Handles SAQ (single point, multiple alternatives) and DBQ/LEQ (multi-point essay).
    """
    letter = part.get("letter", "a")
    criteria = part.get("rubric_criteria", [])
    point_value = part.get("point_value", 1)

    if not criteria:
        return None

    # Essay format detection: DBQ/LEQ have named rows like "(Thesis)", "(Evidence)", etc.
    essay_keywords = ["Thesis", "Contextualization", "Evidence from Docs", "Evidence Beyond",
                      "Sourcing", "Complexity", "Evidence+", "Evidence:", "Analysis"]
    is_essay = (point_value >= 6) or any(
        any(kw in c for kw in essay_keywords) for c in criteria
    )

    if is_essay:
        # Each criterion becomes its own scoring_point
        scoring_points = []
        for i, criterion in enumerate(criteria):
            criterion = criterion.strip()
            # Parse "1 pt (Label): description" format
            m = re.match(r'1\s*pt\s*\(([^)]+)\):\s*(.*)', criterion, re.DOTALL)
            if m:
                label = m.group(1).strip()
                desc_text = m.group(2).strip()
            else:
                # Try "1 pt: description" format
                m2 = re.match(r'1\s*pt:\s*(.*)', criterion, re.DOTALL)
                if m2:
                    label = f"Point {i+1}"
                    desc_text = m2.group(1).strip()
                else:
                    label = f"Point {i+1}"
                    desc_text = criterion

            point = {
                "point_id": f"{letter}{i+1}",
                "point_value": 1,
                "description": f"{label}: {desc_text}",
                "alternatives": [{
                    "required_elements": [desc_text],
                    "correct_example": f"A response that successfully demonstrates: {desc_text}"
                }],
                "wrong_examples": [
                    "A response that fails to address this specific criterion.",
                    "A vague or overgeneralized response that does not meet the standard.",
                ],
            }
            scoring_points.append(point)
        return scoring_points

    else:
        # SAQ format: single point, multiple acceptable answers as alternatives
        alternatives = []
        for criterion in criteria:
            criterion = criterion.strip()
            # Strip "1 pt: " prefix
            clean = re.sub(r'^1\s*pt:\s*', '', criterion).strip()
            # Strip "1 pt (label): " prefix
            clean = re.sub(r'^1\s*pt\s*\([^)]+\):\s*', '', clean).strip()
            alternatives.append({
                "required_elements": [clean],
                "correct_example": clean,
            })

        return [{
            "point_id": f"{letter}1",
            "point_value": 1,
            "description": "Earns 1 point for addressing the prompt with historically defensible content.",
            "alternatives": alternatives,
            "wrong_examples": SAQ_WRONG_EXAMPLES,
            "common_traps": SAQ_COMMON_TRAPS,
        }]


# ═══════════════════════════════════════════════════════════════════════════════
# FILE PROCESSING
# ═══════════════════════════════════════════════════════════════════════════════

def process_file(json_path):
    """Process a single FRQ JSON file — replace rubric_criteria with scoring_points."""
    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    frq_id = data.get("id", "")
    modified = False

    for part in data.get("parts", []):
        if part.get("requires_drawing"):
            continue

        letter = part.get("letter")
        existing_scoring = part.get("scoring_points")

        # Skip parts that already have scoring_points
        if existing_scoring and len(existing_scoring) > 0:
            continue

        # Determine scoring_points source
        if frq_id in SCORING_DATA and letter in SCORING_DATA[frq_id]:
            scoring_points = SCORING_DATA[frq_id][letter]
        elif part.get("rubric_criteria"):
            scoring_points = convert_rubric_criteria_to_scoring_points(part)
        else:
            continue

        if scoring_points:
            # Remove rubric_criteria, add scoring_points
            if "rubric_criteria" in part:
                del part["rubric_criteria"]
            part["scoring_points"] = scoring_points
            modified = True

    if modified:
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=2, ensure_ascii=False)
            f.write('\n')
        return True
    return False


def main():
    json_files = sorted([
        os.path.join(FRQ_DIR, fn)
        for fn in os.listdir(FRQ_DIR)
        if fn.endswith('.json') and fn != 'manifest.json'
    ])

    print(f"Processing {len(json_files)} FRQ files...")
    updated = 0
    skipped = 0

    for json_path in json_files:
        basename = os.path.basename(json_path)
        try:
            result = process_file(json_path)
            if result:
                print(f"  [OK] {basename}")
                updated += 1
            else:
                print(f"  [--] {basename} (already has scoring_points or no rubric_criteria)")
                skipped += 1
        except Exception as e:
            print(f"  [ERR] {basename}: {e}")

    print(f"\nDone. Updated: {updated}, Skipped: {skipped}, Total: {len(json_files)}")


if __name__ == "__main__":
    main()
