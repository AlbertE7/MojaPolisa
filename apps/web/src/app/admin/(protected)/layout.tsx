import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase/server'
import { AdminShell } from '@/components/admin/AdminShell'

export const metadata = { title: { default: 'Panel admina', template: '%s · Admin' } }

export default async function ProtectedAdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/admin/logowanie')
  if (user.app_metadata?.role !== 'admin') redirect('/admin/logowanie?error=no_permission')

  return <AdminShell userEmail={user.email ?? ''}>{children}</AdminShell>
}
