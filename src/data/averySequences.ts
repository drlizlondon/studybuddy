export const AVERY_MOTIVATION_LINES = [
  "You do not need to feel ready. Just come back to the next small bit.",
  "You are allowed to be tired and still do one kind, useful thing.",
  "We are not trying to rescue the whole day. We are just doing the next 10 minutes.",
  "You have not failed because this feels hard.",
  "If stopping is rest, we stop. If stopping is avoidance, we do one more small block.",
  "Future you does not need perfection. Future you needs evidence that you tried.",
  "You are closer than you feel when you are tired.",
  "Let's make this smaller until it becomes possible.",
  "I believe you can do this bit. Not everything, just this bit.",
  "You can be scared and still keep going gently.",
  "You have put work in already. That counts.",
  "We are going to finish cleanly, not dramatically.",
  "Your exam does not need panic from you. It needs small, repeated contact.",
  "Let's prove to your brain that starting again is possible.",
  "One page, one question, one note. That is enough to restart.",
  "I am here. I am working too. Let's not abandon ourselves.",
  "This is the part where we make it boring and doable.",
  "You do not have to feel confident before you act.",
  "If you have genuinely done enough, we end with pride, not guilt.",
  "You showed up. That matters more than your mood.",
  "Can this be delayed, or does future you need help tonight?",
  "If you stopped now, would you feel relieved tomorrow or more anxious?",
  "Have you genuinely done enough for today?",
  "Small, repeated contact beats one dramatic burst.",
  "Let's make the next bit so clear your tired brain can follow it."
];

export const AVERY_SEQUENCES = {
  sessionStart: {
    id: "sessionStart",
    trigger: "sessionStart",
    averyLine: "I'm settling in now. You do not need to feel ready. Just come back to the next small bit.",
    visualState: "workingStart",
    requiresUserAnswer: false,
    options: [],
    afterChoice: {},
    autoReturnToWork: true,
    backToWorkLine: "",
    outcome: "returnToWork"
  },
  readyToStart: {
    id: "readyToStart",
    trigger: "I'm ready to start",
    averyLine: "Okay, I'm starting too. Let's just get the first small bit done.",
    visualState: "engaging",
    requiresUserAnswer: false,
    options: [],
    afterChoice: {},
    autoReturnToWork: true,
    backToWorkLine: "Right, I'm picking my pen back up. One page, one question, one note.",
    outcome: "returnToWork"
  },
  musicPrompt: {
    id: "musicPrompt",
    trigger: "Change the music",
    averyLine: "Should I play some music while we study?",
    visualState: "engaging",
    requiresUserAnswer: true,
    options: [
      { id: "lofi", label: "Lofi", outcome: "playMusic", trackKey: "lofi" },
      { id: "piano", label: "Revision piano", outcome: "playMusic", trackKey: "piano" },
      { id: "nature", label: "Nature sounds", outcome: "playMusic", trackKey: "nature" },
      { id: "none", label: "No music", outcome: "returnToWork" }
    ],
    afterChoice: {
      lofi: "Okay, I'll put that on softly.",
      piano: "Good choice. Something gentle in the background.",
      nature: "Lovely. Let's keep the room calm.",
      none: "Okay, quiet room it is.",
      missingAudio: "Tap again to start audio."
    },
    autoReturnToWork: false,
    backToWorkLine: "I'm going back to my notes now.",
    outcome: "returnToWork"
  },
  breakPrompt: {
    id: "breakPrompt",
    trigger: "I want to take a break",
    averyLine: "Can you do 10 more minutes with me first? I'm just getting into it.",
    visualState: "engaging",
    requiresUserAnswer: true,
    options: [
      { id: "tenMore", label: "Yes, I'll try 10 more minutes", outcome: "startMiniSprint" },
      { id: "takeFive", label: "I need 5 minutes", outcome: "takeBreak", minutes: 5 },
      { id: "stopNow", label: "No, I'm flagging. Let's stop now", outcome: "endSession" }
    ],
    afterChoice: {
      tenMore: "Okay. Just 10 minutes. We are not trying to rescue the whole day.",
      takeFive: "That's fine. Let's take five properly.",
      stopNow: "Okay. Let's end cleanly rather than pretend we're still working."
    },
    autoReturnToWork: false,
    backToWorkLine: "I'm setting a 10-minute pace with you. This is the part where we make it boring and doable.",
    outcome: "returnToWork"
  },
  backFromBreak: {
    id: "backFromBreak",
    trigger: "I'm back",
    averyLine: "Good, I'm back too. Let's ease in. Let's prove to your brain that starting again is possible.",
    visualState: "engaging",
    requiresUserAnswer: false,
    options: [],
    afterChoice: {},
    autoReturnToWork: true,
    backToWorkLine: "I'm starting with the next small bit. You showed up. That matters more than your mood.",
    outcome: "returnToWork"
  },
  strugglingToFocus: {
    id: "strugglingToFocus",
    trigger: "I'm struggling to focus",
    averyLine: "Same. Let's make this smaller until it becomes possible. Pick one tiny thing and do just that.",
    visualState: "engaging",
    requiresUserAnswer: true,
    options: [
      { id: "focusSprint", label: "Start a 10-minute focus sprint", outcome: "startMiniSprint" },
      { id: "takeFive", label: "Take 5", outcome: "takeBreak", minutes: 5 },
      { id: "changeTask", label: "Change task", outcome: "changeTask" }
    ],
    afterChoice: {
      focusSprint: "Good. Just ten minutes. Nothing heroic.",
      takeFive: "Okay, five minutes and then we reassess.",
      changeTask: "That's sensible. Make the next task smaller."
    },
    autoReturnToWork: false,
    backToWorkLine: "I'll stay with one small next step too.",
    outcome: "returnToWork"
  }
};

export function getAverySequence(sequenceId) {
  return AVERY_SEQUENCES[sequenceId] ?? null;
}
