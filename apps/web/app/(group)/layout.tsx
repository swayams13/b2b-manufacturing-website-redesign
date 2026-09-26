// Group holding page — steel-only, no color accent (§5)
// data-company="group" scopes CSS variables to neutral steel values

import Link from 'next/link'
import { Footer, type MegaPanelColumn } from '@vedanta/datum-ui'
import type { CompanySlug } from '@vedanta/schemas'
import { GroupChrome } from '../../components/group/GroupChrome'
import { getEntity, getProductCategoriesByCompany, getProductsByCompany, phoneHref } from '../../lib/content-loader'
import { categoryHref, productHref, productsIndexHref } from '../../lib/product-urls'

const groupEntity = getEntity('group')

// Session 9 (VG-051): the Products mega-panel's two columns, built from
// real ProductCategory + Product content (Session 5) — not a hardcoded
// list. Capped at 4 products per category ("top products", not the full
// catalog) so the panel stays a scan-able entry point, not a full index.
const MEGA_PANEL_PRODUCTS_PER_CATEGORY = 4

function buildMegaPanelColumn(companySlug: CompanySlug, companyLabel: string): MegaPanelColumn {
  const categories = getProductCategoriesByCompany(companySlug)
  const products = getProductsByCompany(companySlug)
  return {
    companyLabel,
    categories: categories.map((category) => ({
      name: category.name,
      href: categoryHref(companySlug, category.slug),
      products: products
        .filter((p) => p.categorySlug === category.slug)
        .slice(0, MEGA_PANEL_PRODUCTS_PER_CATEGORY)
        .map((p) => ({ name: p.name, href: productHref(companySlug, category.slug, p.slug) })),
    })),
    allProductsHref: productsIndexHref(companySlug),
    allProductsLabel: `All ${companyLabel} products →`,
  }
}

const megaPanelColumns: MegaPanelColumn[] = [
  buildMegaPanelColumn('dhruv-epc', 'Dhruv EPC Solutions'),
  buildMegaPanelColumn('precise-engineers', 'Precise Engineers'),
]

const FOOTER_COLUMNS = [
  {
    heading: 'Dhruv EPC Solutions',
    links: [
      { label: 'Pressure Vessels', href: '/dhruv-epc/products/static-equipment/pressure-vessels/' },
      { label: 'Heat Exchangers', href: '/dhruv-epc/products/static-equipment/heat-exchangers/' },
      { label: 'Process Skids', href: '/dhruv-epc/products/skids-packages/process-skids/' },
      { label: 'All Equipment', href: '/dhruv-epc' },
    ],
  },
  {
    heading: 'Precise Engineers',
    links: [
      { label: 'Metallic Bellows', href: '/precise-engineers/products/expansion-joints/metallic-bellows-expansion-joint/' },
      { label: 'Dismantling Joints', href: '/precise-engineers/products/expansion-joints/dismantling-joint/' },
      { label: 'All Products', href: '/precise-engineers' },
    ],
  },
  {
    heading: 'Group',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Contact', href: '/contact' },
      { label: 'Request a Quote', href: '/request-a-quote' },
    ],
  },
]

export default function GroupLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-company="group">
      <GroupChrome
        megaPanelColumns={megaPanelColumns}
        phoneHref={phoneHref(groupEntity)}
        email={groupEntity.emails[0]!}
      />
      {children}
      {/* certificationsHref: stamps link to the group home proof strip —
          carried over from the removed per-page Footers (audit P0-1). */}
      <Footer
        entity={groupEntity}
        columns={FOOTER_COLUMNS}
        certificationsHref="/#proof"
        privacyHref="/privacy"
        termsHref="/terms"
        linkComponent={Link}
      />
    </div>
  )
}
