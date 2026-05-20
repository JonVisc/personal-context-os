# data/ — Personal Context OS flat-file storage

## Layout

- `people/` — one file per person, slug-named. `_index.md` is the name → file map.
- `tasks/open/` — one file per project (alpha, beta, platform, infra). Tasks sorted by priority then due-date.
- `tasks/done/` — one file per month (YYYY-MM.md), tasks sorted chronologically with project label inline.
- `tasks/_index.md` — id → file lookup.

## Conventions

- Task heading: `### #<id> — <title>` (greppable: `grep -r '^### #16 '`)
- Task metadata: bold-labeled inline (`**status:** todo | **priority:** High | …`)
- Person frontmatter: YAML between `---` delimiters.
