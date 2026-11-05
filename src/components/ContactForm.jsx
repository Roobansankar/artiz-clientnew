'use client'

import { Check, ChevronDown, Send } from 'lucide-react'
import { useState } from 'react'

const topics = ['Product question', 'Order and delivery', 'Returns and care', 'Design advice', 'Something else']

const field = 'h-12 w-full rounded-full border border-sand bg-white px-5 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-terra'

export default function ContactForm() {
  const [status, setStatus] = useState({ state: 'idle', message: '' })

  async function onSubmit(event) {
    event.preventDefault()
    const form = event.currentTarget
    setStatus({ state: 'sending', message: '' })
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
        signal: AbortSignal.timeout(15000),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.message || 'We could not send your message. Please try again shortly.')
      form.reset()
      setStatus({ state: 'success', message: payload.message || 'Thank you! Your message has been received.' })
    } catch (error) {
      const message = error?.name === 'TimeoutError'
        ? 'The request took too long. Please try again in a moment.'
        : error?.message || 'We could not send your message. Please try again shortly.'
      setStatus({ state: 'error', message })
    }
  }

  const sending = status.state === 'sending'

  return (
    <div className="rounded-3xl border border-sand bg-white p-6 md:p-9">
      <span className="subtitle">Send us a message</span>
      <h2 className="h2-title text-[26px] md:text-[32px]">Tell us what’s on your mind.</h2>
      <p className="mt-3 text-muted">A question about a piece, an order, or an idea for a room — we’re happy to help.</p>

      {status.state === 'success' && (
        <p role="status" className="mt-6 flex items-start gap-3 rounded-2xl bg-peach px-5 py-4 text-[15px] text-ink">
          <Check size={18} className="mt-0.5 shrink-0 text-terra" aria-hidden="true" />
          {status.message}
        </p>
      )}
      {status.state === 'error' && (
        <p role="alert" className="mt-6 rounded-2xl border border-terra/40 bg-peach px-5 py-4 text-[15px] text-ink">
          {status.message}
        </p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="contact-name" className="mb-2 block text-sm font-medium">Your name</label>
            <input id="contact-name" name="name" type="text" required minLength={2} maxLength={120} placeholder="Jane Doe" className={field} />
          </div>
          <div>
            <label htmlFor="contact-email" className="mb-2 block text-sm font-medium">Email address</label>
            <input id="contact-email" name="email" type="email" required maxLength={254} placeholder="jane@example.com" className={field} />
          </div>
        </div>

        <div>
          <label htmlFor="contact-topic" className="mb-2 block text-sm font-medium">What can we help with?</label>
          <div className="relative">
            <select id="contact-topic" name="topic" required defaultValue="" className={`${field} cursor-pointer appearance-none pr-12`}>
              <option value="" disabled>Select a topic</option>
              {topics.map((topic) => <option key={topic} value={topic}>{topic}</option>)}
            </select>
            <ChevronDown size={16} aria-hidden="true" className="pointer-events-none absolute right-5 top-1/2 -translate-y-1/2 text-muted" />
          </div>
        </div>

        <div>
          <label htmlFor="contact-message" className="mb-2 block text-sm font-medium">Message</label>
          <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Tell us a little more (10 characters or more)…" className="min-h-[150px] w-full rounded-2xl border border-sand bg-white px-5 py-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-terra" />
        </div>

        <button type="submit" disabled={sending} className="btn-dark w-full disabled:cursor-not-allowed disabled:opacity-60">
          {sending ? 'Sending…' : 'Send message'} <Send size={16} aria-hidden="true" />
        </button>
        <p className="text-xs text-muted">We usually reply within one business day.</p>
      </form>
    </div>
  )
}
