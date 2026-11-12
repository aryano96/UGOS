#!/usr/bin/env node
// Development helper. NOT part of the submitted Skill package.
// Renders the fictional agreement documents of the test set to PDF.
import { createRequire } from "node:module";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(root, "test-corpus", "harbor-cafe", "agreements");
const esc = (value) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const inline = (text) => esc(text).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

function toHtml(markdown) {
  const out = [];
  let table = false;
  for (const line of markdown.split("\n")) {
    if (table && !line.startsWith("|")) { out.push("</table>"); table = false; }
    if (line.startsWith("# ")) out.push(`<h1>${inline(line.slice(2))}</h1>`);
    else if (line.startsWith("## ")) out.push(`<h2>${inline(line.slice(3))}</h2>`);
    else if (line.startsWith("|")) {
      if (/^\|[-| ]+\|$/.test(line)) continue;
      if (!table) { out.push("<table>"); table = true; }
      out.push("<tr>" + line.split("|").slice(1, -1).map((cell) => `<td>${inline(cell.trim())}</td>`).join("") + "</tr>");
    } else if (line.trim()) out.push(`<p>${inline(line)}</p>`);
  }
  if (table) out.push("</table>");
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><style>
@page{size:A4;margin:22mm}body{font-family:Georgia,serif;font-size:11.5pt;line-height:1.5}
h1{font-size:20pt}h2{font-size:12.5pt;margin-top:14pt}
table{border-collapse:collapse}td{border:1px solid #999;padding:4pt 10pt}</style></head><body>${out.join("\n")}</body></html>`;
}

const { chromium } = createRequire(import.meta.url)("playwright");
const browser = await chromium.launch();
for (const name of fs.readdirSync(dir).filter((file) => file.endsWith(".md"))) {
  const htmlPath = path.join(os.tmpdir(), `corpus-${process.pid}-${name}.html`);
  fs.writeFileSync(htmlPath, toHtml(fs.readFileSync(path.join(dir, name), "utf8")));
  const page = await browser.newPage();
  await page.goto("file://" + htmlPath);
  const pdfPath = path.join(dir, name.replace(/\.md$/, ".pdf"));
  await page.pdf({ path: pdfPath, format: "A4" });
  await page.close();
  fs.rmSync(htmlPath, { force: true });
  console.log("built", path.relative(root, pdfPath), fs.statSync(pdfPath).size, "bytes");
}
await browser.close();
