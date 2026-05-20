// Personal Context OS local dashboard server.
//
// Read-only HTTP API that parses ../data/ flat-file markdown into JSON for the
// browser dashboard at /. Writes return 501 — use Claude `/debrief` or `/close`
// to mutate state (avoids file-edit races between the dashboard and Claude).

import express from 'express';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readAllTasks, filterTasks } from './parsers/tasks.mjs';
import { readAllPeople, findPersonById } from './parsers/people.mjs';
import { readCollection } from './parsers/simple.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = resolve(__dirname, '..');
const DATA_DIR = join(REPO_ROOT, 'data');
const PORT = Number(process.env.PERSONAL_CONTEXT_OS_PORT || process.env.PORT || 5173);

const app = express();
app.use(express.json());

// ---------- health ----------

app.get('/api/health', (_req, res) => res.json({ ok: true, dataDir: DATA_DIR }));

// ---------- tasks ----------

app.get('/api/tasks', async (req, res) => {
  try {
    const all = await readAllTasks(DATA_DIR);
    const filtered = filterTasks(all, req.query);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/tasks/:id', async (req, res) => {
  try {
    const all = await readAllTasks(DATA_DIR);
    const t = all.find(x => x.id === Number(req.params.id));
    if (!t) return res.status(404).json({ error: 'not found' });
    res.json(t);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- people ----------

app.get('/api/people', async (req, res) => {
  try {
    const all = await readAllPeople(DATA_DIR);
    if (req.query.q) {
      const q = String(req.query.q).toLowerCase();
      return res.json(all.filter(p => (p.name || '').toLowerCase().includes(q)));
    }
    res.json(all);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

app.get('/api/people/:idOrSlug', async (req, res) => {
  try {
    const all = await readAllPeople(DATA_DIR);
    const idOrSlug = req.params.idOrSlug;
    const person = !Number.isNaN(Number(idOrSlug))
      ? findPersonById(all, idOrSlug)
      : all.find(p => p.slug === idOrSlug);
    if (!person) return res.status(404).json({ error: 'not found' });
    res.json(person);
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- knowledge / decisions / sessions / debriefs ----------

for (const folder of ['knowledge', 'decisions', 'sessions', 'debriefs']) {
  app.get(`/api/${folder}`, async (_req, res) => {
    try {
      const items = await readCollection(DATA_DIR, folder);
      res.json(items);
    } catch (err) {
      res.status(500).json({ error: String(err) });
    }
  });
}

// ---------- stats ----------

app.get('/api/stats', async (_req, res) => {
  try {
    const tasks = await readAllTasks(DATA_DIR);
    const people = await readAllPeople(DATA_DIR);
    const today = new Date().toISOString().slice(0, 10);

    const byStatus = {};
    let overdue = 0;
    let blocked = 0;
    let dueToday = 0;
    let mineOpen = 0;

    for (const t of tasks) {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
      if (t.status !== 'todo') continue;
      if (t.ownership === 'mine') mineOpen += 1;
      if (t.waiting_on) blocked += 1;
      if (t.due_date && t.due_date < today && t.ownership === 'mine') overdue += 1;
      if (t.due_date === today && t.ownership === 'mine') dueToday += 1;
    }

    res.json({
      tasks_total: tasks.length,
      tasks_by_status: byStatus,
      tasks_mine_open: mineOpen,
      tasks_overdue: overdue,
      tasks_due_today: dueToday,
      tasks_blocked: blocked,
      people_total: people.length,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- export (full snapshot) ----------

app.get('/api/export', async (_req, res) => {
  try {
    const [tasks, people, knowledge, decisions, sessions, debriefs] = await Promise.all([
      readAllTasks(DATA_DIR),
      readAllPeople(DATA_DIR),
      readCollection(DATA_DIR, 'knowledge'),
      readCollection(DATA_DIR, 'decisions'),
      readCollection(DATA_DIR, 'sessions'),
      readCollection(DATA_DIR, 'debriefs'),
    ]);
    res.json({
      exported_at: new Date().toISOString(),
      tasks,
      people,
      knowledge,
      decisions,
      sessions,
      debriefs,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
});

// ---------- write endpoints (intentionally not implemented) ----------

const writeNotImplemented = (_req, res) =>
  res.status(501).json({
    error: 'writes are intentionally not implemented in the dashboard',
    message: 'Use Claude /debrief or /close to mutate data/ files. The dashboard is read-only to avoid file-edit races.',
  });

app.post('/api/tasks', writeNotImplemented);
app.patch('/api/tasks/:id', writeNotImplemented);
app.put('/api/tasks/:id', writeNotImplemented);
app.delete('/api/tasks/:id', writeNotImplemented);
app.post('/api/people', writeNotImplemented);
app.patch('/api/people/:id', writeNotImplemented);
app.put('/api/people/:id', writeNotImplemented);
app.delete('/api/people/:id', writeNotImplemented);

// ---------- static dashboard ----------

app.use(express.static(join(__dirname, 'public')));

// ---------- boot ----------

app.listen(PORT, () => {
  console.log(`Personal Context OS dashboard at http://localhost:${PORT}`);
  console.log(`Reading data from ${DATA_DIR}`);
});
