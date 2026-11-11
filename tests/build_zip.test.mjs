// Tests for the Claude.ai skill ZIP builder. Run: node --test tests/
import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { inflateRawSync } from "node:zlib";

const here = dirname(fileURLToPath(import.meta.url));
const script = resolve(here, "../scripts/build-zip.mjs");

// Read entry names and contents from the central directory.
function readZip(buf) {
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(eocd >= 0, "no end-of-central-directory record");
  const count = buf.readUInt16LE(eocd + 10);
  let p = buf.readUInt32LE(eocd + 16);
  const entries = new Map();
  for (let i = 0; i < count; i++) {
    assert.equal(buf.readUInt32LE(p), 0x02014b50, "bad central directory header");
    const method = buf.readUInt16LE(p + 10);
    const size = buf.readUInt32LE(p + 20);
    const nameLen = buf.readUInt16LE(p + 28);
    const extraLen = buf.readUInt16LE(p + 30);
    const commentLen = buf.readUInt16LE(p + 32);
    const local = buf.readUInt32LE(p + 42);
    const name = buf.subarray(p + 46, p + 46 + nameLen).toString("utf8");
    const dataStart = local + 30 + buf.readUInt16LE(local + 26) + buf.readUInt16LE(local + 28);
    const raw = buf.subarray(dataStart, dataStart + size);
    entries.set(name, method === 8 ? inflateRawSync(raw) : raw);
    p += 46 + nameLen + extraLen + commentLen;
  }
  return entries;
}

const out = join(mkdtempSync(join(tmpdir(), "javelin-zip-")), "javelin-coach.zip");
execFileSync(process.execPath, [script, out], { stdio: "pipe" });
const entries = readZip(readFileSync(out));
const names = [...entries.keys()];

test("every entry sits under javelin-coach/ with forward slashes", () => {
  assert.ok(names.length > 5);
  for (const n of names) {
    assert.ok(n.startsWith("javelin-coach/"), n);
    assert.ok(!n.includes("\\"), n);
  }
});

test("SKILL.md is at javelin-coach/SKILL.md and matches the source", () => {
  const skill = readFileSync(resolve(here, "../skills/javelin-coach/SKILL.md"));
  assert.ok(entries.has("javelin-coach/SKILL.md"));
  assert.ok(entries.get("javelin-coach/SKILL.md").equals(skill));
});

test("evals are excluded, references, assets and scripts are kept", () => {
  assert.ok(!names.some((n) => n.includes("/evals/")));
  for (const n of [
    "javelin-coach/references/glossary.md",
    "javelin-coach/assets/board.html",
    "javelin-coach/scripts/render_board.mjs",
  ]) assert.ok(entries.has(n), n);
});

test("SKILL.md frontmatter only uses fields Claude.ai accepts", () => {
  const text = entries.get("javelin-coach/SKILL.md").toString("utf8");
  const front = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1];
  const keys = front.split(/\r?\n/).filter((l) => /^[A-Za-z-]+:/.test(l)).map((l) => l.split(":")[0]);
  const allowed = ["name", "description", "license", "compatibility", "metadata", "allowed-tools"];
  for (const k of keys) assert.ok(allowed.includes(k), `field not allowed: ${k}`);
  assert.ok(keys.includes("name") && keys.includes("description"));
});
