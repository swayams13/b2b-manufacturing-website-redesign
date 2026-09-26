# decisions.md — Logged design/governance overrides

Append-only. Each entry records a deliberate override of a standing rule (in `CLAUDE.md`, `docs/datum-design-system.md`, or a prior session's lock), the reasoning, and who approved it — as distinct from `docs/mistakes.md`, which logs *incidents* (bugs, contradictions caught after the fact). This file exists so a future session doesn't "fix" a deliberate decision back to the original rule for lack of context.

---

## 2026-07-16 — Exploded-view hero sequence: photo-law + motion-budget override

**What was overridden:**

1. **CLAUDE.md's imagery law** — "never use stock photos, AI-generated images, or renders — real works photography only." The group, Dhruv EPC and Precise Engineers home-hero photo slots now carry photorealistic AI-generated 3D-render imagery (an exploded-view sequence of a heat exchanger / pressure vessel / metallic bellows expansion joint respectively), generated via Nano Banana / ChatGPT image tools per `docs/exploded-view-image-generation-guide.md`.
2. **Datum §11's motion budget** — previously capped hero motion to exactly one 700ms "signature moment" (line-draw + count-up). A second, additive motion mechanic (a scroll-bound exploded-view frame sequence) now also plays in the same hero, beneath/alongside the unchanged signature moment. See the §11 addendum in `docs/datum-design-system.md` for the full mechanic and why it's judged distinct from the parallax/ambient-animation pattern that section still bans.
3. **Session-8 hero template lock** (`docs/launch-checklist.md` precedent: "template contract locked after Session 8 — no component or layout changes permitted") — reopened, narrowly. `ProductHero.tsx` is unchanged. `HomeHero.tsx` carries one structural change (2026-07-16 review pass, docs/ui-ux-review.md §3.6): the photo band's wrapper no longer forces `aspect-video overflow-hidden` — a fixed-ratio clipping wrapper breaks the exploded sequence's scroll track and disables its `position:sticky` (sticky fails inside overflow-hidden ancestors); the photo child now owns its own aspect ratio (stories updated to match; no page passed a plain photo before this branch, so nothing regresses). The group home's bespoke (non-`HomeHero`) hero markup was extended directly. `DimensionLabel` was additionally opened from internal-only to the `@vedanta/datum-ui` barrel export so the group page could reuse the exact signature-moment label mechanic rather than re-implementing it.

**Why:** explicit user direction (Swayam), weighing visual differentiation for an "industrial luxury" repositioning above the existing photo-law's original rationale (credibility risk of fake imagery reading as generic stock). Full reasoning and the two alternatives considered (technical-diagram illustration vs. photoreal render) are in `docs/design.md` §0.

**Scope of the override:** this feature only — the three home-hero photo slots. It is not a precedent for using AI-generated or rendered imagery elsewhere on the site (product galleries, project case studies, etc.), which remain subject to the original "real photography only" law.

**Follow-up required before launch (tracked in `docs/progress.md`):**
- Launch-checklist gate 10 ("Zero stock imagery") needs to be re-worded or re-scoped to explicitly carve out this named exception, rather than silently continuing to read as PASS against a rule that no longer holds universally.
- ~~Real generated image frames need to replace the placeholder paths~~ **RESOLVED 2026-07-17** (superseding an earlier same-day pass that used a flawed first-draft image batch — see correction below): Swayam supplied a second, better-quality Gemini-rendered batch per product (consistent camera/lighting/configuration across frames, unlike the first draft). Validated frame-by-frame, then converted to WebP and wired into `apps/web/public/exploded/` — **heat-exchanger: 4 frames** (assembled → 25% → 50% → fully exploded; strongest set, clear tube-bundle/tube-sheet reveal), **expansion-joint: 4 frames** (assembled → 25% → 50% → fully exploded; single consistent bellows-with-tie-rod configuration throughout). **pressure-vessel: 3 frames** (assembled → 25% → 75% exploded) — accepted as-is per Swayam (2026-07-17), but flagged as a known weak point: only the dished head separates from the shell (the shell courses, despite visible weld-seam lines, never come apart), and it's the only set without a 4th frame. Candidate for a future regenerate with fuller shell separation; not a launch blocker. `avif` field in each `ExplodedFrame` intentionally points at the same `.webp` asset in every entry — no AVIF encoder was reachable in the build sandbox (no network egress to apt/pip mirrors) to produce real `.avif` binaries, and `ExplodedSequence.tsx`'s own header comment confirms only `.webp` is read: next/image's built-in optimizer already re-encodes/serves true AVIF over the wire from that source, so no visitor-facing loss. Placeholder comments removed from the three content files now that real frames are in place.
  - **Correction:** an earlier pass earlier the same day had processed a first-draft image batch (2 usable expansion-joint frames only, one bearing a visible render-artifact "sparkle" glint, plus a mismatched-configuration issue flagged in that session's chat review) into real `.avif` files under `apps/web/public/exploded/` and marked this item resolved with frame counts 4/2/3. Those `.avif` files were superseded and removed (moved to `apps/web/public/exploded/_to_delete-stale-avif/` for Swayam to delete — `device_bash` cannot delete files on the connected Mac) once the second, cleaner batch arrived. The citation to a `docs/mistakes.md` 2026-07-16 entry in that earlier note does not correspond to any actual entry in that file — disregard it.
- ~~Mobile scroll behavior~~ **RESOLVED 2026-07-16** (review pass, docs/ui-ux-review.md §3.3): below 768px the sequence renders as the static fully-exploded frame with no scroll track — same treatment as reduced motion; the scrub is a wide-viewport enhancement. Implemented CSS-first in `globals.css`.
- ~~Exact frame counts (5 per sequence assumed)~~ **RESOLVED 2026-07-17** (corrected from an earlier same-day note that recorded 4/2/3 against the superseded first-draft batch — see correction above): **heat-exchanger 4, expansion-joint 4, pressure-vessel 3.** Metallic bellows expansion joint confirmed as Precise flagship SKU (matches existing product tree and `preciseProducts` content seeding).

---

## 2026-07-16 — Frontend redesign pass: doors-first group home + §12 icons on cards

**What changed (Session 16, same branch):**

1. **Group home reordered to doors-first** — compressed copy-only hero → two-doors section → exploded-view sequence (as the shared-capability statement) → stats → proof. Supersedes the §6.1.1/§6.1.2 order in the platform plan, which placed the full hero (with photo band) before the doors. Rationale: the page's own comment calls the doors "the page's reason to exist"; the sequence was pushing them ~3 viewports deep (`docs/ui-ux-review.md` §3.6/§5). Revert = moving one JSX section back above the doors.
2. **`ProductCard` gains an optional `icon` slot and the §12 domain set now exists as code (`DomainIcon`, 18 section-view icons)** — interim visual for the photo-less card grids until the works shoot; the slot is ignored the moment a real photo is passed, so photography remains the contract end state. Icons are drawings, not imagery — no photo-law implication.
3. **Bugfixes, not overrides** (logged in progress.md, listed here only because they touch chrome): per-page Footers removed from `(group)` routes (layout owns chrome — double-footer P0), RFQ step-1 company guard (dead-click P0).

**Approval:** Swayam's 2026-07-16 instruction to proceed with the frontend redesign ("go ahead and continue with adding or modifying files if required"), scoped to frontend only; backend untouched.

---

## 2026-08-27 — Brand-red token update (commit 9fa229f), logged retroactively

**What changed:** commit `9fa229f` ("feat(brand): apply brand-red token
update and P0 fixes") edited `packages/tokens/src/primitives.ts` and
`semantic.ts` — the Vedanta brand accent (`brand[500]`) is set to
`#AA3833`. Its own commit message states the change "requires
design-review sign-off on the token changes per packages/tokens/CLAUDE.md
before merge," but it was merged to this branch without a decisions.md
entry — this is that entry, logged retroactively at the start of Session
0 stabilization.

**Decision confirmed 27 Aug 2026:** brand red = `#AA3833` (brand-500).
The warm neutral ramp (`steel-50 #F2F0EA … steel-950 #14171A`) is
RETAINED — it is not re-mapped to the cool ramp the original
design-integration plan (`04-design-integration-plan.md`) recommended
alongside a red accent. This branch's Session 0 stabilization work
(P0-1) treats both the red value and the warm-ramp retention as locked
and does not revisit either.

**Approval:** Swayam, confirmed 27 Aug 2026.

---

## 2026-09-26 — Group homepage v2 hero: rotating carousel + motion-budget override

**What was overridden:**

1. **Datum §3 "Restraint is confidence" / §17 "Banned: carousels of any kind, auto-rotating anything" / §19 "one message per hero (no rotation — carousels are banned system-wide)"** — the group homepage v2 hero (`design_handoff_group_home_v2` handoff → `(group)/page.tsx`) keeps the prototype's 4-slide auto-rotating hero (four "chapter" tabs cycling the hero photo/headline/CTA pair), instead of the static-hero-plus-chapter-links pattern that `design_handoff_group_home_v2/README.md` Decision 1 recommended.
2. **Datum §11's motion duration set** (largest token `motion-signature`, 700ms) — the hero's slide cross-fade (1400ms) and Ken Burns zoom (9000ms), as built in the prototype reference, are approved as-is rather than clamped to the 700ms ceiling (README Decision 3).

**Why:** explicit approval by Swayam (2026-09-26), given during Step 0 review of the group-home-v2 design handoff.

**Scope of the override:** the group homepage's own bespoke hero markup only — not `HomeHero.tsx` (used by the Dhruv EPC and Precise Engineers product-page heroes), and not a precedent for carousels, auto-rotation, or motion durations above `motion-signature` anywhere else on the site.

**Follow-up required before launch:** `prefers-reduced-motion` must still collapse this hero to a single static frame with no rotation and no Ken Burns zoom, per Datum §11 (a first-class rendering mode, not a fallback) — the override applies only to the default-motion state.

**Approval:** Swayam, confirmed 26 Sep 2026.

---

## 2026-09-26 — Group homepage v2: business-card accent as rule + label, not fill

**What was overridden:**

1. **Datum §13's Amber Law / §4.3's accent usage law** — "the RFQ button... is the only amber-filled element in the system" is extended, for this one component only, to also permit DESPL red / PE blue as a thin top rule plus a mono eyebrow label on the two "Our Businesses" cards on the group homepage, per `design_handoff_group_home_v2/README.md` Decision 2. The buttons themselves ("Explore Business", "Enquire with …") stay non-accent (steel outline / ghost) — only the card's top rule and its mono label carry the business color; the RFQ button remains the only accent-*filled* element on the page.

**Why:** explicit approval by Swayam (2026-09-26), given during Step 0 review of the group-home-v2 design handoff.

**Scope of the override:** the two "Our Businesses" cards on the group homepage only — not a precedent for accent fills, rules, or colored labels on `ProductCard`, `ProjectCard`, or any other card type, and not a precedent for any other route.

**Approval:** Swayam, confirmed 26 Sep 2026.

---

## 2026-09-26 — Group homepage v2: page architecture — replace pre-v2 sections, keep Industries served

**What was decided:** the pre-v2 `(group)/page.tsx` (blueprint §14.2, Session 9) has four sections whose purpose overlaps a new group-home-v2 section. Rather than run both (duplicate content, against Datum's restraint principle), each v2 section **replaces** its pre-v2 counterpart in place, one for one, as its own section commit:

| Pre-v2 section (§14.2 item) | Replaced by v2 section |
|---|---|
| item 6, "Two specialized works, one group" (DOORS cards) | §03 Our Businesses |
| item 2, products-by-category (`CategoryCard` grid) | §04 Products & Solutions (`ProductCard`, curated set) |
| item 4, `StatBand` proof band | §06 Figures |
| item 4/§proof, `CertificationCard` grid | §09 Quality |
| clientele band (`ClientMarquee`) | §07 Clients & Projects (keeps `ClientMarquee` for the logo grid per README Decision 8, extended with featured case + `ProjectCard`s) |

**Industries served (§14.2 item 3) is the one pre-v2 section with no v2 equivalent** — the handoff's section order has no "industries" slot. Decided: **keep it**, inserted into the v2 flow after §04 Products & Solutions (nearest thematic fit — it's demand-side context for the same products just shown). Not dropped, since the content is real and sourced (`getIndustries()`), not a v2 conflict, just an ordering gap.

**Why:** explicit call by Swayam (2026-09-26), asked because the SKILLS-RUNBOOK.md build prompt didn't specify replace-vs-append and Industries served has no home in the new order — an architecture decision, not a token/spacing nit.

**Scope:** the group homepage (`(group)/page.tsx`) only. Not a precedent for any other route's section structure.

**Approval:** Swayam, confirmed 26 Sep 2026.

---

## 2026-09-26 — Group homepage v2: Careers section scope (backfilled from Session 39)

**What was decided (Session 39, Step 0 review — recorded in `docs/progress.md` at the time but never logged here; this entry backfills that gap):** build the Careers section's real mechanism now rather than defer the whole section — job-listing UI with real filtering, and eventually a presigned CV upload + `/api/careers` route — but the three job listings themselves stay tagged `EXAMPLE`, no fabricated real vacancies (per `design_handoff_group_home_v2/reference/Management review notes.md`). A new `app/api/` route still requires human review before merge per CLAUDE.md, regardless of when it's built.

**Session 44 addendum (this build pass):** the CV-upload mechanism and `/api/careers` route are being deferred to a dedicated future session rather than built as part of this multi-section pass — the presigned-upload + validated-route + tests shape is comparable in size to the RFQ engine itself (which took multiple sessions originally), and rushing it through a compressed multi-section commit run risks exactly the kind of under-reviewed new attack surface CLAUDE.md's API-route review gate exists to catch. This section instead ships the job-listing UI (real `groupExampleJobs` records, `EXAMPLE` tag preserved) with a `mailto:` "Send us your CV" call to action — a real, working mechanism (opens the visitor's email client), not a fake success state — as an honest interim, not the full decided-on mechanism.

**Why:** Session 39's own decision already anticipated the route needing separate sign-off; this addendum makes that separation of concerns explicit rather than build the full route unreviewed inside a large batch of section commits.

**Scope:** the group homepage's Careers section only.

**Approval:** Session 39 portion approved by Swayam, 2026-09-26. The addendum is a scope-execution call, not a new architecture decision — flagged in `docs/progress.md` for Swayam's visibility, not a stop-and-ask blocker.
