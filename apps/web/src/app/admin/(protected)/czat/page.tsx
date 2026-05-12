import Link from 'next/link'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const metadata = { title: 'Czat' }

export default async function ChatListPage() {
  const supabase = createSupabaseServerClient()

  const { data: rows } = await supabase
    .from('chat_messages')
    .select('id, client_id, content, read, sender, created_at, clients(first_name,last_name,email)')
    .order('created_at', { ascending: false })
    .limit(500)

  // Grupuj po client_id, weź najnowszą wiadomość per klient
  const seen = new Set<string>()
  const conversations: any[] = []
  for (const m of rows ?? []) {
    if (!seen.has(m.client_id)) {
      seen.add(m.client_id)
      conversations.push(m)
    }
  }

  const totalUnread = (rows ?? []).filter((m) => !m.read && m.sender === 'client').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-700">Czat</h1>
        <p className="text-sm text-gray-600">
          {conversations.length} konwersacji · <span className="text-orange-600 font-semibold">{totalUnread} nieprzeczytanych</span>
        </p>
      </div>

      <div className="card">
        {conversations.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-6">Brak konwersacji.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((m: any) => {
              const unread = !m.read && m.sender === 'client'
              return (
                <li key={m.id}>
                  <Link href={`/admin/klienci/${m.client_id}?tab=czat`} className={`flex justify-between items-start py-3 px-2 -mx-2 rounded hover:bg-gray-50 ${unread ? 'bg-orange-50/40' : ''}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{m.clients?.first_name} {m.clients?.last_name}</span>
                        {unread && <span className="badge-claim !py-0.5">nowa</span>}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5 truncate max-w-md">
                        {m.sender === 'agent' ? 'Ty: ' : ''}{m.content}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">{new Date(m.created_at).toLocaleString('pl-PL')}</div>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
