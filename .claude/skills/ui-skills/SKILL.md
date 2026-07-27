---
name: ui-skills
description: Route UI work to the smallest useful expert skill from the ui-skills registry before implementing. Use before any visual, layout, typography, color, motion, animation, interaction, polish, redesign, or component task on this site. Triggers on requests like "polish this", "make it feel better", "improve the spacing/type/motion", "review the animations", "redesign this section".
license: MIT
metadata:
  author: ibelick
  upstream: npx ui-skills
  version: "1.0.0"
---

# UI Skills Root

You are the routing layer for UI Skills.

This skill is shown by `npx ui-skills start` and is also available in the registry.

Use it when an agent in Codex, Cursor, or Claude Code has a clear UI goal.

If the goal is unclear, ask one short question.

If the goal is clear, choose the right category, load the smallest useful skill context, then implement.

## Protocol

1. decide if the task is UI-related
2. if not, return `no skill needed`
3. identify the likely category
4. inspect that category with the CLI
5. select the smallest useful skill set
6. load only selected skill(s)
7. implement using that context

## CLI

```bash
npx ui-skills start
npx ui-skills categories
npx ui-skills list --category <category>
npx ui-skills get <slug>
```

## Selection Rules

Prefer 1 skill.

Use 2 only when the task needs two clear angles.

Use 3 only for broad review, redesign, or multi-surface work.

Never use more than 3.

Route by topic, then stack, then specificity.

Prefer specific skills over broad skills.

Prefer framework-specific skills when the stack is obvious.

For quick cleanup, prefer the most specific craft, visual, or layout skill available.

If unsure, inspect categories and pick the safest narrow skill.

## Notes for this repo

Registry as of 2026-07-26: 185 skills, 47 authors, 26 categories.

`get` resolves top-level slugs only, in either form (`author/name` or `baseline-ui`).
Companion files a skill links to (e.g. `review-animations` -> `STANDARDS.md`) are
NOT fetchable — `get <slug>/<file>.md` returns "Skill not found". Treat any skill
that defers its value tables to a sub-file as partially loaded, and say so rather
than inventing the missing numbers.

This site has documented, deliberate decisions in CLAUDE.md that some skills will
flag as violations — most notably the acknowledgment/scenery motion split, where
hover feedback answers in 160ms but decorative travel (image glide 800ms, plate
light 400ms) stays slow on purpose. A generic "UI animations must be under 300ms"
finding is arguing against a call the user already made. Sort findings into "real"
versus "conflicts with a documented decision" and defend the latter.
