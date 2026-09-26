// Group home — blueprint §14.2 section order (Session 9, VG-050):
// hero → products by category → industries served → proof → selected
// projects (omitted — no Project system yet, §8, gated on ⛔C-1) → the
// two companies (demoted from the old doors-first lead) → RFQ.
// Zero accent-filled elements outside the RFQ button (§13's amber/blue
// law) — the door CTAs stay accent-colored links, not fills.
import type { Metadata } from 'next'
import {
  Button,
  CategoryCard,
  CertificationCard,
  ClientMarquee,
  IndustryCard,
  StatBand,
  type StampProps,
} from '@vedanta/datum-ui'
import { buildOrganization } from '@vedanta/schemas'
import { HeroCarousel } from '../../components/group/HeroCarousel'
import { RFQBand } from '../../components/RFQBand'
import { getCertifications, getClients, getEntity, getIndustries, getProductCategoriesByCompany, getProductsByCompany } from '../../lib/content-loader'
import { categoryHref, industryHref } from '../../lib/product-urls'
import { groupStats } from '../../lib/site-data'

const dhruvCertifications = getCertifications('dhruv-epc')
const groupEntity = getEntity('group')
const preciseCertifications = getCertifications('precise-engineers')
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

// §14.2 item 6 — demoted from the old doors-first lead
const DOORS = [
  {
    company: 'dhruv' as const,
    name: 'Dhruv EPC Solutions',
    scope: 'Pressure vessels, heat exchangers and process skids to ASME Sec. VIII Div. 1 & 2',
    chips: ['ASME U · U2 · IBR', 'CS · SS · Ni alloys', 'Vadodara works'],
    groups: ['Static Equipment', 'Skids & Packages', 'Fabrication & Machining'],
    href: '/dhruv-epc',
    cta: 'Enter Dhruv EPC',
  },
  {
    company: 'precise' as const,
    name: 'Precise Engineers',
    scope: 'Metallic, rubber and fabric expansion joints to EJMA, 80 – 8,000 mm NB',
    chips: ['EJMA · ASME B31.3', '80 – 8,000 mm NB', 'EIL approved'],
    groups: ['Expansion Joints', 'Flow Control'],
    href: '/precise-engineers',
    cta: 'Enter Precise Engineers',
  },
]

const STAMP_BY_NAME: Record<string, StampProps['code'] | undefined> = {
  'ASME U Certificate of Authorization': 'U',
  'ASME U2 Certificate of Authorization': 'U2',
  'IBR Approval': 'IBR',
  'ISO 9001:2015 · 14001:2015 · 45001:2018': 'ISO-9001',
  'ISO 9001:2015': 'ISO-9001',
}

// §14.2 item 2 — products by category, both companies visible
const PRODUCT_COMPANIES = [
  { slug: 'dhruv-epc' as const, label: 'Dhruv EPC Solutions' },
  { slug: 'precise-engineers' as const, label: 'Precise Engineers' },
]

// Footer is owned by (group)/layout.tsx — pages must not render their own
// (2026-07-16 audit P0-1: this page previously stacked a second full footer
// under the layout's).

export default function GroupHome() {
  // §14.2 item 3 — only industries Session 8 marked contentComplete; may be
  // none yet (Session 8's own scoping). Omitted, not rendered empty —
  // CLAUDE.md's omit-not-empty convention.
  const completeIndustries = getIndustries().filter((i) => i.contentComplete)

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

        {/* §14.2 item 2 — products by category, the primary entry */}
        <section id="products" aria-labelledby="products-heading" className="bg-steel-900">
          <div className="mx-auto max-w-wide px-6 pb-24">
            <h2 id="products-heading" className="font-display text-h1 font-medium text-steel-50">
              Products.
            </h2>
            {PRODUCT_COMPANIES.map(({ slug, label }) => {
              const categories = getProductCategoriesByCompany(slug)
              const products = getProductsByCompany(slug)
              return (
                <div key={slug} data-company={slug === 'dhruv-epc' ? 'dhruv' : 'precise'} className="mt-8">
                  <h3 className="text-xs font-medium text-steel-400">{label}</h3>
                  <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {categories.map((category) => (
                      <CategoryCard
                        key={category.slug}
                        name={category.name}
                        oneLineScope={category.oneLineScope}
                        href={categoryHref(slug, category.slug)}
                        productCount={products.filter((p) => p.categorySlug === category.slug).length}
                        onDark
                      />
                    ))}
                  </div>
                </div>
              )
            })}
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

        {/* §14.2 item 4 — proof band: stats + certifications, real figures only */}
        <section className="border-t border-steel-200 bg-steel-50">
          <div className="mx-auto max-w-wide px-6 pt-12">
            <StatBand stats={groupStats} />
          </div>
        </section>

        <section id="proof" aria-labelledby="proof-heading" className="bg-steel-50">
          <div className="mx-auto max-w-wide px-6 py-16">
            <h2 id="proof-heading" className="font-display text-h1 font-medium text-steel-950">
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
          </div>
        </section>

        {/* §14.2 item 5 — selected projects: omitted, not rendered empty.
            The Project content model and getProjects() loader don't exist
            yet (blueprint §8, gated on ⛔C-1 — real project records).
            Writing a conditional against data that doesn't exist would be
            scaffolding for a future session, not this one; add the section
            here when that session ships getProjects(). */}

        {/* Clients & Projects spec §2/§4 — homepage clientele band (ref 4a).
            80px padding rounds to py-16 (64px, nearest token) per the
            2026-09-03 token-gap policy. */}
        <section aria-labelledby="clientele-band-heading" className="border-t border-steel-200 bg-steel-50">
          <div className="mx-auto max-w-wide px-6 py-16">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-body font-bold text-steel-950">Who we supply</p>
                <h2 id="clientele-band-heading" className="mt-2 font-display text-h1 font-medium text-steel-950">
                  Forty-four named clients
                </h2>
              </div>
              <Button variant="link" href="/clients-projects">
                See all clients &amp; projects ↗
              </Button>
            </div>
            <div className="mt-8 bg-white">
              <ClientMarquee rowA={clientMarqueeRowA} rowB={clientMarqueeRowB} />
            </div>
            <p className="mt-4 font-mono text-helper text-steel-500">Vedanta Group Brochure, 2026</p>
          </div>
        </section>

        {/* §14.2 item 6 — the two companies, demoted from the old lead */}
        <section aria-labelledby="companies-heading" className="border-t border-steel-200 bg-steel-900">
          <div className="mx-auto max-w-wide px-6 py-24">
            <h2 id="companies-heading" className="font-display text-h1 font-medium text-steel-50">
              Two specialized works, one group.
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {DOORS.map((door) => (
                <article
                  key={door.company}
                  data-company={door.company}
                  className="flex h-full flex-col rounded-sm border border-steel-800 bg-steel-950 p-8 transition-colors duration-fast ease-standard hover:border-accent"
                >
                  <div className="mb-8 h-px w-16 bg-accent" aria-hidden="true" />
                  <h3 className="font-display text-h3 font-medium text-steel-50">{door.name}</h3>
                  <p className="mt-2 text-body-lg text-steel-400">{door.scope}</p>
                  <ul className="mt-4 flex flex-wrap gap-2">
                    {door.chips.map((chip) => (
                      <li
                        key={chip}
                        className="rounded-sm border border-steel-800 bg-steel-900 px-3 py-1 font-mono text-helper text-steel-400"
                      >
                        {chip}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-4 text-xs font-medium text-steel-400">
                    {door.groups.join(' · ')}
                  </p>
                  <div className="mt-auto pt-8">
                    <Button variant="link" onDark href={door.href}>
                      {door.cta} →
                    </Button>
                  </div>
                </article>
              ))}
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
