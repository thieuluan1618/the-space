'use client'

import { useState } from 'react'
import type { SubscriptionStatus } from '../../lib/types'

export default function EmailSignupForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<SubscriptionStatus>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok && data.success) {
        setStatus('success')
        setMessage(data.message || 'You are now on the list.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.message || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Something went wrong. Please try again.')
    }
  }

  return (
    <div className="mt-8 text-left">
      <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 mb-3">
        Collection Updates
      </p>
      <p className="text-sm font-light text-on-surface-variant mb-4" style={{ letterSpacing: '-0.14px' }}>
        Be notified when new seasons arrive.
      </p>

      {status === 'success' ? (
        <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/60">
          {message}
        </p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            disabled={status === 'loading'}
            className="flex-1 bg-transparent border border-outline-variant text-on-surface placeholder:text-on-surface/30 font-light text-sm px-4 py-2.5 focus:outline-none focus:border-on-surface transition-colors duration-200 disabled:opacity-50"
            style={{ letterSpacing: '-0.14px' }}
          />
          <button
            type="submit"
            disabled={status === 'loading'}
            className="inline-flex items-center justify-center font-mono text-[0.6875rem] uppercase tracking-label bg-on-surface text-background px-5 py-2.5 hover:opacity-80 transition-opacity duration-200 disabled:opacity-50 whitespace-nowrap"
          >
            {status === 'loading' ? 'Sending…' : 'Notify Me'}
          </button>
        </form>
      )}

      {status === 'error' && (
        <p className="mt-2 font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/60">
          {message}
        </p>
      )}
    </div>
  )
}