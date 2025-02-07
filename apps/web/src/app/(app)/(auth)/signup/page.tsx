import SignupForm from '@web/components/signup-form'
import { api } from '@web/trpc/server'

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{
    user?: string
  }>
}): Promise<React.ReactNode> {
  const patient = await api.users.details((await searchParams).user ?? '')

  return (
    <main className="container mx-auto flex min-h-[95vh] w-full flex-col items-center pb-28">
      <SignupForm patient={patient} />
    </main>
  )
}
