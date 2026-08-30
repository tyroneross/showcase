---
name: showcase
description: Main showcase entry. Dispatches to the matching action based on your request, or lists options if unclear.
argument-hint: "[what you want to do]"
---

# /showcase — Router

> **⚠️ DEPRECATED — use the spectra plugin instead.** The `spectra_library` tool covers all showcase functionality. See the showcase README for migration steps.

Route this request to the appropriate Showcase MCP tool based on the user's intent, then call that tool directly. This is the plugin's only command — there are no separate subcommands to dispatch to; call the underlying `showcase` MCP tool yourself using the guidance below.

**Raw user input**: $ARGUMENTS

## Routing logic

1. If `$ARGUMENTS` is empty or only whitespace: list the available actions below and ask the user what they want to do.
2. Otherwise: match the user's natural-language request against the action intents below and call the matching MCP tool directly.
3. If the request clearly doesn't fit any action but matches the `showcase-awareness` skill's guidance, follow that instead.
4. If nothing fits, say so and list the actions. Do NOT guess.

## Available actions

- **capture** — Take a screenshot of a URL, app window, or simulator. If the user provided a target (URL, app name, or `sim:<device>`), use it directly. Otherwise check `.showcaserc.json` for a `baseUrl` or ask what to capture. After capturing, briefly describe what the screenshot shows and mention the capture ID.
- **record** — Record a short video clip (5-30s). Use the provided target, or check `.showcaserc.json` for `baseUrl`, or ask. Default duration is 5 seconds. Mention the output path and capture ID after recording.
- **find** — Search captures by tags, feature, date, or free text. Map the user's criteria to the tool's parameters (tags, feature, component, platform, type, since, query). If no criteria given, show the most recent 10 captures.
- **gallery** — Overview of all captures. Default grouping is by feature; use `group_by` for date, component, or platform if the user asks.
- **export** — Export captures to an output directory with a markdown manifest. Filter by IDs, feature, tags, or starred if the user specifies; otherwise export all starred captures. Default output is `./showcase-export`.
- **status** — Library stats: total captures, by type, storage size.
- **tag** — Add/remove tags, update title, feature, component, or star a capture. Requires a capture ID; if the user references a capture by description rather than ID, run `find` first to locate it.
- **walkthrough** — Record an interactive walkthrough with scripted steps. Use the provided target, or check `.showcaserc.json`, or ask. Build a `steps` array from the user's description — each step needs an `action` (click, type, fill, hover, select, navigate, screenshot, wait, scroll) and relevant parameters. Give each step a descriptive `title` (searchable via `find`). After recording, report: capture ID, step count, any step errors, video path, and manifest path.

For bugs or feedback about the plugin itself, use `/showcase:feedback`.

## Examples

- User types `/showcase` alone → list actions, ask for direction
- User types `/showcase <free-form request>` → match intent, call the matching MCP tool
- User asks for something outside these actions → say so, list the actions, do not guess

## Rules

- Prefer the most specific action match. If two could fit, ask which.
- Never invent an action or MCP tool that isn't listed above.
- If the user is describing a workflow that spans multiple actions, outline the sequence and ask whether to proceed.
