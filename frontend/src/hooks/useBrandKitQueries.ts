import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '../lib/fetcher'
import { queryKeys } from './queryKeys'

export function useBrandKit() {
  return useQuery({
    queryKey: queryKeys.brandKit,
    queryFn: () => fetcher.get('/brand-kit'),
  })
}

export function useSaveBrandKit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body) => fetcher.put('/brand-kit', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brandKit })
    },
  })
}

export function useDeleteBrandKit() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => fetcher.del('/brand-kit'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.brandKit })
    },
  })
}
