# Showcase - Versioning & Source of Truth

> **Status (2026-09-03):** this plugin is deprecated in favour of `spectra`, and the release
> ritual below is no longer run. `.claude-plugin/plugin.json` and `.codex-plugin/plugin.json`
> deliberately omit `version`, so the plugin version resolves to the git commit SHA and cannot
> go stale against `package.json`. The `Current` section records the last hand-cut release.

## Current

- **Version:** 0.1.3
- **Source of truth:** Local dev (`~/Desktop/git-folder/showcase`)
- **Also available at:**
  - GitHub: https://github.com/tyroneross/showcase
  - npm: `@tyroneross/showcase`
  - Marketplace: `showcase` in `RossLabs-AI-Toolkit` (via GitHub source)
- **Claude Code registry entry:** `showcase@local` (loaded directly from source path; no cache dir)

## Key changes in 0.1.0

- Initial release: screenshot + video clip capture for blog/website content
- macOS capture support (Swift window resolver, full-screen video recording)
- MCP tools for capture, tag, gallery, export, status
- Initial 8 slash commands

## Where to look for the latest version

| Source | Location | Notes |
|---|---|---|
| **Authoritative** | `~/Desktop/git-folder/showcase/.claude-plugin/plugin.json` | Local dev — canonical |
| GitHub | github.com/tyroneross/showcase | Public mirror |
| npm | `@tyroneross/showcase` | Published releases (marketplace installs pull from here) |
| Marketplace manifest | `~/Desktop/git-folder/RossLabs-AI-Toolkit/.claude-plugin/marketplace.json` | Must be kept in sync with plugin.json version |

When "latest" is ambiguous, trust **local dev** first, then npm, then marketplace.json.

## Release discipline (enforce before committing a version bump)

1. Bump `version` in `.claude-plugin/plugin.json`
2. Update the version stamp in `CLAUDE.md` (line 1 HTML comment)
3. Update this file's `Current` section + add an entry to `Version history` below
4. **Update `~/Desktop/git-folder/RossLabs-AI-Toolkit/.claude-plugin/marketplace.json`** — bump the version string for the `showcase` entry
5. Back up, then update `~/.claude/plugins/installed_plugins.json` → `installPath` + `version` for every entry of this plugin
6. Run `/reload-plugins` in Claude Code
7. Commit `plugin.json`, `CLAUDE.md`, `VERSIONING.md` together in one commit; update the marketplace repo separately

Showcase is `@local` scope — loaded directly from the source dir, no cache dir, no cache drift possible. Drift risk is only in marketplace.json sync.

## Version history

- **0.1.3** (current): Surface reduction — commands collapsed to `/showcase` (router) + `/showcase:feedback`; the 8 individual action commands (capture/record/find/tag/gallery/export/status/walkthrough) were deleted since the router now calls the MCP tools directly and no session in transcript mining ever invoked them as slash commands. `skills/showcase-awareness` marked `user-invocable: false` and renamed `skill.md` → `SKILL.md`.
- **0.1.2**: (undocumented in this file — pre-existing gap)
- **0.1.0**: Initial release with macOS capture, walkthrough support, MCP + slash commands
