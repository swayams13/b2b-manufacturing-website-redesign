'use client'
// MegaPanel — Datum §14.3 (Session 9, VG-051). Products mega-panel: two
// columns by company, ProductCategory as heading, top products beneath,
// "All products →" foot link per column. Group-nav only — Dhruv/Precise
// keep Header's legacy single-company menuGroups grid (§4 scopes the
// two-column layout to the group's "which company makes it" disambiguation
// step; a single-company subsite has nothing to disambiguate).
//
// Not a modal (no aria-modal/role="dialog") — a disclosure panel over
// in-flow nav content. It does trap Tab while open (unlike a typical APG
// disclosure), matching this plan's explicit focus-trap requirement — see
// MegaPanel.test.tsx for the keyboard contract. Focus trap mirrors
// MobileDrawer.tsx's proven pattern: focus the first link on open, Tab
// cycles within the panel, ESC closes and returns focus to the trigger.

import { useEffect, useRef } from 'react'
import { ArrowRight } from './glyphs'

export interface MegaPanelProduct {
  name: string
  href: string
}

export interface MegaPanelCategory {
  name: string
  href: string
  products: MegaPanelProduct[]
}

export interface MegaPanelColumn {
  /** "Dhruv EPC Solutions" / "Precise Engineers" */
  companyLabel: string
  categories: MegaPanelCategory[]
  allProductsHref: string
  allProductsLabel: string
}

export interface MegaPanelProps {
  id: string
  open: boolean
  onClose: () => void
  triggerRef: React.RefObject<HTMLElement>
  columns: MegaPanelColumn[]
  className?: never
}

export function MegaPanel({
  id,
  open,
  onClose,
  triggerRef,
  columns,
}: MegaPanelProps): React.ReactElement {
  const panelRef = useRef<HTMLDivElement>(null)

  // React 18 can't set the `inert` IDL property via JSX (it strips unknown
  // boolean attributes) — set it directly on the node. Keeps the closed
  // panel out of the tab order and the a11y tree while still letting it
  // animate (unlike the old `hidden` attribute, which can't transition).
  useEffect(() => {
    if (panelRef.current) panelRef.current.inert = !open
  }, [open])

  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    panel?.querySelector<HTMLElement>('a[href]')?.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
        triggerRef.current?.focus()
        return
      }
      if (e.key !== 'Tab' || !panel) return
      const focusable = panel.querySelectorAll<HTMLElement>('a[href]')
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last?.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first?.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose, triggerRef])

  return (
    <div
      id={id}
      ref={panelRef}
      className={`absolute inset-x-0 top-full border-t border-steel-200 bg-white shadow-overlay transition-all duration-standard motion-reduce:transition-none ${
        open ? 'ease-enter opacity-100 translate-y-0' : 'pointer-events-none ease-exit opacity-0 -translate-y-3'
      }`}
    >
      <div className="mx-auto grid max-w-wide grid-cols-1 gap-8 px-6 py-8 md:grid-cols-2">
        {columns.map((column) => (
          <div key={column.companyLabel}>
            <p className="font-mono text-xs font-medium uppercase tracking-caption text-steel-600">
              {column.companyLabel}
            </p>
            <div className="mt-4 grid grid-cols-1 gap-6 sm:grid-cols-2">
              {column.categories.map((category) => (
                <div key={category.href}>
                  <a
                    href={category.href}
                    className="-mx-2 block rounded-sm px-2 py-1 text-data font-medium text-steel-950 transition-colors duration-instant ease-standard hover:bg-steel-100"
                  >
                    {category.name}
                  </a>
                  <ul className="mt-1">
                    {category.products.map((product) => (
                      <li key={product.href}>
                        <a
                          href={product.href}
                          className="-mx-2 block rounded-sm px-2 py-1.5 text-sm text-steel-600 transition-colors duration-instant ease-standard hover:bg-steel-100 hover:text-steel-950"
                        >
                          {product.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <a
              href={column.allProductsHref}
              className="group mt-6 flex items-center gap-2 text-data font-medium text-accent-text transition-colors duration-instant ease-standard hover:text-accent-text-hover"
            >
              {column.allProductsLabel}
              <span className="transition-transform duration-instant ease-standard motion-safe:group-hover:translate-x-1">
                <ArrowRight size={16} />
              </span>
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
