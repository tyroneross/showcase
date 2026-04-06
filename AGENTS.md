# AGENTS.md — Showcase

Universal AI agent guidance for this codebase. Applies to Claude Code, Codex, Cursor, Copilot, Gemini CLI, and any other AI coding agent.

## What This Is

Showcase is a dev asset capture plugin for Claude Code. It captures screenshots and video clips during development for use in blog posts, documentation, and website content.

- **Package:** `@tyroneross/showcase` v0.1.0
- **Runtime:** Node.js >= 20, TypeScript (ESM)
- **Dual role:** npm package + Claude Code plugin

## Development Commands

```
npm install       # Install deps (Playwright is an optional peer dep)
npm run build     # Compile TypeScript → dist/
npm run dev       # Watch mode
npm run clean     # Remove dist/
```

No test command is wired up yet. Build verification is the current baseline.

## Architecture Overview

```
showcase/
  src/
    types.ts          # All shared interfaces (CaptureEntry, FindQuery, etc.)
    config.ts         # ShowcaseConfig + loadConfig()
    index.ts          # Public API exports
    capture/          # Capture backends — one file per target type
      detect.ts       # Resolves target string → CaptureTarget
      web.ts          # Playwright (URL targets)
      screen.ts       # macOS screencapture (app name targets)
      simulator.ts    # xcrun simctl io (sim:<device> targets)
      recorder.ts     # Video recording orchestration
      transcode.ts    # WebM → MP4, thumbnail extraction
      interact.ts     # Playwright interaction primitives for walkthroughs
    mcp/
      server.ts       # MCP server entry point (bin: showcase)
      tools.ts        # All 9 tool definitions + handlers
    storage/
      index.ts        # index.json CRUD (loadIndex, addCapture, updateCapture, deleteCapture)
      media.ts        # File path helpers, ID generation, base64 read
    metadata/
      query.ts        # filterCaptures(), groupCaptures()
  commands/           # Claude Code slash command definitions (.md files)
  hooks/
    hooks.json        # Hook definitions (PostToolUse, SessionStart)
  skills/
    showcase-awareness/
      skill.md        # Passive skill — suggests capture at natural moments
  .claude-plugin/
    plugin.json       # Plugin manifest (commands, hooks, skills, mcpServers)
  scripts/
    postinstall.js    # Runs after npm install
  dist/               # Compiled output (do not edit)
```

## Capture Targets

The `detect.ts` module resolves the `target` string passed to `capture`, `record`, and `walkthrough` into one of three code paths:

| Input format | Source | Backend |
|---|---|---|
| `http://...` or `localhost:...` | `web` | Playwright (`web.ts`) |
| Anything else (e.g. `Safari`) | `screen` | macOS `screencapture` (`screen.ts`) |
| `sim:<device>` (e.g. `sim:iPhone 16 Pro`) | `simulator` | `xcrun simctl io` (`simulator.ts`) |

When modifying capture logic, identify which code path applies. Changes to one backend do not affect the others.

## MCP Tools

Defined and dispatched in `src/mcp/tools.ts`. All 9 tools are registered in the `TOOLS` array and routed through `handleToolCall()`.

| Tool | Type | Description |
|---|---|---|
| `capture` | write | Screenshot — returns image to Claude + saves to `.showcase/` |
| `record` | write | Video clip (5-30s) — saves MP4 |
| `find` | read | Query captures by tags, feature, component, platform, date, free text |
| `tag` | write | Add/remove tags, update title/feature/component, star/unstar |
| `gallery` | read | List all captures grouped by feature, date, component, or platform |
| `export` | write | Copy captures to output dir with optional markdown manifest |
| `status` | read | Library stats (counts, storage size, last capture) |
| `walkthrough` | write | Scripted Playwright walkthrough — per-step screenshots + MP4 |
| `delete` | destructive | Remove capture entry + media files |

## Commands

8 slash commands in `commands/`. Each file is a Markdown definition consumed by the Claude Code plugin system.

| Command | File |
|---|---|
| `/showcase:capture` | `commands/capture.md` |
| `/showcase:export` | `commands/export.md` |
| `/showcase:find` | `commands/find.md` |
| `/showcase:gallery` | `commands/gallery.md` |
| `/showcase:record` | `commands/record.md` |
| `/showcase:status` | `commands/status.md` |
| `/showcase:tag` | `commands/tag.md` |
| `/showcase:walkthrough` | `commands/walkthrough.md` |

To change a command's behavior or description, edit the corresponding `.md` file. Do not rename files without updating `plugin.json`.

## Hooks

Defined in `hooks/hooks.json`. Two active hooks:

| Event | Matcher | Behavior |
|---|---|---|
| `PostToolUse` | `Bash` | If the command output indicates a successful build/deploy/server start and the user is doing UI work, suggest `/showcase:capture` in one sentence. Does NOT auto-capture. |
| `SessionStart` | (all sessions) | Reminds the user that Showcase commands are available. |

Hooks use `type: "prompt"` — they inject text into Claude's context, not executable code. Keep them lightweight.

## Skills

One skill: `skills/showcase-awareness/skill.md`

This is a passive awareness skill. It watches for natural capture moments (e.g. "I just built the new dashboard") and suggests capture without being intrusive. Keep suggestions short and non-blocking. Do not convert this into an auto-capture behavior.

## Plugin Manifest

`/.claude-plugin/plugin.json` registers this plugin with Claude Code:

```json
{
  "commands": "./commands",
  "hooks": "./hooks/hooks.json",
  "skills": "./skills",
  "mcpServers": "./.mcp.json"
}
```

The MCP server entry point is `dist/mcp/server.js` (compiled from `src/mcp/server.ts`), exposed as the `showcase` bin.

## Storage

All captures are stored under `.showcase/` in the project root where the plugin is active.

```
.showcase/
  index.json      # Registry of all captures (ShowcaseIndex schema)
  media/
    <id>/         # One directory per capture
      original.png / original.mp4
      thumb.png         (video only)
      step_N.png        (walkthrough only)
      walkthrough.json  (walkthrough only)
```

**Schema:** `index.json` uses `{ version: "1", captures: CaptureEntry[] }`. The `CaptureEntry` type is the authoritative schema in `src/types.ts`.

Tags, feature, and component are metadata fields on `CaptureEntry`. They are not reflected in the filesystem structure.

**Cascade impact:** Changes to `CaptureEntry` fields affect `find`, `gallery`, `export`, and `tag`. Update all four handlers in `src/mcp/tools.ts` and the query logic in `src/metadata/query.ts` when modifying the schema.

## Key Constraints

- **No LLM calls.** This plugin runs inside Claude Code. Claude is the LLM. Do not add external API calls for interpretation or generation.
- **Playwright is optional.** Web captures and walkthroughs require it; app and simulator captures do not. Guard Playwright imports — the package must install cleanly without it.
- **macOS only** for app-name and simulator captures. `screencapture` and `xcrun simctl` are macOS-specific binaries.
- **IDs are stable.** Capture IDs (`cap_` + 6-byte base64url) are used in filenames, index references, and user-facing output. Never reassign or reuse them.
- **index.json is the source of truth.** Do not infer library state from the filesystem. Always read through `src/storage/index.ts`.

## Where to Make Changes

| What you want to change | Where to look |
|---|---|
| How a URL is captured | `src/capture/web.ts` |
| How a macOS app is captured | `src/capture/screen.ts` |
| How an iOS simulator is captured | `src/capture/simulator.ts` |
| How video is recorded | `src/capture/recorder.ts` |
| How WebM is converted to MP4 | `src/capture/transcode.ts` |
| How the target string is resolved | `src/capture/detect.ts` |
| A specific MCP tool's behavior | `src/mcp/tools.ts` → `handle<ToolName>()` |
| A slash command's description or instructions | `commands/<name>.md` |
| Hook trigger conditions or messaging | `hooks/hooks.json` |
| The passive capture suggestion skill | `skills/showcase-awareness/skill.md` |
| index.json read/write logic | `src/storage/index.ts` |
| File path conventions and ID generation | `src/storage/media.ts` |
| Filter and grouping logic for find/gallery | `src/metadata/query.ts` |
| Shared types and interfaces | `src/types.ts` |
| Default config values | `src/config.ts` |
