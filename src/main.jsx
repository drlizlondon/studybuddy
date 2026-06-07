import React, { useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BookOpen,
  ChevronDown,
  ChevronUp,
  Coffee,
  Expand,
  Headphones,
  Maximize2,
  MessageCircle,
  Minimize2,
  Moon,
  Pause,
  Play,
  SlidersHorizontal,
  Sparkles,
  Sun,
  TimerReset,
  Volume2,
  X
} from "lucide-react";
import { AVERY_MOTIVATION_LINES, AVERY_SEQUENCES, getAverySequence } from "./data/averySequences";
import { AVERY_THREADS, getThreadsByTrigger } from "./data/averyThreads";
import { resusCouncilAdult2025 } from "./data/questionBanks/resusCouncilAdult2025";
import "./styles.css";

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

const AVERY_TASKS = [
  "Finish my portfolio section.",
  "Review my interview notes.",
  "Complete my application draft.",
  "Revise my weak topics.",
  "Finish my deadline plan.",
  "Practise my exam questions."
];

const SCRIPTED_EVENTS = [
  { minute: 5, text: "You have not failed because this feels hard. Let's stay with the next small bit." },
  { minute: 25, text: "I've made a little progress on my deadline plan. You have put work in already. That counts." },
  { minute: 45, text: "I'm going to keep going for a bit, but you can take 5 if you need. We finish cleanly, not dramatically." },
  { minute: 75, text: "You've been focused for ages. Have you genuinely done enough for today, or do we do one more small block?" }
];

// Final music files should be sourced from properly licensed royalty-free libraries
// such as Pixabay Music, Free Music Archive, or Uppbeat, with licence checks before public release.
const TRACKS = {
  lofi: { name: "Lofi", src: assetUrl("/audio/lofi-study.mp3") },
  piano: { name: "Revision piano", src: assetUrl("/audio/revision-piano.mp3") },
  nature: { name: "Nature sounds", src: assetUrl("/audio/nature-sounds.mp3") }
};

const VIDEO_MEDIA = {
  day: {
    workingStart: assetUrl("/video/day/day-working-start.mp4"),
    workingLoop: assetUrl("/video/day/day-working-loop.mp4"),
    engaging: assetUrl("/video/day/day-engaging.mp4"),
    fallback: assetUrl("/images/master-day-frame.png")
  },
  evening: {
    workingStart: assetUrl("/video/evening/evening-working-start.mp4"),
    workingLoop: assetUrl("/video/evening/evening-working-loop.mp4"),
    engaging: assetUrl("/video/evening/evening-engaging.mp4"),
    engagingFallback: assetUrl("/images/evening-engaging-still.png"),
    fallback: assetUrl("/images/master-evening-frame.png")
  }
};

const TALK_OPTIONS = [
  { label: "I'm ready to start", type: "sequence", id: "readyToStart" },
  { label: "Test me", type: "quiz" },
  { label: "I want to take a break", type: "sequence", id: "breakPrompt" },
  { label: "I'm struggling to focus", type: "sequence", id: "strugglingToFocus" },
  { label: "I'm back", type: "sequence", id: "backFromBreak" },
  { label: "I want to stop now", type: "thread", trigger: "I want to stop now" },
  { label: "Encourage me", type: "thread", trigger: "I need encouragement" },
  { label: "Change the music", type: "sequence", id: "musicPrompt" }
];

const DISPLAY_SIZES = ["comfortable", "large", "extra"];
const QUIZ_STORAGE_KEY = "studyDoubleAveryQuizAttempts";
const IMPORTED_QUIZ_BANKS_KEY = "studyDoubleImportedQuizBanks";
const NOTEBOOKLM_STATIC_MESSAGE = "NotebookLM import needs local/server mode. GitHub Pages is static, so it cannot run the Playwright importer.";
const QUIZ_TOPICS = [
  "Adult Choking",
  "Adult In-Hospital Resuscitation",
  "Refractory Anaphylaxis",
  "Traumatic Cardiac Arrest"
];
const CORRECT_QUIZ_LINES = [
  "Good. You knew that.",
  "Yes. That's the one.",
  "Nice. Clean answer.",
  "Exactly. Keep that pattern in your head.",
  "Good retrieval. That counts."
];
const INCORRECT_QUIZ_LINES = [
  "Not quite. Don't spiral, just read the explanation.",
  "Close. This is exactly why we practise.",
  "That one is a useful miss.",
  "Okay, that gap is now visible. That is progress.",
  "No panic. We correct it and keep going."
];

const createInactiveQuizState = () => ({
  quizState: "inactive",
  activeQuestionBankId: null,
  selectedTopic: null,
  selectedQuestions: [],
  currentQuestionIndex: 0,
  answers: [],
  score: 0,
  streak: 0,
  wrongStreak: 0,
  confidenceRating: null,
  startedAt: null,
  completedAt: null,
  shortfallNote: "",
  averyLine: ""
});

function getSavedDisplaySize() {
  if (typeof window === "undefined") return "large";
  const saved = window.localStorage.getItem("studyDoubleDisplaySize");
  return DISPLAY_SIZES.includes(saved) ? saved : "large";
}

function getSavedViewportSetting() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("studyDoubleShowViewport") === "true";
}

function getSavedQuizAttempts() {
  if (typeof window === "undefined") return [];
  try {
    const attempts = JSON.parse(window.localStorage.getItem(QUIZ_STORAGE_KEY) || "[]");
    return Array.isArray(attempts) ? attempts.slice(0, 12) : [];
  } catch {
    return [];
  }
}

function saveQuizAttempts(attempts) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(attempts.slice(0, 12)));
}

function normaliseQuestionBank(bank) {
  const id = bank?.id || `imported-${Date.now()}`;
  const questions = Array.isArray(bank?.questions) ? bank.questions : [];
  return {
    id,
    name: bank?.name || "Imported NotebookLM Quiz",
    description: bank?.description || "Imported from a shared NotebookLM artifact.",
    source: bank?.source || "NotebookLM shared artifact",
    importedAt: bank?.importedAt || new Date().toISOString(),
    questions: questions.map((question, index) => ({
      id: question.id || `${id}_${String(index + 1).padStart(3, "0")}`,
      topic: question.topic || "Imported",
      difficulty: ["easy", "medium", "hard"].includes(question.difficulty) ? question.difficulty : "medium",
      question: question.question || "",
      options: Array.isArray(question.options) ? question.options.slice(0, 4) : [],
      correctAnswerIndex: Number.isInteger(question.correctAnswerIndex) ? question.correctAnswerIndex : null,
      explanation: question.explanation || "",
      tags: Array.isArray(question.tags) ? question.tags : ["notebooklm", "imported"]
    })).filter((question) => question.question && question.options.length >= 2)
  };
}

function getSavedImportedQuestionBanks() {
  if (typeof window === "undefined") return [];
  try {
    const banks = JSON.parse(window.localStorage.getItem(IMPORTED_QUIZ_BANKS_KEY) || "[]");
    return Array.isArray(banks) ? banks.map(normaliseQuestionBank).filter((bank) => bank.questions.length) : [];
  } catch {
    return [];
  }
}

function saveImportedQuestionBanks(banks) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(IMPORTED_QUIZ_BANKS_KEY, JSON.stringify(banks.slice(0, 10)));
}

function isStaticGithubPages() {
  if (typeof window === "undefined") return false;
  return window.location.hostname.endsWith("github.io");
}

function optionIndexFromLabel(label) {
  const normalised = String(label || "").trim().toUpperCase();
  if (/^[A-D]$/.test(normalised)) return normalised.charCodeAt(0) - 65;
  return null;
}

function parseQuestionBankFromText(rawText) {
  const lines = String(rawText || "")
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  const questions = [];
  let current = null;
  let title = "Pasted Avery Quiz";

  const flush = () => {
    if (!current) return;
    if (current.question && current.options.length >= 2) {
      questions.push({
        id: `pasted_${String(questions.length + 1).padStart(3, "0")}`,
        topic: current.topic || "Pasted quiz",
        difficulty: "medium",
        question: current.question,
        options: current.options.slice(0, 4),
        correctAnswerIndex: Number.isInteger(current.correctAnswerIndex) ? current.correctAnswerIndex : null,
        explanation: current.explanation || "",
        tags: ["pasted", "imported"]
      });
    }
    current = null;
  };

  for (const line of lines) {
    const titleMatch = line.match(/^(?:title|quiz)\s*[:\-]\s*(.+)$/i);
    const questionMatch =
      line.match(/^(?:question\s*)?(\d{1,3})[\).:-]\s+(.+)$/i) ||
      line.match(/^Q(?:uestion)?\s*(\d{1,3})[\).:-]\s+(.+)$/i);
    const optionMatch = line.match(/^([A-D])[\).:-]\s+(.+)$/i);
    const answerMatch = line.match(/^(?:answer|correct answer|key)\s*[:\-]\s*([A-D])(?:[\).:-]\s*)?(.*)$/i);
    const explanationMatch = line.match(/^(?:explanation|rationale|why)\s*[:\-]\s*(.+)$/i);
    const topicMatch = line.match(/^(?:topic|section)\s*[:\-]\s*(.+)$/i);

    if (titleMatch && !questions.length && !current) {
      title = titleMatch[1];
      continue;
    }

    if (questionMatch) {
      flush();
      current = { question: questionMatch[2], options: [], correctAnswerIndex: null, explanation: "", topic: "" };
      continue;
    }

    if (!current && line.endsWith("?")) {
      flush();
      current = { question: line, options: [], correctAnswerIndex: null, explanation: "", topic: "" };
      continue;
    }

    if (!current) continue;

    if (optionMatch) {
      current.options.push(optionMatch[2]);
      continue;
    }

    if (answerMatch) {
      current.correctAnswerIndex = optionIndexFromLabel(answerMatch[1]);
      if (answerMatch[2]) current.explanation = [current.explanation, answerMatch[2]].filter(Boolean).join(" ");
      continue;
    }

    if (explanationMatch) {
      current.explanation = [current.explanation, explanationMatch[1]].filter(Boolean).join(" ");
      continue;
    }

    if (topicMatch) {
      current.topic = topicMatch[1];
    }
  }

  flush();

  return normaliseQuestionBank({
    id: `pasted-${Date.now()}`,
    name: title,
    description: "Imported from pasted ready-made quiz text.",
    source: "Pasted quiz text",
    questions
  });
}

function getBankTopics(bank) {
  return [...new Set((bank?.questions || []).map((question) => question.topic).filter(Boolean))];
}

function shuffleItems(items) {
  return [...items]
    .map((item) => ({ item, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ item }) => item);
}

function pickQuizQuestions(bank, amount, topic = null) {
  const pool = topic ? bank.questions.filter((question) => question.topic === topic) : bank.questions;
  const selected = shuffleItems(pool).slice(0, amount);
  return {
    selected,
    shortfallNote:
      selected.length < amount ? `Only ${selected.length} ${topic ? "topic " : ""}questions are available, so Avery will use all of them.` : ""
  };
}

function getTopicSummary(answers) {
  const byTopic = answers.reduce((summary, answer) => {
    const topic = answer.question.topic;
    const current = summary[topic] || { topic, correct: 0, total: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    summary[topic] = current;
    return summary;
  }, {});
  const topics = Object.values(byTopic);
  if (!topics.length) return { strongestTopic: null, weakestTopic: null, weakTopics: [] };
  const sorted = [...topics].sort((a, b) => a.correct / a.total - b.correct / b.total);
  return {
    strongestTopic: sorted[sorted.length - 1]?.topic || null,
    weakestTopic: sorted[0]?.topic || null,
    weakTopics: sorted.filter((topic) => topic.correct < topic.total).map((topic) => topic.topic)
  };
}

function getDifficultyBreakdown(answers) {
  return answers.reduce((breakdown, answer) => {
    const key = answer.question.difficulty;
    const current = breakdown[key] || { correct: 0, total: 0 };
    current.total += 1;
    if (answer.isCorrect) current.correct += 1;
    breakdown[key] = current;
    return breakdown;
  }, {});
}

function getCompletionLine(percentage) {
  if (percentage >= 80) return "That's strong. You can trust more of this than you think.";
  if (percentage >= 50) return "Good working set. There are gaps, but they're fixable.";
  return "That felt rough, but it gave us a map. We know what to revisit.";
}

function minutesToLabel(totalMinutes) {
  if (totalMinutes < 60) return `${totalMinutes} mins`;
  if (totalMinutes === 180) return "3 hours";
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return minutes ? `${hours}h ${minutes}m` : `${hours} hours`;
}

function formatTime(seconds) {
  const safe = Math.max(0, seconds);
  const hrs = Math.floor(safe / 3600);
  const mins = Math.floor((safe % 3600) / 60);
  const secs = safe % 60;
  if (hrs > 0) return `${hrs}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function OpeningScreen({ onStart, theme, onToggleTheme }) {
  const [duration, setDuration] = useState(45);
  const [custom, setCustom] = useState("");
  const [task, setTask] = useState("");
  const [breaks, setBreaks] = useState(true);

  const selectedDuration = duration === "custom" ? Math.max(1, Number(custom) || 45) : duration;

  return (
    <main className={`opening-screen ${theme}`}>
      <section className="opening-room" aria-hidden="true">
        <div className="opening-bg-stack">
          <img src={VIDEO_MEDIA[theme].fallback} alt="" />
          <div className="opening-light" />
          <div className="opening-haze" />
          <div className="opening-grain" />
        </div>
      </section>

      <button
        className="opening-theme-button"
        onClick={onToggleTheme}
        aria-label={theme === "day" ? "Switch to evening mode" : "Switch to day mode"}
      >
        {theme === "day" ? <Moon size={17} /> : <Sun size={17} />}
        <span>{theme === "day" ? "Evening" : "Day"}</span>
      </button>

      <section className="opening-card">
        <div className="brand-mark">
          <h1>Study<br />Double</h1>
          <Sparkles size={18} />
        </div>
        <h2>How long are we studying today?</h2>
        <div className="duration-grid" role="group" aria-label="Study duration">
          {[45, 90, 180].map((mins) => (
            <button
              key={mins}
              className={duration === mins ? "choice active" : "choice"}
              onClick={() => setDuration(mins)}
            >
              {minutesToLabel(mins)}
            </button>
          ))}
          <button
            className={duration === "custom" ? "choice active" : "choice"}
            onClick={() => setDuration("custom")}
          >
            custom
          </button>
        </div>
        {duration === "custom" && (
          <label className="field-label">
            Minutes
            <input
              min="1"
              type="number"
              value={custom}
              onChange={(event) => setCustom(event.target.value)}
              placeholder="60"
            />
          </label>
        )}
        <label className="field-label">
          What are you working on?
          <textarea
            value={task}
            onChange={(event) => setTask(event.target.value)}
            placeholder="Finish revising Chapter 6 and complete end of chapter questions."
            rows={3}
          />
        </label>
        <div className="break-toggle">
          <span>Should Avery suggest breaks?</span>
          <div>
            <button className={breaks ? "toggle active" : "toggle"} onClick={() => setBreaks(true)}>yes</button>
            <button className={!breaks ? "toggle active" : "toggle"} onClick={() => setBreaks(false)}>no</button>
          </div>
        </div>
        <button
          className="enter-button"
          onClick={() =>
            onStart({
              durationMinutes: selectedDuration,
              userTask: task.trim() || "Stay focused on today's study goal.",
              breakPrompts: breaks
            })
          }
        >
          Enter study room
        </button>
      </section>
    </main>
  );
}

function App() {
  const [session, setSession] = useState(null);
  const [theme, setTheme] = useState("day");

  return session ? (
    <StudyRoom session={session} initialTheme={theme} onThemeChange={setTheme} onRestart={() => setSession(null)} />
  ) : (
    <OpeningScreen
      theme={theme}
      onToggleTheme={() => setTheme((value) => (value === "day" ? "evening" : "day"))}
      onStart={setSession}
    />
  );
}

function StudyRoom({ session, initialTheme = "day", onThemeChange, onRestart }) {
  const roomRef = useRef(null);
  const [theme, setTheme] = useState(initialTheme);
  const [totalSeconds, setTotalSeconds] = useState(session.durationMinutes * 60);
  const [remaining, setRemaining] = useState(session.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(true);
  const [isBreak, setIsBreak] = useState(false);
  const [breakLength, setBreakLength] = useState(0);
  const [message, setMessage] = useState(AVERY_SEQUENCES.sessionStart.averyLine);
  const [isMessageVisible, setIsMessageVisible] = useState(true);
  const [messageKey, setMessageKey] = useState(1);
  const [talkOpen, setTalkOpen] = useState(false);
  const [talkActions, setTalkActions] = useState([]);
  const [shownEvents, setShownEvents] = useState([]);
  const [showBreakPrompt, setShowBreakPrompt] = useState(false);
  const [musicPrompt, setMusicPrompt] = useState(false);
  const [trackKey, setTrackKey] = useState(null);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);
  const [volume, setVolume] = useState(0.55);
  const [audioAvailable, setAudioAvailable] = useState(false);
  const [audioChecked, setAudioChecked] = useState(false);
  const [miniSprintRemaining, setMiniSprintRemaining] = useState(0);
  const [averyBoost, setAveryBoost] = useState(0);
  const [conversationState, setConversationState] = useState("closed");
  const [activeSequenceId, setActiveSequenceId] = useState("sessionStart");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threadNodeId, setThreadNodeId] = useState("start");
  const [completedThreadIds, setCompletedThreadIds] = useState(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem("studyDoubleCompletedAveryThreads") || "[]");
  });
  const [pendingBackToWorkLine, setPendingBackToWorkLine] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState(false);
  const [displaySize, setDisplaySize] = useState(getSavedDisplaySize);
  const [showViewport, setShowViewport] = useState(getSavedViewportSetting);
  const [quiz, setQuiz] = useState(createInactiveQuizState);
  const [quizSetupStep, setQuizSetupStep] = useState("count");
  const [showRevisionScores, setShowRevisionScores] = useState(false);
  const [quizAttempts, setQuizAttempts] = useState(getSavedQuizAttempts);
  const [importedQuestionBanks, setImportedQuestionBanks] = useState(getSavedImportedQuestionBanks);
  const [activeQuestionBankId, setActiveQuestionBankId] = useState(resusCouncilAdult2025.id);
  const [notebookImportOpen, setNotebookImportOpen] = useState(false);
  const [notebookImportUrl, setNotebookImportUrl] = useState("");
  const [notebookImportStatus, setNotebookImportStatus] = useState("idle");
  const [notebookImportError, setNotebookImportError] = useState("");
  const [notebookImportPreview, setNotebookImportPreview] = useState(null);
  const [pastedQuizText, setPastedQuizText] = useState("");
  const [notebookAuthStatus, setNotebookAuthStatus] = useState({ connected: false, authInProgress: false });
  const [notebookAuthMessage, setNotebookAuthMessage] = useState("");
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight
  }));
  const [summary, setSummary] = useState(null);
  const [hasPlayedWorkingStart, setHasPlayedWorkingStart] = useState(false);
  const audioRef = useRef(null);
  const isMusicPlayingRef = useRef(false);
  const sprintWasActiveRef = useRef(false);
  const averyTask = useMemo(() => AVERY_TASKS[Math.floor(Math.random() * AVERY_TASKS.length)], []);
  const elapsedSeconds = totalSeconds - remaining;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const progress = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 88 + averyBoost));
  const sprintActive = miniSprintRemaining > 0;
  const isQuizActive = quiz.quizState !== "inactive";
  const questionBanks = useMemo(() => [resusCouncilAdult2025, ...importedQuestionBanks], [importedQuestionBanks]);
  const activeQuestionBank = questionBanks.find((bank) => bank.id === activeQuestionBankId) || resusCouncilAdult2025;
  const hasActiveMessage = isMessageVisible && messageKey > 0;
  const averyVisualState = useMemo(() => {
    if (isQuizActive || showBreakPrompt || ["open", "averySpeaking", "waitingForUser", "resolving"].includes(conversationState)) {
      return "engaging";
    }
    if (!hasPlayedWorkingStart) return "workingStart";
    return "workingLoop";
  }, [conversationState, hasPlayedWorkingStart, isQuizActive, showBreakPrompt]);

  const say = (text, actions = []) => {
    setMessage(text);
    setIsMessageVisible(true);
    setTalkActions(actions);
    setMessageKey((value) => value + 1);
  };

  const changeTheme = () => {
    setHasPlayedWorkingStart(true);
    const next = theme === "day" ? "evening" : "day";
    setTheme(next);
    onThemeChange?.(next);
  };

  useEffect(() => {
    if (isPaused || isBreak || summary) return;
    const tick = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
      setMiniSprintRemaining((value) => {
        if (value <= 0) return 0;
        setAveryBoost((boost) => Math.min(16, boost + 0.012));
        return value - 1;
      });
    }, 1000);
    return () => window.clearInterval(tick);
  }, [isPaused, isBreak, summary]);

  useEffect(() => {
    if (remaining > 0 || summary) return;
    const previous = Number(localStorage.getItem("studyDoubleTotalMinutes") || 0);
    const studiedMinutes = Math.max(1, Math.ceil(totalSeconds / 60));
    const newTotal = previous + studiedMinutes;
    localStorage.setItem("studyDoubleTotalMinutes", String(newTotal));
    setSummary({ studied: studiedMinutes, total: newTotal, avery: 100 });
    say("We are going to finish cleanly, not dramatically. You showed up. That matters more than your mood.");
  }, [remaining, summary, totalSeconds]);

  useEffect(() => {
    const nextEvent = SCRIPTED_EVENTS.find(
      (event) => elapsedMinutes >= event.minute && !shownEvents.includes(event.minute)
    );
    if (nextEvent) {
      say(nextEvent.text);
      setShownEvents((events) => [...events, nextEvent.minute]);
    }
    const finalWindow = Math.max(0, session.durationMinutes - 5);
    if (elapsedMinutes >= finalWindow && !shownEvents.includes(-5) && !summary) {
      say("Nearly there. Future you does not need perfection. Future you needs evidence that you tried.");
      setShownEvents((events) => [...events, -5]);
    }
    if (session.breakPrompts && elapsedMinutes >= 75 && !shownEvents.includes(750) && !isBreak) {
      setHasPlayedWorkingStart(true);
      setShowBreakPrompt(true);
      setShownEvents((events) => [...events, 750]);
    }
  }, [elapsedMinutes, isBreak, session.breakPrompts, session.durationMinutes, shownEvents, summary]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      Object.values(TRACKS).filter((track) => track.src).map((track) =>
        fetch(track.src, { method: "HEAD" })
          .then((response) => response.ok || response.status === 405)
          .catch(() => false)
      )
    ).then((results) => {
      if (!cancelled) {
        setAudioAvailable(results.some(Boolean));
        setAudioChecked(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  useEffect(() => {
    if (!isMessageVisible) return undefined;
    const shouldKeepVisible =
      talkActions.length > 0 ||
      talkOpen ||
      musicPrompt ||
      showBreakPrompt ||
      isQuizActive ||
      isBreak ||
      ["open", "waitingForUser"].includes(conversationState);

    if (shouldKeepVisible) return undefined;

    const dismissTimer = window.setTimeout(() => {
      setIsMessageVisible(false);
    }, 5000);

    return () => window.clearTimeout(dismissTimer);
  }, [
    conversationState,
    isBreak,
    isMessageVisible,
    isQuizActive,
    messageKey,
    musicPrompt,
    showBreakPrompt,
    talkActions.length,
    talkOpen
  ]);

  useEffect(() => {
    const syncFullscreen = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  useEffect(() => {
    localStorage.setItem("studyDoubleDisplaySize", displaySize);
  }, [displaySize]);

  useEffect(() => {
    localStorage.setItem("studyDoubleShowViewport", String(showViewport));
  }, [showViewport]);

  useEffect(() => {
    const updateViewport = () => {
      setViewport({ width: window.innerWidth, height: window.innerHeight });
    };
    updateViewport();
    window.addEventListener("resize", updateViewport);
    window.addEventListener("orientationchange", updateViewport);
    return () => {
      window.removeEventListener("resize", updateViewport);
      window.removeEventListener("orientationchange", updateViewport);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem("studyDoubleCompletedAveryThreads", JSON.stringify(completedThreadIds));
  }, [completedThreadIds]);

  useEffect(() => {
    if (miniSprintRemaining > 0) {
      sprintWasActiveRef.current = true;
      return;
    }
    if (!sprintWasActiveRef.current || summary) return;
    sprintWasActiveRef.current = false;
    setConversationState("resolving");
    say("You did the 10 minutes. You are closer than you feel when you are tired.", [buildBackToWorkAction()]);
  }, [miniSprintRemaining, summary]);

  const setAveryVisualState = (state) => {
    if (state === "engaging") {
      setHasPlayedWorkingStart(true);
      setConversationState("averySpeaking");
    }
    else if (state === "workingStart" || state === "workingLoop") setConversationState("closed");
    else setConversationState("closed");
  };

  const applyOutcome = (outcome, payload = {}) => {
    if (outcome === "startMiniSprint") {
      setMiniSprintRemaining(600);
      setIsPaused(false);
      setIsBreak(false);
      return;
    }
    if (outcome === "takeBreak") {
      const minutes = payload.minutes || 5;
      setIsBreak(true);
      setBreakLength(minutes);
      setShowBreakPrompt(false);
      setMiniSprintRemaining(0);
      setIsPaused(true);
      return;
    }
    if (outcome === "endSession") {
      window.setTimeout(endSessionNow, 700);
      return;
    }
    if (outcome === "addFive") {
      setRemaining((value) => value + 300);
      setTotalSeconds((value) => value + 300);
    }
  };

  const buildBackToWorkAction = (label = "Back to work") => ({
    label,
    action: () => returnToWork()
  });

  const isCurrentPlayingTrack = (key) => {
    const track = TRACKS[key];
    const audio = audioRef.current;
    if (!track?.src || !audio) return false;
    const currentAudioSrc = audio.getAttribute("src") || "";
    const currentResolvedSrc = audio.currentSrc || "";
    const trackPath = track.src.replace(/^\/+/, "");
    const sameSource =
      trackKey === key ||
      currentAudioSrc === track.src ||
      currentAudioSrc.endsWith(track.src) ||
      currentResolvedSrc.endsWith(track.src) ||
      currentResolvedSrc.includes(trackPath);
    return sameSource && (isMusicPlayingRef.current || !audio.paused);
  };

  const pauseCurrentTrack = () => {
    audioRef.current?.pause();
    isMusicPlayingRef.current = false;
    setIsMusicPlaying(false);
  };

  const resolveSequenceOption = (option) => {
    if (option.outcome === "playMusic" && option.trackKey && isCurrentPlayingTrack(option.trackKey)) {
      pauseCurrentTrack();
      setMusicPrompt(false);
      setConversationState("resolving");
      say("Okay, quiet room it is.", [buildBackToWorkAction()]);
      return;
    }
    resolveAveryChoice(option);
  };

  const enterQuizSetup = () => {
    setHasPlayedWorkingStart(true);
    setTalkOpen(true);
    setShowRevisionScores(false);
    setNotebookImportOpen(false);
    setQuizSetupStep("count");
    setQuiz({
      ...createInactiveQuizState(),
      quizState: "setup",
      activeQuestionBankId: activeQuestionBank.id,
      averyLine: "Okay. I'll test you properly. How many questions?"
    });
    setConversationState("waitingForUser");
    say("Okay. I'll test you properly. How many questions?");
  };

  const startQuiz = (amount, topic = null) => {
    const bank = activeQuestionBank;
    const { selected, shortfallNote } = pickQuizQuestions(bank, amount, topic);
    if (!selected.length) {
      say("I can't find questions for that topic yet. Pick another one and we'll keep going.");
      setQuizSetupStep("topic");
      return;
    }
    setTalkOpen(true);
    setShowRevisionScores(false);
    setQuiz({
      ...createInactiveQuizState(),
      quizState: "askingQuestion",
      activeQuestionBankId: bank.id,
      selectedTopic: topic,
      selectedQuestions: selected,
      startedAt: new Date().toISOString(),
      shortfallNote,
      averyLine: shortfallNote || "Question one. Take it carefully."
    });
    setConversationState("waitingForUser");
    say(shortfallNote || "Question one. Take it carefully.");
  };

  const importNotebookLmQuiz = async () => {
    if (isStaticGithubPages()) {
      setNotebookImportStatus("error");
      setNotebookImportError(NOTEBOOKLM_STATIC_MESSAGE);
      setNotebookAuthMessage(NOTEBOOKLM_STATIC_MESSAGE);
      return;
    }

    const url = notebookImportUrl.trim();
    if (!url) {
      setNotebookImportStatus("error");
      setNotebookImportError("Paste a shared NotebookLM artifact URL first.");
      return;
    }

    setNotebookImportStatus("loading");
    setNotebookImportError("");
    setNotebookImportPreview(null);

    try {
      const response = await fetch("/api/import-notebooklm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url })
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "Import failed.");
      const bank = normaliseQuestionBank(result.questionBank);
      if (!bank.questions.length) throw new Error("No quiz questions were detected in that NotebookLM artifact.");
      setNotebookImportPreview(bank);
      setNotebookImportStatus("success");
    } catch (error) {
      setNotebookImportStatus("error");
      setNotebookImportError(error.message || "Parsing failed. Try a public NotebookLM quiz artifact link.");
    }
  };

  const saveNotebookLmImport = () => {
    if (!notebookImportPreview?.questions?.length) return;
    const bank = {
      ...notebookImportPreview,
      id: notebookImportPreview.id || `notebooklm-${Date.now()}`,
      importedAt: new Date().toISOString()
    };
    setImportedQuestionBanks((banks) => {
      const updated = [bank, ...banks.filter((item) => item.id !== bank.id)].slice(0, 10);
      saveImportedQuestionBanks(updated);
      return updated;
    });
    setActiveQuestionBankId(bank.id);
    setNotebookImportOpen(false);
    setNotebookImportStatus("idle");
    setNotebookImportUrl("");
    setPastedQuizText("");
    setNotebookImportPreview(null);
    setQuizSetupStep("count");
    setQuiz((current) => ({
      ...current,
      activeQuestionBankId: bank.id,
      averyLine: `Saved ${bank.questions.length} questions to Avery.`
    }));
    say(`Saved ${bank.questions.length} questions to Avery.`);
  };

  const previewPastedQuiz = () => {
    const bank = parseQuestionBankFromText(pastedQuizText);
    if (!bank.questions.length) {
      setNotebookImportStatus("error");
      setNotebookImportError("I could not find MCQs in that pasted text. Use numbered questions with A/B/C/D options.");
      setNotebookImportPreview(null);
      return;
    }
    setNotebookImportPreview(bank);
    setNotebookImportStatus("success");
    setNotebookImportError("");
  };

  const refreshNotebookLmAuthStatus = async () => {
    if (isStaticGithubPages()) {
      const status = { connected: false, authInProgress: false, unavailable: true };
      setNotebookAuthStatus(status);
      setNotebookAuthMessage(NOTEBOOKLM_STATIC_MESSAGE);
      return status;
    }

    try {
      const response = await fetch("/api/notebooklm-auth/status");
      const status = await response.json();
      setNotebookAuthStatus(status);
      return status;
    } catch {
      setNotebookAuthMessage("Could not check NotebookLM connection.");
      return null;
    }
  };

  const startNotebookLmLogin = async () => {
    if (isStaticGithubPages()) {
      setNotebookAuthMessage(NOTEBOOKLM_STATIC_MESSAGE);
      return;
    }

    setNotebookAuthMessage("Opening NotebookLM sign-in window...");
    try {
      const response = await fetch("/api/notebooklm-auth/start", { method: "POST" });
      const status = await response.json();
      if (!response.ok) throw new Error(status.error || "Could not open NotebookLM sign-in window.");
      setNotebookAuthStatus(status);
      setNotebookAuthMessage(status.message || "Sign in, then press Done signing in.");
    } catch (error) {
      setNotebookAuthMessage(error.message || "Could not open NotebookLM sign-in window.");
    }
  };

  const finishNotebookLmLogin = async () => {
    if (isStaticGithubPages()) {
      setNotebookAuthMessage(NOTEBOOKLM_STATIC_MESSAGE);
      return;
    }

    setNotebookAuthMessage("Saving NotebookLM session...");
    try {
      const response = await fetch("/api/notebooklm-auth/finish", { method: "POST" });
      const status = await response.json();
      if (!response.ok) throw new Error(status.error || "Could not save NotebookLM session.");
      setNotebookAuthStatus(status);
      setNotebookAuthMessage(status.message || "NotebookLM connected locally.");
    } catch (error) {
      setNotebookAuthMessage(error.message || "Could not save NotebookLM session.");
    }
  };

  const disconnectNotebookLmLogin = async () => {
    if (isStaticGithubPages()) {
      setNotebookAuthMessage(NOTEBOOKLM_STATIC_MESSAGE);
      return;
    }

    try {
      const response = await fetch("/api/notebooklm-auth/disconnect", { method: "POST" });
      const status = await response.json();
      setNotebookAuthStatus(status);
      setNotebookAuthMessage("NotebookLM disconnected locally.");
    } catch {
      setNotebookAuthMessage("Could not disconnect NotebookLM.");
    }
  };

  const answerQuizQuestion = (answerIndex) => {
    setQuiz((current) => {
      if (current.quizState !== "askingQuestion") return current;
      const question = current.selectedQuestions[current.currentQuestionIndex];
      if (!question) return current;
      const isCorrect = answerIndex === question.correctAnswerIndex;
      const nextStreak = isCorrect ? current.streak + 1 : 0;
      const nextWrongStreak = isCorrect ? 0 : current.wrongStreak + 1;
      const answer = {
        question,
        selectedAnswerIndex: answerIndex,
        correctAnswerIndex: question.correctAnswerIndex,
        isCorrect
      };
      let line = isCorrect
        ? CORRECT_QUIZ_LINES[current.answers.length % CORRECT_QUIZ_LINES.length]
        : INCORRECT_QUIZ_LINES[current.answers.length % INCORRECT_QUIZ_LINES.length];
      if (nextStreak === 3) line = "That's three in a row. You're warmer than you think.";
      if (nextWrongStreak === 2) line = "Slow it down. One careful question at a time.";
      say(line);
      return {
        ...current,
        quizState: "showingResult",
        answers: [...current.answers, answer],
        score: current.score + (isCorrect ? 1 : 0),
        streak: nextStreak,
        wrongStreak: nextWrongStreak,
        averyLine: line
      };
    });
  };

  const completeQuiz = (nextQuiz) => {
    const total = nextQuiz.selectedQuestions.length;
    const percentage = total ? Math.round((nextQuiz.score / total) * 100) : 0;
    const topicSummary = getTopicSummary(nextQuiz.answers);
    const attempt = {
      date: nextQuiz.completedAt,
      questionBankId: nextQuiz.activeQuestionBankId,
      topic: nextQuiz.selectedTopic,
      numberOfQuestions: total,
      score: nextQuiz.score,
      percentage,
      topicsMissed: topicSummary.weakTopics,
      difficultyBreakdown: getDifficultyBreakdown(nextQuiz.answers),
      completedQuestionIds: nextQuiz.selectedQuestions.map((question) => question.id)
    };
    setQuizAttempts((attempts) => {
      const updated = [attempt, ...attempts].slice(0, 12);
      saveQuizAttempts(updated);
      return updated;
    });
    say(getCompletionLine(percentage));
  };

  const goToNextQuizQuestion = () => {
    setQuiz((current) => {
      if (current.quizState !== "showingResult") return current;
      const nextIndex = current.currentQuestionIndex + 1;
      if (nextIndex >= current.selectedQuestions.length) {
        const total = current.selectedQuestions.length;
        const percentage = total ? Math.round((current.score / total) * 100) : 0;
        const completionLine = getCompletionLine(percentage);
        const completed = {
          ...current,
          quizState: "complete",
          completedAt: new Date().toISOString(),
          averyLine: completionLine
        };
        completeQuiz(completed);
        return completed;
      }
      const nextLine = `Question ${nextIndex + 1}.`;
      say(nextLine);
      return {
        ...current,
        quizState: "askingQuestion",
        currentQuestionIndex: nextIndex,
        averyLine: nextLine
      };
    });
  };

  const quizBackToWork = () => {
    setQuiz(createInactiveQuizState());
    returnToWork("I'm going back to my notes now.");
  };

  const quizTakeFive = () => {
    setQuiz(createInactiveQuizState());
    setTalkOpen(false);
    startBreak(5);
  };

  const returnToWork = (line = pendingBackToWorkLine) => {
    setTalkOpen(false);
    setQuiz(createInactiveQuizState());
    setQuizSetupStep("count");
    setShowRevisionScores(false);
    setNotebookImportOpen(false);
    setMusicPrompt(false);
    setShowBreakPrompt(false);
    setActiveSequenceId(null);
    setActiveThreadId(null);
    setThreadNodeId("start");
    setTalkActions([]);
    if (line) say(line);
    setPendingBackToWorkLine("");
    setConversationState("closed");
  };

  const handleStartingWorkEnded = () => {
    setHasPlayedWorkingStart(true);
    setConversationState("closed");
    setTalkActions([]);
    setMusicPrompt(false);
  };

  const runAverySequence = (sequenceId) => {
    const sequence = getAverySequence(sequenceId);
    if (!sequence) return;
    setTalkOpen(false);
    setActiveSequenceId(sequence.id);
    setActiveThreadId(null);
    setPendingBackToWorkLine(sequence.backToWorkLine || "");
    setMusicPrompt(sequence.id === "musicPrompt");
    setShowBreakPrompt(false);
    setAveryVisualState(sequence.visualState || "engaging");

    if (sequence.requiresUserAnswer) {
      setConversationState("waitingForUser");
      say(
        sequence.averyLine,
        sequence.options.map((option) => ({
          label: option.label,
          action: () => resolveSequenceOption(option)
        }))
      );
      return;
    }

    say(sequence.averyLine);
    if (sequence.autoReturnToWork) {
      window.setTimeout(() => returnToWork(sequence.backToWorkLine), 2200);
    }
  };

  const runAveryThread = (trigger) => {
    const candidates = getThreadsByTrigger(trigger);
    if (!candidates.length) return;
    setHasPlayedWorkingStart(true);
    const notRecentlyCompleted = candidates.filter((thread) => !completedThreadIds.includes(thread.id));
    const thread = notRecentlyCompleted[0] || candidates[0];
    setTalkOpen(false);
    setActiveSequenceId(null);
    setActiveThreadId(thread.id);
    setThreadNodeId("start");
    setPendingBackToWorkLine(thread.returnToWorkLine || "");
    setMusicPrompt(false);
    setConversationState("waitingForUser");
    const startNode = thread.nodes.start;
    const openingLine =
      trigger === "I need encouragement"
        ? AVERY_MOTIVATION_LINES[Math.floor(Math.random() * AVERY_MOTIVATION_LINES.length)]
        : thread.openingLine;
    say(
      openingLine,
      startNode.userOptions.map((option) => ({
        label: option.label,
        action: () => resolveAveryChoice({ ...option, threadId: thread.id, fromThread: true })
      }))
    );
  };

  const resolveAveryChoice = async (choice) => {
    setConversationState("resolving");
    if (choice.fromThread) {
      const thread = AVERY_THREADS.find((item) => item.id === choice.threadId);
      if (!thread) return;
      const nextNodeId = choice.nextNode || "final";
      const nextNode = thread.nodes[nextNodeId];
      setThreadNodeId(nextNodeId);

      if (nextNode && nextNodeId !== "final") {
        const nextActions = nextNode.userOptions.map((option) => ({
          label: option.label,
          action: () => resolveAveryChoice({ ...option, threadId: thread.id, fromThread: true })
        }));
        say(nextNode.line || thread.finalLine, nextActions);
        setConversationState("waitingForUser");
        return;
      }

      const outcome = choice.outcome || thread.outcome || "returnToWork";
      applyOutcome(outcome, choice);
      setCompletedThreadIds((ids) => (ids.includes(thread.id) ? ids : [...ids, thread.id].slice(-20)));
      const isStudyOutcome = ["returnToWork", "startMiniSprint", "changeTask", "addFive"].includes(outcome);
      const finalLine = choice.finalLine || thread.finalLine;
      say(finalLine, isStudyOutcome ? [buildBackToWorkAction()] : []);
      if (!isStudyOutcome && outcome !== "takeBreak") setTalkActions([]);
      if (outcome === "takeBreak") {
        say(finalLine, [{ label: "Tell Avery when you're back", action: returnFromBreak }]);
      }
      return;
    }

    const sequence = getAverySequence(activeSequenceId);
    if (!sequence) return;
    const outcome = choice.outcome || sequence.outcome || "returnToWork";
    let line = sequence.afterChoice[choice.id] || sequence.backToWorkLine || "Okay.";

    if (outcome === "playMusic" && choice.trackKey) {
      if (isCurrentPlayingTrack(choice.trackKey)) {
        pauseCurrentTrack();
        setMusicPrompt(false);
        line = "Okay, quiet room it is.";
      } else {
        const didStart = await chooseTrack(choice.trackKey, { silent: true });
        if (!didStart) line = sequence.afterChoice.missingAudio;
      }
    }
    if (choice.id === "none" && sequence.id === "musicPrompt") {
      await chooseTrack("quiet", { silent: true });
    }
    if (outcome !== "playMusic") applyOutcome(outcome, choice);

    const returnsToStudy = ["returnToWork", "playMusic", "startMiniSprint", "changeTask", "addFive"].includes(outcome);
    if (outcome === "takeBreak") {
      say(line, [{ label: "Tell Avery when you're back", action: returnFromBreak }]);
      return;
    }
    if (outcome === "endSession") {
      say(line);
      return;
    }
    say(line, returnsToStudy ? [buildBackToWorkAction()] : []);
  };

  const closeAveryInteraction = () => {
    if (!talkOpen && conversationState === "closed") return;
    returnToWork();
  };

  const startBreak = (minutes) => {
    setHasPlayedWorkingStart(true);
    setIsBreak(true);
    setBreakLength(minutes);
    setShowBreakPrompt(false);
    setMiniSprintRemaining(0);
    setIsPaused(true);
    setConversationState("waitingForUser");
    say(
      minutes === 15
        ? "I'm going to make a tea. Tell me when you're back."
        : "I'm going to stretch and make tea. Tell me when you're back.",
      [{ label: "Tell Avery when you're back", action: returnFromBreak }]
    );
  };

  const returnFromBreak = () => {
    setIsBreak(false);
    setIsPaused(false);
    runAverySequence("backFromBreak");
  };

  const startMiniSprint = () => {
    setMiniSprintRemaining(600);
    setIsPaused(false);
    setIsBreak(false);
    setConversationState("resolving");
    say("Okay. Ten-minute push. We are not trying to rescue the whole day. We are just doing the next 10 minutes.", [buildBackToWorkAction()]);
  };

  const endSessionNow = () => {
    const studiedMinutes = Math.max(1, Math.ceil((totalSeconds - remaining) / 60));
    const previous = Number(localStorage.getItem("studyDoubleTotalMinutes") || 0);
    const newTotal = previous + studiedMinutes;
    localStorage.setItem("studyDoubleTotalMinutes", String(newTotal));
    setSummary({ studied: studiedMinutes, total: newTotal, avery: progress });
  };

  const handleTalk = (option) => {
    if (option.type === "quiz") enterQuizSetup();
    if (option.type === "sequence") runAverySequence(option.id);
    if (option.type === "thread") runAveryThread(option.trigger);
  };

  const handleTrackError = () => {
    setIsMusicPlaying(false);
    say("Tap again to start audio.");
  };

  const chooseTrack = async (key, options = {}) => {
    if (key === "quiet") {
      audioRef.current?.pause();
      if (audioRef.current) {
        audioRef.current.removeAttribute("src");
        audioRef.current.load();
      }
      setTrackKey(null);
      setIsMusicPlaying(false);
      isMusicPlayingRef.current = false;
      setMusicPrompt(false);
      return true;
    }

    const track = TRACKS[key];
    if (!track?.src || !audioRef.current) {
      if (!options.silent) say("Tap again to start audio.");
      return false;
    }

    const currentAudioSrc = audioRef.current.getAttribute("src") || "";
    const currentResolvedSrc = audioRef.current.currentSrc || "";
    const trackPath = track.src.replace(/^\/+/, "");
    const isCurrentTrack =
      trackKey === key ||
      currentAudioSrc === track.src ||
      currentAudioSrc.endsWith(track.src) ||
      currentResolvedSrc.endsWith(track.src) ||
      currentResolvedSrc.includes(trackPath);
    if (isCurrentTrack && (isMusicPlayingRef.current || !audioRef.current.paused)) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      isMusicPlayingRef.current = false;
      setMusicPrompt(false);
      return true;
    }

    setTrackKey(key);
    setMusicPrompt(false);
    try {
      audioRef.current.pause();
      audioRef.current.src = track.src;
      audioRef.current.load();
      await audioRef.current.play();
      setAudioAvailable(true);
      setIsMusicPlaying(true);
      isMusicPlayingRef.current = true;
      return true;
    } catch {
      setIsMusicPlaying(false);
      isMusicPlayingRef.current = false;
      if (!options.silent) say("Tap again to start audio.");
      return false;
    }
  };

  const toggleMusic = () => {
    if (!trackKey || !audioRef.current || !audioAvailable) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
      isMusicPlayingRef.current = false;
    } else {
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => {
        setIsMusicPlaying(false);
        isMusicPlayingRef.current = false;
        say("Tap again to start audio.");
      });
    }
  };

  const handleAudioPlay = () => {
    isMusicPlayingRef.current = true;
    setIsMusicPlaying(true);
  };

  const handleAudioPause = () => {
    isMusicPlayingRef.current = false;
    setIsMusicPlaying(false);
  };

  const handleAudioEnded = () => {
    isMusicPlayingRef.current = false;
    setIsMusicPlaying(false);
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.();
      return;
    }
    roomRef.current?.requestFullscreen?.();
  };

  return (
    <main
      ref={roomRef}
      className={`study-room ${theme} text-${displaySize} ${isFullscreen ? "fullscreen-active" : ""} ${talkOpen ? "talk-open" : ""} ${musicPrompt ? "music-open" : ""} ${isQuizActive ? "quiz-open" : ""} ${hasActiveMessage || talkActions.length || isBreak || showBreakPrompt || isQuizActive ? "context-open" : ""}`}
    >
      <audio
        ref={audioRef}
        loop
        preload="metadata"
        onEnded={handleAudioEnded}
        onError={handleTrackError}
        onPause={handleAudioPause}
        onPlay={handleAudioPlay}
      />
      <RoomScene theme={theme} averyVisualState={averyVisualState} onStartingWorkEnded={handleStartingWorkEnded} />

      <section className="display-settings">
        <button
          className="display-settings-button"
          onClick={() => setDisplaySettingsOpen((value) => !value)}
          aria-label="Open local display settings"
          aria-expanded={displaySettingsOpen}
        >
          <SlidersHorizontal size={17} />
        </button>
        {displaySettingsOpen && (
          <div className="display-settings-panel floating-card">
            <div>
              <strong>Local display</strong>
              <span>{viewport.width} x {viewport.height} · {viewport.width >= viewport.height ? "landscape" : "portrait"}</span>
            </div>
            <div className="display-size-options" role="group" aria-label="Avery response size">
              <button className={displaySize === "comfortable" ? "active" : ""} onClick={() => setDisplaySize("comfortable")}>Comfort</button>
              <button className={displaySize === "large" ? "active" : ""} onClick={() => setDisplaySize("large")}>Large</button>
              <button className={displaySize === "extra" ? "active" : ""} onClick={() => setDisplaySize("extra")}>Extra</button>
            </div>
            <button className="display-panel-action" onClick={toggleFullscreen}>
              {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              {isFullscreen ? "Exit full screen" : "Whole screen"}
            </button>
            <label>
              <input
                type="checkbox"
                checked={showViewport}
                onChange={(event) => setShowViewport(event.target.checked)}
              />
              Show screen size
            </label>
          </div>
        )}
      </section>

      {showViewport && (
        <div className="viewport-chip">
          {viewport.width} x {viewport.height} · {viewport.width >= viewport.height ? "landscape" : "portrait"}
        </div>
      )}

      <section className="room-hero">
        <div>
          <p>{theme === "day" ? "Good morning," : "Good evening,"}</p>
          <h1>Avery</h1>
          <span><i /> FOCUSING</span>
        </div>
      </section>

      <section className="goal-card floating-card">
        <div className="card-title"><BookOpen size={18} /> Avery's task</div>
        <p>{averyTask}</p>
        <div className="progress-row">
          <div><span style={{ width: `${progress}%` }} /></div>
          <strong>{progress}%</strong>
        </div>
      </section>

      <section className={`session-card floating-card ${isTimerMinimized ? "is-minimized" : ""}`}>
        <div className="task-block">
          <span>Your task</span>
          <p>{session.userTask}</p>
        </div>
        <div className="timer-block">
          <span>Study session</span>
          <strong>{formatTime(remaining)}</strong>
          <small>{sprintActive ? "10-minute push · stay with Avery." : "Stay focused, we've got this."}</small>
        </div>
        <div className="length-block">
          <span>Session length</span>
          <p>{minutesToLabel(session.durationMinutes)}</p>
          <button onClick={() => setIsPaused((value) => !value)} aria-label={isPaused ? "Resume" : "Pause"}>
            {isPaused ? <Play size={20} /> : <Pause size={20} />}
          </button>
        </div>
        <button className="timer-minimize" onClick={() => setIsTimerMinimized(true)} aria-label="Minimise timer">
          <Minimize2 size={18} />
        </button>
      </section>

      {isTimerMinimized && (
        <section className="timer-pill floating-card" aria-label="Minimised timer">
          {sprintActive && <span className="sprint-dot">10-minute push</span>}
          <strong>{formatTime(remaining)}</strong>
          <button onClick={() => setIsPaused((value) => !value)} aria-label={isPaused ? "Resume" : "Pause"}>
            {isPaused ? <Play size={17} /> : <Pause size={17} />}
          </button>
          <button onClick={() => setIsTimerMinimized(false)} aria-label="Expand timer">
            <Expand size={17} />
          </button>
          <button onClick={toggleFullscreen} aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}>
            {isFullscreen ? <Minimize2 size={17} /> : <Maximize2 size={17} />}
          </button>
        </section>
      )}

      {sprintActive && !isTimerMinimized && (
        <div className="sprint-badge">10-minute push · {formatTime(miniSprintRemaining)}</div>
      )}

      {isMessageVisible && (
        <section key={messageKey} className="message-card floating-card">
          <div className="avatar-mini"><AveryPortrait /></div>
          <div>
            <p>{message}</p>
            {musicPrompt && (
              <div className="music-options">
                {Object.entries(TRACKS).map(([key, track]) => (
                  <button key={key} onClick={() => resolveSequenceOption({ id: key, outcome: "playMusic", trackKey: key })}>
                    {track.name}
                  </button>
                ))}
                <button onClick={() => resolveSequenceOption({ id: "none", outcome: "returnToWork" })}>
                  No music
                </button>
                {audioChecked && !audioAvailable && <span className="audio-note">Add audio files to /public/audio to enable music.</span>}
              </div>
            )}
            {showBreakPrompt && (
              <div className="music-options">
                <button onClick={() => setShowBreakPrompt(false)}>Keep going</button>
                <button onClick={() => startBreak(5)}>Take 5</button>
                <button onClick={() => startBreak(15)}>Take 15</button>
              </div>
            )}
            {talkActions.length > 0 && (
              <div className="talk-actions">
                {talkActions.map((action) => (
                  <button key={action.label} onClick={action.action}>{action.label}</button>
                ))}
              </div>
            )}
            {isBreak && (
              <button className="return-button" onClick={returnFromBreak}>
                Tell Avery when you're back
              </button>
            )}
          </div>
        </section>
      )}

      <section className="vibe-card floating-card">
        <h2>Avery's vibe</h2>
        <div className="vibe-line"><Headphones size={18} /> {trackKey ? TRACKS[trackKey].name : "Quiet room"}</div>
        {audioChecked && !audioAvailable && <p className="audio-note">Add audio files to /public/audio to enable music.</p>}
        <button onClick={toggleMusic} disabled={!trackKey || !audioAvailable}>
          {isMusicPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isMusicPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={() => runAverySequence("musicPrompt")}>
          <Headphones size={16} />
          Change music
        </button>
        <label className="volume-control">
          <Volume2 size={15} />
          <input
            min="0"
            max="1"
            step="0.05"
            type="range"
            value={volume}
            onChange={(event) => setVolume(Number(event.target.value))}
          />
        </label>
        <button onClick={changeTheme}>
          {theme === "day" ? <Moon size={16} /> : <Sun size={16} />}
          {theme === "day" ? "Evening" : "Day"}
        </button>
      </section>

      <section className="talk-dock">
        <button
          className="talk-button"
          onClick={() => {
            if (talkOpen) closeAveryInteraction();
            else {
              setHasPlayedWorkingStart(true);
              setTalkOpen(true);
              setShowRevisionScores(false);
              setConversationState("open");
            }
          }}
        >
          <MessageCircle size={18} />
          Talk to Avery
          {talkOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {talkOpen && (
          <>
          <button className="talk-dismiss-layer" onClick={closeAveryInteraction} aria-label="Close Avery conversation" />
          <div className="talk-panel floating-card">
            <button className="talk-close" onClick={closeAveryInteraction} aria-label="Close Avery options">
              <X size={16} />
            </button>
            {isQuizActive ? (
              <QuizPanel
                bank={activeQuestionBank}
                banks={questionBanks}
                quiz={quiz}
                setupStep={quizSetupStep}
                setSetupStep={setQuizSetupStep}
                activeBankId={activeQuestionBankId}
                onSelectBank={setActiveQuestionBankId}
                onStartQuiz={startQuiz}
                onAnswer={answerQuizQuestion}
                onNext={goToNextQuizQuestion}
                onQuizAgain={enterQuizSetup}
                onBackToWork={quizBackToWork}
                onTakeFive={quizTakeFive}
                notebookImportOpen={notebookImportOpen}
                importUrl={notebookImportUrl}
                importStatus={notebookImportStatus}
                importError={notebookImportError}
                importPreview={notebookImportPreview}
                pastedQuizText={pastedQuizText}
                authStatus={notebookAuthStatus}
                authMessage={notebookAuthMessage}
                onOpenNotebookImport={() => {
                  setNotebookImportOpen(true);
                  refreshNotebookLmAuthStatus();
                }}
                onCloseNotebookImport={() => setNotebookImportOpen(false)}
                onImportUrlChange={setNotebookImportUrl}
                onPastedQuizTextChange={setPastedQuizText}
                onImportNotebookLm={importNotebookLmQuiz}
                onPreviewPastedQuiz={previewPastedQuiz}
                onSaveNotebookLmImport={saveNotebookLmImport}
                onStartNotebookLmLogin={startNotebookLmLogin}
                onFinishNotebookLmLogin={finishNotebookLmLogin}
                onDisconnectNotebookLmLogin={disconnectNotebookLmLogin}
              />
            ) : showRevisionScores ? (
              <RevisionScores attempts={quizAttempts} onBack={() => setShowRevisionScores(false)} />
            ) : (
              <>
                {TALK_OPTIONS.map((option) => (
                  <button key={option.label} onClick={() => handleTalk(option)}>{option.label}</button>
                ))}
                <button onClick={() => setShowRevisionScores(true)}>Revision score</button>
              </>
            )}
          </div>
          </>
        )}
      </section>

      {isBreak && (
        <div className="break-banner floating-card">
          <Coffee size={18} />
          <span>Break mode · {breakLength} minutes</span>
          <button onClick={returnFromBreak}>I'm back</button>
        </div>
      )}

      {summary && <SummaryModal summary={summary} onRestart={onRestart} />}
    </main>
  );
}

function QuizPanel({
  bank,
  banks,
  quiz,
  setupStep,
  setSetupStep,
  activeBankId,
  onSelectBank,
  onStartQuiz,
  onAnswer,
  onNext,
  onQuizAgain,
  onBackToWork,
  onTakeFive,
  notebookImportOpen,
  importUrl,
  importStatus,
  importError,
  importPreview,
  pastedQuizText,
  authStatus,
  authMessage,
  onOpenNotebookImport,
  onCloseNotebookImport,
  onImportUrlChange,
  onPastedQuizTextChange,
  onImportNotebookLm,
  onPreviewPastedQuiz,
  onSaveNotebookLmImport,
  onStartNotebookLmLogin,
  onFinishNotebookLmLogin,
  onDisconnectNotebookLmLogin
}) {
  const currentQuestion = quiz.selectedQuestions[quiz.currentQuestionIndex];
  const latestAnswer = quiz.answers[quiz.answers.length - 1];
  const total = quiz.selectedQuestions.length;
  const percentage = total ? Math.round((quiz.score / total) * 100) : 0;
  const topicSummary = getTopicSummary(quiz.answers);
  const bankTopics = getBankTopics(bank);

  if (quiz.quizState === "setup") {
    return (
      <div className="quiz-panel">
        <div className="quiz-heading">
          <span>Quiz setup</span>
          <h2>{bank.name}</h2>
          <p>{bank.description}</p>
        </div>
        {quiz.averyLine && <div className="quiz-avery-line">{quiz.averyLine}</div>}
        <div className="quiz-import-row">
          <button className="quiz-link-button" onClick={onOpenNotebookImport}>Import from NotebookLM</button>
        </div>
        {banks.length > 1 && (
          <>
            <div className="quiz-subtitle">Question bank</div>
            <div className="quiz-choice-grid">
              {banks.map((item) => (
                <button
                  key={item.id}
                  className={item.id === activeBankId ? "active" : ""}
                  onClick={() => onSelectBank(item.id)}
                >
                  {item.name}
                  <small>{item.questions.length} questions</small>
                </button>
              ))}
            </div>
          </>
        )}
        {setupStep === "count" && (
          <div className="quiz-choice-grid">
            <button onClick={() => onStartQuiz(5)}>5 questions</button>
            <button onClick={() => onStartQuiz(10)}>10 questions</button>
            <button onClick={() => setSetupStep("topic")}>Topic quick-fire</button>
          </div>
        )}
        {setupStep === "topic" && (
          <>
            <div className="quiz-subtitle">Choose a topic</div>
            <div className="quiz-choice-grid">
              {(bankTopics.length ? bankTopics : QUIZ_TOPICS).map((topic) => (
                <button key={topic} onClick={() => setSetupStep(topic)}>{topic}</button>
              ))}
            </div>
          </>
        )}
        {(bankTopics.length ? bankTopics : QUIZ_TOPICS).includes(setupStep) && (
          <>
            <div className="quiz-subtitle">How many?</div>
            <div className="quiz-choice-grid two">
              <button onClick={() => onStartQuiz(5, setupStep)}>5</button>
              <button onClick={() => onStartQuiz(10, setupStep)}>10</button>
            </div>
            <button className="quiz-link-button" onClick={() => setSetupStep("topic")}>Change topic</button>
          </>
        )}
        {notebookImportOpen && (
          <NotebookLmImportModal
            url={importUrl}
            status={importStatus}
            error={importError}
            preview={importPreview}
            pastedQuizText={pastedQuizText}
            authStatus={authStatus}
            authMessage={authMessage}
            onUrlChange={onImportUrlChange}
            onPastedQuizTextChange={onPastedQuizTextChange}
            onImport={onImportNotebookLm}
            onPreviewPastedQuiz={onPreviewPastedQuiz}
            onSave={onSaveNotebookLmImport}
            onClose={onCloseNotebookImport}
            onStartLogin={onStartNotebookLmLogin}
            onFinishLogin={onFinishNotebookLmLogin}
            onDisconnectLogin={onDisconnectNotebookLmLogin}
          />
        )}
      </div>
    );
  }

  if (quiz.quizState === "complete") {
    const correctCount = quiz.score;
    return (
      <div className="quiz-panel">
        <div className="quiz-heading">
          <span>Quiz complete</span>
          <h2>{bank.name}</h2>
        </div>
        {quiz.averyLine && <div className="quiz-avery-line">{quiz.averyLine}</div>}
        <div className="quiz-scoreboard">
          <div>
            <span>Score</span>
            <strong>{correctCount}/{total}</strong>
          </div>
          <div>
            <span>Percentage</span>
            <strong>{percentage}%</strong>
          </div>
          <div>
            <span>Attempted</span>
            <strong>{total}</strong>
          </div>
          <div>
            <span>Streak</span>
            <strong>{quiz.streak}</strong>
          </div>
        </div>
        <div className="quiz-summary-lines">
          <p><strong>Strongest:</strong> {topicSummary.strongestTopic || "Not enough data yet"}</p>
          <p><strong>Weakest:</strong> {topicSummary.weakestTopic || "Not enough data yet"}</p>
          <p><strong>Weak topics:</strong> {topicSummary.weakTopics.length ? topicSummary.weakTopics.join(", ") : "None this round"}</p>
        </div>
        <div className="quiz-actions">
          <button onClick={onQuizAgain}>Quiz me again</button>
          <button onClick={onBackToWork}>Back to work</button>
          <button onClick={onTakeFive}>Take 5</button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="quiz-panel">
        <p>No question is loaded yet.</p>
      </div>
    );
  }

  const locked = quiz.quizState === "showingResult";
  return (
    <div className="quiz-panel">
      <div className="quiz-heading">
        <span>{bank.name}</span>
        <h2>Question {quiz.currentQuestionIndex + 1} of {total}</h2>
        {quiz.shortfallNote && <p>{quiz.shortfallNote}</p>}
      </div>
      {quiz.averyLine && <div className="quiz-avery-line">{quiz.averyLine}</div>}
      <div className="quiz-meta-row">
        <span>{currentQuestion.topic}</span>
        <span>{currentQuestion.difficulty}</span>
        <span>Score {quiz.score}/{total}</span>
        <span>Streak {quiz.streak}</span>
      </div>
      <p className="quiz-question">{currentQuestion.question}</p>
      <div className="quiz-answer-grid">
        {currentQuestion.options.map((option, index) => {
          const isSelected = latestAnswer?.selectedAnswerIndex === index;
          const isCorrect = currentQuestion.correctAnswerIndex === index;
          const resultClass = locked && isCorrect ? "correct" : locked && isSelected ? "incorrect" : "";
          return (
            <button
              key={option}
              className={resultClass}
              onClick={() => onAnswer(index)}
              disabled={locked}
            >
              {option}
            </button>
          );
        })}
      </div>
      {locked && latestAnswer && (
        <div className={latestAnswer.isCorrect ? "quiz-result correct" : "quiz-result incorrect"}>
          <strong>{latestAnswer.isCorrect ? "Correct" : "Not quite"}</strong>
          <p>{currentQuestion.explanation}</p>
          <button onClick={onNext}>
            {quiz.currentQuestionIndex + 1 === total ? "Finish quiz" : "Next question"}
          </button>
        </div>
      )}
    </div>
  );
}

function RevisionScores({ attempts, onBack }) {
  return (
    <div className="quiz-panel">
      <div className="quiz-heading">
        <span>Revision score</span>
        <h2>Recent Avery quizzes</h2>
      </div>
      {!attempts.length && <p className="quiz-empty">No quiz attempts saved yet.</p>}
      {attempts.length > 0 && (
        <div className="revision-score-list">
          {attempts.slice(0, 5).map((attempt) => (
            <div key={`${attempt.date}-${attempt.completedQuestionIds.join("-")}`} className="revision-score-item">
              <strong>{attempt.score}/{attempt.numberOfQuestions} · {attempt.percentage}%</strong>
              <span>{attempt.topic || "Mixed quiz"} · {new Date(attempt.date).toLocaleDateString()}</span>
              <small>{attempt.topicsMissed.length ? `Weak: ${attempt.topicsMissed.join(", ")}` : "No weak topics saved"}</small>
            </div>
          ))}
        </div>
      )}
      <button className="quiz-link-button" onClick={onBack}>Back</button>
    </div>
  );
}

function NotebookLmImportModal({
  url,
  status,
  error,
  preview,
  pastedQuizText,
  authStatus,
  authMessage,
  onUrlChange,
  onPastedQuizTextChange,
  onImport,
  onPreviewPastedQuiz,
  onSave,
  onClose,
  onStartLogin,
  onFinishLogin,
  onDisconnectLogin
}) {
  const isLoading = status === "loading";
  return (
    <div className="quiz-modal-backdrop">
      <section className="quiz-import-modal">
        <button className="talk-close" onClick={onClose} aria-label="Close NotebookLM import">
          <X size={16} />
        </button>
        <div className="quiz-heading">
          <span>NotebookLM import</span>
          <h2>Import shared quiz</h2>
          <p>Shared NotebookLM artifact links only. Avery can use a local signed-in session when the artifact asks for Google login.</p>
        </div>
        <div className="quiz-auth-card">
          <div>
            <strong>{authStatus?.connected ? "NotebookLM connected" : authStatus?.authInProgress ? "Sign-in window open" : "NotebookLM not connected"}</strong>
            <span>{authMessage || "Connect locally if this artifact asks for Google sign-in."}</span>
          </div>
          <div className="quiz-auth-actions">
            <button onClick={onStartLogin} disabled={isLoading}>
              {authStatus?.connected ? "Reconnect" : "Connect NotebookLM"}
            </button>
            {authStatus?.authInProgress && (
              <button onClick={onFinishLogin} disabled={isLoading}>Done signing in</button>
            )}
            {authStatus?.connected && (
              <button onClick={onDisconnectLogin} disabled={isLoading}>Disconnect</button>
            )}
          </div>
        </div>
        <label className="quiz-import-field">
          <span>Artifact URL</span>
          <input
            type="text"
            inputMode="url"
            autoCapitalize="none"
            spellCheck="false"
            value={url}
            onChange={(event) => onUrlChange(event.target.value)}
            placeholder="https://notebooklm.google.com/..."
            disabled={isLoading}
          />
        </label>
        <div className="quiz-actions">
          <button onClick={onImport} disabled={isLoading}>
            {isLoading ? "Importing..." : "Import"}
          </button>
          <button onClick={onClose} disabled={isLoading}>Cancel</button>
        </div>
        <div className="quiz-paste-card">
          <div className="quiz-heading">
            <span>Ready-made quiz</span>
            <h2>Paste quiz text</h2>
            <p>Use numbered questions with A/B/C/D options. Answer and explanation lines are optional.</p>
          </div>
          <textarea
            value={pastedQuizText}
            onChange={(event) => onPastedQuizTextChange(event.target.value)}
            aria-label="Paste ready-made quiz text"
            rows={8}
            placeholder={"Title: Adult revision quiz\n1. What is the first step?\nA. Option one\nB. Option two\nC. Option three\nD. Option four\nAnswer: B\nExplanation: Short reason."}
            disabled={isLoading}
          />
          <button className="quiz-link-button" onClick={onPreviewPastedQuiz} disabled={isLoading}>
            Preview pasted quiz
          </button>
        </div>
        {status === "error" && <div className="quiz-import-status error">{error}</div>}
        {status === "success" && preview && (
          <div className="quiz-import-preview">
            <div className="quiz-import-status success">
              Found {preview.questions.length} questions in “{preview.name}”.
            </div>
            <div className="quiz-import-question-list">
              {preview.questions.slice(0, 5).map((question, index) => (
                <div key={question.id || index} className="quiz-import-question">
                  <strong>{index + 1}. {question.question}</strong>
                  <span>{question.options.length} options · {question.topic || "Imported"}</span>
                </div>
              ))}
            </div>
            {preview.questions.length > 5 && <p className="quiz-empty">Previewing first 5 questions.</p>}
            <button className="quiz-link-button" onClick={onSave}>Save to Avery</button>
          </div>
        )}
      </section>
    </div>
  );
}

function RoomScene({ theme, averyVisualState, onStartingWorkEnded }) {
  return (
    <div className="scene" aria-hidden="true">
      <SceneVideoPlayer
        theme={theme}
        visualState={averyVisualState}
        onStartingWorkEnded={onStartingWorkEnded}
      />
      <div className="directional-light" />
      <div className="window-haze" />
      <div className="dust-motes">
        <span /><span /><span /><span /><span />
      </div>
      <div className="grain" />
      <div className="room-vignette" />
      <div className="theme-wash">{theme}</div>
    </div>
  );
}

function SceneVideoPlayer({ theme, visualState, onStartingWorkEnded }) {
  const prefersReducedMotion = useMemo(
    () => window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
    []
  );
  const mediaForState = (modeTheme, state) => {
    const media = VIDEO_MEDIA[modeTheme];
    const fallback = media.fallback || VIDEO_MEDIA.day.fallback;
    if (state === "workingStart") {
      return { src: media.workingStart, type: "video", mode: "workingStart", loop: false, fallback, poster: fallback };
    }
    if (state === "engaging") {
      const engagingFallback = media.engagingFallback || fallback;
      return { src: media.engaging, type: "video", mode: "engaging", loop: true, fallback: engagingFallback, poster: engagingFallback };
    }
    return { src: media.workingLoop, type: "video", mode: "workingLoop", loop: true, fallback, poster: fallback };
  };

  const [currentMedia, setCurrentMedia] = useState(() => mediaForState(theme, visualState));
  const [incomingMedia, setIncomingMedia] = useState(null);
  const [isFading, setIsFading] = useState(false);
  const [poster, setPoster] = useState(() => VIDEO_MEDIA[theme].fallback);
  const [sceneStatus, setSceneStatus] = useState({
    loaded: false,
    failed: false,
    activeSrc: mediaForState(theme, visualState).src,
    fallbackSrc: VIDEO_MEDIA[theme].fallback
  });
  const [failedSources, setFailedSources] = useState(() => new Set());
  const currentRef = useRef(currentMedia);
  const currentVideoRef = useRef(null);
  const incomingVideoRef = useRef(null);
  const commitTimerRef = useRef(null);

  const transitionTo = (nextMedia) => {
    if (!nextMedia?.src || nextMedia.src === currentRef.current?.src) {
      currentRef.current = nextMedia || currentRef.current;
      return;
    }

    if (prefersReducedMotion) {
      currentRef.current = nextMedia;
      setCurrentMedia(nextMedia);
      setIncomingMedia(null);
      setIsFading(false);
      setSceneStatus({
        loaded: nextMedia.type === "image",
        failed: false,
        activeSrc: nextMedia.src,
        fallbackSrc: nextMedia.fallback || nextMedia.poster || VIDEO_MEDIA[theme].fallback
      });
      return;
    }

    setIncomingMedia(nextMedia);
    setSceneStatus({
      loaded: nextMedia.type === "image",
      failed: false,
      activeSrc: nextMedia.src,
      fallbackSrc: nextMedia.fallback || nextMedia.poster || VIDEO_MEDIA[theme].fallback
    });
    window.requestAnimationFrame(() => setIsFading(true));
  };

  const commitIncoming = () => {
    setIncomingMedia((media) => {
      if (!media) return null;
      currentRef.current = media;
      setCurrentMedia(media);
      return null;
    });
    setIsFading(false);
  };

  useEffect(() => {
    setPoster(VIDEO_MEDIA[theme].fallback);
    transitionTo(mediaForState(theme, visualState));
  }, [theme, visualState]);

  useEffect(() => {
    const video = currentVideoRef.current;
    if (!video) return;
    video.play?.().catch(() => {});
  }, [currentMedia]);

  useEffect(() => {
    const video = incomingVideoRef.current;
    if (!video) return;
    video.play?.().catch(() => {});
  }, [incomingMedia]);

  useEffect(() => () => window.clearTimeout(commitTimerRef.current), []);

  useEffect(() => {
    const onVisibilityChange = () => {
      const videos = [currentVideoRef.current, incomingVideoRef.current].filter(Boolean);
      videos.forEach((video) => {
        if (document.hidden) video.pause();
        else video.play?.().catch(() => {});
      });
    };
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  const handleEnded = (media) => {
    if (media.src !== currentRef.current?.src) return;
    if (media.mode === "workingStart") onStartingWorkEnded?.();
  };

  const handleError = (media) => {
    const fallback = media.fallback || VIDEO_MEDIA[theme].fallback;
    console.warn("Study Double scene media failed:", media.src);
    setFailedSources((sources) => new Set([...sources, media.src]));
    setPoster(fallback);
    setSceneStatus({
      loaded: false,
      failed: true,
      activeSrc: media.src,
      fallbackSrc: fallback
    });
    const fallbackMedia = {
      src: fallback,
      type: "image",
      mode: media.mode,
      loop: false,
      fallback,
      poster: fallback
    };
    if (media.src === currentRef.current?.src) {
      currentRef.current = fallbackMedia;
      setCurrentMedia(fallbackMedia);
      setIncomingMedia(null);
      setIsFading(false);
    } else {
      setIncomingMedia(null);
      setIsFading(false);
    }
  };

  const handleLoaded = (media) => {
    setSceneStatus({
      loaded: true,
      failed: false,
      activeSrc: media.src,
      fallbackSrc: media.fallback || media.poster || VIDEO_MEDIA[theme].fallback
    });
  };

  const renderMedia = (media, className, ref) => {
    if (!media?.src) return null;
    const effectiveMedia = failedSources.has(media.src) && media.fallback
      ? { ...media, src: media.fallback, type: "image", loop: false, poster: media.fallback }
      : media;
    if (effectiveMedia.type === "image") {
      return (
        <div
          key={effectiveMedia.src}
          className={`${className} scene-still`}
          style={{ "--still-src": `url(${effectiveMedia.src || effectiveMedia.fallback || poster})` }}
        />
      );
    }
    return (
      <video
        key={effectiveMedia.src}
        ref={ref}
        className={className}
        src={effectiveMedia.src}
        poster={effectiveMedia.poster || poster}
        muted
        playsInline
        preload="metadata"
        loop={effectiveMedia.loop}
        autoPlay
        onLoadedData={() => handleLoaded(effectiveMedia)}
        onCanPlay={() => handleLoaded(effectiveMedia)}
        onEnded={() => handleEnded(effectiveMedia)}
        onError={() => handleError(effectiveMedia)}
      />
    );
  };

  return (
    <div className="scene-video-player" style={{ "--scene-poster": `url(${poster})` }}>
      {renderMedia(currentMedia, "scene-video scene-video-current", currentVideoRef)}
      {incomingMedia && (
        <>
          {renderMedia(
            incomingMedia,
            `scene-video scene-video-incoming ${isFading ? "is-visible" : ""}`,
            incomingVideoRef
          )}
          <span
            className="scene-commit-probe"
            onAnimationEnd={commitIncoming}
            onTransitionEnd={commitIncoming}
            ref={() => {
              window.clearTimeout(commitTimerRef.current);
              commitTimerRef.current = window.setTimeout(commitIncoming, prefersReducedMotion ? 0 : 950);
            }}
          />
        </>
      )}
      <div className="scene-debug-label" aria-hidden="true">
        <span>{visualState}</span>
        <span>{sceneStatus.activeSrc}</span>
        <span>{sceneStatus.fallbackSrc}</span>
        <span>{sceneStatus.failed ? "failed" : sceneStatus.loaded ? "loaded" : "loading"}</span>
      </div>
    </div>
  );
}

function AveryPortrait() {
  return (
    <div className="portrait">
      <div />
      <span />
    </div>
  );
}

function SummaryModal({ summary, onRestart }) {
  return (
    <div className="summary-backdrop">
      <section className="summary-card">
        <TimerReset size={30} />
        <h2>Session complete</h2>
        <p>You studied for {summary.studied} minutes.</p>
        <p>Avery completed {summary.avery}% of her task.</p>
        <strong>Today's total: {summary.total} minutes.</strong>
        <button onClick={onRestart}>Start another session</button>
      </section>
    </div>
  );
}

const rootElement = document.getElementById("root");
if (!window.studyDoubleRoot) {
  window.studyDoubleRoot = createRoot(rootElement);
}
window.studyDoubleRoot.render(<App />);
