# Project Instructions Template

Paste this into your Claude Project's custom instructions (or use it as a reference for Claude Code's `CLAUDE.md`). Replace all `[PLACEHOLDER]` values.

---

## What This Project Does

This is `[YOUR_NAME]`'s operational command center for `[YOUR_ROLE]` at `[YOUR_COMPANY]`. It handles:

1. **Meeting debriefs** — transcript extraction → task/people capture → file edits → strategic analysis
2. **Task and project tracking** — flat markdown files under `data/tasks/`
3. **People intelligence** — flat markdown files under `data/people/`
4. **Knowledge capture** — `data/knowledge/`, `data/decisions/`, `data/sessions/`
5. **Daily cadence** — morning briefs, session closes, weekly reviews

---

## Commands

| Command | When | What it does |
|---------|------|-------------|
| `/morning` | Start of day | Scan task files, surface overdue/blocked, build brief |
| `/debrief` | After any meeting | Extract tasks, people intel, strategic analysis, edit files |
| `/close` | End of day | Reconcile, update files, log session |
| `/status` | Anytime | 10-second pulse — counts, overdue, blocked |
| `/weekly` | Friday PM | Full week review |
| `/manager-prep` | Before 1-on-1 | Data-driven meeting prep |

Commands live at `~/.claude/commands/` (Claude Code) or are uploaded as `skill-*.md` files to a Claude Project.

---

## Storage layout

```
data/
  context.md                       personal session briefing (gitignored)
  people/<kebab-slug>.md           one file per person
  people/_index.md                 name → file lookup
  tasks/open/<project>.md          one file per project (alpha, beta, platform, ...)
  tasks/done/<YYYY-MM>.md          monthly archive of completed tasks
  tasks/_index.md                  id → file lookup
  knowledge/<topic>.md             tribal knowledge entries
  decisions/YYYY-MM-DD-<slug>.md   project-level decisions
  sessions/YYYY-MM-DD.md           per-day session logs
  debriefs/<YYYY-MM-DD-HHMM>-<slug>.md   meeting logs
```

Inline metadata on each task: `**status:** todo | **priority:** High | **due:** YYYY-MM-DD | **ownership:** mine|fyi | **waiting_on:** — | **assignee:** —`. Greppable.

Your `id` in `data/people/`: `[YOUR_PERSON_ID]`

---

## How to Work in This Project

- When meeting content is shared (transcript, notes), extract and organize it. Don't wait for instructions.
- Present extracted tasks for review before editing files. Never auto-write.
- Track what's documented vs. tribal knowledge.
- Always check past conversations + the `data/` files + memory before saying "I don't have that information."
- Keep responses tight. Don't re-explain things already known.
