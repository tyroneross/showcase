> **⚠️ DEPRECATED — use the spectra plugin instead.** The `spectra_library` tool covers all showcase functionality and includes a non-destructive migration: `spectra_library action="migrate-from-showcase"`. See the showcase README for full migration steps.

<!-- Plugin: showcase · Version: 0.1.3 · Source of truth: local (~/dev/git-folder/showcase) -->
<!-- Before any commit, version bump, or major change, read ./VERSIONING.md. Update it on version bumps. -->

# Showcase — Dev Asset Capture

Capture screenshots and video clips during development for blog/website content.

## Tools (MCP)

| Tool | Purpose |
|------|---------|
| `capture` | Screenshot of URL, screen, or simulator |
| `record` | Short video clip (5-30s) |
| `find` | Query captures by tags, feature, date, platform |
| `tag` | Add/remove tags, update metadata, star |
| `gallery` | List all captures grouped by feature/date/component |
| `export` | Copy captures to output dir with markdown manifest |
| `status` | Library stats |
| `walkthrough` | Interactive scripted walkthrough with video + per-step screenshots |
| `delete` | Remove capture + media |

## Commands

| Command | Purpose |
|---------|---------|
| `/showcase` | Router — dispatches to the matching MCP tool (capture/record/find/tag/gallery/export/walkthrough/status) based on intent |
| `/showcase:submit-feedback` | Report a bug or request a feature |

## Capture Targets

- **URL** (`http://...`, `localhost:...`) — Playwright web screenshot/video
- **App name** (anything else) — macOS `screencapture` of app window
- **Simulator** (`sim:<device>`) — `xcrun simctl io` screenshot/video

## Storage

`.showcase/` — index.json + media/ directory. Tags/features are metadata, not filesystem structure.
