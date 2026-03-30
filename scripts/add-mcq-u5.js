const fs = require('fs');
const data = JSON.parse(fs.readFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-5.json'));
const newQ = [
  {
    "id": "psych-u5-q026",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes the purpose of the DSM-5 in clinical psychology?",
    "choices": [
      { "id": "A", "text": "To provide standardized diagnostic criteria for classifying mental disorders", "is_correct": true, "explanation": "The Diagnostic and Statistical Manual of Mental Disorders (DSM-5) is the American Psychiatric Association's reference manual for diagnosing mental disorders — it provides standardized symptom criteria, duration requirements, and severity thresholds for each recognized disorder." },
      { "id": "B", "text": "To prescribe specific treatment protocols for each recognized mental disorder", "is_correct": false, "explanation": "The DSM-5 is a diagnostic classification system, not a treatment manual — it specifies how to diagnose disorders but does not prescribe treatment approaches (treatment guidelines come from clinical practice guidelines and evidence-based therapy research)." },
      { "id": "C", "text": "To determine legal culpability in criminal cases involving defendants with mental illness", "is_correct": false, "explanation": "Legal determinations of mental culpability are made by courts using legal standards (e.g., insanity defense) — the DSM-5 is a clinical diagnostic tool, not a legal standard for culpability." },
      { "id": "D", "text": "To establish the biological causes of each recognized mental disorder", "is_correct": false, "explanation": "The DSM-5 uses descriptive diagnostic criteria (observable symptoms, duration, impairment) without requiring established biological causes — it takes an atheoretical approach to etiology, neither requiring nor specifying biological origins." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q027",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following treatment approaches is specifically associated with Joseph Wolpe's work on anxiety disorders?",
    "choices": [
      { "id": "A", "text": "Systematic desensitization — gradually exposing clients to feared stimuli while maintaining a relaxed state", "is_correct": true, "explanation": "Joseph Wolpe developed systematic desensitization, which pairs progressive muscle relaxation with graduated exposure to a fear hierarchy — the relaxation response is incompatible with anxiety (reciprocal inhibition), progressively reducing the conditioned fear response." },
      { "id": "B", "text": "Free association — encouraging clients to report all thoughts without censorship to access unconscious material", "is_correct": false, "explanation": "Free association is a psychodynamic technique developed by Freud — it aims to access unconscious material, not to systematically reduce conditioned anxiety responses through reciprocal inhibition." },
      { "id": "C", "text": "Cognitive restructuring — identifying and challenging irrational automatic thoughts that maintain anxiety", "is_correct": false, "explanation": "Cognitive restructuring is associated with Aaron Beck's cognitive therapy — it targets maladaptive thought patterns rather than directly conditioning anxiety responses through graduated exposure." },
      { "id": "D", "text": "Unconditional positive regard — providing complete acceptance to allow clients to move toward self-actualization", "is_correct": false, "explanation": "Unconditional positive regard is a humanistic therapeutic condition from Carl Rogers's person-centered approach — it facilitates growth through acceptance, not through behavioral conditioning of anxiety responses." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q028",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A patient with schizophrenia is prescribed an antipsychotic medication. After six months of treatment, her hallucinations and delusions have largely resolved. However, she has developed repetitive, involuntary movements of her face, tongue, and limbs that did not exist before treatment."
    },
    "question": "The side effect the patient has developed is best identified as which of the following?",
    "choices": [
      { "id": "A", "text": "Tardive dyskinesia — a late-onset movement disorder caused by long-term dopamine blockade from antipsychotic medications", "is_correct": true, "explanation": "Tardive dyskinesia is a potentially irreversible side effect of long-term antipsychotic (especially conventional/first-generation) use — dopamine receptor blockade eventually causes receptor supersensitivity, producing involuntary, repetitive facial and limb movements." },
      { "id": "B", "text": "Extrapyramidal symptoms — acute motor side effects including tremor and rigidity that appear immediately after starting antipsychotics", "is_correct": false, "explanation": "Extrapyramidal symptoms (EPS) are acute motor side effects appearing soon after starting antipsychotics (tremor, rigidity, akathisia) — tardive dyskinesia is a separate, late-onset syndrome appearing after months to years of treatment." },
      { "id": "C", "text": "Catatonia — a schizophrenia symptom involving immobility, rigidity, and mutism that can emerge during treatment", "is_correct": false, "explanation": "Catatonia is a psychotic symptom (not a medication side effect) involving motor immobility, stupor, or excitement — the involuntary repetitive movements after six months of antipsychotic treatment specifically describe tardive dyskinesia." },
      { "id": "D", "text": "Word salad — the involuntary production of meaningless language sequences caused by antipsychotic withdrawal", "is_correct": false, "explanation": "Word salad is a disorganized speech symptom of schizophrenia — it involves language, not involuntary motor movements. The patient's symptoms (involuntary facial and limb movements) describe tardive dyskinesia, a motor side effect." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q029",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A person experiences recurrent, unexpected panic attacks — sudden surges of intense fear with symptoms including racing heart, shortness of breath, chest pain, and fear of dying. Between attacks, she persistently worries about having another attack and has changed her daily routine to avoid situations she associates with past attacks."
    },
    "question": "Which anxiety disorder diagnosis best fits this clinical presentation?",
    "choices": [
      { "id": "A", "text": "Panic disorder — characterized by recurrent unexpected panic attacks, anticipatory anxiety, and behavioral changes to avoid future attacks", "is_correct": true, "explanation": "Panic disorder is diagnosed when a person has recurrent unexpected panic attacks AND develops persistent concern about future attacks and/or avoidance behaviors — all three criteria (attacks, anticipatory anxiety, behavioral change) are present in this case." },
      { "id": "B", "text": "Specific phobia — intense fear of a specific object or situation that triggers predictable fear responses", "is_correct": false, "explanation": "Specific phobia involves fear of a clearly identified stimulus (e.g., spiders, heights) — the attacks described are unexpected (not tied to a specific known trigger), and the anticipatory anxiety is about the attacks themselves rather than a specific phobic object." },
      { "id": "C", "text": "Generalized anxiety disorder — excessive, uncontrollable worry about multiple domains of life for at least 6 months", "is_correct": false, "explanation": "GAD is characterized by persistent, broad-spectrum worry across many life domains — this person's worry is specifically about having panic attacks (not broad generalized worry), and she experiences discrete panic episodes, which are not the primary feature of GAD." },
      { "id": "D", "text": "Agoraphobia without panic disorder — fear of public places and open spaces without accompanying panic attacks", "is_correct": false, "explanation": "Agoraphobia without panic disorder involves fear and avoidance of situations from which escape might be difficult — while the patient avoids certain situations, her primary experience is recurrent panic attacks with anticipatory anxiety, meeting criteria for panic disorder (which can co-occur with agoraphobia)." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q030",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A therapist using cognitive-behavioral therapy helps a socially anxious client identify the thought: 'If I say anything in class, people will think I'm stupid and laugh at me.' The therapist asks the client to evaluate the evidence for and against this belief, consider alternative interpretations, and run behavioral experiments to test whether the feared outcome actually occurs."
    },
    "question": "Which specific CBT technique is the therapist primarily using?",
    "choices": [
      { "id": "A", "text": "Cognitive restructuring — identifying, evaluating, and modifying maladaptive automatic thoughts", "is_correct": true, "explanation": "Cognitive restructuring involves identifying automatic thoughts, examining the evidence for and against them, generating alternative interpretations, and testing beliefs through behavioral experiments — the techniques described match cognitive restructuring in CBT." },
      { "id": "B", "text": "Systematic desensitization — pairing relaxation with graduated exposure to social situations", "is_correct": false, "explanation": "Systematic desensitization uses progressive muscle relaxation paired with a fear hierarchy — the therapist described is primarily targeting the cognitive distortions (evaluating evidence, alternative interpretations) rather than pairing relaxation with exposure." },
      { "id": "C", "text": "Free association — allowing the client to report all thoughts without censorship to access unconscious social anxiety roots", "is_correct": false, "explanation": "Free association is a psychodynamic technique for accessing unconscious material — the therapist is using structured cognitive evaluation of specific automatic thoughts, a hallmark of CBT, not psychodynamic free association." },
      { "id": "D", "text": "Person-centered reflection — the therapist reflects the client's feelings to increase self-acceptance", "is_correct": false, "explanation": "Person-centered therapy uses empathic reflection and unconditional positive regard — the structured examination of evidence and alternative interpretations describes CBT cognitive restructuring, not humanistic reflection." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q031",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A college student reports experiencing depressed mood most of the day, nearly every day, for the past 8 months. She has lost interest in activities she previously enjoyed, gained significant weight, sleeps 11 hours a day but still feels tired, and reports feeling worthless and unable to concentrate on her studies. She denies any past episodes of elevated mood or energy."
    },
    "question": "Which diagnosis best fits this clinical presentation?",
    "choices": [
      { "id": "A", "text": "Major depressive disorder — characterized by depressed mood or anhedonia with multiple additional symptoms lasting at least 2 weeks", "is_correct": true, "explanation": "Major depressive disorder requires at least 5 symptoms from the diagnostic criteria (including depressed mood or anhedonia) for at least 2 weeks — this student has depressed mood, anhedonia, weight change, hypersomnia, fatigue, worthlessness, and concentration impairment for 8 months, meeting MDD criteria." },
      { "id": "B", "text": "Bipolar I disorder — characterized by at least one manic episode and depressive episodes", "is_correct": false, "explanation": "Bipolar I requires at least one manic episode — the student specifically denies any history of elevated mood or energy, ruling out a bipolar spectrum diagnosis; the presentation is a unipolar depressive episode." },
      { "id": "C", "text": "Generalized anxiety disorder — characterized by excessive worry and somatic symptoms including sleep disturbance", "is_correct": false, "explanation": "GAD features persistent worry across multiple domains as the primary symptom — this student's presentation is dominated by depressed mood, anhedonia, and neurovegetative symptoms (sleep, weight, energy changes), not worry, which is the hallmark of GAD." },
      { "id": "D", "text": "Persistent depressive disorder (dysthymia) — characterized by chronically depressed mood for at least 2 years", "is_correct": false, "explanation": "Persistent depressive disorder requires at least 2 years of depressed mood — the student has experienced symptoms for 8 months; if this is a single episode, MDD is the more accurate diagnosis than the chronic dysthymia label." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q032",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "Rosenhan's pseudopatient study sent mentally healthy people to psychiatric hospitals reporting hearing voices say 'empty,' 'hollow,' and 'thud.' All 8 were admitted and diagnosed with schizophrenia. Once admitted, they behaved normally. They were hospitalized for an average of 19 days before discharge — all discharged as 'schizophrenia in remission.' Staff did not detect the pseudopatients; other patients did."
    },
    "question": "Which conclusion about psychiatric diagnosis is most directly supported by the Rosenhan study?",
    "choices": [
      { "id": "A", "text": "Diagnostic labels can create self-fulfilling expectations and reduce clinicians' ability to accurately assess ongoing behavior in labeled patients", "is_correct": true, "explanation": "Rosenhan's findings showed that once a patient is labeled schizophrenic, subsequent normal behavior is interpreted through that lens (e.g., note-taking was described as 'compulsive writing behavior') — the study demonstrated that diagnostic labels shape how clinicians perceive and interpret all subsequent patient behavior, reducing diagnostic accuracy." },
      { "id": "B", "text": "Psychiatric hospitals contain only people who are feigning mental illness and should be closed", "is_correct": false, "explanation": "Rosenhan's pseudopatients were fake patients in a legitimate study — the conclusion is about diagnostic validity and the power of labeling, not that all psychiatric patients are faking illness or that hospitals should be closed." },
      { "id": "C", "text": "Hearing voices is never a valid symptom of any psychiatric condition and should be removed from diagnostic criteria", "is_correct": false, "explanation": "Auditory hallucinations are a well-established symptom of schizophrenia and other conditions — Rosenhan's critique was about the context and labeling process, not that hallucinations are invalid symptoms." },
      { "id": "D", "text": "The study proves that schizophrenia does not exist as a real disorder because mental illness cannot be objectively diagnosed", "is_correct": false, "explanation": "Rosenhan's study criticized diagnostic reliability and labeling processes, not the existence of schizophrenia — it showed the diagnostic process could be vulnerable to error, not that the condition being diagnosed does not exist." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q033",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher comparing outcomes for depression finds that after 16 sessions, both CBT and interpersonal therapy (IPT) produce equivalent symptom improvement. Medication alone also produces similar improvement. When participants are followed up 12 months later, those who received CBT show significantly lower relapse rates than those who received medication only or IPT."
    },
    "question": "Which conclusion is best supported by these findings about therapy approaches?",
    "choices": [
      { "id": "A", "text": "CBT produces more durable long-term effects than medication-only treatment for depression, possibly because it teaches skills that patients continue to apply after treatment ends", "is_correct": true, "explanation": "CBT's lower relapse rate at 12-month follow-up supports the 'skills acquisition' model — patients learn cognitive restructuring and behavioral activation skills that continue to protect against relapse after therapy ends. Medication provides symptom relief but no durable skills, so symptoms may return when medication is stopped." },
      { "id": "B", "text": "Medication is the most effective treatment for depression because it produces equal acute outcomes with less patient effort", "is_correct": false, "explanation": "While medication produces equal acute improvement, the 12-month follow-up shows higher relapse rates for medication-only — equal short-term outcomes with worse long-term durability does not make medication 'most effective' overall." },
      { "id": "C", "text": "The equivalent acute outcomes prove that all therapies work through identical mechanisms — the therapeutic alliance is the only active ingredient", "is_correct": false, "explanation": "Equivalent outcomes (the 'Dodo bird verdict') does not prove identical mechanisms — the differential relapse rates at 12 months suggest CBT has a distinct active mechanism (skills acquisition) that provides ongoing protection, distinguishing it from other approaches despite equal acute outcomes." },
      { "id": "D", "text": "IPT should be discontinued because it produces the same outcomes as CBT but without CBT's relapse prevention benefit", "is_correct": false, "explanation": "IPT has its own evidence base and is appropriate for specific patients — one study showing CBT's relapse advantage does not justify eliminating IPT, which may be superior for some patients or in combination with other approaches." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q034",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A patient with borderline personality disorder (BPD) has difficulties with emotional regulation, impulsivity, unstable relationships, and self-harm. Her psychiatrist recommends dialectical behavior therapy (DBT), which combines CBT techniques with mindfulness and focuses on helping patients simultaneously accept themselves while working toward behavioral change."
    },
    "question": "Why is DBT specifically recommended for BPD rather than standard CBT?",
    "choices": [
      { "id": "A", "text": "DBT was developed by Marsha Linehan specifically to address BPD's core difficulty with emotional dysregulation, adding acceptance-based strategies to help patients who experience standard cognitive change techniques as invalidating", "is_correct": true, "explanation": "Marsha Linehan developed DBT after finding standard CBT insufficient for BPD patients — the dialectical balance between acceptance (you are okay as you are) and change (you need to change to have a better life) addresses BPD's specific pattern where patients feel invalidated by change-only approaches but also need behavioral change skills." },
      { "id": "B", "text": "DBT uses free association and dream interpretation, which are more effective for personality disorders than CBT's behavioral focus", "is_correct": false, "explanation": "DBT does not use free association or dream interpretation — those are psychodynamic techniques; DBT is a cognitive-behavioral approach that adds mindfulness and dialectical (acceptance + change) elements to address BPD specifically." },
      { "id": "C", "text": "DBT provides antipsychotic medication management alongside therapy, making it superior for psychotic features of BPD", "is_correct": false, "explanation": "BPD is not primarily a psychotic disorder and does not typically involve antipsychotic medication as first-line treatment — DBT is a psychotherapeutic approach focused on skills training and dialectical philosophy, not medication management." },
      { "id": "D", "text": "Standard CBT is contraindicated for all personality disorders due to its directive nature, requiring a non-directive DBT approach", "is_correct": false, "explanation": "Standard CBT is not contraindicated for all personality disorders — some personality disorders respond well to standard CBT variants. DBT's specific advantage for BPD is its dialectical balance of acceptance and change, tailored to BPD's specific presentation." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q035",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following best describes Selye's General Adaptation Syndrome (GAS)?",
    "choices": [
      { "id": "A", "text": "A three-stage physiological response to prolonged stress: alarm (initial mobilization), resistance (sustained coping), and exhaustion (resource depletion)", "is_correct": true, "explanation": "Hans Selye's GAS describes the body's nonspecific physiological response to prolonged stressors: alarm (sympathetic nervous system activation, cortisol release), resistance (sustained effort to cope while maintaining function), and exhaustion (coping resources depleted, vulnerability to illness and breakdown increases)." },
      { "id": "B", "text": "A cognitive framework for appraising whether a stressor exceeds available coping resources", "is_correct": false, "explanation": "A cognitive framework for appraising stressor demands vs. coping resources describes Lazarus's transactional model of stress — Selye's GAS is a physiological response model describing the biological stages of the stress response, not cognitive appraisal." },
      { "id": "C", "text": "A personality trait characterized by high stress reactivity and susceptibility to psychosomatic illness", "is_correct": false, "explanation": "High stress reactivity as a personality trait is related to neuroticism — Selye's GAS describes a universal, nonspecific physiological response sequence to any prolonged stressor, not a personality trait." },
      { "id": "D", "text": "The three components of psychological burnout: emotional exhaustion, depersonalization, and reduced personal accomplishment", "is_correct": false, "explanation": "The three components of occupational burnout (Maslach) are emotional exhaustion, depersonalization, and reduced efficacy — Selye's GAS describes the biological stress response stages (alarm, resistance, exhaustion), not burnout's psychological dimensions." }
    ],
    "unit_objective": "PSY-5.C"
  },
  {
    "id": "psych-u5-q036",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A 16-year-old girl has lost 25% of her body weight over 6 months. She refuses to eat despite intense hunger, reports seeing herself as overweight even though she is severely underweight, and exercises compulsively for 3 hours daily. She denies having an eating problem and becomes angry when family members express concern."
    },
    "question": "Which eating disorder diagnosis best fits this clinical presentation?",
    "choices": [
      { "id": "A", "text": "Anorexia nervosa — characterized by severe restriction of food intake, distorted body image, and intense fear of weight gain", "is_correct": true, "explanation": "Anorexia nervosa features: restriction of energy intake leading to significantly low weight, intense fear of gaining weight, and disturbed body perception (seeing oneself as overweight when underweight). The patient's restriction, distorted body image, denial, and dangerous weight loss match anorexia nervosa criteria." },
      { "id": "B", "text": "Bulimia nervosa — characterized by cycles of binge eating and purging", "is_correct": false, "explanation": "Bulimia nervosa involves recurrent binge-purge cycles — the patient restricts intake rather than binge eating; the primary pattern here is severe restriction with distorted body image, which is anorexia nervosa, not bulimia." },
      { "id": "C", "text": "Binge eating disorder — characterized by recurrent eating of large amounts without compensatory behaviors", "is_correct": false, "explanation": "Binge eating disorder involves eating large amounts in discrete episodes — this patient restricts food and exercises compulsively; she is not binge eating." },
      { "id": "D", "text": "Body dysmorphic disorder — characterized by preoccupation with perceived defects in appearance that cause impairment", "is_correct": false, "explanation": "Body dysmorphic disorder involves preoccupation with non-existent or slight physical defects — while body image distortion is present in anorexia, the primary features here (severe food restriction, dangerous low weight, fear of gaining weight) meet anorexia nervosa criteria rather than BDD." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q037",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying health outcomes compares two groups of people living in the same high-stress urban neighborhood. Group A members report having close friendships, family support, and regular participation in community organizations. Group B members report few close relationships and little community involvement. Over 10 years, Group A shows lower rates of hypertension, immune disorders, and mortality compared to Group B."
    },
    "question": "Which health psychology concept best accounts for Group A's better health outcomes?",
    "choices": [
      { "id": "A", "text": "Social support serves as a buffer against stress, moderating its negative health effects through emotional, informational, and practical resources", "is_correct": true, "explanation": "The buffering hypothesis proposes that social support protects health by moderating the impact of stressors — social support provides emotional comfort, practical assistance, and informational guidance that help people manage stress more effectively, reducing its physiological damage." },
      { "id": "B", "text": "Group A members have higher self-efficacy, which directly causes better health outcomes through genetic mechanisms", "is_correct": false, "explanation": "While self-efficacy contributes to health behaviors, the specific variable in this study is social support (close relationships, community involvement) — and the effect operates through stress buffering, not through genetic mechanisms." },
      { "id": "C", "text": "Group B members' social isolation reflects neuroticism — a personality trait that causes both poor relationships and poor health", "is_correct": false, "explanation": "While personality may contribute, the comparison controls for neighborhood stress exposure — the finding that social support predicts better health despite equivalent stress supports the buffering function of social support, not purely personality-driven health differences." },
      { "id": "D", "text": "Group A members exercise more due to community activities, explaining all health benefits through the direct physiological effects of exercise", "is_correct": false, "explanation": "While exercise may be one pathway, the study measures social support broadly — the health literature consistently shows social support benefits health through multiple mechanisms (stress buffering, health behavior support, physiological effects of social connection), not exercise alone." }
    ],
    "unit_objective": "PSY-5.C"
  },
  {
    "id": "psych-u5-q038",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A combat veteran experiences vivid flashbacks of a battle during which she feared she would die. She avoids news programs, movies, and conversations about war, has difficulty sleeping, startles easily at loud noises, and feels emotionally detached from family members who have not been in combat. These symptoms have persisted for 8 months."
    },
    "question": "Which diagnosis best fits this presentation, and which symptom cluster is NOT shown in this case?",
    "choices": [
      { "id": "A", "text": "Post-traumatic stress disorder; negative alterations in cognition and mood (e.g., distorted blame, persistent negative beliefs) are the cluster not clearly shown", "is_correct": true, "explanation": "PTSD requires symptoms from four clusters: intrusion (flashbacks), avoidance (avoiding war-related stimuli), arousal/reactivity (hypervigilance, startle, sleep disturbance), and negative alterations in cognition/mood (distorted self-blame, persistent negative emotions). The case clearly shows intrusion, avoidance, and arousal — the cognitive/mood cluster is the least represented, though emotional detachment partially overlaps with it." },
      { "id": "B", "text": "Acute stress disorder; the 8-month duration excludes a PTSD diagnosis", "is_correct": false, "explanation": "Acute stress disorder is diagnosed when trauma symptoms last 3 days to 1 month after trauma — symptoms lasting 8 months exceed the ASD timeframe; PTSD is diagnosed when full-symptom presentations persist beyond 1 month after the traumatic event." },
      { "id": "C", "text": "Specific phobia; the veteran is phobic to combat-related stimuli", "is_correct": false, "explanation": "Specific phobia involves fear of a specific stimulus without the trauma history or multi-symptom cluster requirement — PTSD is a better fit, involving intrusion, avoidance, arousal, and cognitive/mood changes following a life-threatening traumatic event." },
      { "id": "D", "text": "Social anxiety disorder; the veteran's emotional detachment from family reflects fear of social situations", "is_correct": false, "explanation": "Social anxiety disorder involves fear of negative evaluation in social situations — the veteran's emotional detachment is a numbing symptom associated with trauma (PTSD), not social anxiety. Her symptoms clearly cluster around the traumatic combat experience." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q039",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A research team compares outcomes for patients with treatment-resistant depression. Group A receives electroconvulsive therapy (ECT) — brief electrical currents passed through the brain under anesthesia. Group B receives transcranial magnetic stimulation (TMS) — magnetic pulses applied to the scalp. Group A shows faster and more robust symptom improvement; Group B shows modest but significant improvement with fewer side effects."
    },
    "question": "Which conclusion is best supported by this comparison of biomedical treatments?",
    "choices": [
      { "id": "A", "text": "ECT produces stronger antidepressant effects but with greater side effects, while TMS offers a more tolerable alternative with modest efficacy for treatment-resistant depression", "is_correct": true, "explanation": "ECT is the most effective biomedical treatment for severe, treatment-resistant depression but causes cognitive side effects (memory disruption) — TMS is a less invasive alternative that produces meaningful improvement with fewer side effects, making it appropriate for patients who cannot tolerate ECT or have less severe treatment resistance." },
      { "id": "B", "text": "TMS is superior because it should replace ECT entirely, since equal efficacy with fewer side effects always makes the milder treatment preferable", "is_correct": false, "explanation": "The study shows ECT produces faster and more robust improvement than TMS — for severely ill, treatment-resistant patients where rapid response is critical, ECT's greater efficacy may outweigh its side effects, making ECT not obsolete." },
      { "id": "C", "text": "Both treatments work by increasing serotonin reuptake, explaining why they are more effective than antidepressants alone", "is_correct": false, "explanation": "ECT and TMS do not primarily work by blocking serotonin reuptake (that is how SSRIs work) — their mechanisms involve widespread neural activation changes (ECT) and focal cortical modulation (TMS); their superiority in treatment-resistant cases reflects different mechanisms from antidepressants." },
      { "id": "D", "text": "The findings prove that all depression is biological and that psychotherapy has no role in treating depressive disorders", "is_correct": false, "explanation": "The study compares two biomedical treatments for treatment-resistant cases — treatment resistance is defined as failure of multiple antidepressants; psychotherapy (especially CBT) has strong evidence for depression and is often used in combination with biological treatments." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q040",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher examines why identical twins have concordance rates of approximately 50% for schizophrenia — if one twin has schizophrenia, the other has about a 50% chance of developing it. Fraternal twins show concordance rates of about 17%."
    },
    "question": "Which conclusion is best supported by these twin concordance data?",
    "choices": [
      { "id": "A", "text": "Schizophrenia has a substantial genetic component, but genes alone are not sufficient — environmental factors also contribute to whether genetically vulnerable individuals develop the disorder", "is_correct": true, "explanation": "Identical twins share 100% of their genes — if schizophrenia were purely genetic, concordance would approach 100%. The 50% rate shows strong genetic influence (vs. fraternal twins' 17%) but also demonstrates that genetic vulnerability alone does not determine outcome, consistent with the diathesis-stress model." },
      { "id": "B", "text": "The 50% concordance rate proves that schizophrenia is entirely environmentally caused, since identical twins sharing all genes still differ 50% of the time", "is_correct": false, "explanation": "The 50% concordance is substantially higher than fraternal twins' 17%, demonstrating strong genetic influence — if schizophrenia were purely environmental, MZ and DZ concordance rates would be similar." },
      { "id": "C", "text": "The 50% concordance rate indicates that schizophrenia is directly caused by a single dominant gene that is expressed in exactly 50% of carriers", "is_correct": false, "explanation": "A single dominant gene causing schizophrenia in 50% of carriers would predict 50% rates for first-degree relatives and much less complex inheritance patterns — the twin concordance data support polygenic risk and environmental interaction, not a single-gene dominant inheritance model." },
      { "id": "D", "text": "Since concordance is only 50%, genes play no meaningful role in schizophrenia and the disorder is best explained by family environment alone", "is_correct": false, "explanation": "The significantly higher MZ (50%) vs. DZ (17%) concordance rate demonstrates a substantial genetic contribution — family environment alone would not explain why genetically identical twins have three times higher concordance than fraternal twins." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q041",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "easy",
    "stimulus": { "type": "none" },
    "question": "Which of the following is an example of a negative symptom of schizophrenia?",
    "choices": [
      { "id": "A", "text": "Flat affect — reduced emotional expression and diminished facial reactivity", "is_correct": true, "explanation": "Negative symptoms are deficits or reductions in normal function — flat affect (lack of emotional expressiveness) is a classic negative symptom, along with alogia (reduced speech), avolition (lack of motivation), anhedonia, and asociality." },
      { "id": "B", "text": "Auditory hallucinations — hearing voices that are not present", "is_correct": false, "explanation": "Hallucinations are positive symptoms — they are additions to normal experience (perceiving things that are not there). Positive symptoms also include delusions and disorganized thinking/speech." },
      { "id": "C", "text": "Persecutory delusions — fixed false beliefs that others are plotting harm", "is_correct": false, "explanation": "Delusions are positive symptoms (additions to normal experience) — persecutory delusions (believing others are out to harm you) are the most common type of delusion in schizophrenia, not a negative symptom." },
      { "id": "D", "text": "Disorganized speech — incoherent word salad that makes communication unintelligible", "is_correct": false, "explanation": "Disorganized speech is a positive symptom — it represents an excess or distortion of normal communication (adding confusion and incoherence to speech output), not a reduction in function like negative symptoms." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q042",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying stress and immune function measures immune cell activity in medical students one week before and during their final exams. Results consistently show significantly reduced immune cell activity during finals week across multiple cohorts of students."
    },
    "question": "Which health psychology concept is most directly supported by this finding?",
    "choices": [
      { "id": "A", "text": "Chronic stress suppresses immune function — psychological stressors can directly impair the body's ability to fight infection", "is_correct": true, "explanation": "Research in psychoneuroimmunology consistently shows that psychological stress activates the HPA axis and sympathetic nervous system, releasing cortisol that suppresses immune cell activity — the exam stress finding demonstrates that psychological stressors have measurable biological immune effects." },
      { "id": "B", "text": "Cognitive dissonance — students experience internal conflict about studying that causes physiological immune changes", "is_correct": false, "explanation": "Cognitive dissonance involves psychological discomfort from conflicting cognitions — it is not a mechanism for immune suppression; the stress-immune link operates through the HPA axis and cortisol, not cognitive inconsistency." },
      { "id": "C", "text": "Deindividuation — students who identify with their peer group during exams experience collective stress that spreads through social contagion", "is_correct": false, "explanation": "Deindividuation involves loss of individual identity in groups — the immune suppression finding reflects individual physiological responses to psychological stress, not group identity processes." },
      { "id": "D", "text": "The fundamental attribution error — researchers incorrectly attributed immune changes to exam stress rather than students' poor health behaviors during exams", "is_correct": false, "explanation": "The FAE is an attribution bias about explaining behavior — the repeated finding across multiple cohorts (controlling for cohort-specific variation) supports exam stress as the causal factor; psychoneuroimmunology research has established the mechanism linking stress hormones to immune suppression." }
    ],
    "unit_objective": "PSY-5.C"
  },
  {
    "id": "psych-u5-q043",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A therapist works with a client who has OCD and compulsively checks the stove 20+ times before leaving home. The therapist implements a treatment where the client learns to experience the anxiety of not checking without performing the compulsion — staying with the anxiety until it naturally decreases."
    },
    "question": "Which behavioral therapy technique is the therapist using?",
    "choices": [
      { "id": "A", "text": "Exposure and response prevention (ERP) — exposing the client to the anxiety trigger while preventing the compulsive ritual", "is_correct": true, "explanation": "ERP is the evidence-based behavioral treatment for OCD — exposure means deliberately triggering obsessional anxiety (leaving without checking) while response prevention means refraining from the compulsion (not checking). Repeated ERP sessions allow habituation and demonstrate that catastrophic outcomes do not occur." },
      { "id": "B", "text": "Systematic desensitization — pairing progressive muscle relaxation with graduated exposure to stove anxiety", "is_correct": false, "explanation": "Systematic desensitization uses relaxation paired with graduated exposure (useful for phobias) — OCD treatment uses ERP specifically, which focuses on preventing the compulsive response rather than pairing relaxation with exposure." },
      { "id": "C", "text": "Token economy — providing tangible rewards for each successful instance of leaving the stove unchecked", "is_correct": false, "explanation": "Token economies provide tangible reinforcers for target behaviors (commonly used in institutional settings) — ERP for OCD does not involve external reinforcement; the mechanism is anxiety habituation through repeated non-reinforced exposure." },
      { "id": "D", "text": "Cognitive restructuring — challenging the client's irrational belief that the stove will cause a fire", "is_correct": false, "explanation": "Cognitive restructuring (challenging automatic thoughts) is a component of CBT — ERP specifically describes the behavioral technique of exposure plus response prevention, which is the gold standard for OCD and the primary technique described in the scenario." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q044",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A woman with dissociative identity disorder (DID) presents with two distinct personality states: one who is aware of her trauma history and the other who has no memories of the trauma. When in the second state, she cannot access any of the trauma memories available to the first state."
    },
    "question": "Which psychological mechanism does DID most directly illustrate?",
    "choices": [
      { "id": "A", "text": "Dissociation — traumatic memories and aspects of identity become compartmentalized and inaccessible to other parts of consciousness", "is_correct": true, "explanation": "Dissociation is the disruption in integrated functioning of consciousness, memory, identity, and perception — DID involves extreme compartmentalization of identity and memory; traumatic material is walled off from awareness in one identity state, providing a psychological escape from overwhelming experience." },
      { "id": "B", "text": "Repression — the trauma memories are permanently deleted from the nervous system by the brain's protective mechanism", "is_correct": false, "explanation": "Repression involves pushing threatening memories out of conscious awareness — DID's memory barrier between states demonstrates dissociation (compartmentalization between identity states), not complete memory deletion; the memories are accessible in one state." },
      { "id": "C", "text": "Negative symptoms of schizophrenia — reduced cognitive function makes trauma memories inaccessible", "is_correct": false, "explanation": "Negative symptoms of schizophrenia involve deficits in normal function (flat affect, reduced speech) — DID involves a complex dissociative process in which different identity states have selective memory access, which is distinct from the cognitive deficits of schizophrenia." },
      { "id": "D", "text": "Cognitive dissonance — holding two contradictory identity states creates psychological discomfort resolved by memory separation", "is_correct": false, "explanation": "Cognitive dissonance involves psychological discomfort from conflicting cognitions — DID is a dissociative trauma response involving compartmentalization of identity and memory, not a dissonance-reduction strategy for contradictory beliefs." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q045",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A meta-analysis of 400 therapy outcome studies finds that CBT, psychodynamic therapy, humanistic therapy, and interpersonal therapy all produce statistically significant improvement over no treatment. Direct comparisons between the therapies show minimal differences in effectiveness for most common conditions. The strongest predictor of outcome across all therapies is the quality of the therapeutic relationship."
    },
    "question": "Which concept does this meta-analytic finding best illustrate?",
    "choices": [
      { "id": "A", "text": "The Dodo bird verdict — most bona fide psychotherapies produce equivalent outcomes, with common factors (especially therapeutic alliance) accounting for much of the variance in treatment success", "is_correct": true, "explanation": "The Dodo bird verdict (from Alice in Wonderland: 'All have won, and all must have prizes') describes the finding that different psychotherapies produce equivalent outcomes for many conditions — research identifies common factors (therapeutic alliance, empathy, expectancy of change) as key active ingredients shared across approaches." },
      { "id": "B", "text": "Preparedness theory — patients are biologically prepared to benefit from CBT more than other therapies for genetically-based disorders", "is_correct": false, "explanation": "Preparedness theory concerns evolved readiness to condition certain stimulus-response associations — the Dodo bird verdict is a therapy outcome finding showing therapeutic equivalence and common factor effects, unrelated to biological preparedness." },
      { "id": "C", "text": "The just-world phenomenon — patients attribute their improvement to whichever therapy they received because they believe they deserve to get better", "is_correct": false, "explanation": "The just-world phenomenon is the belief that people get what they deserve — therapy outcome research measures objective symptom improvement, not attributional beliefs about deserving outcomes." },
      { "id": "D", "text": "The Rosenhan study — labeling patients with diagnoses prevents effective therapy regardless of modality used", "is_correct": false, "explanation": "The Rosenhan study examined diagnostic labeling in psychiatric hospitals — the meta-analysis finding of equivalent therapy effectiveness and therapeutic alliance as the common factor is the Dodo bird verdict, not a labeling effect." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q046",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": { "type": "none" },
    "question": "Which of the following best distinguishes obsessive-compulsive disorder (OCD) from obsessive-compulsive personality disorder (OCPD)?",
    "choices": [
      { "id": "A", "text": "OCD involves ego-dystonic intrusive thoughts that are experienced as foreign and distressing; OCPD involves ego-syntonic perfectionism and control that the person experiences as part of their identity", "is_correct": true, "explanation": "In OCD, obsessions are experienced as intrusive, unwanted, and alien to the self (ego-dystonic) — causing significant distress. In OCPD, perfectionism and rigidity are experienced as sensible, desirable, and central to self-identity (ego-syntonic) — the person doesn't see these traits as problematic." },
      { "id": "B", "text": "OCD is treated with medication only; OCPD requires psychotherapy because it has no neurobiological basis", "is_correct": false, "explanation": "Both OCD and OCPD can be treated with multiple modalities — OCD responds to SSRIs and ERP; OCPD is typically treated with psychotherapy. The distinction is not based on treatment modality eligibility." },
      { "id": "C", "text": "OCD is classified as a personality disorder; OCPD is classified as an anxiety disorder in the DSM-5", "is_correct": false, "explanation": "This is reversed — OCPD is a personality disorder (Cluster C) in the DSM-5; OCD is classified in the Obsessive-Compulsive and Related Disorders chapter, separate from anxiety disorders." },
      { "id": "D", "text": "OCD involves compulsions performed voluntarily; OCPD involves compulsions performed involuntarily against the person's will", "is_correct": false, "explanation": "OCD compulsions are performed to reduce anxiety from obsessions, not truly voluntarily (they feel necessary despite being recognized as excessive) — OCPD involves rigid, perfectionist behaviors experienced as identity-consistent, not compulsions against one's will. The ego-dystonic vs. ego-syntonic distinction is the key differentiator." }
    ],
    "unit_objective": "PSY-5.A"
  },
  {
    "id": "psych-u5-q047",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A middle-aged executive consistently feels overwhelmed at work, snaps at his family, cannot sleep, and has developed chronic headaches and high blood pressure. His physician recommends stress management. He chooses to take long walks, call friends, and reframe work challenges as opportunities for growth rather than as threats."
    },
    "question": "The executive's coping strategies best exemplify which coping approach?",
    "choices": [
      { "id": "A", "text": "Emotion-focused coping with cognitive reappraisal — managing emotional responses to stress and reinterpreting stressors to reduce their impact", "is_correct": true, "explanation": "Emotion-focused coping manages the emotional response to stress rather than changing the stressor itself — walking and calling friends regulate emotional state; reframing challenges as opportunities is cognitive reappraisal (a form of emotion-focused coping), which changes the subjective meaning of the stressor." },
      { "id": "B", "text": "Problem-focused coping — directly addressing the source of stress by changing the stressful situation", "is_correct": false, "explanation": "Problem-focused coping directly addresses the stressor (e.g., delegating tasks, improving time management, asking for help) — the executive is managing his emotional responses through walking and social connection, not changing the work stressor itself." },
      { "id": "C", "text": "Avoidant coping — escaping awareness of the stressor by focusing on unrelated activities", "is_correct": false, "explanation": "Avoidant coping involves escaping or denying the stressor — the executive is actively engaging with stress through healthy emotional regulation and reappraisal, not avoiding awareness of it." },
      { "id": "D", "text": "Proactive coping — anticipating future stressors and building resources before they occur", "is_correct": false, "explanation": "Proactive coping involves preparing for anticipated future stressors — the executive is responding to current ongoing work stress using emotion-focused strategies, not building resources for anticipated future challenges." }
    ],
    "unit_objective": "PSY-5.C"
  },
  {
    "id": "psych-u5-q048",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "medium",
    "stimulus": {
      "type": "text",
      "content": "A pharmaceutical company develops a new antidepressant that works by blocking the reuptake of both serotonin and norepinephrine, increasing both neurotransmitters' availability in the synapse. In clinical trials, the drug reduces depressive symptoms significantly faster than placebo."
    },
    "question": "Based on the drug's mechanism, which category of medication does it belong to?",
    "choices": [
      { "id": "A", "text": "SNRI (serotonin-norepinephrine reuptake inhibitor) — blocks reuptake of both serotonin and norepinephrine", "is_correct": true, "explanation": "SNRIs (e.g., venlafaxine, duloxetine) block both serotonin and norepinephrine reuptake transporters, increasing both neurotransmitters' synaptic availability — they are used for depression and anxiety disorders, and the described mechanism is the defining characteristic of SNRIs." },
      { "id": "B", "text": "SSRI (selective serotonin reuptake inhibitor) — selectively blocks serotonin reuptake only", "is_correct": false, "explanation": "SSRIs selectively block only serotonin reuptake — the drug described blocks both serotonin AND norepinephrine reuptake, which is the defining difference between SSRIs and SNRIs." },
      { "id": "C", "text": "MAOI (monoamine oxidase inhibitor) — prevents the breakdown of neurotransmitters by inhibiting MAO enzymes", "is_correct": false, "explanation": "MAOIs prevent monoamine breakdown by inhibiting the MAO enzyme — the drug described works by blocking reuptake transporters (keeping neurotransmitters in the synapse longer), not by preventing enzymatic breakdown." },
      { "id": "D", "text": "Antipsychotic — blocks dopamine receptors to reduce symptoms of psychosis", "is_correct": false, "explanation": "Antipsychotics block dopamine receptors (and sometimes serotonin receptors) — the drug described is for depression, works on serotonin and norepinephrine via reuptake inhibition, not dopamine receptor blockade." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q049",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying psychotherapy efficacy notices that therapists with different theoretical orientations (CBT, psychodynamic, humanistic) all produce roughly equivalent outcomes on depression measures. However, within each therapy type, some therapists produce significantly better outcomes than others. The strongest predictor of good outcome is not the therapy type but the therapist's consistent warmth, empathy, and ability to establish trust."
    },
    "question": "Which concept in psychotherapy research does this finding most directly support?",
    "choices": [
      { "id": "A", "text": "Therapeutic alliance — the quality of the collaborative relationship between therapist and client is a powerful predictor of outcome across therapy types", "is_correct": true, "explanation": "Research consistently shows that therapeutic alliance (the bond and collaborative goal-setting between therapist and client) predicts outcomes across different therapy approaches — the finding that therapist warmth, empathy, and trust-building predict outcomes better than therapy type supports the common factors model, with therapeutic alliance as the key common factor." },
      { "id": "B", "text": "The medical model — biological factors in the therapist determine their effectiveness, independent of the techniques they use", "is_correct": false, "explanation": "The medical model attributes disorders to biological causes — the finding about therapist interpersonal qualities (warmth, empathy) predicting outcomes relates to therapeutic alliance and common factors research, not biological determinism." },
      { "id": "C", "text": "The diathesis-stress model — therapists with lower stress vulnerability produce better outcomes because they can regulate their own emotional responses", "is_correct": false, "explanation": "The diathesis-stress model describes vulnerability-stress interactions in disorder onset — while therapist self-regulation is relevant to alliance quality, the finding directly supports therapeutic alliance as the outcome predictor, not therapist stress vulnerability per se." },
      { "id": "D", "text": "Systematic desensitization — therapists who establish trust reduce patients' conditioned anxiety responses to therapy itself", "is_correct": false, "explanation": "Systematic desensitization is a specific behavioral technique for fear reduction — the finding describes a broad predictor (therapist relationship qualities) that affects outcomes across all therapy types, not a specific behavioral technique." }
    ],
    "unit_objective": "PSY-5.B"
  },
  {
    "id": "psych-u5-q050",
    "unit": "unit-5",
    "subject": "ap-psychology",
    "difficulty": "hard",
    "stimulus": {
      "type": "text",
      "content": "A researcher studying the etiology of antisocial personality disorder (ASPD) finds that adopted children of parents with ASPD show higher rates of ASPD than adopted children of parents without ASPD, even when raised by adoptive parents with no antisocial characteristics. However, children raised by antisocial biological parents who are also raised by antisocial adoptive parents show the highest rates of ASPD."
    },
    "question": "Which conclusion about the etiology of ASPD is best supported by these adoption study findings?",
    "choices": [
      { "id": "A", "text": "Both genetic vulnerability (biological parent ASPD) and environmental factors (adoptive parent ASPD) independently contribute to ASPD risk, with the greatest risk when both are present — supporting a gene-environment interaction model", "is_correct": true, "explanation": "Adoption studies allow genetic and environmental factors to be separated — higher ASPD in biological-parent ASPD adoptees (raised by non-ASPD parents) shows genetic influence; highest rates when both biological and adoptive parents have ASPD shows gene-environment interaction (genetic vulnerability amplified by environmental risk)." },
      { "id": "B", "text": "ASPD is entirely genetic — the adoptive parents' ASPD status has no effect on the adopted children's outcomes", "is_correct": false, "explanation": "The finding that children with ASPD biological parents raised by ASPD adoptive parents show the highest rates demonstrates that environment (adoptive parent behavior) adds risk beyond genetics alone — pure genetic determinism is contradicted by the additive environmental effect." },
      { "id": "C", "text": "ASPD is entirely environmentally caused — the biological parents' ASPD has no effect on children who are raised by non-ASPD adoptive parents", "is_correct": false, "explanation": "Adopted children of ASPD biological parents show higher ASPD rates than controls even with non-ASPD adoptive parents — this demonstrates genetic influence independent of the rearing environment; pure environmental causation is not supported." },
      { "id": "D", "text": "Adoption itself causes ASPD by disrupting attachment, making biological parentage irrelevant to the outcome", "is_correct": false, "explanation": "If adoption caused ASPD regardless of biological parentage, all adopted children would show similar ASPD rates — the difference based on biological parent ASPD demonstrates genetic influence, which contradicts the adoption-as-cause interpretation." }
    ],
    "unit_objective": "PSY-5.A"
  }
];
data.questions.push(...newQ);
fs.writeFileSync('C:/Ascendly/public/data/ap-psychology/mcq/unit-5.json', JSON.stringify(data, null, 2));
console.log('unit-5 now has ' + data.questions.length + ' questions');
