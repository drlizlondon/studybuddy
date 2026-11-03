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
import { PIP_MOTIVATION_LINES, PIP_SEQUENCES, getPipSequence } from "./data/pipSequences";
import { CLOSING_ANSWERS, CLOSING_QUESTION, CLOSING_QUESTION_BLANK_TASK, SESSIONS_KEEP, SESSIONS_STORAGE_KEY } from "./data/pipClosing.js";
import { DEFAULT_ROOM_ID, ROOMS, ROOM_STORAGE_KEY, getRoom } from "./data/rooms.js";
import { PIP_TASKS } from "./data/pipTasks.js";
import { PIP_THREADS, getThreadsByTrigger } from "./data/pipThreads";
import { DeskScene, PipFace } from "./pip/DeskScene.jsx";
import "./styles.css";

const assetUrl = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\/+/, "")}`;

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
  piano: { name: "Piano", src: assetUrl("/audio/piano.mp3") },
  nature: { name: "Nature sounds", src: assetUrl("/audio/nature-sounds.mp3") }
};

const PIP_VISUAL_STATE_MAP = { workingStart: "settling", workingLoop: "work", engaging: "engaging" };

const TALK_OPTIONS = [
  { label: "I'm ready to start", type: "sequence", id: "readyToStart" },
  { label: "I want to take a break", type: "sequence", id: "breakPrompt" },
  { label: "I'm struggling to focus", type: "sequence", id: "strugglingToFocus" },
  { label: "I'm back", type: "sequence", id: "backFromBreak" },
  { label: "I want to stop now", type: "thread", trigger: "I want to stop now" },
  { label: "Encourage me", type: "thread", trigger: "I need encouragement" },
  { label: "Change the music", type: "sequence", id: "musicPrompt" }
];

const DISPLAY_SIZES = ["comfortable", "large", "extra"];
function getSavedDisplaySize() {
  if (typeof window === "undefined") return "large";
  const saved = window.localStorage.getItem("studyDoubleDisplaySize");
  return DISPLAY_SIZES.includes(saved) ? saved : "large";
}

function getSavedViewportSetting() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem("studyDoubleShowViewport") === "true";
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

function getSavedRoomId() {
  try {
    const saved = window.localStorage.getItem(ROOM_STORAGE_KEY);
    return ROOMS.some((room) => room.id === saved) ? saved : DEFAULT_ROOM_ID;
  } catch {
    return DEFAULT_ROOM_ID;
  }
}

function saveRoomId(id) {
  try {
    window.localStorage.setItem(ROOM_STORAGE_KEY, id);
  } catch {
    // Storage can be unavailable; the choice still applies for this visit.
  }
}

// The view behind Pip. Uses the room's image once it is known to exist, and its CSS-gradient
// placeholder otherwise (no image request at all while room.images is false).
function RoomBackdrop({ room, theme }) {
  const variant = theme === "evening" ? "night" : "day";
  const wanted = room.images ? assetUrl(room[variant]) : null;
  const [loaded, setLoaded] = useState(null);

  useEffect(() => {
    setLoaded(null);
    if (!wanted) return undefined;
    let cancelled = false;
    const probe = new Image();
    probe.onload = () => !cancelled && setLoaded(wanted);
    probe.onerror = () => !cancelled && setLoaded(null);
    probe.src = wanted;
    return () => {
      cancelled = true;
    };
  }, [wanted]);

  const layers = [loaded ? `url("${loaded}") center / cover no-repeat` : null, room.placeholder[variant]].filter(Boolean);
  return <div className="room-backdrop" data-room={room.id} data-variant={variant} style={{ background: layers.join(", ") }} aria-hidden="true" />;
}

function OpeningScreen({ onStart, theme, onToggleTheme, roomId, onRoomChange }) {
  const [duration, setDuration] = useState(45);
  const [custom, setCustom] = useState("");
  const [task, setTask] = useState("");
  const [breaks, setBreaks] = useState(true);

  const selectedDuration = duration === "custom" ? Math.max(1, Number(custom) || 45) : duration;

  return (
    <main className={`opening-screen ${theme}`}>
      <section className="opening-room" aria-hidden="true">
        <div className="opening-bg-stack">
          <RoomBackdrop room={getRoom(roomId)} theme={theme} />
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
        <h2>How long are we working today?</h2>
        <div className="duration-grid" role="group" aria-label="Work duration">
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
            placeholder="Read the report and write three notes on it."
            rows={3}
          />
        </label>
        <div className="view-picker" role="group" aria-label="Choose your view">
          <span className="view-picker-title">Choose your view</span>
          <div className="view-picker-options">
            {ROOMS.map((room) => (
              <button
                key={room.id}
                type="button"
                className={roomId === room.id ? "view-choice active" : "view-choice"}
                aria-pressed={roomId === room.id}
                data-room={room.id}
                onClick={() => onRoomChange(room.id)}
              >
                <i style={{ background: room.placeholder.day }} aria-hidden="true" />
                <span>{room.name}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="break-toggle">
          <span>Should Pip suggest breaks?</span>
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
              userTask: task.trim(),
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
  const [roomId, setRoomId] = useState(getSavedRoomId);
  const chooseRoom = (id) => {
    setRoomId(id);
    saveRoomId(id);
  };

  return session ? (
    <StudyRoom session={session} room={getRoom(roomId)} initialTheme={theme} onThemeChange={setTheme} onRestart={() => setSession(null)} />
  ) : (
    <OpeningScreen
      theme={theme}
      onToggleTheme={() => setTheme((value) => (value === "day" ? "evening" : "day"))}
      roomId={roomId}
      onRoomChange={chooseRoom}
      onStart={setSession}
    />
  );
}

function StudyRoom({ session, room, initialTheme = "day", onThemeChange, onRestart }) {
  const roomRef = useRef(null);
  const [theme, setTheme] = useState(initialTheme);
  const [totalSeconds, setTotalSeconds] = useState(session.durationMinutes * 60);
  const [remaining, setRemaining] = useState(session.durationMinutes * 60);
  const [isPaused, setIsPaused] = useState(false);
  const [isTimerMinimized, setIsTimerMinimized] = useState(true);
  const [isBreak, setIsBreak] = useState(false);
  const [breakLength, setBreakLength] = useState(0);
  const [message, setMessage] = useState(PIP_SEQUENCES.sessionStart.pipLine);
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
  const [pipBoost, setPipBoost] = useState(0);
  const [conversationState, setConversationState] = useState("closed");
  const [activeSequenceId, setActiveSequenceId] = useState("sessionStart");
  const [activeThreadId, setActiveThreadId] = useState(null);
  const [threadNodeId, setThreadNodeId] = useState("start");
  const [completedThreadIds, setCompletedThreadIds] = useState(() => {
    if (typeof window === "undefined") return [];
    return JSON.parse(window.localStorage.getItem("studyDoubleCompletedPipThreads") || "[]");
  });
  const [pendingBackToWorkLine, setPendingBackToWorkLine] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [displaySettingsOpen, setDisplaySettingsOpen] = useState(false);
  const [displaySize, setDisplaySize] = useState(getSavedDisplaySize);
  const [showViewport, setShowViewport] = useState(getSavedViewportSetting);
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight
  }));
  const [summary, setSummary] = useState(null);
  const [hasPlayedWorkingStart, setHasPlayedWorkingStart] = useState(false);
  const [workMode, setWorkMode] = useState("reading");
  const audioRef = useRef(null);
  const isMusicPlayingRef = useRef(false);
  const sprintWasActiveRef = useRef(false);
  const pipTask = useMemo(() => PIP_TASKS[Math.floor(Math.random() * PIP_TASKS.length)], []);
  const elapsedSeconds = totalSeconds - remaining;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const progress = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 88 + pipBoost));
  const sprintActive = miniSprintRemaining > 0;
  const hasActiveMessage = isMessageVisible && messageKey > 0;
  const pipState = useMemo(() => {
    if (isBreak) return "break";
    if (showBreakPrompt || ["open", "pipSpeaking", "waitingForUser", "resolving"].includes(conversationState)) {
      return "engaging";
    }
    if (!hasPlayedWorkingStart) return "settling";
    return workMode;
  }, [conversationState, hasPlayedWorkingStart, isBreak, showBreakPrompt, workMode]);

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

  // Pip settles in for a few seconds, then gets on with his work.
  useEffect(() => {
    const settled = window.setTimeout(() => setHasPlayedWorkingStart(true), 6000);
    return () => window.clearTimeout(settled);
  }, []);

  // While you work, Pip alternates reading and writing every 3-6 minutes (random).
  useEffect(() => {
    if (isPaused || isBreak || summary) return undefined;
    const delay = (3 + Math.random() * 3) * 60 * 1000;
    const swap = window.setTimeout(() => setWorkMode((mode) => (mode === "reading" ? "writing" : "reading")), delay);
    return () => window.clearTimeout(swap);
  }, [workMode, isPaused, isBreak, summary]);

  useEffect(() => {
    if (isPaused || isBreak || summary) return;
    const tick = window.setInterval(() => {
      setRemaining((value) => Math.max(0, value - 1));
      setMiniSprintRemaining((value) => {
        if (value <= 0) return 0;
        setPipBoost((boost) => Math.min(16, boost + 0.012));
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
    setSummary({ studied: studiedMinutes, total: newTotal, pip: progress });
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
    localStorage.setItem("studyDoubleCompletedPipThreads", JSON.stringify(completedThreadIds));
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

  const setPipVisualState = (state) => {
    // Old visual states map onto Pip's desk states: workingStart -> settling,
    // workingLoop -> reading or writing, engaging -> engaging.
    const target = PIP_VISUAL_STATE_MAP[state] ?? "engaging";
    if (target === "engaging") {
      setHasPlayedWorkingStart(true);
      setConversationState("pipSpeaking");
    } else {
      setConversationState("closed");
    }
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
    resolvePipChoice(option);
  };

  const returnToWork = (line = pendingBackToWorkLine) => {
    setTalkOpen(false);
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

  const runPipSequence = (sequenceId) => {
    const sequence = getPipSequence(sequenceId);
    if (!sequence) return;
    setTalkOpen(false);
    setActiveSequenceId(sequence.id);
    setActiveThreadId(null);
    setPendingBackToWorkLine(sequence.backToWorkLine || "");
    setMusicPrompt(sequence.id === "musicPrompt");
    setShowBreakPrompt(false);
    setPipVisualState(sequence.visualState || "engaging");

    if (sequence.waitsForAnswer) {
      setConversationState("waitingForUser");
      say(
        sequence.pipLine,
        sequence.options.map((option) => ({
          label: option.label,
          action: () => resolveSequenceOption(option)
        }))
      );
      return;
    }

    say(sequence.pipLine);
    if (sequence.autoReturnToWork) {
      window.setTimeout(() => returnToWork(sequence.backToWorkLine), 2200);
    }
  };

  const runPipThread = (trigger) => {
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
        ? PIP_MOTIVATION_LINES[Math.floor(Math.random() * PIP_MOTIVATION_LINES.length)]
        : thread.openingLine;
    say(
      openingLine,
      startNode.userOptions.map((option) => ({
        label: option.label,
        action: () => resolvePipChoice({ ...option, threadId: thread.id, fromThread: true })
      }))
    );
  };

  const resolvePipChoice = async (choice) => {
    setConversationState("resolving");
    if (choice.fromThread) {
      const thread = PIP_THREADS.find((item) => item.id === choice.threadId);
      if (!thread) return;
      const nextNodeId = choice.nextNode || "final";
      const nextNode = thread.nodes[nextNodeId];
      setThreadNodeId(nextNodeId);

      if (nextNode && nextNodeId !== "final") {
        const nextActions = nextNode.userOptions.map((option) => ({
          label: option.label,
          action: () => resolvePipChoice({ ...option, threadId: thread.id, fromThread: true })
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
        say(finalLine, [{ label: "Tell Pip when you're back", action: returnFromBreak }]);
      }
      return;
    }

    const sequence = getPipSequence(activeSequenceId);
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
      say(line, [{ label: "Tell Pip when you're back", action: returnFromBreak }]);
      return;
    }
    if (outcome === "endSession") {
      say(line);
      return;
    }
    say(line, returnsToStudy ? [buildBackToWorkAction()] : []);
  };

  const closePipInteraction = () => {
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
      [{ label: "Tell Pip when you're back", action: returnFromBreak }]
    );
  };

  const returnFromBreak = () => {
    setIsBreak(false);
    setIsPaused(false);
    runPipSequence("backFromBreak");
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
    setSummary({ studied: studiedMinutes, total: newTotal, pip: progress });
  };

  const handleTalk = (option) => {
    if (option.type === "sequence") runPipSequence(option.id);
    if (option.type === "thread") runPipThread(option.trigger);
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
      className={`study-room ${theme} text-${displaySize} ${isFullscreen ? "fullscreen-active" : ""} ${talkOpen ? "talk-open" : ""} ${musicPrompt ? "music-open" : ""} ${hasActiveMessage || talkActions.length || isBreak || showBreakPrompt ? "context-open" : ""}`}
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
      <RoomScene room={room} theme={theme} pipState={pipState} />

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
            <div className="display-size-options" role="group" aria-label="Pip response size">
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
          <h1>Pip</h1>
          <span><i /> FOCUSING</span>
        </div>
      </section>

      <section className="goal-card floating-card">
        <div className="card-title"><BookOpen size={18} /> Pip's task</div>
        <p>{pipTask}</p>
        <div className="progress-row">
          <div><span style={{ width: `${progress}%` }} /></div>
          <strong>{progress}%</strong>
        </div>
      </section>

      <section className={`session-card floating-card ${isTimerMinimized ? "is-minimized" : ""}`}>
        {session.userTask && (
          <div className="task-block">
            <span>Your task</span>
            <p>{session.userTask}</p>
          </div>
        )}
        <div className="timer-block">
          <span>Work session</span>
          <strong>{formatTime(remaining)}</strong>
          <small>{sprintActive ? "10-minute push · stay with Pip." : "Stay focused, we've got this."}</small>
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
          <div className="avatar-mini"><PipFace state={pipState} /></div>
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
                Tell Pip when you're back
              </button>
            )}
          </div>
        </section>
      )}

      <section className="vibe-card floating-card">
        <h2>Pip's vibe</h2>
        <div className="vibe-line"><Headphones size={18} /> {trackKey ? TRACKS[trackKey].name : "Quiet room"}</div>
        {audioChecked && !audioAvailable && <p className="audio-note">Add audio files to /public/audio to enable music.</p>}
        <button onClick={toggleMusic} disabled={!trackKey || !audioAvailable}>
          {isMusicPlaying ? <Pause size={16} /> : <Play size={16} />}
          {isMusicPlaying ? "Pause" : "Play"}
        </button>
        <button onClick={() => runPipSequence("musicPrompt")}>
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
            if (talkOpen) closePipInteraction();
            else {
              setHasPlayedWorkingStart(true);
              setTalkOpen(true);
              setConversationState("open");
            }
          }}
        >
          <MessageCircle size={18} />
          Talk to Pip
          {talkOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </button>
        {talkOpen && (
          <>
          <button className="talk-dismiss-layer" onClick={closePipInteraction} aria-label="Close Pip conversation" />
          <div className="talk-panel floating-card">
            <button className="talk-close" onClick={closePipInteraction} aria-label="Close Pip options">
              <X size={16} />
            </button>
            {TALK_OPTIONS.map((option) => (
              <button key={option.label} onClick={() => handleTalk(option)}>{option.label}</button>
            ))}
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

      {summary && <SummaryModal summary={summary} task={session.userTask} onRestart={onRestart} />}
    </main>
  );
}

function RoomScene({ room, theme, pipState }) {
  const { x, y, scale } = room.pip;
  return (
    <div className="scene">
      <RoomBackdrop room={room} theme={theme} />
      <div className={`room-tint room-tint--${theme}`} style={{ "--pip-x": `${x}%`, "--pip-y": `${y}%` }} aria-hidden="true" />
      <div className="pip-stage" style={{ left: `${x}%`, top: `${y}%`, "--pip-scale": scale }}>
        <DeskScene state={pipState} theme={theme} />
      </div>
      <div className="directional-light" aria-hidden="true" />
      <div className="window-haze" aria-hidden="true" />
      <div className="dust-motes" aria-hidden="true">
        <span /><span /><span /><span /><span />
      </div>
      <div className="grain" aria-hidden="true" />
      <div className="room-vignette" aria-hidden="true" />
      <div className="theme-wash" aria-hidden="true">{theme}</div>
    </div>
  );
}

// Saved on this device only: {date, minutes, task, answer}. Nothing leaves the device.
function saveSessionRecord(record) {
  try {
    const previous = JSON.parse(window.localStorage.getItem(SESSIONS_STORAGE_KEY) || "[]");
    const list = Array.isArray(previous) ? previous : [];
    window.localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify([...list, record].slice(-SESSIONS_KEEP)));
  } catch {
    // Storage can be unavailable (private window); the question still works.
  }
}

function SummaryModal({ summary, task, onRestart }) {
  const [answerId, setAnswerId] = useState(null);
  const answered = CLOSING_ANSWERS.find((item) => item.id === answerId);

  const answer = (item) => {
    if (answerId) return;
    setAnswerId(item.id);
    saveSessionRecord({ date: new Date().toISOString(), minutes: summary.studied, task, answer: item.id });
  };

  return (
    <div className="summary-backdrop">
      <section className="summary-card">
        <TimerReset size={30} />
        <h2>Session complete</h2>
        <p>You worked for {summary.studied} {summary.studied === 1 ? "minute" : "minutes"}.</p>
        <p>Pip finished {summary.pip}% of his task.</p>
        <strong>Today's total: {summary.total} {summary.total === 1 ? "minute" : "minutes"}.</strong>
        <div className="closing-question" role="group" aria-labelledby="closing-question-text">
          {task && <p className="closing-task">“{task}”</p>}
          <h3 id="closing-question-text">{task ? CLOSING_QUESTION : CLOSING_QUESTION_BLANK_TASK}</h3>
          <div className="closing-answers">
            {CLOSING_ANSWERS.map((item) => (
              <button
                key={item.id}
                className={answerId === item.id ? "active" : ""}
                onClick={() => answer(item)}
                disabled={Boolean(answerId)}
              >
                {item.label}
              </button>
            ))}
          </div>
          {answered && <p className="closing-reply" role="status">{answered.pipLine}</p>}
        </div>
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
