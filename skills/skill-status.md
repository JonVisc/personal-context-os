# /status — Quick Status Pulse

Trigger: User types `/status`.

---

## Data location

`data/tasks/open/*.md` (per-project). Parse inline metadata as in `/morning`.

## Execute

1. List + read every `data/tasks/open/*.md` file.
2. For every `### #<id> — <title>` entry, parse metadata line.
3. Compute:
   - Total open `mine` vs `fyi`.
   - Overdue count (mine, status todo, due < today).
   - Due-soon count (mine, status todo, due ≤ today+3).
   - Blocked count (mine, status todo, waiting_on != —).

## Output — compact, 10-second read

```
STATUS — [Date]

Open: [X] mine / [Y] fyi / [Z] total
Overdue: [X] | Due soon: [X] | Blocked: [X]

TOP OVERDUE:
  1. #[id] [title] — due [date]
  2. #[id] [title] — due [date]

TOP BLOCKERS:
  → #[id] [title] (waiting on [who])
```

## Rules
- No analysis, no recommendations. Just numbers.
- Clean board? Say "Clean board" and show counts only.
