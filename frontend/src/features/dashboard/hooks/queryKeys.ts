export const queryKeys = {
  media: ['media'],
  mediaList: (params: Record<string, string> = {}) => ['media', params],
  posts: ['posts'],
  postsList: (params: Record<string, string> = {}) => ['posts', params],
  postsStats: ['posts', 'stats'],
  integrations: ['integrations'],
  integrationCover: (id: string) => ['integration-cover', id],
  brandKit: ['brand-kit'],
}
