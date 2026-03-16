---
name: capture
description: Take a screenshot of a URL, app window, or simulator
allowed-tools: ["showcase"]
---

Take a screenshot using the Showcase `capture` tool.

If the user provided a target (URL, app name, or sim:<device>), use it directly. Otherwise, check if there's a `baseUrl` in `.showcaserc.json` or ask what to capture.

After capturing, briefly describe what the screenshot shows and mention the capture ID for future reference.
