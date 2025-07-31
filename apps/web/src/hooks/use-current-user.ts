import { useQuery } from '@tanstack/react-query'

export function useCurrentUser() {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const response = await fetch('/api/auth/me')
      if (!response.ok) {
        throw new Error('Failed to fetch user')
      }
      return response.json()
    },
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  return {
    user: user?.user || null,
    isLoading,
    error,
  }
}

export function useIsDoctor() {
  const { user } = useCurrentUser()
  return user?.role === 'doctor'
}

export function useIsAdmin() {
  const { user } = useCurrentUser()
  return user?.role === 'admin'
}

export function useIsPatient() {
  const { user } = useCurrentUser()
  return user?.role === 'patient'
}