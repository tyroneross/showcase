# showcase — DEPRECATED

> **⚠️ Deprecated in favour of [`spectra`](https://github.com/tyroneross/spectra) as of 2026-04-21.**
>
> Spectra's `spectra_library` tool (introduced in v0.2.0) covers everything showcase did — `find`, `tag`, `gallery`, `export`, `status`, `delete`, `walkthrough` — plus richer capture via CDP and native Swift AX. The library schema is forward-compatible, so migration is one command:
>
> ```
> spectra_library action="migrate-from-showcase" showcasePath=./.showcase
> ```
>
> The migration is non-destructive: your existing `.showcase/` directory is left in place. After verifying the captures land under `.spectra/library/`, you can archive `.showcase/` at your leisure.
>
> **What to do today**
>
> 1. Install spectra: add the `rosslabs-ai-toolkit` marketplace if you haven't, then `/plugin install spectra@rosslabs-ai-toolkit`.
> 2. Run `spectra_library action="migrate-from-showcase"` in any project where you have `.showcase/` content.
> 3. Switch slash-command habits: `/showcase:find` → `/spectra:library`, `/showcase:capture` → `/spectra:capture` (plus `spectra_library action="add"` to register the capture in the library).
>
> The GitHub repo stays read-accessible for 90 days and will then be archived. No new features will ship.

---

Dev asset capture for AI coding agents — screenshots, video clips, and walkthrough assets for blog, website, and product content.

## Claude Code

This repo ships the existing Claude Code plugin package at the repository root. Claude-specific hooks, slash commands, skills, and MCP wiring remain unchanged.

## Codex

This package now ships an additive Codex plugin surface alongside the existing Claude Code package. The Claude package remains authoritative for Claude behavior; the Codex package adds a parallel `.codex-plugin/plugin.json` install surface without changing the Claude runtime.

Package root for Codex installs:
- the repository root (`.`)

Primary Codex surface:
- skills from `./skills` when present
- MCP config from `./.mcp.json` when present

Install the package from this package root using your current Codex plugin install flow. The Codex package is additive only: Claude-specific hooks, slash commands, and agent wiring remain unchanged for Claude Code.
