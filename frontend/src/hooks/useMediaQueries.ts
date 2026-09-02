import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiGet, apiPost, apiDelete } from '../lib/fetcher'
import { queryKeys } from './queryKeys'

export function useMedia() {
  return useQuery({
    queryKey: queryKeys.media,
    queryFn: () => apiGet('/media'),
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: any) => apiPost('/media', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => apiDelete(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media })
    },
  })
}
