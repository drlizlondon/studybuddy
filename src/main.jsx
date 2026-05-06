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
  nature: { name: "Nature sounds", src: assetUrl("/audio/nature-sounds.mp3") },
  quiet: { name: "Quiet room", src: "" }
};

const VIDEO_MEDIA = {
  day: {
    start: assetUrl("/video/day/day-working-start.mp4"),
    loop: assetUrl("/video/day/day-working-loop.mp4"),
    engaging: assetUrl("/video/day/day-engaging.mp4"),
    fallback: assetUrl("/images/master-day-frame.png")
  },
  evening: {
    start: assetUrl("/video/evening/evening-working-start.mp4"),
    loop: assetUrl("/video/evening/evening-working-loop.mp4"),
    engagingStill: assetUrl("/images/evening-engaging-still.png"),
    fallback: assetUrl("/images/master-evening-frame.png")
  }
};

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
  const [conversationState, setConversationState] = useState("returningToWork");
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
  const [viewport, setViewport] = useState(() => ({
    width: typeof window === "undefined" ? 0 : window.innerWidth,
    height: typeof window === "undefined" ? 0 : window.innerHeight
  }));
  const [summary, setSummary] = useState(null);
  const audioRef = useRef(null);
  const sprintWasActiveRef = useRef(false);
  const averyTask = useMemo(() => AVERY_TASKS[Math.floor(Math.random() * AVERY_TASKS.length)], []);
  const elapsedSeconds = totalSeconds - remaining;
  const elapsedMinutes = Math.floor(elapsedSeconds / 60);
  const progress = Math.min(100, Math.round((elapsedSeconds / totalSeconds) * 88 + averyBoost));
  const sprintActive = miniSprintRemaining > 0;
  const hasActiveMessage = messageKey > 0 && !["closed", "open"].includes(conversationState);
  const averyVisualState = useMemo(() => {
    if (["open", "averySpeaking", "waitingForUser", "resolving"].includes(conversationState)) {
      return "engagedListening";
    }
    if (conversationState === "returningToWork") return "startingWork";
    return "passiveWorking";
  }, [conversationState]);

  const say = (text, actions = []) => {
    setMessage(text);
    setTalkActions(actions);
    setMessageKey((value) => value + 1);
  };

  const changeTheme = () => {
    setTheme((value) => {
      const next = value === "day" ? "evening" : "day";
      onThemeChange?.(next);
      return next;
    });
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
      setShowBreakPrompt(true);
      setShownEvents((events) => [...events, 750]);
    }
  }, [elapsedMinutes, isBreak, session.breakPrompts, session.durationMinutes, shownEvents, summary]);

  useEffect(() => {
    if (!audioRef.current) return;
    if (trackKey) audioRef.current.src = TRACKS[trackKey].src;
  }, [trackKey]);

  useEffect(() => {
    let cancelled = false;
    Promise.all(
      Object.values(TRACKS).map((track) =>
        fetch(track.src, { cache: "no-store" })
          .then((response) => response.ok && (response.headers.get("content-type") || "").startsWith("audio/"))
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
    if (state === "engagedListening") setConversationState("averySpeaking");
    else if (state === "startingWork") setConversationState("returningToWork");
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
    setConversationState("returningToWork");
  };

  const handleStartingWorkEnded = () => {
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
    setAveryVisualState(sequence.visualState || "engagedListening");

    if (sequence.requiresUserAnswer) {
      setConversationState("waitingForUser");
      say(
        sequence.averyLine,
        sequence.options.map((option) => ({
          label: option.label,
          action: () => resolveAveryChoice(option)
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
      const didStart = await chooseTrack(choice.trackKey, { silent: true });
      if (!didStart) line = sequence.afterChoice.missingAudio;
    }
    if (choice.id === "none" && sequence.id === "musicPrompt") {
      setTrackKey("quiet");
      setIsMusicPlaying(false);
      audioRef.current?.pause();
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
    if (option.type === "sequence") runAverySequence(option.id);
    if (option.type === "thread") runAveryThread(option.trigger);
  };

  const handleTrackError = () => {
    setIsMusicPlaying(false);
    setAudioAvailable(false);
    say("I can't find that music file yet, but we can keep studying.", [buildBackToWorkAction()]);
  };

  const chooseTrack = async (key, options = {}) => {
    if (key === "quiet") {
      audioRef.current?.pause();
      setTrackKey("quiet");
      setIsMusicPlaying(false);
      return true;
    }

    const track = TRACKS[key];
    if (!track?.src || !audioRef.current) {
      if (!options.silent) say("I can't find that music file yet, but we can keep studying.", [buildBackToWorkAction()]);
      return false;
    }

    setTrackKey(key);
    setMusicPrompt(false);
    try {
      audioRef.current.src = track.src;
      audioRef.current.load();
      await audioRef.current.play();
      setAudioAvailable(true);
      setIsMusicPlaying(true);
      return true;
    } catch {
      setIsMusicPlaying(false);
      if (!options.silent) say("I can't find that music file yet, but we can keep studying.", [buildBackToWorkAction()]);
      return false;
    }
  };

  const toggleMusic = () => {
    if (!trackKey || trackKey === "quiet" || !audioRef.current || !audioAvailable) return;
    if (isMusicPlaying) {
      audioRef.current.pause();
      setIsMusicPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsMusicPlaying(true)).catch(() => setIsMusicPlaying(false));
    }
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
      <audio ref={audioRef} loop onError={handleTrackError} />
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

      <section key={messageKey} className="message-card floating-card">
        <div className="avatar-mini"><AveryPortrait /></div>
        <div>
          <p>{message}</p>
          {musicPrompt && (
            <div className="music-options">
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

      <section className="vibe-card floating-card">
        <h2>Avery's vibe</h2>
        <div className="vibe-line"><Headphones size={18} /> {trackKey ? TRACKS[trackKey].name : "Quiet room"}</div>
        {audioChecked && !audioAvailable && <p className="audio-note">Add audio files to /public/audio to enable music.</p>}
        <button onClick={toggleMusic} disabled={!trackKey || trackKey === "quiet" || !audioAvailable}>
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
              setTalkOpen(true);
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

      {summary && <SummaryModal summary={summary} onRestart={onRestart} />}
    </main>
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
    if (state === "startingWork") {
      return { src: media.start, type: "video", mode: "startingWork", loop: false, fallback, poster: fallback };
    }
    if (state === "engagedListening") {
      if (modeTheme === "day") {
        return { src: media.engaging, type: "video", mode: "engagedListening", loop: true, fallback, poster: fallback };
      }
      return {
        src: media.engagingStill || fallback,
        type: "image",
        mode: "engagedListening",
        loop: false,
        fallback,
        poster: fallback
      };
    }
    return { src: media.loop, type: "video", mode: "passiveWorking", loop: true, fallback, poster: fallback };
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
    if (media.mode === "startingWork") onStartingWorkEnded?.();
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
    if (!media?.src || failedSources.has(media.src)) return null;
    if (media.type === "image") {
      return (
        <div
          key={media.src}
          className={`${className} scene-still`}
          style={{ "--still-src": `url(${media.src || media.fallback || poster})` }}
        />
      );
    }
    return (
      <video
        key={media.src}
        ref={ref}
        className={className}
        src={media.src}
        poster={media.poster || poster}
        muted
        playsInline
        preload="metadata"
        loop={media.loop}
        autoPlay
        onLoadedData={() => handleLoaded(media)}
        onCanPlay={() => handleLoaded(media)}
        onEnded={() => handleEnded(media)}
        onError={() => handleError(media)}
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

createRoot(document.getElementById("root")).render(<App />);
