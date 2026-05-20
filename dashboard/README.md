# dashboard/

Optional local browser dashboard for Personal Context OS. Reads `../data/` markdown files, serves JSON over HTTP, renders a minimal SPA.

**Read-only by design.** Writes (creating/updating tasks or people) go through Claude `/debrief` and `/close` — that's how file-edit consistency is maintained. The dashboard returns 501 for write endpoints.

## Run

```bash
cd dashboard
npm install
npm start
```

Then open <http://localhost:5173>. Override the port with `PERSONAL_CONTEXT_OS_PORT=4000 npm start` (or `PORT=4000`).

Watch mode (auto-restart on server changes):

```bash
npm run dev
```

Requires Node 20+.

## API surface

All endpoints return JSON. Read-only — no auth.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/health` | `{ ok: true, dataDir }` |
| `GET` | `/api/tasks` | All tasks. Query filters: `status`, `ownership`, `priority`, `project`, `waiting_on` (`any` or substring), `q` (title/description search) |
| `GET` | `/api/tasks/:id` | One task by id |
| `GET` | `/api/people` | All people. `?q=<name>` for substring filter |
| `GET` | `/api/people/:idOrSlug` | One person by numeric id or kebab slug |
| `GET` | `/api/knowledge` | All knowledge entries |
| `GET` | `/api/decisions` | All decision entries |
| `GET` | `/api/sessions` | All session-log entries |
| `GET` | `/api/debriefs` | All meeting debrief logs |
| `GET` | `/api/stats` | Counts, overdue, blocked, due-today summary |
| `GET` | `/api/export` | Full snapshot (everything in one payload) |

Write endpoints (`POST`, `PATCH`, `PUT`, `DELETE`) on `/api/tasks` and `/api/people` exist but always return 501 with a pointer to Claude `/debrief` and `/close`.

## How parsing works

- **Tasks** — `parsers/tasks.mjs` walks `data/tasks/open/*.md` and `data/tasks/done/*.md`, splits on `### #<id> — <title>` headings + `---` delimiters, and parses inline metadata (`**status:** … | **priority:** … | …`). Description and Notes sections extracted by `**Description:**` / `**Notes:**` markers.
- **People** — `parsers/people.mjs` uses [`gray-matter`](https://github.com/jonschlinkert/gray-matter) on each `data/people/*.md`. Frontmatter becomes top-level fields; body becomes `notes`.
- **Knowledge / decisions / sessions / debriefs** — `parsers/simple.mjs` is the generic frontmatter-plus-body parser, reused for the four secondary collections.

Adding a new field to the inline-metadata line or to person frontmatter requires updating the relevant parser.

## Why read-only?

The Claude `/debrief` / `/close` flows do batch file edits with care (move-to-done preserving format, refresh both `_index.md` files, etc.). Letting the dashboard write back would create race conditions and inconsistent state. If browser-side mutation becomes important, the right move is to add Claude-shaped guardrails (preview, approval) rather than racing the file system.

## Not committed

- `node_modules/` (`.gitignore`d)

The dashboard itself **is** committed — the read-only design means it's safe to publish.
