# Website v2 — management review notes

## Group homepage v2 (Sept 2026)
File: `Vedanta Group Website v2.dc.html` (v1 kept). Hub "Vedanta Group" + "v2" opens it.
- Sequence: hero (30+ years) → About → Our Businesses (DESPL / PE panels) → Products & Solutions → Manufacturing → Figures → Clients & projects → 30-year journey → Quality → Enquiry → Footer.
- Navigation: About Us · Our Businesses (dropdown) · Products & Solutions (dropdown by business) · Projects & Clients · Quality · Contact · Request a Quote.
- The enquiry form asks which business the enquiry is for (DESPL, PE or "Not sure") and routes it to that business. It uses the same /api/rfq schema; "Not sure" sends without `company` and flags it in the message.
- DESPL and PE hero headlines changed to the approved lines.
- Layout follows general corporate-site practice (clear business architecture, editorial sections, restrained motion). It is not a copy of L&T's layout or assets.

### Needs approval or supply (group homepage)
- Confirm "Since 1994" and the 30+ years claim; supply years for the other 5 timeline milestones, plus archival photos.
- Hero photos are all from Precise Engineers. DESPL needs shop-floor photography to appear in the hero and in the manufacturing section.
- Reactors and distillation columns are not in DESPL's product records, so they are left out until confirmed. Plate flanges are listed under DESPL, as in the product data.
- Figures still required: total projects completed, workforce, works area, capacity.
- Group social media links.
- Careers: the three openings shown are EXAMPLE listings, marked on the page. Replace them with real vacancies, or switch them off with the "showExampleJobs" tweak to show the "no open positions" state. A careers mailbox, a CV-upload backend (/api/careers) and the CV retention period all need confirming. The prototype falls back to vedant@vedantagroup.net.


Files: `DESPL Website v2.dc.html`, `Precise Engineers Website v2.dc.html`, shared data in `vedanta-data.js`. v1 files are unchanged; the Prototype Hub switches between v1 and v2.

## What changed from v1
- Homepage rebuilt as a sequence: hero → credentials → customer challenge (with evidence) → capabilities → clients → industries → engineering-to-delivery process → projects → facilities → quality → closing call to action.
- New pages: Industries, Clients directory, Project portfolio, a case-study page for every project (15), Facilities, and a 4-step Request for Quotation form.
- Company switcher in the top bar on every page. Both sites now share one layout system; DESPL keeps the red accent, Precise Engineers uses blue with condensed Archivo headings.
- Navigation: Company · Capabilities · Industries · Clients & Projects · Quality & Facilities · Contact, plus a "Request a Quotation" button in the header.

## Clients
- The 44 clients come from the Vedanta Group brochure (p.4). The brochure does not say which company supplied each client, so both sites show them as a **group list**, marked "attribution pending".
- Only Emerson is marked as a verified DESPL client, because the project record names it (DRS and CGD skids). No Precise Engineers client is marked as verified yet. Chevron USA and the Siemens project are named in PE project records but do not appear in the brochure client list.
- The directory can be filtered by company and by industry, searched, and shown as a logo wall or a table. The industry for each client is a proposed classification.
- To update: edit `vedanta-data.js`. Set `company` / `verified` per client and the site updates.
- Logos are crops from the brochure. ONGC/MRPL and SWCOGEN/CEM share one combined crop each. Official logo files and permission to use them are needed before launch.

## Needs approval or supply
- Client-to-company attribution for 43 clients. Permission for each logo.
- Classification of the 12 group approval bodies (TPI, statutory body or approved-vendor list) and which company each applies to.
- Certificate scans, validity dates and the ISO certification body, for both companies.
- DESPL photography: shop-floor and fabrication-bay shots, welding, boring mill, hydrotest, plus photos for 6 of 8 product lines. DESPL has no real facility photo yet.
- Project photos and case-study details (requirement, approach, inspection, outcome), and whether customer names can be published (TOYO, Emerson, Chevron, Siemens).
- Pressure-vessel and metallic-bellows spec ranges marked "to be confirmed".
- Heat-treatment and surface-treatment scope; which NDT and tests are done in-house and which by approved agencies.
- "Since 1994" for Precise Engineers; leadership, workforce and works area for both companies.

## RFQ integration (backend pending)
- The form validates against the same rules as `packages/schemas/src/rfq.ts` and POSTs to `/api/rfq` using the RFQSubmission shape (honeypot, time trap, idempotency key).
- Industry, location and enquiry type are added to the start of `message`, because the schema drops unknown fields. Add these fields to the schema if you want them stored separately.
- File attachments are checked in the browser (type, 25 MB limit, maximum 5 files). `/api/presign` upload is not connected yet, so `uploadedFileKeys` is sent empty.
- If the API is missing, the form does not show a false success message. It says the enquiry was not sent and offers a pre-filled email to the chosen company's sales address.
- The privacy notice wording and the Privacy/Terms pages need legal review.
