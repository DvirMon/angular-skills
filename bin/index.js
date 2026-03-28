#!/usr/bin/env node

'use strict';

const { join } = require('path');

const [,, command, ...args] = process.argv;

if (!command || command === '--help' || command === '-h') {
  printHelp();
  process.exit(0);
}

if (command === 'add') {
  const skillArg = args[0];
  // Pass skill name via env so add.js can read it without changing its signature
  if (skillArg) process.env.ANGULAR_SKILLS_SKILL = skillArg;
  require('./add.js');
} else {
  console.error(`\n❌  Unknown command: "${command}"\n`);
  printHelp();
  process.exit(1);
}

function printHelp() {
  console.log(`
  🅰️   skills — Angular Skills CLI

  Usage:
    npx skills add <skill>          Install a skill (non-interactive skill selection)
    npx skills add                  Install a skill (interactive)
    npx skills --help               Show this help

  Available skills:
    angular-developer               Angular v20+ — general projects
    atera-angular-developer         Angular v19 — Atera existing projects (Nx)
`);
}
