// Parse data/tasks/open/*.md and data/tasks/done/*.md into structured task objects.

import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { existsSync } from 'node:fs';

const TASK_HEADING = /^### #(\d+) — (.+)$/;
const META_LINE = /^\*\*status:\*\* (.+?) \| \*\*priority:\*\* (.+?) \| \*\*due:\*\* (.+?) \| \*\*ownership:\*\* (.+?) \| \*\*waiting_on:\*\* (.+?) \| \*\*assignee:\*\* (.+)$/;
const SOURCE_LINE = /^\*\*source:\*\* (.+)$/;
const TAGS_LINE = /^\*\*tags:\*\* (.+)$/;
const DATES_LINE = /^\*\*dates:\*\* (.+)$/;
const PROJECT_LABEL = /^_project: (.+)_$/;

function normalize(value) {
  if (value === undefined || value === null) return null;
  const trimmed = String(value).trim();
  if (trimmed === '—' || trimmed === '' || trimmed === '-') return null;
  return trimmed;
}

function parseDatesField(s) {
  const out = {};
  if (!s) return out;
  for (const part of s.split('·').map(x => x.trim())) {
    const [label, ...rest] = part.split(/\s+/);
    if (!label || rest.length === 0) continue;
    out[label] = rest.join(' ');
  }
  return out;
}

function parseTaskBlock(lines, defaultProject) {
  const head = lines[0].match(TASK_HEADING);
  if (!head) return null;
  const task = {
    id: Number(head[1]),
    title: head[2].trim(),
    project: defaultProject,
    description: '',
    notes: '',
    tags: [],
  };

  let mode = 'meta';
  const descLines = [];
  const noteLines = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (mode === 'meta') {
      const m = trimmed.match(META_LINE);
      if (m) {
        task.status = normalize(m[1]);
        task.priority = normalize(m[2]);
        task.due_date = normalize(m[3]);
        task.ownership = normalize(m[4]);
        task.waiting_on = normalize(m[5]);
        task.assignee = normalize(m[6]);
        continue;
      }
      const sm = trimmed.match(SOURCE_LINE);
      if (sm) { task.source_raw = sm[1].trim(); continue; }
      const tm = trimmed.match(TAGS_LINE);
      if (tm) {
        task.tags = tm[1].split(',').map(t => t.trim()).filter(Boolean);
        continue;
      }
      const dm = trimmed.match(DATES_LINE);
      if (dm) {
        const dates = parseDatesField(dm[1]);
        task.created_at = dates.created || null;
        task.updated_at = dates.updated || null;
        task.completed_at = dates.completed || null;
        continue;
      }
      if (trimmed === '**Description:**') { mode = 'description'; continue; }
      if (trimmed === '**Notes:**') { mode = 'notes'; continue; }
      // Other metadata lines or whitespace — ignore.
    } else if (mode === 'description') {
      if (trimmed === '**Notes:**') { mode = 'notes'; continue; }
      descLines.push(line);
    } else if (mode === 'notes') {
      noteLines.push(line);
    }
  }

  task.description = descLines.join('\n').trim();
  task.notes = noteLines.join('\n').trim();
  return task;
}

function splitBlocks(content) {
  // Each task block is delimited by `---` lines. The file header (up to first `### #`) is dropped.
  const lines = content.split('\n');
  const blocks = [];
  let current = null;
  let projectLabel = null;

  for (const line of lines) {
    const labelMatch = line.match(PROJECT_LABEL);
    if (labelMatch) {
      projectLabel = labelMatch[1].trim();
      continue;
    }
    if (TASK_HEADING.test(line)) {
      if (current) blocks.push({ lines: current.lines, project: current.project });
      current = { lines: [line], project: projectLabel };
      continue;
    }
    if (current) {
      if (line.trim() === '---') {
        blocks.push({ lines: current.lines, project: current.project });
        current = null;
        continue;
      }
      current.lines.push(line);
    }
  }
  if (current) blocks.push({ lines: current.lines, project: current.project });
  return blocks;
}

export async function readAllTasks(dataDir) {
  const openDir = join(dataDir, 'tasks', 'open');
  const doneDir = join(dataDir, 'tasks', 'done');
  const tasks = [];

  if (existsSync(openDir)) {
    const files = await readdir(openDir);
    for (const f of files) {
      if (!f.endsWith('.md') || f.startsWith('_')) continue;
      const project = basename(f, '.md');
      const content = await readFile(join(openDir, f), 'utf8');
      for (const { lines } of splitBlocks(content)) {
        const t = parseTaskBlock(lines, project);
        if (t) tasks.push(t);
      }
    }
  }

  if (existsSync(doneDir)) {
    const files = await readdir(doneDir);
    for (const f of files) {
      if (!f.endsWith('.md') || f.startsWith('_')) continue;
      const content = await readFile(join(doneDir, f), 'utf8');
      for (const { lines, project } of splitBlocks(content)) {
        const t = parseTaskBlock(lines, project);
        if (t) tasks.push(t);
      }
    }
  }

  tasks.sort((a, b) => a.id - b.id);
  return tasks;
}

export function filterTasks(tasks, query = {}) {
  let out = tasks;
  if (query.status) out = out.filter(t => t.status === query.status);
  if (query.ownership) out = out.filter(t => t.ownership === query.ownership);
  if (query.priority) out = out.filter(t => t.priority === query.priority);
  if (query.project) out = out.filter(t => t.project === query.project);
  if (query.waiting_on) {
    if (query.waiting_on === 'any') out = out.filter(t => t.waiting_on !== null);
    else out = out.filter(t => (t.waiting_on || '').toLowerCase().includes(query.waiting_on.toLowerCase()));
  }
  if (query.q) {
    const q = query.q.toLowerCase();
    out = out.filter(t =>
      (t.title || '').toLowerCase().includes(q) ||
      (t.description || '').toLowerCase().includes(q)
    );
  }
  return out;
}
