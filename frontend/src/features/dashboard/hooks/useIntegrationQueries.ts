import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiDelete } from '@/lib/fetcher'
import { queryKeys } from './queryKeys'

export function useIntegrations() {
  return useQuery({
    queryKey: queryKeys.integrations,
    queryFn: () => apiGet('/integrations/list'),
  })
}

export function useIntegrationCover(id?: string) {
  return useQuery({
    queryKey: queryKeys.integrationCover(id ?? ''),
    queryFn: () => apiGet<{ cover?: string }>(`/integrations/${id}/cover`),
    enabled: !!id,
  })
}

export function useDeleteIntegration() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/integrations/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.integrations })
    },
  })
}
