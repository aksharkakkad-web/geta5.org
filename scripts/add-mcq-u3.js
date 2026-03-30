const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-3.json'));
const newQ = [
  {
    "id": "psych-u3-q026",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes Piaget's concept of assimilation?",
    "choices": [
      { "id": "A", "text": "Interpreting a new experience through the lens of an existing schema", "is_correct": true, "explanation": "Assimilation is incorporating new information into an existing mental framework (schema) — for example, a child who knows 'dog' calls all four-legged animals 'dog,' fitting new animals into an existing schema rather than modifying it." },
      { "id": "B", "text": "Modifying an existing schema to account for new information that does not fit", "is_correct": false, "explanation": "Modifying an existing schema to fit new information describes accommodation, not assimilation — assimilation keeps the schema unchanged and forces the new experience into it." },
      { "id": "C", "text": "The process by which infants form an emotional bond with their primary caregiver", "is_correct": false, "explanation": "Forming an emotional bond with a caregiver describes attachment — Piaget's assimilation is a cognitive process about how new information is processed using existing schemas, not about emotional bonding." },
      { "id": "D", "text": "The sudden mental restructuring that allows a child to advance to the next cognitive stage", "is_correct": false, "explanation": "Sudden mental restructuring describes what might happen during equilibration when a new schema is required — but this is closer to accommodation or stage transition, not the definition of assimilation." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q027",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the concept of a 'teratogen' in developmental psychology?",
    "choices": [
      { "id": "A", "text": "An environmental agent that can damage the developing organism during prenatal development", "is_correct": true, "explanation": "Teratogens are substances or environmental exposures (alcohol, tobacco, certain drugs, radiation, infections) that cross the placental barrier and can damage the developing embryo or fetus, especially during critical sensitive periods of organ formation." },
      { "id": "B", "text": "A hormone that triggers puberty and secondary sex characteristic development", "is_correct": false, "explanation": "Hormones triggering puberty (e.g., estrogen, testosterone) are pubertal hormones — teratogens are harmful prenatal environmental agents, not developmental hormones." },
      { "id": "C", "text": "A reflexive behavior present at birth, such as rooting or grasping, that disappears with maturation", "is_correct": false, "explanation": "Innate reflexive behaviors present at birth are neonatal (newborn) reflexes — teratogens are prenatal harmful agents, not behavioral reflexes." },
      { "id": "D", "text": "The genetic blueprint for physical and psychological development passed from parent to child", "is_correct": false, "explanation": "The genetic blueprint inherited from parents is the genotype — teratogens are environmental (not genetic) agents that cause prenatal harm." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q028",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A 4-year-old is shown two identical glasses of water. Water from one glass is poured into a tall, thin glass. When asked which glass has more water, the child points to the tall glass. The child is then shown that no water was added or removed."
    },
    "question": "Which Piagetian concept does the child's response best illustrate, and in which stage does this limitation typically appear?",
    "choices": [
      { "id": "A", "text": "Failure of conservation, characteristic of the preoperational stage — the child cannot understand that quantity remains constant despite perceptual changes", "is_correct": true, "explanation": "Conservation is the understanding that quantity (volume, mass, number) remains unchanged despite changes in appearance — preoperational children (2-7 years) focus on perceptual features (height of water) rather than logical invariance. The failure to conserve is a hallmark of the preoperational stage." },
      { "id": "B", "text": "Object permanence failure, characteristic of the sensorimotor stage — the child believes the water disappears when hidden in the tall glass", "is_correct": false, "explanation": "Object permanence is the understanding that objects continue to exist when out of sight — this child sees the water in both glasses; the error is about quantity despite visible changes, which is conservation failure, not object permanence." },
      { "id": "C", "text": "Failure of formal operational thinking — the child cannot perform hypothetical reasoning about water volume", "is_correct": false, "explanation": "Formal operational thought (abstract/hypothetical reasoning) emerges around age 11-12 — the conservation task does not require hypothetical reasoning; the 4-year-old's error reflects preoperational centration on a single perceptual feature." },
      { "id": "D", "text": "Egocentrism — the child believes the adult sees a different amount of water than the child does", "is_correct": false, "explanation": "Egocentrism is the inability to take another person's perspective — the conservation error here involves perceiving more water in the taller glass regardless of perspective, not assuming others see something different." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q029",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher observes infants in Ainsworth's Strange Situation procedure. One group of infants uses the caregiver as a secure base to explore the room, becomes mildly distressed when the caregiver leaves, and is easily comforted upon reunion. A second group of infants shows extreme distress when the caregiver leaves and is inconsolable and resistant (pushing away) when the caregiver returns."
    },
    "question": "Which attachment styles do the first and second groups most likely represent, respectively?",
    "choices": [
      { "id": "A", "text": "Secure attachment and anxious-ambivalent (resistant) attachment", "is_correct": true, "explanation": "Securely attached infants use caregivers as a safe base, show mild distress at separation, and are easily comforted on reunion. Anxious-ambivalent (resistant) infants show intense distress at separation and ambivalent/resistant behavior on reunion (wanting comfort but pushing the caregiver away)." },
      { "id": "B", "text": "Avoidant attachment and disorganized attachment", "is_correct": false, "explanation": "Avoidant attachment features minimal distress at separation and indifference on reunion — not the mild distress and easy comfort of Group 1. Disorganized attachment shows fearful, confused behavior — not the systematic resistance of Group 2." },
      { "id": "C", "text": "Secure attachment and avoidant attachment", "is_correct": false, "explanation": "Avoidant attachment features little distress at separation and avoidance of the caregiver on reunion — Group 2 shows intense distress and resistant (not avoidant) behavior, matching anxious-ambivalent attachment, not avoidant." },
      { "id": "D", "text": "Anxious-ambivalent attachment and secure attachment", "is_correct": false, "explanation": "The groups are described in order: Group 1 (mild distress, easily comforted) = secure; Group 2 (intense distress, resistant on reunion) = anxious-ambivalent. This option has them reversed." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q030",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A high school student consistently makes excellent grades when her parents are actively engaged with her schoolwork, providing guidance, praise, and warmth while also setting high expectations and firm boundaries. Her friend's parents set the same high expectations but are cold and do not explain their rules, while a third student's parents impose no expectations or rules and allow any behavior."
    },
    "question": "Based on Baumrind's parenting research, which parenting styles do the three sets of parents represent, respectively?",
    "choices": [
      { "id": "A", "text": "Authoritative, authoritarian, and permissive", "is_correct": true, "explanation": "Authoritative parents combine high warmth with high expectations and rule explanation — associated with the best outcomes. Authoritarian parents have high control and expectations but low warmth and no rule explanation. Permissive parents are warm but set no rules or expectations." },
      { "id": "B", "text": "Authoritarian, authoritative, and permissive", "is_correct": false, "explanation": "The first parent combines warmth, clear expectations, and rule explanation — this is authoritative, not authoritarian. Authoritarian parenting features high control but low warmth, matching the second parent." },
      { "id": "C", "text": "Authoritative, permissive, and authoritarian", "is_correct": false, "explanation": "The second parent (cold, strict, no explanations) fits authoritarian; the third parent (no expectations, no rules) fits permissive — this option has the second and third parents' styles reversed." },
      { "id": "D", "text": "Permissive, authoritative, and authoritarian", "is_correct": false, "explanation": "The first parent's combination of warmth, high expectations, and rule explanation is authoritative — permissive parents are warm but impose no expectations, which does not match the first parent's description." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q031",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "According to Erikson's theory, an 18-year-old college freshman is asking fundamental questions: 'Who am I? What are my values? What career should I pursue?' She tries different activities, social groups, and beliefs before settling on answers."
    },
    "question": "Which of Erikson's psychosocial stages does this student's experience best represent?",
    "choices": [
      { "id": "A", "text": "Identity vs. Role Confusion — successfully navigating this stage results in a stable sense of self", "is_correct": true, "explanation": "Erikson's fifth stage (Identity vs. Role Confusion) occurs during adolescence and emerging adulthood — the central challenge is exploring different roles, values, and beliefs to form a coherent personal identity. Active identity exploration before commitment is healthy identity development." },
      { "id": "B", "text": "Intimacy vs. Isolation — the student is seeking close relationships after establishing her identity", "is_correct": false, "explanation": "Intimacy vs. Isolation is Erikson's sixth stage, occurring in young adulthood after identity is established — the student is still in the identity exploration process described in stage 5." },
      { "id": "C", "text": "Industry vs. Inferiority — the student is developing competence through work and learning", "is_correct": false, "explanation": "Industry vs. Inferiority is Erikson's fourth stage, occurring in middle childhood (school age 6-12) — the scenario describes an emerging adult's identity exploration, which is stage 5." },
      { "id": "D", "text": "Generativity vs. Stagnation — the student is establishing her contribution to the next generation", "is_correct": false, "explanation": "Generativity vs. Stagnation is Erikson's seventh stage, typically occurring in middle adulthood — the scenario describes an 18-year-old's identity formation, which is stage 5 (Identity vs. Role Confusion)." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q032",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "Harry Harlow separated infant rhesus monkeys from their mothers at birth and placed them with two surrogate 'mothers': one made of wire that provided food, and one covered in soft terrycloth that provided no food. The infant monkeys spent most of their time clinging to the cloth mother and ran to it when frightened, even though the wire mother provided nourishment."
    },
    "question": "Which conclusion is best supported by Harlow's findings?",
    "choices": [
      { "id": "A", "text": "Attachment is based primarily on contact comfort rather than feeding, challenging drive reduction theories of attachment", "is_correct": true, "explanation": "Harlow's findings demonstrated that infant monkeys bonded with the soft, comforting mother, not the food-providing wire mother — this challenged the then-dominant view that attachment forms through association with feeding (drive reduction theory) and established contact comfort as the primary basis of early attachment." },
      { "id": "B", "text": "Feeding is the most critical factor in attachment formation, as the wire mother provided food and the cloth mother did not", "is_correct": false, "explanation": "The monkeys preferred the cloth mother despite her providing no food — this directly contradicts the feeding-based attachment hypothesis; contact comfort, not feeding, was the decisive factor." },
      { "id": "C", "text": "Secure attachment can only form between members of the same species and cannot occur with surrogate objects", "is_correct": false, "explanation": "The monkeys did form attachment-like bonds with the cloth surrogate — Harlow's study demonstrated contact-comfort-based attachment, not a species-exclusivity requirement for secure attachment." },
      { "id": "D", "text": "The findings demonstrate classical conditioning — the cloth mother became a conditioned stimulus through repeated association with comfort", "is_correct": false, "explanation": "While the comfort may involve some conditioning, Harlow's key conclusion was about the primacy of contact comfort over feeding in attachment formation — the study challenged drive reduction theory, not demonstrated classical conditioning as the mechanism." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q033",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A developmental researcher studies children raised in Romanian orphanages under conditions of severe social deprivation. Children who were adopted into nurturing families before 6 months of age showed near-normal cognitive and social development by age 11. Children adopted after 2 years showed persistent cognitive and social deficits despite being in nurturing families for many years."
    },
    "question": "Which developmental principle do these findings most directly support?",
    "choices": [
      { "id": "A", "text": "The existence of sensitive periods in early development — stimulation before a certain age is critical; later intervention cannot fully compensate for earlier deprivation", "is_correct": true, "explanation": "Sensitive (critical) periods are windows during which the brain is especially responsive to certain experiences for normal development — the findings show that social and cognitive deprivation before age 6 months can be overcome, but deprivation through age 2 produces irreversible deficits, demonstrating a sensitive period for social-emotional and cognitive development." },
      { "id": "B", "text": "Brain plasticity is unlimited — given sufficient time and stimulation, later adoption can fully reverse all effects of early deprivation", "is_correct": false, "explanation": "The finding that children adopted after age 2 showed persistent deficits directly contradicts unlimited plasticity — the data show plasticity is limited by developmental timing, consistent with sensitive period theory." },
      { "id": "C", "text": "Nature entirely determines development — children adopted after age 2 have inferior genetic endowment compared to those adopted before 6 months", "is_correct": false, "explanation": "The researcher is studying children from the same orphanage setting — attributing outcome differences to genetics would require demonstrating genetic differences between groups, which this study design cannot establish; the environmental timing is the most parsimonious explanation." },
      { "id": "D", "text": "Vygotsky's zone of proximal development — without a knowledgeable other to scaffold learning during the orphanage period, children fell behind permanently", "is_correct": false, "explanation": "Vygotsky's ZPD describes how current performance can be extended with guidance — while scaffolding deficits likely contributed to developmental delays, the critical period framework better explains why early deprivation effects differ from later deprivation effects based on developmental timing." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q034",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Kohlberg presented participants with moral dilemmas and asked them to justify their reasoning. He found that children typically justify moral decisions by referring to consequences for themselves ('I won't steal because I'll be punished'), adolescents refer to social norms ('Stealing is wrong because society has rules against it'), and some adults refer to abstract universal principles ('A person must sometimes break the law to uphold a higher moral principle')."
    },
    "question": "Which of the following correctly matches Kohlberg's three levels of moral reasoning to the groups described?",
    "choices": [
      { "id": "A", "text": "Children = preconventional; adolescents = conventional; adults referring to universal principles = postconventional", "is_correct": true, "explanation": "Kohlberg's preconventional level is based on self-interest and consequences (avoidance of punishment, reward seeking). The conventional level is based on social norms, rules, and laws (maintaining social order). The postconventional level involves abstract moral principles that may supersede laws — matching the progression described." },
      { "id": "B", "text": "Children = conventional; adolescents = preconventional; adults = postconventional", "is_correct": false, "explanation": "The children in the scenario are reasoning from self-interest and consequences (preconventional), not social norms (conventional) — and adolescents reasoning from social rules represents conventional reasoning, not preconventional." },
      { "id": "C", "text": "Children = postconventional; adolescents = conventional; adults = preconventional", "is_correct": false, "explanation": "This reverses the developmental progression — preconventional (self-interest) appears earliest in development, conventional (social norms) comes next, and postconventional (abstract principles) is the most advanced level achieved by some adults." },
      { "id": "D", "text": "Children = conventional; adolescents = postconventional; adults = preconventional", "is_correct": false, "explanation": "Kohlberg's moral stages follow a developmental progression from preconventional (self-interest) to conventional (social norms) to postconventional (abstract principles) — the children reasoning from personal consequences are at the preconventional level, not conventional." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q035",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A developmental researcher compares two cohorts of adults: a group who grew up during the Great Depression and a group who grew up during economic prosperity. Despite both groups showing similar levels of psychological resilience in early adulthood, the Depression cohort shows significantly different financial attitudes, risk tolerance, and political views in later life."
    },
    "question": "Which component of Bronfenbrenner's ecological systems theory best accounts for the persistent differences between the two cohorts?",
    "choices": [
      { "id": "A", "text": "Chronosystem — historical events and major sociohistorical changes over a person's lifetime shape development", "is_correct": true, "explanation": "The chronosystem encompasses changes and continuities over time, including historical events (the Great Depression) that create different developmental contexts for different cohorts. Sociohistorical timing shapes the attitudes, values, and behaviors of people who develop during particular eras." },
      { "id": "B", "text": "Microsystem — direct interactions with family members during the Depression transmitted different values", "is_correct": false, "explanation": "The microsystem involves direct face-to-face relationships (family, peers, school) — while family attitudes during the Depression influenced children, the broader cohort-level difference across an entire generation reflects the chronosystem's societal-historical influence, not individual microsystem interactions." },
      { "id": "C", "text": "Exosystem — indirect settings like parents' workplaces affected the Depression cohort's development", "is_correct": false, "explanation": "The exosystem includes settings that affect the child indirectly (e.g., a parent's workplace conditions affecting family stress) — the cohort-wide differences from a historical period are a chronosystem effect, not an exosystem effect." },
      { "id": "D", "text": "Macrosystem — cultural values and ideological structures created permanent differences in both cohorts' worldviews", "is_correct": false, "explanation": "The macrosystem includes broad cultural values and societal institutions affecting development — while macrosystem factors are relevant, the specific mechanism of a historical event creating different developmental cohorts is the chronosystem, which focuses on timing of environmental events." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q036",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the rooting reflex in newborns?",
    "choices": [
      { "id": "A", "text": "Turning the head and opening the mouth toward a stimulus that touches the cheek", "is_correct": true, "explanation": "The rooting reflex is an adaptive newborn reflex — when the cheek or corner of the mouth is touched, the infant turns toward the stimulus and opens the mouth, facilitating nipple location for feeding." },
      { "id": "B", "text": "Extending the arms outward and then bringing them to the chest when startled", "is_correct": false, "explanation": "Extending arms and then drawing them in when startled describes the Moro reflex — rooting is specifically the head-turning and mouth-opening response to cheek stimulation." },
      { "id": "C", "text": "Tightly grasping any object placed in the palm of the hand", "is_correct": false, "explanation": "Tightly grasping objects placed in the palm describes the palmar grasp reflex — rooting involves orienting toward a cheek touch, not grasping." },
      { "id": "D", "text": "Automatically stepping when the soles of the feet make contact with a flat surface", "is_correct": false, "explanation": "Automatic stepping when the soles contact a surface describes the stepping reflex — rooting involves orienting the head and mouth toward a cheek stimulus to facilitate nursing." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q037",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A teenager who recently began driving approaches an intersection where cars are moving much faster than she expected. She narrowly avoids an accident. She immediately begins to notice fast-moving cars more frequently and feels anxious when approaching intersections, even though this pattern was always present before her close call."
    },
    "question": "Which principle of adolescent cognitive development does the teenager's response pattern most closely illustrate?",
    "choices": [
      { "id": "A", "text": "Personal fable — the teenager's experience has shattered her belief that dangerous events cannot happen to her, increasing risk perception", "is_correct": true, "explanation": "The personal fable is the adolescent belief that one is uniquely special and invulnerable to harm — a close call that shatters this illusion can dramatically shift risk perception, consistent with the teenager's sudden heightened anxiety about intersections she previously ignored." },
      { "id": "B", "text": "Object permanence — the teenager can now understand that fast cars exist even when she is not watching them", "is_correct": false, "explanation": "Object permanence (understanding objects exist when out of sight) is a sensorimotor stage achievement typically completed by age 2 — this teenager's pattern involves changed risk perception related to personal vulnerability, not object permanence." },
      { "id": "C", "text": "Conservation — the teenager now understands that the speed of cars remains constant regardless of her distance from them", "is_correct": false, "explanation": "Conservation is the Piagetian concept that quantity remains constant despite perceptual changes — the teenager's altered anxiety about intersections reflects changed risk perception from a personal threat experience, not physical conservation understanding." },
      { "id": "D", "text": "Scaffolding — the experience provided by an instructor (the traffic situation) guided the teenager to a higher level of driving competence", "is_correct": false, "explanation": "Scaffolding is temporary support provided by a more skilled person to help learners reach their next competence level — the teenager's response is an emotional and cognitive reaction to personal danger, not a scaffolded learning experience." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q038",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying toddler learning pairs an adult who reliably does what they say they will with an adult who frequently says one thing and does another. When a new adult offers a toy choice, toddlers who have been with the reliable adult look to her for guidance. Toddlers who have been with the unreliable adult do not seek guidance from her."
    },
    "question": "Which developmental concept do these findings most directly illustrate?",
    "choices": [
      { "id": "A", "text": "Secure vs. insecure attachment — toddlers use reliably responsive caregivers as a secure base for social referencing and learning", "is_correct": true, "explanation": "Social referencing is the use of another person's emotional and behavioral cues as a guide — toddlers preferentially reference reliable, trustworthy adults (consistent with secure attachment) over unreliable ones, demonstrating that attachment security shapes information-seeking behavior." },
      { "id": "B", "text": "Formal operational thinking — toddlers use logical reasoning to determine which adult is more reliable", "is_correct": false, "explanation": "Formal operational thinking involves abstract hypothetical reasoning that emerges around age 11-12 — toddlers are in the sensorimotor or preoperational stage and cannot perform formal logical deductions about reliability." },
      { "id": "C", "text": "Imaginary audience — toddlers believe all adults are watching and evaluating their toy choices", "is_correct": false, "explanation": "The imaginary audience is an adolescent egocentrism phenomenon involving self-consciousness about being observed — toddlers' selective guidance-seeking reflects attachment security, not adolescent self-consciousness." },
      { "id": "D", "text": "Ecological systems theory macrosystem — broad cultural norms about adult authority influence toddler behavior", "is_correct": false, "explanation": "The macrosystem refers to broad cultural values and institutions — the toddlers' differential social referencing based on an individual adult's reliability reflects microsystem-level attachment relationships, not macrosystem cultural norms." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q039",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying cognitive development gives 5-year-olds and 9-year-olds the following task: A doll named Sally places a marble in a basket and then leaves the room. While Sally is gone, another doll (Anne) moves the marble to a box. The researcher asks the children: 'When Sally comes back, where will she look for the marble?'"
    },
    "question": "Which developmental concept does this task assess, and how do typical responses differ between the age groups?",
    "choices": [
      { "id": "A", "text": "Theory of mind — 5-year-olds typically say Sally will look in the box (where the marble actually is), while 9-year-olds correctly say Sally will look in the basket (where Sally believes it is)", "is_correct": true, "explanation": "The Sally-Anne task is a classic false-belief test for theory of mind — the ability to understand that others have beliefs that may differ from reality. Children under 4-5 typically fail (saying Sally will look where the marble actually is), while older children correctly identify Sally's false belief. 5-year-olds are at the transition point; 9-year-olds reliably pass." },
      { "id": "B", "text": "Object permanence — 5-year-olds believe the marble ceases to exist when moved to the box, while 9-year-olds understand it persists", "is_correct": false, "explanation": "Object permanence is typically achieved by 8-12 months in the sensorimotor stage — 5-year-olds fully understand objects persist when moved. The Sally-Anne task assesses theory of mind (understanding others' mental states), not object permanence." },
      { "id": "C", "text": "Conservation — 5-year-olds believe the marble changes quantity when moved, while 9-year-olds understand quantity is conserved", "is_correct": false, "explanation": "Conservation involves understanding that quantity is unchanged despite perceptual changes — the Sally-Anne task assesses theory of mind (false beliefs about location), not understanding of physical quantity conservation." },
      { "id": "D", "text": "Zone of proximal development — 5-year-olds need adult guidance to answer correctly, while 9-year-olds answer correctly independently", "is_correct": false, "explanation": "The ZPD describes the range of tasks learnable with assistance — the Sally-Anne task assesses whether children have developed theory of mind, not whether they can extend their performance with scaffolding." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q040",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A cross-cultural researcher compares the rate of secure attachment across 32 countries. She finds that while secure attachment is the most common pattern in all countries, the percentage of avoidant attachments is significantly higher in Northern European countries and the percentage of anxious-ambivalent attachments is higher in some Asian and Middle Eastern countries compared to the United States."
    },
    "question": "Which conclusion is best supported by these cross-cultural attachment data?",
    "choices": [
      { "id": "A", "text": "The basic categories of attachment are universal, but cultural parenting practices influence the distribution of attachment styles across countries", "is_correct": true, "explanation": "The cross-cultural universality of secure attachment as the most common type supports a universal biological attachment system. Cultural variation in distribution reflects how culturally specific caregiving practices (e.g., encouraging independence in Northern Europe vs. interdependence in other cultures) shape attachment patterns within that universal framework." },
      { "id": "B", "text": "Attachment is purely a cultural construct with no biological basis — the variation across countries proves that attachment styles are learned, not innate", "is_correct": false, "explanation": "The universality of the three basic attachment patterns (secure, avoidant, anxious-ambivalent) across 32 diverse countries supports a biologically based attachment system — cultural factors modulate distribution within a universal framework, not replace it." },
      { "id": "C", "text": "The findings prove that children in Northern Europe receive inadequate caregiving and are therefore at higher risk for poor outcomes than children in the United States", "is_correct": false, "explanation": "Higher avoidant rates may reflect cultural values that emphasize independence and self-regulation — not caregiving inadequacy. Northern European parenting styles may promote independence, and avoidant children in that cultural context may not show the same deficits as avoidant children in other contexts." },
      { "id": "D", "text": "Ainsworth's Strange Situation procedure is invalid outside the United States and cannot measure attachment in other cultures", "is_correct": false, "explanation": "The consistent identification of the same attachment categories across 32 countries demonstrates the Strange Situation procedure has cross-cultural validity — the findings of cross-cultural variation in distribution, not the failure to detect attachment, support this." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q041",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the concept of fluid intelligence as distinguished from crystallized intelligence?",
    "choices": [
      { "id": "A", "text": "Fluid intelligence is the ability to reason abstractly and solve novel problems; it tends to peak in young adulthood and decline with age", "is_correct": true, "explanation": "Fluid intelligence (Cattell) involves abstract reasoning, working memory, and processing speed — capacities that peak in young adulthood and gradually decline. Crystallized intelligence (accumulated knowledge and skills) remains stable or increases through later adulthood." },
      { "id": "B", "text": "Fluid intelligence is the accumulated knowledge and vocabulary gained through education and experience, which increases throughout adulthood", "is_correct": false, "explanation": "Accumulated knowledge and vocabulary gained through experience describes crystallized intelligence — fluid intelligence involves real-time abstract reasoning and problem-solving with novel stimuli, not stored knowledge." },
      { "id": "C", "text": "Fluid intelligence measures emotional regulation and social competence, which improve with age through accumulated experience", "is_correct": false, "explanation": "Emotional regulation and social competence are aspects of emotional intelligence — fluid intelligence refers to abstract reasoning and novel problem-solving, typically measured by tasks like pattern completion and spatial reasoning." },
      { "id": "D", "text": "Fluid intelligence is genetically fixed and cannot be influenced by education or environmental stimulation", "is_correct": false, "explanation": "While fluid intelligence has strong genetic components and is less trainable than crystallized intelligence, environmental enrichment (education, cognitive engagement) can influence its development — it is not entirely fixed by genetics." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q042",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying language acquisition presents data showing that babbling in infants from different language communities (English, Japanese, French) sounds similar at 4 months but increasingly resembles the child's native language by 10 months. By 12 months, children rarely produce sounds absent from their native language."
    },
    "question": "Which conclusion is best supported by this developmental pattern?",
    "choices": [
      { "id": "A", "text": "Infants are born with the capacity to produce all human speech sounds, but exposure to a native language causes non-native sounds to be gradually eliminated through neural pruning", "is_correct": true, "explanation": "Infants' early babbling includes sounds from all human languages — as they are exposed to their native language, non-native phonemes are pruned away as those neural pathways weaken without activation. This is a sensitive period effect — language exposure shapes phonemic discrimination and production." },
      { "id": "B", "text": "Language is purely innate and the environment has no role in shaping early phonetic development", "is_correct": false, "explanation": "If language were entirely innate, babbling would immediately reflect the native language — the finding that babbling converges toward the native language over months demonstrates environmental (linguistic exposure) shaping of early phonetic development." },
      { "id": "C", "text": "Children are born with knowledge of their native language's sounds, explaining why they rapidly focus on native phonemes", "is_correct": false, "explanation": "Children are not born with knowledge of their specific native language — they are born with a broad capacity for all sounds; native phoneme focus emerges through exposure, not innate language-specific knowledge." },
      { "id": "D", "text": "The convergence of babbling toward native sounds demonstrates the Sapir-Whorf hypothesis — language shapes the child's perceptual system", "is_correct": false, "explanation": "The Sapir-Whorf hypothesis concerns whether language influences thought and cognition in people who speak different languages — the babbling convergence phenomenon is a phonemic development and neural pruning process, not an example of linguistic relativity." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q043",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A middle-school student excels in math when working with the teacher, who provides step-by-step hints and questions. When working alone on the same types of problems, the student makes errors. After several months of guided practice, the student independently solves the same problems correctly without any hints."
    },
    "question": "Which Vygotskian concept does this progression best illustrate?",
    "choices": [
      { "id": "A", "text": "Zone of proximal development and scaffolding — the teacher's support extends the student's competence until the skill becomes internalized", "is_correct": true, "explanation": "The ZPD is the range between what a learner can do independently and what they can do with expert guidance — the teacher's scaffolding (hints and questions) extended the student's performance into the ZPD, and over time the guided skills were internalized as independent competence." },
      { "id": "B", "text": "Formal operational thought — the student has developed abstract mathematical reasoning through natural maturation", "is_correct": false, "explanation": "Formal operational thought (Piaget) refers to the development of abstract reasoning in adolescence — the specific progression from guided to independent performance reflects Vygotsky's scaffolding within the ZPD, not Piagetian stage transition through maturation." },
      { "id": "C", "text": "Crystallized intelligence — accumulated math knowledge from years of guided practice improves independent performance", "is_correct": false, "explanation": "Crystallized intelligence refers to accumulated knowledge across a lifetime — the ZPD/scaffolding framework specifically describes how guided assistance within a learner's proximal zone facilitates internalization of new skills, which is the mechanism described here." },
      { "id": "D", "text": "The spacing effect — distributed practice sessions over several months improved the student's long-term retention of math procedures", "is_correct": false, "explanation": "The spacing effect describes improved retention when practice is distributed over time — the critical element here is the scaffolded guidance (teacher hints/questions) that extends performance into the ZPD, not the spacing of practice sessions." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q044",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Researchers compare two groups of 10-month-old infants from different family backgrounds. Group A infants have parents who talk to them frequently, name objects, and read to them daily. Group B infants have parents who interact very little verbally. By age 3, Group A children have significantly larger vocabularies and score higher on cognitive assessments."
    },
    "question": "Which conclusion about language and cognitive development is best supported by these findings?",
    "choices": [
      { "id": "A", "text": "Early linguistic environment critically shapes vocabulary development and cognitive outcomes, supporting a gene-environment interaction view", "is_correct": true, "explanation": "Early language exposure (quantity and quality of parent speech) is a powerful environmental predictor of language and cognitive development — this supports an interactionist view in which biological capacity for language develops within environments that must provide sufficient linguistic input. The findings are consistent with Hart and Risley's word gap research." },
      { "id": "B", "text": "The findings prove that language development is entirely determined by the environment, with no genetic contribution", "is_correct": false, "explanation": "While the findings demonstrate a strong environmental effect, they do not isolate genetic factors — children in both groups have genetic predispositions for language; the findings show environmental input matters, not that genetics are irrelevant." },
      { "id": "C", "text": "Group B children's parents are genetically less intelligent, and genetic differences fully explain the cognitive gap between groups", "is_correct": false, "explanation": "This confounds parental behavior (linguistic input) with genetics — the study measures environmental input differences (verbal interaction frequency), not genetic differences; attributing all outcomes to parental genetics commits an unsupported genetic determinism." },
      { "id": "D", "text": "Language is a purely learned behavior with no biological basis, as demonstrated by the environmental group differences", "is_correct": false, "explanation": "A universal biological capacity for language is supported by cross-cultural evidence — the group differences demonstrate environmental effects on language development, not the absence of a biological language capacity." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q045",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Researchers studying elder adults in their 80s find that participants who have maintained strong social networks, engaged in mentally stimulating activities, and exercised regularly throughout middle adulthood show significantly slower cognitive decline and lower rates of dementia than sedentary, socially isolated adults. The differences persist even after controlling for education and health status."
    },
    "question": "Which developmental concept is most directly supported by these findings?",
    "choices": [
      { "id": "A", "text": "Cognitive reserve — mental and social engagement builds neural pathways and redundancy that buffer against age-related cognitive decline", "is_correct": true, "explanation": "Cognitive reserve theory proposes that intellectually and socially enriching activities throughout life build neural efficiency and redundancy — providing a buffer against age-related brain changes and delaying cognitive decline and dementia onset, consistent with the findings." },
      { "id": "B", "text": "Crystallized intelligence inevitably compensates for fluid intelligence decline, so active engagement has no unique protective effect", "is_correct": false, "explanation": "Crystallized intelligence (knowledge accumulation) does remain stable with age, but the findings show active lifestyle engagement has a protective effect beyond what simple knowledge retention would predict — the cognitive reserve model explains how active engagement specifically builds neural resilience." },
      { "id": "C", "text": "Selective optimization with compensation — elders simply compensate for specific losses by focusing on fewer tasks, making their overall function appear better", "is_correct": false, "explanation": "Selective optimization with compensation (Baltes) describes adaptive strategies for managing age-related losses — the findings describe a protective effect of lifelong engagement on cognitive health, not just compensatory strategies for managing existing declines." },
      { "id": "D", "text": "Imprinting — the social and cognitive experiences in early development permanently determined the cognitive trajectories of both groups", "is_correct": false, "explanation": "Imprinting is a rapid, early-life attachment process in some species — the findings describe lifelong middle-adulthood activities affecting late-life outcomes, which is cognitive reserve building, not an early imprinting effect." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q046",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": { "type": "none" },
    "question": "According to James Marcia, a college student who has committed to a political identity after actively exploring several different political viewpoints would be classified as being in which identity status?",
    "choices": [
      { "id": "A", "text": "Identity achievement — the student has explored and then made a commitment", "is_correct": true, "explanation": "Identity achievement (Marcia) is characterized by having gone through an identity exploration (crisis) period and having arrived at a committed position — actively exploring multiple viewpoints before committing represents the most psychologically mature identity status." },
      { "id": "B", "text": "Identity foreclosure — the student adopted a political identity without exploration", "is_correct": false, "explanation": "Foreclosure involves making a commitment without prior exploration — typically adopting parental or societal identities without questioning them. The student in the question actively explored multiple viewpoints, which defines achievement, not foreclosure." },
      { "id": "C", "text": "Identity moratorium — the student is actively exploring but has not yet committed to a political identity", "is_correct": false, "explanation": "Moratorium involves active exploration without commitment — the student has already committed after exploration, placing them in identity achievement, not moratorium." },
      { "id": "D", "text": "Identity diffusion — the student has neither explored nor committed to a political identity", "is_correct": false, "explanation": "Diffusion involves neither exploration nor commitment — the student has done both (explored multiple viewpoints and committed to one), which is the definition of identity achievement." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q047",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A study examines 15-year-olds who engage in risky behaviors such as driving at dangerous speeds, using alcohol, and unprotected sex. The researchers note that these adolescents accurately understand the risks involved (they score just as high as adults on risk knowledge tests) but still engage in the behaviors at higher rates than adults."
    },
    "question": "Which explanation is best supported by these findings about adolescent risk-taking?",
    "choices": [
      { "id": "A", "text": "Adolescent risk-taking is driven by underdeveloped prefrontal cortex executive function and heightened reward sensitivity, not lack of risk knowledge", "is_correct": true, "explanation": "Research shows adolescents accurately assess risks but take them anyway — the prefrontal cortex (impulse control, long-term planning) matures into the mid-20s, while the limbic system's reward circuitry peaks in adolescence. This imbalance drives risk-taking despite accurate risk knowledge." },
      { "id": "B", "text": "Adolescents engage in risky behaviors because they have lower risk knowledge than adults and underestimate danger", "is_correct": false, "explanation": "The finding that adolescents score equally with adults on risk knowledge tests directly contradicts this explanation — adolescent risk-taking is not a knowledge deficit problem but a regulatory and motivational one." },
      { "id": "C", "text": "Personal fable beliefs cause adolescents to believe risk statistics do not apply to them, explaining their behavior despite knowledge of risks", "is_correct": false, "explanation": "Personal fable (belief in personal invulnerability) does contribute to adolescent risk-taking, but the primary neurobiological explanation for risk-taking despite accurate risk knowledge is the prefrontal-limbic imbalance — the answer that best accounts for the specific finding (equal risk knowledge, higher risk behavior) is neurodevelopmental." },
      { "id": "D", "text": "Formal operational thinking develops later in adolescents who engage in risky behaviors, preventing accurate risk assessment", "is_correct": false, "explanation": "The study shows these adolescents assess risks accurately (equal to adults) — their formal operational thinking is apparently intact. The explanation for behavior despite knowledge is neurodevelopmental (prefrontal maturation lag), not a Piagetian stage deficit." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q048",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "According to Piaget, which cognitive milestone marks the transition from the sensorimotor to the preoperational stage?",
    "choices": [
      { "id": "A", "text": "The development of symbolic thinking and language, allowing children to use words and images to represent objects", "is_correct": true, "explanation": "The hallmark of the transition from sensorimotor to preoperational thinking is the emergence of the symbolic (semiotic) function — the ability to use symbols (words, images, mental representations) to stand for objects or events, enabling language development and symbolic play." },
      { "id": "B", "text": "The ability to perform mental operations on concrete objects, such as understanding conservation", "is_correct": false, "explanation": "The ability to perform mental operations on concrete objects (like conservation) marks the transition to the concrete operational stage (around age 7), not the sensorimotor-to-preoperational transition." },
      { "id": "C", "text": "The development of object permanence — understanding that objects exist when out of sight", "is_correct": false, "explanation": "Object permanence develops within the sensorimotor stage (typically 8-12 months) — it is an achievement of sensorimotor development, not the milestone that marks entry into the preoperational stage." },
      { "id": "D", "text": "The ability to engage in abstract, hypothetical thinking about events that have not been experienced", "is_correct": false, "explanation": "Abstract, hypothetical thinking marks entry into the formal operational stage (around age 11-12), not the sensorimotor-to-preoperational transition — the preoperational stage is characterized by symbolic thinking but still lacks logical operations." }
    ],
    "unit_objective": "PSY-3.A"
  },
  {
    "id": "psych-u3-q049",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying moral development presents two scenarios to adults. In Scenario A, a person pushes a large stranger off a bridge to stop a runaway trolley from killing five people. In Scenario B, the person pulls a lever, diverting the trolley to a track where one person will die instead of five. Most participants approve of Scenario B but reject Scenario A, despite the same mathematical outcome in both cases."
    },
    "question": "Which explanation for the different moral judgments is most consistent with contemporary moral psychology research?",
    "choices": [
      { "id": "A", "text": "Personal harm triggers stronger emotional responses (via amygdala and emotional systems) than impersonal harm, causing deontological intuitions to override utilitarian calculations", "is_correct": true, "explanation": "Joshua Greene's dual-process research showed that personal harm scenarios (physically pushing someone) activate emotional/deontological responses that override utilitarian math, while impersonal harm (lever pulling) is evaluated more analytically. The amygdala and emotional processing centers generate stronger avoidance in personal physical harm, explaining the asymmetric judgments." },
      { "id": "B", "text": "The findings reflect Kohlberg's preconventional morality — participants avoid Scenario A because they fear being punished for direct violence", "is_correct": false, "explanation": "Preconventional morality is based on personal consequences — adults reasoning at a postconventional level would apply abstract principles. The asymmetry between personal and impersonal harm reflects emotional processing differences, not fear of punishment." },
      { "id": "C", "text": "Participants in Scenario A are engaging in formal operational thinking, while Scenario B participants use preoperational logic", "is_correct": false, "explanation": "Both scenarios require the same logical reasoning capacity — Piaget's stages describe cognitive development in children, and adult participants have full formal operational capacity in both scenarios. The asymmetry is explained by emotional/deontological vs. analytical processing, not Piagetian stage differences." },
      { "id": "D", "text": "The difference reflects identity foreclosure — participants have pre-committed to 'do not kill' rules without exploring alternative moral frameworks", "is_correct": false, "explanation": "Identity foreclosure is an Eriksonian/Marcian concept about identity development — the asymmetric trolley judgment reflects the interaction of emotional and analytical moral reasoning systems, not identity formation processes." }
    ],
    "unit_objective": "PSY-3.B"
  },
  {
    "id": "psych-u3-q050",
    "unit": "unit-3",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A longitudinal study follows 150 children from birth to age 25. The researchers find that children who demonstrated secure attachment at 12-18 months were significantly more likely at age 25 to have stable romantic relationships, higher self-esteem, and better social problem-solving skills compared to children with insecure attachment histories."
    },
    "question": "Which conclusion is best supported by these longitudinal findings?",
    "choices": [
      { "id": "A", "text": "Early attachment quality creates internal working models that shape relationship expectations and social competence across development", "is_correct": true, "explanation": "Internal working models (Bowlby) are mental representations of self-other relationships derived from early attachment experiences — securely attached children develop models of self as lovable and others as reliable, which guide relationship expectations and social behavior throughout development, explaining the outcomes at age 25." },
      { "id": "B", "text": "The findings prove that early childhood determines all adult outcomes and that later experiences cannot change developmental trajectories", "is_correct": false, "explanation": "While early attachment has lasting effects, the findings do not show that trajectories are immutable — many people with insecure attachment develop healthy relationships through later experiences; the findings show a probabilistic association, not deterministic inevitability." },
      { "id": "C", "text": "Secure attachment is caused entirely by the child's genetic temperament, not by caregiver behavior", "is_correct": false, "explanation": "Attachment security is influenced by both child temperament and caregiver sensitivity/responsiveness — Ainsworth's research showed caregiver behavior is a primary determinant of attachment security; genetic temperament contributes but does not fully determine attachment outcomes." },
      { "id": "D", "text": "The correlation between early attachment and age-25 outcomes proves that early attachment is the sole cause of adult relationship quality", "is_correct": false, "explanation": "Correlation does not establish sole causation — many other factors between infancy and age 25 (subsequent caregiving, peer relationships, significant life events) also contribute to adult relationship quality; early attachment is one important predictor, not the only cause." }
    ],
    "unit_objective": "PSY-3.B"
  }
];
data.questions.push(...newQ);
fs.writeFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-3.json', JSON.stringify(data, null, 2));
console.log('unit-3 now has ' + data.questions.length + ' questions');
