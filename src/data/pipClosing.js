// SD-1e: the closing question and Pip's one-line answers. Data, not code.
export const CLOSING_QUESTION = "Did you finish what you set out to do?";
export const CLOSING_QUESTION_BLANK_TASK = "Did you get done what you wanted to?";

export const CLOSING_ANSWERS = [
  { id: "yes", label: "Yes", pipLine: "You did what you said you'd do. That's the whole thing." },
  { id: "part", label: "Part of it", pipLine: "Part of it is real progress. Next time we start from there." },
  { id: "not-this-time", label: "Not this time", pipLine: "That's honest. Starting again is the skill, and you've practised it." }
];

export const SESSIONS_STORAGE_KEY = "studyDoubleSessions";
export const SESSIONS_KEEP = 50;

// Self-rating out of 10 (founder, 3 Nov: "what do you give yourself out of 10 for your session today ... draggable scale 5 - did ok, 10 absolutely smashed it").
// The 1 label is a coordinator draft awaiting her word. Untouched means no rating: nothing is saved until the user moves the slider.
export const RATING_QUESTION = "What do you give yourself out of 10 for your session today?";
export const RATING_UNSET = "Drag to rate";
export const RATING_ANCHORS = [
  { value: 1, label: "Hard one, but I showed up" },
  { value: 5, label: "Did OK" },
  { value: 10, label: "Absolutely smashed it" }
];
