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
    <div className="mt-8 w-full max-w-sm mx-auto">
      <p className="font-mono text-[0.6875rem] uppercase tracking-label text-on-surface/40 mb-3">
        Collection Updates
      </p>
      {status === 'success' ? (
        <p className="text-sm font-light text-on-surface-variant">{message}</p>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={status === 'loading'}
            className="w-full bg-transparent border-b border-on-surface/20 focus:border-on-surface outline-none py-2 text-sm font-light text-on-surface placeholder:text-on-surface/30 transition-colors duration-200 disabled:opacity-50"
          />
          {status === 'error' && (
            <p className="text-[0.6875rem] font-light text-on-surface/60">{message}</p>
          )}
          <button
            type="submit"
            disabled={status === 'loading'}
            className="self-start inline-flex items-center font-mono text-[0.6875rem] uppercase tracking-label bg-on-surface text-background px-5 py-2.5 hover:opacity-80 transition-opacity duration-200 disabled:opacity-40"
          >
            {status === 'loading' ? 'Sending…' : 'Notify Me'}
          </button>
        </form>
      )}
    </div>
  )
}