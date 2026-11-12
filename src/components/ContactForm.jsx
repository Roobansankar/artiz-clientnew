'use client'

import { ChevronDown, Send } from 'lucide-react'
import { toast } from 'sonner'
import { useState } from 'react'

const topics = ['Product question', 'Order and delivery', 'Returns and care', 'Design advice', 'Something else']

const field = 'h-12 w-full rounded-lg border border-sand bg-white px-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-terra focus:ring-2 focus:ring-terra/10'

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
      setStatus({ state: 'idle', message: '' })
      toast.success(payload.message || 'Thank you! Your message has been received.', { description: 'We’ll be in touch shortly.' })
    } catch (error) {
      const message = error?.name === 'TimeoutError'
        ? 'The request took too long. Please try again in a moment.'
        : error?.message || 'We could not send your message. Please try again shortly.'
      setStatus({ state: 'idle', message: '' })
      toast.error(message)
    }
  }

  const sending = status.state === 'sending'

  return (
    <div>
      <span className="text-xs font-medium uppercase tracking-[0.16em] text-terra">Send a message</span>
      <h2 className="mt-3 font-heading text-[28px] font-semibold leading-tight md:text-[34px]">What can we help you with?</h2>
      <p className="mt-3 text-sm leading-relaxed text-muted">Leave your details below. We will confirm on WhatsApp and get back to you shortly.</p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
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
          <label htmlFor="contact-phone" className="mb-2 block text-sm font-medium">WhatsApp number</label>
          <input id="contact-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel" required maxLength={20} minLength={10} placeholder="98765 43210" className={field} />
          <p className="mt-1.5 text-xs text-muted">We&rsquo;ll send a confirmation to this number on WhatsApp.</p>
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
          <textarea id="contact-message" name="message" required minLength={10} maxLength={5000} rows={6} placeholder="Tell us a little more (10 characters or more)…" className="min-h-[150px] w-full rounded-lg border border-sand bg-white px-4 py-4 text-[15px] text-ink outline-none transition-colors placeholder:text-muted/70 focus:border-terra" />
        </div>

        <button type="submit" disabled={sending} className="btn-dark w-full sm:w-auto disabled:cursor-not-allowed disabled:opacity-60">
          {sending ? 'Sending…' : 'Send message'} <Send size={16} aria-hidden="true" />
        </button>
        <p className="text-xs text-muted">Your details will only be used to respond to your enquiry.</p>
      </form>
    </div>
  )
}
