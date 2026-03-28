# AP World History — Research Brief

> **STATUS: COMPLETE**
> Source: CED PDF (`.planning/phases/07-ap-world-history-content/reference/ap-world-history-modern-course-and-exam-description.pdf`)
> Extracted via pdfminer. All unit names, weights, learning objectives, and illustrative examples are verbatim from the College Board CED.

---

## Project Constraints (from CLAUDE.md)

- Content pipeline: Researcher → Planner → Writer → Reviewer (all Sonnet for Phase 7)
- No Chemistry Checker needed (no KaTeX/formulas in World History)
- No pseudocode (AP CSP only)
- MCQ: exactly 4 choices, one `is_correct: true`, per-choice `explanation` required
- Drill: no `alternate_answers`, one canonical answer, `is_key_term` on 8–15 per unit
- `concept_mc` cards: `answer: ""`, `choices` array with 3–4 items, never `is_key_term: true`
- All IDs use prefix `whist`: e.g., `whist-u1-q001`, `whist-u1-d001`
- Study guide ID format: `whist-sg-unit-1`
- Output path: `public/data/ap-world-history/`
- Branch: `content/ap-world-history`
- Critical Rule #4: choices stored A/B/C/D in JSON — scrambled at render time only

---

## Exam Format

**Source:** CED PDF, Exam Overview (p. 195–196), verified directly.

| Section | Part | Question Type | Count | Weighting | Time |
|---------|------|--------------|-------|-----------|------|
| Section I | Part A | Multiple-choice questions | **55** | **40%** | 55 minutes |
| Section I | Part B | Short-answer questions | **3** | **20%** | 40 minutes |
| Section II | — | Document-based question (DBQ) | **1** | **25%** | 60 min (incl. 15-min reading period) |
| Section II | — | Long essay question (LEQ) | **1** (select from 3 options) | **15%** | 40 minutes |

**Total exam time:** 3 hours 15 minutes.

**MCQ format:** 55 questions in sets of 3–4 per stimulus. Stimuli include primary texts, secondary texts, images (artwork, photos, cartoons), charts or quantitative data, and maps. At least one set of paired text-based stimuli. Questions require both stimulus analysis and broader historical knowledge.

**SAQ format:** Q1 = required, secondary source stimulus; Q2 = required, primary source stimulus; Q3 or Q4 (student choice) = no stimulus. All four chronological periods represented among the four SAQs.

**DBQ:** 7 documents offering various perspectives on one historical development or process.

**LEQ:** Students select from 3 long essay options spanning different time periods.

**Historical Thinking Skills:** Argumentation, Causation, Comparison, Contextualization, Continuity and Change Over Time (CCOT), Sourcing and Situation.

**Reasoning Processes tested on exam:** Causation, Comparison, Continuity and Change Over Time.

**Six Course Themes:**
- ENV: Humans and the Environment
- CDI: Cultural Developments and Interactions
- GOV: Governance
- ECN: Economic Systems
- SIO: Social Interactions and Organization
- TEC: Technology and Innovation

---

## Unit Structure

| Unit | Official Name (from CED) | CB Exam Weight | Period |
|------|--------------------------|---------------|--------|
| 1 | The Global Tapestry | 8–10% | c. 1200 to c. 1450 |
| 2 | Networks of Exchange | 8–10% | c. 1200 to c. 1450 |
| 3 | Land-Based Empires | 12–15% | c. 1450 to c. 1750 |
| 4 | Transoceanic Interconnections | 12–15% | c. 1450 to c. 1750 |
| 5 | Revolutions | 12–15% | c. 1750 to c. 1900 |
| 6 | Consequences of Industrialization | 12–15% | c. 1750 to c. 1900 |
| 7 | Global Conflict | 8–10% | c. 1900 to the present |
| 8 | Cold War and Decolonization | 8–10% | c. 1900 to the present |
| 9 | Globalization | 8–10% | c. 1900 to the present |

**Note from CED:** Events, processes, and developments are not constrained by given dates and may begin before, or continue after, the approximate dates assigned to each unit.

---

## Per-Unit Content

### Unit 1: The Global Tapestry (c. 1200–c. 1450)

**Topics (from CED):** 1.1 Developments in East Asia | 1.2 Developments in Dar al-Islam | 1.3 Developments in South and Southeast Asia | 1.4 State Building in the Americas | 1.5 State Building in Africa | 1.6 Developments in Europe | 1.7 Comparison in the Period (skill synthesis)

**Learning Objectives:**
- LO-A: Explain the systems of government employed by Chinese dynasties and how they developed over time. (KC-3.2.I.A) — Song Dynasty, Confucianism, imperial bureaucracy
- LO-B: Explain the effects of Chinese cultural traditions on East Asia over time. (KC-3.1.III.D.i/ii) — Buddhism's branches, spread to Japan/Korea
- LO-C: Explain the effects of innovation on the Chinese economy over time. (KC-3.3.III.A.i, KC-3.1.I.D) — commercialization, Champa rice, Grand Canal
- LO-D: Explain how systems of belief affected society 1200–1450. (KC-3.1.III.D.iii) — Islam, Judaism, Christianity in Africa and Asia
- LO-E: Explain causes and effects of the rise of Islamic states. (KC-3.2.I, KC-3.1.III.A) — Abbasid fragmentation, Seljuks, Sufism spread
- LO-F: Explain effects of intellectual innovation in Dar al-Islam. (KC-3.2.II.A.i) — House of Wisdom, math, medicine, Greek philosophy
- LO-G: Explain how belief systems of South/Southeast Asia affected society. (KC-3.1.III.D.iv) — Hinduism, Islam, Buddhism
- LO-H: Explain how Hindu/Buddhist states of South/Southeast Asia developed and maintained power. (KC-3.2.I.B.i) — Vijayanagara, Khmer Empire
- LO-I: Explain how states in the Americas developed and changed. (KC-3.2.I.D.i) — Maya, Mexica, Inca, Cahokia
- LO-J: Explain how states in Africa developed and changed. (KC-3.2.I.D.ii) — Great Zimbabwe, Ethiopia, Hausa kingdoms
- LO-K: Explain how predominant religions in Europe affected European society. (KC-3.1.III.D.v) — Christianity, Judaism, Islam
- LO-L: Explain causes and consequences of political decentralization in Europe 1200–1450. (KC-3.2.I.B.ii) — feudalism, manorial system
- LO-M: Explain effects of agriculture on social organization in Europe. (KC-3.3.III.C) — serfdom, coerced labor
- LO-N: Explain similarities and differences in state formation 1200–1450. (KC-3.2) — comparison synthesis

**Key Terms (CED illustrative examples):**
Song Dynasty, Confucianism, Neo-Confucianism, filial piety, Champa rice, Grand Canal, steel and iron production, porcelain, Abbasid Caliphate, Seljuk Empire, Mamluk Sultanate of Egypt, Delhi Sultanate, Sufism, House of Wisdom, Theravada Buddhism, Mahayana Buddhism, Tibetan Buddhism, Bhakti movement, Vijayanagara Empire, Khmer Empire, Majapahit, Srivijaya Empire, Rajput kingdoms, Maya city-states, Mexica, Inca, Cahokia, Great Zimbabwe, Ethiopia, Hausa kingdoms, feudalism, manorialism, serfdom, Crusades (from vocab list), Great Schism (from vocab list), Renaissance (from vocab list), meritocracy, syncretism, waru-waru agriculture, chinampas, mita system, Zen Buddhism, Tibetan Buddhism

**Key Figures (CED):** Nasir al-Din al-Tusi (advances in mathematics), 'A'ishah al-Ba'uniyyah (advances in literature)

**Drill Candidates:**
- `definition_to_term`: Song Dynasty, Neo-Confucianism, filial piety, feudalism, manorialism, serfdom, Sufism, Bhakti movement, Theravada Buddhism, Mahayana Buddhism, Tibetan Buddhism, Abbasid Caliphate, Seljuk Empire, Delhi Sultanate, Khmer Empire, meritocracy, Great Schism, syncretism, waru-waru agriculture, chinampas, mita system, Zen Buddhism, Grand Canal, Champa rice
- `significance_to_person`: Nasir al-Din al-Tusi (advanced mathematics in Dar al-Islam), 'A'ishah al-Ba'uniyyah (Islamic literary tradition)
- `significance_to_event`: Crusades (Christian military expeditions to Holy Land; cultural/commercial exchanges with Islamic world), Great Schism (1054 split between Roman Catholic and Eastern Orthodox churches), Renaissance (cultural and intellectual rebirth in 14th–16th century Europe)
- `concept_mc`: How Song China used Confucianism and bureaucracy to maintain power; comparing state-building methods across Afro-Eurasia and Americas; how Sufism spread Islam beyond the Middle East

**is_key_term candidates (10):** Song Dynasty, Neo-Confucianism, feudalism, manorialism, Sufism, Abbasid Caliphate, Bhakti movement, Champa rice, filial piety, Delhi Sultanate

---

### Unit 2: Networks of Exchange (c. 1200–c. 1450)

**Topics (from CED):** 2.1 The Silk Roads | 2.2 The Mongol Empire and the Making of the Modern World | 2.3 Exchange in the Indian Ocean | 2.4 Trans-Saharan Trade Routes | 2.5 Cultural Consequences of Connectivity | 2.6 Environmental Consequences of Connectivity | 2.7 Comparison of Economic Exchange (skill synthesis)

**Learning Objectives:**
- LO-A: Explain causes and effects of growth of exchange networks after 1200. (KC-3.1.I.A.i, KC-3.1.I.C.i, KC-3.3.I.B) — caravanserai, credit, paper money, luxury goods
- LO-B: Explain state building and decline — Mongol khanates. (KC-3.2.I.B.iii)
- LO-C: Explain how expansion of empires (Mongols) influenced trade. (KC-3.1.I.E.i)
- LO-D: Explain significance of the Mongol Empire in continuity and change — tech/cultural transfers. (KC-3.2.II.A.ii)
- LO-E: Explain causes of Indian Ocean exchange growth — compass, astrolabe, ship design, monsoons. (KC-3.1.I.A.ii, KC-3.1.I.C.ii, KC-3.1.I.A.iii)
- LO-F: Explain effects of exchange networks — diasporic communities, Zheng He. (KC-3.1.III.B, KC-3.2.II.A.iii)
- LO-G: Explain role of environmental factors (monsoon winds) in exchange networks. (KC-3.1.II.A.i)
- LO-H: Explain causes and effects of trans-Saharan trade growth — camel saddle, caravans. (KC-3.1.II.A.ii, KC-3.1.I.A.iv)
- LO-I: Explain how Mali's expansion influenced Afro-Eurasian trade. (KC-3.1.I.E.ii)
- LO-J: Explain intellectual and cultural effects of connectivity — gunpowder, paper, Buddhism spread, travelers. (KC-3.1.III.D, KC-3.3.II, KC-3.1.III.C)
- LO-K: Explain environmental effects of exchange networks — bubonic plague. (KC-3.1.IV)
- LO-L: Explain similarities and differences among exchange networks 1200–1450. (KC-3.1) — synthesis

**Key Terms (CED illustrative examples):**
Silk Roads, caravanserai, bills of exchange, banking houses, paper money, Kashgar, Samarkand, Mongol khanates (Golden Horde, Il-Khanate, Yuan Dynasty, Chagatai), Pax Mongolica, Indian Ocean trade, monsoon winds, compass, astrolabe, larger ship designs, dhow ships, junk ship, rudder, Swahili city-states, Gujarat, Sultanate of Malacca, diasporic communities, trans-Saharan trade, camel saddle, caravans, Mali Empire, Mansa Musa, Timbuktu, Ibn Battuta, Marco Polo, Margery Kempe, Zheng He, bubonic plague, gunpowder (from China), paper (from China), Uyghur script adoption

**Key Figures:** Ibn Battuta (Muslim traveler, documented trade networks), Marco Polo (Venetian traveler in Yuan China), Zheng He (Ming admiral, Indian Ocean expeditions), Mansa Musa (Mali emperor, hajj brought attention to West African wealth)

**Drill Candidates:**
- `definition_to_term`: Silk Roads, caravanserai, Pax Mongolica, bubonic plague, monsoon winds, bills of exchange, diaspora, dhow ships, junk ship, trans-Saharan trade, Indian Ocean trade, Golden Horde, Il-Khanate, Yuan Dynasty, gunpowder, paper money, magnetic compass, rudder, Swahili city-states
- `significance_to_person`: Ibn Battuta (traveled 75,000+ miles documenting Afro-Eurasian trade networks), Marco Polo (documented Mongol China for European audiences), Zheng He (led seven Chinese maritime expeditions across Indian Ocean, demonstrating Ming power), Mansa Musa (pilgrimage to Mecca demonstrated Mali's immense wealth and put sub-Saharan Africa on European maps)
- `significance_to_event`: Mongol conquests (created Pax Mongolica enabling unprecedented Eurasian trade and communication), Black Death spread (bubonic plague along trade routes killed 1/3 of Europe's population), Zheng He's voyages (Chinese maritime expansion and tribute trade in Indian Ocean)
- `concept_mc`: How caravanserais facilitated overland trade; why the Mongols promoted trade across Eurasia despite conquest; how the Black Death spread along trade networks; comparing Silk Roads and Indian Ocean trade

**is_key_term candidates (10):** Silk Roads, Pax Mongolica, caravanserai, bubonic plague, Indian Ocean trade, trans-Saharan trade, monsoon winds, Ibn Battuta, Zheng He, Mansa Musa

---

### Unit 3: Land-Based Empires (c. 1450–c. 1750)

**Topics (from CED):** 3.1 Empires Expand | 3.2 Empires: Administration | 3.3 Empires: Belief Systems | 3.4 Comparison in Land-Based Empires (skill synthesis)

**Learning Objectives:**
- LO-A: Explain how and why land-based empires developed and expanded 1450–1750. (KC-4.3.II, KC-4.3.II.B, KC-4.3.III.i) — gunpowder, Manchu, Mughal, Ottoman, Safavid
- LO-B: Explain how rulers legitimized and consolidated power. (KC-4.3.I.C, KC-4.3.I.A, KC-4.3.I.D) — devshirme, religious ideas, monumental architecture, tax farming
- LO-C: Explain continuity and change within belief systems 1450–1750. (KC-4.1.VI.i/ii/iii) — Protestant Reformation, Sunni-Shia split, Sikhism
- LO-D: Compare methods by which various empires increased influence 1450–1750. (KC-4.1, KC-4.3) — synthesis

**Key Terms (CED illustrative examples):**
Ottoman Empire, Mughal Empire, Manchu (Qing Dynasty), Safavid Empire, Songhai Empire, devshirme, janissaries, salaried samurai, zamindars, tax farming, millet system, jizya, divine right, Versailles, Taj Mahal (Mughal mausolea), Incan sun temple, Qing imperial portraits, Protestant Reformation, 95 Theses, Martin Luther, John Calvin, Counter-Reformation (Catholic Reformation), Jesuits, indulgence, simony, Sikhism, Sunni-Shia split, sakoku, Shogunate, daimyo, samurai, absolute monarchy, gunpowder empires, Safavid-Mughal conflict, Songhai-Morocco conflict, Thirty Years War

**Key Figures:** Martin Luther (Protestant Reformation), John Calvin (Calvinist theology)

**Drill Candidates:**
- `definition_to_term`: devshirme, janissaries, zamindars, tax farming, millet system, jizya, sakoku, shogunate, divine right, absolute monarchy, Sikhism, Protestant Reformation, Counter-Reformation, indulgence, simony, daimyo, samurai, gunpowder empires
- `significance_to_person`: Martin Luther (posted 95 Theses, launched Protestant Reformation), John Calvin (developed Calvinist theology, spread Protestantism to France/Scotland)
- `significance_to_event`: Protestant Reformation (broke Christian unity in Europe, sparked religious wars), Ottoman conquest (use of gunpowder to establish vast empire from SE Europe to North Africa), Safavid-Mughal conflict (intensified Sunni-Shia sectarian divide), Thirty Years War (1618–1648 European religious and political conflict), Taj Mahal construction (symbol of Mughal power and Islamic architecture)
- `concept_mc`: How the Ottoman devshirme system strengthened central authority; comparing methods of administrative control across the four gunpowder empires; how the Protestant Reformation changed European religious and political life; role of monumental architecture in legitimizing rule

**is_key_term candidates (10):** Ottoman Empire, Mughal Empire, devshirme, zamindars, millet system, Protestant Reformation, absolute monarchy, Safavid Empire, Qing Dynasty, gunpowder empires

---

### Unit 4: Transoceanic Interconnections (c. 1450–c. 1750)

**Topics (from CED):** 4.1 Technological Innovations 1450–1750 | 4.2 Exploration: Causes and Events | 4.3 Columbian Exchange | 4.4 Maritime Empires Established | 4.5 Maritime Empires Maintained and Developed | 4.6 Internal and External Challenges to State Power | 4.7 Changing Social Hierarchies | 4.8 Continuity and Change (skill synthesis)

**Learning Objectives:**
- LO-A: Explain how cross-cultural interactions resulted in tech diffusion 1450–1750. (KC-4.1.II, KC-4.1.II.A) — new tools, ship designs, wind/current knowledge
- LO-B: Describe the role of states in maritime exploration. (KC-4.1.III) — state-sponsored voyages
- LO-C: Explain economic causes and effects of maritime exploration. (KC-4.1.III.A/B/C) — Portuguese trading post empire, Spanish Atlantic/Pacific expansion, N. Atlantic crossings
- LO-D: Explain causes of Columbian Exchange and effects on Eastern/Western hemispheres. (KC-4.1.V.A/B/C/D) — disease, crops, animals, population collapse
- LO-E: Explain state building and expansion among maritime empires. (KC-4.3.II.A.i, KC-4.3.II.C, KC-4.3.II.A.ii) — European maritime empires, Asante, Kingdom of Kongo; Ming and Tokugawa restrictive policies
- LO-F: Explain how maritime empires established economic dominance. (KC-4.3.II.A.iii)
- LO-G: Explain how various empires maintained their power through bureaucracy and administration.
- LO-H: Explain internal and external challenges affecting social, economic, and political structures.
- LO-I: Explain how and why social hierarchies developed and changed 1450–1750 — casta system.
- LO-J: Explain continuities and changes in systems of slavery — chattel slavery.
- LO-K: Explain similarities and differences in how states exercised power.
- LO-M: Explain changes in social structures from global economic integration.
- LO-N: Explain the extent to which transoceanic voyages brought change 1450–1750.

**Key Terms (CED illustrative examples and vocab list):**
Columbian Exchange, caravel, carrack, fluyt, astrolabe, magnetic compass, Portuguese trading post empire, Dutch East India Company (VOC), British East India Company, encomienda, hacienda, chattel slavery, coercive labor, Triangular Trade, bullion, mercantilism, peninsulares, creoles, mulatto, mestizo, casta paintings, mita system, The Great Dying, Vodun/Voodoo, Santeria, indentured servitude, joint-stock company, royal chartered monopoly companies, Asante, Kingdom of Kongo, Ming China (isolationism), Tokugawa Japan (sakoku), Columbian Exchange biological transfers (smallpox, horses, pigs, cattle, potatoes, tomatoes, sugar), Nat Turner's Rebellion (from vocab list)

**Key Figures:** Christopher Columbus (Spanish-sponsored Atlantic voyage 1492), Ferdinand Magellan (first circumnavigation 1519–1522), Vasco da Gama (Portuguese sea route to India 1498), Henry the Navigator (Portuguese exploration of West African coast)

**Drill Candidates:**
- `definition_to_term`: Columbian Exchange, encomienda, hacienda, chattel slavery, coercive labor, Triangular Trade, mercantilism, bullion, joint-stock company, mita system, The Great Dying, peninsulares, creoles, mestizo, mulatto, casta paintings, indentured servitude, royal chartered monopoly, trading post empire
- `significance_to_person`: Christopher Columbus (1492 Atlantic voyage linking Western and Eastern hemispheres), Ferdinand Magellan (led first circumnavigation, proving Earth's circumference), Vasco da Gama (established Portuguese sea route to India, bypassing Ottoman-controlled overland routes), Henry the Navigator (sponsored Portuguese exploration of African coast, setting stage for Atlantic expansion)
- `significance_to_event`: Columbian Exchange (transfer of crops, animals, and diseases between hemispheres; population collapse in Americas), The Great Dying (80–95% population loss of indigenous Americans from disease), establishment of Atlantic slave trade (transformed African demographics and created new labor systems), casta system development (racial hierarchy in Spanish colonial Americas)
- `concept_mc`: How joint-stock companies enabled European colonial expansion; why the Columbian Exchange had asymmetrical demographic effects; how casta hierarchy reinforced Spanish colonial power; how Ming China's and Tokugawa Japan's isolationist policies differed from European expansionism

**is_key_term candidates (10):** Columbian Exchange, encomienda, chattel slavery, mercantilism, Dutch East India Company, joint-stock company, Triangular Trade, coercive labor, The Great Dying, peninsulares

---

### Unit 5: Revolutions (c. 1750–c. 1900)

**Topics (from CED):** 5.1 The Enlightenment | 5.2 Nationalism and Revolutions 1750–1900 | 5.3 Industrial Revolution Begins | 5.4 Industrialization Spreads | 5.5 Technology of the Industrial Age | 5.6 Industrialization: Government's Role | 5.7 Economic Developments and Innovations | 5.8 Reactions to the Industrial Economy | 5.9 Society and the Industrial Age | 5.10 Continuity and Change (skill synthesis)

**Learning Objectives:**
- LO-A: Explain the intellectual/ideological context for Atlantic revolutions 1750–1900. (KC-5.3.I.A, KC-5.3.I, KC-5.3.II.i) — Enlightenment, natural rights, social contract, nationalism
- LO-B: Explain how Enlightenment affected societies — suffrage, abolition, end of serfdom, feminism. (KC-5.3.I.C, KC-5.3.IV.B)
- LO-C: Explain causes and effects of various revolutions 1750–1900. (KC-5.3.II.ii, KC-5.3, KC-5.3.IV.A.i, KC-5.3.III.B, KC-5.3.I.B, KC-5.3.II.iii) — American, French, Haitian, Latin American revolutions; nationalism and unification
- LO-D: Explain how environmental factors contributed to industrialization. (KC-5.1.I.A, KC-5.1.I.C) — waterways, coal, iron, factory system
- LO-E: Explain how modes/locations of production changed — steam power, global manufacturing shift. (KC-5.1.II.B, KC-5.1.I.D)
- LO-F: Explain how technology shaped economic production — steam engine, Second Industrial Revolution, railroads, telegraph. (KC-5.1.I.B, KC-5.1.I.E, KC-5.1.IV)
- LO-G: Explain economic strategies of states — Meiji Japan, Muhammad Ali's Egypt. (KC-5.1.V.C, KC-5.2.II.A)
- LO-H: Explain development of economic systems — laissez-faire, Adam Smith, transnational business. (KC-5.1.III.A, KC-5.1.III.B, KC-5.1)
- LO-I: Explain causes/effects of calls for change — labor unions, socialism, communism, reform. (KC-5.1.V.D, KC-5.1.V.A, KC-5.3.IV.A.ii, KC-5.1.V.B)
- LO-J: Explain how industrialization changed social hierarchies — new middle class, industrial working class, urbanization, gender roles. (KC-5.1.VI.A/B/C)
- LO-K: Explain the extent to which industrialization brought change 1750–1900. (KC-5.1, KC-5.3) — synthesis

**Key Terms (CED and vocab list):**
Enlightenment, natural rights, social contract, liberalism, empiricism, deism, nationalism, Declaration of Independence, Declaration of the Rights of Man and Citizen, Jamaica Letter, Haitian Revolution, Toussaint L'Ouverture, Simon Bolivar, Reign of Terror, French Revolution, American Revolution, Latin American independence, Mary Wollstonecraft, suffrage, feminism, end of serfdom, Industrial Revolution, Second Industrial Revolution, factory system, cottage industry, enclosure movement, crop rotation, spinning jenny, seed drill, steam engine, telegraph, railroads, steamships, bourgeoisie, proletariat, labor union, capitalism, socialism, communism, Karl Marx, laissez-faire, Adam Smith, Wealth of Nations, Meiji Restoration, Muhammad Ali, Self-Strengthening Movement, Tanzimat Reforms, Young Turks, Otto von Bismarck, Realpolitik, HSBC, transnational corporations, urbanization, middle class

**Key Figures:** Karl Marx, Adam Smith, Mary Wollstonecraft, Toussaint L'Ouverture, Simon Bolivar, Otto von Bismarck, Muhammad Ali

**Drill Candidates:**
- `definition_to_term`: Enlightenment, natural rights, social contract, bourgeoisie, proletariat, labor union, capitalism, socialism, communism, laissez-faire, enclosure movement, factory system, cottage industry, steam engine, spinning jenny, seed drill, urbanization, nationalism, liberalism, Realpolitik, Tanzimat Reforms, Self-Strengthening Movement, end of serfdom
- `significance_to_person`: Karl Marx (Communist Manifesto; critique of capitalism; scientific socialism), Adam Smith (Wealth of Nations; theorized laissez-faire capitalism and free markets), Mary Wollstonecraft (A Vindication of the Rights of Woman; feminist political philosophy), Toussaint L'Ouverture (led Haitian Revolution, first successful slave uprising creating independent black republic), Simon Bolivar (led multiple South American independence movements; "Jamaica Letter"), Otto von Bismarck (unified German states through Realpolitik and wars)
- `significance_to_event`: French Revolution (radical political transformation; Declaration of Rights of Man; Reign of Terror; nationalism), Haitian Revolution (1791–1804; only successful slave revolution; created independent Caribbean nation), Meiji Restoration (1868; Japan rapidly industrialized and modernized to resist Western imperialism), Industrial Revolution (shift from agrarian to factory production; transformed global economy and society), American Revolution (1776; established democratic republic as model for later revolutions)
- `concept_mc`: How Enlightenment ideas influenced Atlantic revolutions; why industrialization began in Britain rather than elsewhere; how labor unions responded to industrial capitalism; comparing causes of the American and Haitian revolutions

**is_key_term candidates (10):** Enlightenment, bourgeoisie, proletariat, Industrial Revolution, Karl Marx, laissez-faire, nationalism, labor union, Meiji Restoration, social contract

---

### Unit 6: Consequences of Industrialization (c. 1750–c. 1900)

**Topics (from CED):** 6.1 Rationales for Imperialism | 6.2 State Expansion 1750–1900 | 6.3 Indigenous Responses to State Expansion | 6.4 Global Economic Development | 6.5 Economic Imperialism | 6.6 Causes of Migration | 6.7 Effects of Migration | 6.8 Causation in the Imperial Age (skill synthesis)

**Learning Objectives:**
- LO-A: Explain how ideologies contributed to imperialism — Social Darwinism, civilizing mission, nationalism, religious conversion. (KC-5.2.III)
- LO-B: Explain how states expanded — settler colonies, shift from company to state control (Belgian Congo, Dutch East Indies). (KC-5.2, KC-4.3.II)
- LO-C: Explain significance of a source's point of view/purpose/situation in context of imperialism.
- LO-D: Explain how imperialism affected existing social structures in colonized regions.
- LO-E: Explain how economic imperialism operated — Opium Wars, spheres of influence, Treaty of Nanjing. (KC-5.2.I)
- LO-F: Explain causes of migration — indentured servitude, ethnic enclaves, White Australia Policy, Chinese Exclusion Act. (KC-5.4.I)
- LO-G: Explain effects of migration on sending and receiving societies. (KC-5.4.II)
- LO-H: Explain how point of view/purpose affects interpretation of sources about imperialism.
- LO-I: Explain relative significance of causes of the Age of Imperialism.

**Key Terms (CED and vocab list):**
Social Darwinism, White Man's Burden, civilizing mission, Berlin Conference, settler colony, Belgian Congo, Treaty of Nanjing, economic imperialism, spheres of influence, Opium Wars, Indian Revolt of 1857, Boxer Rebellion, Taiping Rebellion, White Australia Policy, Chinese Exclusion Act, ethnic enclave, indentured servitude, "Scramble for Africa," Sepoy Mutiny, British East India Company (transition to Crown rule)

**Key Figures:** King Leopold II (private ownership and brutal exploitation of Belgian Congo)

**Drill Candidates:**
- `definition_to_term`: Social Darwinism, White Man's Burden, civilizing mission, settler colony, economic imperialism, spheres of influence, ethnic enclave, Berlin Conference, indentured servitude, "Scramble for Africa"
- `significance_to_person`: King Leopold II (used Belgian Congo as personal colony; brutal forced labor for rubber; eventually transferred to Belgian state)
- `significance_to_event`: Berlin Conference (1884–85; European powers divided Africa without African consent, ignoring existing political structures), Opium Wars (1839–42; Britain forced China to open trade and cede Hong Kong; Treaty of Nanjing; established spheres of influence model), Indian Revolt of 1857 / Sepoy Mutiny (led to end of British East India Company rule, India became Crown colony), Boxer Rebellion (Chinese nationalist uprising against foreign imperialism), Taiping Rebellion (massive civil war 1850–64, partly fueled by foreign pressure and economic disruption)
- `concept_mc`: How Social Darwinism provided ideological justification for imperialism; how settler colonies differed from exploitation colonies; effects of migration on ethnic communities in receiving countries; how the Berlin Conference formalized European imperialism in Africa

**is_key_term candidates (8):** Social Darwinism, civilizing mission, Berlin Conference, economic imperialism, spheres of influence, settler colony, Opium Wars, indentured servitude

---

### Unit 7: Global Conflict (c. 1900–present)

**Topics (from CED):** 7.1 Shifting Power After 1900 | 7.2 Causes of World War I | 7.3 Conducting World War I | 7.4 Economy in the Interwar Period | 7.5 Unresolved Tensions After WWI | 7.6 Causes of World War II | 7.7 Conducting World War II | 7.8 Mass Atrocities After 1900 | 7.9 Causation in Global Conflict (skill synthesis)

**Learning Objectives:**
- LO-A: Explain how internal/external factors contributed to change in states after 1900. (KC-6.2.I, KC-6.2.I.A, KC-6.2.II.D) — Ottoman/Russian/Qing collapse, Mexican Revolution
- LO-B: Explain causes and consequences of WWI. (KC-6.2.IV.B.i) — imperialism, territorial conflict, alliance system, nationalism
- LO-C: Explain how governments used methods to conduct war — total war, propaganda, mobilization. (KC-6.2.IV.A.i, KC-6.1.III.C.i)
- LO-D: Explain how governments responded to economic crisis after 1900 — Great Depression, New Deal, Five Year Plans, fascist corporatist economy. (KC-6.3.I.B, KC-6.3.I.A.i)
- LO-E: Explain continuities and changes in territorial holdings after WWI — mandate system, Indian National Congress. (KC-6.2.I.B)
- LO-F: Explain causes and consequences of WWII. (KC-6.2.IV.B.ii) — Treaty of Versailles, Great Depression, fascism, Hitler's militarism
- LO-G: Explain similarities and differences in how governments conducted WWII — totalitarianism, fascism, communism, atomic bomb. (KC-6.2.IV.A.ii, KC-6.1.III.C.ii)
- LO-H: Explain causes and consequences of mass atrocities 1900–present. (KC-6.2.III.C) — Holocaust, Armenian Genocide, Rwanda, Cambodia, Ukraine
- LO-I: Explain relative significance of causes of global conflict 1900–present. (KC-6.1, KC-6.2) — synthesis

**Key Terms (CED and vocab list):**
World War I, Central Powers, Allied Powers, trench warfare, total war, militarism, reparations, Treaty of Versailles, Paris Peace Conference, Fourteen Points, League of Nations, stalemate, Armenian Genocide, mandate system, Bolsheviks, Russian Revolution, Weimar Republic, Great Depression, Five Year Plans, collectivization, New Deal, fascism, fascist corporatist economy, totalitarianism, genocide, Holocaust, World War II, atomic bomb, fire bombing, propaganda, Zionism, Balfour Declaration, Mao Zedong, Mexican Revolution, Rwandan Genocide

**Key Figures:** Mao Zedong (CED illustrative example for WWI era state challenges)

**Drill Candidates:**
- `definition_to_term`: totalitarianism, fascism, trench warfare, total war, militarism, reparations, mandate system, stalemate, Five Year Plans, collectivization, genocide, Weimar Republic, Bolsheviks, propaganda, Zionism
- `significance_to_person`: Mao Zedong (led Chinese Communist Revolution; established People's Republic of China)
- `significance_to_event`: Armenian Genocide (1915–1923; Ottoman government's systematic extermination of Armenians; one of 20th century's first genocides), Treaty of Versailles (harsh peace terms blamed Germany; created conditions for WWII), Holocaust (Nazi systematic murder of ~6 million Jews and millions of others during WWII), Russian Revolution (Bolshevik seizure of power 1917; created first communist state), Rwandan Genocide (1994; ~800,000 Tutsi killed in 100 days; failure of international community to intervene), Mexican Revolution (1910–1920; overthrow of Porfirio Díaz; political and land reform)
- `concept_mc`: How WWI exemplified "total war" mobilization; why the Treaty of Versailles contributed to the rise of fascism and WWII; how propaganda was used to mobilize civilian populations in both world wars; comparing the causes of WWI and WWII

**is_key_term candidates (10):** totalitarianism, fascism, genocide, Holocaust, total war, mandate system, Bolsheviks, Armenian Genocide, Five Year Plans, Treaty of Versailles

---

### Unit 8: Cold War and Decolonization (c. 1900–present)

**Topics (from CED):** 8.1 Setting the Stage for the Cold War and Decolonization | 8.2 The Cold War | 8.3 Effects of the Cold War | 8.4 Spread of Communism After 1900 | 8.5 Decolonization After 1900 | 8.6 Newly Independent States | 8.7 Global Economic Development | 8.8 End of the Cold War | 8.9 Causation in the Age of the Cold War (skill synthesis)

**Learning Objectives:**
- LO-A: Explain historical context of the Cold War after 1945. (KC-6.2.II, KC-6.2.IV.C.i) — anti-imperialism, balance of power shift
- LO-B: Explain causes and effects of the ideological struggle — capitalism vs. communism, Non-Aligned Movement. (KC-6.2.IV.C.ii, KC-6.2.V.B)
- LO-C: Compare how US and USSR maintained influence — NATO, Warsaw Pact, proxy wars. (KC-6.2.IV.D)
- LO-D: Explain causes and consequences of China's adoption of communism — Great Leap Forward. (KC-6.2.I.i, KC-6.3.I.A.ii)
- LO-E: Explain causes and effects of movements to redistribute economic resources — land reform, White Revolution. (KC-6.2.II.D.i)
- LO-F: Compare processes by which peoples pursued independence — negotiated vs. armed struggle. (KC-6.2.II.A, KC-6.2.I.C, KC-6.2.II.B)
- LO-G: Explain how political changes led to territorial, demographic, and nationalist developments — Partition of India, creation of Israel. (KC-6.2.III.A.i/ii)
- LO-H: Explain economic development and government policies in newly independent states.
- LO-I: Explain how economies developed differently across regions after independence.
- LO-J: Explain continuities/changes in social hierarchies post-decolonization.
- LO-K: Explain the extent to which the Cold War produced change.

**Key Terms (CED and vocab list):**
Cold War, containment, domino theory, Truman Doctrine, Marshall Plan, NATO, Warsaw Pact, proxy war, Korean War, Non-Alignment Movement, Iron Curtain, Glasnost, Perestroika, Great Leap Forward, Cultural Revolution, apartheid, Indian National Congress, Muslim League, Partition of India, Gamal Abdel Nasser, Ho Chi Minh, Mohandas Gandhi, Nelson Mandela, Martin Luther King Jr., decolonization, land redistribution, White Revolution (Iran), Al Qaeda, United Nations, imperial metropoles

**Key Figures (CED illustrative examples):** Gamal Abdel Nasser (Egyptian nationalism, Suez Crisis), Ho Chi Minh (Vietnamese independence/communism), Mohandas Gandhi (Indian nonviolent resistance), Nelson Mandela (South African anti-apartheid), Martin Luther King Jr. (US Civil Rights movement), Sukarno and Kwame Nkrumah (Non-Aligned Movement), Mao Zedong (Great Leap Forward, Cultural Revolution)

**Drill Candidates:**
- `definition_to_term`: Cold War, containment, domino theory, proxy war, Non-Alignment Movement, Iron Curtain, Glasnost, Perestroika, apartheid, decolonization, Great Leap Forward, Cultural Revolution, land redistribution, Truman Doctrine, Marshall Plan, imperial metropoles
- `significance_to_person`: Mohandas Gandhi (led nonviolent Indian independence movement using civil disobedience), Ho Chi Minh (led Vietnamese communist resistance against France and US), Gamal Abdel Nasser (nationalized Suez Canal; Pan-Arab nationalism; Non-Alignment), Nelson Mandela (imprisoned 27 years for opposing apartheid; became South Africa's first black president), Martin Luther King Jr. (led US Civil Rights Movement using nonviolent resistance)
- `significance_to_event`: Partition of India (1947 independence from Britain; violent division into Hindu India and Muslim Pakistan; ~14 million displaced), Marshall Plan (US postwar reconstruction aid to Western Europe; contained Soviet influence), Great Leap Forward (1958–62; disastrous Chinese collectivization; ~15–55 million deaths from famine), Korean War (first major Cold War proxy conflict; ended in armistice), Cultural Revolution (Mao's purge of "capitalist" elements; ~1–2 million deaths; cultural destruction)
- `concept_mc`: How the Non-Aligned Movement challenged Cold War bipolarity; how decolonization differed between negotiated and armed independence movements; effects of Cold War competition on newly independent states in Asia and Africa; comparing containment policies in Korea and Vietnam

**is_key_term candidates (10):** Cold War, containment, proxy war, apartheid, decolonization, Non-Alignment Movement, Glasnost, Partition of India, Marshall Plan, Great Leap Forward

---

### Unit 9: Globalization (c. 1900–present)

**Topics (from CED):** 9.1 Technological Advances After 1900 | 9.2 Technological Advances and Limitations: Disease | 9.3 Technological Advances: Debates About the Environment | 9.4 Economics in the Global Age | 9.5 Calls for Reform and Responses After 1900 | 9.6 Globalized Culture After 1900 | 9.7 Resistance to Globalization | 9.8 Institutions Developing in a Globalized World | 9.9 Continuity and Change (skill synthesis)

**Learning Objectives:**
- LO-A: Explain how new technologies changed the world 1900–present. (KC-6.1.I.A/B/C/D, KC-6.1.III.B) — radio/internet/air travel, Green Revolution, birth control, vaccines, petroleum/nuclear energy
- LO-B: Explain how environmental factors affected human populations — disease epidemics, longevity. (KC-6.1.III, KC-6.1.III.A) — 1918 flu, HIV/AIDS, Ebola, malaria, Alzheimer's
- LO-C: Explain causes and effects of environmental changes 1900–present — deforestation, climate change. (KC-6.1.II.A/B)
- LO-D: Explain continuities and changes in global economy — free market, knowledge economy, WTO, NAFTA, ASEAN, MNCs. (KC-6.3.I.D/E, KC-6.3.II.B)
- LO-E: Explain how social categories and practices were challenged — UDHR, feminism, caste reservation, apartheid end, Greenpeace. (KC-6.3.III.i/ii, KC-6.3.II.C)
- LO-F: Explain how and why globalization changed culture — Bollywood, global brands, consumer culture. (KC-6.3.IV.i/ii/iii)
- LO-G: Explain responses to globalization — anti-IMF activism, locally developed social media. (KC-6.3.IV.iv)
- LO-H: Explain how globalization changed international interactions — United Nations, international organizations. (KC-6.3.II.A)
- LO-I: Explain the extent to which science and technology brought change 1900–present. (KC-6.1) — synthesis

**Key Terms (CED and vocab list):**
Green Revolution, 1918 influenza pandemic, Alzheimer's disease, malaria, HIV/AIDS, Ebola, climate change, WTO (World Trade Organization), NAFTA, ASEAN, European Union, trading bloc, multinational corporation (MNC), knowledge economy, manufacturing economy, consumerism, Bollywood, Universal Declaration of Human Rights, Greenpeace, Ronald Reagan, Margaret Thatcher, Deng Xiaoping, caste reservation system, United Nations, World Bank, globalization, deforestation

**Key Figures (CED illustrative examples):** Ronald Reagan (free market economic policies), Margaret Thatcher (privatization and neoliberalism), Deng Xiaoping (Chinese market reforms)

**Drill Candidates:**
- `definition_to_term`: Green Revolution, multinational corporation (MNC), knowledge economy, trading bloc, globalization, consumerism, WTO, NAFTA, ASEAN, European Union, climate change, Universal Declaration of Human Rights, deforestation, caste reservation system
- `significance_to_person`: Ronald Reagan (promoted free market deregulation and neoliberal economic policies in the US, reducing government intervention), Margaret Thatcher (implemented privatization and free market reforms in UK; reduced social welfare state), Deng Xiaoping (opened China to foreign investment and market reforms after 1978, transforming Chinese economy)
- `significance_to_event`: 1918 Influenza Pandemic (deadliest pandemic of 20th century; ~50–100 million deaths globally; demonstrated global health vulnerability), Green Revolution (1940s–1970s; agricultural technology dramatically increased food production in developing world), formation of the United Nations (1945; multilateral institution for collective security and global cooperation), end of apartheid (1994; South Africa's first multiracial democratic elections)
- `concept_mc`: How free-market policies under Reagan/Thatcher changed global economic landscape; how the Green Revolution both solved and created environmental problems; how resistance to cultural globalization manifests; comparing WTO, NAFTA, and ASEAN as trading blocs

**is_key_term candidates (8):** Green Revolution, globalization, multinational corporation, WTO, Universal Declaration of Human Rights, climate change, knowledge economy, consumerism

---

## Content Planning Notes

### Cross-Unit Patterns and Planner Guidance

1. **Periodization is the primary skill.** Every unit ends with a synthesis/comparison topic (1.7, 2.7, 3.4, 4.8, 5.10, 6.8, 7.9, 9.9). `significance_to_event` drill cards should emphasize CCOT and causation, not just naming events. Prompts should describe impact/significance and ask for the event name.

2. **Stimulus rate: ~95%.** World History has the highest stimulus rate of all subjects. Nearly every MCQ must have a primary text, secondary text, table, or chart stimulus. Stimuli types by priority:
   - Text passages (most common): primary source excerpts (letters, edicts, chronicles, political documents), secondary source excerpts (historian interpretations)
   - Tables: trade network comparisons, demographic data, empire comparison matrices
   - Charts: population graphs pre/post events, trade volume over time, migration flows
   - No code stimuli

3. **Reasoning process targeting for concept_mc:**
   - Causation: "Which best explains the cause of X?" / "What was the most significant effect of Y?"
   - Comparison: "In what way were X and Y similar/different?"
   - CCOT: "Which best describes a continuity between the period before and after X?"
   - Contextualization: "Which development provides the best historical context for..."

4. **Typed:MC split = 75:25.** For a unit with 40 drill cards: ~30 typed-recall (definition_to_term + significance_to_person + significance_to_event), ~10 concept_mc. Distribute concept_mc evenly across the unit's topics.

5. **Vocab list minimum.** Every term in `vocab-list.md` must have a drill card. CED illustrative examples add additional required coverage. When a vocab list term is a person, use `significance_to_person`; when it is an event, use `significance_to_event`; when it is a concept/system, use `definition_to_term`.

6. **No `name_to_formula`, no `significance_to_case`.** World History is humanities-only; no formulas and no Supreme Court cases.

### Study Guide Notes

- No `formulas` section needed — World History has no mathematical content
- `core_concepts` should be 5–8 precise statements directly tied to CED learning objectives
- `exam_tip` should reference the dominant reasoning skill for that unit:
  - Units 1–2: comparison and contextualization (comparing civilizations, contextualizing exchange networks)
  - Units 3–4: causation and CCOT (causes of empire expansion; effects of Columbian Exchange)
  - Units 5–6: causation (causes of revolutions and industrialization; effects of imperialism)
  - Units 7–9: causation and CCOT (causes of world wars; effects of Cold War; continuities in globalization)
- `diagrams` optional but high value for: Unit 2 (trade routes table), Unit 4 (Columbian Exchange table), Unit 9 (economic data chart)

---

## Confidence Assessment

| Area | Level | Reason |
|------|-------|--------|
| Unit names and weights | HIGH | Verified directly from CED PDF p. 17–18, 195–196 |
| Learning objectives | HIGH | Verbatim from CED unit topic pages |
| Illustrative examples | HIGH | Verbatim from CED illustrative example boxes |
| Drill mode assignments | HIGH | Cross-referenced with PRD.md and drill.schema.json |
| MCQ stimulus rates | HIGH | Specified in CONTEXT.md and CLAUDE.md |
| Quality gate requirements | HIGH | Verified from CONTENT-WAVES.md |
| Exam format (MCQ count, timing) | HIGH | Verified from CED Exam Overview p. 195 |

**Research date:** 2026-03-27
**Valid until:** 2027-03-01 (CED is "Effective Fall 2023" — stable until CB releases new version)

---

## RESEARCH COMPLETE

**Ready for:** Planner — generate PLAN.md with per-unit topic map, stimulus type assignments, difficulty distribution, and drill coverage checklist.
