# /setup — First-time onboarding for Personal Context OS

Trigger: User types `/setup` after cloning the repo. Runs once per user. Writes the personal session-context file at `data/context.md`.

---

## Data location

Writes `data/context.md` (gitignored). Reads `CLAUDE.md` to understand the system before interviewing.

## Step 1: Check whether already onboarded

If `data/context.md` exists with substantive content (>20 lines, not just placeholders):
- Tell user: "You already have a context file at `data/context.md`. Run `cat data/context.md` to review, edit it directly, or delete and re-run `/setup` to start fresh."
- Stop. Do not overwrite.

If the file is missing or essentially empty, proceed.

## Step 2: Read repo CLAUDE.md

Read `CLAUDE.md` first so the answers can be tied to specific Personal Context OS concepts (data/people, data/tasks, debriefs, etc.) when you write the context.

## Step 3: Run the interview

Conversational, not interrogative. Group related questions. Don't ask every field — let placeholders stand in for skipped detail. **Target: 5–10 minutes of user time.**

### Identity (required — block on missing)
- Your full name + any nickname people use (e.g. "Alex Doe, but colleagues call me AD").
- Your role + company + how long you've been there.
- Who do you report to (name + title)?
- One paragraph about your background — industry, years experience, anything that shapes how you work.

### Career trajectory (required)
- Biggest thing you're driving right now?
- 90-day target — what should be done by then?
- 6-month and 12-month framing (loose is fine).

### Close-watch list (required — drives `/debrief` task filter)
- Are there any people you manage or work closely with whose workstreams you need to track because they're important to your job? (Direct reports, peer engineers you depend on, cross-team partners.)
- Capture full names + a one-line reason each (e.g. "John Smith — backend engineer on my team").
- Why this matters: by default `/debrief` drops FYI `Track:` tasks (they're noise — context only you care about). The close-watch list is the **only** exception (plus your manager's workstreams, captured next). If someone matters but isn't on this list, the system will quietly drop intel about their work.

### Manager-driven workstreams (required — second `/debrief` filter exception)
- Your manager was captured under Identity. What workstreams does your manager actively drive, sponsor, or assign to you that you need to track even when you're not the direct actor? (e.g. strategic initiatives the boss owns, decisions the boss makes that affect your team, things the boss escalates to you.)
- Capture each as a short label + one-line context (e.g. "Product X strategy — John Doe leading Project Y discussion, decision affects scope").
- Why this matters: anything your boss flags as important IS important to your job — even if you're a passive participant. `/debrief` keeps FYI `Track:` tasks for these workstreams; outside this list (and outside the close-watch people list), FYI tracks are dropped.

### Daily cadence (recommended — skip OK)
- Standing meetings you regularly attend (daily standups, weekly reviews, 1:1s). Names + who runs them.
- Anything you do every morning / end-of-day that Claude should know about.

### Watch-fors (recommended — skip OK)
- Specific gotchas or patterns Claude should flag (e.g. code freezes, deadlines, sensitive stakeholders).
- Anyone whose name is easy to confuse with someone else's?

### Tone (optional)
- How terse do you want responses? (e.g. caveman mode, fragments OK, full sentences.)
- Anything you specifically don't want Claude to do?

## Step 4: Write `data/context.md`

Generate the file using the canonical template (also documented in README Setup Step 3). Structure:

```markdown
# Session Context

Read at session start. For Claude, not user-facing.

---

## Who I am
[Name + nickname. Role + company + tenure. Reports to whom.
Background paragraph from user's answer.]

---

## Career trajectory
**Current state:** [biggest current driver]
**90-day target:** [user's answer or [PLACEHOLDER]]
**6-month target:** [user's answer or [PLACEHOLDER]]
**12-month target:** [user's answer or [PLACEHOLDER]]

---

## People I manage / close watch

Workstreams from these people stay relevant to my job even when I am not the direct actor. FYI `Track:` tasks ARE justified when the named person is on this list. Outside this list (plus the manager-driven workstreams below), FYI tracks are noise — drop them at `/debrief` Step 2 filter.

- **[Full Name]** — [one-line role/reason]
- **[Full Name]** — [one-line role/reason]
[...etc, or `[PLACEHOLDER — none yet]` if user skipped]

---

## Manager-driven workstreams

Workstreams my manager actively drives, sponsors, or assigns. Anything my boss flags as important IS important to my job — FYI `Track:` tasks for these stay actionable even when I am a passive participant.

Manager: **[Manager full name]** ([title])

Active workstreams:
- **[Workstream label]** — [one-line context]
- **[Workstream label]** — [one-line context]
[...etc, or `[PLACEHOLDER — none yet]` if user skipped]

Update this list when priorities shift — it drives what `/debrief` keeps vs drops.

---

## Daily cadence
### Morning (session start)
Surface without being asked:
- Overdue tasks (`data/tasks/open/*.md` entries with `**ownership:** mine` + `**due:** < today`)
- Items due today
- Standing meeting reminders
- Active concerns from recent debriefs

### Afternoon (session close)
- What got done today
- What carries forward
- Debrief outputs needing processing
- Knowledge captures from the day

### Standing items
[List from user's answers, or `[PLACEHOLDER]` if skipped]

---

## What to watch for
[User's specific gotchas, plus the standard baseline:]
- **File-edit approval gate** — never modify `data/` files automatically. Present extracted tasks / changes for review first; apply only after explicit approval.
- **Debrief precision** — stay close to what transcripts actually say. Flag attribution uncertainty. Don't over-assign tasks.
[User-specific entries here.]

---

## How sessions should feel
- Don't perform. Execute.
- If the answer is in `data/`, past conversations, or meeting transcripts — go find it before saying "I don't know."
- If a tool fails, try another approach before reporting failure.
[User's tone preferences here, e.g. "Caveman mode preferred (terse, fragments OK)."]
```

Always include the standard "file-edit approval gate" + "debrief precision" + the three "How sessions should feel" baseline bullets — these are system rules regardless of personal preference.

## Step 5: Verify + handoff

After writing, show:
```
✓ data/context.md created (gitignored — stays local)

Edit anytime — Claude reads it at session start.
Run /morning to start your first real session.
```

If the user is also new to the data/ layout, suggest: "Take a look at `data/README.md` for the file layout. Most folders are empty — they'll fill from `/debrief` and `/close`."

## Rules
- One-shot. Don't re-interview on subsequent sessions.
- Don't overwrite existing context.md without explicit user confirmation.
- Use free-form questions for personality / cadence — avoid forced multiple-choice that loses nuance.
- Keep the interview tight. Push back if user gives you a 10-paragraph answer to a 3-sentence question; ask follow-ups instead of accepting wall-of-text without filtering.
- Cite the source of each field in the written file is unnecessary — context.md is for Claude, not an audit log.
