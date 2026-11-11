# Changelog

## 1.0.1 (2026-11-11)

- Install commands for Codex: the plugin marketplace (`codex plugin marketplace add`, then `codex plugin add`) or a manual copy to `~/.agents/skills/`. No change to the skill itself.

## 1.0.0 (2026-11-11)

First release.

- Four modes: Start (8 steps), Interview kit, Check (7-point checklist) and Result (Persevere / Pivot / Retest).
- Sticky-note board image (PNG) in English or Arabic (right-to-left), rendered with Node and headless Chrome or Edge, with an HTML fallback.
- Claude Code plugin and single-plugin marketplace.
- `scripts/build-zip.mjs` builds the Claude.ai / desktop upload ZIP.
- Eval suite of 5 cases for `claude plugin eval`.
