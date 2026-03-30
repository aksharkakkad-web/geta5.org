const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-2.json'));
const newQ = [
  {
    "id": "psych-u2-q026",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the process of classical conditioning?",
    "choices": [
      { "id": "A", "text": "A neutral stimulus becomes associated with an unconditioned stimulus and elicits a conditioned response", "is_correct": true, "explanation": "In classical conditioning (Pavlov), a neutral stimulus (e.g., a bell) is paired repeatedly with an unconditioned stimulus (e.g., food) until the neutral stimulus alone elicits a conditioned response (e.g., salivation)." },
      { "id": "B", "text": "A behavior is strengthened or weakened by its consequences through reinforcement or punishment", "is_correct": false, "explanation": "Behavior strengthened or weakened by consequences describes operant conditioning (Skinner) — not classical conditioning, which involves stimulus-stimulus pairing, not behavior-consequence relationships." },
      { "id": "C", "text": "A person learns a new behavior by observing and imitating others without direct reinforcement", "is_correct": false, "explanation": "Learning by observing and imitating others describes observational (social) learning (Bandura) — classical conditioning involves automatic associations between stimuli, not modeled behavior." },
      { "id": "D", "text": "New information is encoded through semantic processing and stored in long-term memory", "is_correct": false, "explanation": "Semantic encoding and long-term storage describe memory processes — classical conditioning is a form of associative learning between stimuli, not memory encoding of information." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q027",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "According to George Miller, the capacity of short-term (working) memory is approximately how many items?",
    "choices": [
      { "id": "A", "text": "7 plus or minus 2 items", "is_correct": true, "explanation": "George Miller's classic 1956 paper 'The Magical Number Seven, Plus or Minus Two' demonstrated that short-term memory holds approximately 5-9 chunks of information — commonly summarized as 7 +/- 2." },
      { "id": "B", "text": "3 to 4 items (subitizing limit)", "is_correct": false, "explanation": "Subitizing (instantly perceiving 3-4 items) is a perceptual phenomenon — Miller identified the short-term memory capacity as approximately 7 +/- 2 chunks, not 3-4 items." },
      { "id": "C", "text": "Unlimited items as long as they are semantically related", "is_correct": false, "explanation": "Unlimited capacity describes long-term memory, not working memory — working memory is severely capacity-limited regardless of semantic relatedness, though chunking related items can increase effective capacity." },
      { "id": "D", "text": "About 20 items when the rehearsal loop is used", "is_correct": false, "explanation": "The phonological loop (rehearsal) helps maintain items in working memory but does not expand capacity to 20 items — the fundamental capacity limit remains approximately 7 +/- 2 chunks." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q028",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A student who studied French vocabulary in high school finds that learning Spanish vocabulary in college is more difficult because the French words keep coming to mind when she tries to recall Spanish words."
    },
    "question": "Which memory phenomenon best explains the student's difficulty?",
    "choices": [
      { "id": "A", "text": "Proactive interference — previously learned French is disrupting the retrieval of newly learned Spanish", "is_correct": true, "explanation": "Proactive interference occurs when older memories interfere with the recall of newer ones — the student's previously learned French intrudes on retrieval of newly learned Spanish, a classic proactive interference pattern." },
      { "id": "B", "text": "Retroactive interference — newly learned Spanish is disrupting retrieval of previously learned French", "is_correct": false, "explanation": "Retroactive interference occurs when newer learning disrupts recall of older memories — the student is having trouble recalling Spanish (new) because French (old) intrudes; this is proactive, not retroactive, interference." },
      { "id": "C", "text": "State-dependent memory — the student learned French in a different emotional state than Spanish", "is_correct": false, "explanation": "State-dependent memory refers to retrieval being easier in the same physiological or emotional state as encoding — the scenario describes linguistic interference between two learned languages, not state matching." },
      { "id": "D", "text": "The misinformation effect — the French words are false memories inserted by the student's teacher", "is_correct": false, "explanation": "The misinformation effect involves post-event information altering an existing memory — here, French vocabulary is genuinely learned knowledge that is interfering with, not falsifying, the Spanish vocabulary." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q029",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A child learns to fear dogs after being bitten by a large dog. Later, the child also shows fear responses to cats, rabbits, and other small animals, even though she has never had a negative experience with them."
    },
    "question": "Which classical conditioning process does the child's fear of cats and rabbits best illustrate?",
    "choices": [
      { "id": "A", "text": "Stimulus generalization — conditioned fear spreads to stimuli similar to the original conditioned stimulus", "is_correct": true, "explanation": "Stimulus generalization occurs when a conditioned response elicited by a CS also appears in response to similar stimuli — the child's fear generalizes from dogs (CS) to other small animals that share similar features." },
      { "id": "B", "text": "Stimulus discrimination — the child has learned to distinguish between dangerous and harmless animals", "is_correct": false, "explanation": "Stimulus discrimination is the opposite — it is the learned ability to respond only to the original CS and not to similar stimuli. The child is showing generalization (fear spreading to other animals), not discrimination." },
      { "id": "C", "text": "Extinction — the original conditioned response is being weakened by repeated non-reinforced presentations", "is_correct": false, "explanation": "Extinction requires repeated presentation of the CS without the UCS, causing the CR to fade — the child's fear is not diminishing; it is spreading to new stimuli, which is generalization." },
      { "id": "D", "text": "Second-order conditioning — the cats and rabbits have been paired with the dog, creating a chain of associations", "is_correct": false, "explanation": "Second-order conditioning requires explicit pairing of a new neutral stimulus with an existing CS — the child has not paired cats or rabbits with dogs; fear has generalized automatically to similar stimuli." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q030",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A student is studying by writing each vocabulary term three times, forming a sentence with the word, and then explaining how the term relates to a real-world example she personally experienced. A classmate reads the same terms five times without additional processing."
    },
    "question": "Based on memory research, whose recall will most likely be superior one week later, and why?",
    "choices": [
      { "id": "A", "text": "The first student's, because elaborative rehearsal and semantic encoding create deeper memory traces than rote repetition", "is_correct": true, "explanation": "Levels of processing theory predicts deeper encoding (meaning-based, personal connection) produces more durable memories. Elaborative rehearsal — forming meaningful associations — produces stronger long-term retention than maintenance rehearsal (simple repetition)." },
      { "id": "B", "text": "The classmate's, because repeated exposure (five repetitions) creates stronger automatic processing paths than elaborative strategies", "is_correct": false, "explanation": "Repetition alone (maintenance rehearsal) is less effective for long-term retention than elaborative rehearsal — research consistently shows semantic processing produces superior recall compared to rote repetition." },
      { "id": "C", "text": "Both equally, because memory capacity is fixed and the method of encoding has no effect on retention strength", "is_correct": false, "explanation": "Memory encoding method strongly affects retention — this is the core finding of levels of processing research (Craik and Lockhart). Deeper, meaning-based encoding produces reliably superior long-term recall." },
      { "id": "D", "text": "The classmate's, because reading silently avoids auditory interference that disrupts the phonological loop", "is_correct": false, "explanation": "Avoiding phonological loop interference would not make rote reading superior to elaborative encoding — the phonological loop supports short-term maintenance, not long-term consolidation, which depends on depth of processing." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q031",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A gambler continues to play slot machines even after losing large sums of money, convinced that 'the machine is due for a big payout.' In reality, each spin is independent of all previous spins."
    },
    "question": "Which cognitive bias best explains the gambler's reasoning?",
    "choices": [
      { "id": "A", "text": "The gambler's fallacy — incorrectly believing that past independent random events influence future probabilities", "is_correct": true, "explanation": "The gambler's fallacy is the mistaken belief that after a series of one outcome (e.g., losses), the opposite outcome becomes more likely — in reality, independent random events (like slot machine spins) have no memory of prior outcomes." },
      { "id": "B", "text": "Confirmation bias — selectively attending to wins while ignoring losses to confirm the belief that the machine pays off", "is_correct": false, "explanation": "Confirmation bias involves seeking or interpreting information to confirm existing beliefs — the gambler's fallacy is specifically about misunderstanding probability (believing past losses predict future wins), not about selective attention to confirming evidence." },
      { "id": "C", "text": "Functional fixedness — inability to see the slot machine as anything other than a money-generating device", "is_correct": false, "explanation": "Functional fixedness is the inability to see objects as having uses other than their standard function — this gambler's error is a probability reasoning error (gambler's fallacy), not a problem with conceptualizing the machine's function." },
      { "id": "D", "text": "The availability heuristic — the gambler easily recalls past wins, making winning seem more probable than it is", "is_correct": false, "explanation": "The availability heuristic occurs when easily recalled examples make an event seem more likely — the gambler's reasoning is specifically about past losses making future wins seem 'due,' which is the gambler's fallacy, a distinct probability error." }
    ],
    "unit_objective": "PSY-2.D"
  },
  {
    "id": "psych-u2-q032",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher presents participants with two options: Option A — a guaranteed $50, or Option B — a 50% chance to win $100 and a 50% chance to win nothing. Most participants choose Option A. When the same options are framed as losses (Option A — a guaranteed loss of $50, or Option B — a 50% chance to lose $100, 50% chance to lose nothing), most participants choose Option B."
    },
    "question": "Which cognitive phenomenon does this shift in preferences best illustrate?",
    "choices": [
      { "id": "A", "text": "Framing effect — the way options are presented influences decision-making even when expected values are identical", "is_correct": true, "explanation": "The framing effect demonstrates that decisions are influenced by whether options are presented as gains or losses, even when the mathematical expected values are identical. People are risk-averse for gains and risk-seeking for losses — a finding from Kahneman and Tversky's prospect theory." },
      { "id": "B", "text": "Anchoring bias — participants are anchored to the first option presented and fail to adjust their estimates", "is_correct": false, "explanation": "Anchoring occurs when an initial value (the anchor) biases subsequent estimates — the shift in preference between gain and loss framing is the framing effect, not anchoring, which would produce responses biased toward a numerical anchor." },
      { "id": "C", "text": "The representativeness heuristic — participants judge each option based on how well it represents a typical gamble", "is_correct": false, "explanation": "The representativeness heuristic involves judging probability by similarity to a prototype — the gain vs. loss preference shift reflects the framing effect (emotional/motivational asymmetry), not prototype-based probability judgment." },
      { "id": "D", "text": "Mental set — participants are stuck in a problem-solving strategy from previous trials and cannot reconsider the options", "is_correct": false, "explanation": "Mental set is a tendency to approach a new problem the same way as a previous one — the preference reversal here results from how options are framed (gains vs. losses), not from prior problem-solving habits." }
    ],
    "unit_objective": "PSY-2.D"
  },
  {
    "id": "psych-u2-q033",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher wants to test whether rats can form cognitive maps. She allows one group of rats to freely explore a maze without any food reward for 10 days. A second group is rewarded with food from the first day. On day 11, both groups are rewarded with food. The previously exploring (non-rewarded) group reaches the food almost as quickly as the always-rewarded group."
    },
    "question": "Which conclusion is best supported by these findings, and whose theoretical framework do they support?",
    "choices": [
      { "id": "A", "text": "Rats form cognitive maps of their environment during unrewarded exploration — supporting Tolman's latent learning theory, which holds that learning can occur without reinforcement", "is_correct": true, "explanation": "Edward Tolman's latent learning research showed that organisms learn about their environment even without immediate reward — the unexplored group had developed a mental map that enabled rapid performance once reward was introduced, demonstrating that learning can be latent (hidden) until motivation to use it emerges." },
      { "id": "B", "text": "The exploring rats' performance demonstrates negative reinforcement — the discomfort of exploration motivated faster maze completion once food was introduced", "is_correct": false, "explanation": "Negative reinforcement involves removing an unpleasant stimulus to increase behavior — the rats' exploration was undirected and unrewarded; the rapid performance when food was introduced reflects a stored cognitive map, not relief from negative stimulation." },
      { "id": "C", "text": "The results support Pavlov's classical conditioning model — the maze becomes a conditioned stimulus that predicts food", "is_correct": false, "explanation": "Classical conditioning would predict the maze triggers a conditioned response — but the dramatic performance difference requires explaining why non-rewarded exploration (without any CS-UCS pairing) still produced learning, which classical conditioning cannot account for." },
      { "id": "D", "text": "The rats' performance reflects instinctive drift — the food reward triggered innate food-seeking behaviors that overrode prior neutral exploration", "is_correct": false, "explanation": "Instinctive drift describes how conditioned behaviors gradually revert to instinctive ones — the findings show the latently learned maze layout was applied purposefully, not that instinctive behaviors displaced learned responses." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q034",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A participant in a study is asked to recall 20 words from a list she studied 30 minutes ago. She recalls 14 out of 20 words correctly. An analysis of her errors shows that 3 of the 6 forgotten words were from the middle of the list, while she correctly recalled nearly all words from the beginning and end of the list."
    },
    "question": "Which memory principle best explains the pattern of her recall errors?",
    "choices": [
      { "id": "A", "text": "Serial position effect — words from the middle of the list lack both the encoding advantage of primacy and the retrieval advantage of recency", "is_correct": true, "explanation": "The serial position effect predicts superior recall for items at the beginning (primacy — transferred to long-term memory through rehearsal) and end (recency — still in working memory) of a list. Middle items receive neither advantage, producing the worst recall — matching the participant's error pattern." },
      { "id": "B", "text": "The misinformation effect — the 30-minute delay allowed post-encoding interference to specifically target middle-list words", "is_correct": false, "explanation": "The misinformation effect involves false post-event information altering memory — the pattern described here (poor middle recall, good beginning and end recall) is the serial position effect, not interference from misleading information." },
      { "id": "C", "text": "Context-dependent memory — the testing context differed from the encoding context, reducing recall of the emotionally neutral middle words", "is_correct": false, "explanation": "Context-dependent memory predicts overall recall impairment when encoding and retrieval contexts differ — it does not specifically predict a position-based pattern of errors favoring the beginning and end of a list." },
      { "id": "D", "text": "Decay theory — middle-list words were encoded earliest and lost through simple decay before the recall test", "is_correct": false, "explanation": "Decay theory predicts that earlier-encoded items would be lost first — but primacy words (early in the list) are recalled well, contradicting pure decay theory. The serial position effect better accounts for the specific beginning-end superiority." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q035",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Researchers study a patient (H.M.) who underwent bilateral hippocampal removal to treat severe epilepsy. After surgery, H.M. could not form new declarative memories — he could not recall new faces or events from minutes earlier. However, he could learn new motor skills (like mirror drawing) and showed normal improvement over sessions, even though he did not consciously remember practicing."
    },
    "question": "Which conclusion about memory systems is best supported by H.M.'s case?",
    "choices": [
      { "id": "A", "text": "The hippocampus is essential for forming new explicit (declarative) memories but not for procedural (implicit) skill learning, suggesting these are separate memory systems", "is_correct": true, "explanation": "H.M.'s preserved motor learning with impaired episodic/semantic memory formation demonstrates a double dissociation between explicit (hippocampus-dependent) and implicit procedural memory (cerebellum/basal ganglia-dependent) systems — a landmark finding supporting multi-store memory models." },
      { "id": "B", "text": "The hippocampus stores all long-term memories; H.M.'s motor skill learning proves that short-term memory has unlimited capacity", "is_correct": false, "explanation": "Motor skill learning is long-term implicit memory — H.M.'s preserved skill learning shows the hippocampus is not required for all long-term memory; procedural memory uses different neural systems. This does not relate to short-term memory capacity." },
      { "id": "C", "text": "H.M.'s motor learning proves that the frontal lobe compensated for hippocampal loss by taking over all memory functions", "is_correct": false, "explanation": "The frontal lobe manages executive functions and working memory — H.M.'s case shows procedural memory uses different systems (cerebellum, basal ganglia) than declarative memory, not that the frontal lobe compensated for hippocampal function." },
      { "id": "D", "text": "H.M.'s case demonstrates that declarative memory is stored in the cerebellum, which was damaged during surgery along with the hippocampus", "is_correct": false, "explanation": "The cerebellum mediates motor coordination and procedural skill learning — declarative memory depends on the hippocampus. H.M.'s cerebellar function was intact (as shown by his motor learning), while hippocampal removal eliminated his declarative memory formation." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q036",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following is an example of a variable-ratio schedule of reinforcement?",
    "choices": [
      { "id": "A", "text": "A slot machine that pays out after an unpredictable number of pulls", "is_correct": true, "explanation": "A variable-ratio schedule delivers reinforcement after an unpredictable, average number of responses — slot machines are the classic example, producing high, steady rates of responding because the next reward could come at any time." },
      { "id": "B", "text": "Receiving a paycheck every two weeks regardless of performance", "is_correct": false, "explanation": "Receiving a paycheck on a fixed time schedule (every two weeks) describes a fixed-interval schedule — reinforcement is delivered after a predictable time period, not after an unpredictable number of responses." },
      { "id": "C", "text": "Getting a bonus after completing every 10 sales calls", "is_correct": false, "explanation": "Reinforcement after every fixed number of responses describes a fixed-ratio schedule — the number of responses required is constant (10 calls), not variable." },
      { "id": "D", "text": "Being praised by a teacher at random times during the school day regardless of behavior", "is_correct": false, "explanation": "Random praise based on time rather than number of responses describes a variable-interval schedule — reinforcement is delivered after an unpredictable time interval, not after an unpredictable number of behaviors." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q037",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which perceptual principle explains why a viewer sees the following pattern (**  **  **  **) as three pairs of stars rather than six separate stars?",
    "choices": [
      { "id": "A", "text": "Gestalt principle of proximity — elements close together are perceived as belonging to the same group", "is_correct": true, "explanation": "The Gestalt principle of proximity states that elements that are spatially near each other are perceptually grouped together — the pairs of stars appear grouped because stars within each pair are closer to each other than to stars in adjacent pairs." },
      { "id": "B", "text": "Gestalt principle of closure — the mind fills in gaps to create complete, familiar shapes from incomplete patterns", "is_correct": false, "explanation": "Closure is the tendency to perceive incomplete figures as complete wholes — the stars are not an incomplete shape being closed; they are complete elements being grouped, which is proximity." },
      { "id": "C", "text": "Binocular disparity — the slight difference in each eye's retinal image creates depth perception between pairs", "is_correct": false, "explanation": "Binocular disparity is a depth cue based on the slightly different images from each eye — it creates depth perception, not the perceptual grouping of flat elements into pairs." },
      { "id": "D", "text": "Top-down processing — prior knowledge of what 'pairs' look like guides perception of the pattern", "is_correct": false, "explanation": "Top-down processing involves higher-level knowledge influencing perception — the grouping of nearby elements into pairs is a bottom-up Gestalt process (proximity) driven by the sensory data itself, not by prior conceptual knowledge." }
    ],
    "unit_objective": "PSY-2.A"
  },
  {
    "id": "psych-u2-q038",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A student who just learned about confirmation bias immediately begins noticing examples of it in news media, social media, and everyday conversations. Before taking the psychology course, she had never noticed these patterns despite encountering them daily."
    },
    "question": "Which perceptual concept best explains the sudden increase in noticing confirmation bias examples?",
    "choices": [
      { "id": "A", "text": "Perceptual set — having a concept in mind makes the student more likely to notice and interpret stimuli through that lens", "is_correct": true, "explanation": "Perceptual set is the tendency for expectations, context, and prior knowledge to influence perception — learning about confirmation bias created a schema that makes her more alert to and likely to recognize those patterns in everyday experience." },
      { "id": "B", "text": "Change blindness — the student previously failed to notice the bias because her attention was directed elsewhere", "is_correct": false, "explanation": "Change blindness is the failure to detect changes when attention is directed elsewhere during the change — the student's increased noticing reflects a perceptual set created by new knowledge, not change blindness." },
      { "id": "C", "text": "Sensory adaptation — her sensory neurons have become more sensitive to signals related to cognitive bias", "is_correct": false, "explanation": "Sensory adaptation involves reduced sensitivity with sustained stimulation at the sensory receptor level — increased noticing of a newly learned concept is a top-down perceptual set effect, not a change in sensory receptor sensitivity." },
      { "id": "D", "text": "The cocktail party effect — the student's brain now selectively filters for confirmation bias like her name being called in a crowd", "is_correct": false, "explanation": "The cocktail party effect is selective attention to personally relevant signals (like your name) in a noisy environment — the student's pattern reflects perceptual set from newly acquired knowledge, not the cocktail party effect." }
    ],
    "unit_objective": "PSY-2.A"
  },
  {
    "id": "psych-u2-q039",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A child who has learned the rule 'add -ed to verbs to make them past tense' begins saying 'goed' and 'runned' after previously using 'went' and 'ran' correctly. This error emerges even though adults consistently use correct irregular past tenses around the child."
    },
    "question": "Which language development process does this error pattern best illustrate?",
    "choices": [
      { "id": "A", "text": "Overgeneralization — the child incorrectly applies a grammatical rule to irregular verbs that are exceptions to the rule", "is_correct": true, "explanation": "Overgeneralization (overgeneralization errors) occurs when children learn a grammatical rule and apply it too broadly, including to irregular forms that are exceptions — saying 'goed' shows the child has learned the rule but not yet the irregular exceptions." },
      { "id": "B", "text": "Telegraphic speech — the child is reducing sentences to essential words only, creating minimal utterances", "is_correct": false, "explanation": "Telegraphic speech (2-word stage) involves dropping grammatical function words and keeping content words — the error described involves applying a grammar rule to irregular verbs, not simplification to telegraphic form." },
      { "id": "C", "text": "Language acquisition device failure — the inborn grammar mechanism is malfunctioning, causing regression to earlier speech patterns", "is_correct": false, "explanation": "The language acquisition device (Chomsky) is a theoretical inborn mechanism for grammar learning — overgeneralization is a normal, predictable stage of language acquisition, not a malfunction of the LAD." },
      { "id": "D", "text": "Linguistic relativity — the child's native language structure is preventing correct encoding of irregular past tenses", "is_correct": false, "explanation": "Linguistic relativity (Sapir-Whorf hypothesis) proposes that language influences thought across different languages — overgeneralization within a single language is a developmental learning error, not a cross-linguistic relativity effect." }
    ],
    "unit_objective": "PSY-2.E"
  },
  {
    "id": "psych-u2-q040",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A rat in a Skinner box is trained to press a lever for food. After training is complete, the food dispenser is disabled and pressing the lever no longer delivers food. After 40 lever presses with no food reward, the rat stops pressing."
    },
    "question": "Which operant conditioning process does the rat's cessation of lever pressing demonstrate?",
    "choices": [
      { "id": "A", "text": "Extinction — the operant response declines when it is no longer followed by reinforcement", "is_correct": true, "explanation": "Extinction in operant conditioning occurs when a previously reinforced behavior is no longer reinforced, causing the response rate to decrease and eventually cease — the rat's lever pressing extinguishes without the food reward." },
      { "id": "B", "text": "Spontaneous recovery — the rat's behavior spontaneously returns to baseline after a rest period", "is_correct": false, "explanation": "Spontaneous recovery is the reappearance of an extinguished response after a rest period — the rat's cessation of pressing describes extinction, not the later return of the response." },
      { "id": "C", "text": "Negative punishment — the food has been removed, which punishes lever pressing and reduces its frequency", "is_correct": false, "explanation": "Negative punishment involves removing a desired stimulus to decrease a behavior — extinction occurs when reinforcement simply stops being available, not when it is actively removed as a consequence of the behavior." },
      { "id": "D", "text": "Latent inhibition — the rat learned to ignore the lever because it repeatedly failed to produce food before training", "is_correct": false, "explanation": "Latent inhibition refers to reduced conditioning to a stimulus that was previously presented without consequence — the rat was successfully trained (lever pressing was reinforced), so the cessation without reinforcement is extinction, not latent inhibition." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q041",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A person entering a dimly lit restaurant initially struggles to read the menu. After a few minutes, her vision adjusts and she can read the menu easily even though the lighting level has not changed."
    },
    "question": "Which sensory process explains the improved vision in the dark restaurant?",
    "choices": [
      { "id": "A", "text": "Dark adaptation — photoreceptors (especially rods) adjust to the reduced light level, increasing sensitivity", "is_correct": true, "explanation": "Dark adaptation is the process by which rods gradually increase in sensitivity as rhodopsin regenerates and the visual system adjusts to low-light conditions — it takes several minutes to complete, explaining improved menu reading after time in the dimly lit room." },
      { "id": "B", "text": "Sensory adaptation — the nervous system reduces sensory input in response to sustained darkness, which paradoxically improves perception", "is_correct": false, "explanation": "Sensory adaptation typically reduces sensitivity with sustained stimulation — dark adaptation specifically involves increasing photoreceptor sensitivity as the visual system adjusts to low light, which is the opposite of sensory adaptation reduction." },
      { "id": "C", "text": "Top-down processing — knowing what the menu says allows the brain to fill in missing visual information", "is_correct": false, "explanation": "Top-down processing uses prior knowledge to interpret ambiguous sensory input — the scenario describes a genuine improvement in visual sensitivity from photoreceptor adjustment (dark adaptation), not knowledge-based interpretation." },
      { "id": "D", "text": "Absolute threshold lowering — the brain permanently reduces its detection threshold in all sensory systems after exposure to darkness", "is_correct": false, "explanation": "The absolute threshold is not permanently altered by exposure to darkness — dark adaptation is a temporary, reversible change in photoreceptor sensitivity specific to the visual system, not a permanent cross-sensory threshold change." }
    ],
    "unit_objective": "PSY-2.A"
  },
  {
    "id": "psych-u2-q042",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "In a study of observational learning, children aged 3-6 watched an adult either aggressively beat a Bobo doll or play quietly with other toys. Children who watched the aggressive model were significantly more likely to beat the Bobo doll themselves. Children who watched the non-aggressive model showed little aggression toward the doll."
    },
    "question": "Which conclusion is best supported by the Bobo doll study, and what does it demonstrate about learning?",
    "choices": [
      { "id": "A", "text": "Observational learning can produce new behaviors without direct reinforcement, supporting Bandura's social learning theory", "is_correct": true, "explanation": "Albert Bandura's Bobo doll experiments demonstrated that children can acquire new behaviors simply by observing a model — the children who watched aggression reproduced it without being directly reinforced for the behavior, showing learning through observation (vicarious reinforcement and modeling)." },
      { "id": "B", "text": "Classical conditioning caused the doll to become a conditioned stimulus for aggressive responses after being paired with the adult model", "is_correct": false, "explanation": "Classical conditioning requires pairing a neutral stimulus with an unconditioned stimulus to elicit a conditioned response — the children learned specific aggressive behaviors from observation, not through CS-UCS pairing with the doll." },
      { "id": "C", "text": "The aggressive children received positive reinforcement during the study that shaped their behavior toward the doll", "is_correct": false, "explanation": "No reinforcement was given to the children — Bandura's design specifically excluded direct reinforcement to demonstrate that observation alone can produce learning, which is the key contribution of the study." },
      { "id": "D", "text": "The results demonstrate preparedness theory — children are biologically prepared to learn aggressive behaviors more readily than non-aggressive ones", "is_correct": false, "explanation": "Preparedness theory refers to the evolved tendency to more easily condition certain stimulus-response associations — the Bobo doll study demonstrates social learning (modeling), not biological preparedness for a specific type of conditioned association." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q043",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher presents a patient with anterograde amnesia with an unfamiliar piece of music and asks him to rate how much he likes it. Tested again the next day with no memory of having heard it before, the patient rates the music significantly higher than his initial rating. This increase in liking is consistent with findings across many participants."
    },
    "question": "Which memory-related phenomenon does this finding most directly demonstrate?",
    "choices": [
      { "id": "A", "text": "The mere exposure effect — repeated exposure to a stimulus increases liking even without conscious memory of prior exposure", "is_correct": true, "explanation": "The mere exposure effect (Zajonc) is the tendency to prefer stimuli encountered before — the patient's increased liking after prior exposure, despite having no conscious memory of it, shows that implicit familiarity shapes preference even when explicit memory is absent." },
      { "id": "B", "text": "Context-dependent memory — the music triggers retrieval of contextual cues from the original listening session", "is_correct": false, "explanation": "Context-dependent memory involves improved recall when retrieval context matches encoding context — the amnesiac patient has no conscious recall of the original exposure; the effect on preference demonstrates implicit (not explicit contextual) memory." },
      { "id": "C", "text": "State-dependent memory — the patient was in the same emotional state during both ratings, producing identical responses", "is_correct": false, "explanation": "State-dependent memory predicts better recall in matching emotional/physiological states — the patient shows increasing preference (not just consistent recall), and this reflects implicit mere exposure, not state-dependent retrieval." },
      { "id": "D", "text": "Priming — prior exposure to the music activates related semantic concepts, making the music easier to process and rate positively", "is_correct": false, "explanation": "Priming facilitates processing of related concepts after prior exposure — while priming may play a role in fluency, the specific phenomenon of increased liking through repeated exposure without conscious awareness is the mere exposure effect." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q044",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A cognitive psychologist tests two groups on a problem-solving task. Group A is given a standard box of tacks and told to mount a candle on the wall. Group B is given the same materials, but the tacks are piled beside an empty box. Group B solves the problem significantly faster."
    },
    "question": "Which cognitive phenomenon explains why Group A struggles more than Group B, and what does the solution require?",
    "choices": [
      { "id": "A", "text": "Functional fixedness — Group A perceives the box only as a tack container; Group B more easily conceives of the box as a shelf to mount the candle", "is_correct": true, "explanation": "Functional fixedness is the tendency to see objects only in terms of their typical function — Group A's box contains tacks, making it harder to see as a shelf. Group B's empty box is not fulfilling its typical function, making its alternative use as a candle platform more accessible. The solution requires tacking the box to the wall and using it as a candle holder." },
      { "id": "B", "text": "Confirmation bias — Group A tests only solutions consistent with prior beliefs about candles, ignoring the box as a potential tool", "is_correct": false, "explanation": "Confirmation bias involves seeking information consistent with existing beliefs — the difficulty here is perceiving the box's alternative function, which is functional fixedness, not motivated rejection of disconfirming evidence." },
      { "id": "C", "text": "Mental set — Group A applies a previously successful problem-solving approach that does not work for this new problem", "is_correct": false, "explanation": "Mental set is persistence of a prior problem-solving approach — functional fixedness is the specific cognitive barrier here, involving the failure to see an object in a non-standard function, not the application of a previously successful strategy." },
      { "id": "D", "text": "Availability heuristic — Group A over-relies on easily recalled solutions, preventing creative approaches", "is_correct": false, "explanation": "The availability heuristic involves judging probability by ease of recall — functional fixedness specifically explains the failure to reconceptualize the box's function, which is the key obstacle in this candle problem (Duncker's problem)." }
    ],
    "unit_objective": "PSY-2.D"
  },
  {
    "id": "psych-u2-q045",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A child who has just learned the word 'cat' applies it to all four-legged animals, calling dogs, cows, and horses 'cat.' After several weeks, the child stops calling all animals 'cat' and uses different words for different animals, though still occasionally uses 'cat' for a new, unfamiliar four-legged animal."
    },
    "question": "Which two language and cognitive processes are sequentially illustrated in this scenario?",
    "choices": [
      { "id": "A", "text": "First overextension, then differentiation — the child expands a concept too broadly, then gradually refines category boundaries through experience", "is_correct": true, "explanation": "Overextension is using a word for a broader category than it applies to (applying 'cat' to all four-legged animals). Differentiation follows as the child learns the specific features that distinguish categories — using 'cat' only for cats and other words for dogs, cows, etc." },
      { "id": "B", "text": "First underextension, then overgeneralization — the child initially restricts the concept, then applies the rule too broadly", "is_correct": false, "explanation": "Underextension is using a word too narrowly (e.g., 'cat' only for the family cat) — the child here is using it too broadly (overextension), then narrowing. Overgeneralization refers to grammar rule application errors, not concept refinement." },
      { "id": "C", "text": "First accommodation, then assimilation — the child first modifies existing schemas to fit new animals, then assimilates new animals into the existing cat schema", "is_correct": false, "explanation": "Assimilation and accommodation are reversed here — using 'cat' for all animals is assimilation (fitting new animals into the existing schema); learning different words for each animal is accommodation (modifying schemas), not the other way around." },
      { "id": "D", "text": "First telegraphic speech, then morphological rule learning — the child progresses from two-word phrases to applying grammatical morphemes", "is_correct": false, "explanation": "Telegraphic speech involves simplified two-word utterances — the scenario describes conceptual overextension and refinement of a single vocabulary word, not progression from telegraphic to grammatical speech." }
    ],
    "unit_objective": "PSY-2.E"
  },
  {
    "id": "psych-u2-q046",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher presents 30 pairs of dots to participants and asks them to judge which dot pair is farther away. In each pair, one dot is higher in the visual field and one is lower. Participants consistently judge the higher dot as farther away, even when the pairs are equal in retinal size."
    },
    "question": "Which monocular depth cue does this finding demonstrate?",
    "choices": [
      { "id": "A", "text": "Relative height — objects higher in the visual field are perceived as farther away", "is_correct": true, "explanation": "Relative height is a monocular depth cue based on the observation that objects farther away appear higher in the visual field (above the horizon line) — the brain uses vertical position in the visual field to infer depth." },
      { "id": "B", "text": "Retinal disparity — the brain computes distance from the difference in dot position between the two eyes", "is_correct": false, "explanation": "Retinal disparity is a binocular cue based on the different images from each eye — the experiment uses monocular dot pairs and the effect occurs without binocular disparity information." },
      { "id": "C", "text": "Linear perspective — parallel lines converging in the distance create the impression of depth", "is_correct": false, "explanation": "Linear perspective uses converging lines to suggest depth — the scenario involves vertical position of individual dots, not converging lines, which is the relative height cue." },
      { "id": "D", "text": "Interposition — the higher dot partially blocks the lower dot, indicating the higher one is closer", "is_correct": false, "explanation": "Interposition occurs when one object overlaps another, indicating the overlapping object is closer — the dots are described as pairs without overlap; the depth cue here is relative height (vertical position), not interposition." }
    ],
    "unit_objective": "PSY-2.A"
  },
  {
    "id": "psych-u2-q047",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "After initially conditioning a dog to salivate at the sound of a bell (CS), a researcher presents the bell alone 30 times without the food (UCS). The salivation stops. Two weeks later, the bell is presented again without any additional training, and the dog salivates briefly before the response fades again."
    },
    "question": "The dog's brief salivation after the two-week rest period is best described as which of the following?",
    "choices": [
      { "id": "A", "text": "Spontaneous recovery — an extinguished conditioned response reappears after a rest period", "is_correct": true, "explanation": "Spontaneous recovery is the reappearance of an extinguished conditioned response after a rest period without additional conditioning — the dog's brief salivation after two weeks demonstrates that extinction does not permanently eliminate the conditioned association." },
      { "id": "B", "text": "Higher-order conditioning — the passage of time has strengthened the CS-CR association beyond baseline", "is_correct": false, "explanation": "Higher-order conditioning involves pairing a new neutral stimulus with an established CS to create a new conditioned response — time passing after extinction does not strengthen the CS-CR association; it allows spontaneous recovery of the extinguished response." },
      { "id": "C", "text": "Reconditioning — the dog required additional UCS-CS pairings during the rest period to reestablish the conditioned response", "is_correct": false, "explanation": "Reconditioning involves re-pairing the CS with the UCS — spontaneous recovery occurs without any additional pairings, solely after a rest period, distinguishing it from reconditioning." },
      { "id": "D", "text": "Discrimination learning — the dog has learned to respond only to the bell after a rest period but not to other sounds", "is_correct": false, "explanation": "Discrimination learning involves responding to the CS but not to similar stimuli — spontaneous recovery describes the temporary reappearance of an extinguished response to the original CS after a rest period, not selective responding." }
    ],
    "unit_objective": "PSY-2.B"
  },
  {
    "id": "psych-u2-q048",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes implicit memory?",
    "choices": [
      { "id": "A", "text": "Memory that is expressed through performance without conscious recollection, such as procedural skills and conditioned responses", "is_correct": true, "explanation": "Implicit memory (nondeclarative memory) includes procedural memory (motor skills like riding a bike), conditioned responses, and priming — it is expressed through performance improvements without conscious awareness or intentional retrieval." },
      { "id": "B", "text": "Memory for specific personal events and experiences that can be consciously recalled and verbally reported", "is_correct": false, "explanation": "Memory for personal events that can be consciously recalled describes episodic memory, a form of explicit (declarative) memory — not implicit memory, which operates below conscious awareness." },
      { "id": "C", "text": "Memory for facts, concepts, and general knowledge that is consciously accessible", "is_correct": false, "explanation": "Memory for facts and general knowledge describes semantic memory, another form of explicit (declarative) memory — implicit memory involves performance-based expression without conscious access." },
      { "id": "D", "text": "The brief, high-capacity sensory storage system that holds perceptual impressions for less than a second", "is_correct": false, "explanation": "Brief, high-capacity sensory storage describes sensory memory (iconic or echoic memory) — implicit memory is a long-term memory system for skills and conditioned responses, not a sensory buffer." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q049",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Researchers in a classic study gave participants either a positive or a negative leading question about a previous event. Participants who received the positive question recalled significantly more positive details about the event than those who received the negative question, even though all participants had experienced the same event."
    },
    "question": "Which research finding does this study most directly support, and what does it reveal about memory?",
    "choices": [
      { "id": "A", "text": "Memory is reconstructive, not reproductive — post-event information can systematically distort what people remember, as demonstrated by Loftus's misinformation research", "is_correct": true, "explanation": "Loftus's eyewitness memory research established that memory is a reconstructive process influenced by post-event information — leading questions can insert information that was not originally experienced, causing people to 'remember' things consistent with the suggestion rather than the actual event." },
      { "id": "B", "text": "Memory is stored as exact photographic records of experience that are selectively retrieved based on mood", "is_correct": false, "explanation": "The finding directly contradicts a photographic memory model — if memory were a perfect record, post-event suggestions could not alter it. The study shows memory is actively reconstructed rather than reproduced." },
      { "id": "C", "text": "The spacing effect — distributed practice over time makes memories more resistant to post-event interference", "is_correct": false, "explanation": "The spacing effect describes how distributed practice improves long-term retention — this study examines how post-event information distorts memory, which is the misinformation effect, not a spacing effect." },
      { "id": "D", "text": "Retroactive interference — new information always overwrites older memories without trace", "is_correct": false, "explanation": "Retroactive interference is when new learning disrupts recall of older memories — the misinformation effect is more specific: post-event suggestions alter memory content in a systematic, directional way, creating false memories rather than simply erasing old ones." }
    ],
    "unit_objective": "PSY-2.C"
  },
  {
    "id": "psych-u2-q050",
    "unit": "unit-2",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A student tries to recall the name of a professor she met at a conference last year. She cannot retrieve the name but feels certain she knows it — she can recall the professor's department, the topic of her talk, and the color of her scarf, but the name remains just out of reach."
    },
    "question": "Which memory phenomenon does the student's experience most directly illustrate?",
    "choices": [
      { "id": "A", "text": "Tip-of-the-tongue phenomenon — partial retrieval of stored information where peripheral details are accessible but the target memory is temporarily blocked", "is_correct": true, "explanation": "The tip-of-the-tongue (TOT) state is characterized by strong feeling of knowing a word/name, recall of related details, but inability to retrieve the specific target — it demonstrates that encoding was successful but retrieval is temporarily blocked, often due to interference." },
      { "id": "B", "text": "Encoding failure — the name was never properly encoded into long-term memory despite the student believing otherwise", "is_correct": false, "explanation": "Encoding failure would predict no related memories of the person — the student recalls rich contextual details (department, talk topic, scarf color), indicating successful encoding occurred; the failure is in retrieval, not encoding." },
      { "id": "C", "text": "Proactive interference — earlier learning of similar names is blocking retrieval of this professor's name", "is_correct": false, "explanation": "Proactive interference occurs when older learning disrupts newer recall — the TOT state specifically describes partial retrieval with strong feeling of knowing; while interference may contribute to TOT states, the phenomenon itself is about incomplete retrieval, not interference per se." },
      { "id": "D", "text": "Motivated forgetting — the student unconsciously suppresses the name because it is associated with an anxiety-provoking memory of the conference", "is_correct": false, "explanation": "Motivated forgetting (repression) involves unconscious suppression of emotionally threatening material — the student actively wants to recall the name and experiences frustration, which is inconsistent with motivated forgetting." }
    ],
    "unit_objective": "PSY-2.C"
  }
];
data.questions.push(...newQ);
fs.writeFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-2.json', JSON.stringify(data, null, 2));
console.log('unit-2 now has ' + data.questions.length + ' questions');
