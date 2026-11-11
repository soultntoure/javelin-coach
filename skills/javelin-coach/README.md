# Javelin Coach · مدرب لوحة جافلين

A Claude skill that coaches your team through the Javelin Board, from choosing a customer to the decision to persevere or pivot, and draws your board as a sticky-note image.

مهارة لـ Claude ترافق فريقك في لوحة جافلين خطوة بخطوة: من اختيار العميل إلى قرار الاستمرار أو التحوّل، وترسم لوحتكم بملاحظات لاصقة.

## What it does

| Mode | Say something like | You get |
|---|---|---|
| **Start** | "We're starting the Javelin board, our idea is…" | Step-by-step customer → problem, with the solution parked. Claude drafts and ranks the assumptions and recommends the riskiest one, and you can add your own. It suggests a method and helps you lock a success criterion. |
| **Interview kit** | "Who should we interview and what do we ask?" | Screening questions, where to find people, an opener, questions in order, a note sheet and a tally line, all built from your board |
| **Check** | "Check our board before we show the coach" | A score out of 7 with a rewritten sticky for every fix |
| **Result** | "We're back from interviews, here are our notes" | Who counts and who doesn't, the tally against your locked criterion, a clear **Persevere / Pivot / Retest** verdict with reasons, a draft of the learning, and the next experiment |

Every mode can end with a **board image** (PNG) of your sticky notes.

What it won't let you do (on purpose):
- jump to the solution
- change the success criterion after seeing the results
- count AI answers or friends as evidence
- collect money from the people you interview

## Install

**Claude.ai or the Claude desktop app**
1. Download `javelin-coach.zip`.
2. Go to **Settings → Capabilities** and turn on **Code execution and file creation**.
3. Go to **Customize → Skills → + → Upload a skill** and choose the zip.
4. In a new chat, say: "Use Javelin Coach: we're starting our Javelin board…"

**Claude Code**
Copy the `javelin-coach` folder into `~/.claude/skills/` (for all your projects) or into `.claude/skills/` in one project. Then type `/javelin-coach`.

**Codex**
Copy the `javelin-coach` folder into `~/.agents/skills/`, then restart Codex.

**ChatGPT** (not as precise)
Paste the contents of `SKILL.md` into a Custom GPT's or Project's instructions, and upload the files in the `references` folder as knowledge files.

## Privacy

Don't paste interviewees' names, phone numbers or emails. Describe people by role ("restaurant owner, 12 staff").

## Credits

Based on the Javelin Experiment Board ([javelin.com](https://www.javelin.com), free to use for non-software companies). Arabic wording, the 8 steps, rules, experiment ladder, checklist and worked meal example come from the «ملتقى بناء لريادة الأعمال» student guide by **راز للاستشارات التطويرية** (Raz Development Consulting), used with the coach's permission. The worked example is our team's real journey, from a lorry marketplace to "Yakin". Made by Team Wamy. The skill's own text and code are MIT-licensed; quoted workshop material remains © راز للاستشارات التطويرية.
