'use client'
// Group homepage v2 hero — a 4-slide auto-rotating carousel, an approved
// override of Datum §17/§19's carousel ban (docs/decisions.md, 2026-09-26
// "Group homepage v2 hero: rotating carousel + motion-budget override").
// The cross-fade (1400ms) and Ken Burns zoom (9000ms) durations are part of
// that same override — inline style, not a Tailwind class, since neither
// value is a §26 token (the override is scoped to this component only, not
// a new token addition). Everything else on this page still uses the
// motion token set.
//
// prefers-reduced-motion is NOT part of the override: it still collapses
// this hero to a single static frame, no rotation, no zoom — first-class,
// per Datum §11.

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Button } from '@vedanta/datum-ui'

interface Slide {
  id: string
  kicker: string
  headline: string[]
  subhead: string
  cta1: { label: string; href: string }
  cta2?: { label: string; href: string }
  image: { src: string; alt: string }
  imagePosition: string
  imageFit: 'cover' | 'contain'
  /** Dhruv's product photo is shot on a light studio ground, multiply-blended */
  imageBg: string
  blend: 'normal' | 'multiply'
  overlay: 'dark' | 'light'
}

const SLIDES: Slide[] = [
  {
    id: 'group',
    kicker: 'Vedanta Group of Companies',
    headline: ['Engineering Excellence.', 'Built Over 30+ Years.'],
    subhead:
      'Three decades of engineering expertise, manufacturing capability and trusted partnerships — delivering solutions for industries that power progress.',
    cta1: { label: 'Explore Our Capabilities →', href: '/#products' },
    cta2: { label: 'Discuss Your Project', href: '/#contact' },
    image: { src: '/photography/precise-engineers/pe-pressure-balance.jpg', alt: 'Pressure-balanced expansion joint in the Precise Engineers works' },
    imagePosition: '62% 58%',
    imageFit: 'cover',
    imageBg: 'bg-steel-900',
    blend: 'normal',
    overlay: 'dark',
  },
  {
    id: 'dhruv',
    kicker: 'Dhruv EPC Solutions · Vadodara',
    headline: ['Engineered for Complex Industrial Applications.'],
    subhead:
      'Pressure vessels, heat exchangers, process skids and heavy fabrication from the Manjusar works — to ASME, IBR and TEMA.',
    cta1: { label: 'Explore DESPL →', href: '/dhruv-epc' },
    cta2: { label: 'Enquire with DESPL', href: '/#contact' },
    image: { src: '/photography/dhruv-epc/despl-cgd-skid.jpg', alt: 'City Gas Distribution skid fabricated by Dhruv EPC Solutions for Emerson' },
    imagePosition: '100% 45%',
    imageFit: 'contain',
    imageBg: 'bg-steel-100',
    blend: 'multiply',
    overlay: 'light',
  },
  {
    id: 'precise',
    kicker: 'Precise Engineers · Anand',
    headline: ['Precision-Engineered Solutions for Critical Pipeline Systems.'],
    subhead:
      'Metallic, rubber and fabric expansion joints, dismantling joints and pipeline components, designed to EJMA and built in our own works.',
    cta1: { label: 'Explore Precise Engineers →', href: '/precise-engineers' },
    cta2: { label: 'Enquire with Precise Engineers', href: '/#contact' },
    image: { src: '/photography/precise-engineers/pe-gimbal-ej.jpg', alt: 'Gimbal expansion joint in the Precise Engineers assembly bay' },
    imagePosition: '70% 55%',
    imageFit: 'cover',
    imageBg: 'bg-steel-900',
    blend: 'normal',
    overlay: 'dark',
  },
  {
    id: 'journey',
    kicker: 'Since 1994',
    headline: ['Three decades on the shop floor.'],
    subhead:
      'From a single works in Anand to two specialised businesses serving refiners, utilities, steel producers and EPC contractors in India and abroad.',
    cta1: { label: 'Our 30-year journey →', href: '/#heritage' },
    image: { src: '/photography/precise-engineers/pe-shopfloor-team.jpg', alt: 'Precise Engineers team with expansion joints staged for inspection' },
    imagePosition: '40% 50%',
    imageFit: 'cover',
    imageBg: 'bg-steel-900',
    blend: 'normal',
    overlay: 'dark',
  },
]

const ROTATE_MS = 7000
const CROSSFADE_MS = 1400
const KEN_BURNS_MS = 9000

// Pause/Play — Datum §12 glyph construction (24×24 grid, 1.5px stroke),
// not added to the shared glyph set: a one-off control for this component's
// own WCAG 2.2.2 pause mechanism.
function PauseGlyph() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  )
}

function PlayGlyph() {
  return (
    <svg aria-hidden="true" width={16} height={16} viewBox="0 0 24 24" fill="currentColor">
      <path d="M6 4l14 8-14 8V4z" />
    </svg>
  )
}

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const onChange = () => setReduced(mq.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  return reduced
}

// The "30+" stat count-up stays within the existing motion-signature token
// (700ms) — only the carousel's own cross-fade/zoom got a logged exception.
function useCountUp(to: number, play: boolean, reduced: boolean): number {
  const [value, setValue] = useState(reduced ? to : 0)
  useEffect(() => {
    if (!play) return
    if (reduced) {
      setValue(to)
      return
    }
    let raf = 0
    const t0 = performance.now()
    const dur = 700
    const tick = (t: number) => {
      const p = Math.min((t - t0) / dur, 1)
      setValue(Math.round(to * (1 - Math.pow(1 - p, 3))))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [play, reduced, to])
  return value
}

export function HeroCarousel() {
  const reduced = useReducedMotion()
  const [slide, setSlide] = useState(0)
  // WCAG 2.2.2 Pause, Stop, Hide — this auto-rotates indefinitely and isn't
  // essential content, so a pause control is required, not optional polish.
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const yearsCount = useCountUp(30, true, reduced)

  useEffect(() => {
    if (reduced || paused) return
    timerRef.current = setTimeout(() => setSlide((s) => (s + 1) % SLIDES.length), ROTATE_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [slide, reduced, paused])

  function pick(i: number) {
    setSlide(i)
  }

  const active = SLIDES[slide]!

  return (
    <section
      aria-roledescription={reduced ? undefined : 'carousel'}
      aria-label="Vedanta Group highlights"
      className="relative flex flex-col overflow-hidden bg-steel-900"
      style={{ height: 'clamp(640px, calc(100vh - 122px), 920px)' }}
    >
      {SLIDES.map((s, i) => {
        const isActive = i === slide
        // Reduced motion: render only the first slide, statically, no cross-fade/zoom.
        if (reduced && i !== 0) return null
        return (
          <div
            key={s.id}
            aria-hidden={!isActive}
            className={`absolute inset-0 ${s.imageBg}`}
            style={reduced ? undefined : { opacity: isActive ? 1 : 0, transitionProperty: 'opacity', transitionDuration: `${CROSSFADE_MS}ms` }}
          >
            <Image
              src={s.image.src}
              alt={s.image.alt}
              fill
              sizes="100vw"
              priority={i === 0}
              style={{
                objectFit: s.imageFit,
                objectPosition: s.imagePosition,
                mixBlendMode: s.blend,
                transform: !reduced && isActive ? 'scale(1)' : 'scale(1.08)',
                transitionProperty: reduced ? undefined : 'transform',
                transitionDuration: reduced ? undefined : `${KEN_BURNS_MS}ms`,
              }}
            />
            <div
              className={`absolute inset-0 ${s.overlay === 'dark' ? 'bg-gradient-to-t from-steel-950/90 via-steel-950/40 to-transparent' : ''}`}
              aria-hidden="true"
            />
          </div>
        )
      })}

      <div className="relative mx-auto flex w-full max-w-wide flex-1 flex-col justify-end px-6 pb-8 pt-24">
        {/* No ~600px maxWidth token exists (packages/tokens/src/tailwind.ts
            only defines content/1200 · wide/1360 · 2xl/1440 — adding one is
            a §26 design-review event, not a component commit). `md:w-1/2`
            reuses Tailwind's core fraction scale instead, echoing HomeHero's
            own 47/53 split, to cap the reading measure without an
            arbitrary value. */}
        <div className="w-full md:w-1/2">
          <p className="mb-6 flex items-center gap-3 text-caption font-bold uppercase tracking-caption text-steel-100">
            <span className="h-px w-6 bg-current" aria-hidden="true" />
            {active.kicker}
          </p>
          <h1 className="text-display-xl font-medium leading-none tracking-tight text-white">
            {active.headline.map((line) => (
              <span key={line} className="block">
                {line}
              </span>
            ))}
          </h1>
          <p className="mt-6 text-body-lg text-steel-100">{active.subhead}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button variant={active.id === 'group' ? 'primary' : 'secondary'} onDark href={active.cta1.href}>
              {active.cta1.label}
            </Button>
            {active.cta2 && (
              <Button variant="link" onDark href={active.cta2.href}>
                {active.cta2.label}
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="relative border-t border-steel-800 bg-steel-950/90 text-white">
        <div className="mx-auto flex max-w-wide flex-wrap items-stretch px-6">
          <div className="flex flex-none items-center gap-4 border-r border-steel-800 py-4 pr-8">
            <div
              aria-hidden="true"
              className="font-mono text-h1 font-extrabold leading-none tracking-tight"
            >
              {yearsCount}
              <span className="text-steel-400">+</span>
            </div>
            <div className="text-sm font-bold leading-tight">
              Years of Engineering
              <br />
              Experience <span className="font-mono font-normal text-steel-400">· since 1994</span>
            </div>
            <span className="sr-only">30+ years of engineering experience, since 1994</span>
            {!reduced && (
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Play automatic slide rotation' : 'Pause automatic slide rotation'}
                className="ml-2 flex size-8 flex-none items-center justify-center rounded-sm border border-steel-800 text-steel-400 transition-colors duration-instant ease-standard hover:text-white"
              >
                {paused ? <PlayGlyph /> : <PauseGlyph />}
              </button>
            )}
          </div>
          <div className="grid flex-1 grid-cols-2 sm:grid-cols-4">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                onClick={() => pick(i)}
                aria-current={i === slide}
                aria-label={`Show slide ${i + 1}: ${s.kicker}`}
                className={`relative flex flex-col gap-1 border-r border-steel-800 p-4 text-left transition-colors duration-instant ease-standard last:border-r-0 ${
                  i === slide ? 'text-white' : 'text-steel-400'
                } hover:text-white`}
              >
                <span
                  className="absolute inset-x-0 top-0 h-px origin-left bg-white/10"
                  aria-hidden="true"
                >
                  {i === slide && !reduced && !paused && (
                    <span
                      key={slide}
                      className="block h-full origin-left bg-white"
                      style={{ animation: `vg-hero-fill ${ROTATE_MS}ms linear forwards` }}
                    />
                  )}
                </span>
                <span className="font-mono text-xs">{String(i + 1).padStart(2, '0')}</span>
                <span className="text-sm font-bold leading-tight">{s.kicker.split(' · ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <style>{'@keyframes vg-hero-fill { from { transform: scaleX(0) } to { transform: scaleX(1) } }'}</style>
    </section>
  )
}
