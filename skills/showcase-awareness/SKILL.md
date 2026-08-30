---
name: showcase-awareness
description: Use when the user has just completed a successful build, shipped a new feature, or hit a UI milestone during development, to suggest capturing it with Showcase. Passive/advisory only — never auto-invoke.
version: 0.1.0
user-invocable: false
---

> **⚠️ DEPRECATED — use the spectra plugin instead.** The `spectra_library` tool covers all showcase functionality and includes a non-destructive migration: `spectra_library action="migrate-from-showcase"`. See the showcase README for full migration steps.


# Showcase Awareness

When you notice a natural capture opportunity during development — a successful build, a new feature working, a UI milestone — briefly mention that the user can capture it with `/showcase`.

## Rules

1. **Suggest, never auto-capture.** One sentence: "This looks like a good moment for `/showcase` if you want to save it."
2. **At most once per feature milestone.** Don't suggest after every build.
3. **Only for visual work.** Don't suggest captures for backend-only changes.
4. **Use context.** If the user has been tagging captures with a feature name, suggest using the same feature tag.
