const fs = require('fs');

const u3new = [
  { answer: 'Twenty-Sixth Amendment', prompt: 'The constitutional amendment (1971) that lowered the voting age from 21 to 18, extending suffrage to younger citizens', difficulty: 'easy', is_key_term: true },
  { answer: 'Twenty-Fourth Amendment', prompt: 'The constitutional amendment (1964) that prohibited poll taxes in federal elections, removing a financial barrier to voting that had disenfranchised many minority and low-income citizens', difficulty: 'easy', is_key_term: true },
  { answer: 'Voter Turnout', prompt: 'The percentage of eligible voters who actually cast a ballot in an election, often influenced by demographic factors, election type, and institutional barriers', difficulty: 'easy', is_key_term: false },
  { answer: 'Political Efficacy', prompt: "A citizen's belief that their participation in politics matters and can influence government decisions, divided into internal (personal competence) and external (government responsiveness)", difficulty: 'medium', is_key_term: true },
  { answer: 'Rational Choice Voting', prompt: "A voting model in which citizens cast their ballot based on a cost-benefit analysis of which candidate's policies will serve their personal interests best", difficulty: 'medium', is_key_term: false },
  { answer: 'Retrospective Voting', prompt: 'A voting model in which citizens base their decision on how well the incumbent or party in power has performed in the recent past', difficulty: 'medium', is_key_term: false },
  { answer: 'Prospective Voting', prompt: 'A voting model in which citizens choose a candidate based on what they promise to do in the future rather than past performance', difficulty: 'medium', is_key_term: false },
  { answer: 'Party-Line Voting', prompt: 'The practice of voting for every candidate of one political party on the ballot, also called straight-ticket voting', difficulty: 'easy', is_key_term: false },
  { answer: 'Linkage Institutions', prompt: "Channels that connect citizens' preferences to government policy, including political parties, interest groups, elections, and the media", difficulty: 'medium', is_key_term: true },
  { answer: 'Political Party', prompt: 'An organized group that seeks to win elections and control government by nominating candidates and coordinating their campaigns around a shared ideology or platform', difficulty: 'easy', is_key_term: false },
  { answer: 'Split Ticket Voting', prompt: 'The practice of voting for candidates from different parties for different offices on the same ballot (e.g., a Republican for president and a Democrat for senator)', difficulty: 'easy', is_key_term: false },
  { answer: 'Party Platform', prompt: "A formal document adopted at a party's national convention that outlines the party's official positions on major policy issues", difficulty: 'easy', is_key_term: false },
  { answer: 'Primary Election', prompt: "An election in which voters select their party's nominee for a general election, used to narrow the field of candidates before the final contest", difficulty: 'easy', is_key_term: false },
  { answer: 'Open Primary', prompt: "A primary election in which any registered voter may participate regardless of party affiliation, choosing which party's ballot to cast", difficulty: 'medium', is_key_term: false },
  { answer: 'Closed Primary', prompt: "A primary election in which only voters registered with a particular party may vote in that party's primary contest", difficulty: 'medium', is_key_term: false },
  { answer: 'Proportional Representation', prompt: 'An electoral system in which legislative seats are allocated to parties in proportion to their share of the total vote, often used in multi-party democracies', difficulty: 'medium', is_key_term: true },
  { answer: 'Single Member Districts', prompt: 'An electoral system in which one representative is elected per geographic district, typically using a plurality (first-past-the-post) rule, which favors a two-party system', difficulty: 'medium', is_key_term: true },
  { answer: 'Ideological Groups', prompt: 'Interest groups organized around a broad political philosophy or ideology (e.g., conservative or progressive) that advocate for policies consistent with their worldview', difficulty: 'medium', is_key_term: false },
  { answer: 'Public Interest Groups', prompt: 'Organizations that lobby for policies benefiting the general public rather than a narrow economic or professional constituency (e.g., environmental or consumer protection groups)', difficulty: 'medium', is_key_term: false },
  { answer: 'Single Issue Groups', prompt: 'Interest groups that focus exclusively on one policy area or cause, such as gun control or abortion, often mobilizing highly motivated supporters', difficulty: 'medium', is_key_term: false },
  { answer: 'Professional Associations', prompt: 'Interest groups that represent the interests of a specific profession, such as the American Medical Association (AMA) or the American Bar Association (ABA)', difficulty: 'medium', is_key_term: false },
  { answer: 'Lobbying', prompt: 'The process by which interest group representatives attempt to influence government decisions by meeting with legislators, providing information, and advocating for specific policies', difficulty: 'easy', is_key_term: true },
  { answer: 'Iron Triangle', prompt: 'A stable, mutually beneficial relationship among a congressional committee, an executive agency, and an interest group that shapes policy in a specific area', difficulty: 'medium', is_key_term: true },
  { answer: 'Issue Network', prompt: 'A fluid, open network of activists, experts, interest groups, and government officials who come together around a particular policy issue, less rigid than an iron triangle', difficulty: 'hard', is_key_term: true },
  { answer: 'Grassroots Lobbying', prompt: 'A strategy in which interest groups mobilize ordinary citizens to contact their elected officials, generating public pressure on legislators through calls, emails, or demonstrations', difficulty: 'medium', is_key_term: false },
  { answer: 'Political Action Committee', prompt: 'A private organization formed to raise and spend money to elect or defeat political candidates, subject to contribution limits set by federal election law', difficulty: 'medium', is_key_term: true },
  { answer: 'Winner-Take-All System', prompt: 'An electoral arrangement in which the candidate who receives the most votes wins the entire election, leaving no representation for runners-up, which reinforces a two-party system', difficulty: 'medium', is_key_term: false },
  { answer: 'Swing State', prompt: 'A state where the electorate is closely divided between the two major parties, making its electoral votes highly competitive and a major focus of presidential campaigns', difficulty: 'easy', is_key_term: false },
];

const u5new = [
  { answer: 'Political Efficacy', prompt: "A citizen's belief that their participation in politics matters and can influence government decisions, divided into internal (personal competence) and external (government responsiveness)", difficulty: 'medium', is_key_term: true },
  { answer: 'Rational Choice Voting', prompt: "A voting model in which citizens cast their ballot based on a cost-benefit analysis of which candidate's policies will serve their personal interests best", difficulty: 'medium', is_key_term: false },
  { answer: 'Retrospective Voting', prompt: 'A voting model in which citizens base their decision on how well the incumbent or party in power has performed in the recent past', difficulty: 'medium', is_key_term: false },
  { answer: 'Prospective Voting', prompt: 'A voting model in which citizens choose a candidate based on what they promise to do in the future rather than past performance', difficulty: 'medium', is_key_term: false },
  { answer: 'Party-Line Voting', prompt: 'The practice of voting for every candidate of one political party on the ballot, also called straight-ticket voting', difficulty: 'easy', is_key_term: false },
  { answer: 'Linkage Institutions', prompt: "Channels that connect citizens' preferences to government policy, including political parties, interest groups, elections, and the media", difficulty: 'medium', is_key_term: true },
  { answer: 'Political Party', prompt: 'An organized group that seeks to win elections and control government by nominating candidates and coordinating their campaigns around a shared ideology or platform', difficulty: 'easy', is_key_term: false },
  { answer: 'Split Ticket Voting', prompt: 'The practice of voting for candidates from different parties for different offices on the same ballot (e.g., a Republican for president and a Democrat for senator)', difficulty: 'easy', is_key_term: false },
  { answer: 'Open Primary', prompt: "A primary election in which any registered voter may participate regardless of party affiliation, choosing which party's ballot to cast", difficulty: 'medium', is_key_term: false },
  { answer: 'Closed Primary', prompt: "A primary election in which only voters registered with a particular party may vote in that party's primary contest", difficulty: 'medium', is_key_term: false },
  { answer: 'Proportional Representation', prompt: 'An electoral system in which legislative seats are allocated to parties in proportion to their share of the total vote, often used in multi-party democracies', difficulty: 'medium', is_key_term: true },
  { answer: 'Single Member Districts', prompt: 'An electoral system in which one representative is elected per geographic district, typically using a plurality (first-past-the-post) rule, which favors a two-party system', difficulty: 'medium', is_key_term: true },
  { answer: 'Ideological Groups', prompt: 'Interest groups organized around a broad political philosophy or ideology (e.g., conservative or progressive) that advocate for policies consistent with their worldview', difficulty: 'medium', is_key_term: false },
  { answer: 'Public Interest Groups', prompt: 'Organizations that lobby for policies benefiting the general public rather than a narrow economic or professional constituency (e.g., environmental or consumer protection groups)', difficulty: 'medium', is_key_term: false },
  { answer: 'Single Issue Groups', prompt: 'Interest groups that focus exclusively on one policy area or cause, such as gun control or abortion, often mobilizing highly motivated supporters', difficulty: 'medium', is_key_term: false },
  { answer: 'Professional Associations', prompt: 'Interest groups that represent the interests of a specific profession, such as the American Medical Association (AMA) or the American Bar Association (ABA)', difficulty: 'medium', is_key_term: false },
  { answer: 'Iron Triangle', prompt: 'A stable, mutually beneficial relationship among a congressional committee, an executive agency, and an interest group that shapes policy in a specific area', difficulty: 'medium', is_key_term: true },
  { answer: 'Issue Network', prompt: 'A fluid, open network of activists, experts, interest groups, and government officials who come together around a particular policy issue, less rigid than an iron triangle', difficulty: 'hard', is_key_term: true },
  { answer: 'Grassroots Lobbying', prompt: 'A strategy in which interest groups mobilize ordinary citizens to contact their elected officials, generating public pressure on legislators through calls, emails, or demonstrations', difficulty: 'medium', is_key_term: false },
  { answer: 'Winner-Take-All System', prompt: 'An electoral arrangement in which the candidate who receives the most votes wins the entire election, leaving no representation for runners-up, which reinforces a two-party system', difficulty: 'medium', is_key_term: false },
  { answer: 'Swing State', prompt: 'A state where the electorate is closely divided between the two major parties, making its electoral votes highly competitive and a major focus of presidential campaigns', difficulty: 'easy', is_key_term: false },
  { answer: 'Super PACs', prompt: 'Independent expenditure-only committees that may raise unlimited funds from individuals, corporations, and unions to spend on political advertising, but cannot coordinate directly with candidates or parties', difficulty: 'medium', is_key_term: true },
  { answer: 'Free Press', prompt: 'The constitutional protection (First Amendment) that allows news organizations to publish and broadcast information without government censorship or prior restraint, serving as a check on government power', difficulty: 'easy', is_key_term: false },
  { answer: 'Horse Race Journalism', prompt: 'Media coverage of elections that focuses primarily on polling data, campaign strategy, and who is winning or losing rather than substantive policy positions', difficulty: 'medium', is_key_term: false },
  { answer: 'Gatekeeper', prompt: "The media's role in filtering and deciding which stories, issues, and candidates receive public attention, effectively controlling what information reaches the public", difficulty: 'medium', is_key_term: false },
];

// Add to unit 3
const u3path = './public/data/ap-government/drills/unit-3.json';
const u3 = JSON.parse(fs.readFileSync(u3path, 'utf8'));
const u3start = u3.cards.length + 1;
u3new.forEach((card, i) => {
  const num = String(u3start + i).padStart(3, '0');
  u3.cards.push({
    id: 'gov-u3-d' + num,
    unit: 'unit-3',
    subject: 'ap-government',
    mode: 'definition_to_term',
    prompt: card.prompt,
    answer: card.answer,
    is_key_term: card.is_key_term,
    difficulty: card.difficulty,
  });
});
fs.writeFileSync(u3path, JSON.stringify(u3, null, 2) + '\n');
console.log('Unit 3: added ' + u3new.length + ' cards (total: ' + u3.cards.length + ')');

// Add to unit 5
const u5path = './public/data/ap-government/drills/unit-5.json';
const u5 = JSON.parse(fs.readFileSync(u5path, 'utf8'));
const u5start = u5.cards.length + 1;
u5new.forEach((card, i) => {
  const num = String(u5start + i).padStart(3, '0');
  u5.cards.push({
    id: 'gov-u5-d' + num,
    unit: 'unit-5',
    subject: 'ap-government',
    mode: 'definition_to_term',
    prompt: card.prompt,
    answer: card.answer,
    is_key_term: card.is_key_term,
    difficulty: card.difficulty,
  });
});
fs.writeFileSync(u5path, JSON.stringify(u5, null, 2) + '\n');
console.log('Unit 5: added ' + u5new.length + ' cards (total: ' + u5.cards.length + ')');
