'use client'

import { useRouter } from 'next/navigation'
import { useChatRealtime } from '@/hooks/useChatRealtime'

/**
 * Wstaw na stronę z czatem admina/klienta aby auto-refreshować widok
 * przy przyjściu nowej wiadomości.
 */
export function AgentChatLive({ clientId }: { clientId: string }) {
  const router = useRouter()
  useChatRealtime(clientId, () => router.refresh())
  return null
}
