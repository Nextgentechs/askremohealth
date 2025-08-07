import { api } from '@web/trpc/react';

export function useCurrentUser() {
  const { data: user, isLoading, error } = api.users.currentUser.useQuery(undefined, {
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    user: user ?? null,
    isLoading,
    error,
  };
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
