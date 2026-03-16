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
| `delete` | Remove capture + media |

## Commands

| Command | Purpose |
|---------|---------|
| `/showcase:capture` | Take a screenshot |
| `/showcase:record` | Record a video clip |
| `/showcase:find` | Search captures |
| `/showcase:tag` | Tag a capture |
| `/showcase:gallery` | Overview of all captures |
| `/showcase:export` | Export for blog/website |
| `/showcase:status` | Library stats |

## Capture Targets

- **URL** (`http://...`, `localhost:...`) — Playwright web screenshot/video
- **App name** (anything else) — macOS `screencapture` of app window
- **Simulator** (`sim:<device>`) — `xcrun simctl io` screenshot/video

## Storage

`.showcase/` — index.json + media/ directory. Tags/features are metadata, not filesystem structure.
