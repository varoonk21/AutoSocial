import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { apiGet, apiDelete } from "@/lib/fetcher";
import { STATUS_CONFIG } from "@/constants/platforms";
import { PlatformIcon } from "../components/PlatformIcon";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Edit2, Trash2, Calendar, FileText, CheckCircle2, Clock, AlertCircle, Layers, ExternalLink } from "lucide-react";

interface ManagePostsPageProps {
  initialTab?: string;
}

type TabType = "ALL" | "DRAFT" | "QUEUE" | "PUBLISHED" | "ERROR";

const TABS: { id: TabType; label: string; icon: any }[] = [
  { id: "ALL", label: "All Posts", icon: Layers },
  { id: "DRAFT", label: "Drafts", icon: FileText },
  { id: "QUEUE", label: "Scheduled", icon: Clock },
  { id: "PUBLISHED", label: "Published", icon: CheckCircle2 },
  { id: "ERROR", label: "Failed", icon: AlertCircle },
];

export function ManagePostsPage({ initialTab }: ManagePostsPageProps) {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const activeTabFromQuery = (searchParams.get("tab")?.toUpperCase() as TabType) || undefined;
  const [activeTab, setActiveTab] = useState<TabType>(
    activeTabFromQuery || (initialTab?.toUpperCase() as TabType) || "ALL"
  );

  const [posts, setPosts] = useState<any[]>([]);
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const handleTabChange = (tabId: TabType) => {
    setActiveTab(tabId);
    if (tabId === "ALL") {
      searchParams.delete("tab");
      setSearchParams(searchParams, { replace: true });
    } else {
      setSearchParams({ tab: tabId.toLowerCase() }, { replace: true });
    }
  };

  async function loadData() {
    setLoading(true);
    try {
      const [intRes, postsRes] = await Promise.all([
        apiGet("/integrations/list"),
        apiGet("/posts"),
      ]);
      setIntegrations(intRes.integrations || []);
      setPosts(postsRes.posts || []);
    } catch (err) {
      console.error("Failed to load posts:", err);
    } finally {
      setLoading(false);
    }
  }

  // Tab counts come from the full list; tabs filter client-side so switching is instant.
  const counts = {
    ALL: posts.length,
    DRAFT: posts.filter((p) => p.state === "DRAFT").length,
    QUEUE: posts.filter((p) => p.state === "QUEUE").length,
    PUBLISHED: posts.filter((p) => p.state === "PUBLISHED").length,
    ERROR: posts.filter((p) => p.state === "ERROR").length,
  };

  const handleDeleteClick = (postId: string) => {
    setDeleteTarget(postId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(deleteTarget);
    try {
      await apiDelete(`/posts/${deleteTarget}`);
      setPosts((prev) => prev.filter((p) => p._id !== deleteTarget));
    } catch (err) {
      console.error("Failed to delete post:", err);
    } finally {
      setDeleting(null);
      setDeleteDialogOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleEdit = (post: any) => {
    navigate(`/dashboard/content/create/${post._id}`);
  };

  const tabPosts = activeTab === "ALL" ? posts : posts.filter((p) => p.state === activeTab);
  const sortedPosts = [...tabPosts].sort((a, b) => {
    const aTime = a.publishDate ? new Date(a.publishDate).getTime() : (a.createdAt ? new Date(a.createdAt).getTime() : 0);
    const bTime = b.publishDate ? new Date(b.publishDate).getTime() : (b.createdAt ? new Date(b.createdAt).getTime() : 0);
    return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Manage Content</h1>
          <p className="text-sm text-slate-500 mt-1">
            View, edit, and filter all your social media posts in one place.
          </p>
        </div>
        <Button
          onClick={() => navigate("/dashboard/content/create")}
          className="gap-2 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Post</span>
        </Button>
      </div>

      {/* Tabs Bar + Sort */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200">
        <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Filter posts by status">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  isActive
                    ? "text-slate-900 font-semibold border-primary"
                    : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
                <span
                  className={`text-xs font-bold rounded-full px-2 py-0.5 ${
                    isActive ? "bg-primary-100 text-primary-700" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {counts[tab.id]}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2 pb-2">
          <Select value={sortOrder} onValueChange={(v) => setSortOrder(v as "newest" | "oldest")}>
            <SelectTrigger className="w-[168px] h-10 text-sm" aria-label="Sort posts">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="newest">Newest to Oldest</SelectItem>
              <SelectItem value="oldest">Oldest to Newest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Posts List */}
      {loading ? (
        <Card className="border border-slate-200 shadow-soft">
          <CardContent className="p-0 divide-y divide-slate-100">
            {[0, 1, 2].map((i) => (
              <div key={i} className="p-5 flex items-start gap-4">
                <Skeleton className="w-14 h-14 rounded-xl shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/3" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : posts.length === 0 ? (
        <Card className="border border-slate-200 shadow-sm rounded-xl bg-background">
          <CardContent className="p-12 text-center">
            <p className="text-slate-400 text-sm">No posts found in this category.</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/dashboard/content/create")}
            >
              Create New Post
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border border-slate-200 shadow-sm rounded-xl overflow-hidden bg-background">
          <CardContent className="p-0 divide-y divide-slate-100">
            {sortedPosts.map((post) => {
              const integration =
                typeof post.integrationId === "object" && post.integrationId !== null
                  ? post.integrationId
                  : integrations.find((i) => i.id === post.integrationId);

              const publishDate = post.publishDate ? new Date(post.publishDate) : null;
              const statusConf = STATUS_CONFIG[post.state] || STATUS_CONFIG.DRAFT;
              const mediaItems = JSON.parse(post.image || "[]");
              const firstMedia = mediaItems[0];
              const mediaUrl = typeof firstMedia === "string" ? firstMedia : firstMedia?.path;
              const platform = integration?.platform || integration?.providerIdentifier || null;

              const isEditable = post.state === "DRAFT" || post.state === "QUEUE";

              return (
                <div key={post._id} className="p-5 hover:bg-slate-50/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Media Thumbnail */}
                    <div className="w-14 h-14 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden border border-slate-200/80">
                      {mediaUrl ? (
                        <img src={mediaUrl} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth="1.5">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <polyline points="21 15 16 10 5 21" />
                        </svg>
                      )}
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">
                        {post.content || <span className="italic text-slate-400">Untitled Post</span>}
                      </p>
                      <div className="flex items-center gap-3 mt-2">
                        {platform && (
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 flex items-center justify-center">
                              <PlatformIcon platform={platform} size={12} />
                            </div>
                            <span className="text-xs text-slate-500 capitalize">{platform}</span>
                          </div>
                        )}
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}
                        >
                          {statusConf.label}
                        </span>
                      </div>
                    </div>

                    {/* Actions & Timestamp */}
                    <div className="flex items-center gap-4 shrink-0">
                      {publishDate && (
                        <div className="text-xs text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>
                            {publishDate.toLocaleDateString()} {publishDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      )}
                      {isEditable && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(post)}
                          className="gap-1 text-xs font-medium"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Button>
                      )}
                      {post.releaseURL && (
                        <a
                          href={post.releaseURL}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 whitespace-nowrap"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          View
                        </a>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Delete post"
                        disabled={deleting === post._id}
                        onClick={() => handleDeleteClick(post._id)}
                        className="text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Post</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-slate-500">
            Are you sure you want to delete this post? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm} disabled={!!deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
