export const resusCouncilAdult2025 = {
  id: "resus-council-adult-2025",
  name: "Resuscitation Council UK Adult Revision",
  description: "Adult choking, in-hospital resuscitation, refractory anaphylaxis and traumatic cardiac arrest.",
  source: "Resuscitation Council UK 2025 and 2021 guidelines",
  questions: [
    {
      id: "rcuk_001",
      topic: "Adult Choking",
      difficulty: "easy",
      question: "According to the Adult Choking Algorithm, what is the first assessment step after suspecting a foreign body airway obstruction?",
      options: ["Check for a pulse", "Assess for an effective cough", "Perform 5 back blows", "Start CPR"],
      correctAnswerIndex: 1,
      explanation: "The algorithm begins by determining whether the patient has an effective cough to differentiate mild from severe obstruction.",
      tags: ["adult choking", "airway", "foreign body obstruction"]
    },
    {
      id: "rcuk_002",
      topic: "Adult Choking",
      difficulty: "easy",
      question: "If an adult with suspected choking has an effective cough, what should you do first?",
      options: ["Encourage coughing", "Give abdominal thrusts", "Start chest compressions", "Sweep the mouth blindly"],
      correctAnswerIndex: 0,
      explanation: "An effective cough should be encouraged because it is often the safest and most effective way to clear a partial obstruction.",
      tags: ["adult choking", "effective cough", "partial obstruction"]
    },
    {
      id: "rcuk_003",
      topic: "Adult Choking",
      difficulty: "easy",
      question: "For severe adult choking with an ineffective cough, what is the first active intervention?",
      options: ["5 abdominal thrusts", "5 back blows", "Rescue breaths", "A finger sweep"],
      correctAnswerIndex: 1,
      explanation: "Severe obstruction is treated first with up to 5 back blows before moving to abdominal thrusts if needed.",
      tags: ["adult choking", "back blows", "severe obstruction"]
    },
    {
      id: "rcuk_004",
      topic: "Adult Choking",
      difficulty: "medium",
      question: "After 5 back blows fail to relieve severe adult choking, what should be delivered next?",
      options: ["5 abdominal thrusts", "30 chest compressions", "2 rescue breaths", "A drink of water"],
      correctAnswerIndex: 0,
      explanation: "If back blows do not clear the obstruction, give up to 5 abdominal thrusts and alternate with back blows while the patient is conscious.",
      tags: ["adult choking", "abdominal thrusts", "algorithm"]
    },
    {
      id: "rcuk_005",
      topic: "Adult Choking",
      difficulty: "medium",
      question: "What should happen if an adult choking patient becomes unconscious?",
      options: ["Continue abdominal thrusts", "Start CPR", "Place them sitting upright", "Wait for spontaneous breathing"],
      correctAnswerIndex: 1,
      explanation: "When the choking patient becomes unconscious, call for help and start CPR, checking the mouth only for visible obstruction.",
      tags: ["adult choking", "unconscious", "CPR"]
    },
    {
      id: "rcuk_006",
      topic: "Adult Choking",
      difficulty: "hard",
      question: "Which mouth check is appropriate during CPR for an unconscious choking adult?",
      options: ["Blind finger sweep after every compression cycle", "Remove only clearly visible material", "Use forceps before every breath", "Delay compressions until the mouth is clear"],
      correctAnswerIndex: 1,
      explanation: "Blind finger sweeps can push the object deeper. Remove material only if it is clearly visible.",
      tags: ["adult choking", "mouth check", "CPR safety"]
    },
    {
      id: "rcuk_007",
      topic: "Adult Choking",
      difficulty: "medium",
      question: "After successful abdominal thrusts, what follow-up should be considered?",
      options: ["No follow-up is needed if symptoms settle", "Medical assessment for possible internal injury", "Immediate discharge from care", "Only fluids and observation at home"],
      correctAnswerIndex: 1,
      explanation: "Abdominal thrusts can cause injury, so patients who receive them should be considered for medical assessment.",
      tags: ["adult choking", "aftercare", "abdominal thrusts"]
    },
    {
      id: "rcuk_008",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "easy",
      question: "What is the recommended first response when an in-hospital adult appears critically unwell or collapsed?",
      options: ["ABCDE assessment and call for help", "Wait for senior review", "Give oral fluids", "Move the patient before assessment"],
      correctAnswerIndex: 0,
      explanation: "In hospital, a structured ABCDE assessment and early call for help are central to recognising and treating deterioration.",
      tags: ["in-hospital resuscitation", "ABCDE", "deterioration"]
    },
    {
      id: "rcuk_009",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "easy",
      question: "If an adult in hospital is unresponsive and not breathing normally, what should be started?",
      options: ["Recovery position", "CPR and emergency team activation", "A routine observation chart", "Oral airway only"],
      correctAnswerIndex: 1,
      explanation: "Unresponsive and not breathing normally indicates cardiac arrest; start CPR and summon the resuscitation team.",
      tags: ["in-hospital resuscitation", "cardiac arrest", "CPR"]
    },
    {
      id: "rcuk_010",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "medium",
      question: "What compression-to-ventilation ratio is used for adult CPR before an advanced airway is placed?",
      options: ["15:2", "30:2", "5:1", "Continuous compressions without breaths"],
      correctAnswerIndex: 1,
      explanation: "Adult basic life support uses 30 compressions to 2 ventilations until an advanced airway changes the ventilation strategy.",
      tags: ["in-hospital resuscitation", "CPR", "compressions"]
    },
    {
      id: "rcuk_011",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "medium",
      question: "Which rhythms are shockable in the adult ALS algorithm?",
      options: ["Asystole and PEA", "VF and pulseless VT", "Sinus bradycardia and PEA", "Atrial fibrillation and asystole"],
      correctAnswerIndex: 1,
      explanation: "Ventricular fibrillation and pulseless ventricular tachycardia are the shockable cardiac arrest rhythms.",
      tags: ["in-hospital resuscitation", "ALS", "shockable rhythms"]
    },
    {
      id: "rcuk_012",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "medium",
      question: "What should happen immediately after a shock is delivered in adult ALS?",
      options: ["Check the pulse for 30 seconds", "Resume chest compressions immediately", "Stop CPR to reassess the rhythm", "Give two rescue breaths before compressions"],
      correctAnswerIndex: 1,
      explanation: "After shock delivery, CPR should resume immediately to minimise pauses in chest compressions.",
      tags: ["in-hospital resuscitation", "defibrillation", "CPR quality"]
    },
    {
      id: "rcuk_013",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "hard",
      question: "In adult ALS for shockable cardiac arrest, when is adrenaline first given?",
      options: ["Before the first shock", "After the first shock", "After the third shock", "Only after return of spontaneous circulation"],
      correctAnswerIndex: 2,
      explanation: "For shockable rhythms, adrenaline is first given after the third shock and then repeated every 3 to 5 minutes.",
      tags: ["in-hospital resuscitation", "adrenaline", "shockable arrest"]
    },
    {
      id: "rcuk_014",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "hard",
      question: "Which drug is recommended after three shocks for refractory VF or pulseless VT?",
      options: ["Amiodarone 300 mg IV/IO", "Atropine 1 mg IV", "Adenosine 6 mg IV", "Calcium chloride 10 mL routinely"],
      correctAnswerIndex: 0,
      explanation: "Amiodarone 300 mg IV or IO is given after three shocks for refractory VF or pulseless VT.",
      tags: ["in-hospital resuscitation", "amiodarone", "VF", "pulseless VT"]
    },
    {
      id: "rcuk_015",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "medium",
      question: "Which approach is used for non-shockable cardiac arrest rhythms?",
      options: ["Immediate defibrillation every 2 minutes", "CPR, adrenaline as soon as possible and reversible cause treatment", "Amiodarone before CPR", "Observation until a shockable rhythm appears"],
      correctAnswerIndex: 1,
      explanation: "PEA and asystole are managed with high-quality CPR, adrenaline as soon as possible, and active treatment of reversible causes.",
      tags: ["in-hospital resuscitation", "non-shockable rhythms", "reversible causes"]
    },
    {
      id: "rcuk_016",
      topic: "Adult In-Hospital Resuscitation",
      difficulty: "hard",
      question: "Which set best represents reversible causes considered during adult cardiac arrest?",
      options: ["Hypoxia, hypovolaemia, hypo/hyperkalaemia, hypothermia, thrombosis, tamponade, toxins, tension pneumothorax", "Hypertension, hyperglycaemia, fever and pain", "Asthma, COPD, pneumonia and pulmonary oedema only", "Sepsis, stroke, seizure and syncope"],
      correctAnswerIndex: 0,
      explanation: "The ALS algorithm prompts teams to look for the 4 Hs and 4 Ts as reversible causes of cardiac arrest.",
      tags: ["in-hospital resuscitation", "4Hs and 4Ts", "reversible causes"]
    },
    {
      id: "rcuk_017",
      topic: "Refractory Anaphylaxis",
      difficulty: "easy",
      question: "What is the first-line medicine for adult anaphylaxis?",
      options: ["Chlorphenamine", "Hydrocortisone", "Intramuscular adrenaline", "Salbutamol only"],
      correctAnswerIndex: 2,
      explanation: "Intramuscular adrenaline is the first-line treatment for anaphylaxis and should not be delayed.",
      tags: ["anaphylaxis", "adrenaline", "first-line treatment"]
    },
    {
      id: "rcuk_018",
      topic: "Refractory Anaphylaxis",
      difficulty: "easy",
      question: "What adult intramuscular adrenaline dose is commonly used for anaphylaxis?",
      options: ["50 micrograms IM", "500 micrograms IM", "1 mg IM", "5 mg IM"],
      correctAnswerIndex: 1,
      explanation: "Adults are usually given 500 micrograms of IM adrenaline into the anterolateral thigh.",
      tags: ["anaphylaxis", "IM adrenaline", "dose"]
    },
    {
      id: "rcuk_019",
      topic: "Refractory Anaphylaxis",
      difficulty: "medium",
      question: "If anaphylaxis symptoms persist after IM adrenaline, when can the IM dose be repeated?",
      options: ["After 1 minute", "After 5 minutes", "After 30 minutes", "Only after antihistamine"],
      correctAnswerIndex: 1,
      explanation: "If there is no improvement, IM adrenaline can be repeated at about 5-minute intervals.",
      tags: ["anaphylaxis", "repeat adrenaline", "timing"]
    },
    {
      id: "rcuk_020",
      topic: "Refractory Anaphylaxis",
      difficulty: "medium",
      question: "Which feature makes anaphylaxis refractory?",
      options: ["Rash continuing after one antihistamine dose", "Persistent ABC problems despite appropriate repeated IM adrenaline", "Any wheeze at presentation", "A history of previous allergy"],
      correctAnswerIndex: 1,
      explanation: "Refractory anaphylaxis is ongoing airway, breathing or circulation compromise despite appropriate initial treatment, including repeated IM adrenaline.",
      tags: ["anaphylaxis", "refractory", "ABC"]
    },
    {
      id: "rcuk_021",
      topic: "Refractory Anaphylaxis",
      difficulty: "hard",
      question: "In refractory anaphylaxis, what escalation may be needed in a monitored setting by skilled clinicians?",
      options: ["IV adrenaline infusion", "Oral adrenaline tablets", "Routine beta-blocker", "Delayed observation only"],
      correctAnswerIndex: 0,
      explanation: "Refractory anaphylaxis may require an IV adrenaline infusion with monitoring and expert support.",
      tags: ["anaphylaxis", "refractory", "IV adrenaline"]
    },
    {
      id: "rcuk_022",
      topic: "Refractory Anaphylaxis",
      difficulty: "medium",
      question: "Which supportive treatment is especially important for anaphylaxis with hypotension?",
      options: ["Restrict fluids", "Rapid IV crystalloid", "Oral fluids", "Diuretics"],
      correctAnswerIndex: 1,
      explanation: "Anaphylaxis can cause vasodilation and capillary leak, so rapid IV crystalloid is important when circulation is compromised.",
      tags: ["anaphylaxis", "fluids", "hypotension"]
    },
    {
      id: "rcuk_023",
      topic: "Refractory Anaphylaxis",
      difficulty: "hard",
      question: "Which medication class can make anaphylaxis harder to treat and may prompt consideration of glucagon?",
      options: ["Beta-blockers", "Antacids", "Statins", "Iron supplements"],
      correctAnswerIndex: 0,
      explanation: "Beta-blockers may reduce response to adrenaline; glucagon can be considered with expert help in severe refractory cases.",
      tags: ["anaphylaxis", "beta-blockers", "glucagon"]
    },
    {
      id: "rcuk_024",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "easy",
      question: "What is the priority principle in traumatic cardiac arrest?",
      options: ["Treat reversible traumatic causes immediately", "Follow the medical cardiac arrest algorithm unchanged", "Delay interventions until transfer", "Give amiodarone first"],
      correctAnswerIndex: 0,
      explanation: "Survival depends on rapid correction of reversible causes such as hypoxia, haemorrhage, tension pneumothorax and tamponade.",
      tags: ["traumatic cardiac arrest", "reversible causes", "priorities"]
    },
    {
      id: "rcuk_025",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "medium",
      question: "Which intervention directly treats suspected tension pneumothorax in traumatic cardiac arrest?",
      options: ["Needle or finger thoracostomy according to local skill set", "Defibrillation", "Atropine", "Oral airway only"],
      correctAnswerIndex: 0,
      explanation: "Tension pneumothorax must be decompressed rapidly; the exact method depends on local equipment, training and context.",
      tags: ["traumatic cardiac arrest", "tension pneumothorax", "thoracostomy"]
    },
    {
      id: "rcuk_026",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "medium",
      question: "Which cause should be assumed and treated early in exsanguinating traumatic cardiac arrest?",
      options: ["Hypovolaemia from haemorrhage", "Primary arrhythmia", "Hyperglycaemia", "Migraine"],
      correctAnswerIndex: 0,
      explanation: "Major haemorrhage causing hypovolaemia is a key reversible cause and requires haemorrhage control and blood product resuscitation.",
      tags: ["traumatic cardiac arrest", "haemorrhage", "hypovolaemia"]
    },
    {
      id: "rcuk_027",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "hard",
      question: "How should chest compressions be viewed in traumatic cardiac arrest with correctable obstructive or hypovolaemic causes?",
      options: ["They are always the only priority", "They should not delay treatment of reversible traumatic causes", "They replace haemorrhage control", "They make airway management unnecessary"],
      correctAnswerIndex: 1,
      explanation: "Chest compressions may be less effective when the circulation is empty or obstructed, so reversible causes must be treated without delay.",
      tags: ["traumatic cardiac arrest", "chest compressions", "reversible causes"]
    },
    {
      id: "rcuk_028",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "medium",
      question: "Which action addresses hypoxia in traumatic cardiac arrest?",
      options: ["High-flow oxygen and effective ventilation", "Fluid restriction", "Adrenaline only", "Waiting for rhythm analysis"],
      correctAnswerIndex: 0,
      explanation: "Hypoxia is a reversible cause and should be treated with oxygenation and effective ventilation.",
      tags: ["traumatic cardiac arrest", "hypoxia", "ventilation"]
    },
    {
      id: "rcuk_029",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "hard",
      question: "Which finding may suggest cardiac tamponade after penetrating chest trauma?",
      options: ["Pulseless arrest with obstructive shock physiology", "Isolated ankle pain", "Simple faint with rapid recovery", "Fever after several days"],
      correctAnswerIndex: 0,
      explanation: "Penetrating trauma can cause tamponade, an obstructive cause of arrest that requires urgent specialist intervention.",
      tags: ["traumatic cardiac arrest", "tamponade", "penetrating trauma"]
    },
    {
      id: "rcuk_030",
      topic: "Traumatic Cardiac Arrest",
      difficulty: "medium",
      question: "Which sequence best fits traumatic cardiac arrest management?",
      options: ["Correct catastrophic bleeding, oxygenation, bilateral chest decompression when indicated and volume replacement", "Start with antiarrhythmics and wait", "Give oral medicines and observe", "Avoid invasive actions until ROSC"],
      correctAnswerIndex: 0,
      explanation: "Traumatic cardiac arrest management prioritises immediate correction of reversible traumatic causes alongside resuscitation.",
      tags: ["traumatic cardiac arrest", "algorithm", "resuscitation"]
    }
  ]
};
