'use client'
// group-home-v2 §08 Our Journey — a scroll-driven milestone timeline
// (design_handoff_group_home_v2/README.md "Screens / sections" item 10).
// Desktop: a sticky image/year panel tracks whichever milestone row is
// nearest the viewport center (IntersectionObserver, mirroring the
// existing useRfqAnchorInView.ts pattern — no continuous scroll-position
// math, which would be harder to keep correct and accessible for the same
// result). Mobile: the sticky panel is hidden entirely (README: "Mobile:
// timeline only"), rows render inline instead.
//
// Milestones come from lib/site-data.ts's journeyMilestones. Years marked
// "Year TBC" are shown as literal text, not invented — README: "Years
// marked TBC must be confirmed before publishing" is a content gate for
// real launch, not a code problem; this is a prototype demo
// (docs/mistakes.md's dhruvStats "DEMO figure — engineering data pending"
// is the same house convention: show the gap honestly, don't fabricate).

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import type { JourneyMilestone } from '../../lib/site-data'

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

export function JourneyTimeline({ milestones }: { milestones: JourneyMilestone[] }): React.ReactElement {
  const reduced = useReducedMotion()
  const [active, setActive] = useState(0)
  const rowRefs = useRef<Array<HTMLLIElement | null>>([])

  useEffect(() => {
    const rows = rowRefs.current.filter((r): r is HTMLLIElement => r !== null)
    if (rows.length === 0) return
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting)
        if (visible.length === 0) return
        const topMost = visible.reduce((a, b) => (a.boundingClientRect.top < b.boundingClientRect.top ? a : b))
        const index = rows.indexOf(topMost.target as HTMLLIElement)
        if (index !== -1) setActive(index)
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 },
    )
    rows.forEach((r) => observer.observe(r))
    return () => observer.disconnect()
  }, [milestones.length])

  const current = milestones[active]!
  const progressPct = ((active + 1) / milestones.length) * 100

  return (
    // A custom 47/53 grid-template-columns split (matching HeroCarousel's
    // own text/photo ratio) has no token — no arbitrary values allowed
    // (CLAUDE.md). Plain grid-cols-2 is the nearest token-safe stand-in,
    // same call as HeroCarousel's own `md:w-1/2` fix (docs/progress.md
    // Session 40).
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
      {/* Sticky image/year panel — desktop only per README */}
      <div className="hidden lg:block">
        <div className="sticky top-24 flex flex-col gap-6">
          <div className="relative aspect-4/3 overflow-hidden bg-steel-950">
            {current.photo ? (
              <Image
                key={current.title}
                src={current.photo}
                alt={current.title}
                fill
                sizes="50vw"
                className={`object-cover ${reduced ? '' : 'transition-opacity duration-standard ease-standard'}`}
              />
            ) : (
              <div className="flex size-full items-center justify-center p-8 text-center">
                <p className="font-mono text-helper text-steel-400">Archival photo required — {current.title}</p>
              </div>
            )}
          </div>
          <div>
            <p className="font-mono text-h1 font-extrabold leading-none tracking-tight text-steel-950">{current.year}</p>
            <p className="mt-2 text-sm font-bold text-steel-600">{current.business}</p>
          </div>
          <div className="h-1 w-full bg-steel-200" role="presentation">
            <div
              className={`h-full bg-steel-950 ${reduced ? '' : 'transition-all duration-standard ease-standard'}`}
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      <ol className="flex flex-col gap-12 lg:gap-24">
        {milestones.map((m, i) => (
          <li
            key={m.title}
            ref={(el) => {
              rowRefs.current[i] = el
            }}
          >
            <div className="flex items-center gap-3 lg:hidden">
              <span className="font-mono text-h3 font-extrabold text-steel-950">{m.year}</span>
              <span className="text-sm font-bold text-steel-600">{m.business}</span>
            </div>
            {m.photo && (
              <div className="relative mt-4 aspect-video overflow-hidden bg-steel-950 lg:hidden">
                <Image src={m.photo} alt={m.title} fill sizes="100vw" className="object-cover" />
              </div>
            )}
            <h3
              className={`mt-4 font-display text-h3 font-medium transition-opacity duration-instant ease-standard lg:mt-0 ${
                i === active || reduced ? 'text-steel-950 opacity-100' : 'text-steel-950 opacity-40'
              }`}
            >
              {m.title}
            </h3>
            <p className="mt-3 max-w-content text-body text-steel-700">{m.description}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
