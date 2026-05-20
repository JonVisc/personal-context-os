# /morning — Morning Brief

Trigger: User types `/morning` or starts a session with a morning greeting on a workday.

---

## Data location

All state lives in `data/`:
- `data/tasks/open/<project>.md` — open tasks grouped by project.
- `data/tasks/done/<YYYY-MM>.md` — completed tasks by month.
- `data/people/<slug>.md` — per-person notes.

Each task entry uses inline metadata: `**status:** todo | **priority:** High | **due:** YYYY-MM-DD | **ownership:** mine|fyi | **waiting_on:** — | **assignee:** —`. Greppable.

## Execute in this order

### 1. Scan open task files
List `data/tasks/open/*.md`. Read each. Parse inline metadata for every task entry (`### #<id> — <title>` heading).

### 2. Compute counts
- **Overdue** = `ownership: mine`, `status: todo`, `due < today`
- **Due today** = `ownership: mine`, `status: todo`, `due == today`
- **Blocked (mine)** = `ownership: mine`, `status: todo`, `waiting_on != —`
- **This week** = `ownership: mine`, `status: todo`, today ≤ due ≤ today+7

### 3. Check for unprocessed meetings
Scan `data/debriefs/` for most-recent file vs today's date. Gap suggests an unprocessed meeting. Flag, don't auto-process.

### 4. Output — one screenful, phone-readable

```
MORNING BRIEF — [Day, Date]

🔴 OVERDUE: [count]
   → [top 3 by priority]

⚡ TODAY:
   → [tasks due today]
   → [meetings/calendar items if available]

🚧 BLOCKED: [count] waiting on someone
   → [top blockers — title (waiting_on: name)]

📋 THIS WEEK:
   → [upcoming deadlines]

💡 HEADS UP:
   → [anything from recent debriefs needing follow-up]
```

### 5. Close with one line
"Highest-value move today: [specific action based on the data]"

---

## Rules
- No pleasantries. Start with the brief.
- Keep it to one phone screen.
- Don't repeat information from yesterday if nothing changed.
