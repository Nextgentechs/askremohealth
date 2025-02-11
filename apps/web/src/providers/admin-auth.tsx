import { api } from '@web/trpc/server'
import { redirect } from 'next/navigation'
export async function AdminAuthProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await api.users.currentUser()

  if (!user?.isAdmin) {
    redirect('/admin')
  }

  return <>{children}</>
}
