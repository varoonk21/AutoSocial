import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { apiGet, apiDelete } from '@/lib/fetcher'
import { STATUS_CONFIG } from '@/constants/platforms'
import { PlatformIcon } from '../components/PlatformIcon'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export function DraftsPage() {
  const navigate = useNavigate()
  const [posts, setPosts] = useState([])
  const [integrations, setIntegrations] = useState([])
  const [deleting, setDeleting] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)

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
      const data = await apiGet('/posts?state=DRAFT')
      setPosts(data.posts || [])
    } catch {}
  }

  const handleDeleteClick = (postId) => {
    setDeleteTarget(postId)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return
    setDeleting(deleteTarget)
    try {
      await apiDelete(`/posts/${deleteTarget}`)
      setPosts(posts.filter(p => p._id !== deleteTarget))
    } catch (err) {
      console.error('Failed to delete draft:', err)
    } finally {
      setDeleting(null)
      setDeleteDialogOpen(false)
      setDeleteTarget(null)
    }
  }

  const handleEdit = (post) => {
    navigate('/dashboard/create-post/' + post._id)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Drafts</h1>
        <p className="text-gray-500 mt-1">Manage your draft posts before publishing.</p>
      </div>

      {posts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-gray-400">No drafts found.</p>
            <Button
              className="mt-4"
              onClick={() => navigate('/dashboard/create-post')}
            >
              Create New Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0 divide-y divide-gray-100">
            {posts.map((post) => {
              // Handle both populated object and string for integrationId
              const integration = typeof post.integrationId === 'object' && post.integrationId !== null
                ? post.integrationId
                : integrations.find((i) => i.id === post.integrationId)
              const publishDate = new Date(post.publishDate)
              const statusConf = STATUS_CONFIG[post.state] || STATUS_CONFIG.DRAFT
              const mediaItems = JSON.parse(post.image || '[]')
              // Handle both string paths and object {path} formats
              const firstMedia = mediaItems[0]
              const mediaUrl = typeof firstMedia === 'string' ? firstMedia : firstMedia?.path
              const platform = integration?.platform || integration?.providerIdentifier || null

              return (
                <div key={post._id} className="p-5 hover:bg-gray-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {mediaUrl ? (
                        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 line-clamp-2">{post.content}</p>
                      <div className="flex items-center gap-3 mt-2">
                        {platform && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <PlatformIcon platform={platform} size={12} />
                            </div>
                            <span className="text-xs text-gray-500 capitalize">{platform}</span>
                          </div>
                        )}
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}>
                          {statusConf.label}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0">
                      <span className="text-xs text-gray-400 whitespace-nowrap">
                        {publishDate.toLocaleDateString()} {publishDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        disabled={deleting === post._id}
                        onClick={() => handleDeleteClick(post._id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Draft</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-500">Are you sure you want to delete this draft? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={!!deleting}>
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
