#!/usr/bin/env node

/**
 * angular-skills add
 *
 * Installs the angular-developer skill into one or more agent directories.
 *
 * SKILL.md  → copied once (local customisations survive npm updates)
 * references/ → symlinked to the globally installed package so that
 *               `npm update -g angular-skills` refreshes content automatically.
 *
 * Supported targets:
 *   Universal (all agents)  ~/.agents/skills/
 *   Claude Code             .claude/skills/          (project)
 *                           ~/.claude/skills/        (global)
 *   Cursor                  .cursor/skills/
 *   GitHub Copilot          .github/copilot/skills/
 *   Codex                   .codex/skills/
 *   Custom                  <user-provided path>
 */

'use strict';

const { createInterface } = require('readline');
const {
  existsSync,
  mkdirSync,
  copyFileSync,
  symlinkSync,
  unlinkSync,
  rmSync,
  realpathSync,
} = require('fs');
const { execSync } = require('child_process');
const { join } = require('path');
const { homedir } = require('os');

const PKG_NAME = 'angular-skills';

const SKILLS = [
  {
    key: '1',
    name: 'angular-developer',
    description: 'Angular v20+ — general projects',
  },
  {
    key: '2',
    name: 'v19',
    description: 'Angular v19 — Atera existing projects (Nx)',
  },
];

// ─── helpers ────────────────────────────────────────────────────────────────

function ask(rl, question) {
  return new Promise(resolve => rl.question(question, answer => resolve(answer.trim())));
}

function run(cmd, opts = {}) {
  return execSync(cmd, { encoding: 'utf-8', stdio: opts.silent ? 'pipe' : 'inherit', ...opts });
}

function ensureGlobalInstall() {
  let globalRoot;
  try {
    globalRoot = run('npm root -g', { silent: true }).trim();
  } catch {
    console.error('\n❌  Could not run `npm root -g`. Make sure npm is installed.\n');
    process.exit(1);
  }

  const globalPkg = join(globalRoot, PKG_NAME);

  if (!existsSync(globalPkg)) {
    console.log(`\n📦  Installing ${PKG_NAME} globally (needed for symlink target)…`);
    try {
      run(`npm install -g ${PKG_NAME}`);
    } catch {
      console.error(`\n❌  Global install failed. Try manually:\n    npm install -g ${PKG_NAME}\n`);
      process.exit(1);
    }
  }

  return globalPkg;
}

function isRunningFromTemp() {
  const dir = realpathSync(__dirname);
  return dir.includes('_npx') || dir.includes('.npm/_') || dir.includes('tmp') || dir.includes('Temp');
}

function resolveSourceRoot() {
  if (isRunningFromTemp()) {
    return ensureGlobalInstall();
  }

  const localRoot = join(__dirname, '..');
  const localSkill = join(localRoot, SKILL_NAME, 'references');

  if (existsSync(localSkill)) {
    return localRoot;
  }

  return ensureGlobalInstall();
}

// ─── install ─────────────────────────────────────────────────────────────────

async function install(targetBase, label, skillName) {
  const sourceRoot       = resolveSourceRoot();
  const sourceSkillMd    = join(sourceRoot, skillName, 'SKILL.md');
  const sourceReferences = join(sourceRoot, skillName, 'references');
  const targetDir        = join(targetBase, skillName);
  const targetSkillMd    = join(targetDir, 'SKILL.md');
  const targetReferences = join(targetDir, 'references');

  console.log(`\n  📂  ${label}`);
  console.log(`      ${targetDir}`);

  mkdirSync(targetDir, { recursive: true });

  if (existsSync(targetSkillMd)) {
    console.log(`  ⏭️   SKILL.md already exists — keeping your local version`);
  } else {
    copyFileSync(sourceSkillMd, targetSkillMd);
    console.log(`  ✅  Copied   SKILL.md`);
  }

  if (existsSync(targetReferences)) {
    try {
      unlinkSync(targetReferences);
    } catch {
      rmSync(targetReferences, { recursive: true, force: true });
    }
  }

  symlinkSync(sourceReferences, targetReferences, 'dir');
  console.log(`  🔗  Symlinked references/  →  ${sourceReferences}`);

  return targetDir;
}

// ─── agent targets ───────────────────────────────────────────────────────────

const cwd  = process.cwd();
const home = homedir();

const AGENTS = [
  {
    key: '1',
    label: 'Universal (all agents)',
    dir: join(home, '.agents', 'skills'),
    description: '~/.agents/skills/',
    global: true,
  },
  {
    key: '2',
    label: 'Claude Code — project',
    dir: join(cwd, '.claude', 'skills'),
    description: '.claude/skills/',
    global: false,
  },
  {
    key: '3',
    label: 'Claude Code — global',
    dir: join(home, '.claude', 'skills'),
    description: '~/.claude/skills/',
    global: true,
  },
  {
    key: '4',
    label: 'Cursor',
    dir: join(cwd, '.cursor', 'skills'),
    description: '.cursor/skills/',
    global: false,
  },
  {
    key: '5',
    label: 'GitHub Copilot',
    dir: join(cwd, '.github', 'copilot', 'skills'),
    description: '.github/copilot/skills/',
    global: false,
  },
  {
    key: '6',
    label: 'Codex',
    dir: join(cwd, '.codex', 'skills'),
    description: '.codex/skills/',
    global: false,
  },
  {
    key: '7',
    label: 'Custom path…',
    dir: null,
    description: 'enter a path',
    global: false,
  },
];

// ─── main ────────────────────────────────────────────────────────────────────

async function main() {
  const rl = createInterface({ input: process.stdin, output: process.stdout });

  console.log('\n  🅰️   Angular Skills Installer\n');
  console.log('  Strategy : SKILL.md is copied once (edit freely),');
  console.log('             references/ is symlinked and auto-updates with the package.\n');

  // ── Step 1: choose skill ──────────────────────────────────────────────────
  console.log('  Choose skill:\n');
  for (const skill of SKILLS) {
    console.log(`    [${skill.key}]  ${skill.name.padEnd(30)} ${skill.description}`);
  }

  const skillAnswer = await ask(rl, '\n  Skill (default 1): ') || '1';
  const selectedSkill = SKILLS.find(s => s.key === skillAnswer) ?? SKILLS[0];
  console.log(`\n  Skill    : ${selectedSkill.name}\n`);

  // ── Step 2: choose targets ────────────────────────────────────────────────
  console.log('  Choose install targets (comma-separated, e.g. 1,2):\n');
  for (const agent of AGENTS) {
    console.log(`    [${agent.key}]  ${agent.label.padEnd(28)} ${agent.description}`);
  }

  const answer = await ask(rl, '\n  Targets: ');

  const selected = answer
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);

  if (selected.length === 0) {
    console.log('\n  No targets selected. Exiting.\n');
    rl.close();
    process.exit(0);
  }

  // Resolve targets, prompting for custom path if needed
  const targets = [];
  for (const key of selected) {
    const agent = AGENTS.find(a => a.key === key);
    if (!agent) {
      console.warn(`  ⚠️   Unknown option "${key}" — skipped`);
      continue;
    }

    if (agent.dir === null) {
      // Custom path
      const customPath = await ask(rl, '  Custom path: ');
      if (!customPath) {
        console.warn('  ⚠️   No path entered — skipped');
        continue;
      }
      targets.push({ label: 'Custom', dir: customPath.replace(/^~/, home) });
    } else {
      targets.push({ label: agent.label, dir: agent.dir });
    }
  }

  rl.close();

  if (targets.length === 0) {
    console.log('\n  Nothing to install. Exiting.\n');
    process.exit(0);
  }

  console.log('\n  Installing…');

  const installed = [];
  for (const target of targets) {
    const path = await install(target.dir, target.label, selectedSkill.name);
    installed.push(path);
  }

  console.log(`\n  ✨  Done! Installed to ${installed.length} location${installed.length > 1 ? 's' : ''}:\n`);
  for (const p of installed) {
    console.log(`    ${p}`);
  }

  console.log('\n  To update references at any time:\n    npm update -g angular-skills\n');

  const hasProjectLevel = targets.some(t => !t.dir.startsWith(home));
  if (hasProjectLevel) {
    console.log('  Tip: add the skill directories to .gitignore if you don\'t want to commit them.\n');
  }
}

main().catch(err => {
  console.error('\n❌ ', err.message ?? err);
  process.exit(1);
});
