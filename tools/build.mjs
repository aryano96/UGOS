#!/usr/bin/env node
// Development helper. NOT part of the submitted Skill package.
// Checks the Skill with the official checker, builds the ZIP, audits it,
// builds the proposal PDF, and writes docs/audit-report.md.
//
// Usage:  node tools/build.mjs --kit /path/to/uliya-skill-kit
//    or:  KIT_DIR=/path/to/uliya-skill-kit node tools/build.mjs

import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillName = "said-vs-signed";
const skillDir = path.join(root, skillName);
const distDir = path.join(root, "dist");
const zipPath = path.join(distDir, `${skillName}.zip`);
const proposalMd = path.join(root, "proposal", "proposal.md");
const teamJson = path.join(root, "proposal", "team.json");

const LIMITS = {
  zipBytes: 10 * 1024 * 1024,
  totalBytes: 10 * 1024 * 1024,
  fileBytes: 1024 * 1024,
  files: 100,
  nameMin: 2,
  nameMax: 64,
  descriptionMax: 1024,
  proposalWords: 500,
  proposalPdfBytes: 1024 * 1024
};

const results = [];
let failed = false;
function record(area, check, ok, detail) {
  results.push({ area, check, ok, detail });
  if (!ok) failed = true;
  console.log(`${ok ? "PASS" : "FAIL"}  [${area}] ${check}${detail ? " - " + detail : ""}`);
}
const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

function findKit() {
  const flag = process.argv.indexOf("--kit");
  const candidates = [
    flag !== -1 ? process.argv[flag + 1] : null,
    process.env.KIT_DIR,
    path.join(root, "uliya-skill-kit"),
    path.join(root, "..", "uliya-skill-kit")
  ].filter(Boolean);
  return candidates.find((dir) => fs.existsSync(path.join(dir, "scripts", "check-skill.mjs"))) ?? null;
}

function walk(dir, base = dir) {
  const out = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true }).sort((a, b) => a.name.localeCompare(b.name))) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full, base));
    else out.push({ rel: path.relative(base, full).split(path.sep).join("/"), full, entry });
  }
  return out;
}

function runChecker(kit, target) {
  let stdout;
  try {
    stdout = execFileSync("node", [path.join(kit, "scripts", "check-skill.mjs"), target], { encoding: "utf8" });
  } catch (error) {
    stdout = error.stdout?.toString() ?? "";
  }
  return JSON.parse(stdout);
}

// ---------------------------------------------------------------- 1. checker
const kit = findKit();
let checkerSummary = "official checker not run (kit not found)";
if (!kit) {
  record("checker", "official static checker available", false, "pass --kit <path to uliya-skill-kit>");
} else {
  const result = runChecker(kit, skillDir);
  checkerSummary = `${result.status}; errors ${result.summary.errors}, warnings ${result.summary.warnings}`;
  record("checker", "official static checker on source folder", result.status === "static-pass", checkerSummary);
  for (const item of result.diagnostics) console.log(`      ${item.severity} ${item.code} ${item.file ?? ""}:${item.line ?? ""}`);
}

// ---------------------------------------------------------------- 2. package audit
const files = walk(skillDir);
const totalBytes = files.reduce((sum, file) => sum + fs.statSync(file.full).size, 0);
record("package", "only SKILL.md and references/*.md present",
  files.every((file) => file.rel === "SKILL.md" || /^references\/[A-Za-z0-9._-]+\.md$/.test(file.rel)),
  files.map((file) => file.rel).join(", "));
record("package", "no symbolic links", files.every((file) => !fs.lstatSync(file.full).isSymbolicLink()));
record("package", `file count <= ${LIMITS.files}`, files.length <= LIMITS.files, `${files.length} files`);
const largest = files.map((file) => ({ rel: file.rel, size: fs.statSync(file.full).size })).sort((a, b) => b.size - a.size)[0];
record("package", "each file <= 1 MB", largest.size <= LIMITS.fileBytes, `largest ${largest.rel} = ${largest.size} bytes`);
record("package", "uncompressed total <= 10 MB", totalBytes <= LIMITS.totalBytes, `${totalBytes} bytes`);

const skillSource = fs.readFileSync(path.join(skillDir, "SKILL.md"), "utf8");
const frontmatter = skillSource.match(/^---\n([\s\S]*?)\n---\n/);
const fmName = frontmatter?.[1].match(/^name:\s*(.+)$/m)?.[1].trim() ?? "";
const fmDescription = frontmatter?.[1].match(/^description:\s*(.+)$/m)?.[1].trim() ?? "";
const fmKeys = (frontmatter?.[1] ?? "").split("\n").map((line) => line.split(":")[0]);
record("frontmatter", "only name and description", fmKeys.length === 2 && fmKeys.includes("name") && fmKeys.includes("description"), fmKeys.join(", "));
record("frontmatter", "name is lowercase hyphenated, 2-64 chars, equals folder name",
  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(fmName) && fmName.length >= LIMITS.nameMin && fmName.length <= LIMITS.nameMax && fmName === skillName,
  `"${fmName}" (${fmName.length} chars)`);
record("frontmatter", "description <= 1,024 chars", [...fmDescription].length > 0 && [...fmDescription].length <= LIMITS.descriptionMax, `${[...fmDescription].length} chars`);

for (const heading of ["Goal", "Required input", "Generation-time capability evidence", "Workflow", "Completion and failure"]) {
  record("content", `SKILL.md has section "# ${heading}"`, new RegExp(`^# ${heading}\\s*$`, "m").test(skillSource));
}
for (const state of ["completed", "failed", "cancelled", "waiting_user", "waiting_approval"]) {
  record("content", `handles state ${state}`, skillSource.includes(state));
}
const delegateLines = skillSource.split("\n").filter((line) => line.includes("delegate --"));
const targets = [...new Set(delegateLines.map((line) => line.match(/--target\s+([a-z-]+)/)?.[1]))];
record("content", "delegations found and all targets are registered experts",
  delegateLines.length > 0 && targets.every((target) => ["file-agent", "document-agent", "knowledge-agent"].includes(target)),
  `${delegateLines.length} delegations to ${targets.join(", ")}`);

// links
const linked = new Set([...skillSource.matchAll(/\]\((references\/[A-Za-z0-9._/-]+\.md)(?:#[^)\s]+)?\)/g)].map((match) => match[1]));
const referenceFiles = files.filter((file) => file.rel !== "SKILL.md").map((file) => file.rel);
record("links", "every reference file is linked directly from SKILL.md", referenceFiles.every((rel) => linked.has(rel)),
  referenceFiles.filter((rel) => !linked.has(rel)).join(", ") || `${referenceFiles.length} of ${referenceFiles.length} linked`);
record("links", "every SKILL.md link resolves to a file", [...linked].every((rel) => referenceFiles.includes(rel)),
  [...linked].filter((rel) => !referenceFiles.includes(rel)).join(", ") || `${linked.size} links ok`);
const brokenInner = [];
for (const file of files) {
  const source = fs.readFileSync(file.full, "utf8");
  for (const match of source.matchAll(/\]\(([^)\s#]+)(?:#[^)\s]*)?\)/g)) {
    const target = match[1];
    if (/^[a-z]+:/i.test(target)) { brokenInner.push(`${file.rel} -> external ${target}`); continue; }
    const resolved = path.join(path.dirname(file.full), target);
    if (!fs.existsSync(resolved)) brokenInner.push(`${file.rel} -> ${target}`);
  }
}
record("links", "all Markdown links are internal and resolve", brokenInner.length === 0, brokenInner.join("; ") || "ok");

// prohibited content
const patterns = [
  ["unfinished marker", /\bTODO\b|\bTBD\b|replace-with-|\bFIXME\b|lorem ipsum/i],
  ["URL", /https?:\/\//i],
  ["email address", /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/],
  ["key or secret literal", /-----BEGIN [A-Z ]*PRIVATE KEY-----|\bsk-[A-Za-z0-9]{16,}|\bAKIA[0-9A-Z]{16}\b|\bghp_[A-Za-z0-9]{20,}|\b(?:password|passwd|api[_-]?key|secret|token)\s*[:=]\s*\S+/i],
  ["phone number", /(?:\+\d{1,3}[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}\b/],
  ["code fence with a runtime language", /^```\s*(?:bash|sh|shell|python|py|javascript|js|node|typescript|ts)\b/im],
  ["non-printable or replacement character", /[\u0000-\u0008\u000B\u000C\u000E-\u001F�]/]
];
for (const [label, pattern] of patterns) {
  const hits = files.filter((file) => pattern.test(fs.readFileSync(file.full, "utf8"))).map((file) => file.rel);
  record("prohibited", `no ${label}`, hits.length === 0, hits.join(", ") || "none found");
}
for (const heading of ["Third-party components", "Principal functionality developed", "AI tools used", "External services and data flows"]) {
  record("disclosures", `disclosures.md covers "${heading}"`, fs.readFileSync(path.join(skillDir, "references", "disclosures.md"), "utf8").includes(heading));
}

// ---------------------------------------------------------------- 3. ZIP
fs.mkdirSync(distDir, { recursive: true });
fs.rmSync(zipPath, { force: true });
for (const file of files) fs.utimesSync(file.full, new Date("2026-11-12T00:00:00Z"), new Date("2026-11-12T00:00:00Z"));
execFileSync("zip", ["-r", "-X", "-q", zipPath, skillName, "-x", "*.DS_Store"], { cwd: root });
const zipBytes = fs.statSync(zipPath).size;
record("zip", "ZIP <= 10 MB", zipBytes <= LIMITS.zipBytes, `${zipBytes} bytes`);
const listing = execFileSync("unzip", ["-Z1", zipPath], { encoding: "utf8" }).trim().split("\n");
const zipFiles = listing.filter((entry) => !entry.endsWith("/"));
record("zip", "ZIP holds exactly the package files under one top folder",
  zipFiles.length === files.length && zipFiles.every((entry) => entry.startsWith(`${skillName}/`) && files.some((file) => `${skillName}/${file.rel}` === entry)),
  `${zipFiles.length} files: ${zipFiles.join(", ")}`);
const securityLines = execFileSync("unzip", ["-Zv", zipPath], { encoding: "utf8" }).match(/file security status:\s+.*/g) ?? [];
record("zip", "ZIP is not password protected", securityLines.length > 0 && securityLines.every((line) => /not encrypted/.test(line)),
  `${securityLines.filter((line) => /not encrypted/.test(line)).length} of ${securityLines.length} entries not encrypted`);
const extractDir = fs.mkdtempSync(path.join(os.tmpdir(), "svs-zip-"));
execFileSync("unzip", ["-q", zipPath, "-d", extractDir]);
const extracted = walk(path.join(extractDir, skillName));
const extractedBytes = extracted.reduce((sum, file) => sum + fs.statSync(file.full).size, 0);
record("zip", "extracted package is byte-identical to source",
  extracted.length === files.length && extracted.every((file) => sha256(fs.readFileSync(file.full)) === sha256(fs.readFileSync(path.join(skillDir, file.rel)))),
  `${extracted.length} files, ${extractedBytes} bytes uncompressed`);
if (kit) {
  const result = runChecker(kit, path.join(extractDir, skillName));
  record("zip", "official static checker on the extracted ZIP", result.status === "static-pass", `${result.status}; errors ${result.summary.errors}, warnings ${result.summary.warnings}`);
}
fs.rmSync(extractDir, { recursive: true, force: true });

// ---------------------------------------------------------------- 4. proposal
const proposalSource = fs.readFileSync(proposalMd, "utf8");
const answersBlock = proposalSource.split("<!-- ANSWERS")[1]?.split("-->").slice(1).join("-->").split("<!-- END-ANSWERS -->")[0] ?? "";
const answers = [];
for (const chunk of answersBlock.split(/^## /m).slice(1)) {
  const [heading, ...rest] = chunk.split("\n");
  const text = rest.join("\n").trim();
  const words = text.split(/\s+/).filter((token) => /[A-Za-z0-9]/.test(token)).length;
  answers.push({ heading: heading.trim(), text, words });
}
const answerWords = answers.reduce((sum, answer) => sum + answer.words, 0);
const headingWords = answers.reduce((sum, answer) => sum + answer.heading.split(/\s+/).filter((token) => /[A-Za-z0-9]/.test(token)).length, 0);
record("proposal", "ten answers present", answers.length === 10, `${answers.length} answers`);
record("proposal", "every answer is non-empty", answers.every((answer) => answer.words > 0));
record("proposal", "ten answers total <= 500 words", answerWords <= LIMITS.proposalWords,
  `${answerWords} words in answers (${answerWords + headingWords} if the question headings are also counted)`);

const team = JSON.parse(fs.readFileSync(teamJson, "utf8"));
const teamComplete = Boolean(team.representative) && team.members.length > 0 && team.members.every((member) => member.name && member.signature);
const esc = (value) => String(value ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const blank = (value, width = 46) => value ? esc(value) : `<span class="blank" style="width:${width}mm"></span>`;
const teamBlock = `
<p>${esc(team.declaration)}</p>
<table class="team">
<tr><th>Team name</th><td colspan="3">${blank(team.team_name, 90)}</td></tr>
<tr><th>Representative</th><td colspan="3">${blank(team.representative, 90)}</td></tr>
<tr><th>Member</th><th>Country / region of residence</th><th>Electronic signature</th><th>Date</th></tr>
${team.members.map((member) => `<tr><td>${blank(member.name, 38)}</td><td>${blank(member.location, 34)}</td><td>${blank(member.signature, 38)}</td><td>${blank(member.date, 20)}</td></tr>`).join("\n")}
</table>`;

function mdToHtml(markdown) {
  const out = [];
  let list = false;
  const inline = (text) => esc(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");
  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    if (line.startsWith("<!--")) continue;
    if (list && !line.startsWith("- ")) { out.push("</ul>"); list = false; }
    if (line.startsWith("# ")) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) out.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith("- ")) { if (!list) { out.push("<ul>"); list = true; } out.push(`<li>${inline(line.slice(2))}</li>`); }
    else if (line === "{{TEAM_BLOCK}}") out.push(teamBlock);
    else if (/^(Track|Skill name):/.test(line)) out.push(`<p class="meta">${inline(line)}</p>`);
    else if (line) out.push(`<p>${inline(line)}</p>`);
  }
  if (list) out.push("</ul>");
  return out.join("\n");
}
const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Said vs Signed - Project Proposal</title><style>
@page{size:A4;margin:15mm 16mm}
body{font-family:Helvetica,Arial,sans-serif;font-size:9.6pt;line-height:1.38;color:#16191d}
h1{font-size:19pt;margin:0 0 2pt}
h2{font-size:10.4pt;margin:9pt 0 2pt;color:#0b5d3b;page-break-after:avoid}
p{margin:0 0 4pt} p.meta{margin:0;color:#444}
ul{margin:0 0 4pt;padding-left:14pt} li{margin:0 0 2pt}
table.team{border-collapse:collapse;width:100%;margin-top:6pt;font-size:9pt}
table.team td,table.team th{border:1px solid #c5ccd3;padding:5pt 6pt;text-align:left;height:14pt}
table.team th{background:#f3f5f7;font-weight:bold}
.blank{display:inline-block;border-bottom:1px solid #777;height:10pt}
.draft{position:fixed;top:2mm;right:0;font-size:8pt;color:#a15c00;border:1px solid #a15c00;padding:1pt 5pt;border-radius:3pt}
.note{font-size:8pt;color:#555;margin-top:8pt}
</style></head><body>
${teamComplete ? "" : '<div class="draft">DRAFT - team details and signatures not yet filled in</div>'}
${mdToHtml(proposalSource)}
<p class="note">UGREEN Hackathon 2026 on AI NAS - Round 1 Project Proposal. The ten numbered answers total ${answerWords} words.</p>
</body></html>`;

const pdfName = teamComplete ? "Said-vs-Signed-Proposal.pdf" : "Said-vs-Signed-Proposal-DRAFT.pdf";
const pdfPath = path.join(distDir, pdfName);
const htmlPath = path.join(os.tmpdir(), `svs-proposal-${process.pid}.html`);
fs.writeFileSync(htmlPath, html);
let pdfBuilt = false;
let pdfPages = 0;
try {
  const { chromium } = createRequire(import.meta.url)("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.goto("file://" + htmlPath);
  await page.pdf({ path: pdfPath, format: "A4", printBackground: true });
  await browser.close();
  pdfBuilt = true;
  pdfPages = (fs.readFileSync(pdfPath).toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;
} catch (error) {
  record("proposal", "PDF built", false, "Playwright not available (run: npm install playwright, then npx playwright install chromium): " + error.message.split("\n")[0]);
}
fs.rmSync(htmlPath, { force: true });
if (pdfBuilt) {
  const pdfBytes = fs.statSync(pdfPath).size;
  record("proposal", "PDF built", true, `${pdfName}, ${pdfPages} pages`);
  record("proposal", "PDF <= 1 MB", pdfBytes <= LIMITS.proposalPdfBytes, `${pdfBytes} bytes`);
  record("proposal", "team details and signatures filled in", teamComplete, teamComplete ? "complete" : "still blank - fill proposal/team.json and rebuild");
}

// ---------------------------------------------------------------- 5. report
const now = new Date().toISOString();
const lines = [
  "# Audit report",
  "",
  `Generated by \`tools/build.mjs\` at ${now}.`,
  "",
  "These are static checks run on a development machine. They do not show that the Skill installs or runs on a UGREEN AI NAS.",
  "",
  `- Official checker: ${kit ? "uliya-skill-kit (catalog 2.0.0) - " + checkerSummary : "not run"}`,
  `- ZIP: \`dist/${skillName}.zip\`, ${zipBytes} bytes, SHA-256 \`${sha256(fs.readFileSync(zipPath))}\``,
  `- Package: ${files.length} files, ${totalBytes} bytes uncompressed`,
  `- Proposal answers: ${answerWords} words (limit ${LIMITS.proposalWords})`,
  "",
  "## Checks",
  "",
  "| Result | Area | Check | Detail |",
  "|---|---|---|---|",
  ...results.map((item) => `| ${item.ok ? "PASS" : "**FAIL**"} | ${item.area} | ${item.check} | ${String(item.detail ?? "").replace(/\|/g, "\\|")} |`),
  "",
  "## Words per proposal answer",
  "",
  "| Answer | Words |",
  "|---|---|",
  ...answers.map((answer) => `| ${answer.heading} | ${answer.words} |`),
  `| **Total** | **${answerWords}** |`,
  "",
  "## Package files",
  "",
  "| File | Bytes | SHA-256 |",
  "|---|---|---|",
  ...files.map((file) => `| ${file.rel} | ${fs.statSync(file.full).size} | \`${sha256(fs.readFileSync(file.full))}\` |`),
  ""
];
fs.mkdirSync(path.join(root, "docs"), { recursive: true });
fs.writeFileSync(path.join(root, "docs", "audit-report.md"), lines.join("\n"));
console.log(`\n${results.filter((item) => item.ok).length} passed, ${results.filter((item) => !item.ok).length} failed. Report: docs/audit-report.md`);
process.exitCode = failed ? 1 : 0;
