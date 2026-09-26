import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Locator, type Page } from '@playwright/test'

// SKILLS-RUNBOOK.md Step 4 — Playwright verification for the group-home-v2
// rebuild (docs/progress.md Sessions 39-46). Covers the runbook's checklist:
// axe, single accent element, heading structure, 320px overflow, keyboard
// reach + focus rings, prefers-reduced-motion, RFQ form validation/failure,
// and per-section screenshots at 390/1440px.
//
// Serial mode + test.slow(): the homepage is by far the most image-heavy
// route in the app (hero carousel, product cards, journey timeline, client
// marquee), and this environment lacks the optional `sharp` package (adding
// it needs its own package.json-change review per CLAUDE.md) — Next.js
// falls back to slower on-demand JS image optimization. Under this file's
// default fullyParallel concurrency, several tests hitting `/` at once
// starved the single `next start` process and blew the 30s test timeout
// (confirmed: the same navigation is fast in isolation, ~2-3s, and only
// degrades under concurrent load — see docs/progress.md Session 46/47).
// Running this file serially with tripled timeouts removes the contention
// instead of masking it with a blanket global timeout bump.
test.describe.configure({ mode: 'serial' })

const DESKTOP_NAV_LABELS = [
  'Products & Solutions',
  'Our Businesses',
  'Careers',
  'About Us',
  'Projects & Clients',
  'Quality',
  'Contact',
  'Request a quote',
]

async function visibleAccentCount(page: Page): Promise<number> {
  // .bg-accent is exclusive to Button variant="rfq" (packages/datum-ui/src/
  // components/Button.tsx — "The Amber Law: variant='rfq' is the ONLY
  // accent-filled element"). Counts only instances actually visible in the
  // current viewport, since Header's own RFQ button toggles `invisible`
  // (not display:none) via useRfqAnchorInView while a content RFQ CTA is on
  // screen, to avoid two accent elements showing at once.
  return page.evaluate(() => {
    const vw = window.innerWidth
    const vh = window.innerHeight
    return [...document.querySelectorAll('.bg-accent')].filter((el) => {
      const cs = getComputedStyle(el)
      if (cs.visibility === 'hidden' || cs.display === 'none' || parseFloat(cs.opacity) < 0.5) return false
      const r = el.getBoundingClientRect()
      return r.width > 0 && r.height > 0 && r.bottom > 0 && r.right > 0 && r.top < vh && r.left < vw
    }).length
  })
}

async function focusedElement(page: Page): Promise<{ id: string; text: string; hasVisibleFocusRing: boolean } | null> {
  return page.evaluate(() => {
    const el = document.activeElement as HTMLElement | null
    if (!el || el === document.body) return null
    const cs = getComputedStyle(el)
    return {
      id: el.id ?? '',
      text: (el.textContent || el.getAttribute('aria-label') || '').trim().slice(0, 60),
      // Datum a11y rule: `outline: 2px solid var(--accent-focus)` on
      // :focus-visible, never suppressed (CLAUDE.md Accessibility section).
      hasVisibleFocusRing: cs.outlineStyle !== 'none' && cs.outlineWidth !== '0px',
    }
  })
}

// main's direct children on the group homepage: HeroCarousel (itself a
// <section>), then 10 `<section aria-labelledby>` blocks (apps/web/app/
// (group)/page.tsx). Scoped to `section` specifically — `main > *` also
// matches a zero-size injected `<script>` Next.js places as main's first
// child, which is never "visible" and hangs scrollIntoViewIfNeeded().
function mainChildren(page: Page) {
  return page.locator('main > section')
}

// ChoiceCard.tsx: a real `sr-only` radio input under a visible <label> tile
// (Datum §14) — visually clipped to 1x1px, so a plain click needs `force`.
// Selecting by role/name also avoids the ambiguity of getByText() matching
// the same product name elsewhere (mega panel, footer).
async function chooseRadio(page: Page, name: string) {
  await page.getByRole('radio', { name }).check({ force: true })
}

// Next.js's own `#__next-route-announcer__` div also carries role="alert"
// (it's always in the DOM for route-change a11y announcements), so a plain
// page.getByRole('alert') is never unique. Scope to the visible message.
function fieldAlert(page: Page, text: string): Locator {
  return page.getByRole('alert').filter({ hasText: text })
}

test.describe('accessibility', () => {
  test('zero serious/critical axe violations on /', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    const seriousOrCritical = results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical')
    expect(seriousOrCritical, JSON.stringify(seriousOrCritical, null, 2)).toEqual([])
  })

  test('exactly one h1, no skipped heading levels', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('h1')).toHaveCount(1)

    const noSkips = await page.evaluate(() => {
      const levels = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => Number(h.tagName[1]))
      if (levels[0] !== 1) return false
      let prev = levels[0]
      for (const level of levels.slice(1)) {
        if (level > prev + 1) return false
        prev = level
      }
      return true
    })
    expect(noSkips).toBe(true)
  })

  test('exactly one accent-filled element in the viewport at any scroll position (desktop)', async ({ page }) => {
    // Header is always-fixed (packages/datum-ui/src/components/Header.tsx),
    // so this holds at every scroll position, not just page load. Scoped to
    // desktop width: below `lg` the header's own RFQ button doesn't render
    // at all (MobileBottomBar takes over instead), a separate code path.
    test.slow()
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    expect(await visibleAccentCount(page)).toBe(1)

    const sections = mainChildren(page)
    const count = await sections.count()
    for (let i = 0; i < count; i++) {
      await sections.nth(i).scrollIntoViewIfNeeded()
      expect(await visibleAccentCount(page), `main child index ${i}`).toBe(1)
    }
  })
})

test('no horizontal scroll at 320px', async ({ page }) => {
  test.slow()
  await page.setViewportSize({ width: 320, height: 800 })
  await page.goto('/')
  await page.waitForLoadState('networkidle')
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
  }))
  expect(overflow.scrollWidth).toBeLessThanOrEqual(overflow.clientWidth)
})

test.describe('keyboard navigation', () => {
  test('reaches every primary nav item with a visible focus ring', async ({ page }) => {
    test.slow()
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const seen = new Set<string>()
    for (let i = 0; i < 40 && seen.size < DESKTOP_NAV_LABELS.length; i++) {
      await page.keyboard.press('Tab')
      const focused = await focusedElement(page)
      if (!focused) continue
      const match = DESKTOP_NAV_LABELS.find((label) => focused.text.includes(label))
      if (match && !seen.has(match)) {
        expect(focused.hasVisibleFocusRing, `"${match}" should show a focus ring`).toBe(true)
        seen.add(match)
      }
    }
    expect([...seen].sort()).toEqual([...DESKTOP_NAV_LABELS].sort())
  })

  test('mega panel link is keyboard reachable with a visible focus ring', async ({ page }) => {
    test.slow()
    await page.setViewportSize({ width: 1280, height: 900 })
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    const trigger = page.getByRole('button', { name: 'Products & Solutions' })
    await trigger.focus()
    await page.keyboard.press('Enter')
    await expect(trigger).toHaveAttribute('aria-expanded', 'true')

    await page.keyboard.press('Tab')
    const focused = await focusedElement(page)
    const isInsidePanel = await page.evaluate(() => {
      const panel = document.getElementById('datum-mega-menu')
      return !!(panel && document.activeElement && panel.contains(document.activeElement))
    })
    expect(isInsidePanel).toBe(true)
    expect(focused?.hasVisibleFocusRing).toBe(true)

    await page.keyboard.press('Escape')
    await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  })

  test('RFQ form fields are keyboard reachable with visible focus rings', async ({ page }) => {
    test.slow()
    await page.goto('/request-a-quote')
    await page.waitForLoadState('networkidle')

    await chooseRadio(page, 'Dhruv EPC — vessels, exchangers, fabrication')

    const expectedIds = ['rfq-design-code', 'rfq-moc', 'rfq-quantity', 'rfq-timeline', 'rfq-message']
    const seen = new Set<string>()
    for (let i = 0; i < 40 && seen.size < expectedIds.length; i++) {
      await page.keyboard.press('Tab')
      const focused = await focusedElement(page)
      if (focused && expectedIds.includes(focused.id)) {
        expect(focused.hasVisibleFocusRing, `#${focused.id} should show a focus ring`).toBe(true)
        seen.add(focused.id)
      }
    }
    expect([...seen].sort()).toEqual([...expectedIds].sort())
  })
})

test.describe('prefers-reduced-motion', () => {
  // This Playwright version (1.62.1) exposes reducedMotion via
  // `contextOptions`, not as a top-level test.use() fixture.
  test.use({ contextOptions: { reducedMotion: 'reduce' } })

  test('page is fully usable with all transitions collapsed', async ({ page }) => {
    test.slow()
    await page.goto('/')
    await page.waitForLoadState('networkidle')

    // Reveal.tsx: under reduced motion the IntersectionObserver is skipped
    // entirely and `shown` is set true on mount — sections below the fold
    // must already be at opacity-100 without any scrolling.
    const belowFoldOpacity = await page.evaluate(() => {
      const el = document.getElementById('businesses')
      return el ? getComputedStyle(el.querySelector(':scope > div') ?? el).opacity : null
    })
    expect(belowFoldOpacity).toBe('1')

    // Mega panel open/close transition collapses to instant. Datum §11's
    // global reset (apps/web/app/globals.css) intentionally sets 0.01ms,
    // not a literal 0s — `transitionend` never fires from 0s, which would
    // break any JS relying on it; 0.01ms is visually instant but still a
    // real transition. Assert "collapsed to negligible", not the exact string.
    const trigger = page.getByRole('button', { name: 'Products & Solutions' })
    await trigger.click()
    const panelDuration = await page.evaluate(() => {
      const panel = document.getElementById('datum-mega-menu')
      return panel ? getComputedStyle(panel).transitionDuration : null
    })
    expect(panelDuration).not.toBeNull()
    expect(parseFloat(panelDuration ?? '1')).toBeLessThan(0.001)
    await page.keyboard.press('Escape')

    // Page remains fully navigable — smoke-check a primary CTA still works.
    await expect(page.getByRole('link', { name: /Explore Our Capabilities/i })).toBeVisible()
  })
})

test.describe('enquiry form', () => {
  test('required-field errors show without submitting', async ({ page }) => {
    test.slow()
    await page.goto('/request-a-quote')
    await page.waitForLoadState('networkidle')

    // Step 1: no company selected yet — the explicit guard in RFQForm.tsx's
    // continueToContact() (audit P0-2, 2026-07-16) must render a message,
    // not dead-click.
    await page.getByRole('button', { name: 'Continue to contact details' }).click()
    await expect(fieldAlert(page, 'Select which company this requirement is for')).toBeVisible()

    // Pick a company, leave equipment type + message empty.
    await chooseRadio(page, 'Dhruv EPC — vessels, exchangers, fabrication')
    await page.getByRole('button', { name: 'Continue to contact details' }).click()
    await expect(fieldAlert(page, 'Select an equipment type')).toBeVisible()
    await expect(page.getByText('Describe your requirement', { exact: true })).toBeVisible()

    // Fill Step 1 validly and advance to Step 2.
    await chooseRadio(page, 'Pressure Vessels')
    await page.locator('#rfq-message').fill('A test requirement long enough to pass validation.')
    await page.getByRole('button', { name: 'Continue to contact details' }).click()
    await expect(page.getByText('Step 2 of 2')).toBeVisible()

    // Step 2: submit empty — every RFQStep2 field should report its error.
    await page.getByRole('button', { name: 'Submit requirement' }).click()
    await expect(page.getByText('Name required', { exact: true })).toBeVisible()
    await expect(page.getByText('Company name required', { exact: true })).toBeVisible()
    await expect(page.getByText('Enter a valid email address', { exact: true })).toBeVisible()
    await expect(page.getByText(/Enter a valid phone number/)).toBeVisible()
  })

  test('API failure shows the "not sent" alert, never a success message', async ({ page }) => {
    test.slow()
    await page.route('**/api/rfq', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Simulated failure for e2e coverage' }),
      }),
    )

    await page.goto('/request-a-quote')
    await page.waitForLoadState('networkidle')
    await chooseRadio(page, 'Dhruv EPC — vessels, exchangers, fabrication')
    await chooseRadio(page, 'Pressure Vessels')
    await page.locator('#rfq-message').fill('A test requirement long enough to pass validation.')
    await page.getByRole('button', { name: 'Continue to contact details' }).click()

    await page.locator('#rfq-name').fill('Test Engineer')
    await page.locator('#rfq-contact-company').fill('Test Co')
    await page.locator('#rfq-email').fill('test@example.com')
    await page.locator('#rfq-phone').fill('+919876543210')
    await page.getByRole('button', { name: 'Submit requirement' }).click()

    const alert = fieldAlert(page, 'Simulated failure for e2e coverage')
    await expect(alert).toBeVisible()

    // Never redirects to the thank-you page on failure — every field stays
    // in place for a retry (RFQForm.tsx comment: "a lost lead is the one
    // unacceptable failure mode").
    await expect(page).toHaveURL(/\/request-a-quote\/?$/)
    await expect(page.getByRole('button', { name: 'Retry submission' })).toBeVisible()

    // The mailto/tel fallback only renders when NEXT_PUBLIC_CONTACT_EMAIL/
    // PHONE are configured — both are still empty in this local/demo build
    // (docs/progress.md Session 38's follow-up-owed env list; a content
    // gate, not a code defect). Assert the link's correctness when present,
    // rather than failing the whole test on an unset placeholder.
    const mailto = alert.locator('a[href^="mailto:"]')
    if ((await mailto.count()) > 0) {
      await expect(mailto.first()).toBeVisible()
    }
  })
})

test.describe('section screenshots', () => {
  for (const width of [390, 1440]) {
    test(`captures every section at ${width}px`, async ({ page }) => {
      test.slow()
      await page.setViewportSize({ width, height: 900 })
      await page.goto('/')
      await page.waitForLoadState('networkidle')

      const sections = mainChildren(page)
      const count = await sections.count()
      for (let i = 0; i < count; i++) {
        const el = sections.nth(i)
        await el.scrollIntoViewIfNeeded()
        const label = (await el.getAttribute('aria-labelledby')) ?? `hero-${i}`
        await el.screenshot({ path: `e2e/__screenshots__/group-home-v2/${label}-${width}.png` })
      }
    })
  }
})
