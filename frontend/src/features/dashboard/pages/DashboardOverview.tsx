import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/fetcher";
import { STATUS_CONFIG, PLATFORM_LABELS } from "../../../constants/platforms";
import { PlatformIcon } from "../components/PlatformIcon";
import { Button } from "@/components/ui/button";

const MOCK_POSTS = [
  {
    id: 1,
    content: "Excited to announce our new Q3 features designed to...",
    campaign: "Product Launch Q3",
    platform: "linkedin",
    platformLabel: "LinkedIn",
    status: "PUBLISHED",
    date: "Today, 09:00 AM",
    image: null,
  },
  {
    id: 2,
    content: "5 Tips for maximizing your team's remote productivity...",
    campaign: "Evergreen Tips",
    platform: "x",
    platformLabel: "Twitter",
    status: "QUEUE",
    date: "Tomorrow, 14:30 PM",
    image: null,
  },
  {
    id: 3,
    content: "\"Here is a summary of last week's blog post optimize...",
    campaign: "AI Suggested Draft - Action Required",
    platform: "instagram",
    platformLabel: "Instagram",
    status: "DRAFT",
    date: "",
    image: null,
    isAI: true,
  },
];

export function DashboardOverview() {
  const [posts, setPosts] = useState([]);
  const [stats] = useState({
    postsThisMonth: 142,
    postsChange: 12,
    avgEngagement: 4.8,
    engagementChange: -0.5,
    upcomingPosts: 28,
  });

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    try {
      const data = await apiGet("/posts?state=QUEUE");
      if (data.posts && data.posts.length > 0) {
        const mapped = data.posts.slice(0, 5).map((p) => ({
          id: p._id,
          content: p.content?.slice(0, 60) + "...",
          campaign: "",
          platform: p.integrationId?.providerIdentifier || "x",
          platformLabel: PLATFORM_LABELS[p.integrationId?.providerIdentifier] || "Twitter",
          status: p.state,
          date: new Date(p.publishDate).toLocaleString(),
          image: null,
        }));
        setPosts(mapped);
      } else {
        setPosts(MOCK_POSTS);
      }
    } catch {
      setPosts(MOCK_POSTS);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl  font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-500 mt-1">Welcome back. Here's a snapshot of your content engine.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Posts This Month</span>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a56db"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.postsThisMonth}</span>
            <span className="text-sm font-medium text-emerald-600 mb-1">↑ {stats.postsChange}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Avg. Engagement</span>
            <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#ea580c"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                <polyline points="16 7 22 7 22 13" />
              </svg>
            </div>
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.avgEngagement}%</span>
            <span className="text-sm font-medium text-red-500 mb-1">↓ {Math.abs(stats.engagementChange)}%</span>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-500">Upcoming Posts</span>
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1a56db"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-900">{stats.upcomingPosts}</span>
            <span className="text-sm text-gray-500">Scheduled for next 7 days</span>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Recent Activity Feed</h2>
          <Button variant="link" size="sm">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-100 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          <div className="col-span-6">Post Content</div>
          <div className="col-span-2">Platform</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Date/Time</div>
        </div>

        <div className="divide-y divide-gray-50">
          {posts.map((post) => {
            const statusConf = STATUS_CONFIG[post.status] || STATUS_CONFIG.DRAFT;
            return (
              <div key={post.id} className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-gray-50/50 transition-colors">
                <div className="col-span-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                    {post.image ? (
                      <img src={post.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#9ca3af"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{post.content}</p>
                    <p className={`text-xs mt-0.5 ${post.isAI ? "text-blue-500" : "text-gray-400"}`}>{post.campaign}</p>
                  </div>
                </div>

                <div className="col-span-2 flex items-center gap-2">
                  <div className="w-5 h-5 flex items-center justify-center">
                    <PlatformIcon platform={post.platform} size={16} />
                  </div>
                  <span className="text-sm text-gray-700">{post.platformLabel}</span>
                </div>

                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${statusConf.bg} ${statusConf.text} border ${statusConf.border}`}
                  >
                    {statusConf.label}
                  </span>
                </div>

                <div className="col-span-2 flex items-center justify-end gap-3">
                  <span className="text-sm text-gray-500">{post.date}</span>
                  {post.status === "DRAFT" && <Button size="sm">Review</Button>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
