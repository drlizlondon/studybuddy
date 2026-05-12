import { chromium } from "playwright";
import { existsSync, mkdirSync, rmSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const NOTEBOOKLM_HOSTS = new Set(["notebooklm.google.com", "notebooklm.google"]);
const __dirname = dirname(fileURLToPath(import.meta.url));
const AUTH_DIR = resolve(__dirname, "../.studybuddy-auth");
const NOTEBOOKLM_STORAGE_STATE = resolve(AUTH_DIR, "notebooklm-storage-state.json");
let authSession = null;

function isSupportedNotebookLmUrl(rawUrl) {
  try {
    const url = new URL(rawUrl);
    return url.protocol === "https:" && NOTEBOOKLM_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

function cleanText(value = "") {
  return String(value)
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function stableId(prefix, index) {
  return `${prefix}_${String(index + 1).padStart(3, "0")}`;
}

function optionIndexFromLabel(label) {
  const normalised = String(label || "").trim().toUpperCase();
  if (/^[A-D]$/.test(normalised)) return normalised.charCodeAt(0) - 65;
  return null;
}

function hasNotebookLmAuthState() {
  return existsSync(NOTEBOOKLM_STORAGE_STATE);
}

function ensureAuthDir() {
  mkdirSync(AUTH_DIR, { recursive: true });
}

function parseQuestionsFromText(rawText, title = "NotebookLM Imported Quiz") {
  const text = cleanText(rawText);
  const lines = text.split("\n").map(cleanText).filter(Boolean);
  const questions = [];
  let current = null;

  const flush = () => {
    if (!current) return;
    if (current.question && current.options.length >= 2) {
      const correctAnswerIndex = Number.isInteger(current.correctAnswerIndex) ? current.correctAnswerIndex : null;
      questions.push({
        id: stableId("notebooklm", questions.length),
        topic: current.topic || "NotebookLM Import",
        difficulty: "medium",
        question: current.question,
        options: current.options.slice(0, 4),
        correctAnswerIndex,
        explanation: current.explanation || "",
        tags: ["notebooklm", "imported"]
      });
    }
    current = null;
  };

  for (const line of lines) {
    const questionMatch = line.match(/^(?:question\s*)?(\d{1,3})[\).:-]\s+(.+\?)\s*$/i) || line.match(/^Q(?:uestion)?\s*(\d{1,3})[\).:-]\s+(.+)$/i);
    const optionMatch = line.match(/^([A-D])[\).:-]\s+(.+)$/i);
    const answerMatch = line.match(/^(?:answer|correct answer|key)\s*[:\-]\s*([A-D])(?:[\).:-]\s*)?(.*)$/i);
    const explanationMatch = line.match(/^(?:explanation|rationale|why)\s*[:\-]\s*(.+)$/i);
    const topicMatch = line.match(/^(?:topic|section)\s*[:\-]\s*(.+)$/i);

    if (questionMatch) {
      flush();
      current = {
        question: questionMatch[2],
        options: [],
        correctAnswerIndex: null,
        explanation: "",
        topic: ""
      };
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
      if (answerMatch[2]) current.explanation = cleanText([current.explanation, answerMatch[2]].filter(Boolean).join(" "));
      continue;
    }

    if (explanationMatch) {
      current.explanation = cleanText([current.explanation, explanationMatch[1]].filter(Boolean).join(" "));
      continue;
    }

    if (topicMatch) {
      current.topic = topicMatch[1];
      continue;
    }

    if (current.options.length >= 2 && /^(?:hint|note)\s*[:\-]/i.test(line)) {
      current.explanation = cleanText([current.explanation, line].filter(Boolean).join(" "));
    }
  }

  flush();
  return {
    id: `notebooklm-${Date.now()}`,
    name: title || "NotebookLM Imported Quiz",
    description: "Imported from a shared NotebookLM artifact.",
    source: "NotebookLM shared artifact",
    questions
  };
}

function normaliseStructuredQuestion(item, index) {
  const options = item.options || item.choices || item.answers || [];
  const correct =
    item.correctAnswerIndex ??
    item.correctIndex ??
    optionIndexFromLabel(item.answerKey || item.correctAnswer || item.answer);
  return {
    id: item.id || stableId("notebooklm", index),
    topic: item.topic || item.section || "NotebookLM Import",
    difficulty: ["easy", "medium", "hard"].includes(item.difficulty) ? item.difficulty : "medium",
    question: cleanText(item.question || item.prompt || item.stem || ""),
    options: options.map((option) => cleanText(typeof option === "string" ? option : option.text || option.label)).filter(Boolean).slice(0, 4),
    correctAnswerIndex: Number.isInteger(correct) ? correct : null,
    explanation: cleanText(item.explanation || item.rationale || item.hint || ""),
    tags: Array.isArray(item.tags) ? item.tags : ["notebooklm", "imported"]
  };
}

async function extractStructuredState(page) {
  return page.evaluate(() => {
    const candidates = [];
    const pushJson = (value) => {
      try {
        if (!value) return;
        candidates.push(JSON.parse(value));
      } catch {}
    };

    document.querySelectorAll('script[type="application/json"], script#__NEXT_DATA__, script[data-json]').forEach((script) => {
      pushJson(script.textContent);
    });

    for (const key of Object.keys(window)) {
      if (/quiz|question|artifact|notebook/i.test(key)) {
        try {
          const value = window[key];
          if (value && typeof value === "object") candidates.push(value);
        } catch {}
      }
    }

    const seen = new WeakSet();
    const findQuestionArrays = (value) => {
      if (!value || typeof value !== "object") return [];
      if (seen.has(value)) return [];
      seen.add(value);
      const found = [];
      if (Array.isArray(value)) {
        if (value.some((item) => item && typeof item === "object" && (item.question || item.prompt || item.stem))) {
          found.push(value);
        }
        value.slice(0, 40).forEach((item) => found.push(...findQuestionArrays(item)));
        return found;
      }
      Object.values(value).slice(0, 80).forEach((item) => found.push(...findQuestionArrays(item)));
      return found;
    };

    for (const candidate of candidates) {
      const arrays = findQuestionArrays(candidate);
      if (arrays.length) return arrays.sort((a, b) => b.length - a.length)[0];
    }
    return null;
  });
}

async function extractDomText(page) {
  return page.evaluate(() => {
    const root = document.querySelector("main") || document.body;
    return {
      title: document.querySelector("h1")?.textContent?.trim() || document.title || "NotebookLM Imported Quiz",
      text: root?.innerText || document.body.innerText || ""
    };
  });
}

async function createNotebookLmContext(browser, options = {}) {
  const contextOptions = { viewport: { width: 1365, height: 900 } };
  if (options.useAuth !== false && hasNotebookLmAuthState()) {
    contextOptions.storageState = NOTEBOOKLM_STORAGE_STATE;
  }
  return browser.newContext(contextOptions);
}

export async function importNotebookLmQuiz(rawUrl, options = {}) {
  if (!isSupportedNotebookLmUrl(rawUrl)) {
    const error = new Error("Unsupported URL. Use a public shared NotebookLM artifact link.");
    error.code = "unsupported_url";
    throw error;
  }

  const browser = await chromium.launch({ headless: true });
  try {
    const context = await createNotebookLmContext(browser, options);
    const page = await context.newPage();
    await page.goto(rawUrl, { waitUntil: "domcontentloaded", timeout: options.timeout || 45000 });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    await page.waitForTimeout(1800);

    const renderedUrl = new URL(page.url());
    if (renderedUrl.hostname === "accounts.google.com" || /\/login(?:\?|$)/.test(renderedUrl.pathname)) {
      const error = new Error(hasNotebookLmAuthState()
        ? "NotebookLM still asked for Google sign-in. Reconnect NotebookLM and try again."
        : "This NotebookLM artifact requires Google sign-in. Connect NotebookLM locally, then import again.");
      error.code = "private_notebook";
      throw error;
    }

    const privateText = await page.locator("body").innerText({ timeout: 5000 }).catch(() => "");
    if (/request access|permission required|not found|private notebook|you need access/i.test(privateText)) {
      const error = new Error("This NotebookLM artifact appears to be private or unavailable.");
      error.code = "private_notebook";
      throw error;
    }

    const structured = await extractStructuredState(page);
    if (Array.isArray(structured) && structured.length) {
      const questions = structured.map(normaliseStructuredQuestion).filter((question) => question.question && question.options.length >= 2);
      if (questions.length) {
        return {
          id: `notebooklm-${Date.now()}`,
          name: "NotebookLM Imported Quiz",
          description: "Imported from a shared NotebookLM artifact.",
          source: rawUrl,
          questions
        };
      }
    }

    const dom = await extractDomText(page);
    const bank = parseQuestionsFromText(dom.text, dom.title);
    bank.source = rawUrl;
    if (!bank.questions.length) {
      const error = new Error("No quiz detected in that NotebookLM artifact.");
      error.code = "no_quiz_detected";
      throw error;
    }
    return bank;
  } catch (error) {
    if (error.code) throw error;
    const wrapped = new Error("Parsing failed. Make sure the NotebookLM artifact is public and contains a quiz.");
    wrapped.code = "parsing_failed";
    wrapped.cause = error;
    throw wrapped;
  } finally {
    await browser.close();
  }
}

export function getNotebookLmAuthStatus() {
  return {
    connected: hasNotebookLmAuthState(),
    authInProgress: Boolean(authSession),
    storageStatePath: NOTEBOOKLM_STORAGE_STATE
  };
}

export async function startNotebookLmAuth() {
  if (authSession) {
    return { ...getNotebookLmAuthStatus(), message: "NotebookLM sign-in window is already open." };
  }

  ensureAuthDir();
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext(
    hasNotebookLmAuthState() ? { storageState: NOTEBOOKLM_STORAGE_STATE } : {}
  );
  const page = await context.newPage();
  authSession = { browser, context, page };
  await page.goto("https://notebooklm.google.com/", { waitUntil: "domcontentloaded", timeout: 60000 });
  return { ...getNotebookLmAuthStatus(), message: "Sign in to Google in the browser window, then press Done signing in." };
}

export async function finishNotebookLmAuth() {
  if (!authSession) {
    return { ...getNotebookLmAuthStatus(), message: "No NotebookLM sign-in window is open." };
  }

  ensureAuthDir();
  await authSession.context.storageState({ path: NOTEBOOKLM_STORAGE_STATE });
  await authSession.browser.close();
  authSession = null;
  return { ...getNotebookLmAuthStatus(), message: "NotebookLM connected locally." };
}

export async function cancelNotebookLmAuth() {
  if (authSession) {
    await authSession.browser.close().catch(() => {});
    authSession = null;
  }
  return getNotebookLmAuthStatus();
}

export async function disconnectNotebookLmAuth() {
  await cancelNotebookLmAuth();
  if (hasNotebookLmAuthState()) rmSync(NOTEBOOKLM_STORAGE_STATE, { force: true });
  return getNotebookLmAuthStatus();
}

export function errorToStatus(error) {
  if (error.code === "unsupported_url") return 400;
  if (error.code === "private_notebook") return 403;
  if (error.code === "no_quiz_detected") return 422;
  return 500;
}
