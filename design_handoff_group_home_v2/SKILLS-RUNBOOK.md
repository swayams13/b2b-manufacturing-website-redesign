# Runbook for Claude Code: group homepage v2

Paste the prompt below into Claude Code at the root of the `Vedanta Website Redesign` repo, after copying this folder to `design_handoff_group_home_v2/`.

## Before you start: install the skills
The three skills are not in the repo yet (`.claude/` has no `skills/` folder). Install each one from its own source, following that source's README. Put them in `.claude/skills/` for this project, or `~/.claude/skills/` for all projects:
1. **Apple design skill by Emil Kowalski**: motion and interaction polish.
2. **UI UX Pro skill**: UX, accessibility and visual-hierarchy review.
3. **Playwright CLI**: already a dependency (`@playwright/test` 1.62.1, `@axe-core/playwright`, `apps/web/playwright.config.ts`, `apps/web/e2e/`). Check it with `pnpm --filter web exec playwright --version`. Install browsers with `pnpm --filter web exec playwright install chromium`.

Adding a skill does not change `package.json`, so it does not trigger the new-dependency review gate. Any new npm package still does.

## Prompt

```
Read CLAUDE.md, docs/datum-design-system.md and design_handoff_group_home_v2/README.md in full.

Task: rebuild apps/web/app/(group)/page.tsx to match the group homepage v2 design in
design_handoff_group_home_v2/reference/. One section per commit, on branch feat/group-home-v2.

Step 0: Decisions. README "Decisions needed" lists 8 conflicts between the prototype and
CLAUDE.md/Datum. Do not build any of them. List each one with your recommendation and stop
until I answer.

Step 1: Build. For each section in README "Screens / sections", in order:
  - reuse the existing datum-ui component if one fits; only add a component when none does
  - tokens only, no arbitrary values; content from content-loader / EntityRecord
  - commit: feat(group-home): <section> per Datum §<n>

Step 2: Apple design skill pass (Emil Kowalski). Apply the skill to the motion and
interaction layer only: header mega panel, scroll reveals, timeline, form feedback,
hover and press states. Keep every change within the motion tokens (§11) and
reduced-motion rules. List each change with before/after. If a change needs a new token,
flag it for §26 review and don't make it.

Step 3: UI UX Pro skill pass. Run the skill's review on the rendered page at 320, 768,
1280 and 1920px. Report hierarchy, readability, CTA clarity, form UX, WCAG 2.2 AA
contrast, focus order and touch targets (44px). Fix only issues that the spec supports;
list the rest as recommendations.

Step 4: Playwright CLI verification. Add apps/web/e2e/group-home-v2.spec.ts covering:
  - axe: zero serious/critical violations on /
  - exactly one accent-filled element in the viewport (RFQ button)
  - one <h1>, no skipped heading levels
  - no horizontal scroll at 320px
  - keyboard tab reaches every nav item, mega panel link and form field, with a visible
    focus ring
  - prefers-reduced-motion: reduce -> page fully usable, no transitions > 0ms
  - enquiry form: required-field errors; API failure shows the "not sent" alert with a
    mailto link, never a success message
  - screenshots of every section at 390 and 1440px into e2e/__screenshots__/group-home-v2/
Run: pnpm --filter web exec playwright test e2e/group-home-v2.spec.ts

Step 5: CLAUDE.md verify: pnpm typecheck && pnpm lint && pnpm test && pnpm build, then the
UI checklist. The verify pass must be separate from the build: hand the diff plus the Datum
sections to a reviewer subagent. Respect the 3-attempt circuit breaker, and log failures
to docs/mistakes.md.

PR description: what was built, the governing spec sections, the Apple, UI UX Pro and
Playwright findings (fixed vs deferred), and any blockers.
```

## Out of scope
- The DESPL exploded-skid concept (`DESPL Exploded Skid.dc.html`) and `DESPL Website v2` are concepts only. Do not build them.
