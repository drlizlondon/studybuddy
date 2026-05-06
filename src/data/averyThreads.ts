export const AVERY_THREADS = [
  {
    id: "dont-want-to-revise",
    trigger: "I don't want to revise anymore",
    mood: "resistant",
    rarity: "common",
    openingLine: "I hear you. Are you done, or are you avoiding it?",
    nodes: {
      start: {
        userOptions: [
          { label: "Avoiding it, probably", nextNode: "avoidance" },
          { label: "I have genuinely done enough", nextNode: "done" },
          { label: "I cannot tell", nextNode: "check" }
        ]
      },
      avoidance: {
        line: "Thank you for being honest. If stopping is avoidance, we do one more small block. I am doing one awkward interview question too.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      done: {
        line: "Then enjoy the rest of the day properly. You have put the work in. I'll see you next time.",
        userOptions: [{ label: "End session positively", nextNode: "final", outcome: "endSession", finalLine: "You have genuinely done enough. End with pride, not guilt." }]
      },
      check: {
        line: "If you stopped now, would you feel relieved tomorrow or more anxious?",
        userOptions: [
          { label: "More anxious", nextNode: "avoidance" },
          { label: "Relieved", nextNode: "done" }
        ]
      }
    },
    finalLine: "One honest decision is better than pretending.",
    returnToWorkLine: "I'm going back to my notes now.",
    outcome: "returnToWork"
  },
  {
    id: "so-tired",
    trigger: "I'm so tired",
    mood: "weary",
    rarity: "common",
    openingLine: "You are allowed to be tired and still do one kind, useful thing.",
    nodes: {
      start: {
        userOptions: [
          { label: "I can do a little", nextNode: "little" },
          { label: "I need a proper break", nextNode: "break" },
          { label: "I have genuinely done enough", nextNode: "stop" }
        ]
      },
      little: {
        line: "Good. We are not trying to rescue the whole day. I will do the next section of my application with you.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      break: {
        line: "Five minutes properly. Not scrolling with guilt, just resting enough to return.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak", finalLine: "Take five. I am stretching my shoulders too." }]
      },
      stop: {
        line: "Then let it be a proper stop, not a guilty half-working spiral.",
        userOptions: [{ label: "End session positively", nextNode: "final", outcome: "endSession", finalLine: "Then enjoy the rest of the day properly. You have put the work in. I'll see you next time." }]
      }
    },
    finalLine: "You are allowed to need rest and still care about the work.",
    returnToWorkLine: "I'm taking the next paragraph slowly.",
    outcome: "returnToWork"
  },
  {
    id: "scared-wont-pass",
    trigger: "I'm scared I won't pass",
    mood: "anxious",
    rarity: "common",
    openingLine: "You can be scared and still keep going gently. That fear is loud, but it is not a study plan.",
    nodes: {
      start: {
        userOptions: [
          { label: "Pick a weak area", nextNode: "weak" },
          { label: "I am panicking", nextNode: "break" },
          { label: "I want to stop", nextNode: "stopCheck" }
        ]
      },
      weak: {
        line: "Yes. Your exam does not need panic from you. It needs small, repeated contact. My exam notes are messy too.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      break: {
        line: "Five minutes to come back into your body. Then we choose one topic.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      },
      stopCheck: {
        line: "Have you genuinely done enough for today, or is fear trying to close the book for you?",
        userOptions: [
          { label: "Fear is closing it", nextNode: "weak" },
          { label: "I have done enough", nextNode: "final", outcome: "endSession", finalLine: "Then end with pride, not panic. You have put work in already. That counts." }
        ]
      }
    },
    finalLine: "Passing is built in small, boring blocks. This can be one of them.",
    returnToWorkLine: "I'm opening my weakest page too.",
    outcome: "returnToWork"
  },
  {
    id: "avoiding-hard-bit",
    trigger: "I'm avoiding the hard bit",
    mood: "avoidant",
    rarity: "common",
    openingLine: "Thank you for saying it plainly. The hard bit usually looks bigger from outside.",
    nodes: {
      start: {
        userOptions: [
          { label: "Help me start it", nextNode: "startHard" },
          { label: "I need five first", nextNode: "five" },
          { label: "Can it wait?", nextNode: "future" }
        ]
      },
      startHard: {
        line: "Open it, name the first ugly step, and do only that. I am doing the hardest portfolio paragraph with you.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      five: {
        line: "Okay. Five minutes, then we come back to the honest bit.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      },
      future: {
        line: "Can this be delayed, or does future you need help tonight?",
        userOptions: [
          { label: "Future me needs help", nextNode: "startHard" },
          { label: "It can wait", nextNode: "final", outcome: "endSession", finalLine: "Then close it cleanly. No guilt, just an honest plan to return." }
        ]
      }
    },
    finalLine: "Avoidance shrinks when we stop negotiating with it.",
    returnToWorkLine: "I'm choosing the awkward paragraph first.",
    outcome: "returnToWork"
  },
  {
    id: "done-enough-today",
    trigger: "I think I've done enough today",
    mood: "reflective",
    rarity: "common",
    openingLine: "Have you genuinely done enough for today? Let's be honest, not automatic.",
    nodes: {
      start: {
        userOptions: [
          { label: "I have genuinely done enough", nextNode: "enough" },
          { label: "I am avoiding the last bit", nextNode: "lastBit" },
          { label: "I am not sure", nextNode: "sure" }
        ]
      },
      enough: {
        line: "Then enjoy the rest of the day properly. You have put the work in. I'll see you next time.",
        userOptions: [{ label: "End session positively", nextNode: "final", outcome: "endSession", finalLine: "You have genuinely done enough. End with pride, not guilt." }]
      },
      lastBit: {
        line: "Future you needs one small favour tonight. Ten minutes, then done.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      sure: {
        line: "If you stopped now, would you feel relieved tomorrow or more anxious?",
        userOptions: [
          { label: "Relieved", nextNode: "enough" },
          { label: "More anxious", nextNode: "lastBit" }
        ]
      }
    },
    finalLine: "A clean ending is part of studying well.",
    returnToWorkLine: "I'll keep going with my deadline for a little while.",
    outcome: "returnToWork"
  },
  {
    id: "want-to-stop-now",
    trigger: "I want to stop now",
    mood: "stopping",
    rarity: "common",
    openingLine: "Okay. If stopping is rest, we stop. If stopping is avoidance, we do one more small block.",
    nodes: {
      start: {
        userOptions: [
          { label: "I have genuinely done enough", nextNode: "stop", outcome: "endSession" },
          { label: "I am avoiding", nextNode: "ten" },
          { label: "Do 5 more minutes", nextNode: "five" }
        ]
      },
      stop: {
        line: "Let's end cleanly rather than pretend we're still working.",
        userOptions: [{ label: "Finish now", nextNode: "final", outcome: "endSession", finalLine: "Then enjoy the rest of the day properly. You have put the work in. I'll see you next time." }]
      },
      five: {
        line: "Five minutes. No performance, just a tidy ending.",
        userOptions: [{ label: "Add 5 minutes", nextNode: "final", outcome: "addFive" }]
      },
      ten: {
        line: "Thank you for saying it. One clean 10-minute block, then we reassess.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      }
    },
    finalLine: "You are making a choice on purpose. That matters.",
    returnToWorkLine: "I'm doing one last tidy paragraph too.",
    outcome: "returnToWork"
  },
  {
    id: "need-encouragement",
    trigger: "I need encouragement",
    mood: "encouraging",
    rarity: "common",
    openingLine: "You do not have to feel confident before you act.",
    nodes: {
      start: {
        userOptions: [
          { label: "Give me a tiny next step", nextNode: "step" },
          { label: "Challenge me gently", nextNode: "challenge" },
          { label: "I need a pause", nextNode: "pause" }
        ]
      },
      step: {
        line: "One page, one question, one note. That is enough to restart.",
        userOptions: [{ label: "Back to work", nextNode: "final", outcome: "returnToWork" }]
      },
      challenge: {
        line: "Future you does not need perfection. Future you needs evidence that you tried.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      pause: {
        line: "Okay. Encouragement can include stopping to breathe.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      }
    },
    finalLine: "I am here. I am working too. Let's not abandon ourselves.",
    returnToWorkLine: "Let's both do the next small bit.",
    outcome: "returnToWork"
  },
  {
    id: "keep-drifting",
    trigger: "I keep drifting",
    mood: "scattered",
    rarity: "common",
    openingLine: "Same kind of day here. We need fewer choices, not more willpower.",
    nodes: {
      start: {
        userOptions: [
          { label: "Make it smaller", nextNode: "smaller" },
          { label: "I keep reaching for distractions", nextNode: "distraction" },
          { label: "Take a reset", nextNode: "reset" }
        ]
      },
      smaller: {
        line: "Choose one tab, one page, one question. Everything else can wait ten minutes.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      distraction: {
        line: "Let's prove to your brain that starting again is possible. Put the distraction down for ten minutes.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      reset: {
        line: "Five minutes away from the screen. Then come back without bargaining.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      }
    },
    finalLine: "Attention returns more gently when we stop yanking it around.",
    returnToWorkLine: "I'm putting my phone face down too.",
    outcome: "returnToWork"
  },
  {
    id: "feel-behind",
    trigger: "I feel behind",
    mood: "pressured",
    rarity: "common",
    openingLine: "Being behind is information, not a verdict.",
    nodes: {
      start: {
        userOptions: [
          { label: "Prioritise one thing", nextNode: "prioritise" },
          { label: "I'm panicking", nextNode: "panic" },
          { label: "Can it wait?", nextNode: "delay" }
        ]
      },
      prioritise: {
        line: "Pick the thing future you will most thank you for. I'm doing my deadline item first.",
        userOptions: [{ label: "Start 10-minute push", nextNode: "final", outcome: "startMiniSprint" }]
      },
      panic: {
        line: "Then we lower the volume first. Five minutes, then one decision.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      },
      delay: {
        line: "Can this be delayed, or does future you need help tonight?",
        userOptions: [
          { label: "Future me needs help", nextNode: "prioritise" },
          { label: "It can wait", nextNode: "final", outcome: "endSession", finalLine: "Then close it with a plan. Rest properly, not half-guiltily." }
        ]
      }
    },
    finalLine: "You can be behind and still take the next right step.",
    returnToWorkLine: "I'm choosing the highest-impact task now.",
    outcome: "returnToWork"
  },
  {
    id: "overwhelmed",
    trigger: "I'm overwhelmed",
    mood: "overwhelmed",
    rarity: "common",
    openingLine: "Then the task is too big for this moment. That is fixable.",
    nodes: {
      start: {
        userOptions: [
          { label: "Shrink the task", nextNode: "shrink" },
          { label: "Pause first", nextNode: "pause" }
        ]
      },
      shrink: {
        line: "Write the next physical action, not the whole outcome. My application is only one paragraph right now.",
        userOptions: [{ label: "Back to work", nextNode: "final", outcome: "returnToWork" }]
      },
      pause: {
        line: "Five minutes to reset your nervous system. No guilt, just reset.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      }
    },
    finalLine: "Small enough to start is the right size.",
    returnToWorkLine: "I'm doing one line before I judge it.",
    outcome: "returnToWork"
  },
  {
    id: "cannot-start",
    trigger: "I cannot start",
    mood: "stuck",
    rarity: "common",
    openingLine: "Starting is often the whole mountain. Let's make the start almost silly.",
    nodes: {
      start: {
        userOptions: [
          { label: "Open the thing", nextNode: "open" },
          { label: "I need support first", nextNode: "support" }
        ]
      },
      open: {
        line: "Just open it. No promise to finish. I will open my interview notes at the same time.",
        userOptions: [{ label: "Start 10 minutes", nextNode: "final", outcome: "startMiniSprint" }]
      },
      support: {
        line: "I am here. We start with presence, then a page.",
        userOptions: [{ label: "Back to work", nextNode: "final", outcome: "returnToWork" }]
      }
    },
    finalLine: "The beginning can be small and still count.",
    returnToWorkLine: "I'm putting my pen down on the page.",
    outcome: "returnToWork"
  },
  {
    id: "guilty-for-resting",
    trigger: "I feel guilty for resting",
    mood: "guilty",
    rarity: "common",
    openingLine: "Rest is not theft from your work. It is part of being able to return.",
    nodes: {
      start: {
        userOptions: [
          { label: "I need a real break", nextNode: "break" },
          { label: "I can continue gently", nextNode: "continue" }
        ]
      },
      break: {
        line: "Then take it properly. I am going to make tea and stretch my shoulders.",
        userOptions: [{ label: "Take 5", nextNode: "final", outcome: "takeBreak" }]
      },
      continue: {
        line: "Gentle counts. Ten minutes, then reassess without bullying yourself.",
        userOptions: [{ label: "Start 10 minutes", nextNode: "final", outcome: "startMiniSprint" }]
      }
    },
    finalLine: "You are allowed to be a person while you study.",
    returnToWorkLine: "I'm coming back gently too.",
    outcome: "returnToWork"
  }
];

export function getThreadsByTrigger(trigger) {
  return AVERY_THREADS.filter((thread) => thread.trigger === trigger);
}
