'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Minus, Plus } from 'lucide-react'
import { useState } from 'react'

const pad = (n) => String(n).padStart(2, '0')

/* Accordion used by the FAQ page — same numbered rows, plus/minus toggle
   and height animation as the FAQ section on the homepage. */
export default function FaqList({ questions }) {
  const [open, setOpen] = useState(-1)

  return (
    <div className="divide-y divide-sand border-y border-sand">
      {questions.map((item, i) => {
        const isOpen = open === i
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(isOpen ? -1 : i)}
              aria-expanded={isOpen}
              className="flex w-full cursor-pointer items-center gap-5 py-5 text-left"
            >
              <span className={`font-heading text-sm transition-colors ${isOpen ? 'text-terra' : 'text-muted'}`}>{pad(i + 1)}</span>
              <span className="flex-1 font-heading text-[17px] font-medium md:text-[19px]">{item.q}</span>
              <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-full border transition-all duration-300 ${isOpen ? 'rotate-180 border-terra bg-terra text-white' : 'border-sand'}`}>
                {isOpen ? <Minus size={16} /> : <Plus size={16} />}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.35 }} className="overflow-hidden">
                  <p className="pb-6 pl-10 pr-4 text-muted md:pr-14">{item.a}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
