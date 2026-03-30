const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-4.json'));
const newQ = [
  {
    "id": "psych-u4-q026",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best defines the fundamental attribution error?",
    "choices": [
      { "id": "A", "text": "The tendency to overestimate dispositional factors and underestimate situational factors when explaining others' behavior", "is_correct": true, "explanation": "The fundamental attribution error (FAE) is the tendency to attribute others' behavior to their character or personality (dispositional factors) while underestimating the power of the situation — for example, assuming a rude server is a bad person rather than considering they may be having a terrible day." },
      { "id": "B", "text": "The tendency to attribute one's own behavior to situational factors while attributing others' behavior to dispositional factors", "is_correct": false, "explanation": "This describes the actor-observer bias, which is related to but distinct from the FAE — the actor-observer bias describes the asymmetry between how we explain our own vs. others' behavior; the FAE specifically concerns the overuse of dispositional explanations for others." },
      { "id": "C", "text": "The tendency to take credit for successes and blame failures on external circumstances", "is_correct": false, "explanation": "Taking credit for successes and blaming external factors for failures describes the self-serving bias — a motivational attribution pattern that protects self-esteem, distinct from the FAE's dispositional overattribution for others' behavior." },
      { "id": "D", "text": "The tendency to see one's own group as superior and other groups as inferior based on incorrect assumptions", "is_correct": false, "explanation": "Viewing one's own group as superior describes in-group bias — the FAE is about attributing individual behavior to disposition rather than situation, not about intergroup evaluation." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q027",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Maslow's hierarchy of needs proposes that human needs are organized in a hierarchical structure. Which level of the hierarchy must be satisfied before 'esteem needs' can be addressed?",
    "choices": [
      { "id": "A", "text": "Safety and belonging/love needs", "is_correct": true, "explanation": "Maslow's hierarchy orders needs from most basic to self-actualization: physiological, then safety, then belonging/love, then esteem, then self-actualization. Safety and belonging/love needs are the two levels below esteem — both must be reasonably satisfied before esteem needs become motivationally prominent." },
      { "id": "B", "text": "Self-actualization and cognitive needs", "is_correct": false, "explanation": "Self-actualization is above esteem in Maslow's hierarchy — it is not a prerequisite for esteem; esteem is a prerequisite for self-actualization." },
      { "id": "C", "text": "Cognitive and aesthetic needs only", "is_correct": false, "explanation": "Cognitive and aesthetic needs are in the upper portion of Maslow's expanded hierarchy, above esteem — they are not prerequisites for esteem needs; the needs below esteem are safety and belonging/love." },
      { "id": "D", "text": "Physiological needs only", "is_correct": false, "explanation": "Physiological needs (food, shelter, sleep) are the most basic level — they are prerequisite to everything above them, including esteem, but safety and love/belonging needs also must be addressed before esteem becomes salient." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q028",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "In Milgram's obedience experiments, approximately 65% of participants administered the maximum 450-volt shock to the confederate 'learner,' even when the learner screamed and begged to stop. When the experimenter left the room and gave instructions by telephone, compliance dropped to 20%."
    },
    "question": "Which condition most directly accounts for the drop in compliance when the experimenter communicated by telephone?",
    "choices": [
      { "id": "A", "text": "Reduced physical presence of authority reduced pressure to obey — proximity to authority figures increases obedience", "is_correct": true, "explanation": "Milgram's variations showed that the physical presence of the authority figure was critical to obedience — face-to-face authority creates greater psychological pressure to comply than remote instruction. When the experimenter left the room, participants were more likely to defy orders." },
      { "id": "B", "text": "Telephone communication reduced participants' intelligence, impairing their ability to understand the instructions", "is_correct": false, "explanation": "Communication medium does not affect intelligence — the drop in compliance with telephone instructions reflects reduced authority pressure from decreased physical proximity, not cognitive impairment." },
      { "id": "C", "text": "Participants demonstrated informational social influence — they doubted the experimenter's expertise when he was absent", "is_correct": false, "explanation": "Informational social influence involves conforming because one believes others are correct — the obedience drop reflects normative pressure and authority proximity effects, not doubt about the experimenter's expertise or informational influence." },
      { "id": "D", "text": "The telephone condition activated participants' parasympathetic nervous systems, reducing the stress that drove compliance", "is_correct": false, "explanation": "The autonomic nervous system state does not directly explain obedience levels — the reduced compliance with remote authority reflects social psychological factors (physical proximity effect on compliance), not physiological arousal differences." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q029",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "In Asch's conformity experiments, participants were shown a standard line and asked to identify which of three comparison lines matched it in length. When alone, participants were nearly 100% accurate. When placed in a group where other members (confederates) unanimously gave the wrong answer, participants gave the wrong answer approximately 37% of the time."
    },
    "question": "The conformity observed in Asch's experiment is best explained by which social influence process?",
    "choices": [
      { "id": "A", "text": "Normative social influence — participants conformed to avoid social rejection and to fit in with the group, even when they privately knew the answer", "is_correct": true, "explanation": "Normative social influence involves conforming to meet social expectations and avoid disapproval — Asch's participants privately knew the correct answer but conformed publicly to avoid standing out as different. Post-experiment interviews confirmed participants felt social pressure rather than genuine uncertainty about the answer." },
      { "id": "B", "text": "Informational social influence — participants genuinely doubted their own perceptions and looked to others for the correct answer", "is_correct": false, "explanation": "Informational social influence involves conforming because one believes others have better information — in Asch's task (obvious line length), the answer was perceptually clear; post-experiment interviews showed participants conformed to avoid social disapproval, not because they genuinely doubted their perceptions." },
      { "id": "C", "text": "Obedience to authority — the experimenter's presence required participants to give the same answer as confederates", "is_correct": false, "explanation": "Obedience involves compliance with authority directives — Asch's confederates were peers, not authority figures, and no authority directed participants to give the wrong answer; the conformity was peer-driven, not authority-driven." },
      { "id": "D", "text": "Social facilitation — the presence of others improved participant performance, causing them to give the correct answer more reliably", "is_correct": false, "explanation": "Social facilitation predicts improved performance on well-learned tasks in the presence of others — Asch's results showed impaired accuracy (37% wrong answers) due to social pressure, which is the opposite of facilitation." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q030",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A group of investors who have each lost $50,000 in a failing startup continue to pour more money into it rather than cutting their losses, reasoning: 'We've already invested so much — we can't stop now.' An outside financial advisor sees no reason to continue investing based on the current data."
    },
    "question": "Which cognitive error is the investors' reasoning best described by?",
    "choices": [
      { "id": "A", "text": "Sunk-cost fallacy — continuing to invest because of prior irretrievable losses rather than future expected outcomes", "is_correct": true, "explanation": "The sunk-cost fallacy is the tendency to continue a behavior because of previously invested resources (time, money, effort) that cannot be recovered — rational decision-making should focus only on expected future costs and benefits, not past irrecoverable losses." },
      { "id": "B", "text": "Confirmation bias — selectively attending to evidence that the startup will succeed while ignoring negative evidence", "is_correct": false, "explanation": "Confirmation bias involves seeking evidence consistent with existing beliefs — the sunk-cost fallacy specifically describes continuing investment because of prior losses, not because of selective information processing." },
      { "id": "C", "text": "Representativeness heuristic — judging the startup's success probability by how well it resembles a prototypical successful company", "is_correct": false, "explanation": "The representativeness heuristic involves estimating probability based on similarity to a prototype — the investors' continued investment despite data against it is driven by sunk costs, not prototype-based probability judgment." },
      { "id": "D", "text": "Cognitive dissonance — the investors cannot tolerate the belief that they made a bad decision and change behavior to reduce dissonance", "is_correct": false, "explanation": "While cognitive dissonance may contribute to rationalization, the specific reasoning ('we've already invested so much') directly describes the sunk-cost fallacy — basing future decisions on irrecoverable past costs." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q031",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher finds that jury members deliberating in groups consistently arrive at more extreme verdicts (either more lenient or more harsh) than the average initial position of the individual members before deliberation."
    },
    "question": "Which group dynamics phenomenon does this finding best illustrate?",
    "choices": [
      { "id": "A", "text": "Group polarization — group discussion strengthens and amplifies the initially dominant position among group members", "is_correct": true, "explanation": "Group polarization is the tendency for group discussion to move participants toward a more extreme position in the direction they were already leaning — if jurors initially lean toward conviction, deliberation pushes toward harsher verdicts; if leaning toward acquittal, toward more lenient ones." },
      { "id": "B", "text": "Groupthink — the desire for harmony causes the group to make poor, irrational decisions without adequately evaluating alternatives", "is_correct": false, "explanation": "Groupthink involves suppression of dissent and failure to critically evaluate options to maintain harmony — group polarization produces extreme rather than merely consensual decisions, and does not specifically involve suppressing critical evaluation." },
      { "id": "C", "text": "Social loafing — individual jury members exert less effort in the group than they would alone, reducing overall accuracy", "is_correct": false, "explanation": "Social loafing involves reduced individual effort in groups — the finding describes amplification of the dominant position (polarization), not reduced effort." },
      { "id": "D", "text": "Deindividuation — jury members lose their individual identity in the group, causing uninhibited extreme behavior", "is_correct": false, "explanation": "Deindividuation involves loss of individual identity leading to impulsive behavior — group polarization occurs in deliberative, identity-maintained settings like juries, not through the loss of self-awareness associated with deindividuation." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q032",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A woman's handbag is snatched on a busy train platform. Of the 50+ bystanders present, none intervene or call for help. When the same incident occurs with only one other person on the platform, that person immediately calls police."
    },
    "question": "Which social psychological phenomenon best explains why the large crowd failed to help?",
    "choices": [
      { "id": "A", "text": "Diffusion of responsibility — each bystander assumes others will help, reducing individual felt obligation to act", "is_correct": true, "explanation": "Diffusion of responsibility occurs when the presence of others reduces each individual's sense of personal responsibility to act — with 50+ bystanders, each person assumes someone else will call police, resulting in no one helping despite many witnesses." },
      { "id": "B", "text": "Social facilitation — the presence of an audience improves performance, causing bystanders to watch rather than intervene", "is_correct": false, "explanation": "Social facilitation improves performance on well-practiced tasks — the failure to help in crowds is diffusion of responsibility within the bystander effect, not social facilitation of a performance." },
      { "id": "C", "text": "Groupthink — the crowd made a collective decision not to intervene through unspoken consensus", "is_correct": false, "explanation": "Groupthink involves deliberate group decision-making with suppressed dissent — the bystander effect/diffusion of responsibility occurs without any deliberate group decision; individuals independently (and incorrectly) assume others will act." },
      { "id": "D", "text": "Social loafing — bystanders are exerting less effort to help in a group than they would individually", "is_correct": false, "explanation": "Social loafing describes reduced effort on collaborative tasks in groups — diffusion of responsibility is the more specific explanation for emergency non-helping, involving the shifting of felt obligation onto others." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q033",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "In Festinger's classic experiment, participants performed an extremely boring task. One group was paid $20 to tell a waiting participant the task was enjoyable and interesting. A second group was paid $1 for the same lie. When later asked how much they genuinely liked the task, the $1 group rated it significantly more enjoyable than the $20 group."
    },
    "question": "Which explanation best accounts for the $1 group rating the task more positively?",
    "choices": [
      { "id": "A", "text": "Cognitive dissonance — paid only $1, participants lacked sufficient external justification for lying, so they changed their attitude toward the task to reduce psychological inconsistency", "is_correct": true, "explanation": "Festinger's cognitive dissonance theory predicts that insufficient external justification for counter-attitudinal behavior creates dissonance — the $20 group had an adequate external reason (money) for saying a boring task was fun; the $1 group lacked this justification and resolved the inconsistency by changing their actual attitude (the task must actually be somewhat enjoyable)." },
      { "id": "B", "text": "The self-perception theory — participants observed their own behavior (telling others the task was fun) and inferred they must have enjoyed it", "is_correct": false, "explanation": "Bem's self-perception theory offers an alternative explanation (inferring attitudes from behavior without arousal), but Festinger's original experiment is the classic demonstration of cognitive dissonance — inadequate justification causing attitude change." },
      { "id": "C", "text": "The fundamental attribution error — participants attributed their lie to internal disposition, concluding they must genuinely like boring tasks", "is_correct": false, "explanation": "The FAE describes attributing others' behavior to disposition — the $1 group's attitude change is about resolving internal inconsistency between their behavior (saying it was fun) and inadequate justification ($1), which is the cognitive dissonance mechanism." },
      { "id": "D", "text": "Operant conditioning — the $1 served as a more powerful conditioned reinforcer than $20 because it required greater cognitive effort to earn", "is_correct": false, "explanation": "Operant conditioning predicts greater behavior change for larger reinforcers — if anything, $20 should be more reinforcing. The $1 group's attitude change is explained by cognitive dissonance's insufficient justification mechanism, not conditioning theory." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q034",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A psychology study measures participants' implicit attitudes toward a social group using reaction-time-based measures (Implicit Association Test) and explicit attitudes using self-report questionnaires. The researchers find weak correlation between implicit and explicit measures for the same group, especially among participants who report strong egalitarian values."
    },
    "question": "Which conclusion is best supported by the weak correlation between implicit and explicit measures?",
    "choices": [
      { "id": "A", "text": "Implicit attitudes may reflect automatic, unconscious associations that are separate from consciously endorsed explicit beliefs, especially when social desirability motivates participants to appear egalitarian", "is_correct": true, "explanation": "Implicit attitudes (measured by IAT) capture automatic associative processes shaped by cultural exposure and learning — explicit attitudes capture consciously held beliefs. When egalitarian values motivate socially desirable responding on explicit measures, the gap between implicit and explicit attitudes widens, revealing the dual-process nature of social attitudes." },
      { "id": "B", "text": "Explicit self-report measures are always more accurate than implicit measures because people have direct access to their own mental states", "is_correct": false, "explanation": "Research demonstrates that people often lack accurate introspective access to their automatic attitudes — implicit measures capture associations that are not accessible to conscious self-report, making them complementary to, not inferior to, explicit measures." },
      { "id": "C", "text": "The weak correlation proves that attitudes have no relationship to behavior and are irrelevant for predicting discrimination", "is_correct": false, "explanation": "Research shows implicit attitudes do predict discriminatory behavior in some contexts — the weak correlation between implicit and explicit measures reflects dual-process attitude structure, not the irrelevance of attitudes for behavior." },
      { "id": "D", "text": "The findings demonstrate belief perseverance — participants who hold strong egalitarian values cannot update their implicit attitudes despite encountering contradictory evidence", "is_correct": false, "explanation": "Belief perseverance is the tendency to maintain beliefs even after they are discredited — the finding here describes the structure of implicit vs. explicit attitudes and social desirability effects, not the persistence of beliefs in the face of contradictory evidence." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q035",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying prejudice reduction finds that when members of rival college sports teams are required to work together on tasks where each person has unique information needed to succeed, prejudice between the groups decreases significantly. When the groups compete against each other, prejudice increases."
    },
    "question": "Which theory best explains the prejudice reduction found in the cooperative condition?",
    "choices": [
      { "id": "A", "text": "Contact hypothesis with superordinate goals — cooperative interdependence toward shared goals reduces prejudice by creating a common in-group identity", "is_correct": true, "explanation": "Allport's contact hypothesis specifies that mere contact is insufficient to reduce prejudice — contact must involve equal status, cooperation toward shared (superordinate) goals, institutional support, and personal acquaintance. The cooperative task requiring interdependence creates exactly these conditions, reducing prejudice by forging a shared identity." },
      { "id": "B", "text": "Social facilitation — working with out-group members on a cooperative task improves performance, which participants attribute to the out-group members' positive qualities", "is_correct": false, "explanation": "Social facilitation describes performance enhancement from the presence of others — it does not explain prejudice reduction through cooperative interdependence, which is the contact hypothesis with superordinate goals." },
      { "id": "C", "text": "Mere exposure effect — repeated exposure to out-group members during cooperation increases liking through familiarity", "is_correct": false, "explanation": "The mere exposure effect predicts increased liking from repeated exposure — while familiarity contributes, the contact hypothesis specifically identifies cooperation toward shared goals (not mere exposure) as the critical mechanism for prejudice reduction." },
      { "id": "D", "text": "Realistic conflict theory — the cooperative condition eliminated resource competition between groups, revealing that prejudice was solely economic", "is_correct": false, "explanation": "Realistic conflict theory (Sherif's Robber's Cave) proposes competition for limited resources creates prejudice — while this predicts that removing competition reduces prejudice, the specific mechanism that explains reduction is the superordinate goal (cooperative interdependence) component of the contact hypothesis." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q036",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "According to the two-factor theory of emotion developed by Schachter and Singer, what are the two necessary components for experiencing an emotion?",
    "choices": [
      { "id": "A", "text": "Physiological arousal and a cognitive label for that arousal", "is_correct": true, "explanation": "Schachter and Singer's two-factor (cognitive labeling) theory proposes that emotion requires both physiological arousal AND a cognitive interpretation of the cause of that arousal — the same arousal state can produce different emotions depending on the cognitive label applied (e.g., happiness vs. fear)." },
      { "id": "B", "text": "A stimulus event and an unconscious appraisal of that event", "is_correct": false, "explanation": "A stimulus and unconscious appraisal describes elements of cognitive appraisal theories (Lazarus) — Schachter and Singer's two-factor theory specifically requires conscious cognitive labeling of physiological arousal, not unconscious appraisal." },
      { "id": "C", "text": "A brain reaction and a corresponding facial expression", "is_correct": false, "explanation": "Brain reactions and facial expressions describe elements of the facial feedback hypothesis and neurological theories — Schachter-Singer's two-factor theory focuses on arousal and cognitive label, not brain reactions and facial expressions." },
      { "id": "D", "text": "A peripheral nervous system activation and a corresponding memory of a prior emotional experience", "is_correct": false, "explanation": "While PNS activation provides arousal, the James-Lange theory (not Schachter-Singer) proposes we feel emotion after perceiving our physiological response — Schachter-Singer requires both arousal AND cognitive labeling as the two factors." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q037",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "Researchers gave participants a placebo injection described as either a stimulant (causing pounding heart and increased alertness) or nothing. Participants then waited in a room with either a happy confederate (who was clowning and laughing) or an angry confederate (who was acting hostile). Participants who received the unexplained arousal injection reported feeling emotions matching the confederate more than participants told the injection would make them feel aroused."
    },
    "question": "Which theory of emotion is most directly supported by this research design?",
    "choices": [
      { "id": "A", "text": "Schachter-Singer two-factor theory — unexplained arousal is cognitively labeled based on available environmental cues", "is_correct": true, "explanation": "Schachter and Singer's experiment showed that unexplained physiological arousal leads people to look to social cues to label their emotion — participants with unexplained arousal inferred their emotional state from the confederate's behavior (happy → euphoria; angry → anger), demonstrating arousal + cognitive labeling." },
      { "id": "B", "text": "James-Lange theory — physiological responses directly determine emotional experience without cognitive appraisal", "is_correct": false, "explanation": "James-Lange theory proposes emotions are the perception of physiological responses — it does not predict that the same arousal state would produce different emotions based on social cues; the sensitivity to social context in labeling arousal is specifically Schachter-Singer's contribution." },
      { "id": "C", "text": "Cannon-Bard theory — the thalamus simultaneously sends signals to the cortex and body, producing parallel emotion and physiological response", "is_correct": false, "explanation": "Cannon-Bard theory proposes simultaneous physiological and conscious emotional experience — it does not explain why unexplained arousal is labeled differently based on environmental cues, which is the two-factor theory phenomenon." },
      { "id": "D", "text": "Facial feedback hypothesis — participants who expressed emotions matching the confederate experienced those emotions via facial muscle feedback", "is_correct": false, "explanation": "The facial feedback hypothesis proposes that facial expression influences emotional experience — the study manipulates unexplained arousal and social context, not facial expression; the results support two-factor theory, not facial feedback." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q038",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A student who scores poorly on an exam tells himself: 'I failed because the teacher writes unfair exams and the room was too hot.' When he scores highly on the next exam, he says: 'I earned this because I studied hard and I'm naturally gifted at this subject.'"
    },
    "question": "Which attribution pattern does the student's reasoning across both outcomes best demonstrate?",
    "choices": [
      { "id": "A", "text": "Self-serving bias — attributing success to internal factors and failure to external factors to protect self-esteem", "is_correct": true, "explanation": "The self-serving bias is the tendency to attribute success to internal, stable factors (ability, effort) while attributing failure to external, unstable factors (unfair tests, bad luck) — this protects self-esteem by taking credit for successes and denying responsibility for failures." },
      { "id": "B", "text": "Fundamental attribution error — the student is overestimating situational factors in explaining his own behavior", "is_correct": false, "explanation": "The FAE describes overattributing others' behavior to disposition — the student's pattern of taking credit for successes and externalizing failures is the self-serving bias, which involves self-protective attribution patterns for one's own behavior." },
      { "id": "C", "text": "Actor-observer bias — the student attributes his behavior differently than an observer would", "is_correct": false, "explanation": "The actor-observer bias predicts people attribute their own behavior to situations and others' behavior to disposition — the student is showing self-serving attributions specifically for positive vs. negative outcomes, not an actor-observer asymmetry." },
      { "id": "D", "text": "Optimistic attribution style — the student uses an internal, stable, global attribution style for positive events", "is_correct": false, "explanation": "An optimistic attribution style (attributing good events internally and bad events externally) is related to the self-serving bias — the question asks which pattern is demonstrated across both outcomes, which is the self-serving bias as a general attribution tendency, not merely the optimistic dimension." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q039",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes Sigmund Freud's concept of the 'ego'?",
    "choices": [
      { "id": "A", "text": "The rational, reality-oriented component of personality that mediates between the id's impulses and the superego's moral demands", "is_correct": true, "explanation": "The ego operates according to the reality principle — it mediates between the id's primitive drives (pleasure principle) and the superego's moral standards, finding realistic ways to satisfy needs without violating social norms." },
      { "id": "B", "text": "The unconscious reservoir of primitive instincts and drives operating on the pleasure principle", "is_correct": false, "explanation": "The id is the unconscious reservoir of primitive instincts (sex and aggression) operating on the pleasure principle — seeking immediate gratification without regard for reality or morality. The ego is the rational mediator between id and superego." },
      { "id": "C", "text": "The internalized moral standards and ideals derived from parental and societal values", "is_correct": false, "explanation": "Internalized moral standards and ideals describe the superego — which enforces a moral code learned from parents and society. The ego is the rational decision-making component that balances id and superego demands." },
      { "id": "D", "text": "The unconscious mechanism that represses threatening memories and impulses to protect conscious awareness", "is_correct": false, "explanation": "Repressing threatening memories and impulses describes the defense mechanism of repression — a specific ego defense mechanism, not the definition of the ego itself, which is the rational mediating structure of personality." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q040",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A person who is furious with her supervisor at work comes home and yells at her partner for leaving dishes in the sink. When confronted, she insists she is not actually angry at the dishes but was just very stressed from work."
    },
    "question": "Which Freudian defense mechanism does her behavior toward her partner best exemplify?",
    "choices": [
      { "id": "A", "text": "Displacement — redirecting impulses from the threatening original target to a safer substitute", "is_correct": true, "explanation": "Displacement transfers feelings from a threatening or powerful person (the supervisor) to a less threatening substitute (the partner) — directing anger at the supervisor would feel threatening or risky, so it is displaced onto a safer target." },
      { "id": "B", "text": "Projection — attributing her angry feelings to her partner, believing the partner is angry at her", "is_correct": false, "explanation": "Projection involves attributing one's own unacceptable feelings to others — the woman is expressing anger at her partner, not attributing her own anger to the partner; the behavior is displacement (redirecting anger to a different target)." },
      { "id": "C", "text": "Rationalization — inventing a logical explanation for the anger to avoid confronting its true source", "is_correct": false, "explanation": "Rationalization involves creating acceptable explanations for unacceptable behavior — the woman's explanation about work stress could be rationalization, but the initial act of yelling at her partner for a minor reason while actually angry at her supervisor is displacement." },
      { "id": "D", "text": "Sublimation — channeling anger into a socially acceptable outlet to protect the relationship", "is_correct": false, "explanation": "Sublimation redirects impulses into socially constructive activities (e.g., channeling anger into athletic competition) — yelling at a partner is not a socially acceptable sublimated outlet; the direct expression of anger at a substitute target is displacement." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q041",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "Research by Dov Cohen and Richard Nisbett found that men from the Southern United States responded with significantly more anger and cortisol when bumped and called an insulting name by a confederate than men from the Northern United States. The researchers attributed this difference to a 'culture of honor' in Southern states."
    },
    "question": "Which conclusion is best supported by these findings?",
    "choices": [
      { "id": "A", "text": "Cultural norms (honor culture) influence how individuals appraise and respond to affronts, shaping emotional and physiological reactions", "is_correct": true, "explanation": "The culture of honor hypothesis proposes that in cultures where reputation is central to economic survival and social order, insults are perceived as greater threats requiring strong responses — Southern men raised in this cultural norm showed stronger anger and cortisol responses, demonstrating cultural influence on emotional appraisal and response." },
      { "id": "B", "text": "Southern men have genetically higher cortisol responses to stress than Northern men, explaining the difference", "is_correct": false, "explanation": "The researchers attributed the difference to cultural norms, not genetic differences — a genetic explanation would require ruling out regional self-selection and cultural socialization, which the cultural honor framework provides." },
      { "id": "C", "text": "The findings demonstrate the fundamental attribution error — the researchers incorrectly attributed the Southern men's behavior to culture rather than individual personality", "is_correct": false, "explanation": "The FAE is a bias in observers attributing others' behavior to disposition — the researchers specifically studied the influence of a shared cultural norm (culture of honor) on group-level patterns, which is not an FAE." },
      { "id": "D", "text": "Social facilitation improved performance — the presence of an audience caused Southern men to express anger more intensely than they would alone", "is_correct": false, "explanation": "Social facilitation describes performance enhancement from audience presence — the regional difference in anger response to insults reflects cultural norm differences (culture of honor), not social facilitation of performance." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q042",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher gives participants a personality questionnaire measuring the Big Five (OCEAN). Ten years later, the same participants complete the questionnaire again. The researcher finds high test-retest correlations for each of the five traits, especially among participants over age 30."
    },
    "question": "Which conclusion about personality is best supported by these longitudinal findings?",
    "choices": [
      { "id": "A", "text": "The Big Five traits are relatively stable over time, especially in adulthood, supporting a trait-based model of personality", "is_correct": true, "explanation": "High 10-year test-retest correlations demonstrate temporal stability of the Big Five traits — research consistently shows personality traits become increasingly stable through adulthood (the 'plaster hypothesis' suggests traits set after age 30). The finding supports trait theories that conceptualize personality as stable, enduring dimensions." },
      { "id": "B", "text": "Personality changes dramatically after age 30, with participants showing reversed scores on all five traits", "is_correct": false, "explanation": "High test-retest correlations show stability, not dramatic change — research indicates personality actually becomes more stable with age, particularly after 30, which is the opposite of this option." },
      { "id": "C", "text": "The findings support purely psychodynamic theory — stable personality reflects unresolved unconscious conflicts that persist over time", "is_correct": false, "explanation": "While psychodynamic theory predicts some personality continuity through stable defensive structures, the Big Five model is a trait-based empirical taxonomy — the longitudinal stability is best explained within a trait theory framework, not as evidence for psychodynamic conflicts." },
      { "id": "D", "text": "Personality is entirely situationally determined, and the stability merely reflects unchanged life circumstances across the 10-year period", "is_correct": false, "explanation": "If personality were entirely situational, test-retest correlations would be low (reflecting changed situations over 10 years) — high stability correlations support trait-based consistency rather than situational determination of personality." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q043",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "In Zimbardo's Stanford Prison Experiment, participants randomly assigned to guard roles became increasingly authoritarian and degrading toward prisoner-role participants. The experiment was terminated early when several prisoners experienced emotional breakdowns."
    },
    "question": "Which social psychological principle does the guard behavior most directly illustrate?",
    "choices": [
      { "id": "A", "text": "Social roles and situational factors can override individual personality, causing ordinary people to engage in harmful behaviors when given authority", "is_correct": true, "explanation": "Zimbardo's experiment demonstrated the power of social roles and situational context — randomly assigned guards (not selected for authoritarian tendencies) developed increasingly abusive behaviors, showing how situational role demands can override individual character and produce harmful actions." },
      { "id": "B", "text": "Deindividuation — guards lost their personal identity in the institutional setting, becoming less inhibited and more aggressive", "is_correct": false, "explanation": "While deindividuation (loss of individual identity in groups) contributes to the findings, the primary conclusion from the Stanford Prison Experiment is about the power of situational roles — guards maintained their identities as 'guards' while engaging in harmful behavior, suggesting role-based rather than identity-loss explanations." },
      { "id": "C", "text": "The fundamental attribution error — Zimbardo incorrectly attributed guard behavior to their personalities rather than the situation", "is_correct": false, "explanation": "The FAE would be committing when observers attribute the guards' behavior to personality — Zimbardo's conclusion was the opposite, emphasizing situational role power; the FAE describes an observer bias, not the behavior itself." },
      { "id": "D", "text": "Groupthink — the guards collectively decided through discussion to treat prisoners harshly, suppressing dissenting guards' objections", "is_correct": false, "explanation": "Groupthink involves faulty group decision-making through suppressed dissent — guard behavior emerged from role adoption and institutional dynamics, not from a deliberate collective decision-making process characterized by groupthink." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q044",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher tests the door-in-the-face technique: Group A is first asked to donate $500 to a charity (an unreasonably large request), then when they decline, asked to donate $25. Group B is simply asked to donate $25. Group A donates at a significantly higher rate than Group B."
    },
    "question": "Which principle of persuasion best explains Group A's higher donation rate?",
    "choices": [
      { "id": "A", "text": "Reciprocal concession — after refusing a large request, people feel obligated to comply with the smaller follow-up request as a social concession", "is_correct": true, "explanation": "The door-in-the-face technique exploits reciprocal concession — when the requester 'concedes' by dropping from $500 to $25, the target feels social pressure to reciprocate by conceding their refusal and complying with the smaller request, consistent with Cialdini's reciprocity principle." },
      { "id": "B", "text": "Foot-in-the-door technique — Group A was softened by agreeing to a smaller request first, making the larger donation more likely", "is_correct": false, "explanation": "The foot-in-the-door technique starts with a small request and escalates — the scenario described (large request first, then smaller) is the door-in-the-face technique, the reverse pattern." },
      { "id": "C", "text": "Cognitive dissonance — refusing to donate $500 created dissonance that was resolved by agreeing to donate $25", "is_correct": false, "explanation": "Cognitive dissonance would predict attitude change from counter-attitudinal behavior — the door-in-the-face effect is explained by reciprocal concession norms, not internal attitude conflict resolution." },
      { "id": "D", "text": "Mere exposure effect — Group A's repeated interaction with the charity requester increased liking and willingness to donate", "is_correct": false, "explanation": "The mere exposure effect involves increased liking from repeated exposure — Group A heard two donation requests, but the mechanism for their higher donation rate is reciprocal concession from the large-to-small request sequence, not liking from familiarity." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q045",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A student who scores low on an exam in a course she normally excels in is told by a classmate: 'The exam was really hard — everyone did poorly.' Another student is told: 'You just don't understand this material as well as your other subjects.' The first student's motivation and exam performance recover quickly; the second student's motivation and performance continue to decline."
    },
    "question": "Which psychological theory best explains the difference in recovery between the two students?",
    "choices": [
      { "id": "A", "text": "Attribution theory — an external, unstable attribution for failure preserves self-efficacy and motivation; an internal, stable attribution promotes helplessness", "is_correct": true, "explanation": "Weiner's attribution theory links academic outcomes to attributions along dimensions of locus (internal/external), stability, and controllability — attributing failure to a hard exam (external, unstable) protects expectancy and motivation; attributing it to a stable internal deficit (low ability) promotes learned helplessness and performance decline." },
      { "id": "B", "text": "Maslow's hierarchy — the first student has her safety needs met, allowing her to recover; the second student's safety needs are threatened by the feedback", "is_correct": false, "explanation": "Maslow's hierarchy addresses motivational priority of needs — the difference in recovery reflects how failure is attributed (external/unstable vs. internal/stable), not Maslow's need hierarchy." },
      { "id": "C", "text": "The Yerkes-Dodson Law — the first student's lower arousal level following the external explanation optimizes performance recovery", "is_correct": false, "explanation": "The Yerkes-Dodson Law describes the relationship between arousal and performance (inverted-U curve) — the different recovery outcomes here are explained by attribution differences, not arousal level changes." },
      { "id": "D", "text": "Cognitive dissonance — the second student's belief in her ability creates dissonance with the poor performance, causing her to reduce effort to justify the gap", "is_correct": false, "explanation": "Cognitive dissonance might predict attitude change, but learned helplessness and motivation decline from internal, stable attributions for failure is specifically explained by attribution theory — not dissonance resolution through reduced effort." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q046",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the concept of 'reciprocal determinism' as proposed by Albert Bandura?",
    "choices": [
      { "id": "A", "text": "Behavior, personal factors (cognitions and emotions), and the environment mutually influence each other in an ongoing bidirectional interaction", "is_correct": true, "explanation": "Reciprocal determinism is the cornerstone of Bandura's social cognitive theory — it holds that behavior, cognitive/personal factors, and environment are all causes and effects of each other, creating a continuous bidirectional interaction rather than a one-way causal chain." },
      { "id": "B", "text": "People's behavior is entirely determined by external reinforcement and punishment from the environment", "is_correct": false, "explanation": "Environmental determinism describes radical behaviorism (Skinner) — Bandura explicitly rejected pure environmental determinism, proposing instead that persons, behavior, and environment all mutually influence each other through reciprocal determinism." },
      { "id": "C", "text": "A person's self-concept is formed entirely by internal psychological processes with no influence from the social environment", "is_correct": false, "explanation": "A purely internal formation of self-concept describes an insular view of personality — reciprocal determinism specifically highlights the continuous interaction between personal factors and environment, not their separation." },
      { "id": "D", "text": "People freely choose their behaviors based on conscious rational calculations of expected outcomes", "is_correct": false, "explanation": "Conscious rational calculation of outcomes describes rational choice theory or cognitive decision-making frameworks — reciprocal determinism emphasizes the bidirectional interplay of personal factors, behavior, and environment, not purely rational calculation." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q047",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher assessing personality traits gives 200 participants a questionnaire with 100 personality-descriptive items. Using factor analysis, she identifies five underlying clusters of traits that account for the majority of variance in responses."
    },
    "question": "Which personality framework did the researcher most likely produce, and which psychologist's research is it associated with?",
    "choices": [
      { "id": "A", "text": "The Big Five (OCEAN) — the five-factor model derived from factor analysis of personality trait questionnaires, developed through research by Costa and McCrae among others", "is_correct": true, "explanation": "The Big Five (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism/Emotional Stability) emerged from factor analysis of trait-descriptive items across many studies — Costa and McCrae developed the widely used NEO-PI inventory based on this research." },
      { "id": "B", "text": "Freud's structural model — the id, ego, and superego represent the three fundamental personality structures", "is_correct": false, "explanation": "Freud's structural model was derived from clinical case observations and theoretical interpretation, not factor analysis of questionnaire responses — factor analysis is an empirical statistical technique associated with trait theories, not psychoanalysis." },
      { "id": "C", "text": "Maslow's hierarchy of needs — five hierarchical levels of human motivation identified through humanistic case studies", "is_correct": false, "explanation": "Maslow's hierarchy describes motivational levels, not personality trait clusters — it was derived from humanistic theory, not factor analysis of personality questionnaires." },
      { "id": "D", "text": "Carl Rogers's Q-sort — a self-report instrument measuring the congruence between ideal and actual self", "is_correct": false, "explanation": "The Q-sort measures self-concept congruence in humanistic therapy — it does not produce five factors through factor analysis of trait descriptors; the five-factor structure describes the Big Five model from trait research." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q048",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "The Yerkes-Dodson Law describes the relationship between arousal and performance. Which of the following best represents this relationship?",
    "choices": [
      { "id": "A", "text": "An inverted U-shape — moderate arousal produces optimal performance; too little or too much arousal impairs performance", "is_correct": true, "explanation": "The Yerkes-Dodson Law describes an inverted-U relationship: performance is poor at very low arousal (underaroused/bored), peaks at moderate arousal, and declines at very high arousal (over-stressed/panicked). The optimal arousal level also varies by task difficulty." },
      { "id": "B", "text": "A linear relationship — more arousal always produces better performance", "is_correct": false, "explanation": "A linear relationship would predict that maximum arousal always produces best performance — the Yerkes-Dodson Law specifically shows performance degrades at very high arousal, creating an inverted-U, not a linear function." },
      { "id": "C", "text": "A U-shape — low and high arousal both produce better performance than moderate arousal", "is_correct": false, "explanation": "A U-shape would predict worst performance at moderate arousal — the Yerkes-Dodson Law is the opposite (inverted-U), with moderate arousal producing optimal performance and extremes producing impaired performance." },
      { "id": "D", "text": "No relationship — arousal has no systematic effect on performance across different tasks", "is_correct": false, "explanation": "Arousal and performance are systematically related according to the Yerkes-Dodson Law — an inverted-U function describes this relationship, with the optimal arousal point varying by task complexity." }
    ],
    "unit_objective": "PSY-4.A"
  },
  {
    "id": "psych-u4-q049",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A meta-analysis of 150 studies on the Rorschach Inkblot Test finds that trained clinicians using different scoring systems agree on interpretations only about 60% of the time, and the test predicts specific clinical diagnoses at rates barely above chance for most disorders."
    },
    "question": "Which conclusion is best supported by these findings, and what do they reveal about the test's psychometric properties?",
    "choices": [
      { "id": "A", "text": "The Rorschach has poor inter-rater reliability and low predictive validity for specific diagnoses, raising serious concerns about its clinical utility", "is_correct": true, "explanation": "60% inter-rater agreement is poor for a clinical diagnostic tool (acceptable reliability typically requires 80%+ agreement) — low predictive validity for diagnoses means the test does not accurately predict the constructs it claims to measure. These are core psychometric failures: insufficient reliability undermines validity." },
      { "id": "B", "text": "The Rorschach has excellent construct validity because it taps into unconscious processes that objective tests cannot access", "is_correct": false, "explanation": "Construct validity requires empirical evidence that the test measures what it claims — poor predictive validity for diagnoses and low inter-rater reliability indicate construct validity problems, not excellence. Claims about unconscious access do not substitute for psychometric evidence." },
      { "id": "C", "text": "The findings demonstrate that all projective tests are invalid and should be entirely replaced by objective personality inventories", "is_correct": false, "explanation": "The findings support concerns about the Rorschach specifically — some projective measures show better reliability and validity than others; a blanket conclusion that all projective tests are invalid is overgeneralized beyond what the Rorschach meta-analysis supports." },
      { "id": "D", "text": "Inter-rater disagreement proves that personality is entirely subjective and cannot be measured scientifically", "is_correct": false, "explanation": "Poor inter-rater reliability for one specific instrument (the Rorschach) does not prove personality is immeasurable — objective personality inventories (MMPI, NEO-PI) demonstrate strong psychometric properties, showing personality can be reliably measured with appropriate instruments." }
    ],
    "unit_objective": "PSY-4.B"
  },
  {
    "id": "psych-u4-q050",
    "unit": "unit-4",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher measures hunger in participants using three methods: (1) time since last meal, (2) self-reported hunger rating, and (3) blood glucose levels. She finds that time since last meal and blood glucose levels predict actual food intake, but self-reported hunger ratings are only weakly correlated with intake."
    },
    "question": "Which conclusion about motivation and hunger is best supported by these findings?",
    "choices": [
      { "id": "A", "text": "Physiological hunger signals (blood glucose, time since eating) are better predictors of actual eating behavior than subjective self-report, suggesting hunger has both biological and psychological components that can diverge", "is_correct": true, "explanation": "The dissociation between physiological measures and self-report shows that hunger motivation is partly regulated by homeostatic biological signals (glucose, time fasting) and partly by psychological factors (perceived hunger, emotional eating) — these can diverge, with physiological measures better predicting actual intake in research settings." },
      { "id": "B", "text": "The findings prove that hunger is entirely a learned behavior with no biological basis, since self-report measures (psychological) fail to predict intake", "is_correct": false, "explanation": "The physiological measures (blood glucose, time since eating) do predict intake — the findings show biological factors are important predictors; the weak self-report link suggests psychological hunger perception can diverge from physiological signals, not that hunger is entirely learned." },
      { "id": "C", "text": "Drive reduction theory is invalidated because neither hunger drive (blood glucose) nor its reduction (eating) is correlated in the study", "is_correct": false, "explanation": "Blood glucose level and time since eating both predict food intake, consistent with drive reduction theory (hunger drive leads to eating behavior) — drive reduction is not invalidated; self-report divergence from physiological measures reveals the complexity of hunger, not the failure of drive reduction." },
      { "id": "D", "text": "Incentive theory is confirmed since participants ate based entirely on external food cues rather than internal hunger signals", "is_correct": false, "explanation": "Incentive theory emphasizes external rewards pulling behavior — the findings show internal physiological signals (blood glucose) predict intake, alongside self-report. The data support multiple motivational mechanisms (biological + psychological), not exclusive external incentive control." }
    ],
    "unit_objective": "PSY-4.A"
  }
];
data.questions.push(...newQ);
fs.writeFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-4.json', JSON.stringify(data, null, 2));
console.log('unit-4 now has ' + data.questions.length + ' questions');
