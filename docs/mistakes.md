# mistakes.md — append-only incident log

One entry per incident: date · what happened · root cause · rule that prevents recurrence.
If the rule is general, promote it into CLAUDE.md.

---
<!-- entries go below this line -->

## 2026-09-03 — Header utility-bar text-white/66: another missing opacity-scale step (RESOLVED same day)

**What happened:** while re-verifying the VG-004 dark-ground contrast
fix (see below), axe still flagged `/`, `/about/`, `/industries/*`,
`/capabilities/*`, and every other GroupChrome-only route with a
`color-contrast` violation on `<a href="/dhruv-epc">Dhruv EPC
Solutions</a>` — the utility-bar company-switcher link. Computed style:
`color: rgb(26, 30, 34)` (steel-950) against `bg-steel-900` — 1.12:1,
effectively invisible — despite `Header.tsx` line 154's className
plainly reading `text-white/66`. `document.styleSheets` search
confirmed no `.text-white\/66` rule existed anywhere in the built CSS
at all — the class silently compiled to nothing, so the link fell back
to its inherited default text color.

**Root cause:** identical failure mode to the already-documented 72/82/
92 opacity steps in `packages/tokens/src/tailwind.ts` (see its own
comment block, in place since an earlier phase) — Tailwind's color
opacity modifier (`/NN`) only recognizes percentages explicitly
registered in the theme's `opacity` scale; `66` was never added, even
though the pattern for adding missing steps was already established
and commented in the same file. A `pnpm build` that reused a stale
`.next` cache also initially masked the fix — after adding `66: '.66'`
to the scale, the first rebuild still didn't emit the rule; only a full
`rm -rf apps/web/.next node_modules/.cache/turbo` rebuild picked it up.

**Resolved same day:** added `66: '.66'` to `tailwind.ts`'s `opacity`
extension, following the exact pattern already used for 60/72/82/88/92.
Confirmed `.text-white\/66{color:hsla(0,0%,100%,.66)}` now emits in the
built CSS, and the link is legible against `bg-steel-900`.

**Rule that prevents recurrence:** general rule already existed
("Tailwind's opacity modifier only recognizes its own preset percentage
steps") but wasn't checked against every `/NN` usage in the codebase
when it was written — a `grep -rn "text-\|border-\|bg-" -E '/(6[0-9]|7[0-9]|8[0-9]|9[0-9])"' packages/datum-ui apps/web` sweep against `tailwind.ts`'s registered `opacity` keys would catch the next one before axe does. Also: when a Tailwind/CSS-generation fix doesn't seem to take effect, suspect the build cache before the fix itself — `rm -rf .next` before concluding a config change didn't work.

## 2026-09-02 — VG-004 has moved: Header's contrast bug is fixed, ProductCard's `onDark` captions are the new instance (RESOLVED 2026-09-03)

**What happened:** FINAL_IMPLEMENTATION_PLAN.md Phase 23 requires
re-checking VG-004's status after the Header rewrite (Phase 5) — its
exact wording: "VG-004's status after the Header rewrite remains
unknown until Phase 23." Ran axe against every route in
`apps/web/lib/routes.ts`'s `ROUTES` (not just the ones already skipped
in `a11y.spec.ts`'s `KNOWN_FAILURES`). Result: the *original* VG-004
root cause — `text-steel-500` menu/caption text on the Header's dark
utility bar and mega-menu — is gone; every route that used to fail on
header/mega-menu contrast (`/precise-engineers/capabilities/`,
`/precise-engineers/proof/`) is now clean and has been un-skipped in
`a11y.spec.ts`. But every route still in `KNOWN_FAILURES` still fails —
axe now reports a *different* node: `ProductCard.tsx`'s `onDark`
variant renders `oneLineScope`/spec-row/index captions with a bare
`text-steel-500` (#707070) against the card's `bg-steel-900` (#23282d)
— 3:1, needs 4.5:1. Confirmed via zoomed axe output on `/dhruv-epc/`
(fgColor #707070, bgColor #23282d, contrastRatio 3, expected 4.5).

**Root cause:** `packages/datum-ui/src/components/ProductCard.tsx` has
an `onDark` prop that correctly swaps some text (line 60:
`onDark ? 'text-accent-dark' : 'text-accent'`) but the caption/spec-row/
index text at lines 93, 98, 104, 145, 150 is unconditionally
`text-steel-500` regardless of `onDark` — the component author branched
the accent color but forgot to branch the caption color, so the "dark
ground, premium industrial grid" variant (§T-2 comment) inherited the
light-ground caption token, which fails contrast on `steel-900`.

**Decision, this session:** not fixed — Phase 23's own file scope is
"none, except `a11y.spec.ts`'s `KNOWN_FAILURES`". `KNOWN_FAILURES`
already covers every route where this now surfaces (same route list,
different underlying node), so no test-file change was needed for the
still-failing routes; only the two newly-clean routes were un-skipped.
Routes back to Phase 8 (shared cards/buttons/forms/certification
components), which is where `ProductCard.tsx`'s `onDark` variant was
built.

**Rule that prevents recurrence:** when a component adds an `onDark`/
inverse-ground variant, grep every `text-steel-500` (or any token whose
contrast covenant is scoped to a light background) in that file — each
one needs an explicit dark-ground counterpart, not just the accent
color. A prop that changes the ground should be treated as changing
*every* text token's contrast requirement, not just the ones the author
happened to think of.

**Resolved 2026-09-03:** swapped `text-steel-500`/`text-steel-600` for
`text-steel-400` on every `onDark` caption in `ProductCard.tsx`,
`CategoryCard.tsx`, and `IndustryCard.tsx` (the same sibling-component
bug existed in all three, same phase, same fix). While verifying, found
two more instances of the identical dark-ground pattern: Header's
utility-bar links used `text-white/66`, an opacity step never
registered in the Tailwind preset (silently compiled to nothing — see
its own write-up below); and the group homepage's "Two specialized
works" door cards had one straggler `text-steel-600` caption
inconsistent with its own sibling tokens. Fixed both. Verified via axe
against every route: 52/53 pass (was ~30/53 skipped under
`KNOWN_FAILURES`); the one remaining skip is the unrelated, pre-existing
`/request-a-quote/thank-you/` one-off (steel-400 on a *light* steel-50
card — a different root cause, still open).

## 2026-09-02 — Header.tsx: logo lockup overlaps primary nav at the exact 768px (`md`) breakpoint (RESOLVED 2026-09-03)

**What happened:** FINAL_IMPLEMENTATION_PLAN.md Phase 22 (responsive
validation) requires a visual pass at 320/375/390/768/1024/1440px. At
exactly 768px viewport width, on all three chromes (Group, Dhruv EPC,
Precise Engineers), the multi-line logo lockup (company name + tagline,
e.g. "VEDANTA GROUP" / "OF COMPANIES · EST. 1994", or "DHRUV EPC" /
"SOLUTION PVT. LTD") visually overlaps the primary nav trigger
("Products"/"Equipment") — the nav text renders on top of / behind the
logo's second line. On Precise Engineers the RFQ button is pushed
entirely out of the visible header row. Confirmed via
`window.innerWidth` + zoomed screenshot on all three routes (`/`,
`/dhruv-epc/`, `/precise-engineers/`) at 768×900. At 1024px and above
the same logos still wrap to 2 lines but no longer collide with nav —
there's enough horizontal room. `document.documentElement.scrollWidth`
stays equal to `innerWidth` throughout (no horizontal scrollbar), so
this is a pure z-index/overlap collision, not a layout-overflow bug —
easy to miss without an exact-768px visual check.

**Root cause:** `packages/datum-ui/src/components/Header.tsx`'s desktop
nav row (`md:flex`, active from 768px up) assumes the logo lockup and
nav links + icons + RFQ button all fit on one row starting at exactly
768px. The logo lockup's font size doesn't shrink at the `md` breakpoint
specifically (it's the same size from 768px to 1024px+), so the
narrowest width in the desktop-nav range is also the tightest fit —
and it doesn't fit.

**Decision, this session:** not fixed. Per FINAL_IMPLEMENTATION_PLAN.md
Phase 22's own scope ("No files touched — findings route back to their
originating phase"), this is logged here and in progress.md Session 34
rather than edited inline. Routes back to Phase 5 (Header + utility
strip).

**Rule that prevents recurrence:** any component with a `md:`-gated
layout switch (mobile → desktop nav) must be visually checked at
exactly the breakpoint's minimum width (768px for `md`, not just
"768 and up" sampled at 1024/1440) — the tightest fit is always at the
boundary, not in the middle of the range.

**Resolved 2026-09-03:** moved the main-row breakpoint from `md`
(768px) to `lg` (1024px) — the hamburger/MobileDrawer path already
handles any width below its breakpoint correctly, so widening its
range was the fix, not shrinking the logo or nav content (which would
have needed new arbitrary values). Confirmed clean at 768px (hamburger,
no overlap) on all 3 chromes and no regression at 1024px (full desktop
nav still renders correctly).

## 2026-09-02 — apps/web/scripts/snapshot-routes.mjs's ROUTES list is stale post-VG-012 (RESOLVED 2026-09-02, Phase 24)

**What happened:** FINAL_IMPLEMENTATION_PLAN.md Phase 1 (token foundations, cool-ramp remap) requires "Snapshot: regenerate and commit" after the token change. Running `node apps/web/scripts/snapshot-routes.mjs` against a fresh `pnpm build` reports 17/30 routes missing and exits 1.

**Root cause:** `snapshot-routes.mjs`'s hardcoded `ROUTES` array still lists the pre-VG-012 URLs (`/dhruv-epc/equipment/heat-exchangers`, `/precise-engineers/products/metallic-bellows-expansion-joint`, …). Session 22 (VG-012, dynamic product routing) moved every product page to `/{company}/products/{category}/{slug}/` and deleted the old flat routes, but never updated this script — it was written and last touched in Session 21 (PR #18), one session before the routing change that broke it.

**Decision, at the time:** left unfixed across Phases 1/21/22 — a mechanical fix, but out of scope for those phases' own file lists, per this file's own scope-discipline rule (log unrelated bugs, don't fix inline). Each of those sessions substituted a manual visual smoke check instead.

**Resolved 2026-09-02 (Phase 24, "Snapshot finalization"):** the plan's own Phase 24 purpose ("confirmation pass... any diff here signals an earlier phase's snapshot commit was incomplete") made this the natural point to fix it — the plan wins over the harness's own frozen-baseline framing per CLAUDE.md's "if code and spec disagree, the spec wins." Rewrote `snapshot-routes.mjs` to auto-discover every `.html` file under `.next/server/app` instead of hand-maintaining a second route list, and regenerated `__snapshots__/routes-baseline/` fresh (53 routes, up from 30) as the new anchor — the old pre-VG-012 baseline could never again produce a meaningful diff once those URLs stopped existing. `pnpm snapshot:baseline && pnpm snapshot:compare` now report 53/53 byte-identical.

**Rule that prevents recurrence:** solved structurally, not procedurally — the script no longer has a second, hand-maintained route list to drift from `apps/web/lib/routes.ts` or `app/**/page.tsx`. It derives routes from the same build output it snapshots.

## 2026-08-31 — scripts/build-redirects.mjs's main() guard never ran on this machine

**What happened:** VG-012 (dynamic product routing, session 5) needed to regenerate `apps/web/lib/redirects.generated.ts` after adding 17 rows to `content/redirect-map.csv`. `node scripts/build-redirects.mjs` exited 0 with no output and left the file untouched — silently. `LEGACY_REDIRECT_COUNT` stayed at 56 (a stale pre-session value) instead of updating to 73.

**Root cause:** the entrypoint guard was `if (import.meta.url === \`file://${process.argv[1]}\`) main()` — naive string concatenation instead of `pathToFileURL(process.argv[1]).href`. `import.meta.url` percent-encodes special characters (spaces, etc.); the raw concatenation doesn't. This repo's absolute path contains spaces (`.../AI DEVELOPMENT DESPL/Vedanta Website Redesign/...`), so the two strings never matched and `main()` silently never executed, on this machine, regardless of how the script was invoked (relative or absolute argv).

**Rule that prevents recurrence:** `check-redirect-map-integrity.mjs` already uses the correct `pathToFileURL` form (fixed 2026-08-30, see the CI-workflow-YAML entry above) — `build-redirects.mjs` was the sibling script nobody re-checked. Fixed here the same way. Any new Node script with an `if (import.meta.url === ...) main()` entrypoint guard must use `pathToFileURL(process.argv[1]).href`, never string concatenation — and should be exercised at least once by hand (check the file it writes actually changed) before being trusted as "wired to build," since a silently-skipped generator step produces no error, just stale output.

## 2026-08-31 — link-integrity.test.ts's HREF_RE matches inside comments and template literals

**What happened:** while building the session-5 dynamic product route, computed URLs assigned inline to any `...href`/`...Href`-named prop or object key (including via backtick template literals with interpolation) were misread by `lib/link-integrity.test.ts`'s `HREF_RE` as hardcoded broken-looking literals — despite that test file's own comment claiming template literals with interpolation are "intentionally not matched." They are, in fact, matched: the regex's `[^'"\`]*` capture class doesn't treat `${...}` specially. The regex also scans comments, not just live code — an explanatory code comment that happened to contain the literal text `href: '/...'` as an example was itself flagged as a broken link.

**Root cause:** `HREF_RE` is a plain text-scan regex with no awareness of template-literal interpolation or comment boundaries; its own header comment overstates what it excludes.

**Rule that prevents recurrence:** any newly-computed URL that would be assigned to a name ending in `href`/`Href` must go through a named helper function call (see `apps/web/lib/product-urls.ts`) rather than an inline template literal — a function call doesn't match `HREF_RE` because the character immediately after `[:=]\s*\{?\s*` isn't a quote. When writing comments near such code, avoid literal text shaped like `href: '/...'` or `href={'/...'}` even as an illustrative example — the scanner can't tell code from prose.

## 2026-07-16 — AI-generated images used as exploded-view frames (rule override)

**What happened:** Gemini-generated renders (not real works photography) placed in `apps/web/public/exploded/` for all three products (heat-exchanger, pressure-vessel, expansion-joint). CLAUDE.md §Never explicitly bans AI-generated images from the site.

**Root cause:** No real works photography exists yet for the exploded-view sequence feature. AI renders were generated as the only available source while real photography is pending.

**Decision:** User explicitly approved the override ("Rule override — use as-is") for the phase-4 prototype. The `// ═══ PLACEHOLDER PATHS — swap in real generated frames before launch ═══` comment in all three content files marks the replacement obligation.

**Rule that prevents silent recurrence:** Any PR touching `apps/web/public/` image files must state in the PR description whether the images are real works photography or AI renders. AI renders require explicit human sign-off in the PR. Never silently treat renders as photography in commit messages.

## 2026-07-09 — primitives.ts flex scale written without human review

**What happened:** Session 0 scaffold wrote hex values for the `flex` company colour scale (`flex-50` through `flex-900`) into `packages/tokens/src/primitives.ts` without first getting the exact palette approved by Swayam. BUILD-PLAYBOOK.md Session 2 is explicit that new hex values require human approval before being committed.

**Root cause:** The agent inferred placeholder colours to make `semantic.ts` satisfy `Record<Company, typeof semanticBase>` rather than blocking and requesting the real values.

**Rule:** Never write hex primitives for a company colour scale without explicit human sign-off. If real values are unknown, write `// TODO: get hex from client` comments and leave the build broken until they arrive. Do not invent plausible colours to make types pass.

**Resolution (2026-07-09):** Swayam reviewed two options — blue (Datum §5 spec) vs maroon (existing brand CSS). Approved Option A: blue. Rationale: group home two-doors pattern requires amber vs blue to read as distinct companies; amber vs maroon is visually muddled (2.02:1 contrast between the two). Existing site maroon also shared with Vedanta wordmark — entity bleed risk on Precise routes. Approved values: `flex-300: #5BA8D4`, `flex-500: #0E6BA8`, `flex-600: #0A5589`, `flex-700: #083F6A`. WCAG at flex-500 vs white: 5.70:1 (AA ✓). No code change required — these values were already in primitives.ts. Gap closed.

---

## 2026-07-09 — Precise RFQ button label has no contrast on flex-500

**What happened:** Session 2 contrast tests found that `steel-950` text on `flex-500` fill yields only 3.19:1 — below the 4.5:1 WCAG AA minimum for normal text. The Datum spec (§13) defines RFQ button as "arc-500 fill, steel-950 text" for Dhruv (amber background, dark text = 5.79:1 ✓), but doesn't specify the label color for Precise's blue variant.

**Root cause:** Spec §13 was written with Dhruv/arc in mind. The Precise company color map (`semanticPrecise`) inherited `rfq: flex[500]` fill from the extension pattern, but the label text stayed `steel[950]` — unexamined against flex-500's luminance.

**Rule:** When adding a company color variant to the semantic layer, verify all contrast pairs for that company's RFQ button (fill × label) explicitly. Don't assume the base company's text color works on the new fill.

**Fix applied (2026-07-09):** Added `rfqFg` to the semantic action map. Dhruv keeps `steel[950]`; Precise overrides to `steel[50]` (~7.1:1 on flex-500 ✓). This token is a design-review event per CLAUDE.md §26 — **needs Swayam sign-off before this PR merges.**

**Open question for Swayam:** The Precise RFQ button will render as dark-blue fill + near-white label text. Is that the intended look, or should flex-500 be lightened to work with dark text? (Lightening would change the approved hex values — another review event.)

---

## 2026-07-10 — semanticGroup.rfqFg inherited 1:1 contrast (invisible label)

**What happened:** Session 4 discovered while wiring `--accent-fg` CSS variables that `semanticGroup` overrides `rfq: steel[950]` but not `rfqFg`, which therefore inherited `steel[950]` from `semanticBase` — black label on black fill, 1:1 contrast, on any group-page RFQ button.

**Root cause:** Same class as the 2026-07-09 Precise incident: the spread-extension pattern (`...semanticBase.color.action`) silently carries the base `rfqFg` into a company map whose `rfq` fill changed. The Session 2 fix added the Precise override but did not audit group.

**Rule (extends 2026-07-09 rule):** When ANY company map overrides `rfq`, it must also explicitly set `rfqFg` — the pair travels together. A contrast test asserting `rfqFg × rfq` per company now exists in tokens.test.ts for all three companies, so recurrence fails CI.

**Fix applied (2026-07-10):** `semanticGroup.color.action.rfqFg = steel[50]` (17.4:1 on steel-950 ✓) + covenant test added.

---

## 2026-07-10 — steel-500 used for small text in four components (WCAG fail, caught by Session 7 axe pass)

**What happened:** The Session 7 page-level axe run found 17 serious color-contrast
violations across SpecTable (notes column), StatBand (source captions),
CertificationCard (dt labels), Footer (column headings) and page-level captions —
all `text-steel-500` at 12–13px. steel-500 (#7B858D) is 3.53:1 on steel-50 and
3.76:1 on white — below the 4.5:1 normal-text floor. Sessions 4–5's per-story axe
passes did not catch it because axe's color-contrast rule was evaluated against
composed stories where several of these nodes didn't render with the failing
surface pairings.

**Root cause:** §15 itself specifies "units/notes (mono 13px steel-500)" — the
spec text conflicts with §25.1's WCAG-AA-as-floor covenant. Components followed
§15 literally.

**Rule:** steel-500 is a large-text/non-text color only — never below 18px. Where
a Datum section names steel-500 for small text, §25.1 wins and steel-600 (light
surfaces) / steel-400 (graphite) is used, with a comment citing this entry.

**Fix applied:** steel-600/steel-400 substituted in all five locations; full-page
axe now zero critical/serious on both Session 7 routes.

---

## 2026-07-10 — EntityRecord.stampsHeld didn't use canonical Stamp codes (5 of 6 stamps silently dropped)

**What happened:** Seeded `stampsHeld: ['ASME U', 'ASME U2', 'ISO 9001:2015', …]`;
Footer filters through `isStampCode` against the §12 codes ('U','U2','IBR',
'ISO-9001',…) — only 'IBR' survived, and the stamps strip rendered one tile.
Caught in the Session 7 vision loop (screenshot vs §18), not by any automated gate.

**Root cause:** `EntityRecord.stampsHeld` is `z.array(z.string())` — the schema
doesn't constrain to the Stamp code vocabulary, so the mismatch validated fine
and failed silently at render.

**Rule:** stampsHeld values are the §12 Stamp codes, not display names. Candidate
hardening (Phase 4): narrow the Zod field to the canonical enum so this fails at
parse, not at render.

## 2026-07-11 — BreadcrumbList JSON-LD host drifted from sitemap host (Session 8)
**What happened:** Session 7's heat-exchangers page hard-coded
`BASE = 'https://www.vedantagroup.net'` for BreadcrumbList JSON-LD while
`sitemap.ts` and `robots.ts` use `https://vedantagroup.net` (no www). Session 8
copied the pattern, creating a second instance before the reviewer pass caught
it — the visible-record-vs-machine-record drift class CLAUDE.md exists to
prevent.
**Root cause:** canonical host constant duplicated per page file instead of
living in one place; no CI check compares JSON-LD URLs to sitemap host.
**Rule:** any absolute URL emitted into JSON-LD must use the same host string
as sitemap.ts. When Phase 4 adds more product pages, hoist BASE into a shared
lib/site.ts constant (one definition), and Session 13's redirect/sitemap CI
should assert JSON-LD hosts match the sitemap host.

## 2026-08-27 — Session 0 (B8): rate limiter duplicated between /api/rfq and /api/presign

**What happened:** `/api/presign` had no rate limit at all. Fixed by copying
the in-memory IP rate-limit pattern from `app/api/rfq/route.ts` into
`app/api/presign/route.ts` with a shorter window (60s/10 req vs 10min/5 req) —
a pragmatic duplication rather than extracting a shared module for two call
sites.

**Root cause:** no shared rate-limit helper existed; extracting one for a
two-file duplication was judged over-engineering for this session.

**Rule:** if a third route needs IP rate limiting, extract
`lib/rate-limit.ts` at that point — don't let a third copy-paste happen.

## 2026-08-27 — Session 0 (B10 hoist): BASE constant not fully hoisted

**What happened:** Created `apps/web/lib/site.ts` exporting `BASE` and
replaced the 20 per-file `const BASE = 'https://vedantagroup.net'`
redeclarations that B10's canonical-URL work already touched. Left
un-hoisted (out of scope for this session, not touched by B1–B10):
`apps/web/app/sitemap.ts` (its own `const base = ...`), and hardcoded
literal `https://vedantagroup.net` strings in
`app/(group)/contact/page.tsx` and `app/(group)/about/page.tsx`
breadcrumb JSON-LD.

**Rule:** the next session touching any of those three files should
import `BASE` from `lib/site.ts` instead of redeclaring or hardcoding it.

## 2026-08-27 — Session 0 browser verify: StickyQuoteChip low-contrast on dark sections (pre-existing, not touched)

**What happened:** browser-checking B1 (Tailwind content glob restoring
`bottom-6 right-6` on `StickyQuoteChip`) surfaced that the chip's
`variant="secondary"` `Button` uses the light-surface style (dark
`text-steel-950` on a transparent fill) regardless of what's actually
behind it — over a `steel-950` product-grid section the label is nearly
unreadable. The `bottom-6`/`right-6` positioning itself is correct
(confirms B1's fix worked); this is a separate, pre-existing contrast
bug, out of scope for this session (not one of B1–B10).

**Rule:** `StickyQuoteChip`/`Button` needs a `data-chrome`-aware
secondary variant (same mechanism `globals.css` already uses for the
focus ring on dark chrome) before this is fixed — flag for a future
session.

## 2026-08-27 — Session 1 (T3): route-level axe surfaces sitewide steel-500 text contrast failures (VG-004)

**What happened:** the new Playwright + axe-core route gate
(`apps/web/e2e/a11y.spec.ts`) is the first check that ever ran axe
against real painted routes rather than isolated jsdom component
stories (`packages/datum-ui/src/a11y.test.tsx` explicitly cannot check
color-contrast — no paint layer). It found `color-contrast` violations
on 11 of 32 routes, all traced to the same root cause: `text-steel-500`
(#7a7269) used as body/caption/menu text falls under the 4.5:1 floor
against every background it appears on — 3.8:1 on the dark Header
chrome (#14171a), 3.66:1 in the mega-menu panel (#1c1a18), and 4.15:1
against the page surface (#f2f0ea). Two further one-off violations
(muted tones #5c5850 and #b5b0a4, ratios 2.54 and 1.89) on `/` and
`/request-a-quote/thank-you/` need their own look. This is a token-
usage bug spanning `Header.tsx`, page-level muted captions, and the
thank-you page — not a one-line fix, and out of scope for a
test-harness session (CLAUDE.md scope discipline).

**Affected routes (skipped in `e2e/a11y.spec.ts` via `KNOWN_FAILURES`,
pending the fix):** `/`, `/about/`, `/contact/`, `/privacy/`, `/terms/`,
`/request-a-quote/`, `/request-a-quote/thank-you/`, `/dhruv-epc/`,
`/precise-engineers/`, `/precise-engineers/capabilities/`,
`/precise-engineers/proof/`.

**Rule:** before using `text-steel-500` (or any token below 4.5:1
against its actual background) for body/caption text, check
`packages/tokens/src/tokens.test.ts`'s contrast covenant — if the pair
isn't an explicit allowlisted exception, it needs `steel-600`+ (proven
≥4.5:1) instead. A future session should audit every `text-steel-500`
usage against its real background and either swap the token or move
the specific use to a covenant-sanctioned pair, then un-skip these
routes one at a time.

## 2026-08-27 — Session 1 (T3 verify): pre-existing `.github/workflows/ci.yml` "Redirect map integrity" step is not standard-compliant YAML

**What happened:** while validating `ci.yml` after wiring T3's
accessibility gate, two independent strict YAML parsers (PyYAML,
Ruby's Psych) both fail to parse the whole file — not because of
anything this session added, but because of a pre-existing step:

```yaml
- name: Redirect map integrity
  run: node -e "
    const fs = require('fs');
    ...
  "
```

`node -e "` is an unquoted plain scalar followed by a bare `"`, not a
proper YAML double-quoted block — the trailing `"` line dedents back
to the mapping's own indentation, which both parsers read as "scalar
ended, now expecting a new key," and choke on the orphaned quote.
Verified this predates the session (same failure, same construct, on
`git show cf7faaa:.github/workflows/ci.yml`). GitHub Actions' own YAML
parser may tolerate it — untested here — but it is not something to
build new steps on by copying the pattern.

**Root cause:** hand-written multi-line `node -e "..."` shell embedded
directly in workflow YAML instead of a `|` block scalar or a checked-in
script file.

**Rule:** out of scope for T3 (unrelated step, not one of the two
placeholders this session's brief named) — not fixed here. Next session
touching `ci.yml` should convert that step to `run: |` with the JS
written as plain shell-safe lines, or move it into
`scripts/test-redirects.mjs`-style a checked-in file, and confirm with
`python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"`
that the whole file parses clean before merging.

**Resolution (2026-08-30):** confirmed the untested guess above was
wrong — GitHub Actions' own parser does **not** tolerate the construct
either. `gh run view` on every push to `main` since 2026-07-17 (PR #7,
#8, #9's merge commits, and everything after) shows the same result:
*"This run likely failed because of a workflow file issue."* CI has been
a no-op — zero lint/typecheck/test/build/redirect gate has actually run
in GitHub Actions on this repo for six weeks; only Vercel's own build
checks were catching anything. Fixed in `fix/ci-workflow-yaml-syntax`:
moved the inline script to `scripts/check-redirect-map-integrity.mjs`
(same pattern as `scripts/test-redirects.mjs`), step is now a plain
`run: node scripts/check-redirect-map-integrity.mjs`. Verified the whole
file parses with the command above.

**Broader rule:** `gh pr checks` / the PR UI checks list is not proof CI
ran — it only lists checks that *reported*, and a parse failure reports
nothing (no red X appears there; you have to check `gh run list` /
`gh run view` directly). When asked to verify CI status, check the
Actions run itself, not just the PR checks list.

## 2026-09-01 — Session 7 manual verify: two pre-existing bugs found, out of scope, not fixed

**What happened:** Manual browser spot-check of the Session 7 golden-page
rollout (design/session-7-template-rollout) surfaced two defects neither
introduced nor touched by any task in this session:

1. `content/products/storage-tanks.json` — `page.heroTitle` is literally
   `"Storage Tanks &amp; Air Receivers"` (the HTML entity as raw text),
   while the sibling fields `name`, `metaTitle`, and `breadcrumbLabel` in
   the same file correctly use a plain `&`. React doesn't decode entities
   in text content, so the H1 renders the literal string `&amp;` on the
   live page. Confirmed via `git log --follow -p` that this predates
   Session 7 — the field was written this way in the Session 5 content
   migration and no Session 7 task (4-10, which only added `rail`/
   `provenance` keys to `specTable` rows) touched `page.heroTitle`.

2. Keyboard-tabbing to the `ProductHero` "Request a quote" button
   (`packages/datum-ui/src/components/ProductHero.tsx` or wherever that
   button lives — not confirmed by file, only by browser behavior) showed
   no visible `:focus-visible` ring in a screenshot after 6 Tab presses on
   `/dhruv-epc/products/static-equipment/pressure-vessels/`. Not
   conclusively isolated (could be a focus-landed-elsewhere false
   negative rather than a missing ring) and this component predates
   Session 7 entirely — no task in this plan touches `ProductHero` or its
   RFQ button.

**Root cause:** (1) a content-authoring typo from an earlier session,
undetected because nothing renders/tests raw entity text; (2) unconfirmed
— needs a real keyboard-focus trace (devtools `:focus` inspection, not a
screenshot guess) to know whether it's a missing ring or a mis-click.

**Rule:** Neither is fixed here — per CLAUDE.md scope discipline, an
unrelated bug found mid-task gets logged, not fixed inline. Next session
touching `content/products/storage-tanks.json` should replace
`heroTitle`'s `&amp;` with a plain `&`, and grep all other 16 product
JSON files' `page.heroTitle`/`page.metaTitle`/`page.valueStatement`
fields for the same `&amp;`/`&lt;`/`&gt;`/`&quot;` double-escaping
pattern rather than assuming storage-tanks is the only instance. Next
session touching `ProductHero` should confirm the focus-visible ring
question with devtools, not a screenshot.

**Resolution (2026-09-01):**
1. `&amp;` fix — grepped all 17 product JSON files for `&amp;`/`&lt;`/
   `&gt;`/`&quot;`; found TWO instances, not one — `storage-tanks.json`
   and `plate-flanges.json` (`page.heroTitle`: `"Plate Flanges &amp; Base
   Frames..."`, same pattern, same root cause). Both fixed to a plain `&`,
   matching their own sibling `metaTitle`/`breadcrumbLabel` fields.
2. Focus-visible ring — **not a real bug; closing without a code change.**
   Traced to `apps/web/app/globals.css`'s `:focus-visible { outline: 2px
   solid var(--accent-focus, ...); outline-offset: 2px }`. `--accent-focus`
   equals `--accent` for both companies (Dhruv `#AA3833` = `#AA3833`,
   Precise `#0E6BA8` = `#0E6BA8`) — same hue as the RFQ button's own fill.
   But `outline-offset: 2px` draws the ring 2px *outside* the button's
   border box, onto the surrounding section background (`steel-50` /
   `steel-950`), never overlapping the button's own fill — so "same color
   as the fill" does not make it invisible; it renders as accent-color on
   a light/dark neutral background, which already has validated contrast
   elsewhere in the token system. This is a different situation from the
   IndustryCard incident above, where the ring color nearly matched the
   *surrounding* background, not just a same-element fill.
   Attempted to confirm visually via the claude-in-chrome browser tool
   (both simulated Tab-key presses and a direct `element.focus()` call);
   `document.activeElement` stayed `<body>` in both cases, and
   `document.hasFocus()` returned `false` with `document.visibilityState:
   "hidden"` — this automation session's browser tab never has real OS-
   level window focus, so keyboard-focus behavior cannot be observed
   through it at all. The original "no visible ring" screenshot in the
   entry above was almost certainly this same limitation (focus never
   reached the page), not a missing ring. **Rule:** `:focus-visible`
   checks in this environment need a real interactive browser session (a
   human driving it, or a headed Playwright run with an actual OS window)
   — the claude-in-chrome tool cannot grant a tab real window focus, so
   `document.hasFocus()`/`document.activeElement` are the first things to
   check before trusting *any* keyboard-focus screenshot taken through it.

## 2026-09-01 — Session 7 SDD loop: a per-task review ruling was itself wrong, caught only by the final whole-branch review

**What happened:** During the precise-engineers content batch (Tasks 11-19),
a per-task reviewer flagged 3 files (damper.json "Types", rubber-bellows.json
"Arch configuration", telescopic-expansion-joint.json "Sealing system") for
railing a 3-item categorical row, reading the plan's rail-selection rule as
"never rail a 3+-item list, full stop." I (the controller) accepted that
finding and dispatched a fix stripping `rail: true` from all three. That fix
was itself wrong: the plan's actual text permits exactly ONE categorical
"types/variant" row in the rail regardless of item count, and only excludes
long Materials/Design-codes-style enumerations — the dhruv-epc batch (done
first, by a different dispatch) had already correctly railed six-and-seven
item "types" rows (pressure-vessels "Vessel types", heat-exchangers "Types",
plate-flanges "Flange types", process-skids "Skid types", heavy-machining
"Machining types") under that exact reading. My fix silently created a
cross-batch inconsistency: dhruv-epc rails were 4-6 rows deep, precise-
engineers rails were 2-3 rows deep, as a procedural artifact of my own wrong
ruling — not a real content difference. Neither the per-task reviewer nor I
caught it at the time, because a per-task review only ever sees one file's
diff — the inconsistency is only visible comparing across the whole branch.
The final whole-branch review (dispatched on a more capable model, after all
22 tasks were done) caught it, plus a second, more clear-cut miss it traced
to the same root cause: dual-plate-check-valve.json's `sourced` 3-item
"Pressure class" row was left unrailed while a materially identical row in
zero-velocity-valve.json was railed.

**Root cause:** accepting a per-task reviewer's finding at face value
without checking it against the plan's own text closely enough — the
reviewer's phrasing ("3+-item list rows... violating the ban") was broader
than what the plan actually banned (only Materials/Design-codes-style
enumerations, with an explicit one-categorical-row exception). A controller
ruling on a review finding carries the same obligation to verify against
the spec that a review finding itself does — "the reviewer said so" is not
sufficient grounds to rule against your own plan's stated exception.

**Rule:** When a per-task reviewer's finding cites a rule from the plan,
re-read the plan's exact wording (not just the reviewer's paraphrase) before
ruling — especially when the rule has a named exception, since a reviewer
restating "the general rule" can silently drop the exception. Cross-batch
consistency for any rule with subjective judgment calls (item counts,
selection thresholds, etc.) is real risk surface that per-task review
structurally cannot catch — a final whole-branch review is not optional
ceremony for a multi-batch rollout, it is where exactly this class of drift
gets caught. Budget for it, and dispatch it on a capable-enough model to
actually compare across the branch, not just diff-scan the tail commit.

## 2026-09-01 — Session 8: IndustryCard opacity-wrapper contrast bug found + fixed; VG-004 spread to new routes

**What happened:** building `/industries` (VG-020) exercised
`IndustryCard`'s `thin` (zero-project) state for the first time in a real,
axe-audited route — Session 7 added the component but no page ever
rendered it live. That state wrapped its text in an `opacity-60`/`opacity-70`
div for a "washed out" look. Opacity blends the *whole* subtree toward
whatever's behind it, so no token choice underneath it could reach 4.5:1 —
even `steel-700` (9.94:1 solid) only blended to ~4.3:1 at 70% opacity
against `steel-50`. Confirmed via manual luminance-ratio computation, not
guessed. Fixed in `packages/datum-ui/src/components/IndustryCard.tsx`: both
`thin` branches (light + dark) dropped the wrapper opacity and moved to
solid tokens verified ≥4.5:1 (`steel-600` on `steel-50`, `steel-400` on
`steel-900`) — de-emphasis now comes from token choice, not opacity.

**Same bug elsewhere, not fixed (logged, not inline per CLAUDE.md scope
discipline):** `CategoryCard.tsx`'s `thin` branches (`opacity-60`/
`opacity-70`) and `IndustryCard.tsx`'s `compact` + thin branch
(`opacity-60`) use the identical pattern. Neither is exercised by an
axe-audited route yet, so CI stays green, but the same fix (drop opacity,
pick a compliant solid token) applies whenever one is.

**Separately:** the new `(group)/industries` and `(group)/capabilities`
routes share `GroupChrome`'s header, which is the already-tracked VG-004
(`text-steel-500` on the dark header, 3.8:1) — not a new bug. All 15 new
routes added to `e2e/a11y.spec.ts`'s `KNOWN_FAILURES` alongside the
existing VG-004 entries.

**Rule:** never use CSS opacity to dim text for a "muted" visual state —
compute the actual blended contrast first (or just don't use opacity on
text at all) and pick a token that's compliant on its own. An opacity
wrapper can make an already-compliant token non-compliant even when the
token itself would pass at full strength.

## 2026-09-02 — Session 9: /projects stub route CI-blocked on already-tracked VG-004

**What happened:** PR #23 (VG-050/051, group nav restructure + home
rebuild) opened with CI green on every local check (`pnpm typecheck` /
`lint` / `test` / `build`) but failed the GitHub Actions "Accessibility
gate (axe-core CI)" job — the real-browser Playwright + axe-core sweep
`packages/datum-ui/src/a11y.test.tsx`'s jsdom-based axe pass structurally
cannot run (no paint layer, `color-contrast` explicitly excluded there).
The new `/projects` stub route (Session 9 N2) renders `GroupChrome`'s
header, which carries the same already-tracked VG-004 contrast defect
(`text-steel-500` "Group of Companies" sub-label, 3.8:1 on the dark
header) every other group route already has — but `/projects` wasn't yet
added to `apps/web/e2e/a11y.spec.ts`'s `KNOWN_FAILURES` skip-list, so it
was the one route in the sweep actually asserting on a bug the other 15+
group routes are deliberately exempted from. Fixed by adding `/projects/`
to `KNOWN_FAILURES` with the `VG-004` tag, following the exact precedent
Session 8 set when it added its own 15 new `(group)/` routes the same way.

**Rule:** any new route under `(group)/` inherits `GroupChrome`'s
already-tracked VG-004 header contrast bug by construction — add it to
`e2e/a11y.spec.ts`'s `KNOWN_FAILURES` in the same PR that adds the route,
not as a follow-up. `pnpm test` alone will not catch this: the real
browser-painted axe gate only runs in CI (`playwright test`), so a new
group route's PR can show fully green local checks and still fail CI on
this exact, entirely predictable gap.

## 2026-09-02 — Dhruv/Precise nav asymmetry: orphaned /company page, and a footer sibling gap left unfixed

**What happened:** user reported the Dhruv EPC and Precise Engineers
header navs "look different." Investigation (see PR fixing
`DhruvChrome.tsx`) found two separate causes: (1) `Header.tsx`'s legacy
mega-menu grid was hardcoded `grid-cols-4`, sized for Dhruv's 3 equipment
groups + capability rail — Precise's 2 groups + rail left a dead 4th
column; (2) `DhruvChrome.tsx`'s `LINKS` array never linked
`/dhruv-epc/company`, a fully-built page (110 lines, real metadata),
while `PreciseChrome.tsx` links its equivalent `/precise-engineers/company`
— so Dhruv's primary nav had one fewer item than Precise's. Both fixed
in the same PR (grid sized to actual column count; `Company` added to
Dhruv's `LINKS`).

**Left unfixed, out of scope for that PR:** `apps/web/app/dhruv-epc/layout.tsx`'s
`FOOTER_COLUMNS` "Company" heading lists only `Vedanta Group` + `Contact` —
it's missing the `About` → `/dhruv-epc/company` entry that
`precise-engineers/layout.tsx`'s footer has. Same orphaned-page root
cause, different location; not fixed because the user's report scoped to
the header nav specifically (CLAUDE.md scope discipline — one concern per
commit).

**Rule:** when a page exists under a company route but isn't linked from
that company's header LINKS array, check the sibling company's footer
`FOOTER_COLUMNS` too — this codebase's two-chrome-per-company pattern
(Header LINKS + Footer columns, duplicated per company rather than
derived from a shared route table) means an orphaned-page bug reliably
shows up in more than one nav surface at once. Fix or ticket both, don't
assume fixing the header caught it.

**Resolution (2026-09-02):** user asked for the footer gap to be closed
too. Added `{ label: 'About', href: '/dhruv-epc/company' }` as the first
entry in `dhruv-epc/layout.tsx`'s `FOOTER_COLUMNS` "Company" column,
matching `precise-engineers/layout.tsx`'s existing order exactly.

## 2026-09-02 — Storybook's preview.css has stale, pre-v1.2 accent values (amber, not the current red)

**What happened:** while verifying Phase 8's ProductCard/Button changes in
Storybook, its built-in accessibility addon flagged a contrast violation
on `text-accent` — foreground `#F0670F` (amber) against white, 3.15:1,
failing 4.5:1. Traced it to `packages/datum-ui/.storybook/preview.css`,
which the file's own header comment admits is a hand-maintained "mirror
of apps/web/app/globals.css... Storybook-only copy: the app owns the
canonical file." That mirror was never updated when the accent migrated
amber → brand red (`#AA3833`) at v1.2 (session predating this one) —
confirmed by checking an untouched, pre-existing story
(`Button/Rfq Dhruv`) and finding it renders the same stale amber. Also
found `[data-company='group']`'s accent logic has fully diverged from
`globals.css` (Storybook: a monochrome steel-based scheme; the real app:
brand-500 red, same as Dhruv) — this drift predates v1.2 too and is
larger than just the color migration.

**Why not fixed here:** out of Phase 8's declared file scope
(`FINAL_IMPLEMENTATION_PLAN.md`'s Phase 8 file list is 13 named
components, not Storybook infrastructure) and the user's task was to
implement Phases 6–8, not audit tooling. Verified the real behavior
separately in the actual Next.js dev server (not Storybook) for every
Phase 8 change, where the accent renders correctly — Storybook's stale
copy doesn't affect production, only the fidelity of Storybook-based
visual checks going forward.

**Rule:** don't trust Storybook's accessibility-addon contrast readings
for accent-colored elements without cross-checking a real route in the
actual app first — `preview.css`'s copy of the company accent scopes can
silently drift from `globals.css` (the canonical source) since nothing
enforces the two staying in sync. If a future session has "fix Storybook
infra" or "Phase X: design-system tooling" in scope, resync
`preview.css`'s three `[data-company]` blocks against `globals.css`
line-for-line rather than patching the accent value alone — the `group`
company's whole accent formula needs it, not just amber→red.

## 2026-09-03 — RFQBand's focus ring fails the 3:1 non-text contrast floor on its own steel-900 ground

**What happened:** while doing manual browser QA on the new `/clients-
projects` route (Clients & Projects feature, manual verify pass per
CLAUDE.md's Verify checklist item 2), tabbing to the RFQ closer band's
"Request a quote" button showed a focus ring at `#AA3833` (brand-500) on
the band's own `bg-steel-900` ground — 2.85:1, under the WCAG 1.4.11
3:1 floor for non-text indicators. This is the exact failure
`globals.css`'s own `[data-chrome='dark']` comment names ("brand-500 on
steel-950 is 2.85:1... Any steel-950 surface carrying focusable elements
marks itself `[data-chrome='dark']`"), but `apps/web/components/
RFQBand.tsx`'s `<section data-rfq-anchor className="bg-steel-900">` never
carries `data-chrome="dark"`, so `--accent-focus` never rebinds to the
dark-safe `--accent-dark` step there.

Confirmed this isn't new: `RFQBand` is a single shared, unmodified
component, and the same missing attribute is on every route that renders
it — the group homepage, `dhruv-epc`, and `precise-engineers` all have the
identical gap, not just the new page. (Verifying this via the group
homepage first gave a false negative — a `.focus()` call there didn't
trigger `:focus-visible` at all due to the browser's input-modality
heuristic, so its outline read as the browser default, not the site's
rule. Re-testing directly on `/clients-projects`, where `:focus-visible`
did engage, reproduced the real `#AA3833`-on-`steel-900` value. Don't
trust a single `:focus-visible` reading without confirming
`el.matches(':focus-visible')` first — a quiet `false` there means the
test measured nothing.)

**Why not fixed here:** out of this task's scope (`design_handoff_
clients_projects/PROMPT.md`'s explicit hard constraint: don't touch
`RFQBand`/header/footer beyond mounting the marquee and pointing one nav
item at the new route) and it's a pre-existing, site-wide gap, not
something the new route introduced.

**Rule:** any component whose default ground is `steel-900`/`steel-950`
and that renders focusable elements must carry `data-chrome="dark"` on
that ground — `RFQBand.tsx` needs it added (one line: `data-chrome="dark"`
alongside its existing `data-rfq-anchor`). A future session touching
`RFQBand.tsx`, or doing a focus-ring audit, should fix this everywhere at
once rather than per-page.

**Resolution (2026-09-03):** user asked for it to be fixed directly.
Added `data-chrome="dark"` to `RFQBand.tsx`'s `<section>` alongside its
existing `data-rfq-anchor`, matching the exact precedent in Header's
utility bar and PageHero's photo-scrim layer. Fixes the focus ring on
every route that renders the band (group homepage, dhruv-epc, precise-
engineers, clients-projects) in one change, as the rule above
recommended. Verified in a real browser: the closer band's "Request a
quote" link now reads `#DC8D89` (accent-dark, 7.04:1) instead of `#AA3833`
(2.85:1) when focused. Regenerated `__snapshots__/routes-baseline/` for
all 54 routes (every one carries the band somewhere) —
`compare-snapshots.mjs` reports byte-identical against the fresh build.

## 2026-09-03 — Client logo consent granted; artwork is still review-grade, not final

**What happened:** human confirmed (a) 44 is the authoritative named-
client count (not the spec's "42" — see Session 35 progress.md), and
(b) written permission is in hand to display all 44 clients' marks, so
every `content/clients/*.json` record was flipped from
`consent: 'requested'` to `'granted'`, with `logo` wired to the matching
crop under `apps/web/public/clients-review/clients/` (two records,
`mrpl.json`/`ongc.json` and `swcogen.json`/`cem-engineering.json`, point
at the same shared crop — see the c24/c37 finding in Session 35). The
12 group-level `content/approvals/*.json` records got `logo` wired the
same way.

**This is a deliberate middle ground, not a resolution of the §5
blocker:** the crops under `clients-review/` are still the exact
review-grade raster the spec's own §5 warns against shipping as final —
JPEG ringing, a baked white ground, no optical-height normalization
across marks. Consent to *display the company* is not the same thing as
having *final artwork* for it; this session has the former, not the
latter, for all 44/12 records. `apps/web/public/clients-review/README.md`
already carries the full rights/format/normalization checklist — nothing
there changed, it just now actually renders in production instead of
sitting unwired.

**Rule:** don't read "logo consent granted" as "the asset pipeline is
done." A future session should re-crop/re-request real SVG or 4× PNG
per client from their own brand pages and swap the `logo` paths once
available — the content records and components don't need to change,
only the asset files and paths.

---

**2026-09-26 — `HeroCarousel.tsx`'s `/#contact` links are dead anchors, found while building Our Businesses.**

While wiring the Our Businesses section's "Enquire with…" CTAs (group-home-v2 §03), found the right pattern (`rfqHref('dhruv' | 'precise')` from `apps/web/lib/product-urls.ts`, which resolves to `/request-a-quote?company=…`) and used it there. Session 40's `HeroCarousel.tsx` (committed, live) has three CTAs pointing at `/#contact` — `cta2` on the group/journey slides ("Discuss Your Project", "Our 30-year journey →" is fine, it's the `#heritage`→`/about` mapping that's correct) and both companies' "Enquire with …" CTAs — but no element on `(group)/page.tsx` has `id="contact"`, so all three are dead in-page anchors that just reload the page at `/`.

**Rule:** not fixed here — out of scope for the Our Businesses commit (CLAUDE.md: log unrelated bugs, don't fix inline). A future session should repoint `HeroCarousel.tsx`'s three `/#contact` hrefs to `rfqHref('dhruv')` / `rfqHref('precise')` / `rfqHref` with no company for the group-level one.

---

**2026-09-26 — `inert`-via-ref (Session 45) only excludes closed disclosure panels from the tab order/a11y tree after hydration — fixed same session, found by an independent reviewer subagent at Step 5 verify.**

Session 45 moved the header mega panel / legacy panel / extraMenus panels from the `hidden` attribute to `ref.current.inert = !open` in a `useEffect`, to let the closed→open transition animate (correctly reasoned: React 18 strips `inert` passed as a JSX boolean prop, so it has to be set imperatively — see that session's log). What wasn't caught: `inert` is a DOM property, not something `useEffect` can put into the server-rendered HTML — so between first paint and hydration finishing (slow JS, large bundle, a flaky plant-floor connection — exactly this project's own target user), and permanently if JS fails to load at all, the closed panel is only *visually* suppressed (`opacity-0`/`pointer-events-none`, correct at SSR time) while remaining fully keyboard-tabbable and exposed to the accessibility tree. My own Step 3/4 sessions didn't catch this either — the e2e suite's keyboard tests all `waitForLoadState('networkidle')` before touching the keyboard, so the pre-hydration window was never exercised. An independent reviewer subagent (dispatched per CLAUDE.md's "verify pass must be separate" rule, given only the diff + spec, no conversation context) found it by reading the SSR output logic directly.

Fixed same session (commit `940b93c`): added `aria-hidden={!open}` on every panel plus `tabIndex={open ? undefined : -1}` on every link inside (MegaPanel.tsx, Header.tsx's legacy panel, and GroupChrome.tsx's `BusinessesPanel`/`CareersPanel` — which required changing `HeaderMenu.panel` from a static `ReactNode` to `(open: boolean) => ReactNode` so caller-owned panel content could apply the same baseline itself). Confirmed via `curl` against the built server with zero JS executed — `aria-hidden="true"` and `tabindex="-1"` are both present in the raw HTML. The `inert` effect stays as a post-hydration enhancement on top; not a conflict.

**Rule:** an imperative DOM mutation in a `useEffect` (`ref.current.x = y`) is invisible to SSR by construction — anything it does for accessibility needs a JSX-renderable equivalent as the baseline, with the imperative version layered on top as an enhancement, not the only mechanism. And: an e2e test that always waits for the page to be fully idle/hydrated before interacting can't catch a pre-hydration-window bug — if a component's a11y story depends on SSR output specifically, assert against the raw HTML (or at least against a point before `waitForLoadState`), not just the settled DOM.
