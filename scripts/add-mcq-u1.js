const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-1.json'));
const newQ = [
  {
    "id": "psych-u1-q041",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which part of the brain coordinates balance, posture, and fine motor movements, and is located at the back of the brainstem?",
    "choices": [
      { "id": "A", "text": "Cerebellum", "is_correct": true, "explanation": "The cerebellum is located at the rear of the brainstem and coordinates balance, posture, and smooth execution of motor skills — damage causes ataxia (uncoordinated movement)." },
      { "id": "B", "text": "Medulla", "is_correct": false, "explanation": "The medulla oblongata controls automatic life-support functions like breathing, heart rate, and blood pressure — it does not coordinate fine motor movement or balance." },
      { "id": "C", "text": "Thalamus", "is_correct": false, "explanation": "The thalamus relays sensory signals to the cortex — it is not the primary structure for coordinating balance or fine motor movements." },
      { "id": "D", "text": "Pons", "is_correct": false, "explanation": "The pons relays signals between the cerebellum and cortex and is involved in sleep and breathing regulation — it does not itself coordinate motor movements and balance." }
    ],
    "unit_objective": "PSY-1.B"
  },
  {
    "id": "psych-u1-q042",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher finds that people can detect a 5% change in the loudness of a soft sound (e.g., from 100 to 105 units) but require a 50-unit change to detect a difference at a louder level (from 1000 to 1050 units). In both cases the detectable difference is 5% of the original stimulus."
    },
    "question": "Which sensory principle does this finding directly demonstrate?",
    "choices": [
      { "id": "A", "text": "Weber's Law — the just noticeable difference is a constant proportion of the original stimulus", "is_correct": true, "explanation": "Weber's Law states that the difference threshold (JND) is a constant fraction of the standard stimulus — a 5% change is detectable at both intensity levels, showing that detection is ratio-based, not absolute-difference-based." },
      { "id": "B", "text": "Signal detection theory — the detectable change reflects the observer's response bias, not sensory threshold", "is_correct": false, "explanation": "Signal detection theory accounts for how psychological factors influence detection decisions — it does not explain why JNDs scale proportionally with stimulus intensity, which is Weber's Law." },
      { "id": "C", "text": "The absolute threshold — repeated exposure to any sound lowers the minimum detectable level", "is_correct": false, "explanation": "The absolute threshold is the minimum stimulus detectable 50% of the time — this finding concerns the difference threshold (JND) between two stimuli, not a minimum detectable level." },
      { "id": "D", "text": "Sensory adaptation — the auditory system reduces sensitivity after prolonged exposure", "is_correct": false, "explanation": "Sensory adaptation involves reduced receptor firing with sustained stimulation — the finding tests detection of differences between stimuli, not adaptation from prolonged exposure." }
    ],
    "unit_objective": "PSY-1.A"
  },
  {
    "id": "psych-u1-q043",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "After a person walks from a dark movie theater into bright sunlight, their eyes initially feel overwhelmed and vision is temporarily poor. Within about 60 seconds, vision improves significantly. The opposite transition — from bright light into a dark room — requires several minutes of adaptation."
    },
    "question": "Which visual process best explains the difference in adaptation speeds between the two transitions?",
    "choices": [
      { "id": "A", "text": "Cones adapt rapidly in bright light; rods require more time to regenerate rhodopsin for dark adaptation", "is_correct": true, "explanation": "Cones (daylight receptors) adapt quickly to bright light. Rods (low-light receptors) contain rhodopsin, a photopigment that bleaches in light and must regenerate in darkness — this regeneration takes 20-30 minutes, explaining the slower dark adaptation." },
      { "id": "B", "text": "The optic nerve fires more rapidly in bright light, causing a temporary signal overload that takes 60 seconds to resolve", "is_correct": false, "explanation": "Optic nerve signal overload is not the mechanism — light adaptation primarily involves receptor-level photopigment changes, not nerve transmission speed." },
      { "id": "C", "text": "The difference reflects the pupillary reflex, which takes longer to dilate than to constrict", "is_correct": false, "explanation": "The pupillary reflex occurs in about 1 second — while it contributes to adaptation, the minutes-long dark adaptation is driven by rhodopsin regeneration in rods, not pupil mechanics." },
      { "id": "D", "text": "Feature detectors in the occipital lobe recalibrate after bright-to-dark transitions, requiring more processing time", "is_correct": false, "explanation": "Feature detectors respond to specific visual patterns (lines, edges) but do not mediate the photoreceptor-level light/dark adaptation process — adaptation speed differences are explained by rod vs. cone photopigment properties." }
    ],
    "unit_objective": "PSY-1.A"
  },
  {
    "id": "psych-u1-q044",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": { "type": "none" },
    "question": "The occipital lobe is primarily responsible for which cognitive function?",
    "choices": [
      { "id": "A", "text": "Processing visual information", "is_correct": true, "explanation": "The occipital lobe houses the primary visual cortex and visual association areas — it processes visual input from the retinas, including object recognition, color, and motion detection." },
      { "id": "B", "text": "Processing auditory information and language comprehension", "is_correct": false, "explanation": "The temporal lobe processes auditory information and contains Wernicke's area for language comprehension — not the occipital lobe." },
      { "id": "C", "text": "Controlling voluntary movement and executive functions", "is_correct": false, "explanation": "The frontal lobe contains the motor cortex and prefrontal cortex, which control voluntary movement and higher-order executive functions — not the occipital lobe." },
      { "id": "D", "text": "Integrating touch and spatial information", "is_correct": false, "explanation": "The parietal lobe contains the somatosensory cortex and integrates touch, spatial awareness, and proprioception — the occipital lobe is specifically dedicated to visual processing." }
    ],
    "unit_objective": "PSY-1.B"
  },
  {
    "id": "psych-u1-q045",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A person notices a faint star only when looking slightly to the side rather than directly at it. When staring directly at the star, it seems to disappear."
    },
    "question": "Which visual principle best explains why looking directly at the faint star makes it appear to disappear?",
    "choices": [
      { "id": "A", "text": "The fovea contains mainly cones, which require more light to activate; rods on the peripheral retina are more sensitive to dim light", "is_correct": true, "explanation": "The fovea (center of gaze) is densely packed with cones, which require more light to activate. Rods, concentrated in the peripheral retina, are far more sensitive to dim light — looking slightly off-center places the star's image on rod-rich peripheral retina, making it visible." },
      { "id": "B", "text": "The blind spot is located at the fovea, causing the star to disappear when directly fixated", "is_correct": false, "explanation": "The blind spot is where the optic nerve exits the retina, located slightly off-center (not at the fovea) — it is not why dim stars disappear when fixated; the fovea's cone-dominance explains this phenomenon." },
      { "id": "C", "text": "Feature detectors in the visual cortex only activate for bright objects, filtering out dim stimuli when the eye fixates", "is_correct": false, "explanation": "Feature detectors respond to specific patterns (orientations, edges) rather than filtering by brightness at fixation — the disappearance of dim stars is a retinal photoreceptor phenomenon, not a cortical filtering effect." },
      { "id": "D", "text": "The optic nerve fires maximally only for bright stimuli; dim stars do not generate sufficient electrical signals when projected to the fovea", "is_correct": false, "explanation": "The issue is the type of photoreceptor at the fovea (cones, less sensitive to dim light) rather than optic nerve firing threshold — the explanation centers on rod vs. cone distribution across the retina." }
    ],
    "unit_objective": "PSY-1.A"
  },
  {
    "id": "psych-u1-q046",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A behavioral geneticist reports that the heritability of a personality trait is 0.60 in a large sample of adult twins. A journalist interprets this as meaning that 60% of your personality is determined by your genes."
    },
    "question": "Which of the following best explains why the journalist's interpretation is incorrect?",
    "choices": [
      { "id": "A", "text": "Heritability estimates describe the proportion of variance in a population attributable to genetic differences, not the proportion of a trait in an individual determined by genes", "is_correct": true, "explanation": "Heritability is a population-level statistic — a 0.60 heritability means 60% of the observed variation in the trait across this specific population is associated with genetic variation. It does not mean any individual's trait is 60% genetic. Heritability also changes across populations and environments." },
      { "id": "B", "text": "Heritability of 0.60 means the remaining 40% of personality is entirely random and not influenced by genes or environment", "is_correct": false, "explanation": "The remaining 40% reflects environmental influences and measurement error — it is not random, nor does heritability mean exactly 60% of each person's personality is genetically determined." },
      { "id": "C", "text": "Twin studies cannot measure personality traits, making heritability calculations invalid for personality research", "is_correct": false, "explanation": "Twin studies can and routinely do measure personality traits — they are a standard tool in behavioral genetics for estimating heritability of behavioral and psychological characteristics." },
      { "id": "D", "text": "A heritability of 0.60 indicates that identical twins will have identical personalities 60% of the time", "is_correct": false, "explanation": "Heritability does not predict what percentage of identical twin pairs will have identical traits — it is a variance ratio describing population-level genetic contribution, not a probability of trait identity between twin pairs." }
    ],
    "unit_objective": "PSY-1.C"
  },
  {
    "id": "psych-u1-q047",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A pharmacologist develops a drug that blocks NMDA receptors, which are glutamate receptor subtypes critical for synaptic plasticity. In clinical trials, users who take the drug while studying show significantly reduced retention of new information 24 hours later, though their immediate recall during the study session is unaffected."
    },
    "question": "Which phenomenon does the drug most directly interfere with, and why does this affect 24-hour retention but not immediate recall?",
    "choices": [
      { "id": "A", "text": "Long-term potentiation — blocking NMDA receptors prevents the synaptic strengthening needed to consolidate short-term memories into long-term storage", "is_correct": true, "explanation": "Long-term potentiation (LTP) requires NMDA receptor activation — calcium influx through NMDA receptors triggers lasting synaptic strengthening that consolidates memories. Immediate recall uses working memory (not requiring LTP); 24-hour retention requires consolidated long-term memory supported by LTP. Blocking NMDA disrupts consolidation without affecting immediate recall." },
      { "id": "B", "text": "Sensory memory — NMDA receptors maintain iconic memory for visual information, and blocking them erases visual encoding", "is_correct": false, "explanation": "Sensory memory is maintained by sensory receptor properties, not NMDA receptors — NMDA receptors are involved in synaptic plasticity and LTP, not the brief persistence of sensory impressions." },
      { "id": "C", "text": "The serial position effect — blocking NMDA eliminates primacy but preserves recency, explaining intact immediate recall", "is_correct": false, "explanation": "The serial position effect describes recall patterns for list items — NMDA receptor blockade affects the cellular mechanism of memory consolidation (LTP), not a surface-level recall pattern like primacy vs. recency." },
      { "id": "D", "text": "Proactive interference — NMDA receptor blockade causes old memories to block encoding of new information at 24 hours", "is_correct": false, "explanation": "Proactive interference is when old memories disrupt recall of new ones — the mechanism here is failure of long-term consolidation through LTP disruption, not interference from prior memories." }
    ],
    "unit_objective": "PSY-1.A"
  },
  {
    "id": "psych-u1-q048",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying natural selection proposes that the human stress response — which triggers rapid heart rate, cortisol release, and blood sugar elevation — evolved to serve a survival function in ancestral environments. However, chronic activation of this response in modern settings is associated with cardiovascular disease, immune suppression, and type 2 diabetes."
    },
    "question": "Which principle best explains why a response that is adaptive in one context can be harmful in another?",
    "choices": [
      { "id": "A", "text": "Natural selection optimizes traits for ancestral environments; traits adaptive in past contexts may become harmful in evolutionarily novel modern conditions", "is_correct": true, "explanation": "Natural selection shaped the acute stress response for immediate physical threats (predators). Modern environments feature chronic psychological stressors that keep the system chronically activated, producing the health costs described." },
      { "id": "B", "text": "The stress response is a learned behavior reinforced by past experiences, and its health effects result from repeated operant conditioning", "is_correct": false, "explanation": "The physiological stress response (HPA axis, sympathetic nervous system) is biologically innate, not learned through conditioning — characterizing it as operantly conditioned misrepresents its evolutionary and neurobiological basis." },
      { "id": "C", "text": "The stress response triggers the parasympathetic nervous system, which over time causes cardiovascular disease through excessive rest-and-digest activation", "is_correct": false, "explanation": "The acute stress response activates the sympathetic nervous system (fight-or-flight), not the parasympathetic (rest-and-digest) — cardiovascular disease from chronic stress results from prolonged sympathetic activation and cortisol." },
      { "id": "D", "text": "The GABA system fails to inhibit the stress response in modern humans due to increased cortisol intake from processed foods", "is_correct": false, "explanation": "Cortisol is a hormone produced by the adrenal glands — it is not consumed from processed foods; this option incorrectly describes both the mechanism and the evolutionary principle." }
    ],
    "unit_objective": "PSY-1.C"
  },
  {
    "id": "psych-u1-q049",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "During surgical brain mapping in an awake patient, a neurosurgeon electrically stimulates a point on the left hemisphere. The patient immediately reports hearing words that make no sense, despite none being spoken. When stimulation moves to an adjacent area, the patient struggles to produce speech though she understands everything being said."
    },
    "question": "Which conclusion about language organization is best supported by these findings?",
    "choices": [
      { "id": "A", "text": "The stimulated points are in or near Wernicke's area (disrupting language comprehension/perception) and Broca's area (disrupting speech production), confirming functional separation of language areas", "is_correct": true, "explanation": "Electrical stimulation of Wernicke's area can generate meaningless auditory language experiences or disrupt comprehension — the first effect matches. Stimulating Broca's area disrupts speech production while leaving comprehension intact — the second effect matches. The findings confirm anatomically distinct language areas in the left hemisphere." },
      { "id": "B", "text": "Both effects result from hippocampal stimulation, which controls all language functions as the brain's language hub", "is_correct": false, "explanation": "The hippocampus is critical for memory consolidation, not language production or comprehension — language areas are in the frontal and temporal lobes (Broca's and Wernicke's areas), not the hippocampus." },
      { "id": "C", "text": "The corpus callosum was severed, preventing language from being processed in the right hemisphere", "is_correct": false, "explanation": "The corpus callosum was not mentioned as severed; the effects result from direct stimulation of specific left hemisphere language areas — not from cross-hemispheric communication failure." },
      { "id": "D", "text": "The right hemisphere controls language comprehension and the left hemisphere controls speech production in most people", "is_correct": false, "explanation": "In most right-handed people, both language comprehension (Wernicke's area) and speech production (Broca's area) are located in the left hemisphere — not split between hemispheres as this option incorrectly states." }
    ],
    "unit_objective": "PSY-1.B"
  },
  {
    "id": "psych-u1-q050",
    "unit": "unit-1",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Researchers find that patients with damage to the lateral hypothalamic area (LHA) stop eating even when food is available, eventually starving. In contrast, patients with damage to the ventromedial hypothalamus (VMH) overeat and gain weight rapidly even when not hungry."
    },
    "question": "Which conclusion about hunger regulation is best supported by the double dissociation between LHA and VMH damage?",
    "choices": [
      { "id": "A", "text": "The LHA acts as a hunger center and the VMH as a satiety center, with the hypothalamus playing a central role in regulating eating behavior", "is_correct": true, "explanation": "Double dissociation (LHA damage stops eating; VMH damage causes overeating) demonstrates distinct and opposite roles: the LHA signals hunger (stimulates eating) while the VMH signals satiety (stops eating). Together they form a hypothalamic regulation system for food intake." },
      { "id": "B", "text": "The hypothalamus controls eating behavior entirely through dopamine reward pathways, and both regions release dopamine to signal hunger", "is_correct": false, "explanation": "While dopamine reward pathways influence eating behavior, the specific LHA/VMH system is primarily regulated by leptin, ghrelin, and glucose signals — the double dissociation reflects distinct regulatory centers, not a single dopamine system." },
      { "id": "C", "text": "Hunger is entirely controlled by the frontal lobe's executive function, with the hypothalamus playing only a minor regulatory role", "is_correct": false, "explanation": "The findings directly demonstrate hypothalamic control of eating behavior — the dramatic effects of hypothalamic damage (starvation vs. obesity) confirm the hypothalamus as a primary, not minor, regulator of hunger." },
      { "id": "D", "text": "Both the LHA and VMH are part of the limbic system's emotional regulation circuit, and the eating changes reflect emotional distress from brain damage", "is_correct": false, "explanation": "While the hypothalamus is connected to the limbic system, the feeding center model (LHA/VMH) describes physiological hunger regulation, not emotional eating — the pattern of effects is consistent with direct hunger-regulation disruption, not emotional distress." }
    ],
    "unit_objective": "PSY-1.B"
  }
];
data.questions.push(...newQ);
fs.writeFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-1.json', JSON.stringify(data, null, 2));
console.log('unit-1 now has ' + data.questions.length + ' questions');
