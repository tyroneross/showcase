---
name: walkthrough
description: Record an interactive walkthrough with scripted steps
allowed-tools: ["showcase"]
---

Record an interactive walkthrough using the Showcase `walkthrough` tool.

If the user provided a target URL, use it. Otherwise, check `.showcaserc.json` for a `baseUrl` or ask what to record.

Build a steps array based on the user's description of what they want to demonstrate. Each step needs an `action` (click, type, fill, hover, select, navigate, screenshot, wait, scroll) and relevant parameters (selector, text, url, duration, title).

Include a descriptive `title` on each step — these appear in the manifest and are searchable via `find`.

After recording, report: capture ID, step count, any step errors, video path, and manifest path.
