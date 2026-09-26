// Non-CMS page-decoration data (stats bands, mega-menu lists) — no Zod
// schema exists for these (VG-011 scopes the JSON migration to
// Product/EntityRecord/Certification/Approval/ProductCategory only). Split
// out of content-loader.ts because that module does `node:fs` reads at load
// time — importing it from a 'use client' component (Chrome nav components)
// would try to bundle 'fs' into the browser build. This file has no fs
// dependency, so it's safe for both server and client imports. Relocated
// unchanged from the old lib/content/{dhruv-epc,precise-engineers,group}.ts
// files.

export const dhruvStats = [
  { value: '30+ yrs', label: 'Group experience', source: 'Est. 1994, Anand' },
  { value: 'U · U2 · IBR', label: 'Stamps held' },
  { value: '100 T', label: 'Max unit weight', source: 'DEMO figure — engineering data pending' },
  { value: '5 sectors', label: 'Oil & gas to steel' },
]

export const preciseStats = [
  { value: '30+ yrs', label: 'In expansion joints', source: 'Est. 1994, V.U.Nagar, Anand' },
  { value: '80 – 8,000 mm', label: 'Bellows size range', source: 'Circular NB; rectangular to 9,000 × 5,000 mm' },
  { value: 'EJMA · ASME', label: 'Design codes' },
  { value: '12 sectors', label: 'Oil & gas to atomic energy' },
]

export const groupStats = [
  { value: '30+ yrs', label: 'Group experience', source: 'Est. 1994, Anand' },
  { value: '2 works', label: 'Vadodara · Anand', source: 'Manjusar GIDC · V.U.Nagar GIDC' },
  { value: 'U · U2 · IBR', label: 'Stamps held' },
  { value: '12 sectors', label: 'Oil & gas to atomic energy' },
]

export const dhruvEquipment = {
  'static-equipment': [
    { name: 'Pressure Vessels', scope: 'Reactors, columns, drums to ASME Sec. VIII Div. 1 & 2', href: '/dhruv-epc/products/static-equipment/pressure-vessels/' },
    { name: 'Heat Exchangers', scope: 'Shell & tube to ASME Sec. VIII Div. 1 & 2, TEMA', href: '/dhruv-epc/products/static-equipment/heat-exchangers/' },
    { name: 'Storage Tanks & Air Receivers', scope: 'CS/SS storage to API 650 class duty', href: '/dhruv-epc/products/static-equipment/storage-tanks/' },
  ],
  'skids-packages': [
    { name: 'Process Skids', scope: 'Skid-mounted process packages, FAT-tested', href: '/dhruv-epc/products/skids-packages/process-skids/' },
    { name: 'Pipe Spools', scope: 'Shop-fabricated spools, CS/AS/SS, NDT-covered', href: '/dhruv-epc/products/skids-packages/pipe-spools/' },
  ],
  'fabrication-machining': [
    { name: 'Heavy Fabrication', scope: 'Structural and equipment fabrication', href: '/dhruv-epc/products/fabrication-machining/heavy-fabrication/' },
    { name: 'Heavy Machining', scope: 'Large-component machining services', href: '/dhruv-epc/products/fabrication-machining/heavy-machining/' },
    { name: 'Plate Flanges & Base Frames', scope: 'Machined flanges and equipment base frames', href: '/dhruv-epc/products/fabrication-machining/plate-flanges/' },
  ],
}

// Group homepage v2 Careers section (Datum §21-style trust-page spine,
// applied to a homepage section) — decisions.md 2026-09-26 "build the
// full flow now": real CV-upload mechanism + /api/careers route, but the
// three listings themselves stay EXAMPLE (no real vacancies confirmed yet,
// per design_handoff_group_home_v2/reference/Management review notes.md).
// Flip to [] (and the Careers section renders its "no open positions"
// state) once these are replaced or withdrawn — same on/off switch the
// prototype's own `showExampleJobs` toggle describes.
export interface GroupExampleJob {
  company: 'dhruv' | 'precise'
  companyLabel: string
  title: string
  department: string
  location: string
  employmentType: string
  experience: string
}

export const groupExampleJobs: GroupExampleJob[] = [
  {
    company: 'dhruv',
    companyLabel: 'Dhruv EPC Solutions',
    title: 'Design Engineer — Pressure Vessels',
    department: 'Engineering & design',
    location: 'Manjusar GIDC, Vadodara',
    employmentType: 'Full-time',
    experience: '3–6 years',
  },
  {
    company: 'dhruv',
    companyLabel: 'Dhruv EPC Solutions',
    title: 'QA/QC Inspector (NDT Level II)',
    department: 'Quality & inspection',
    location: 'Manjusar GIDC, Vadodara',
    employmentType: 'Full-time',
    experience: '4+ years',
  },
  {
    company: 'precise',
    companyLabel: 'Precise Engineers',
    title: 'Production Supervisor — Bellows Shop',
    department: 'Production',
    location: 'Vitthal Udyognagar, Anand',
    employmentType: 'Full-time',
    experience: '5+ years',
  },
]

// The group in figures (Datum §19's stats-band pattern) — 6th figure adds
// export destinations to the existing 4 groupStats above; kept separate
// (not merged into groupStats) since the two bands render in different
// sections with different source-line conventions.
export const groupFiguresExtra = {
  value: '5',
  label: 'Export destinations on record',
  source: 'USA · Argentina · Turkey · Saudi Arabia · Australia',
}

// Manufacturing disciplines grid (Datum §21 item 5's fabrication/QA strip
// pattern, applied group-wide) — which of the two works does each
// discipline apply to. Static page-decoration data, not a CMS record (no
// per-discipline detail page exists to justify one).
export interface ManufacturingDiscipline {
  title: string
  scope: string
  dhruv: boolean
  precise: boolean
}

export const manufacturingDisciplines: ManufacturingDiscipline[] = [
  { title: 'Design & engineering', scope: 'Code design to ASME, TEMA and EJMA; 3D modelling; FEA under special design conditions.', dhruv: true, precise: true },
  { title: 'Heavy fabrication', scope: 'Vessel shells, skids, base frames and structures up to 200 T per unit.', dhruv: true, precise: false },
  { title: 'Heavy machining', scope: 'Floor-type boring mills to Ø 4,000 mm for tube-sheets, flanges and large components.', dhruv: true, precise: false },
  { title: 'Bellows forming', scope: 'Convolution forming for circular bellows 80 – 8,000 mm NB and rectangular bellows.', dhruv: false, precise: true },
  { title: 'Welding', scope: 'Qualified procedures and welders for carbon steel, stainless, duplex and nickel alloys.', dhruv: true, precise: true },
  { title: 'Testing & inspection', scope: 'NDT, hydrotest and stage inspection to code and client ITP, witnessed by third parties.', dhruv: true, precise: true },
  { title: 'Skid integration & FAT', scope: 'Piping, electrical and instrumentation integration with factory acceptance testing.', dhruv: true, precise: false },
  { title: 'Heat & surface treatment', scope: 'Post-weld heat treatment and surface finishing — in-house scope to be confirmed.', dhruv: true, precise: true },
]

// Manufacturing works-level facts (per-works 2×2 grid) — mirrors the
// prototype's desplFacts/peFacts; kept here (not content-loader) since no
// Capability/EntityRecord field carries "largest skid on record" etc. yet.
export const dhruvWorksFacts = [
  { value: '200 T', label: 'Maximum unit weight, heavy fabrication' },
  { value: 'Ø 4,000 mm', label: 'Floor-type boring mills' },
  { value: '100 T', label: 'Heat exchangers, maximum unit weight' },
  { value: '21 m · 45 MT', label: 'Largest skid on record' },
]

export const preciseWorksFacts = [
  { value: '80 – 8,000 mm', label: 'NB range, circular metallic bellows' },
  { value: '9,000 × 5,000 mm', label: 'Maximum rectangular bellows' },
  { value: '3,700 PSI', label: 'Highest design pressure on record' },
  { value: '2,192 mm ID', label: 'Inconel 625 joint, cycle-life tested under TPI' },
]

// Our Journey timeline (Datum §11 addendum territory — a scroll-driven
// milestone list, not the exploded-view sequence). Years and photos marked
// pending per Management review notes.md — publish gate is content
// approval, not a code change; `pending: false` plus a supplied `photo`
// unblocks a milestone independently of the others.
export interface JourneyMilestone {
  year: string
  pending: boolean
  business: string
  title: string
  description: string
  photo?: string
}

export const journeyMilestones: JourneyMilestone[] = [
  { year: '1994', pending: true, business: 'Precise Engineers', title: 'Precise Engineers begins operations in Anand', description: 'The group’s first business starts work at GIDC Estate, Vitthal Udyognagar, Anand.' },
  { year: 'Year TBC', pending: true, business: 'Precise Engineers', title: 'Approved by Engineers India Limited', description: 'Precise Engineers is listed as an EIL approved vendor for expansion bellows and joints.' },
  { year: 'Year TBC', pending: true, business: 'Dhruv EPC Solutions', title: 'Dhruv EPC Solutions Pvt. Ltd. established', description: 'The group’s second business sets up its works at Manjusar GIDC, Savli, Vadodara, for pressure equipment and process skids.' },
  { year: 'Year TBC', pending: true, business: 'Dhruv EPC Solutions', title: 'ASME U and U2 Certificates of Authorization', description: 'DESPL is authorised to apply the ASME U and U2 code stamps, alongside IBR approval for boiler-quality equipment.' },
  { year: 'Year TBC', pending: true, business: 'Both businesses', title: 'Projects delivered for export', description: 'Project records include supply to the USA, Argentina, Turkey, Saudi Arabia and Australia.' },
  { year: '2026', pending: false, business: 'Vedanta Group', title: 'Two businesses, two works', description: 'Two specialised businesses, each with its own works, serving refiners, utilities, steel producers and EPC contractors across Dhruv EPC Solutions and Precise Engineers.' },
]

export const preciseProducts = {
  'expansion-joints': [
    { name: 'Metallic Bellows Expansion Joints', scope: 'EJMA/ASME B31.3, 80 – 8,000 mm NB circular', href: '/precise-engineers/products/expansion-joints/metallic-bellows-expansion-joint/' },
    { name: 'Telescopic Expansion Joints', scope: 'Slip-type joints for axial traverse', href: '/precise-engineers/products/expansion-joints/telescopic-expansion-joint/' },
    { name: 'Rubber Bellows', scope: 'Elastomeric joints for vibration and movement', href: '/precise-engineers/products/expansion-joints/rubber-bellows/' },
    { name: 'Fabric Bellows', scope: 'Fabric layup joints for hot flue-gas ducting', href: '/precise-engineers/products/expansion-joints/fabric-bellows/' },
    { name: 'Dismantling Joints', scope: 'Flanged joints with adjustment length for valve removal', href: '/precise-engineers/products/expansion-joints/dismantling-joint/' },
    { name: 'Flange Adaptors', scope: 'Pipe-to-flange transition couplings', href: '/precise-engineers/products/expansion-joints/flange-adaptor/' },
  ],
  'flow-control': [
    { name: 'Zero Velocity Valves', scope: 'Water-hammer protection for pumping mains', href: '/precise-engineers/products/flow-control/zero-velocity-valve/' },
    { name: 'Dual Plate Check Valves', scope: 'Compact non-return valves', href: '/precise-engineers/products/flow-control/dual-plate-check-valve/' },
    { name: 'Dampers', scope: 'Louver, butterfly and guillotine duct dampers', href: '/precise-engineers/products/flow-control/damper/' },
  ],
}
