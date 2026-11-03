// SD-1 acceptance tests. Run with `npm test` (builds, then Playwright against `vite preview`).
// Each test title starts with the check id from the spec (A1 ... G7).
import { test, expect } from "@playwright/test";
import { execFileSync, spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, extname } from "node:path";
import { PIP_TASKS } from "../src/data/pipTasks.js";
import { CLOSING_ANSWERS, CLOSING_QUESTION, CLOSING_QUESTION_BLANK_TASK } from "../src/data/pipClosing.js";
import { ROOMS } from "../src/data/rooms.js";

const repo = new URL("..", import.meta.url).pathname;
const TASK = "Write the three notes.";
const SESSIONS_KEY = "studyDoubleSessions";

// Checks that read files rather than the browser only need to run once.
const desktopOnly = (testInfo) => test.skip(testInfo.project.name !== "desktop-1280", "file check: runs once");

function grep(pattern, paths, extra = []) {
  const result = spawnSync("grep", ["-rniE", ...extra, pattern, ...paths], { cwd: repo, encoding: "utf8" });
  return { status: result.status, out: result.stdout.trim() };
}

async function openSetup(page, { clock = true } = {}) {
  if (clock) await page.clock.install();
  await page.goto("./");
}

async function enterRoom(page, { task = TASK, evening = false } = {}) {
  await openSetup(page);
  if (evening) await page.getByRole("button", { name: "Switch to evening mode" }).click();
  if (task) await page.getByRole("textbox").first().fill(task);
  await page.getByRole("button", { name: "Enter study room" }).click();
  await expect(pipSvg(page)).toBeVisible();
}

const pipSvg = (page) => page.locator('svg[aria-label^="Pip"]');

async function endSessionViaStop(page) {
  // The opening message covers the talk panel on a phone until it fades after 5 s (same in the
  // base build), so let it go first, as a person would.
  await page.clock.fastForward(6000);
  await page.getByRole("button", { name: "Talk to Pip" }).click();
  await page.getByRole("button", { name: "I want to stop now" }).click();
  await page.getByRole("button", { name: "I have genuinely done enough" }).click();
  await page.getByRole("button", { name: "Finish now" }).click();
  await page.clock.runFor(1000);
  await expect(page.getByRole("heading", { name: "Session complete" })).toBeVisible();
}

const readSessions = (page) => page.evaluate((key) => JSON.parse(localStorage.getItem(key) || "[]"), SESSIONS_KEY);

// ---------------------------------------------------------------- SD-1a
test("A1 no quiz, NotebookLM, question-bank or resus text in src, vite.config.js, package.json", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const { status, out } = grep("quiz|notebooklm|questionBank|resus", ["src", "vite.config.js", "package.json"]);
  expect(out).toBe("");
  expect(status).toBe(1);
});

test("A2 npm run build passes", async ({}, testInfo) => {
  desktopOnly(testInfo);
  // Build into its own folder so the preview server's dist is untouched.
  const out = execFileSync("npx", ["vite", "build", "--outDir", "dist-a2", "--emptyOutDir"], { cwd: repo, encoding: "utf8" });
  expect(out).toContain("built in");
});

// ---------------------------------------------------------------- SD-1b
test("B1 the study room renders svg[aria-label^=Pip] and the page has no <video>", async ({ page }) => {
  await enterRoom(page);
  await expect(pipSvg(page)).toHaveCount(1);
  await expect(page.locator("video")).toHaveCount(0);
  await expect(page.locator("img")).toHaveCount(0);
});

test("B2 each of the five states renders its class", async ({ page }) => {
  await enterRoom(page);
  const scene = pipSvg(page);
  // settling: straight after entering the room
  await expect(scene).toHaveClass(/pip-scene--settling/);
  await expect(scene).toHaveAttribute("data-pip-state", "settling");
  // reading: once Pip has settled in
  await page.clock.fastForward(7000);
  await expect(scene).toHaveClass(/pip-scene--reading/);
  // writing: he alternates every 3-6 minutes
  await page.clock.fastForward(6 * 60 * 1000 + 1000);
  await expect(scene).toHaveClass(/pip-scene--writing/);
  // engaging: whenever Pip speaks
  await page.getByRole("button", { name: "Talk to Pip" }).click();
  await expect(scene).toHaveClass(/pip-scene--engaging/);
  // break: a five-minute break
  await page.getByRole("button", { name: "I want to take a break" }).click();
  await page.getByRole("button", { name: "I need 5 minutes" }).click();
  await expect(scene).toHaveClass(/pip-scene--break/);
  await expect(scene).toHaveAttribute("data-pip-state", "break");
});

test("B3 reduced motion: no running CSS animation anywhere", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await openSetup(page);
  const running = () =>
    page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").map((a) => a.animationName || a.constructor.name));
  expect(await running()).toEqual([]);
  await page.getByRole("button", { name: "Enter study room" }).click();
  await expect(pipSvg(page)).toBeVisible();
  for (const advance of [500, 7000, 6 * 60 * 1000 + 1000]) {
    await page.clock.fastForward(advance);
    expect(await running()).toEqual([]);
    expect(await page.evaluate(() => document.getAnimations().length)).toBe(0);
  }
});

test("B3 control: with motion allowed the same page does run animations", async ({ page }) => {
  await enterRoom(page);
  await page.clock.fastForward(7000);
  const count = await page.evaluate(() => document.getAnimations().filter((a) => a.playState === "running").length);
  expect(count).toBeGreaterThan(0);
});

test("B4 no 'avery' anywhere in src, public, index.html", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const { status, out } = grep("avery", ["src", "public", "index.html"]);
  expect(out).toBe("");
  expect(status).toBe(1);
});

// ---------------------------------------------------------------- SD-1c
test("C1 the room shows exactly one PIP_TASKS entry", async ({ page }) => {
  await enterRoom(page);
  const text = (await page.locator(".goal-card p").innerText()).trim();
  expect(PIP_TASKS).toContain(text);
  await expect(page.locator(".goal-card p")).toHaveCount(1);
  expect(PIP_TASKS).toHaveLength(6);
});

for (const [label, seconds, expected] of [
  ["half the session", 22.5 * 60, Math.round(0.5 * 88)],
  ["a quarter of the session", 11.25 * 60, Math.round(0.25 * 88)]
]) {
  test(`C2 summary percentage is the computed progress (${label})`, async ({ page }) => {
    await enterRoom(page);
    await page.clock.runFor(seconds * 1000);
    await page.locator('.timer-pill button[aria-label="Pause"]').click();
    await endSessionViaStop(page);
    const line = await page.locator(".summary-card p", { hasText: "Pip finished" }).innerText();
    expect(line).toBe(`Pip finished ${expected}% of his task.`);
  });
}

// ---------------------------------------------------------------- SD-1d
test("D1 no revise/exam/portfolio/interview/application/studying wording in src", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const { out } = grep("revis|exam|portfolio|interview|application|studying", ["src"]);
  // "Study Double" is the product name and does not match; anything else is a miss.
  expect(out).toBe("");
});

test("D2 the wording diff script passes: every changed line is in the table", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const out = execFileSync("node", ["scripts/check-wording-diff.mjs"], { cwd: repo, encoding: "utf8" });
  expect(out).toContain("PASS");
});

test("D2 the placeholder is a real placeholder and clears on focus", async ({ page }) => {
  await openSetup(page);
  const box = page.getByRole("textbox").first();
  await expect(box).toHaveAttribute("placeholder", "Read the report and write three notes on it.");
  await expect(box).toHaveValue("");
  await box.focus();
  await expect(box).toHaveValue("");
});

// ---------------------------------------------------------------- SD-1e
test("E1 ending a session shows the question and three buttons", async ({ page }) => {
  await enterRoom(page);
  await endSessionViaStop(page);
  await expect(page.locator(".closing-task")).toHaveText(`“${TASK}”`);
  await expect(page.getByRole("heading", { name: CLOSING_QUESTION })).toBeVisible();
  const buttons = page.locator(".closing-answers button");
  await expect(buttons).toHaveText(["Yes", "Part of it", "Not this time"]);
  // The question sits before "Start another session".
  const order = await page.locator(".summary-card").evaluate((card) => {
    const q = card.querySelector(".closing-question");
    const restart = [...card.querySelectorAll("button")].find((b) => b.textContent === "Start another session");
    return Boolean(q.compareDocumentPosition(restart) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(order).toBe(true);
});

test("E2 each button shows its line and appends one record with the right answer", async ({ page }) => {
  await enterRoom(page);
  let expectedCount = 0;
  for (const [index, item] of CLOSING_ANSWERS.entries()) {
    if (index > 0) {
      await page.getByRole("button", { name: "Start another session" }).click();
      await page.getByRole("textbox").first().fill(TASK);
      await page.getByRole("button", { name: "Enter study room" }).click();
    }
    await endSessionViaStop(page);
    await page.getByRole("button", { name: item.label, exact: true }).click();
    await expect(page.locator(".closing-reply")).toHaveText(item.pipLine);
    expectedCount += 1;
    const records = await readSessions(page);
    expect(records).toHaveLength(expectedCount);
    const last = records[records.length - 1];
    expect(last.answer).toBe(item.id);
    expect(last.task).toBe(TASK);
    expect(typeof last.minutes).toBe("number");
    expect(Number.isNaN(Date.parse(last.date))).toBe(false);
    expect(Object.keys(last).sort()).toEqual(["answer", "date", "minutes", "rating", "task"]);
    expect(last.rating).toBeNull(); // untouched slider = no rating, never a default 5
    // answering twice does not add a second record
    await expect(page.locator(".closing-answers button").first()).toBeDisabled();
  }
});

test("E2 only the last 50 records are kept", async ({ page }) => {
  await page.addInitScript((key) => {
    if (!localStorage.getItem(key)) {
      localStorage.setItem(key, JSON.stringify(Array.from({ length: 50 }, (_, i) => ({ date: "2026-01-01T00:00:00.000Z", minutes: i, task: `old ${i}`, answer: "yes" }))));
    }
  }, SESSIONS_KEY);
  await enterRoom(page);
  await endSessionViaStop(page);
  await page.getByRole("button", { name: "Part of it" }).click();
  const records = await readSessions(page);
  expect(records).toHaveLength(50);
  expect(records[0].task).toBe("old 1");
  expect(records[49]).toMatchObject({ task: TASK, answer: "part" });
});

test("E3 a blank task shows the blank-task question and saves task: ''", async ({ page }) => {
  await enterRoom(page, { task: "" });
  await expect(page.locator(".task-block")).toHaveCount(0); // no made-up task in the room either
  await endSessionViaStop(page);
  await expect(page.getByRole("heading", { name: CLOSING_QUESTION_BLANK_TASK })).toBeVisible();
  await expect(page.locator(".closing-task")).toHaveCount(0);
  await page.getByRole("button", { name: "Not this time" }).click();
  const records = await readSessions(page);
  expect(records).toHaveLength(1);
  expect(records[0].task).toBe("");
  expect(records[0].answer).toBe("not-this-time");
});

test("E4 mutation: with the question removed, E1 fails", async ({}, testInfo) => {
  desktopOnly(testInfo);
  test.skip(Boolean(process.env.SD1_NESTED), "never recurse");
  test.setTimeout(240_000);
  const out = execFileSync("bash", ["scripts/e4-mutation.sh"], { cwd: repo, encoding: "utf8", timeout: 230_000 });
  expect(out).toContain("E4 OK: E1 failed with the question removed");
  expect(out).toContain("main.jsx restored");
});

// ---------------------------------------------------------------- SD-1g
test("F1 the picker shows 3 rooms and the choice persists across a reload", async ({ page }) => {
  await openSetup(page);
  const picker = page.getByRole("group", { name: "Choose your view" });
  const choices = picker.locator("button.view-choice");
  await expect(choices).toHaveCount(3);
  await expect(choices).toHaveText(ROOMS.map((room) => room.name));
  await expect(picker.getByRole("button", { name: "Country views" })).toHaveAttribute("aria-pressed", "true"); // default
  await picker.getByRole("button", { name: "Future office" }).click();
  expect(await page.evaluate(() => localStorage.getItem("studyDoubleRoom"))).toBe("office");
  await page.reload();
  await expect(page.getByRole("group", { name: "Choose your view" }).getByRole("button", { name: "Future office" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Enter study room" }).click();
  await expect(page.locator(".scene .room-backdrop")).toHaveAttribute("data-room", "office");
});

test("F2 with the room images missing: placeholder shown, no failed or broken image requests", async ({ page }) => {
  const failed = [];
  const imageRequests = [];
  page.on("requestfailed", (request) => failed.push(request.url()));
  page.on("response", (response) => {
    if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`);
  });
  page.on("request", (request) => {
    if (request.resourceType() === "image" || request.url().includes("/images/rooms/")) imageRequests.push(request.url());
  });
  for (const room of ROOMS) {
    await page.addInitScript((id) => localStorage.setItem("studyDoubleRoom", id), room.id);
    await page.goto("./");
    const setupBackdrop = page.locator(".opening-screen .room-backdrop");
    await expect(setupBackdrop).toHaveAttribute("data-room", room.id);
    await page.getByRole("button", { name: "Enter study room" }).click();
    const backdrop = page.locator(".scene .room-backdrop");
    await expect(backdrop).toHaveAttribute("data-room", room.id);
    const background = await backdrop.evaluate((el) => el.style.background);
    expect(background).toContain("gradient");
    expect(background).not.toContain("url(");
    const broken = await page.evaluate(() => [...document.images].filter((img) => !img.complete || img.naturalWidth === 0).length);
    expect(broken).toBe(0);
  }
  expect(imageRequests).toEqual([]);
  expect(failed.filter((url) => !url.includes("/audio/"))).toEqual([]);
});

test("F3 day/night swaps only the background and tint; Pip does not move", async ({ browser }, testInfo) => {
  // Two separate sessions (works at every width: the in-room theme button is hidden on phones).
  const measure = async (evening) => {
    const context = await browser.newContext({ viewport: testInfo.project.use.viewport, baseURL: testInfo.project.use.baseURL });
    const page = await context.newPage();
    await enterRoom(page, { evening });
    const result = {
      box: await pipSvg(page).boundingBox(),
      variant: await page.locator(".scene .room-backdrop").getAttribute("data-variant"),
      background: await page.locator(".scene .room-backdrop").evaluate((el) => el.style.background),
      tint: await page.locator(".room-tint").getAttribute("class"),
      stage: await page.locator(".pip-stage").getAttribute("style")
    };
    await context.close();
    return result;
  };
  const day = await measure(false);
  const night = await measure(true);
  expect(day.variant).toBe("day");
  expect(night.variant).toBe("night");
  expect(day.background).not.toBe(night.background);
  expect(day.tint).not.toBe(night.tint);
  expect(night.stage).toBe(day.stage);
  for (const key of ["x", "y", "width", "height"]) expect(Math.abs(night.box[key] - day.box[key])).toBeLessThanOrEqual(1);
});

test("F3 switching in the room (desktop): same bounding box before and after", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop-1280", "the in-room theme button is hidden on phones");
  await enterRoom(page);
  await page.clock.fastForward(7000);
  const before = await pipSvg(page).boundingBox();
  const backgroundBefore = await page.locator(".scene .room-backdrop").evaluate((el) => el.style.background);
  await page.getByRole("button", { name: "Evening" }).click();
  await expect(page.locator(".scene .room-backdrop")).toHaveAttribute("data-variant", "night");
  const after = await pipSvg(page).boundingBox();
  for (const key of ["x", "y", "width", "height"]) expect(Math.abs(after[key] - before[key])).toBeLessThanOrEqual(1);
  expect(await page.locator(".scene .room-backdrop").evaluate((el) => el.style.background)).not.toBe(backgroundBefore);
});

// ---------------------------------------------------------------- Sourced Facts Guard
test("G1 blank input gives empty user-voice fields", async ({ page }) => {
  await enterRoom(page, { task: "" });
  await endSessionViaStop(page);
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  const [record] = await readSessions(page);
  expect(record.task).toBe("");
  await page.getByRole("button", { name: "Start another session" }).click();
  const field = page.getByRole("textbox").first();
  await expect(field).toHaveValue("");
  await expect(field).toHaveAttribute("placeholder", /.+/);
});

test("G2 no hard-coded scores, percentages or ratings in code", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const files = walk(join(repo, "src")).filter((f) => [".js", ".jsx"].includes(extname(f)));
  const hits = [];
  for (const file of files) {
    readFileSync(file, "utf8").split("\n").forEach((line, i) => {
      const code = line.replace(/\/\/.*$/, "");
      if (/\d+(\.\d+)?\s*%/.test(code) && !/gradient|<stop/i.test(code)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
      // Since the self-rating (3 Nov) "rating" is a user input, so the word alone is fine; a rating or score
      // set to a number literal is not (that would be a made-up rating).
      if (/\b(score|rating)\b\s*[:=(]\s*\d/i.test(code) || /\b(setScore|setRating)\(\s*\d/.test(code)) hits.push(`${file}:${i + 1}: ${line.trim()}`);
    });
  }
  expect(hits).toEqual([]);
});

test("G3 every fact in the data equals its source (spec text, BPP colour)", async ({}, testInfo) => {
  desktopOnly(testInfo);
  expect(PIP_TASKS).toEqual([
    "Reading a long report and making notes.",
    "Sorting my inbox into three piles.",
    "Writing a thank-you letter.",
    "Tidying my notes from this week.",
    "Reading two chapters of my book.",
    "Planning next week's meals."
  ]);
  expect(CLOSING_QUESTION).toBe("Did you finish what you set out to do?");
  expect(CLOSING_QUESTION_BLANK_TASK).toBe("Did you get done what you wanted to?");
  expect(CLOSING_ANSWERS.map((a) => [a.label, a.pipLine])).toEqual([
    ["Yes", "You did what you said you'd do. That's the whole thing."],
    ["Part of it", "Part of it is real progress. Next time we start from there."],
    ["Not this time", "That's honest. Starting again is the skill, and you've practised it."]
  ]);
  expect(ROOMS.map((r) => [r.id, r.name, r.day, r.night])).toEqual([
    ["alps", "Swiss summer", "/images/rooms/alps-day.webp", "/images/rooms/alps-night.webp"],
    ["country", "Country views", "/images/rooms/country-day.webp", "/images/rooms/country-night.webp"],
    ["office", "Future office", "/images/rooms/office-day.webp", "/images/rooms/office-night.webp"]
  ]);
  const avatar = readFileSync(join(repo, "src/pip/avatarMarkup.js"), "utf8");
  expect(avatar).toContain("export const COMPANION_PURPLE = '#7C5CFC'");
  expect(avatar).toContain("814c68e8");
  expect(avatar).toContain("big-picture-planner");
  expect(avatar).toContain("src/components/Companion/avatarMarkup.ts");
  // Pronoun: "his" (BPP pip-mascot.spec.ts), never "her" for Pip.
  const main = readFileSync(join(repo, "src/main.jsx"), "utf8");
  expect(main).toContain("of his task");
  expect(main).not.toMatch(/\bher\b|\bshe\b/);
});

test("G4 every external link resolves: there are none to fetch", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const { out } = grep("https?://", ["src", "index.html", "public", "vite.config.js"], ["--include=*.js", "--include=*.jsx", "--include=*.html", "--include=*.css"]);
  // The only URL-shaped text is the SVG XML namespace, which is an identifier and not a link.
  const links = out.split("\n").filter(Boolean).filter((line) => !/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/.test(line));
  expect(links).toEqual([]);
});

test("G5 no credential or write paths; storage keys are the known local ones", async ({ page }, testInfo) => {
  desktopOnly(testInfo);
  const files = walk(join(repo, "src")).filter((f) => [".js", ".jsx"].includes(extname(f)));
  const source = files.map((f) => readFileSync(f, "utf8")).join("\n");
  expect(source).not.toMatch(/sessionStorage|Authorization|\btoken\b|\bDELETE\b|\bPOST\b|XMLHttpRequest|WebSocket|sendBeacon/i);
  for (const call of source.matchAll(/fetch\(([^)]*)\)/g)) expect(call[1]).not.toMatch(/https?:/);
  const keys = new Set([...source.matchAll(/(?:getItem|setItem)\(\s*("[^"]+"|[A-Z_]+)/g)].map((m) => m[1]));
  const allowed = new Set(['"studyDoubleDisplaySize"', '"studyDoubleShowViewport"', '"studyDoubleCompletedPipThreads"', '"studyDoubleTotalMinutes"', "SESSIONS_STORAGE_KEY", "ROOM_STORAGE_KEY"]);
  expect([...keys].filter((k) => !allowed.has(k))).toEqual([]);
  // Runtime: a whole session only talks to this origin.
  const external = [];
  page.on("request", (request) => {
    if (!request.url().startsWith("data:") && !request.url().startsWith("http://127.0.0.1")) external.push(request.url());
  });
  await enterRoom(page);
  await endSessionViaStop(page);
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  expect(external).toEqual([]);
});

test("G6 only listed wording changed: an unlisted edit makes the script fail", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const copy = mkdtempSync(join(tmpdir(), "sd1-g6-"));
  cpSync(join(repo, "src"), join(copy, "src"), { recursive: true });
  cpSync(join(repo, "docs"), join(copy, "docs"), { recursive: true });
  const file = join(copy, "src/data/pipThreads.js");
  const text = readFileSync(file, "utf8");
  expect(text).toContain("Then enjoy the rest of the day properly.");
  writeFileSync(file, text.replace("Then enjoy the rest of the day properly.", "Then go and enjoy the rest of the day."));
  const result = spawnSync("node", ["scripts/check-wording-diff.mjs"], { cwd: repo, env: { ...process.env, SD1_ROOT: copy }, encoding: "utf8" });
  expect(result.status).toBe(1);
  expect(result.stdout).toContain("not in table");
  expect(result.stdout).toContain("Then go and enjoy the rest of the day.");
});

test("G7 every image under public/ is listed as 'checked: no person'", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const images = walk(join(repo, "public")).filter((f) => [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".mp4", ".webm"].includes(extname(f).toLowerCase()));
  const list = readFileSync(join(repo, "docs/SD-1-KEPT-IMAGES.md"), "utf8");
  const missing = images
    .map((f) => f.slice(repo.length))
    .filter((rel) => !list.split("\n").some((line) => line.includes(rel) && line.includes("checked: no person")));
  expect(missing).toEqual([]);
  expect(existsSync(join(repo, "public/video"))).toBe(false);
});

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const full = join(dir, name);
    return statSync(full).isDirectory() ? walk(full) : [full];
  });
}

// Self-rating out of 10 (founder 3 Nov). Untouched saves nothing as a rating; a drag saves the number.
test("R1 the rating shows its question and anchors, unset until moved", async ({ page }) => {
  await enterRoom(page);
  await endSessionViaStop(page);
  await expect(page.getByText("What do you give yourself out of 10 for your session today?")).toBeVisible();
  await expect(page.locator(".rating-value")).toHaveText("Drag to rate");
  for (const t of ["Hard one, but I showed up", "Did OK", "Absolutely smashed it"]) await expect(page.locator(".rating-anchors")).toContainText(t);
  expect(await readSessions(page)).toHaveLength(0);
});

test("R2 moving the slider saves that rating; 10 shows its anchor", async ({ page }) => {
  await enterRoom(page);
  await endSessionViaStop(page);
  await page.locator("#session-rating-input").fill("8");
  await expect(page.locator(".rating-value")).toHaveText("8/10");
  let records = await readSessions(page);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ rating: 8, answer: null, task: TASK });
  await page.locator("#session-rating-input").fill("10");
  await expect(page.locator(".rating-value")).toHaveText("10/10 · Absolutely smashed it");
  records = await readSessions(page);
  expect(records).toHaveLength(1);
  expect(records[0].rating).toBe(10);
});

test("R3 rating and answer land in one record, in either order", async ({ page }) => {
  await enterRoom(page);
  await endSessionViaStop(page);
  await page.locator("#session-rating-input").fill("7");
  await page.getByRole("button", { name: "Yes", exact: true }).click();
  const records = await readSessions(page);
  expect(records).toHaveLength(1);
  expect(records[0]).toMatchObject({ rating: 7, answer: "yes" });
});

test("R4 tapping the slider where it rests (5) still counts as a rating of 5", async ({ page }) => {
  await enterRoom(page);
  await endSessionViaStop(page);
  await page.locator("#session-rating-input").dispatchEvent("pointerup");
  await expect(page.locator(".rating-value")).toHaveText("5/10 · Did OK");
  expect((await readSessions(page))[0].rating).toBe(5);
});

test("G2-mutant: a hard-coded rating is caught", async ({}, testInfo) => {
  desktopOnly(testInfo);
  const rule = (code) => /\b(score|rating)\b\s*[:=(]\s*\d/i.test(code) || /\b(setScore|setRating)\(\s*\d/.test(code);
  expect(rule("upsertSessionRecord(d, { rating: 7 })")).toBe(true);
  expect(rule("setRating(9)")).toBe(true);
  expect(rule("setRating(Number(event.target.value))")).toBe(false);
});

