'use client'

import { useEffect } from 'react'
import { createSupabaseBrowserClient } from '@/lib/supabase/client'

/**
 * Subskrybuje INSERT na chat_messages dla danego klienta.
 * Wywołuje callback (zwykle router.refresh() lub setState) gdy nadejdzie wiadomość.
 *
 * Aby działało: w supabase/schema.sql tabela chat_messages jest dodana do
 * publikacji supabase_realtime (już zrobione).
 */
export function useChatRealtime(clientId: string | null | undefined, onMessage: () => void) {
  useEffect(() => {
    if (!clientId) return
    const supabase = createSupabaseBrowserClient()
    const channel = supabase
      .channel(`chat:${clientId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'chat_messages',
        filter: `client_id=eq.${clientId}`,
      }, () => onMessage())
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [clientId, onMessage])
}
