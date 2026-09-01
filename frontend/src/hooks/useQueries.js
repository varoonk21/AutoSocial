import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { fetcher } from '../lib/fetcher'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const queryKeys = {
  media: ['media'],
  posts: ['posts'],
  integrations: ['integrations'],
}

// ─── Media Hooks ──────────────────────────────────────────────────────────────

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

// ─── Posts Hooks ──────────────────────────────────────────────────────────────

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

// ─── Integrations Hooks ───────────────────────────────────────────────────────

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
