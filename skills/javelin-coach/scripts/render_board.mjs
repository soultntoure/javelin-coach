#!/usr/bin/env node
// Fill the Javelin board template with board data and, if Chrome or Edge is
// installed, screenshot it to a PNG. No npm dependencies.
//
// Usage: node render_board.mjs <board.json> <out.html> [out.png]

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { execFileSync } from "node:child_process";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const DATA_TAG = /(<script id="board-data" type="application\/json">)[\s\S]*?(<\/script>)/;

export function injectBoardData(html, data) {
  if (!DATA_TAG.test(html)) throw new Error('template has no <script id="board-data"> tag');
  const json = JSON.stringify(data, null, 2).replace(/</g, "\\u003c");
  return html.replace(DATA_TAG, (_, open, close) => `${open}\n${json}\n${close}`);
}

export function findBrowser() {
  const env = process.env;
  const candidates = [
    env.JAVELIN_BROWSER,
    join(env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)", "Microsoft/Edge/Application/msedge.exe"),
    join(env.PROGRAMFILES || "C:/Program Files", "Microsoft/Edge/Application/msedge.exe"),
    join(env.PROGRAMFILES || "C:/Program Files", "Google/Chrome/Application/chrome.exe"),
    join(env["PROGRAMFILES(X86)"] || "C:/Program Files (x86)", "Google/Chrome/Application/chrome.exe"),
    env.LOCALAPPDATA && join(env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe"),
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
    "/usr/bin/microsoft-edge",
  ];
  return candidates.find((p) => p && existsSync(p)) || null;
}

function screenshot(browser, htmlPath, pngPath) {
  const url = pathToFileURL(resolve(htmlPath)).href + "#export";
  // A fresh profile per run, so an open or stuck browser window cannot block us.
  const profile = mkdtempSync(join(tmpdir(), "javelin-browser-"));
  try {
    execFileSync(browser, [
    `--user-data-dir=${profile}`,
    "--no-first-run",
    "--disable-extensions",
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--force-device-scale-factor=1",
    "--window-size=2400,1500",
    `--screenshot=${resolve(pngPath)}`,
    url,
    ], { stdio: "ignore", timeout: 90_000 });
  } finally {
    try { rmSync(profile, { recursive: true, force: true }); } catch {}
  }
}

function main([dataPath, htmlOut, pngOut]) {
  if (!dataPath || !htmlOut) {
    console.error("Usage: node render_board.mjs <board.json> <out.html> [out.png]");
    process.exit(2);
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const template = readFileSync(join(here, "../assets/board.html"), "utf8");
  const data = JSON.parse(readFileSync(dataPath, "utf8"));
  writeFileSync(htmlOut, injectBoardData(template, data));
  console.log(`HTML board: ${resolve(htmlOut)}`);
  if (!pngOut) return;
  const browser = findBrowser();
  if (!browser) {
    console.log("No Chrome/Edge found: open the HTML and use its 'Download PNG' button instead.");
    return;
  }
  try {
    screenshot(browser, htmlOut, pngOut);
  } catch (err) {
    console.log(`Browser screenshot failed (${err.code || err.message}).`);
  }
  console.log(existsSync(pngOut) ? `PNG board: ${resolve(pngOut)}` : "Screenshot failed: use the HTML 'Download PNG' button.");
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main(process.argv.slice(2));
}
