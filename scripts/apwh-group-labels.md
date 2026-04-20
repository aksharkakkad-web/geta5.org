# APWH Drill Group Label Mappings

Used by Writer subagents regenerating each unit. Labels merge PDF region-terms and region-people clusters into single sections.

Duplicate terms across PDF groups (e.g. Ibn Battuta, Marco Polo listed twice within a unit) are included **once** — assign to the most contextually relevant group.

---

## Unit 1 — The Global Tapestry (158 cards)

| PDF group index | Terms (sample) | Label |
|---|---|---|
| 0, 1 | Neo-Confucianism, Song Dynasty, Kublai Khan, Zheng He | **East Asia** |
| 2, 4 | Hinduism, Delhi Sultanate, Tamerlane | **South Asia** |
| 3 | Dhow, Junk, Khmer, Srivijaya, Melaka | **Southeast Asia** |
| 5, 7 | Caliphate, Sunni, Sufism, Prophet Muhammad, Ibn Battuta | **Islamic World** |
| 6, 8, 9 | Mexica (Aztec), Tenochtitlan, Inca, Pachacuti, Cahokia, Polynesia | **Mesoamerica & Andes** / **Americas & Pacific** (split at Cahokia) |
| 10, 11 | Bantu, Mali Empire, Mansa Musa, Sundiata Keita | **Africa** |
| 12, 13, 14 | Feudalism, Crusades, Renaissance, Pope Urban II | **Europe** |

## Unit 2 — Networks of Exchange (~44 unique cards; dedupe Genghis/Kublai/Ibn Battuta/Marco Polo/Zheng He)

| PDF group | Label |
|---|---|
| 0 | **Silk Roads** |
| 1 | **Indian Ocean** |
| 2, 5 | **Global Travelers** (Marco Polo, Ibn Battuta, Zheng He) — merge with Silk Roads if easier; use **Silk Roads** for Ibn Battuta/Marco Polo; **Indian Ocean** for Zheng He |
| 3, 4 | **Mongol Empire** |
| 6 | SKIP (cross-reference to Unit 1) |

**Final labels:** Silk Roads, Indian Ocean, Mongol Empire

## Unit 3 — Land-Based Empires (~140 cards)

| PDF group | Label |
|---|---|
| 0, 1 | **East Asia (Ming/Qing)** |
| 2, 3 | **Russia** |
| 4, 7 | **Ottoman** |
| 5, 6 | **Safavid** |
| 8, 11 | **Mughal** |
| 9, 10 | **Songhai** |
| 12, 13 | **Tokugawa Japan** |
| 14, 15 | **Absolutism** |
| 16, 17 | **Renaissance** |
| 18, 19, 20 | **Reformation** |

## Unit 4 — Transoceanic Interconnections (~87 cards)

| PDF group | Label |
|---|---|
| 0 | **Maritime Technology** |
| 1, 2, 3, 4, 5, 6, 7 | **European Exploration** |
| 8, 9 | **Columbian Exchange** |
| 10 | **Cultural & Religious Change** (Our Lady of Guadalupe, Tokugawa Ieyasu) |
| 11 | **Atlantic System & Economy** |
| 12, 13 | **Resistance** |
| 14, 15 | **Social Hierarchy** |

## Unit 5 — Revolutions (~150 cards; dedupe "Reason", "Bourgeoise")

| PDF group | Label |
|---|---|
| 0, 1 | **Scientific Revolution** |
| 2, 3 | **Enlightenment** |
| 4, 5 | **Political Revolutions** |
| 6 | **Industrial Revolution** |
| 7, 8, 9, 10 | **Industrial Spread** (American System, Meiji Restoration, Tanzimat) |
| 11, 13 | **Technology & Inventors** |
| 12, 14 | **Capitalism** |
| 15, 16 | **Reactions & Reform** |
| 17, 18 | **Social Conditions** |

## Unit 6 — Consequences of Industrialization (~83 cards)

| PDF group | Label |
|---|---|
| 0, 2, 3, 4 | **Imperialism Ideology** |
| 1, 5 | **Resistance & Conflict** |
| 6, 7, 8 | **Economic Imperialism** |
| 9, 10, 11 | **Migration** |

## Unit 7 — Global Conflict (~130 unique cards; dedupe Sun Yat-Sen, Hitler, Stalin, Gandhi, Armenian Genocide, Spanish Civil War, Neutrality; merges Part II into main)

| PDF group | Label |
|---|---|
| 0, 2 | **Interwar Revolutions** |
| 1, 3, 4, 5 | **WWI** |
| 6, 7 | **Interwar Economics** |
| 8, 9, 10, 14 | **WWII Origins** |
| 11, 12 | **WWII Combat** |
| 13, 15 | **Genocide** |

## Unit 8 — Cold War and Decolonization (~128 unique cards; dedupe Truman, Marshall, LBJ, Nixon, Ford, Reagan, Gorbachev, Civil Disobedience, Long March, Chinese Civil War, Khmer Rouge, Killing Fields, Spanish Civil War, Nasser, Jinnah, Indira Gandhi)

| PDF group | Label |
|---|---|
| 0, 1 | **Cold War Origins** |
| 2, 3 | **Cold War Alliances** |
| 4, 5 | **Cold War Conflicts** |
| 6, 7 | **Chinese Communism** |
| 8, 10 | **Decolonization** |
| 9, 11 | **Apartheid & Terrorism** |
| 12, 13 | **Middle East & Africa** |
| 14, 15 | **Late Cold War** |

## Unit 9 — Globalization (~90 unique cards; dedupe Reagan, Pinochet, Deng, Nkrumah, Mandela, Pan-Africanism)

| PDF group | Label |
|---|---|
| 0, 1 | **Technology** |
| 2 | **Environment** |
| 3, 5 | **Disease & Health** |
| 4, 6, 10 (IMF) | **Economics** |
| 7, 10 (Weibo), 11 | **Culture** |
| 8, 9 | **Human Rights** |
| 12 | **International Organizations** |

---

## Key-term selection guidance (per unit)

Pick **12** `is_key_term: true` cards per unit, covering the highest-yield items any AP World History teacher would call essential:

- **U2:** Silk Roads, Indian Ocean trade, Pax Mongolica, Genghis Khan, Kublai Khan, Golden Horde, Bubonic Plague, Yuan Dynasty, Caravanserai, Monsoon Winds, Khanate, Zheng He
- **U3:** Ming Dynasty, Qing Dynasty, Ottoman Empire, Safavid Empire, Mughal Empire, Protestant Reformation (95 Theses or Martin Luther), Counter-Reformation, Renaissance, Humanism, Akbar the Great, Suleiman I, Peter the Great
- **U4:** Columbian Exchange (or Smallpox), Treaty of Tordesillas, Mercantilism, Joint Stock Company, Triangle Trade - Atlantic System, Middle Passage, Encomienda, Trans-Atlantic Slave Trade, Chattel Slavery, Castas System, Caravel, Hernan Cortes
- **U5:** Scientific Method, Enlightenment (or Social Contract), Declaration of Independence, Reign of Terror, Napoleon Bonaparte, Industrialization, Steam Engine, Karl Marx, Communist Manifesto, Capitalism, Seneca Falls Convention, Meiji Restoration
- **U6:** Imperialism, Social Darwinism, White Man's Burden, Scramble for Africa, Berlin Conference, Sepoy Mutiny, Opium Wars, Boxer Rebellion, Suez Canal, Monoculture, Indentured Servitude, Chinese Exclusion Act
- **U7:** Trench Warfare, Total War, Treaty of Versailles, League of Nations, Bolshevik Revolution, Great Depression, Fascism, Appeasement, Blitzkrieg, Pearl Harbor, Holocaust, Hiroshima
- **U8:** Cold War, Truman Doctrine, Marshall Plan, NATO, Warsaw Pact, Iron Curtain, Cuban Missile Crisis, Vietnam Conflict, Great Leap Forward, Cultural Revolution, Apartheid, Perestroika
- **U9:** Green Revolution, Climate Change, HIV/AIDS, Reaganomics, WTO, NAFTA, UN Declaration of Human Rights, Feminism, Pan-Africanism, Nelson Mandela, Multinational Corporations, Internet

## Difficulty spread target (per unit)

20% easy / 45% medium / 35% hard. For a 100-card unit: ~20 easy, ~45 medium, ~35 hard. ±3 tolerance.

## Mode assignment rules

- **Person** → `significance_to_person`
- **Named event/war/battle/movement** (Crusades, Opium Wars, Cultural Revolution) → `significance_to_event`
- **Landmark document/institution/text** (Treaty of Tordesillas, Communist Manifesto, UN Declaration of Human Rights) → `significance_to_case`
- **Everything else** (concepts, places, technologies, systems) → `definition_to_term`
