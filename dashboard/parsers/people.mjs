// Parse data/people/*.md into structured person objects.
// Each file = YAML frontmatter + markdown body.

import { readFile, readdir } from 'node:fs/promises';
import { join, basename } from 'node:path';
import { existsSync } from 'node:fs';
import matter from 'gray-matter';

export async function readAllPeople(dataDir) {
  const peopleDir = join(dataDir, 'people');
  if (!existsSync(peopleDir)) return [];

  const files = await readdir(peopleDir);
  const people = [];
  for (const f of files) {
    if (!f.endsWith('.md') || f.startsWith('_')) continue;
    const content = await readFile(join(peopleDir, f), 'utf8');
    const parsed = matter(content);
    const slug = basename(f, '.md');
    people.push({
      slug,
      id: parsed.data.id ?? null,
      name: parsed.data.name ?? slug,
      nicknames: parsed.data.nicknames ?? null,
      role: parsed.data.role ?? null,
      area: parsed.data.area ?? null,
      department: parsed.data.department ?? null,
      expertise: parsed.data.expertise ?? null,
      reliability: parsed.data.reliability ?? null,
      tenure: parsed.data.tenure ?? null,
      reports_to: parsed.data.reports_to ?? null,
      contractor: parsed.data.contractor ?? false,
      created_at: parsed.data.created_at ?? null,
      updated_at: parsed.data.updated_at ?? null,
      notes: parsed.content.trim(),
    });
  }
  people.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  return people;
}

export function findPersonById(people, id) {
  return people.find(p => Number(p.id) === Number(id)) || null;
}

export function findPersonBySlug(people, slug) {
  return people.find(p => p.slug === slug) || null;
}
