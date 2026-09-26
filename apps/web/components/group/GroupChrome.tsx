'use client'
// Group nav chrome — Header + MobileDrawer wiring for the (group) route
// layout. Group homepage v2 rebuild (design_handoff_group_home_v2): nav
// restructured to the README's "Header" section spec — About Us · Our
// Businesses ▾ · Products & Solutions ▾ · Projects & Clients · Quality ·
// Careers ▾ · Contact — replacing the prior Industries · Capabilities ·
// Projects · Company set (Session 9, VG-051). This is a site-wide nav
// change (GroupChrome is shared chrome across every (group) route, not
// just the homepage) — flagged for review in the Step 1 build report.
// Anchor hrefs (/#about etc.) target sections built directly onto the
// group homepage (apps/web/app/(group)/page.tsx); the leading "/" makes
// them resolve correctly from any other (group) route, not just "/".
// megaPanelColumns is built server-side in (group)/layout.tsx from real
// ProductCategory/Product content (content-loader.ts does node:fs reads
// and can't be imported into this 'use client' component directly).
import { useState } from 'react'
import Link from 'next/link'
import { Header, MobileDrawer, type MegaPanelColumn } from '@vedanta/datum-ui'
import { Logo } from '../Logo'
import { rfqHref } from '../../lib/product-urls'
import { groupExampleJobs } from '../../lib/site-data'

const LINKS = [
  { label: 'About Us', href: '/#about' },
  { label: 'Projects & Clients', href: '/#projects' },
  { label: 'Quality', href: '/#quality' },
]

const CONTACT_LINK = { label: 'Contact', href: '/#contact' }

// Mobile drawer keeps the two accordion groups from megaPanelColumns
// (category-level, matching the desktop panel) plus the same flat links,
// plus the two extra-menu sections (Our Businesses, Careers) as their own
// accordion groups since MobileDrawer has no separate "extra menu" concept.
function drawerGroups(megaPanelColumns: MegaPanelColumn[]) {
  return [
    {
      label: 'Our Businesses',
      items: [
        { label: 'Dhruv EPC Solutions', href: '/dhruv-epc' },
        { label: 'Precise Engineers', href: '/precise-engineers' },
      ],
    },
    ...megaPanelColumns.map((column) => ({
      label: column.companyLabel,
      items: column.categories.map((c) => ({ label: c.name, href: c.href })),
    })),
    {
      label: 'Careers',
      items: [{ label: 'All openings', href: '/#careers' }],
    },
  ]
}

// `open` drives the SSR-safe closed-state baseline (aria-hidden + tabIndex
// on every link) — Header.tsx's `inert` effect only applies post-hydration,
// and this panel's content is caller-owned, so Header can't set it itself
// (see HeaderMenu.panel's doc comment).
function BusinessesPanel({ open }: { open: boolean }) {
  const tabIndex = open ? undefined : -1
  return (
    <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 px-6 py-8 md:grid-cols-3">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs font-medium uppercase tracking-caption text-steel-600">Our Businesses</p>
        <p className="text-sm text-steel-700">
          Two businesses, each with its own works, engineering team, certifications and enquiry desk.
        </p>
        <a
          href="/#businesses"
          tabIndex={tabIndex}
          className="text-data font-medium text-accent-text hover:text-accent-text-hover"
        >
          Compare both businesses →
        </a>
      </div>
      <div className="pt-4" data-company="dhruv">
        <span className="block h-1 w-full bg-brand-500" aria-hidden="true" />
        <a href="/dhruv-epc" tabIndex={tabIndex} className="mt-4 block">
          <Logo company="dhruv-epc" size="secondary" />
        </a>
        <p className="mt-3 text-sm text-steel-600">
          Pressure vessels, heat exchangers, process skids and heavy fabrication. Manjusar GIDC, Vadodara.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
          <a href="/dhruv-epc" tabIndex={tabIndex} className="text-accent-text hover:text-accent-text-hover">
            Products
          </a>
          <a href="/clients-projects" tabIndex={tabIndex} className="text-accent-text hover:text-accent-text-hover">
            Projects
          </a>
          <a href={rfqHref('dhruv')} tabIndex={tabIndex} className="text-accent-text hover:text-accent-text-hover">
            Enquire with DESPL
          </a>
        </div>
      </div>
      <div className="pt-4" data-company="precise">
        <span className="block h-1 w-full bg-flex-500" aria-hidden="true" />
        <a href="/precise-engineers" tabIndex={tabIndex} className="mt-4 block">
          <Logo company="precise-engineers" size="secondary" />
        </a>
        <p className="mt-3 text-sm text-steel-600">
          Expansion joints, bellows, dismantling joints and pipeline components. Vitthal Udyognagar, Anand.
        </p>
        <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium">
          <a
            href="/precise-engineers"
            tabIndex={tabIndex}
            className="text-accent-text hover:text-accent-text-hover"
          >
            Products
          </a>
          <a href="/clients-projects" tabIndex={tabIndex} className="text-accent-text hover:text-accent-text-hover">
            Projects
          </a>
          <a href={rfqHref('precise')} tabIndex={tabIndex} className="text-accent-text hover:text-accent-text-hover">
            Enquire with Precise Engineers
          </a>
        </div>
      </div>
    </div>
  )
}

// Careers menu panel — README "current openings" preview. Job count and
// list stay in sync with groupExampleJobs (site-data.ts); an empty array
// there (real vacancies withdrawn per Decision 6) flips this to the
// "no open positions" copy automatically, no separate flag to remember.
function CareersPanel({ open }: { open: boolean }) {
  const jobs = groupExampleJobs
  const tabIndex = open ? undefined : -1
  return (
    <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2">
      <div className="flex flex-col gap-3">
        <p className="font-mono text-xs font-medium uppercase tracking-caption text-steel-600">Careers</p>
        <p className="text-sm text-steel-700">
          Openings at Dhruv EPC Solutions and Precise Engineers. No suitable role? Send your CV and we will keep it
          on file.
        </p>
        <a
          href="/#careers"
          tabIndex={tabIndex}
          className="text-data font-medium text-accent-text hover:text-accent-text-hover"
        >
          All openings →
        </a>
        <a
          href="/#careers-form"
          tabIndex={tabIndex}
          className="self-start rounded-sm bg-steel-950 px-4 py-3 text-sm font-semibold text-white transition-colors duration-fast hover:bg-steel-700"
        >
          Send your CV
        </a>
      </div>
      <div>
        <div className="flex items-baseline justify-between gap-3 border-b-2 border-steel-950 pb-3">
          <span className="text-body font-bold text-steel-950">Current openings</span>
          <span className="font-mono text-xs text-steel-500">{jobs.length} open positions</span>
        </div>
        {jobs.length > 0 ? (
          jobs.map((job) => (
            <a
              key={job.title}
              href="/#careers-form"
              tabIndex={tabIndex}
              className="flex items-center gap-4 border-b border-steel-100 py-3 transition-colors duration-instant hover:bg-steel-50"
            >
              <span
                className={`h-full w-1 self-stretch ${job.company === 'dhruv' ? 'bg-brand-500' : 'bg-flex-500'}`}
                aria-hidden="true"
              />
              <span className="min-w-0 flex-1">
                <span className="block text-body font-bold text-steel-950">{job.title}</span>
                <span className="mt-1 block text-sm text-steel-600">
                  {job.companyLabel} · {job.location} · {job.experience}
                </span>
              </span>
              <span className="font-mono text-caption text-signal-warn">EXAMPLE</span>
              <span className="text-sm font-bold text-steel-950">Apply →</span>
            </a>
          ))
        ) : (
          <p className="py-4 text-body text-steel-600">
            No open positions right now — send your CV and we will contact you when a role opens.
          </p>
        )}
      </div>
    </div>
  )
}

export function GroupChrome({
  megaPanelColumns,
  phoneHref,
  email,
}: {
  megaPanelColumns: MegaPanelColumn[]
  phoneHref: string
  email: string
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <Header
        logo={(scrolled) => (
          <Logo company="group" size={scrolled ? 'header-scrolled' : 'header'} priority />
        )}
        homeHref="/"
        menuLabel="Products & Solutions"
        megaPanel={megaPanelColumns}
        extraMenus={[
          { id: 'biz', label: 'Our Businesses', panel: (open) => <BusinessesPanel open={open} /> },
          { id: 'car', label: 'Careers', panel: (open) => <CareersPanel open={open} /> },
        ]}
        links={[LINKS[0]!, LINKS[1]!, LINKS[2]!, CONTACT_LINK]}
        utilityBar={[
          { label: 'Dhruv EPC Solutions', href: '/dhruv-epc' },
          { label: 'Precise Engineers', href: '/precise-engineers' },
          { label: phoneHref.replace('tel:', ''), href: phoneHref },
          { label: email, href: `mailto:${email}` },
        ]}
        rfqHref="/request-a-quote"
        onMenuOpen={() => setDrawerOpen(true)}
      />
      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        groups={drawerGroups(megaPanelColumns)}
        links={[...LINKS, CONTACT_LINK]}
        rfqHref="/request-a-quote"
        linkComponent={Link}
      />
    </>
  )
}
