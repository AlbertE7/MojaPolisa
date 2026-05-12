import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { PRODUCT_LABELS, POLICY_STATUS_LABELS, type ProductType, type PolicyStatus } from '@mojapolisa/shared'
import { ClientTabs } from '@/components/admin/ClientTabs'
import { AdminActions } from '@/components/admin/AdminActions'
import { ApplicationDetails } from '@/components/admin/details/ApplicationDetails'
import { AnkDetails } from '@/components/admin/details/AnkDetails'
import { MedicalDetails } from '@/components/admin/details/MedicalDetails'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ tab?: string }>
}

export default async function ClientCardPage({ params, searchParams }: PageProps) {
  const { id } = await params
  const { tab = 'dane' } = await searchParams

  const supabase = createSupabaseServerClient()

  const [
    { data: client },
    { data: policies },
    { data: applications },
    { data: ankRecords },
    { data: chatMessages },
    { data: notifications },
  ] = await Promise.all([
    supabase.from('clients').select('*').eq('id', id).maybeSingle(),
    supabase.from('policies').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('applications').select('*').eq('client_id', id).order('submitted_at', { ascending: false }),
    supabase.from('ank_records').select('*').eq('client_id', id).order('created_at', { ascending: false }),
    supabase.from('chat_messages').select('*').eq('client_id', id).order('created_at', { ascending: false }).limit(100),
    supabase.from('notifications').select('*').eq('client_id', id).order('sent_at', { ascending: false }).limit(50),
  ])

  if (!client) notFound()

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <Link href="/admin/klienci" className="text-sm text-brand-600 hover:underline">← Wszyscy klienci</Link>
          <h1 className="text-2xl font-bold text-brand-700 mt-1">{client.first_name} {client.last_name}</h1>
          <div className="text-sm text-gray-500 flex flex-wrap items-center gap-3">
            <span>{client.email}</span>
            <span>·</span>
            <span>{client.phone}</span>
            <span>·</span>
            <span>{client.pesel_type === 'UA' ? '🇺🇦' : '🇵🇱'} {client.pesel?.slice(0, 3)}*****</span>
          </div>
        </div>
        <AdminActions clientId={id} clientPhone={client.phone ?? ''} clientName={client.first_name ?? ''} />
      </div>

      <ClientTabs clientId={id} active={tab} counts={{
        policies: policies?.length ?? 0,
        applications: applications?.length ?? 0,
        ank: ankRecords?.length ?? 0,
        chat: chatMessages?.length ?? 0,
      }} />

      {tab === 'dane' && <TabDane client={client} />}
      {tab === 'polisy' && <TabPolisy clientId={id} policies={policies ?? []} />}
      {tab === 'wnioski' && <TabWnioski applications={applications ?? []} />}
      {tab === 'ank' && <TabAnk records={ankRecords ?? []} />}
      {tab === 'notatki' && <TabNotatki clientId={id} note={client.agent_notes ?? ''} />}
      {tab === 'historia' && <TabHistoria notifications={notifications ?? []} policies={policies ?? []} />}
      {tab === 'czat' && <TabCzat clientId={id} messages={chatMessages ?? []} />}
    </div>
  )
}

function TabDane({ client }: { client: any }) {
  return (
    <div className="card space-y-3 text-sm">
      <Row label="Imię" value={client.first_name} />
      <Row label="Nazwisko" value={client.last_name} />
      <Row label="Email" value={client.email} />
      <Row label="Telefon" value={client.phone} />
      <Row label="Typ identyfikatora" value={client.pesel_type === 'UA' ? 'Ukraiński numer ID' : 'Polski PESEL'} />
      <Row label="Data urodzenia" value={client.birth_date} />
      <Row label="Płeć" value={client.gender === 'M' ? 'Mężczyzna' : client.gender === 'K' ? 'Kobieta' : '—'} />
      <Row label="Adres" value={client.address ? `${client.address.street ?? ''} ${client.address.house_number ?? ''}${client.address.apartment_number ? '/' + client.address.apartment_number : ''}, ${client.address.postal_code ?? ''} ${client.address.city ?? ''}` : '—'} />
      <Row label="Konto w aplikacji" value={client.has_account ? 'Tak' : 'Nie'} />
      <Row label="Ostatnie logowanie" value={client.last_login ? new Date(client.last_login).toLocaleString('pl-PL') : '—'} />
      <Row label="Utworzono" value={new Date(client.created_at).toLocaleString('pl-PL')} />
    </div>
  )
}

function TabPolisy({ clientId, policies }: { clientId: string; policies: any[] }) {
  return (
    <div className="space-y-4">
      <Link href={`/admin/klienci/${clientId}/polisa/nowa`} className="btn-primary">+ Dodaj polisę</Link>
      {policies.length === 0 ? (
        <div className="card text-center text-gray-500 py-8">Klient nie ma jeszcze żadnej polisy.</div>
      ) : (
        policies.map((p) => (
          <div key={p.id} className="card">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="font-bold text-brand-700">{PRODUCT_LABELS[p.product_type as ProductType] ?? p.product_type}</div>
                <div className="text-xs text-gray-500">Nr: {p.policy_number ?? '—'} · {p.start_date ?? '—'} → {p.end_date ?? '—'}</div>
              </div>
              <span className={`badge-${p.status === 'claim_in_progress' ? 'claim' : p.status}`}>{POLICY_STATUS_LABELS[p.status as PolicyStatus] ?? p.status}</span>
            </div>
            <div className="mt-3 flex gap-2 text-sm">
              <Link href={`/admin/klienci/${clientId}/polisa/${p.id}`} className="text-brand-600 hover:underline">Edytuj</Link>
              <span className="text-gray-300">·</span>
              <span className="text-gray-600">Składka: {p.premium ?? '—'} PLN ({p.frequency ?? '—'})</span>
            </div>
          </div>
        ))
      )}
    </div>
  )
}

function TabWnioski({ applications }: { applications: any[] }) {
  if (applications.length === 0) return <div className="card text-center text-gray-500 py-8">Brak wniosków.</div>
  return (
    <div className="space-y-4">
      {applications.map((a) => (
        <details key={a.id} className="card group" open={applications.length === 1}>
          <summary className="cursor-pointer flex justify-between items-center gap-3 flex-wrap">
            <div>
              <div className="font-bold text-brand-700">{PRODUCT_LABELS[a.product_type as ProductType] ?? a.product_type}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Złożono: {new Date(a.submitted_at).toLocaleString('pl-PL')} · IP: {a.ip_address ?? '—'} · ID: {a.id.slice(0, 8).toUpperCase()}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="badge-submitted">{a.status}</span>
              <span className="text-xs text-gray-400 group-open:hidden">▶ rozwiń</span>
              <span className="text-xs text-gray-400 hidden group-open:inline">▼ zwiń</span>
            </div>
          </summary>

          <div className="mt-6 space-y-8 border-t border-gray-100 pt-6">
            <div>
              <h4 className="text-sm font-bold text-brand-700 mb-3">📋 Wniosek</h4>
              <ApplicationDetails formData={a.form_data} productType={a.product_type} />
            </div>

            {a.ank_data && Object.keys(a.ank_data).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-brand-700 mb-3">📝 Analiza Potrzeb Klienta (ANK)</h4>
                <AnkDetails answers={a.ank_data} />
              </div>
            )}

            {a.medical_data && Object.keys(a.medical_data).length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-brand-700 mb-3">🏥 Ankieta medyczna</h4>
                <MedicalDetails answers={a.medical_data} />
              </div>
            )}
          </div>
        </details>
      ))}
    </div>
  )
}

function TabAnk({ records }: { records: any[] }) {
  if (records.length === 0) return <div className="card text-center text-gray-500 py-8">Brak ANK.</div>
  return (
    <div className="space-y-4">
      {records.map((r, idx) => (
        <details key={r.id} className="card group" open={idx === 0}>
          <summary className="cursor-pointer flex justify-between items-center gap-3 flex-wrap">
            <div>
              <div className="font-bold text-brand-700">{PRODUCT_LABELS[r.product_type as ProductType] ?? r.product_type}</div>
              <div className="text-xs text-gray-500 mt-0.5">
                Zaakceptowano: {new Date(r.accepted_at).toLocaleString('pl-PL')} · IP: {r.ip_address} · Archiwizacja IDD: 5 lat
              </div>
            </div>
            <span className="text-xs text-gray-400 group-open:hidden">▶ rozwiń</span>
            <span className="text-xs text-gray-400 hidden group-open:inline">▼ zwiń</span>
          </summary>
          <div className="mt-6 border-t border-gray-100 pt-6">
            <AnkDetails answers={r.answers} />
          </div>
        </details>
      ))}
    </div>
  )
}

function TabNotatki({ clientId, note }: { clientId: string; note: string }) {
  return (
    <form action={`/api/admin/clients/${clientId}/note`} method="POST" className="card">
      <h3 className="font-bold text-brand-700 mb-3">Notatki agenta (prywatne)</h3>
      <p className="text-xs text-gray-500 mb-3">Te notatki są niewidoczne dla klienta.</p>
      <textarea name="note" className="input-field" rows={8} defaultValue={note} />
      <button type="submit" className="btn-primary mt-3">Zapisz notatki</button>
    </form>
  )
}

function TabHistoria({ notifications, policies }: { notifications: any[]; policies: any[] }) {
  const events: Array<{ at: string; label: string; detail: string }> = []
  for (const n of notifications) events.push({ at: n.sent_at, label: `📨 ${n.title}`, detail: n.body })
  for (const p of policies) {
    if (p.status_history) {
      const history = Array.isArray(p.status_history) ? p.status_history : []
      for (const h of history) events.push({ at: h.changed_at, label: `📋 Polisa: ${h.status}`, detail: h.note ?? '' })
    }
    events.push({ at: p.created_at, label: `📋 Polisa utworzona`, detail: PRODUCT_LABELS[p.product_type as ProductType] ?? '' })
  }
  events.sort((a, b) => b.at.localeCompare(a.at))

  if (events.length === 0) return <div className="card text-center text-gray-500 py-8">Brak zdarzeń.</div>
  return (
    <div className="card">
      <ol className="space-y-3 text-sm">
        {events.map((e, i) => (
          <li key={i} className="flex gap-3 border-b border-gray-100 pb-2 last:border-0">
            <div className="text-xs text-gray-400 w-32 flex-shrink-0">{new Date(e.at).toLocaleString('pl-PL')}</div>
            <div className="flex-1">
              <div className="font-medium">{e.label}</div>
              {e.detail && <div className="text-xs text-gray-500">{e.detail}</div>}
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

function TabCzat({ clientId, messages }: { clientId: string; messages: any[] }) {
  return (
    <div className="card">
      <div className="space-y-2 max-h-96 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <p className="text-center text-gray-500 py-8 text-sm">Brak wiadomości.</p>
        ) : (
          [...messages].reverse().map((m) => (
            <div key={m.id} className={`flex ${m.sender === 'agent' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md rounded-lg px-3 py-2 text-sm ${m.sender === 'agent' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div>{m.content}</div>
                <div className={`text-xs mt-1 ${m.sender === 'agent' ? 'text-brand-100' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString('pl-PL')}</div>
              </div>
            </div>
          ))
        )}
      </div>
      <form action="/api/chat/send" method="POST" className="flex gap-2">
        <input type="hidden" name="client_id" value={clientId} />
        <input type="hidden" name="sender" value="agent" />
        <input type="text" name="content" placeholder="Napisz wiadomość..." className="input-field flex-1" required />
        <button type="submit" className="btn-primary">Wyślij</button>
      </form>
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between border-b border-gray-100 pb-2 last:border-0">
      <span className="text-gray-500">{label}</span>
      <span className="font-medium text-right">{value || '—'}</span>
    </div>
  )
}
