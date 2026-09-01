import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '../lib/fetcher'
import { queryKeys } from './queryKeys'

export function usePosts(params = {}) {
  const query = new URLSearchParams(params).toString()

  return useQuery({
    queryKey: [...queryKeys.posts, params],
    queryFn: () => fetcher.get(`/posts${query ? `?${query}` : ''}`),
  })
}

export function useDeletePost() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id) => fetcher.del(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.posts })
    },
  })
}
