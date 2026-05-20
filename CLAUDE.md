# CLAUDE.md

This file gives Claude Code working knowledge of this repo. Read first; then act.

## What this repo is

Template/framework for a 3-layer operational system that runs on top of Claude (CLI or Claude Projects web app). Editing files here updates the framework — users deploy by cloning the repo and pointing Claude at their local copy.

There is **no build, lint, test, or package manager** in this repo. No `package.json`, no CI. Don't hunt for commands. The "runtime" is Claude + flat markdown files.

## Architecture: 3 layers

### Layer 1 — Session context (your `CLAUDE.md` or `data/context.md`)
Your personal session briefing lives in one of:
- **Claude Code:** your project's `CLAUDE.md` or a referenced `data/context.md` (gitignored).
- **Claude Projects (web app):** the project's custom instructions field.

**Onboarding:** if `data/context.md` doesn't exist on first session, proactively suggest the user run `/setup` — that skill (defined in `skills/skill-setup.md`) interviews them for the essentials and writes the file. Don't run the interview unprompted; just point them at the command. Template + setup instructions also in README.md for users who prefer manual editing.

### Layer 2 — `data/` (live state)
Flat markdown files for tasks, people, knowledge, decisions, sessions, and debrief logs. No external infra.

```
data/
  context.md                       personal session briefing (optional; gitignored)
  people/<kebab-slug>.md           one file per person; frontmatter + notes
  people/_index.md                 name → file lookup
  tasks/open/<project>.md          open tasks grouped by project
  tasks/done/<YYYY-MM>.md          monthly archive
  tasks/_index.md                  id → file lookup
  knowledge/<topic>.md             tribal-knowledge entries (one per topic)
  knowledge/_index.md
  decisions/YYYY-MM-DD-<slug>.md   project-level decisions (one per file)
  decisions/_index.md
  sessions/YYYY-MM-DD.md           per-day session logs (written by /close)
  sessions/_index.md
  debriefs/<YYYY-MM-DD-HHMM>-<slug>.md   meeting logs (written by /debrief)
```

Task entry format:
```
### #<id> — <title>

**status:** todo | **priority:** High | **due:** YYYY-MM-DD | **ownership:** mine|fyi | **waiting_on:** — | **assignee:** —
**source:** debrief / <meeting label> / <slug-date>
**tags:** <comma list>
**dates:** created <YYYY-MM-DD> · updated <YYYY-MM-DD>

**Description:**
<text>

**Notes:**
<text>

---
```

Inline-metadata pattern is greppable on purpose (`grep '^### #16 '` finds a task by id; `grep '\*\*status:\*\* todo' open/*.md` finds all open).

Person file format:
```
---
id: <n>
name: <Full Name>
nicknames: <optional>
area: <area>
expertise: <text>
reliability: watching|trusted|...
created_at: <ts>
updated_at: <ts>
---

<notes body, append [YYYY-MM-DD] dated entries over time>
```

All of `data/` is gitignored except `data/README.md` (per `.gitignore` pattern `data/*` + `!data/README.md`) so the repo can be cloned without leaking personal content. Force-add specific generic entries with `git add -f data/<path>` if you want them shared.

### Layer 3 — `skills/` (slash commands)
Template versions of the slash commands. Each defines: trigger, data to read, output template, rules.

For Claude Code (CLI): run `scripts/bootstrap.sh` to symlink each `skills/skill-<name>.md` into `~/.claude/commands/<name>.md` (strips the `skill-` prefix). Re-run any time you add a new skill.

For Claude Projects (web app): upload the `skill-*.md` files as project files.

**Cross-layer invariant:** if you change the task or person file format, update every skill that reads or writes it. If you add a new `data/` subdirectory, update `scripts/bootstrap.sh` to create it on bootstrap and document it here.

## File naming convention

Claude Projects has no folders — file prefixes group by purpose. Useful when uploading multiple files into a Claude Project (they sit flat side-by-side):

| Prefix | Purpose |
|--------|---------|
| `skill-` | Executable command files (slash commands) |
| `tool-` | Interactive artifacts (React components) |

In Claude Code, files live under their conceptual folders (`skills/`, `scripts/`, `data/...`) so prefixes mostly matter only for the `skill-*.md` files that get symlinked to `~/.claude/commands/`.

Content lives in your own `CLAUDE.md` / `data/context.md` (sessionContext), `data/knowledge/` (tribal knowledge), `data/decisions/` (decisions), and `data/sessions/` (session logs).

## Placeholders are intentional

Strings like `[YOUR_PERSON_ID]`, `[YOUR_NAME]`, `[YOUR_ROLE]`, `[YOUR_COMPANY]`, `[MANAGER_NAME]`, `[PLACEHOLDER]` appear in `skills/`, the README setup template, and `project-instructions-template.md`. End users fill them in at install. Do not "fix" them in the template.

**Security:** never check in live API tokens, Worker URLs with bearer tokens embedded, or other secrets. `project-instructions-template.md` historically held a live token in the working copy (now scrubbed before commit); if you see real credentials in a working copy, treat them as a working-tree mistake and replace with placeholders before committing.

## Style of skill files

Terse, output-shaped contracts — not prose. Each defines: trigger, data location, exact steps, exact output template (often a code-block mockup), rules ("no pleasantries", "approval before file edits"). Match this voice when editing or adding.

## `data/debriefs/` folder convention

Markdown files recording what each `/debrief` processed. Naming (sorts chronologically by `ls`):

```
<YYYY-MM-DD>-<HHMM>-<slug>.md
```

Slug rules:
- DSU: `<team>-dsu` (e.g. `alpha-dsu`, `platform-dsu`)
- 1:1: `1on1-<firstname>`
- Other: short descriptive (e.g. `ai-tooling`, `sprint-planning`)

Time = 24-hour `HHMM` from transcript's earliest absolute timestamp. If transcript only has relative offsets, ask the user or use a reasonable default for that meeting's typical slot.

`data/debriefs/` is gitignored (personal meeting content).

Debrief log structure (filled by `/debrief` Step 6):
```markdown
# <Meeting name> — <YYYY-MM-DD HH:MM>

Source label: <e.g. "Alpha standup">
Slug: <slug>

## People added
- [Name](../people/<slug>.md) (id <n>)

## People updated
- [Name](../people/<slug>.md) (id <n>) — one-line summary

## Tasks added
- #<id> — <title> [→ tasks/open/<project>.md]

## Tasks updated
- #<id> — <title> [status change] [→ tasks/done/<YYYY-MM>.md or stayed open]

## Strategic notes
<bottom-of-debrief content for replay value>
```

Relative links inside debrief logs use `../people/`, `../tasks/`, `../knowledge/` — debrief log lives at `data/debriefs/<file>.md`, so `..` resolves to `data/`.

## Approval gate for file edits

`/debrief`, `/close`, and `/manager-prep` all involve file edits to `data/`. **Never apply edits without showing the plan first.** Present the diff (or numbered list of changes), wait for explicit approval, then apply. This is the most important behavioral rule in the system — once tasks/people files are wrong, they corrupt downstream `/morning` briefs.

## Migration history

- **YYYY-MM-DD:** <explanation of migration>