import { useEffect, useState } from 'react'
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/fetcher'
import { STATUS_CONFIG } from '@/constants/platforms'
import { PlatformIcon } from '../components/PlatformIcon'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

export function ScheduledPostsPage() {
  const [posts, setPosts] = useState([])
  const [integrations, setIntegrations] = useState([])
  const [filter, setFilter] = useState('all')
  const [deleting, setDeleting] = useState(null)

  useEffect(() => {
    loadIntegrations()
    loadPosts()
  }, [])

  async function loadIntegrations() {
    try {
      const data = await apiGet('/integrations/list')
      setIntegrations(data.integrations || [])
    } catch {}
  }

  async function loadPosts() {
    try {
      const data = await apiGet('/posts')
      setPosts(data.posts || [])
    } catch {}
  }

  const handleDelete = async (postId) => {
    if (!confirm('Delete this post?')) return
    setDeleting(postId)
    try {
      await apiDelete(`/posts/${postId}`)
      loadPosts()
    } finally {
      setDeleting(null)
    }
  }

  const filteredPosts = filter === 'all' ? posts : posts.filter((p) => p.state === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Scheduled Posts</h1>
        <p className="text-gray-500 mt-1">Manage your upcoming and published content.</p>
      </div>

      <ToggleGroup
        type="single"
        value={filter}
        onValueChange={(value) => value && setFilter(value)}
        variant="outline"
        size="sm"
      >
        <ToggleGroupItem value="all">All</ToggleGroupItem>
        <ToggleGroupItem value="QUEUE">Scheduled</ToggleGroupItem>
        <ToggleGroupItem value="PUBLISHED">Published</ToggleGroupItem>
        <ToggleGroupItem value="DRAFT">Drafts</ToggleGroupItem>
        <ToggleGroupItem value="ERROR">Failed</ToggleGroupItem>
      </ToggleGroup>

      {filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-400">No posts found.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100">
            {filteredPosts.map((post) => {
              const integration = post.integrationId || integrations.find((i) => i._id === post.integrationId)
              const publishDate = new Date(post.publishDate)
              const statusConf = STATUS_CONFIG[post.state] || STATUS_CONFIG.DRAFT
              const mediaItems = JSON.parse(post.image || '[]')
              const platform = integration?.providerIdentifier || 'x'

              return (
                <div key={post._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {mediaItems.length > 0 ? (
                        <img src={mediaItems[0].path} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5">
                          <div className="w-4 h-4 flex items-center justify-center">
                            <PlatformIcon platform={platform} size={12} />
                          </div>
                          <span className="text-xs text-gray-500 capitalize">{platform}</span>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}>
                          {statusConf.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {publishDate.toLocaleDateString()} {publishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {post.releaseURL && post.state === 'PUBLISHED' && (
                        <a href={post.releaseURL} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                          View ↗
                        </a>
                      )}
                      {post.state !== 'PUBLISHED' && (
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deleting === post._id}
                          onClick={() => handleDelete(post._id)}
                        >
                          Delete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
