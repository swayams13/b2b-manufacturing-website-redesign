// Group home — being rebuilt section-by-section to the group-home-v2 design
// (design_handoff_group_home_v2/README.md "Screens / sections"), replacing
// the old blueprint §14.2 section order in place per section (see
// docs/decisions.md, 2026-09-26 "page architecture" entry for the
// replace/keep call on each pre-v2 section). Zero accent-filled elements
// outside the RFQ button (§13's amber/blue law) except the two logged,
// scoped overrides in docs/decisions.md.
import type { Metadata } from 'next'
import Image from 'next/image'
import {
  ApprovalWall,
  Button,
  CertificationCard,
  ClientMarquee,
  IndustryCard,
  ProductCard,
  ProjectCard,
  StatBand,
  type StampProps,
} from '@vedanta/datum-ui'
import { buildOrganization } from '@vedanta/schemas'
import { HeroCarousel } from '../../components/group/HeroCarousel'
import { JourneyTimeline } from '../../components/group/JourneyTimeline'
import { RFQBand } from '../../components/RFQBand'
import { getApprovals, getCertifications, getClients, getEntity, getIndustries, getProductsByCompany, getProjectHighlights } from '../../lib/content-loader'
import { industryHref, productHref, productsIndexHref, rfqHref } from '../../lib/product-urls'
import { dhruvWorksFacts, groupExampleJobs, groupFiguresExtra, journeyMilestones, manufacturingDisciplines, preciseWorksFacts } from '../../lib/site-data'

const dhruvCertifications = getCertifications('dhruv-epc')
const groupApprovals = getApprovals('group')
const groupEntity = getEntity('group')
const preciseCertifications = getCertifications('precise-engineers')
const dhruvEntity = getEntity('dhruv-epc')
const preciseEntity = getEntity('precise-engineers')
// Clients & Projects spec §4: even indices row A, odd row B — 44 granted
// clients today (not the spec's "42", see docs/mistakes.md 2026-09-03).
const allClients = getClients()
const clientMarqueeRowA = allClients.filter((_, i) => i % 2 === 0)
const clientMarqueeRowB = allClients.filter((_, i) => i % 2 === 1)

export const metadata: Metadata = {
  title: 'Vedanta Group — Fabrication & Flow-Control Engineering',
  description:
    'Dhruv EPC Solutions (ASME U/U2, IBR static equipment, Vadodara) and Precise Engineers (EJMA expansion joints 80 – 8,000 mm, Anand). Est. 1994.',
}

// group-home-v2 §03 Our Businesses — replaces the old §14.2 item 6 DOORS
// cards (docs/decisions.md, 2026-09-26 "page architecture" entry). Product
// link lists are 6 of each company's real catalog (8 Dhruv EPC · 9 Precise
// Engineers products — matches the reference's own selection), built with
// productHref() rather than hardcoded paths.
const BUSINESSES = [
  {
    company: 'dhruv' as const,
    name: 'Dhruv EPC Solutions Pvt. Ltd.',
    logo: '/logos/dhruv-epc.png',
    tagline: 'Static equipment · EPC packages · heavy engineering',
    scope:
      'Pressure vessels, shell & tube heat exchangers, storage tanks and skid-mounted process packages, designed and fabricated to ASME, IBR and TEMA under ASME U and U2 Certificates of Authorization.',
    products: [
      ['static-equipment', 'pressure-vessels', 'Pressure Vessels'],
      ['static-equipment', 'heat-exchangers', 'Shell & Tube Heat Exchangers'],
      ['skids-packages', 'process-skids', 'Process Skids'],
      ['skids-packages', 'pipe-spools', 'Pipe Spools'],
      ['fabrication-machining', 'heavy-fabrication', 'Heavy Fabrication'],
      ['fabrication-machining', 'heavy-machining', 'Heavy Machining'],
    ] as const,
    photo: '/photography/dhruv-epc/despl-cgd-skid.jpg',
    photoAlt: 'City Gas Distribution skid fabricated by Dhruv EPC Solutions for Emerson',
    photoTag: 'Manjusar GIDC, Vadodara',
    exploreHref: '/dhruv-epc',
    enquireHref: rfqHref('dhruv'),
  },
  {
    company: 'precise' as const,
    name: 'Precise Engineers',
    logo: '/logos/precise-engineers.png',
    tagline: 'Expansion joints · bellows · pipeline components',
    scope:
      'Metallic, rubber and fabric expansion joints, dismantling joints, flange adaptors, valves and dampers, designed to EJMA and ASME B31.3 and built in our own works. EIL approved vendor.',
    products: [
      ['expansion-joints', 'metallic-bellows-expansion-joint', 'Metallic Bellows Expansion Joints'],
      ['expansion-joints', 'dismantling-joint', 'Dismantling Joints'],
      ['expansion-joints', 'telescopic-expansion-joint', 'Telescopic Expansion Joints'],
      ['expansion-joints', 'rubber-bellows', 'Rubber Bellows'],
      ['expansion-joints', 'flange-adaptor', 'Flange Adaptors'],
      ['flow-control', 'damper', 'Dampers'],
    ] as const,
    photo: '/photography/precise-engineers/pe-inline-pb.jpg',
    photoAlt: 'Inline pressure-balanced expansion joints built by Precise Engineers',
    photoTag: 'Vitthal Udyognagar, Anand',
    exploreHref: '/precise-engineers',
    enquireHref: rfqHref('precise'),
  },
]

const STAMP_BY_NAME: Record<string, StampProps['code'] | undefined> = {
  'ASME U Certificate of Authorization': 'U',
  'ASME U2 Certificate of Authorization': 'U2',
  'IBR Approval': 'IBR',
  'ISO 9001:2015 · 14001:2015 · 45001:2018': 'ISO-9001',
  'ISO 9001:2015': 'ISO-9001',
}

// group-home-v2 §04 Products & Solutions — replaces the old §14.2 item 2
// CategoryCard grid (docs/decisions.md, 2026-09-26 "page architecture"
// entry) with a curated 6-of-17 showcase, matching the reference's own
// selection size. "Process Skids" gets despl-skid-3d.jpg (a real, unused
// promoted asset — a labeled CAD render, Datum §2.1, not passed off as shop
// photography); the rest render ProductCard's own no-photo variant rather
// than force a photo onto a product with no real shoot yet.
const FEATURED_PRODUCTS: Array<{ company: 'dhruv-epc' | 'precise-engineers'; categorySlug: string; slug: string }> = [
  { company: 'dhruv-epc', categorySlug: 'static-equipment', slug: 'pressure-vessels' },
  { company: 'dhruv-epc', categorySlug: 'skids-packages', slug: 'process-skids' },
  { company: 'dhruv-epc', categorySlug: 'static-equipment', slug: 'heat-exchangers' },
  { company: 'precise-engineers', categorySlug: 'expansion-joints', slug: 'metallic-bellows-expansion-joint' },
  { company: 'precise-engineers', categorySlug: 'expansion-joints', slug: 'rubber-bellows' },
  { company: 'precise-engineers', categorySlug: 'expansion-joints', slug: 'dismantling-joint' },
]

// Footer is owned by (group)/layout.tsx — pages must not render their own
// (2026-07-16 audit P0-1: this page previously stacked a second full footer
// under the layout's).

export default function GroupHome() {
  // §14.2 item 3 — only industries Session 8 marked contentComplete; may be
  // none yet (Session 8's own scoping). Omitted, not rendered empty —
  // CLAUDE.md's omit-not-empty convention.
  const completeIndustries = getIndustries().filter((i) => i.contentComplete)
  const dhruvProductCount = getProductsByCompany('dhruv-epc').length
  const preciseProductCount = getProductsByCompany('precise-engineers').length
  const featuredProducts = FEATURED_PRODUCTS.map(({ company, slug }) => {
    const product = getProductsByCompany(company).find((p) => p.slug === slug)
    if (!product) throw new Error(`FEATURED_PRODUCTS references missing product: ${company}/${slug}`)
    return product
  })
  const dhruvProjects = getProjectHighlights('dhruv-epc')
  const preciseProjects = getProjectHighlights('precise-engineers')
  const dhruvProjectCount = dhruvProjects.length
  const preciseProjectCount = preciseProjects.length
  // group-home-v2 §07 Clients & Projects: the featured case is named
  // explicitly in the README ("the Emerson CGD skids") — a real,
  // low-detail ProjectHighlight record, paired with the one real photo
  // that documents it.
  const featuredProject = dhruvProjects.find((p) => p.slug === 'dhruv-epc-cgd-skids-emerson')
  if (!featuredProject) throw new Error('Featured project dhruv-epc-cgd-skids-emerson is missing from content/projects')
  const teaserProjectSlugs = ['precise-expansion-joint-chevron-usa', 'precise-fccu-expansion-joint-inconel-625', 'dhruv-epc-toyo-ngc-skid']
  const teaserProjects = teaserProjectSlugs.map((slug) => {
    const project = dhruvProjects.find((p) => p.slug === slug) ?? preciseProjects.find((p) => p.slug === slug)
    if (!project) throw new Error(`Teaser project slug missing from content/projects: ${slug}`)
    return project
  })
  // group-home-v2 §06 Figures — six sourced figures (README item 8: "only
  // publish figures that have a source"), replacing the old §14.2 item 4
  // groupStats-only band (docs/decisions.md, 2026-09-26 "page architecture"
  // entry). groupStats itself is untouched — still used by /about.
  const figures = [
    { value: '30+', label: 'Years of engineering experience', source: 'Since 1994' },
    {
      value: '2',
      label: 'Manufacturing works',
      source: 'Manjusar GIDC, Vadodara · Vitthal Udyognagar, Anand',
    },
    {
      value: String(dhruvProductCount + preciseProductCount),
      label: 'Product lines',
      source: `${dhruvProductCount} Dhruv EPC · ${preciseProductCount} Precise Engineers`,
    },
    { value: String(allClients.length), label: 'Clients on the group list', source: 'Vedanta Group brochure, 2026' },
    {
      value: String(dhruvProjectCount + preciseProjectCount),
      label: 'Documented projects',
      source: `${dhruvProjectCount} Dhruv EPC · ${preciseProjectCount} Precise Engineers`,
    },
    { ...groupFiguresExtra },
  ]

  return (
    <>
      <main>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(buildOrganization(groupEntity)) }}
        />

        {/* §14.2 item 1 — hero. Group homepage v2 rebuild (Session 39):
            replaces the split HomeHero with the design handoff's 4-slide
            carousel — an approved, page-scoped override of the carousel
            ban (docs/decisions.md, 2026-09-26 "Group homepage v2 hero").
            Not a precedent for HomeHero itself, still used unchanged on
            the Dhruv/Precise home pages. */}
        <HeroCarousel />

        {/* group-home-v2 §02 About (design_handoff_group_home_v2/README.md
            "Screens / sections" item 4). Copy ported near-verbatim from the
            reference, cross-checked against productCategories/*.json so
            "valves and dampers" / "storage tanks" aren't overclaims. The
            reference's #heritage in-page anchor becomes a real link to
            /about — this build uses routes, not a single-page anchor
            scroll. Per-company dot color on the works list intentionally
            stays steel, not brand/flex red-blue: the only accent-color
            override approved so far (docs/decisions.md, 2026-09-26) is
            scoped to the "Our Businesses" cards, not here. */}
        <section id="about" aria-labelledby="about-heading" className="border-t border-steel-200 bg-white">
          <div className="mx-auto grid max-w-wide grid-cols-1 items-center gap-12 px-6 py-24 lg:grid-cols-2 lg:gap-16">
            <div>
              <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
                <span className="h-px w-6 bg-current" aria-hidden="true" />
                About the group
              </p>
              <h2
                id="about-heading"
                className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950"
              >
                Built on Experience. Driven by Engineering.
              </h2>
              <p className="mt-6 text-body-lg text-steel-950">
                The Vedanta Group of Companies is an engineering and manufacturing group based
                in Gujarat, India. It operates through two businesses, each with its own works,
                engineering team and certifications.
              </p>
              <p className="mt-4 text-body text-steel-700">
                Dhruv EPC Solutions designs and fabricates pressure vessels, heat exchangers,
                storage tanks and skid-mounted process packages. Precise Engineers designs and
                manufactures expansion joints, dismantling joints, valves and dampers. Customers
                include refiners, power utilities, steel producers, equipment manufacturers and
                EPC contractors, in India and for export.
              </p>
              <dl className="mt-8 grid grid-cols-1 gap-x-8 border-t-2 border-steel-950 sm:grid-cols-2">
                {[dhruvEntity, preciseEntity].map((entity) => (
                  <div key={entity.companySlug} className="border-b border-steel-200 py-4">
                    <dt className="flex items-center gap-2 text-sm font-bold text-steel-950">
                      <span className="size-2 flex-none bg-steel-950" aria-hidden="true" />
                      {entity.legalName}
                    </dt>
                    <dd className="mt-2 text-sm text-steel-600">
                      {entity.worksAddresses[0]!.label} · {entity.worksAddresses[0]!.address}
                    </dd>
                  </div>
                ))}
              </dl>
              <div className="mt-8">
                <Button variant="link" href="/about">
                  About Us — our 30-year journey →
                </Button>
              </div>
            </div>
            <figure className="relative m-0">
              {/* §16's only card-photo ratio token is 4/3 (packages/tokens/
                  src/tailwind.ts) — the reference's 5:4 has no matching
                  token and adding one is a §26 review event, not a
                  section commit. 4/3 is the nearest available crop. */}
              <div className="aspect-4/3 overflow-hidden bg-steel-950">
                <Image
                  src="/photography/precise-engineers/pe-large-bore-ej.jpg"
                  alt="Large-bore expansion joint on the Precise Engineers shop floor"
                  width={800}
                  height={640}
                  className="size-full object-cover"
                />
              </div>
              <figcaption className="absolute bottom-0 left-0 bg-white px-4 py-2 font-mono text-helper text-steel-600">
                Large-bore expansion joint · Precise Engineers works
              </figcaption>
            </figure>
          </div>
        </section>

        {/* group-home-v2 §03 Our Businesses — replaces the old §14.2 item 6
            DOORS section (docs/decisions.md, 2026-09-26 "page architecture"
            entry). The thin brand/flex top rule + mono tagline on each card
            is the one other approved accent-color override on this page
            (docs/decisions.md, 2026-09-26 "business-card accent as rule +
            label, not fill") — the "Explore Business" / "Enquire" buttons
            stay non-accent (steel primary / secondary), so the RFQ button
            remains the page's only accent-*filled* element. */}
        <section id="businesses" aria-labelledby="businesses-heading" className="border-t border-steel-800 bg-steel-950">
          <div className="mx-auto max-w-wide px-6 py-24">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-content">
                <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-400">
                  <span className="h-px w-6 bg-current" aria-hidden="true" />
                  Our Businesses
                </p>
                <h2 id="businesses-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-50">
                  Two specialised businesses. One engineering group.
                </h2>
              </div>
              <p className="max-w-content text-body-lg text-steel-300">
                Each business makes its own product range in its own works, holds its own
                certifications and handles its own enquiries.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {BUSINESSES.map((biz) => (
                <article
                  key={biz.company}
                  data-company={biz.company}
                  aria-labelledby={`biz-${biz.company}-h`}
                  className="flex flex-col bg-white text-steel-950"
                >
                  <a href={biz.exploreHref} aria-label={`Explore ${biz.name}`} className="group relative block aspect-video overflow-hidden bg-steel-100">
                    <Image
                      src={biz.photo}
                      alt={biz.photoAlt}
                      fill
                      sizes="(min-width: 1024px) 50vw, 100vw"
                      className="object-cover transition-transform duration-signature ease-standard group-hover:scale-105"
                    />
                    <span className={`absolute inset-x-0 top-0 h-1 ${biz.company === 'dhruv' ? 'bg-brand-500' : 'bg-flex-500'}`} aria-hidden="true" />
                    <span className="absolute bottom-0 left-0 bg-steel-950/90 px-4 py-2 font-mono text-helper text-white">
                      {biz.photoTag}
                    </span>
                  </a>
                  <div className="flex flex-1 flex-col gap-4 p-8 sm:p-12">
                    <Image src={biz.logo} alt="" width={140} height={38} className="h-8 w-auto self-start" />
                    <div>
                      <p className={`mb-2 font-mono text-helper ${biz.company === 'dhruv' ? 'text-brand-600' : 'text-flex-600'}`}>
                        {biz.tagline}
                      </p>
                      <h3 id={`biz-${biz.company}-h`} className="font-display text-h3 font-medium leading-tight text-steel-950">
                        {biz.name}
                      </h3>
                    </div>
                    <p className="text-body text-steel-700">{biz.scope}</p>
                    {/* A Button (§13) is a box or inline text link, not a
                        full-width space-between row with a trailing glyph —
                        no existing component fits this list-row shape, so
                        it's a plain, directly-styled <a> (global
                        :focus-visible still applies, it's not Button-only). */}
                    <ul className="grid grid-cols-1 gap-x-6 border-t border-steel-200 sm:grid-cols-2">
                      {biz.products.map(([categorySlug, slug, name]) => (
                        <li key={slug} className="border-b border-steel-100">
                          <a
                            href={productHref(biz.company === 'dhruv' ? 'dhruv-epc' : 'precise-engineers', categorySlug, slug)}
                            className="flex items-center justify-between gap-3 py-3 text-sm font-semibold text-steel-950 transition-colors duration-instant ease-standard hover:text-steel-600"
                          >
                            {name}
                            <span aria-hidden="true">→</span>
                          </a>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-auto flex flex-wrap gap-3 pt-2">
                      <Button variant="primary" href={biz.exploreHref}>
                        Explore Business →
                      </Button>
                      <Button variant="secondary" href={biz.enquireHref}>
                        Enquire with {biz.name.split(' ')[0]}
                      </Button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* group-home-v2 §04 Products & Solutions — replaces the old §14.2
            item 2 CategoryCard grid (docs/decisions.md, 2026-09-26 "page
            architecture" entry). Category-level browsing now lives on the
            Our Businesses cards' product link lists above; this is a
            curated showcase of individual products. */}
        <section id="products" aria-labelledby="products-heading" className="bg-steel-50">
          <div className="mx-auto max-w-wide px-6 py-24">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="max-w-content">
                <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
                  <span className="h-px w-6 bg-current" aria-hidden="true" />
                  Products &amp; Solutions
                </p>
                <h2 id="products-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950">
                  Core product lines across the group
                </h2>
              </div>
              <p className="max-w-content text-body-lg text-steel-700">
                Six of the group&apos;s {dhruvProductCount + preciseProductCount} product lines. Each opens its
                detail page on the business that makes it.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {featuredProducts.map((product) => (
                <ProductCard
                  key={product.slug}
                  name={product.name}
                  oneLineScope={product.oneLineScope}
                  href={productHref(product.companySlug, product.categorySlug, product.slug)}
                  chips={product.codes.slice(0, 3)}
                  photo={
                    product.slug === 'process-skids' ? (
                      <Image
                        src="/photography/dhruv-epc/despl-skid-3d.jpg"
                        alt="3D model of a skid package from the Dhruv EPC Solutions design office"
                        width={600}
                        height={450}
                        className="size-full object-cover"
                      />
                    ) : undefined
                  }
                />
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button variant="secondary" href={productsIndexHref('dhruv-epc')}>
                All Dhruv EPC Solutions products →
              </Button>
              <Button variant="secondary" href={productsIndexHref('precise-engineers')}>
                All Precise Engineers products →
              </Button>
            </div>
          </div>
        </section>

        {/* §14.2 item 3 — industries served, the secondary entry */}
        {completeIndustries.length > 0 && (
          <section aria-labelledby="industries-heading" className="border-t border-steel-200 bg-white">
            <div className="mx-auto max-w-wide px-6 py-16">
              <h2 id="industries-heading" className="font-display text-h1 font-medium text-steel-950">
                Industries served.
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {completeIndustries.map((industry, i) => (
                  <IndustryCard
                    key={industry.slug}
                    name={industry.name}
                    index={String(i + 1).padStart(2, '0')}
                    href={industryHref(industry.slug)}
                    servedBy={industry.companySlugs
                      .filter((c): c is 'dhruv-epc' | 'precise-engineers' => c !== 'group')
                      .map((c) => (c === 'dhruv-epc' ? 'dhruv' : 'precise'))}
                    projectCount={0}
                  />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* group-home-v2 §05 Manufacturing — new section, no pre-v2
            equivalent. Facts/disciplines come from lib/site-data.ts's
            dhruvWorksFacts/preciseWorksFacts/manufacturingDisciplines
            (real sourced figures, already extracted from the reference).
            The reference's small per-works "facility slot" photo grid
            (fabrication bay, boring mill, hydrotest, etc.) is omitted, not
            rendered with placeholder tags — that photography genuinely
            doesn't exist yet (docs/progress.md Session 40) and CLAUDE.md's
            omit-not-empty convention beats inventing a new "photo
            required" tag pattern for content with no real shoot planned.
            Top border stays plain steel, not brand/flex, for the same
            reason as the About section's works-list dots: the only
            approved accent-color override is scoped to the Our Businesses
            cards specifically. */}
        <section id="capabilities" aria-labelledby="manufacturing-heading" className="border-t border-steel-200 bg-white">
          <div className="mx-auto max-w-wide px-6 py-24">
            <div className="max-w-content">
              <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
                <span className="h-px w-6 bg-current" aria-hidden="true" />
                Manufacturing &amp; engineering
              </p>
              <h2 id="manufacturing-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950">
                Engineering Capability. Manufacturing Precision.
              </h2>
              <p className="mt-6 text-body-lg text-steel-700">
                Design, fabrication, machining, forming and testing are carried out in the
                group&apos;s two works. The figures below are taken from each business&apos;s product
                and project records.
              </p>
            </div>
            <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {[
                {
                  company: 'dhruv' as const,
                  label: 'Dhruv EPC Solutions · Manjusar works',
                  facilitiesHref: '/dhruv-epc/capabilities',
                  facts: dhruvWorksFacts,
                  image: '/photography/dhruv-epc/despl-skid-3d.jpg',
                  imageAlt: '3D model of a skid package from the Dhruv EPC Solutions design office',
                },
                {
                  company: 'precise' as const,
                  label: 'Precise Engineers · Anand works',
                  facilitiesHref: '/precise-engineers/capabilities',
                  facts: preciseWorksFacts,
                  image: '/photography/precise-engineers/pe-shopfloor-team.jpg',
                  imageAlt: 'Precise Engineers team with expansion joints staged for inspection',
                },
              ].map((works) => (
                <div key={works.company} data-company={works.company} className="flex flex-col border-t-2 border-steel-950 bg-steel-50">
                  <div className="flex flex-wrap items-baseline justify-between gap-3 p-6">
                    <span className="text-body font-bold text-steel-950">{works.label}</span>
                    <Button variant="link" href={works.facilitiesHref}>
                      Facilities →
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-px border-y border-steel-200 bg-steel-200">
                    {works.facts.map((fact) => (
                      <div key={fact.label} className="bg-white p-6">
                        <div className="font-mono text-h4 font-extrabold leading-tight tracking-tight text-steel-950">
                          {fact.value}
                        </div>
                        <div className="mt-2 text-sm text-steel-600">{fact.label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="aspect-video overflow-hidden bg-steel-100 p-6">
                    <div className="relative size-full overflow-hidden">
                      <Image src={works.image} alt={works.imageAlt} fill className="object-cover" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-12">
              <h3 className="text-xs font-medium uppercase tracking-caption text-steel-600">
                Manufacturing disciplines
              </h3>
              <div className="mt-4 grid grid-cols-1 gap-px border border-steel-200 bg-steel-200 sm:grid-cols-2 lg:grid-cols-4">
                {manufacturingDisciplines.map((d, i) => (
                  <div key={d.title} className="bg-white p-6">
                    <span className="font-mono text-xs text-steel-500">{String(i + 1).padStart(2, '0')}</span>
                    <h4 className="mt-2 text-sm font-bold text-steel-950">{d.title}</h4>
                    <p className="mt-2 text-sm text-steel-600">{d.scope}</p>
                    <p className="mt-3 font-mono text-helper text-steel-500">
                      {[d.dhruv && 'DESPL', d.precise && 'PE'].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* group-home-v2 §06 Figures — replaces the old §14.2 item 4
            groupStats band (docs/decisions.md, 2026-09-26 "page
            architecture" entry) with six sourced figures, computed from
            real content-loader counts rather than hardcoded. */}
        <section aria-labelledby="figures-heading" className="border-t border-steel-800 bg-steel-950">
          <div className="mx-auto max-w-wide px-6 py-24">
            <h2 id="figures-heading" className="mb-8 flex items-center gap-3 font-mono text-caption font-bold uppercase tracking-caption text-steel-400">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              The group in figures
            </h2>
            <StatBand stats={figures} onDark />
          </div>
        </section>

        {/* group-home-v2 §07 Clients & Projects — replaces the old §14.2
            item 5 (omitted) + the old clientele band (docs/decisions.md,
            2026-09-26 "page architecture" entry). Keeps ClientMarquee per
            README Decision 8 ("closer to the no-carousel law" than the
            prototype's static grid), extended with the named featured case
            and a ProjectCard teaser — both now buildable since
            getProjectHighlights() ships real records (the old comment here
            claiming it "doesn't exist yet" was stale). No case-study pages
            exist yet, so the featured case and every ProjectCard link to
            the full /clients-projects record instead of a per-project URL
            that doesn't exist. */}
        <section aria-labelledby="clients-projects-heading" className="border-t border-steel-200 bg-steel-50">
          <div className="mx-auto max-w-wide px-6 py-24">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
                  <span className="h-px w-6 bg-current" aria-hidden="true" />
                  Clients &amp; Projects
                </p>
                <h2 id="clients-projects-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950">
                  {allClients.length} named clients, {dhruvProjectCount + preciseProjectCount} documented jobs
                </h2>
              </div>
              <Button variant="link" href="/clients-projects">
                See all clients &amp; projects ↗
              </Button>
            </div>
            <div className="mt-12 bg-white">
              <ClientMarquee rowA={clientMarqueeRowA} rowB={clientMarqueeRowB} />
            </div>
            <p className="mt-4 font-mono text-helper text-steel-500">Vedanta Group Brochure, 2026</p>

            <div className="mt-16 grid grid-cols-1 items-center gap-8 border border-steel-200 bg-white lg:grid-cols-2">
              <div className="relative aspect-video overflow-hidden bg-steel-100 lg:aspect-square">
                <Image
                  src="/photography/dhruv-epc/despl-cgd-skid.jpg"
                  alt="City Gas Distribution skid fabricated by Dhruv EPC Solutions for Emerson"
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-contain p-8"
                />
              </div>
              <div className="p-8 lg:p-12">
                <p className="text-xs font-medium uppercase tracking-caption text-steel-500">Featured case · Dhruv EPC Solutions</p>
                <h3 className="mt-3 font-display text-h3 font-medium text-steel-950">{featuredProject.statement}</h3>
                <p className="mt-4 font-mono text-helper text-steel-500">{featuredProject.tags.join(' · ')}</p>
                <div className="mt-6">
                  <Button variant="link" href="/clients-projects">
                    See the full project record →
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {teaserProjects.map((project) => (
                <ProjectCard
                  key={project.slug}
                  title={project.statement}
                  sector={project.tags.join(' · ')}
                  href="/clients-projects"
                  metrics={project.figures.map((f) => ({ label: f.label, value: `${f.value}${f.unit ? ' ' + f.unit : ''}` }))}
                />
              ))}
            </div>
          </div>
        </section>

        {/* group-home-v2 §08 Our Journey — new section, no pre-v2
            equivalent. See components/group/JourneyTimeline.tsx for the
            scroll-tracking behavior and the "Year TBC" content-gate note
            (README: "Years marked TBC must be confirmed before
            publishing" — a launch gate, not a code problem, on this
            prototype demo). */}
        <section id="heritage" aria-labelledby="journey-heading" className="border-t border-steel-200 bg-steel-50">
          <div className="mx-auto max-w-wide px-6 py-24">
            <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Our Journey
            </p>
            <h2 id="journey-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950">
              Three decades on the shop floor.
            </h2>
            <div className="mt-12">
              <JourneyTimeline milestones={journeyMilestones} />
            </div>
          </div>
        </section>

        {/* group-home-v2 §09 Quality — relocated from its old §14.2
            position (which sat before Clients & Projects) to match the v2
            section order; content unchanged in this commit. */}
        <section id="quality" aria-labelledby="proof-heading" className="border-t border-steel-200 bg-white">
          <div className="mx-auto max-w-wide px-6 py-24">
            <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Quality
            </p>
            <h2 id="proof-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950">
              Certifications &amp; approvals
            </h2>
            {[
              { label: 'Dhruv EPC Solutions', certs: dhruvCertifications },
              { label: 'Precise Engineers', certs: preciseCertifications },
            ].map((group) => (
              <div key={group.label} className="mt-8">
                <h3 className="text-xs font-medium text-steel-600">
                  {group.label}
                </h3>
                <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {group.certs.map((cert) => (
                    <CertificationCard
                      key={cert.name}
                      stampCode={STAMP_BY_NAME[cert.name]}
                      name={cert.name}
                      scopeStatement={cert.scopeStatement}
                      issuer={cert.issuer}
                      validFrom={cert.validFrom}
                      validTo={cert.validTo}
                      artifactUrl={cert.artifactUrl}
                    />
                  ))}
                </div>
              </div>
            ))}
            <div className="mt-16 border-t border-steel-200 pt-16">
              <h3 className="text-xs font-medium uppercase tracking-caption text-steel-600">
                Approved &amp; inspected by
              </h3>
              <div className="mt-8">
                <ApprovalWall approvals={groupApprovals} />
              </div>
            </div>
          </div>
        </section>

        {/* group-home-v2 §10 Careers — new section. Session 39's "build the
            full mechanism now" decision (backfilled to docs/decisions.md,
            2026-09-26) is only partly executed here: real EXAMPLE job
            listings, but the presigned CV upload + /api/careers route are
            deferred to a dedicated session (same entry, "Session 44
            addendum") rather than rushed through unreviewed inside this
            batch of section commits. "Send us your CV" is a real mailto:
            link (groupEntity's own email, not hardcoded) — a working
            mechanism, not a fake success state. Renders the "no open
            positions" fallback if groupExampleJobs is ever emptied, per
            the README's own on/off convention for this list. */}
        <section id="careers" aria-labelledby="careers-heading" className="border-t border-steel-200 bg-steel-50">
          <div className="mx-auto max-w-wide px-6 py-24">
            <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-600">
              <span className="h-px w-6 bg-current" aria-hidden="true" />
              Careers
            </p>
            <h2 id="careers-heading" className="text-balance font-display text-h1 font-medium leading-none tracking-tight text-steel-950">
              Build your career in engineering and manufacturing
            </h2>
            {groupExampleJobs.length === 0 ? (
              <p className="mt-8 max-w-content text-body-lg text-steel-700">
                There are no open positions right now. Send us your CV below and we&apos;ll keep it on file for the
                next matching role.
              </p>
            ) : (
              <div className="mt-12 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {[
                  { company: 'dhruv' as const, label: 'Dhruv EPC Solutions' },
                  { company: 'precise' as const, label: 'Precise Engineers' },
                ].map(({ company, label }) => {
                  const jobs = groupExampleJobs.filter((j) => j.company === company)
                  if (jobs.length === 0) return null
                  return (
                    <div key={company} data-company={company}>
                      <h3 className="text-xs font-medium uppercase tracking-caption text-steel-600">{label}</h3>
                      <ul className="mt-4 flex flex-col gap-4">
                        {jobs.map((job) => (
                          <li key={job.title} className="rounded-sm border border-steel-200 bg-white p-6">
                            <p className="font-mono text-helper text-steel-500">EXAMPLE listing</p>
                            <h4 className="mt-2 font-display text-h4 font-medium text-steel-950">{job.title}</h4>
                            <p className="mt-2 text-sm text-steel-700">
                              {job.department} · {job.location}
                            </p>
                            <p className="mt-1 font-mono text-helper text-steel-500">
                              {job.employmentType} · {job.experience}
                            </p>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                })}
              </div>
            )}
            <div className="mt-12 rounded-sm border border-steel-200 bg-white p-8">
              <h3 className="font-display text-h3 font-medium text-steel-950">Send us your CV</h3>
              <p className="mt-3 max-w-content text-body text-steel-700">
                Apply for an open position above, or send a general application — we review CVs against current
                and upcoming roles at both businesses.
              </p>
              <div className="mt-6">
                <Button
                  variant="primary"
                  href={`mailto:${groupEntity.emails[0]}?subject=${encodeURIComponent('Job application')}`}
                >
                  Email your CV to {groupEntity.emails[0]}
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* §14.2 item 7 — RFQ closer */}
      <RFQBand />

      {/* §6.1.5 title-block footer renders from (group)/layout.tsx —
          audit P0-1: this page previously stacked a second full footer. */}
    </>
  )
}
