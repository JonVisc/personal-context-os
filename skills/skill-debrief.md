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
- **Filter rule (hard default — drop FYI tasks):** only create tasks the user can close. Non-actionable context → people notes or memory, not FYI `Track:` tasks. Default state for any "interesting but not mine" item = DROP. The system has historically over-collected `Track:` tasks that bloat `/morning` and `/status` while the user has no ability to move them forward.
- **FYI exception — close-watch list + manager-driven workstreams ONLY.** An FYI task is justified ONLY when one of these is true:
  - The workstream belongs to a person on the user's **close-watch list** (read from `data/context.md` § "People I Manage / Close Watch").
  - The workstream is on the user's **manager-driven workstreams list** (read from `data/context.md` § "Manager-Driven Workstreams"). Manager-flagged work IS the user's job even when they're a passive participant.
  - Anything outside both lists → DROP, even if the meeting felt important.
- **When dropping an FYI item, do not silently lose it.** If the context has lasting value, capture it as a note in the named person's `data/people/<slug>.md` file (dated `[YYYY-MM-DD]` entry) or as a `data/knowledge/<topic>.md` entry. Tasks are for action; people files + knowledge are for context.

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

**Critical: assume overlap is the same task.** Recurring meetings re-surface the same workstreams in slightly different language. If an extracted item touches a workstream, person, deliverable, or deadline already represented in open tasks — treat it as the same task with new context, not a separate entry. Cost of merging-and-splitting-later is low; cost of duplicate task spam is high (corrupts `/morning`, `/status`, prioritization).

1. Read `data/people/_index.md`. Scan for spelling variants, nicknames, accented chars.
2. Read `data/tasks/_index.md` AND every `data/tasks/open/<project>.md` file. For each newly extracted task, run dedup checks against open tasks IN THIS ORDER:
   - **Workstream/project match.** Same project bucket + ≥2 overlapping tags → suspect duplicate.
   - **Named-people match.** Same `waiting_on` or `assignee` on a related deliverable → suspect duplicate.
   - **Deliverable-noun match.** Same artifact ("the sister ticket", "the explainer doc", "Mike Su Plaid mtg") = same task even if wording differs.
   - **Source-meeting recency.** A task created within the last 7 days from a related debrief on the same workstream is almost always the same thread re-surfacing.
3. Classify each extracted item as **NEW**, **UPDATE-existing** (Edit with notes append + date stamp), or **DROP** (already fully captured — no edit needed, optionally cross-reference in the debrief log strategic notes).
4. **When uncertain, prefer UPDATE-existing.** Splitting a merged task later is one Edit. De-duplicating a task list after weeks of accumulation is a multi-hour cleanup.

Real-world example: A single broker workstream produced ~14 near-duplicate open tasks across a week of standups/syncs because each `/debrief` created fresh entries instead of appending to the existing thread. They were all eventually batch-closed as "same overall need." Aggressive dedup at this step prevents that.

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
