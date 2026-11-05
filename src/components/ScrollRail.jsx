'use client'

import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

/* Horizontal carousel built on native scrolling, so touch swipes, trackpads and
   the mouse wheel always work. Adds mouse-drag, arrow buttons and a draggable
   progress line on top. */
export function useScrollRail() {
  const rail = useRef(null)
  const [state, setState] = useState({ thumb: 1, pos: 0, atStart: true, atEnd: false })

  const update = useCallback(() => {
    const el = rail.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setState({
      thumb: el.clientWidth / el.scrollWidth,
      pos: max > 0 ? el.scrollLeft / max : 0,
      atStart: el.scrollLeft <= 2,
      atEnd: el.scrollLeft >= max - 2,
    })
  }, [])

  useEffect(() => {
    const el = rail.current
    update()
    el.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      el.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [update])

  const step = (dir) => {
    const el = rail.current
    const card = el.firstElementChild
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    el.scrollBy({ left: dir * ((card?.offsetWidth || el.clientWidth) + gap), behavior: 'smooth' })
  }

  return { rail, state, prev: () => step(-1), next: () => step(1) }
}

export function RailArrows({ prev, next, state }) {
  return (
    <div className="flex gap-3">
      <button onClick={prev} disabled={state.atStart} className="nav-circle" aria-label="Previous"><ArrowLeft size={18} /></button>
      <button onClick={next} disabled={state.atEnd} className="nav-circle" aria-label="Next"><ArrowRight size={18} /></button>
    </div>
  )
}

export function Rail({ rail, children, className = '' }) {
  const drag = useRef(null)

  // Mouse drag-to-scroll (touch already scrolls natively)
  const onPointerDown = (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return
    drag.current = { x: e.clientX, left: rail.current.scrollLeft, moved: false }
    rail.current.style.scrollSnapType = 'none'
  }
  const onPointerMove = (e) => {
    const d = drag.current
    if (!d) return
    const dx = e.clientX - d.x
    if (Math.abs(dx) > 4) d.moved = true
    rail.current.scrollLeft = d.left - dx
  }
  const endDrag = () => {
    if (!drag.current) return
    const el = rail.current
    const left = el.scrollLeft
    el.style.scrollSnapType = ''
    // Re-applying snap jumps instantly; restore position and glide to the nearest card
    el.scrollLeft = left
    const card = el.firstElementChild
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0
    const w = (card?.offsetWidth || 1) + gap
    el.scrollTo({ left: Math.round(left / w) * w, behavior: 'smooth' })
    setTimeout(() => { drag.current = null }, 0)
  }

  return (
    <div
      ref={rail}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onClickCapture={(e) => drag.current?.moved && e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      className={`flex snap-x snap-proximity gap-6 overflow-x-auto overscroll-x-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden cursor-grab active:cursor-grabbing select-none ${className}`}
    >
      {children}
    </div>
  )
}

export function RailBar({ rail, state }) {
  const track = useRef(null)
  const dragging = useRef(false)

  const seek = (clientX) => {
    const t = track.current.getBoundingClientRect()
    const el = rail.current
    const thumbPx = t.width * state.thumb
    const ratio = Math.min(1, Math.max(0, (clientX - t.left - thumbPx / 2) / (t.width - thumbPx)))
    el.style.scrollSnapType = 'none'
    el.scrollLeft = ratio * (el.scrollWidth - el.clientWidth)
  }

  if (state.thumb >= 0.999) return null
  return (
    <div
      ref={track}
      className="relative mt-10 h-1 cursor-pointer touch-none rounded bg-sand before:absolute before:inset-x-0 before:-inset-y-4 before:content-['']"
      onPointerDown={(e) => { dragging.current = true; e.currentTarget.setPointerCapture(e.pointerId); seek(e.clientX) }}
      onPointerMove={(e) => dragging.current && seek(e.clientX)}
      onPointerUp={() => { dragging.current = false; rail.current.style.scrollSnapType = '' }}
    >
      <div
        className="absolute inset-y-0 rounded bg-terra"
        style={{ width: `${state.thumb * 100}%`, left: `${state.pos * (1 - state.thumb) * 100}%` }}
      />
    </div>
  )
}
