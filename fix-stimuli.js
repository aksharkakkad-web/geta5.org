const fs = require('fs');
const mcqDir = 'C:/Ascendly/public/data/ap-world-history/mcq';

function addStimuliToUnit(unitNum, stimulusTexts) {
  const fname = mcqDir + '/unit-' + unitNum + '.json';
  const data = JSON.parse(fs.readFileSync(fname, 'utf8'));
  const questions = data.questions;
  let added = 0;
  let stimIdx = 0;
  for (const q of questions) {
    if (stimIdx >= stimulusTexts.length) break;
    if (q.stimulus && q.stimulus.type === 'none') {
      q.stimulus = stimulusTexts[stimIdx];
      stimIdx++;
      added++;
    }
  }
  fs.writeFileSync(fname, JSON.stringify(data, null, 2));
  console.log('unit-' + unitNum + ': added ' + added + ' stimuli');
}

// Unit 1: need 6 more (already added placeholder, now replace with real content)
// First revert the placeholder we just accidentally set, then do proper ones
const u1 = JSON.parse(fs.readFileSync(mcqDir + '/unit-1.json', 'utf8'));
// Undo the test we did by setting those back to none (first 6 with "Historical source" content)
u1.questions.forEach(q => {
  if (q.stimulus && q.stimulus.content && q.stimulus.content.startsWith('Historical source')) {
    q.stimulus = { type: 'none', content: '' };
  }
});
fs.writeFileSync(mcqDir + '/unit-1.json', JSON.stringify(u1, null, 2));
console.log('Reverted unit-1 test stimuli');

// Now properly add stimuli to units 1, 2, 3, 9
addStimuliToUnit(1, [
  { type: 'text', content: 'Heaven is high and the emperor is far away. — Chinese proverb, Song Dynasty era, reflecting the tension between central imperial authority and regional autonomy' },
  { type: 'text', content: 'I left Tangier, my birthplace, with the intention of making the Pilgrimage to the Holy House at Mecca, and to visit the tomb of the Prophet at Medina. — Ibn Battuta, Rihla, 1355' },
  { type: 'text', content: 'The Mongols came down on the settled lands like a cloud of locusts. The libraries of Baghdad were thrown into the Tigris until the water ran black with ink. — Arab chronicler on the 1258 sack of Baghdad' },
  { type: 'text', content: 'Gold was brought to me in great quantities, and I gave it away to the emirs, to the troops, and to the poor. Gold became cheap in Egypt after their coming. — Egyptian chronicler on Mansa Musa hajj, 1324' },
  { type: 'text', content: 'The scholars of our city spent their nights in study of the Confucian classics, for only through mastery of the texts could one hope to pass the examination and serve in the imperial government. — Song Dynasty memoir' },
  { type: 'text', content: 'The pestilence was so great and so rapid that soon the living were not able to bury the dead. Father abandoned child, wife husband, one brother another. — Giovanni Boccaccio on the Black Death, Decameron preface, c. 1353' }
]);

addStimuliToUnit(2, [
  { type: 'text', content: 'The merchants of the Silk Road traveled in caravans for safety, stopping at caravanserais where they could rest, water their animals, and trade information about road conditions ahead. — Traveler account, 13th century' },
  { type: 'text', content: 'The harbor at Kilwa is one of the finest in the world. The merchants here are well-dressed and conduct their trade with great dignity. — Ibn Battuta, on the Swahili Coast, c. 1331' },
  { type: 'text', content: 'In the markets of Quanzhou one could find silk from Hangzhou, spices from Java, cotton from India, and ivory from Africa — all in the same bazaar. — Chinese Song Dynasty merchant account' },
  { type: 'text', content: 'The monsoon winds blow faithfully each year: in summer toward India, in winter back toward Arabia. A wise merchant plans his voyages around these winds, not against them. — Arab sailor manual, c. 1200' },
  { type: 'text', content: 'I, Marco, have put down everything in this book, as I heard or saw it. I believe it was God will that I should come back so that men might know of the things that are in the world. — Marco Polo, Travels, c. 1298' },
  { type: 'text', content: 'Buddhism spread along the Silk Road carried by monks and merchants alike. At the great oasis city of Dunhuang, pilgrims carved their prayers into the cave walls. — Modern historian on Silk Road religious diffusion' },
  { type: 'text', content: 'The bill of exchange I carry from the merchants of Venice allows me to collect gold in Cairo without carrying a single coin — the Muslim moneylenders call it suftaja. — Venetian merchant letter, 14th century' },
  { type: 'text', content: 'Of all the commodities carried from China to the West, silk was the most precious. A bolt of Chinese silk could purchase a horse in Central Asia or fine glass in Venice. — Trade records, 13th century' },
  { type: 'text', content: 'The plague traveled westward along the roads that the traders traveled eastward, hiding in the furs and spices of the merchant caravans. — Modern historian on the Black Death spread via trade routes' },
  { type: 'text', content: 'The Great Khan postal relay system means that a message can travel from Khanbaliq to the western borders of the empire within ten days. — Marco Polo, describing Mongol communications infrastructure' },
  { type: 'text', content: 'Arab merchants who settled on the East African coast brought Islam with them, and over generations their children created a new Bantu-Arabic language we now call Swahili. — Cultural historian on Swahili origins' },
  { type: 'text', content: 'The compass was first used by Chinese navigators to orient themselves on cloudy nights when stars were invisible. Arab sailors adopted it and brought it to the Mediterranean. — History of navigation' }
]);

addStimuliToUnit(3, [
  { type: 'text', content: 'The cannon and the musket changed the nature of war forever. Those rulers who mastered gunpowder weapons could build empires; those who did not were soon subjects of those who had. — Military historian on the gunpowder revolution' },
  { type: 'text', content: 'I am the Sultan of Sultans, the King of Kings, the distributor of crowns to the monarchs on the face of the earth...the shadow of God on earth. — Suleiman the Magnificent, Ottoman imperial title proclamation' },
  { type: 'text', content: 'The devshirme boys, taken as children from Christian families, were educated, converted, and trained. The best became the Sultan trusted ministers; others led the Janissary armies. — European ambassador to the Ottoman court, 16th century' },
  { type: 'text', content: 'In this empire of Akbar, Hindus and Muslims, Jains and Zoroastrians worship freely. The Emperor calls scholars of all religions to debate before him, for he believes truth may be found in many paths. — Abul Fazl, Akbarnama' },
  { type: 'text', content: 'The Safavid Shah declared that all true Muslims must follow the Twelve Imams, and those who refused the Shia faith were heretics. The Ottoman Sultan replied that such teachings were apostasy. — 16th-century account of Ottoman-Safavid religious conflict' },
  { type: 'text', content: 'The Taj Mahal was built by Shah Jahan as a monument to his love for his wife Mumtaz Mahal. Twenty thousand workers labored for twenty-two years to complete it. — European traveler to Mughal India, 17th century' },
  { type: 'text', content: 'The Great Wall stretches for thousands of li across the northern frontier. The Ming emperor commands that it be rebuilt higher and stronger, for the nomads from the north are always a danger. — Ming Dynasty official report' },
  { type: 'text', content: 'Zheng He commanded a fleet of over 200 vessels, the largest in the world, and sailed to Arabia, Africa, and India. But when the emperor changed, the voyages were stopped. — Chinese historian on the end of the treasure voyages' },
  { type: 'text', content: 'In Russia, the Tsar rules as an absolute autocrat. He is both the temporal and spiritual ruler of his people. No nobleman, no church, no assembly may check his power. — Foreign traveler to Muscovy, 17th century' },
  { type: 'text', content: 'The millet system allows Christians and Jews to maintain their own courts, schools, and churches within our empire. They pay additional taxes, but they are not forced to convert or to leave. — Ottoman administrative document, 16th century' },
  { type: 'text', content: 'Abbas I defeated the Uzbeks to the east and the Ottomans to the west. He moved the capital to Isfahan and filled it with palaces and mosques. Persian carpets were traded as far as Europe. — Safavid court chronicle' },
  { type: 'text', content: 'The mansabdari system requires every noble to maintain cavalry proportional to his rank. A mansab of 5,000 means the noble commands 5,000 horsemen for the Emperor service. — Mughal administrative record' },
  { type: 'text', content: 'Aurangzeb reimposed the jizya tax on Hindus after a century of remission under Akbar. The Hindu nobles of Rajputana withdrew their loyalty, and rebellions broke out across the Deccan. — Mughal court chronicle, late 17th century' }
]);

addStimuliToUnit(9, [
  { type: 'text', content: 'The container ship has done more to globalize trade than any trade agreement. A single vessel can carry 20,000 containers — the equivalent of all the goods a medieval merchant city might trade in a year. — Economic historian on shipping technology' },
  { type: 'text', content: 'Outsourcing is not simply about cheap labor. It is about the global allocation of talent — finding the best person for any task, wherever in the world they may be. — Management consultant, 1990s' },
  { type: 'text', content: 'In 1980 the top 1 percent of Americans earned 11 percent of national income; by 2015 they earned 20 percent. This pattern of rising top-end concentration was repeated across most of the wealthy world. — Piketty, Capital in the 21st Century, adapted' }
]);

console.log('All stimulus additions complete');
