// Read other markdown collections (knowledge, decisions, sessions, debriefs).
// Each entry = YAML frontmatter + body. Index files (_index.md) are skipped.

import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';

export async function readCollection(dataDir, folder) {
  const dir = join(dataDir, folder);
  if (!existsSync(dir)) return [];

  const files = await readdir(dir);
  const items = [];
  for (const f of files) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    const content = await readFile(join(dir, f), 'utf8');
    const parsed = matter(content);
    items.push({
      slug: basename(f, '.md'),
      file: f,
      ...parsed.data,
      body: parsed.content.trim(),
    });
  }
  items.sort((a, b) => (b.slug || '').localeCompare(a.slug || ''));
  return items;
}
