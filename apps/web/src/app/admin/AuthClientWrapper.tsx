// app/admin/AuthClientWrapper.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AuthForm from '@web/components/auth-form'

export default function AuthClientWrapper() {
  const router = useRouter()

  // Ensure the URL has the query params so AuthForm can read them with useSearchParams()
  useEffect(() => {
    const search = window.location.search
    const hasRole = search.includes('role=admin')
    const hasStep = search.includes('step=login') || search.includes('step=signup') || search.includes('step=otp')

    if (!hasRole || !hasStep) {
      // keep the current pathname but add role and step without creating a history entry
      router.replace(`${window.location.pathname}?role=admin&step=login`)
    }
  }, [router])

  return (
    <div className="flex w-full max-w-sm flex-col gap-6">
      <AuthForm /> {/* original AuthForm - we are NOT passing props */}
    </div>
  )
}
