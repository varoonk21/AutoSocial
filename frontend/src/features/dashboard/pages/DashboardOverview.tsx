import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiGet } from "../../../lib/fetcher";
import { STATUS_CONFIG, PLATFORM_LABELS } from "../../../constants/platforms";
import { PlatformIcon } from "../components/PlatformIcon";
import { Button } from "@/components/ui/button";
import { ExternalLink, Plus, BarChart3, FolderKanban, User as UserIcon } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { useSession } from "@/lib/auth-client";
import { useImageStore } from "@/store/imageStore";

interface Stats {
  postsThisMonth: number;
  postsChange: number;
  upcomingPosts: number;
  postsByPlatform: Record<string, number>;
}

interface MappedPost {
  id: string;
  content: string;
  campaign: string;
  platform: string;
  platformLabel: string;
  status: string;
  date: string;
  image: string | null;
  releaseURL: string | null;
}

interface PageInfo {
  id: string;
  platform: string;
  name: string;
  avatar: string;
  status: string;
  targetId: string;
}

export function DashboardOverview() {
  const navigate = useNavigate();
  const { data: session } = useSession();
  const getImageUrl = useImageStore((state) => state.getImageUrl);
  const [posts, setPosts] = useState<MappedPost[]>([]);
  const [stats, setStats] = useState<Stats>({
    postsThisMonth: 0,
    postsChange: 0,
    upcomingPosts: 0,
    postsByPlatform: {},
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [postsLoading, setPostsLoading] = useState(true);
  const [pages, setPages] = useState<PageInfo[]>([]);
  const [coverUrl, setCoverUrl] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
    loadPosts();
    loadPages();
  }, []);

  async function loadStats() {
    try {
      setStatsLoading(true);
      const data = await apiGet("/posts/stats");
      setStats(data);
    } catch {
      // Stats will remain at defaults
    } finally {
      setStatsLoading(false);
    }
  }

  async function loadPosts() {
    try {
      setPostsLoading(true);
      const data = await apiGet("/posts");
      if (data.posts && data.posts.length > 0) {
        const sorted = data.posts
          .filter((p: any) => p.state !== "DRAFT")
          .sort((a: any, b: any) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime());
        const mapped = sorted.slice(0, 10).map((p: any) => {
          let imageUrl: string | null = null;
          try {
            const mediaItems = JSON.parse(p.image || "[]");
            const first = mediaItems[0];
            if (first) imageUrl = typeof first === "string" ? first : first?.path || null;
          } catch { /* ignore */ }
          return {
            id: p._id,
            content: p.content?.slice(0, 60) + (p.content?.length > 60 ? "..." : ""),
            campaign: "",
            platform: p.integrationId?.providerIdentifier || "x",
            platformLabel: PLATFORM_LABELS[p.integrationId?.providerIdentifier] || "Twitter",
            status: p.state,
            date: new Date(p.publishDate).toLocaleString(),
            image: imageUrl,
            releaseURL: p.releaseURL || null,
          };
        });
        setPosts(mapped);
      } else {
        setPosts([]);
      }
    } catch {
      setPosts([]);
    } finally {
      setPostsLoading(false);
    }
  }

  async function loadPages() {
    try {
      const data = await apiGet("/integrations/list");
      const integrations: PageInfo[] = data.integrations || [];
      // Prefer Facebook pages for the Business Suite header
      const fbPages = integrations.filter((i) => i.platform === "facebook");
      const displayPages = fbPages.length > 0 ? fbPages : integrations;
      setPages(displayPages);

      // Fetch cover photo for the first Facebook page
      if (fbPages.length > 0) {
        try {
          const coverData = await apiGet(`/integrations/${fbPages[0].id}/cover`);
          if (coverData?.cover) setCoverUrl(coverData.cover);
        } catch {
          // Cover stays null -> gradient fallback
        }
      }
    } catch {
      // Pages stay empty
    }
  }

  const primaryPage = pages[0];

  return (
    <div className="space-y-8 -mt-8 -mx-10">
      {/* Cover banner */}
      <div className="relative mx-10 mt-8 rounded-2xl overflow-hidden">
        {coverUrl ? (
          <img src={coverUrl} alt="Page cover" className="h-48 w-full object-cover" />
        ) : (
          <div
            className="h-48 w-full"
            style={{
              background: "linear-gradient(120deg, #2f8587 0%, #5fa4a6 55%, #8cc2c3 100%)",
            }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/25 to-transparent" />
      </div>

      {/* Page card overlapping the cover */}
      <div className="px-10">
        <div className="-mt-16 relative rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex flex-wrap items-center gap-5">
            <Avatar className="size-20 ring-4 ring-white shadow-md shrink-0">
              <AvatarImage
                src={
                  primaryPage?.avatar
                    ? primaryPage.avatar
                    : session?.user?.image
                      ? getImageUrl(session.user.image)
                      : undefined
                }
                alt={primaryPage?.name || session?.user?.name || "Page"}
              />
              <AvatarFallback className="bg-teal-50 text-teal-700">
                <UserIcon className="w-8 h-8" />
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight truncate">
                {primaryPage?.name || session?.user?.name || "Your Workspace"}
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                {primaryPage
                  ? `${primaryPage.platform.charAt(0).toUpperCase() + primaryPage.platform.slice(1)} Page · ${primaryPage.status === "active" ? "Connected" : primaryPage.status.replace("_", " ")}`
                  : "Connect an account to start creating and scheduling posts"}
              </p>
              {pages.length > 1 && (
                <div className="flex items-center gap-2 mt-3">
                  {pages.slice(1, 5).map((p) => (
                    <Avatar key={p.id} className="size-8 ring-2 ring-white" title={p.name}>
                      <AvatarImage src={p.avatar || undefined} alt={p.name} />
                      <AvatarFallback className="bg-slate-100 text-slate-500 text-[10px] font-semibold">
                        {p.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                  {pages.length > 5 && (
                    <span className="text-xs font-medium text-slate-500">+{pages.length - 5} more</span>
                  )}
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              <Button onClick={() => navigate("/dashboard/content/create")}>
                <Plus className="w-4 h-4" />
                Create Post
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/analytics")}>
                <BarChart3 className="w-4 h-4" />
                Analytics
              </Button>
              <Button variant="outline" onClick={() => navigate("/dashboard/content/manage")}>
                <FolderKanban className="w-4 h-4" />
                Manage Content
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-10 space-y-8">
        {/* Minimal insights */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Posts this month</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {statsLoading ? "—" : stats.postsThisMonth}
              </span>
              {!statsLoading && stats.postsChange !== 0 && (
                <span className={`text-xs font-medium ${stats.postsChange > 0 ? "text-teal-600" : "text-red-500"}`}>
                  {stats.postsChange > 0 ? "↑" : "↓"} {Math.abs(stats.postsChange)}%
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">By platform</p>
            <div className="mt-2 flex items-center gap-3">
              {statsLoading ? (
                <span className="text-2xl font-bold text-slate-900">—</span>
              ) : Object.keys(stats.postsByPlatform).length > 0 ? (
                Object.entries(stats.postsByPlatform).map(([platform, count]) => (
                  <span key={platform} className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                    <PlatformIcon platform={platform} size={14} />
                    {count}
                  </span>
                ))
              ) : (
                <span className="text-sm text-slate-400">No posts yet</span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white px-5 py-4">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Upcoming</p>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">
                {statsLoading ? "—" : stats.upcomingPosts}
              </span>
              <span className="text-xs text-slate-500">next 7 days</span>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Recent Activity</h2>
            <Button variant="link" size="sm" onClick={() => navigate("/calendar")}>
              View All
            </Button>
          </div>

          <div className="divide-y divide-slate-50">
            {postsLoading ? (
              <div className="px-6 py-8 text-center text-sm text-slate-400">Loading posts...</div>
            ) : posts.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="text-sm text-slate-500 mb-3">No posts yet. Published and scheduled posts will appear here.</p>
                <Button size="sm" onClick={() => navigate("/dashboard/create-post")}>Create your first post</Button>
              </div>
            ) : (
              posts.map((post) => {
                const statusConf = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
                return (
                  <div key={post.id} className="flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50/60 transition-colors">
                    <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {post.image ? (
                        <img src={post.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <PlatformIcon platform={post.platform} size={18} />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-slate-900 truncate">{post.content}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{post.platformLabel} · {post.date}</p>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}>
                      {statusConf.label}
                    </span>
                    {post.releaseURL && (
                      <a
                        href={post.releaseURL}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs font-medium text-teal-600 hover:text-teal-800 transition-colors shrink-0"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View
                      </a>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
