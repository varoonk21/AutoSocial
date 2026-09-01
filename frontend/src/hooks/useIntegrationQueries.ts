import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '../lib/fetcher'
import { queryKeys } from './queryKeys'

export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations,
    queryFn: () => fetcher.get('/integrations/list'),
  })
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => fetcher.del(`/integrations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations })
    },
  })
}
