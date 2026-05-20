# /close — Session Close

Trigger: User types `/close` or signals end of day.

---

## Data location

Same flat-file store as `/debrief`. Direct Edits to:
- `data/tasks/open/<project>.md` — status flips, notes append.
- `data/tasks/done/<YYYY-MM>.md` — receives completed task blocks moved from open files.
- `data/people/<slug>.md` — intel updates from today.
- `data/tasks/_index.md` and `data/people/_index.md` — refresh after changes.

## Execute

### 1. Scan today's conversation
Extract: tasks completed, new tasks surfaced, decisions made, knowledge captured, unresolved items.

### 2. Plan file edits (show before applying)
- **New tasks** → confirm, then append blocks to `data/tasks/open/<project>.md` per `/debrief` Step 5 format.
- **Status changes (→ done)** → cut block from `open/<project>.md`, paste into `done/<YYYY-MM>.md` with `_project: <project>_` label, set `**status:** done`, append `completed YYYY-MM-DD` to dates line, add outcome to **Notes:**.
- **People intel** → Edit `data/people/<slug>.md`, append dated note line, bump `updated_at`.
- For batch close (>3 edits), present a numbered plan first; apply in one pass.

### 3. Refresh indexes
After applying changes, Edit `data/tasks/_index.md` and `data/people/_index.md`.

### 4. Update knowledge / decisions / session log
- **Decisions** → write a new file `data/decisions/YYYY-MM-DD-<slug>.md` (frontmatter: `date`, `title`, `reverses`; body: **Decision**, **Context**, **Rationale**, **How to apply**). Add row to `data/decisions/_index.md`.
- **Tribal knowledge** → write `data/knowledge/<topic>.md` (frontmatter: `title`, `captured`, `sources`; body ending in **How to apply:**). Add row to `data/knowledge/_index.md`.
- **Session recap** for substantive days → write `data/sessions/YYYY-MM-DD.md` (frontmatter: `date`, `title`; body: **Covered**, **Changed**, **Carries forward**). Add row to `data/sessions/_index.md`. Skip for light days.

### 5. Output

```
SESSION CLOSE — [Date]

✓ DONE TODAY:
  → [task ids + titles that flipped to done]

→ CARRIES FORWARD:
  → [open items with next step]

📝 LOGGED:
  → [files edited under data/ + layer-1 entries added]

⚡ TOMORROW:
  → [1-2 things to hit first]
```

## Rules
- Don't pad. Light day = 3 lines.
- Never apply edits without showing what's changing first.
- Keep indexes accurate after every batch of changes.
