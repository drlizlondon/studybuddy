// SD-1d / G6: every changed or new line of wording must be in docs/SD-1-WORDING-DIFF.md.
// Compares the data files at the base commit with the current ones (structure and
// strings), and the user-facing strings in src/main.jsx. Exit 1 on any miss.
import { execSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const BASE = process.env.SD1_BASE || "b8190052";
const gitRoot = new URL("..", import.meta.url).pathname;
const root = process.env.SD1_ROOT || gitRoot; // SD1_ROOT lets a test point the check at an edited copy
const tmp = mkdtempSync(join(tmpdir(), "sd1-"));
const gitShow = (path) => execSync(`git show ${BASE}:${path}`, { cwd: gitRoot, encoding: "utf8" });

// Renames that are structure, not wording (identifier renames only).
const KEY_RENAMES = { averyLine: "pipLine", requiresUserAnswer: "waitsForAnswer" };
const EXPORT_RENAMES = {
  AVERY_MOTIVATION_LINES: "PIP_MOTIVATION_LINES",
  AVERY_SEQUENCES: "PIP_SEQUENCES",
  AVERY_THREADS: "PIP_THREADS"
};

const unescapeCell = (cell) => cell.trim().replace(/\\\|/g, "|");
const table = readFileSync(join(root, "docs/SD-1-WORDING-DIFF.md"), "utf8");
const befores = new Set();
const afters = new Set();
const pairs = new Set();
for (const line of table.split("\n")) {
  if (!line.startsWith("|")) continue;
  const cells = line.replace(/^\|/, "").replace(/\|\s*$/, "").split(/(?<!\\)\|/).map(unescapeCell);
  if (cells.length < 2 || /^-+$/.test(cells[0]) || cells[0] === "Before") continue;
  befores.add(cells[0]);
  afters.add(cells[1]);
  pairs.add(`${cells[0]}\u0000${cells[1]}`);
}

function flatten(value, path, out) {
  if (typeof value === "string") out.set(path, value);
  else if (Array.isArray(value)) value.forEach((item, i) => flatten(item, `${path}[${i}]`, out));
  else if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) flatten(item, `${path}.${KEY_RENAMES[key] ?? key}`, out);
  } else out.set(path, JSON.stringify(value));
}

async function loadOld(path, exportNames) {
  const file = join(tmp, path.split("/").pop().replace(/\.ts$/, ".mjs"));
  writeFileSync(file, gitShow(path));
  const mod = await import(pathToFileURL(file).href);
  const out = new Map();
  for (const name of exportNames) flatten(mod[name], EXPORT_RENAMES[name] ?? name, out);
  return out;
}
async function loadNew(path, exportNames) {
  const mod = await import(pathToFileURL(join(root, path)).href);
  const out = new Map();
  for (const name of exportNames) flatten(mod[name], name, out);
  return out;
}

const failures = [];
const changed = [];

const dataFiles = [
  ["src/data/averySequences.ts", "src/data/pipSequences.js", ["AVERY_MOTIVATION_LINES", "AVERY_SEQUENCES"]],
  ["src/data/averyThreads.ts", "src/data/pipThreads.js", ["AVERY_THREADS"]]
];
for (const [oldPath, newPath, names] of dataFiles) {
  const oldMap = await loadOld(oldPath, names);
  const newMap = await loadNew(newPath, names.map((n) => EXPORT_RENAMES[n]));
  for (const key of oldMap.keys()) if (!newMap.has(key)) failures.push(`structure: ${newPath} lost ${key}`);
  for (const key of newMap.keys()) if (!oldMap.has(key)) failures.push(`structure: ${newPath} gained ${key}`);
  for (const [key, before] of oldMap) {
    const after = newMap.get(key);
    if (after === undefined || after === before) continue;
    changed.push({ file: newPath, key, before, after });
    if (!pairs.has(`${before}\u0000${after}`)) failures.push(`not in table: ${newPath} ${key}\n    before: ${before}\n    after:  ${after}`);
  }
}

// src/main.jsx: user-facing strings that are new or changed against the base.
function strings(source) {
  const found = new Set();
  const add = (text) => {
    const t = text.replace(/\s+/g, " ").trim();
    if (t.includes(" ") && /[A-Za-z]/.test(t) && /^[A-Z“"']|[.?!]$/.test(t) && !t.includes("${")) found.add(t);
  };
  for (const m of source.matchAll(/"((?:[^"\\\n]|\\.)*)"/g)) add(m[1].replace(/\\"/g, '"'));
  for (const m of source.matchAll(/`([^`]*)`/g)) add(m[1]);
  for (const m of source.matchAll(/>\s*([^<>{}\n][^<>{}]*?)\s*</g)) add(m[1]);
  return found;
}
const oldStrings = strings(gitShow("src/main.jsx"));
for (const text of strings(readFileSync(join(root, "src/main.jsx"), "utf8"))) {
  if (oldStrings.has(text)) continue;
  changed.push({ file: "src/main.jsx", key: "ui", before: "", after: text });
  if (!afters.has(text)) failures.push(`not in table: src/main.jsx\n    after: ${text}`);
}

if (process.argv.includes("--emit")) {
  const cell = (t) => t.replace(/\|/g, "\\|");
  for (const c of changed.filter((x) => x.file !== "src/main.jsx")) console.log(`| ${cell(c.before)} | ${cell(c.after)} |`);
  process.exit(0);
}
// New data files: every sentence in them must be in the table too.
for (const file of ["src/data/pipClosing.js", "src/data/pipTasks.js", "src/data/rooms.js"]) {
  let source;
  try {
    source = readFileSync(join(root, file), "utf8");
  } catch {
    continue;
  }
  const withoutComments = source.replace(/\/\/.*$/gm, "");
  for (const text of strings(withoutComments)) {
    changed.push({ file, key: "new", before: "", after: text });
    if (!afters.has(text)) failures.push(`not in table: ${file}\n    after: ${text}`);
  }
}

console.log(`${changed.length} changed or new lines found; table has ${pairs.size} rows.`);
if (failures.length) {
  console.log(`FAIL: ${failures.length} line(s) changed but not in docs/SD-1-WORDING-DIFF.md`);
  for (const f of failures) console.log("  " + f);
  process.exit(1);
}
console.log("PASS: every changed line is in the table.");
