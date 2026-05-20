# /debrief — Post-Meeting Debrief

Trigger: User types `/debrief` or pastes a meeting transcript.

---

## Data location

Flat-file Personal Context OS store at `data/`:
- `people/<slug>.md` — one file per person; YAML frontmatter + notes body.
- `people/_index.md` — name → file lookup. Refresh after any add/remove.
- `tasks/open/<project>.md` — open tasks grouped by project; each task = `### #<id> — <title>` with bold metadata line.
- `tasks/done/<YYYY-MM>.md` — completed tasks by month.
- `tasks/_index.md` — id → file lookup. Refresh after any add or status change.

No external API. Direct file edits.

## Step 1: Get the transcript
- If no transcript provided — ask user to paste, or check most recent meeting source.
- If a name was given — note as filter context.
- If transcript pasted directly — process what's there.

## Step 2: Process — output in this order

### TOP — Floor/Field Action Items
2–3 specific things to go check, verify, or follow up on. Include who to talk to.

### Tasks Extracted
For each action item: title, description, priority, suggested due date, who's involved.
- `ownership: mine` = your responsibility.
- `ownership: fyi` = someone else's; you're tracking it.
- **Filter rule:** only create tasks you can close. Non-actionable context → people notes or memory, not FYI tasks. Exception: if a workstream belongs to your boss or a critical stakeholder, FYI tracks may stay actionable.

### People Intel
- New people mentioned → prepare a new person-file write (frontmatter + notes).
- Updated intel on existing people → prepare an Edit appending `[YYYY-MM-DD]` dated note into the existing body.
- Relationship-building opportunities.

### BOTTOM — Strategic Debrief (read this sitting down)
- **Hidden risks** — what was discussed that nobody fully appreciates?
- **Power dynamics** — who gained or lost influence?
- **Unowned problems** — gaps you could step into.
- **48-hour highest-value action** — not most urgent, most valuable.
- **Blind spots** — questions you should have asked.

## Step 3: Present for review
Show the full output. Do NOT touch files yet. Wait for explicit approval.

## Step 4: Dedup BEFORE editing

1. Read `data/people/_index.md`. Scan for spelling variants, nicknames, accented chars.
2. Read `data/tasks/_index.md`. If the meeting materially updates an existing task, plan an Edit (status change + notes append), not a new entry.

## Step 5: Apply changes (after approval)

### New person
1. Write `data/people/<kebab-slug>.md` with frontmatter (id = next free integer from index, name, area, expertise, reliability=watching, dates) + notes body starting with `[YYYY-MM-DD] <context>`.
2. Edit `data/people/_index.md` to add the row (alphabetical).

### Updated person
1. Edit `data/people/<slug>.md` — append `\n\n[YYYY-MM-DD] <new context>` to the notes body. Bump `updated_at` in frontmatter.

### New task
1. Determine project bucket from tags/title. Create a new project file if no bucket fits.
2. Pick next free id from `data/tasks/_index.md`.
3. Append a new task block to `data/tasks/open/<project>.md`:
   ```
   ### #<id> — <title>

   **status:** todo | **priority:** <p> | **due:** <date or —> | **ownership:** mine|fyi | **waiting_on:** — | **assignee:** —
   **source:** debrief / <meeting label> / <slug-date>
   **tags:** <comma list>
   **dates:** created <YYYY-MM-DD> · updated <YYYY-MM-DD>

   **Description:**

   <text>

   ---
   ```
4. Edit `data/tasks/_index.md` (sorted by id).

### Existing task done / updated
1. If status flips to `done`: cut the task block from `data/tasks/open/<project>.md`, paste into `data/tasks/done/<YYYY-MM>.md` with a `_project: <project>_` label above the block, set `**status:** done`, append `completed YYYY-MM-DD` to dates line, append outcome to **Notes:**.
2. If status stays open but notes/fields change: Edit in place. Bump updated date.
3. Edit `data/tasks/_index.md` to reflect status + file change.

## Step 6: Generate debrief log

Save to `data/debriefs/<YYYY-MM-DD>-<HHMM>-<slug>.md`:

```markdown
# <Meeting name> — <YYYY-MM-DD HH:MM>

Source label: <e.g. "Alpha standup">
Slug: <e.g. "alpha-dsu-2026-05-20">

## People added
- [Name](../data/people/<slug>.md) (id <n>)

## People updated
- [Name](../data/people/<slug>.md) (id <n>) — <one-line summary of merge>

## Tasks added
- #<id> — <title> [→ tasks/open/<project>.md]

## Tasks updated
- #<id> — <title> [<status change>] [→ tasks/done/<YYYY-MM>.md or stayed in open/<project>.md]

## Strategic notes
<bottom-of-debrief content for replay value>
```

Slug rules: DSUs = `<team>-dsu`, 1:1 = `1on1-<firstname>`, other = short descriptive. Time = 24-hour `HHMM` from transcript's earliest absolute timestamp.

## Step 7: Update knowledge / memory if applicable

Tribal knowledge or new project facts → write a new file under `data/knowledge/<topic>.md` with frontmatter (`title`, `captured`, `sources`) + body ending in **How to apply:**. Add a row to `data/knowledge/_index.md`. Cross-link with `[[topic-slug]]` to related entries.

Claude Code users can additionally save reusable cross-session learnings as memory entries under the project's memory directory.
