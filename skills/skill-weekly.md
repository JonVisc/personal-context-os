# /weekly — Weekly Review

Trigger: User types `/weekly`. Run Friday afternoon.

---

## Data location

- Open tasks: `data/tasks/open/<project>.md`
- Done tasks (this month): `data/tasks/done/<YYYY-MM>.md`
- Meeting debriefs this week: `data/debriefs/<YYYY-MM-DD>*.md`

## Execute

### 1. Pull the week's data
- Read current-month done file. Filter task entries by `completed YYYY-MM-DD` ≥ this-Monday.
- Read all open files. Build overdue list.
- List `data/debriefs/` files dated this week.

### 2. Output

```
WEEKLY REVIEW — Week of [Monday date]

📊 SCOREBOARD:
  Tasks: [closed this week] closed / [open total] open / [overdue total] overdue
  Debriefs processed: [count]

✓ WINS THIS WEEK:
  → [completed tasks by project]

⚠ GAPS:
  → [overdue items]
  → [goals falling behind]

★ LEADERSHIP MOVES:
  → [decisions made, influence moments — extracted from debriefs + memory this week]

🎯 NEXT WEEK PRIORITIES:
  1. [highest value open task]
  2. [second]
  3. [third]

💬 CITATION LOG:
  → [moments worth capturing as repeatable statements for performance review]
```

### 3. Reflection prompt
Ask three questions:
- What did you influence this week vs. just execute?
- Where did you create clarity that didn't exist before?
- What did you learn about how your organization actually works?

## Rules
- Pull real numbers. Don't estimate.
- Be honest about gaps.
