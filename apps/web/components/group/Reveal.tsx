'use client'
// Scroll reveal — design_handoff_group_home_v2/README.md: "sections fade in
// and move up ... the first time they enter the viewport (IntersectionObserver,
// runs once)." Distance/duration/easing per Datum §11's scroll-reveal clause
// (12px, motion-standard, ease-enter) rather than the prototype's literal
// values (README line 19: clamp prototype durations to the token set).
// prefers-reduced-motion: content renders already-visible, no observer.

import { useEffect, useRef, useState } from 'react'

export function Reveal({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}): React.ReactElement {
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setShown(true)
      return
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      // Drop the translate utility once shown (rather than settling on
      // `translate-y-0`) so the element returns to `transform: none` at
      // rest — a resting non-none transform value creates a new containing
      // block, which breaks `position: sticky` descendants (Our Journey's
      // sticky image panel).
      className={`transition-all duration-standard ease-enter ${
        shown ? 'opacity-100' : 'translate-y-3 opacity-0'
      } ${className ?? ''}`}
    >
      {children}
    </div>
  )
}
