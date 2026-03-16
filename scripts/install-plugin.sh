#!/bin/bash
# Install Showcase as a Claude Code plugin
# Usage: bash scripts/install-plugin.sh [--global]

set -e

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PLUGIN_DIR="$SCRIPT_DIR"
INSTALLED_PLUGINS="$HOME/.claude/plugins/installed_plugins.json"

register_plugin() {
  node -e "
const fs = require('fs');
const path = '$INSTALLED_PLUGINS';
const installPath = '$1';
const now = new Date().toISOString();

let data = { version: 2, plugins: {} };
try {
  if (fs.existsSync(path)) {
    data = JSON.parse(fs.readFileSync(path, 'utf-8'));
  }
} catch {}

const key = 'showcase@local';
if (data.plugins[key]) {
  data.plugins[key][0].installPath = installPath;
  data.plugins[key][0].lastUpdated = now;
} else {
  data.plugins[key] = [{
    scope: 'user',
    installPath: installPath,
    version: '0.1.0',
    installedAt: now,
    lastUpdated: now
  }];
}

fs.mkdirSync(require('path').dirname(path), { recursive: true });
fs.writeFileSync(path, JSON.stringify(data, null, 2));
"
}

if [[ "$1" == "--global" ]]; then
  CLAUDE_PLUGINS_DIR="$HOME/.claude/plugins"
  mkdir -p "$CLAUDE_PLUGINS_DIR"

  LINK_PATH="$CLAUDE_PLUGINS_DIR/showcase"
  if [ -L "$LINK_PATH" ]; then
    rm "$LINK_PATH"
  fi
  ln -sf "$PLUGIN_DIR" "$LINK_PATH"
  echo "Showcase plugin linked globally: $LINK_PATH -> $PLUGIN_DIR"

  register_plugin "$PLUGIN_DIR"
  echo "Registered showcase in Claude Code plugin registry"
else
  CWD="${2:-$(pwd)}"
  CLAUDE_DIR="$CWD/.claude"
  mkdir -p "$CLAUDE_DIR"

  CLAUDE_PLUGINS_DIR="$HOME/.claude/plugins"
  mkdir -p "$CLAUDE_PLUGINS_DIR"
  LINK_PATH="$CLAUDE_PLUGINS_DIR/showcase"
  if [ ! -L "$LINK_PATH" ] && [ ! -d "$LINK_PATH" ]; then
    ln -sf "$PLUGIN_DIR" "$LINK_PATH"
  fi
  register_plugin "$PLUGIN_DIR"

  echo "Showcase plugin installed for project: $CWD"
  echo ""
  echo "Commands available:"
  echo "  /showcase:capture  — Take a screenshot"
  echo "  /showcase:record   — Record a video clip"
  echo "  /showcase:find     — Search captures"
  echo "  /showcase:gallery  — View all captures"
  echo "  /showcase:export   — Export for blog/website"
fi

echo ""
echo "Done. Restart your Claude Code session to activate hooks."
