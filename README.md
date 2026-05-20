# Personal Context OS — File-Based Operating System for Claude

A template that turns Claude Code (or a Claude Project) into a persistent operational command center. Context survives compaction, tasks live in flat markdown files, and slash commands keep everything synchronized.

Credit to [u/Available-Spend2443](https://www.reddit.com/r/Agent_AI/) for the original Claude Code OS post that inspired the framework.

---

## The Problem

Claude forgets. Long conversations get compacted. New sessions start cold. You re-explain your situation, lose decisions, repeat yourself. If you're using Claude for real work — not one-off questions — this kills you.

## The Fix: Three Layers

### Layer 1 — Your session context (your `CLAUDE.md` or Claude Project instructions)

Claude reads this at the start of every session. It tells Claude **who you are**, **what you're working on**, and **how you want to be helped**. Your personal context lives in:

- **Claude Code:** your project's `CLAUDE.md` (or `data/context.md` if you want it gitignored).
- **Claude Projects (web app):** the project's custom instructions field.

A starter template is below in the Setup Guide. Customize it for your role.

### Layer 2 — Live working data (`data/`)

Flat markdown files for task, people, and knowledge state. No database, no external infra.

```
data/
  context.md                       your personal session briefing (gitignored)
  people/<kebab-slug>.md           one file per person; frontmatter + notes
  people/_index.md                 name → file lookup
  tasks/open/<project>.md          open tasks grouped by project
  tasks/done/<YYYY-MM>.md          monthly archive of completed tasks
  tasks/_index.md                  id → file lookup
  knowledge/<topic>.md             tribal knowledge captured from /debrief
  knowledge/_index.md
  decisions/YYYY-MM-DD-<slug>.md   project-level decisions (one file each)
  decisions/_index.md
  sessions/YYYY-MM-DD.md           per-day session logs written by /close
  sessions/_index.md
  debriefs/<YYYY-MM-DD-HHMM>-<slug>.md   meeting log per /debrief run
```

Task entries are `### #<id> — <title>` followed by an inline metadata line (`**status:** todo | **priority:** High | **due:** YYYY-MM-DD | **ownership:** mine|fyi | **waiting_on:** — | **assignee:** —`) plus description + notes. Greppable. Edit with any text tool.

All of `data/` is gitignored except `data/README.md`. The repo is cloneable; your state stays local. If you want to publish a specific generic entry (e.g. a non-personal decision), `git add -f data/<path>`.

### Layer 3 — Slash commands (`skills/`)

Markdown files defining the cadence commands. Each file specifies a trigger, the data to read, the output template, and the rules.

| Command | When | What it does |
|---------|------|-------------|
| `/setup` | First time only | Interviews you and writes `data/context.md` |
| `/morning` | Start of day | Scans task files, surfaces overdue/blocked, builds phone-readable brief |
| `/debrief` | After any meeting | Extracts tasks + people intel + strategic analysis, edits files on approval. **Dedups against open tasks first** — assumes overlap = same task |
| `/close` | End of day | Reconciles what happened, flips task statuses, logs the session |
| `/status` | Anytime | 10-second pulse — counts, overdue, blocked |
| `/weekly` | Friday | Full week review — wins, gaps, leadership moves |
| `/manager-prep` | Before 1-on-1 | Data-driven prep using tasks + recent debriefs + people notes |

The cadence is what holds it together. Without Layer 3, Layers 1 and 2 drift apart.

---

## Setup Guide (Claude Code — primary path)

Requires Claude Code CLI installed.

### Step 1 — Clone

```bash
git clone <this-repo> personal-context-os
cd personal-context-os
```

### Step 2 — Run the bootstrap

```bash
scripts/bootstrap.sh
```

The script:
- Symlinks `skills/skill-*.md` into `~/.claude/commands/<name>.md` (strips the `skill-` prefix). Editing in the repo immediately updates the commands.
- Creates the `data/` skeleton: `people/`, `tasks/open/`, `tasks/done/`, `knowledge/`, `decisions/`, `sessions/`, `debriefs/`, plus an `_index.md` in each.

Re-run any time you add a new skill — it picks up new files and skips ones already linked.

Pass `--copy` instead of the default symlink mode if you need plain copies (e.g. on a system where symlinks misbehave).

### Step 3 — Run `/setup` in Claude Code

```
/setup
```

Claude reads the repo's `CLAUDE.md`, then interviews you for the essentials (5–10 minutes):
- Who you are, role, company, manager.
- What you're driving + 90-day / 6-month / 12-month targets.
- **Close-watch list** — people you manage / work closely with whose workstreams matter to your job (drives `/debrief` FYI-task filter; without this list, third-party tracking tasks are dropped).
- **Manager-driven workstreams** — things your boss owns, sponsors, or assigns that you need to track even when you're not the direct actor (second `/debrief` filter exception alongside close-watch).
- Standing meetings + daily cadence.
- Watch-fors (gotchas, sensitive stakeholders, name-confusion pairs).
- Tone preferences (caveman mode, fragments OK, etc.).

It writes the answers into `data/context.md` (gitignored — stays local). Edit anytime; Claude reads it at session start.

**Prefer to skip the interview and write the file yourself?** Use the template documented in `skills/skill-setup.md` Step 4.

### Step 4 — Verify

In Claude Code: `/morning`. If you have no tasks yet you'll get a "clean board". That's the right answer.

### Step 5 — Use it

Day 1:
1. `/morning` — sparse (nothing in the system yet).
2. After a meeting: paste the transcript, type `/debrief`. Review the extracted tasks. Approve.
3. End of day: `/close`.

By day 3 you'll have meaningful context. By week 2, Claude knows your job.

---

## How the Layers Reinforce Each Other

```
/morning reads ──→ data/tasks/open/*.md (Layer 2) + your CLAUDE.md / data/context.md (Layer 1)
                   ↓
              Builds briefing with full context

/debrief writes ──→ data/people/<slug>.md + data/tasks/open/<project>.md
                    + data/knowledge/<topic>.md
                    ↓
              State + tribal knowledge captured from one meeting

/close reconciles ──→ data/sessions/YYYY-MM-DD.md + tasks moved to done/
                      + data/decisions/ for any new decision
                      ↓
              Clean handoff to next session's /morning
```

Without the cadence (Layer 3), the .md files go stale and `data/` has state Claude never contextualizes. The slash commands force synchronization every day.

---

## Customization Notes

- **Project bucketing.** `data/tasks/open/<project>.md` — pick the buckets that match your real workstreams. Don't be afraid to add or remove projects as priorities shift.
- **No meeting transcripts?** Strip the "search for transcript" parts from `/debrief`; just paste notes.
- **Don't need a people directory?** Skip `data/people/`. `/debrief` will still extract tasks.
- **Different cadence?** Adjust the skill triggers and output templates. The structure is the value, not the specific times.

The system works because it matches how you actually work. Swap markdown for any flat format, swap Claude Code for any agent — the three-layer pattern is what matters.

---

## Repo layout

```
README.md                          this file
CLAUDE.md                          how the system works (read by Claude Code at session start)
LICENSE
project-instructions-template.md   Claude Projects custom-instructions template (optional)
.gitignore
skills/                            slash-command definitions (skill-*.md)
scripts/                           bootstrap + utility scripts
dashboard/                         optional local browser dashboard (read-only)
data/                              live state (gitignored except README)
```

---

## Optional — Browser Dashboard

`dashboard/` is a local read-only browser view over `data/`. Useful when you want to scan tasks/people/knowledge/decisions/debriefs without reading raw markdown. Reads files directly — no database, no auth.

```bash
cd dashboard
npm install
npm start
```

Then open <http://localhost:5173>. Override port with `PERSONAL_CONTEXT_OS_PORT=4000 npm start`.

**Read-only by design.** All write endpoints return 501. Mutations stay in Claude `/debrief` and `/close` so file-edit consistency is preserved.

Requires Node 20+. Full API surface + parser notes in `dashboard/README.md`.

---

## License

MIT — use it however you want.
