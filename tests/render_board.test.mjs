// Tests for the javelin-coach board renderer. Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync, existsSync, statSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const skill = resolve(here, "../skills/javelin-coach");
const script = join(skill, "scripts/render_board.mjs");
const example = join(skill, "assets/example-board.json");

const { injectBoardData, findBrowser } = await import(
  "file:///" + script.replace(/\\/g, "/")
);

test("injectBoardData puts the JSON inside the data script tag", () => {
  const html = '<script id="board-data" type="application/json">{}</script>';
  const out = injectBoardData(html, { project: "Yakin" });
  assert.match(out, /"project": "Yakin"/);
  assert.equal((out.match(/<script id="board-data"/g) || []).length, 1);
});

test("injectBoardData escapes '<' so text cannot close the script tag", () => {
  const html = '<script id="board-data" type="application/json">{}</script>';
  const out = injectBoardData(html, { project: "</script><b>x" });
  assert.ok(!out.includes("</script><b>"));
  assert.match(out, /\\u003c\/script>/);
});

test("injectBoardData fails loudly when the template has no data tag", () => {
  assert.throws(() => injectBoardData("<html></html>", {}), /board-data/);
});

test("findBrowser returns a path that exists, or null", () => {
  const b = findBrowser();
  assert.ok(b === null || existsSync(b));
});

test("CLI writes the HTML board, and a PNG when a browser is available", () => {
  const out = mkdtempSync(join(tmpdir(), "javelin-"));
  const htmlPath = join(out, "board.html");
  const pngPath = join(out, "board.png");
  execFileSync(process.execPath, [script, example, htmlPath, pngPath], { stdio: "pipe" });
  const html = readFileSync(htmlPath, "utf8");
  assert.match(html, /Yakin/);
  if (findBrowser()) {
    assert.ok(existsSync(pngPath), "PNG should exist when a browser is found");
    assert.ok(statSync(pngPath).size > 50_000, "PNG looks too small to be the board");
  }
});
