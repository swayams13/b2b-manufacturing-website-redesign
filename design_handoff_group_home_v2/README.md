# Handoff: Vedanta Group homepage v2

## Overview
A redesign of the group homepage (`apps/web/app/(group)/page.tsx`, route `/`). Management has approved the concept for development. The page introduces the group and routes visitors to one of its two businesses (Dhruv EPC Solutions and Precise Engineers). It also collects enquiries and CVs.

Section order: Hero → About → Our Businesses → Products & Solutions → Manufacturing → Figures → Clients & Projects → Our Journey → Quality → Careers → Enquiry → Footer.

## About the design files
`reference/Vedanta Group Website v2.dc.html` is a **design reference built in HTML**. It shows the intended look and behaviour. It is not production code. Recreate it in the existing monorepo (Next.js 14 App Router, `@vedanta/datum-ui`, `@vedanta/tokens`, Zod schemas in `packages/schemas`) using the patterns already in the repo. To view the reference, serve the `reference/` folder (`npx serve reference`) and open the `.dc.html` file.

**`CLAUDE.md` and `docs/datum-design-system.md` take precedence over this prototype.** If the prototype disagrees with them, the conflict is listed under "Decisions needed". Do not build those parts until someone signs off.

## Fidelity
**High fidelity** for layout, hierarchy, copy and interaction. Colours, spacing and type sizes in the prototype are close to Datum v1.3 but were written as literal values. Map every value to the nearest named token (see "Design tokens"). Never ship an arbitrary Tailwind value.

## Decisions needed before build (named blockers)
1. **Hero is a 4-slide auto-rotating carousel.** Datum bans carousels. Options: (a) a static hero, with the four chapters shown as a row of in-page links; (b) get design-review approval for the rotation. Recommendation: (a).
2. **Accent fills on a group route.** The prototype uses a red (DESPL) and a blue (PE) filled "Explore Business" button and coloured card top-bars. The `(group)` layout is steel-only, and the RFQ button is the only accent-filled element allowed. Recommendation: turn the business buttons into steel outline buttons or accent-coloured links. Keep the red/blue as thin rules and labels only, if a design review approves that.
3. **Motion durations above the token set.** The prototype uses 700–1400 ms reveals and a 9 s Ken Burns zoom. The largest motion token is `signature` (700 ms). Either clamp to the tokens or raise a §26 token review.
4. **Archivo heading on the PE card.** Archivo was retired in tokens v1.3. Use Plus Jakarta Sans.
5. **Uppercase letter-spaced eyebrows.** Under D-6, prose eyebrows are title case and only mono labels are uppercase. Convert them.
6. **Careers section.** This needs a new `app/api/careers` route, which requires human review, plus CV storage. The storage must use presigned upload and never a server-body upload. The three job listings are EXAMPLES. Recommendation: ship Careers behind a flag that shows the "no open positions" state until real vacancies and a backend exist.
7. **Hero photography.** Every hero image is Precise Engineers work. A DESPL shop-floor photo is required (see `Management review notes.md`).
8. **Client grid vs `ClientMarquee`.** The home page currently uses `ClientMarquee`. The prototype shows a static logo grid with "show all". Pick one. The grid is closer to the "no carousel" law.

## Screens / sections
Container: `max-width 1360px`, centred, side padding `clamp(20px, 4vw, 48px)` → use the nearest spacing tokens (`px-6` to `px-12`). Section vertical padding `clamp(80px, 10vw, 136px)` → `py-24` / `py-32`.

1. **Utility bar** (`steel-950`-ish `#111417`, 38px). Group name, links to both businesses, phone and email. Contact data comes from the `EntityRecord`, never hard-coded.
2. **Header** (sticky, white, 84px, 1px `steel-200` bottom border, `shadow-raised` after scroll). Logo 56px tall. Nav: About Us · Our Businesses ▾ · Products & Solutions ▾ · Projects & Clients · Quality · Careers ▾ · Contact. Plus **Request a Quote** (the RFQ button, which is the one accent fill). Mega panels open on hover and click, reuse `MegaPanel` + `shadow-overlay`, and animate opacity plus translateY at `duration-standard`. Mobile: RFQ button + 44×44 burger → `MobileDrawer`.
3. **Hero** (`01 Hero`). Full-bleed photo with `overlay.hero` scrim. H1 "Engineering Excellence. / Built Over 30+ Years." (display-xl). Subhead in body-lg. Two CTAs. Bottom band: a "30+ Years of Engineering Experience · since 1994" count-up plus four chapter tabs. See Decision 1.
4. **About** (`02 About`). Two columns: copy, a definition list of the two works, and a link, next to a 5:4 photo with a mono caption. Copy is verbatim in the reference file.
5. **Our Businesses** (`03`, dark `steel-950`). Header row, then two cards (minmax 540px). Each card: 16:10 image, company logo, mono tagline, H3, scope paragraph, a product link list (2-col), and CTAs. See Decision 2.
6. **Products & Solutions** (`04`, `steel-50`). Six product cards (minmax 380px, 4:3 image, business tag, H3, description, mono chips, "View product →"). Use `ProductCard`. Missing photos render the no-photo variant, never a dashed placeholder in production.
7. **Manufacturing** (`05`). Two works panels, each with a 2×2 facts grid, a lead image and photo slots. Then an 8-item "Manufacturing disciplines" grid with DESPL/PE tags.
8. **Figures** (`06`, dark). `StatBand`: large figure, label and a mono source line. Only publish figures that have a source. The "FIGURES REQUIRED" note is for prototype review only.
9. **Clients & Projects** (`07`). Logo grid (`ClientWall`), a featured case (the Emerson CGD skids) and project cards (`ProjectCard`).
10. **Our Journey** (`08`, `steel-50`). Desktop: a sticky image and year panel on the left, a scroll-driven timeline on the right with a progress fill. Mobile: timeline only. Years marked TBC must be confirmed before publishing.
11. **Quality** (`09`). A certification panel for each business (`CertificationCard`/`Stamp`), plus the approval-bodies logo grid (`ApprovalWall`). Never mix DESPL and PE proof. Entity bleed blocks publishing.
12. **Careers** (`10`). See Decision 6.
13. **Enquiry** (`11`, dark). Left: a contact block for each business. Right: a form with a business radiogroup (DESPL / PE / Not sure), product select, name, company, email and phone, requirement, file attach (5 files, 25 MB, PDF/DWG/STEP/JPG/PNG), consent, and a "Routed to …" note. It POSTs `RFQSubmission` to `/api/rfq` with a honeypot, time trap and idempotency key. Files go through `/api/presign`.
14. **Footer**. Use the `Footer` component with the `EntityRecord`.

## Interactions and behaviour
- **Scroll reveal:** sections fade in and move up 20px the first time they enter the viewport (IntersectionObserver, runs once). Use `duration-deliberate`/`signature` with `easing.enter`.
- **Header:** the shadow appears after 4px of scroll. The mega panel closes on mouse-leave and Escape.
- **Timeline:** progress is scroll position within `#vg-tl`. The active milestone swaps the sticky image with an opacity crossfade.
- **Forms:** validate on submit and show inline errors under each field (`signal.error`). If the API is missing or fails, never show a false success. Show the "not sent" alert with a pre-filled `mailto:` for the chosen business.
- **Reduced motion:** all transitions drop to 0 ms, the count-up shows its final value, and the hero does not rotate.
- **Responsive:** desktop at ≥ 1024px shows the full nav. Below that, the drawer. All grids use `auto-fit`/`minmax`. At 320px there must be no horizontal scroll.

## State
The header needs `menu` (null / businesses / products / careers) and `mobileOpen`. The page needs `seen` (reveal keys) and `timelineProgress`. The enquiry form needs field values, errors, files, `status` (idle / sending / sent / failed) and `business`. The careers form (if shipped) is similar. All content comes from `content-loader` (products, clients, certifications, entity). The prototype reads `vedanta-data.js`, which mirrors those records.

## Design tokens (map prototype literals → tokens)
- Ink `#222334` / `#23282D` → `steel-900` text. Dark grounds `#1A1E22`/`#111417` → `steel-950`.
- `#F5F6F8` → `steel-50`, `#EDEFF2` → `steel-100`, `#E0E0E0` → `steel-200`, `#D9D9D9` → `steel-300`, `#A5A8B2` → `steel-400`, `#707070` → `steel-500`, `#5C5F6E` → `steel-600`, `#3F4250` → `steel-700`, `#2B2F38` → `steel-800`.
- DESPL red `#AA3833`/`#8D2F2A`/`#DC8D89` → `brand-500/600/300` (only via `var(--accent)` on Dhruv routes; see Decision 2).
- PE blue `#0E6BA8`/`#0A5589`/`#5BA8D4` → `flex-500/600/300`.
- Pending tags `#8A6116` on `#F5EDD8` → `signal.warn` / `warnTint` (prototype review only).
- Radius: the prototype's 2px → `rounded-sm` (3px).
- Shadows: the prototype's `0 18px 40px …` card hover → `shadow-hover`. Mega panel → `shadow-overlay`.
- Type: H1 → `display-xl`, section H2 → `h1` token (32–47px; the prototype goes to 56px, so clamp it), card H3 → `h3`, body 17px → `body`/`body-lg`, mono labels → `data`/`helper`/`caption`.
- Fonts: Plus Jakarta Sans (display and body) and IBM Plex Mono (data), via `next/font`.

## Assets
`reference/assets/`: logos (Vedanta, DESPL, PE), DESPL CGD skid and 3D skid model, and five PE works photos. Also `clients/` (42 logo crops from the brochure; permission pending) and `approvals/` (12). The production site already has logos under `apps/web/public/logos`. Use those, not these copies.

## Files
- `reference/Vedanta Group Website v2.dc.html`: the design (template at the top, logic class at the bottom with all copy and data).
- `reference/vedanta-data.js`: the prototype's data mirror (products, clients, projects).
- `reference/Management review notes.md`: approvals and content still required.
- `SKILLS-RUNBOOK.md`: the build-and-review sequence for Claude Code, using the three requested skills.
