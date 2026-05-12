import { Resend } from 'resend'

let _resend: Resend | null = null

export function getResend(): Resend {
  if (!_resend) {
    const key = process.env.RESEND_API_KEY
    if (!key || key === 're_TODO') {
      throw new Error('RESEND_API_KEY nie skonfigurowany w .env.local')
    }
    _resend = new Resend(key)
  }
  return _resend
}

export const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? 'noreply@finvita.pl'
export const AGENT_EMAIL = process.env.AGENT_EMAIL ?? 'agent@epro-polska.pl'

export async function sendEmail(opts: { to: string; subject: string; html: string; replyTo?: string }) {
  try {
    const resend = getResend()
    return await resend.emails.send({
      from: `MojaPolisa – Finvita <${FROM_EMAIL}>`,
      to: opts.to,
      subject: opts.subject,
      html: opts.html,
      replyTo: opts.replyTo,
    })
  } catch (err) {
    // W dev: wypisz email do logów, nie blokuj flow
    console.warn('[email] send failed (DEV stub):', opts.subject, '→', opts.to)
    console.warn('[email] preview:', opts.html.slice(0, 400).replace(/<[^>]*>/g, ''))
    if (process.env.NODE_ENV === 'production') throw err
    return { id: 'dev-stub', error: err }
  }
}
