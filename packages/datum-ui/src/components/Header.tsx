'use client'
// Header — Datum §17, extended §4/§14.3 (Session 9, VG-051).
// Phase 5 (IMPLEMENTATION_NOTES §2.1): main bar is light — always fixed,
// bg-white / border-steel-200 chrome, h-header 91px → h-header-scrolled
// 76px. Scroll threshold 40px (was innerHeight): compresses header after
// minimal scroll. phoneHref / whatsappHref are optional — GroupChrome omits
// them.
//
// utilityBar / megaPanel (Session 9): both optional and additive. When
// megaPanel is set it replaces the legacy menuGroups grid (group nav only —
// DhruvChrome/PreciseChrome keep passing menuGroups, unaffected). The
// utility bar is a second row stacked above the main bar, inside the same
// fixed <header>; its height is reserved by mirroring the exact same
// two-row structure in the spacer div below, so the two heights can never
// drift out of sync — no calc(), no new token.
//
// data-chrome="dark": only the utility strip (bg-steel-900) is still a dark
// surface. The legacy mega-menu grid and MegaPanel went light in Phase 6
// (Decision 3) along with the main bar, so neither carries data-chrome —
// their focus rings use the default accent, same as the rest of the page.
//
// Main-row breakpoint is `lg` (1024px), not `md` (768px) — fixed 2026-09-02
// (docs/mistakes.md). At 768px the logo lockup + nav links + icons + RFQ
// button genuinely don't fit on one row (measured: needs >1200px of content
// width vs. ~720px available); `md:flex` caused the logo to wrap and
// visually collide with the nav trigger. The hamburger/MobileDrawer path
// already handles any width below its breakpoint correctly, so widening its
// range to <1024px (instead of <768px) is the fix, not shrinking content.
// The utility bar (company-switcher strip) stays at `md` — it's short text,
// confirmed not part of this bug.

import { useCallback, useEffect, useRef, useState } from 'react'
import { Button } from './Button'
import { MegaPanel, type MegaPanelColumn } from './MegaPanel'
import { useRfqAnchorInView } from './useRfqAnchorInView'
import { ArrowRight, ChevronDown, Menu, Phone, WhatsApp } from './glyphs'

export interface MegaMenuItem {
  name: string
  /** One-line scope, figures included — §16's rule applies in the menu too */
  scope: string
  href: string
}

export interface MegaMenuGroup {
  label: string
  items: MegaMenuItem[]
}

export interface HeaderNavLink {
  label: string
  href: string
}

// HeaderMenu: additional named dropdown triggers beyond the primary
// menuLabel/megaPanel pair — group homepage v2 (Datum §17) needs "Our
// Businesses" and "Careers" triggers alongside "Products & Solutions"
// (which stays on the existing megaPanel prop, unchanged). Panel content is
// caller-supplied (arbitrary, not column-shaped like MegaPanel), since
// "Our Businesses" and "Careers" aren't per-company product columns.
export interface HeaderMenu {
  id: string
  label: string
  panel: React.ReactNode
}

export interface HeaderProps {
  /** Logo lockup — receives the scrolled/compressed state so the caller can
   *  size it correctly (58px full-height bar / 44px scrolled bar, §2.0). */
  logo: (scrolled: boolean) => React.ReactNode
  homeHref: string
  /** Mega-menu trigger label — "Equipment" (Dhruv) / "Products" (Precise/Group) */
  menuLabel: string
  /** Legacy single-grid mega-menu. Ignored when `megaPanel` is set. */
  menuGroups?: MegaMenuGroup[]
  /** Two-column-by-company mega-panel (group nav, VG-051). Takes priority over menuGroups. */
  megaPanel?: MegaPanelColumn[]
  /** Right rail: deep-link to Capability Matrix. Rendered beside the legacy menuGroups grid only. */
  capabilityRail?: HeaderNavLink
  links: HeaderNavLink[]
  /** Additional named dropdown triggers rendered after the primary menu and
   *  before `links` — group homepage v2 only. Only one menu (primary or
   *  extra) is ever open at a time. */
  extraMenus?: HeaderMenu[]
  /** Company-switcher row above the main bar — group nav only (VG-051). */
  utilityBar?: HeaderNavLink[]
  /** tel: link — optional; GroupChrome omits it */
  phoneHref?: string
  whatsappHref?: string
  rfqHref: string
  /** Opens the MobileDrawer (hamburger, <1024px) */
  onMenuOpen?: () => void
  className?: never
}

export function Header({
  logo,
  homeHref,
  menuLabel,
  menuGroups,
  megaPanel,
  capabilityRail,
  links,
  extraMenus,
  utilityBar,
  phoneHref,
  whatsappHref,
  rfqHref,
  onMenuOpen,
}: HeaderProps): React.ReactElement {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [openExtra, setOpenExtra] = useState<string | null>(null)
  const contentRfqInView = useRfqAnchorInView()
  const headerRef = useRef<HTMLElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const lastTriggerRef = useRef<HTMLElement | null>(null)
  const hasUtilityBar = Boolean(utilityBar && utilityBar.length > 0)
  const hasMegaPanel = Boolean(megaPanel && megaPanel.length > 0)
  // Legacy mega-menu grid must size to what's actually there — DhruvChrome (3 groups
  // + rail) and PreciseChrome (2 groups + rail) share this component, and a fixed
  // grid-cols-4 left Precise's dropdown with a dead trailing column.
  const legacyColumnCount = (menuGroups?.length ?? 0) + (capabilityRail ? 1 : 0)
  const legacyGridColsClass =
    legacyColumnCount <= 2 ? 'grid-cols-2' : legacyColumnCount === 3 ? 'grid-cols-3' : 'grid-cols-4'
  const rowHeight = scrolled ? 'h-header-scrolled' : 'h-header'
  const closeMenu = useCallback(() => setMenuOpen(false), [])

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!menuOpen && openExtra === null) return
    const onKey = (e: KeyboardEvent) => {
      // MegaPanel owns its own ESC handling + focus return when the primary
      // menu (not an extra one) is what's open.
      if (hasMegaPanel && menuOpen) return
      if (e.key === 'Escape') {
        setMenuOpen(false)
        setOpenExtra(null)
        lastTriggerRef.current?.focus()
      }
    }
    const onPointer = (e: PointerEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
        setOpenExtra(null)
      }
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [menuOpen, openExtra, hasMegaPanel])

  return (
    <div className="relative">
      {/* Spacer — mirrors the fixed header's real two-row structure below so
          reserved scroll space always matches, with no calc() and no new
          height token. */}
      {hasUtilityBar && <div className="hidden h-8 md:block" aria-hidden="true" />}
      <div className={rowHeight} aria-hidden="true" />

      <header
        ref={headerRef}
        className={`fixed inset-x-0 top-0 z-40 bg-white border-b border-steel-200 ${scrolled ? 'shadow-raised' : ''}`}
      >
        {hasUtilityBar && (
          // data-chrome='dark': rebinds --accent-focus to the -dark accent step so
          // focus rings clear 3:1 on this dark strip (globals.css §25, v1.2).
          <div data-chrome="dark" className="hidden border-b border-steel-50/10 bg-steel-900 md:block">
            <div className="mx-auto flex h-8 max-w-wide items-center justify-end gap-6 px-6 text-helper text-white/66">
              {utilityBar!.map((u) => (
                <a
                  key={u.href}
                  href={u.href}
                  className="transition-colors duration-instant ease-standard hover:text-white"
                >
                  {u.label}
                </a>
              ))}
            </div>
          </div>
        )}

        <div className={`mx-auto flex ${rowHeight} max-w-wide items-center justify-between gap-6 px-6`}>
          <a href={homeHref} className="flex items-center">
            {logo(scrolled)}
          </a>

          <nav aria-label="Primary" className="hidden h-full items-center gap-8 lg:flex">
            <button
              ref={triggerRef}
              type="button"
              aria-expanded={menuOpen}
              aria-controls="datum-mega-menu"
              onClick={() => {
                lastTriggerRef.current = triggerRef.current
                setOpenExtra(null)
                setMenuOpen((v) => !v)
              }}
              className="flex h-full items-center gap-1 text-body font-semibold text-steel-500 transition-colors duration-instant ease-standard hover:text-steel-950"
            >
              {menuLabel}
              <span
                className={`text-accent transition-transform duration-instant ease-standard ${menuOpen ? 'rotate-180' : ''}`}
              >
                <ChevronDown size={16} />
              </span>
            </button>
            {extraMenus?.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-expanded={openExtra === m.id}
                aria-controls={`datum-mega-menu-${m.id}`}
                onClick={(e) => {
                  lastTriggerRef.current = e.currentTarget
                  setMenuOpen(false)
                  setOpenExtra((v) => (v === m.id ? null : m.id))
                }}
                className="flex h-full items-center gap-1 text-body font-semibold text-steel-500 transition-colors duration-instant ease-standard hover:text-steel-950"
              >
                {m.label}
                <span
                  className={`text-accent transition-transform duration-instant ease-standard ${openExtra === m.id ? 'rotate-180' : ''}`}
                >
                  <ChevronDown size={16} />
                </span>
              </button>
            ))}
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="flex h-full items-center text-body font-semibold text-steel-500 transition-colors duration-instant ease-standard hover:text-steel-950"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-2 lg:flex">
            {whatsappHref && (
              <a
                href={whatsappHref}
                aria-label="Chat on WhatsApp"
                className="flex h-compact w-compact items-center justify-center rounded-sm text-steel-500 transition-colors duration-instant hover:bg-steel-100 hover:text-steel-950"
              >
                <WhatsApp size={20} />
              </a>
            )}
            {phoneHref && (
              <a
                href={phoneHref}
                aria-label="Call us"
                className="flex h-compact w-compact items-center justify-center rounded-sm text-steel-500 transition-colors duration-instant hover:bg-steel-100 hover:text-steel-950"
              >
                <Phone size={20} />
              </a>
            )}
            <span className={contentRfqInView ? 'invisible' : undefined}>
              <Button variant="rfq" size={scrolled ? 'compact' : 'default'} href={rfqHref}>
                Request a quote
              </Button>
            </span>
          </div>

          <button
            type="button"
            aria-label="Open menu"
            onClick={onMenuOpen}
            className="flex h-compact w-compact items-center justify-center rounded-sm text-steel-950 lg:hidden"
          >
            <Menu />
          </button>
        </div>

        {hasMegaPanel ? (
          <MegaPanel
            id="datum-mega-menu"
            open={menuOpen}
            onClose={closeMenu}
            triggerRef={triggerRef}
            columns={megaPanel!}
          />
        ) : (
          <div
            id="datum-mega-menu"
            hidden={!menuOpen}
            className="absolute inset-x-0 top-full border-t border-steel-200 bg-white shadow-overlay"
          >
            <div className={`mx-auto grid max-w-wide ${legacyGridColsClass} gap-8 px-6 py-8`}>
              {(menuGroups ?? []).map((group) => (
                <div key={group.label}>
                  <p className="font-mono text-xs font-medium uppercase tracking-caption text-accent">
                    {group.label}
                  </p>
                  <ul className="mt-3">
                    {group.items.map((item) => (
                      <li key={item.href}>
                        <a
                          href={item.href}
                          className="-mx-2 block rounded-sm px-2 py-2 transition-colors duration-instant hover:bg-steel-100"
                        >
                          <span className="block text-data font-medium text-steel-950">
                            {item.name}
                          </span>
                          <span className="block text-helper text-steel-500">{item.scope}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              {/* capability rail — "can you build mine?" is the question behind every menu open */}
              {capabilityRail && (
                <div className="border-l border-steel-200 pl-8">
                  <a
                    href={capabilityRail.href}
                    className="group flex items-center gap-2 text-data font-medium text-accent-text transition-colors duration-instant hover:text-accent-text-hover"
                  >
                    {capabilityRail.label}
                    <span className="transition-transform duration-instant ease-standard motion-safe:group-hover:translate-x-1">
                      <ArrowRight size={16} />
                    </span>
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {extraMenus?.map((m) => (
          <div
            key={m.id}
            id={`datum-mega-menu-${m.id}`}
            hidden={openExtra !== m.id}
            className="absolute inset-x-0 top-full border-t border-steel-200 bg-white shadow-overlay"
          >
            {m.panel}
          </div>
        ))}
      </header>
    </div>
  )
}
