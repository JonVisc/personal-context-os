# /manager-prep — 1-on-1 Prep

Trigger: User types `/manager-prep` before a scheduled 1-on-1. Manager name from argument or default to your own boss.

---

## Data location

- Open tasks: `data/tasks/open/*.md`
- Done this month: `data/tasks/done/<YYYY-MM>.md`
- Manager's person file: `data/people/<manager-slug>.md`
- Prior 1:1 logs: `data/debriefs/*1on1-<firstname>*.md`

## Execute

### 1. Pull current state
- Read open task files. Filter by `ownership: mine, status: todo`.
- Grep open task files for `waiting_on:` containing the manager's name.
- Read current-month done file. Filter by completion date within last 7 days.

### 2. Read the manager's person file
`data/people/<manager-slug>.md` — recent context, prior decisions, communication style.

### 3. Check recent debriefs
Scan `data/debriefs/` for any `1on1-<firstname>` file. Read most recent. Open items from previous meeting carry forward.

### 4. Build prep doc

```
1-ON-1 PREP — [Date]

SINCE LAST MEETING:
  ✓ Completed: [tasks closed in last 7 days touching this manager]
  → In progress: [active items they care about]
  🚧 Blocked on [manager]: [items waiting on them]

LEAD WITH:
  → [Most impressive thing you did — framed for your company's performance language]

QUESTIONS TO ASK:
  1. [Specific, context-aware question]
  2. [Question about a gap or upcoming event]
  3. [Development or relationship question]

VISIBILITY MOVE:
  → [One natural way to make work visible]

CLOSE THE LOOP ON:
  → [Unresolved item from last meeting]

KNOWLEDGE TO EXTRACT:
  → [1-2 things your manager knows that aren't documented]
```

## Rules
- Every question connects to a real task, project, or gap.
- The "lead with" item should be something your manager can repeat upward.
- Keep it short enough to glance at on your phone walking to the meeting.
