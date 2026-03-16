#!/usr/bin/env node

/**
 * Post-install script for Showcase
 * Shows onboarding message and auto-adds .showcase/ to .gitignore
 */

const fs = require('fs');
const path = require('path');

const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';
const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';

// Skip in CI environments
if (process.env.CI || process.env.CONTINUOUS_INTEGRATION) {
  process.exit(0);
}

console.log('');
console.log(`${BOLD}${CYAN}  ┌─┐┬ ┬┌─┐┬ ┬┌─┐┌─┐┌─┐┌─┐${RESET}`);
console.log(`${BOLD}${CYAN}  └─┐├─┤│ ││ │├─┘├─┤└─┐├┤ ${RESET}  ${BOLD}Dev Asset Capture${RESET}`);
console.log(`${BOLD}${CYAN}  └─┘┴ ┴└─┘└┘┘└─┘┴ ┴└─┘└─┘${RESET}  ${DIM}Screenshots & video for Claude Code${RESET}`);
console.log('');
console.log(`${BOLD}${CYAN}╭─────────────────────────────────────────────────────────────╮${RESET}`);
console.log(`${BOLD}${CYAN}│${RESET}  ${GREEN}Installed successfully!${RESET}                                    ${BOLD}${CYAN}│${RESET}`);
console.log(`${BOLD}${CYAN}╰─────────────────────────────────────────────────────────────╯${RESET}`);

// Auto-add .showcase/ to .gitignore
let projectRoot = process.cwd();
try {
  let dir = path.resolve(__dirname, '..');
  for (let i = 0; i < 10; i++) {
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
    if (fs.existsSync(path.join(dir, 'package.json')) && !dir.includes('node_modules')) {
      projectRoot = dir;
      break;
    }
  }
} catch {
  // Fall back to cwd
}

const gitignorePath = path.join(projectRoot, '.gitignore');
const entry = '.showcase/';

try {
  let content = '';
  let needsAdd = true;

  if (fs.existsSync(gitignorePath)) {
    content = fs.readFileSync(gitignorePath, 'utf-8');
    const lines = content.split('\n').map(l => l.trim());
    if (lines.includes('.showcase/') || lines.includes('.showcase')) {
      needsAdd = false;
    }
  }

  if (needsAdd) {
    const separator = content && !content.endsWith('\n') ? '\n' : '';
    const block = `${separator}\n# Showcase - Dev asset captures\n.showcase/\n`;
    fs.appendFileSync(gitignorePath, block);
    console.log('');
    console.log(`${GREEN}+${RESET} Added ${CYAN}.showcase/${RESET} to .gitignore ${DIM}(captures stay local)${RESET}`);
  }
} catch {
  console.log('');
  console.log(`${YELLOW}!${RESET} Remember to add ${CYAN}.showcase/${RESET} to your .gitignore`);
}

console.log('');
console.log(`${BOLD}Quick Start${RESET}`);
console.log(`${DIM}─────────────────────────────────────────────${RESET}`);
console.log(`  ${GREEN}1.${RESET} Screenshot:  ${CYAN}/showcase:capture${RESET}  ${DIM}(URL, app, or simulator)${RESET}`);
console.log(`  ${GREEN}2.${RESET} Video clip:  ${CYAN}/showcase:record${RESET}   ${DIM}(5-30s MP4)${RESET}`);
console.log(`  ${GREEN}3.${RESET} Find:        ${CYAN}/showcase:find${RESET}     ${DIM}(search by tags/feature)${RESET}`);
console.log(`  ${GREEN}4.${RESET} Export:      ${CYAN}/showcase:export${RESET}   ${DIM}(for blog/website)${RESET}`);
console.log('');
console.log(`${DIM}Docs: https://github.com/tyroneross/showcase${RESET}`);
console.log('');
