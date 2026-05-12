import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const metadata = { title: 'Czat z agentem' }

export default async function ClientChatPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/logowanie')

  const { data: link } = await supabase.from('auth_accounts').select('client_id').eq('auth_uid', user.id).maybeSingle()
  const clientId = link?.client_id ?? ''

  const { data: messages } = await supabase
    .from('chat_messages').select('*').eq('client_id', clientId)
    .order('created_at', { ascending: true }).limit(200)

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-brand-700 mb-4">Czat z agentem</h1>

      <div className="card flex flex-col h-[60vh]">
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {!messages || messages.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">Brak wiadomości. Zacznij rozmowę!</p>
          ) : messages.map((m: any) => (
            <div key={m.id} className={`flex ${m.sender === 'client' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-md rounded-lg px-3 py-2 text-sm ${m.sender === 'client' ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-900'}`}>
                <div>{m.content}</div>
                <div className={`text-xs mt-1 ${m.sender === 'client' ? 'text-brand-100' : 'text-gray-500'}`}>{new Date(m.created_at).toLocaleString('pl-PL')}</div>
              </div>
            </div>
          ))}
        </div>
        <form action="/api/chat/send" method="POST" className="flex gap-2">
          <input type="hidden" name="client_id" value={clientId} />
          <input type="hidden" name="sender" value="client" />
          <input type="text" name="content" required placeholder="Napisz wiadomość..." className="input-field flex-1" />
          <button type="submit" className="btn-primary !py-2 !px-4">Wyślij</button>
        </form>
      </div>

      <p className="text-xs text-gray-500 italic mt-4 text-center">
        Agent odpowie w godzinach pracy. Pilne sprawy ubezpieczeniowe – zadzwoń do infolinii towarzystwa.
      </p>
    </div>
  )
}
