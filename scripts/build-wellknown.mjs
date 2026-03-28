/**
 * Generates the /.well-known/agent-skills/ static site structure
 * so skills can be installed via: npx skills add https://angular-skills.vercel.app
 */

import { readFile, writeFile, mkdir, copyFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'public', '.well-known', 'agent-skills');

// Map of local folder → published skill name (read from SKILL.md)
const SKILL_DIRS = ['angular-developer', 'v19'];

async function listFiles(dir, base = '') {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const rel = base ? `${base}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...(await listFiles(join(dir, entry.name), rel)));
    } else {
      files.push(rel);
    }
  }
  return files;
}

async function parseSkillMd(skillDir) {
  const content = await readFile(join(ROOT, skillDir, 'SKILL.md'), 'utf-8');
  const nameMatch = content.match(/^name:\s*(.+)$/m);
  const descMatch = content.match(/^description:\s*(.+)$/m);
  return {
    name: nameMatch?.[1]?.trim(),
    description: descMatch?.[1]?.trim(),
  };
}

async function copySkillFiles(skillDir, skillName) {
  const files = await listFiles(join(ROOT, skillDir));
  for (const file of files) {
    const src = join(ROOT, skillDir, file);
    const dest = join(OUT, skillName, file);
    await mkdir(dirname(dest), { recursive: true });
    await copyFile(src, dest);
  }
  return files;
}

async function build() {
  await mkdir(OUT, { recursive: true });

  const skills = [];

  for (const skillDir of SKILL_DIRS) {
    const { name, description } = await parseSkillMd(skillDir);
    if (!name || !description) {
      console.warn(`⚠  Skipping ${skillDir}: missing name or description in SKILL.md`);
      continue;
    }

    const files = await copySkillFiles(skillDir, name);
    skills.push({ name, description, files });
    console.log(`✓  ${name}  (${files.length} files)`);
  }

  await writeFile(join(OUT, 'index.json'), JSON.stringify({ skills }, null, 2), 'utf-8');
  console.log(`✓  index.json  (${skills.length} skills)`);
  console.log('\nDone → public/.well-known/agent-skills/');
}

build().catch((err) => {
  console.error(err);
  process.exit(1);
});
