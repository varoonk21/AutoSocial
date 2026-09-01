import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '../lib/fetcher'
import { queryKeys } from './queryKeys'

export function useMedia() {
  return useQuery({
    queryKey: queryKeys.media,
    queryFn: () => fetcher.get('/media'),
  })
}

export function useUploadMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body) => fetcher.post('/media', body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media })
    },
  })
}

export function useDeleteMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => fetcher.del(`/media/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.media })
    },
  })
}
