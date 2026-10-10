import { useEffect, useState } from "react";
import { apiGet } from "../../../lib/fetcher";
import { PlatformIcon } from "../components/PlatformIcon";
import { PLATFORM_LABELS } from "../../../constants/platforms";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

interface AnalyticsData {
  totalPosts: number;
  postsGrowth: number;
  postsByPlatform: Record<string, number>;
  bestPlatform: string | null;
  monthlyPosts: { _id: { year: number; month: number }; count: number }[];
  postsByStatus: Record<string, number>;
  totalDrafts: number;
  totalScheduled: number;
  totalErrors: number;
}

export function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  async function loadAnalytics() {
    try {
      const result = await apiGet("/posts/analytics");
      setData(result);
    } catch {
      // Data stays null
    } finally {
      setLoading(false);
    }
  }

  const totalAcrossAll = data
    ? data.totalPosts + data.totalDrafts + data.totalScheduled + data.totalErrors
    : 0;

  const maxMonthly = data
    ? Math.max(...data.monthlyPosts.map((m) => m.count), 1)
    : 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your content performance across platforms.</p>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-background rounded-xl border border-gray-200 p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-200 rounded w-1/2 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/4" />
            </div>
          ))}
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-background rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Total Posts</h3>
              <p className="text-3xl font-bold text-gray-900">{data.totalPosts.toLocaleString()}</p>
              <p className="text-sm text-gray-500 mt-2">
                {totalAcrossAll.toLocaleString()} total (including drafts, scheduled, errors)
              </p>
              {data.postsGrowth !== 0 && (
                <p className={`text-sm mt-1 ${data.postsGrowth > 0 ? 'text-primary-600' : 'text-red-500'}`}>
                  {data.postsGrowth > 0 ? '↑' : '↓'} {Math.abs(data.postsGrowth)}% from last month
                </p>
              )}
            </div>

            <div className="bg-background rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Posts by Platform</h3>
              {Object.keys(data.postsByPlatform).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(data.postsByPlatform)
                    .sort((a, b) => b[1] - a[1])
                    .map(([platform, count]) => {
                      const pct = data.totalPosts > 0 ? Math.round((count / data.totalPosts) * 100) : 0;
                      return (
                        <div key={platform} className="flex items-center gap-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <PlatformIcon platform={platform} size={16} />
                          </div>
                          <span className="text-sm font-medium text-gray-700 w-20">
                            {PLATFORM_LABELS[platform] || platform}
                          </span>
                          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gray-800 rounded-full"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold text-gray-600 w-12 text-right">{count}</span>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No published posts yet.</p>
              )}
            </div>

            <div className="bg-background rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Post Status Breakdown</h3>
              <div className="space-y-3">
                {[
                  { key: "PUBLISHED", label: "Published", color: "bg-primary-500" },
                  { key: "QUEUE", label: "Scheduled", color: "bg-primary-500" },
                  { key: "DRAFT", label: "Drafts", color: "bg-yellow-500" },
                  { key: "ERROR", label: "Failed", color: "bg-red-500" },
                ].map(({ key, label, color }) => {
                  const count = data.postsByStatus[key] || 0;
                  const pct = totalAcrossAll > 0 ? Math.round((count / totalAcrossAll) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <span className={`w-2.5 h-2.5 rounded-full ${color}`} />
                      <span className="text-sm font-medium text-gray-700 w-20">{label}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-sm font-semibold text-gray-600 w-12 text-right">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-background rounded-xl border border-gray-200 p-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Best Platform</span>
                  {data.bestPlatform ? (
                    <div className="flex items-center gap-2">
                      <PlatformIcon platform={data.bestPlatform} size={14} />
                      <span className="text-sm font-bold text-gray-900">
                        {PLATFORM_LABELS[data.bestPlatform] || data.bestPlatform}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm text-gray-400">—</span>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Drafts</span>
                  <span className="text-sm font-bold text-gray-900">{data.totalDrafts}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Scheduled</span>
                  <span className="text-sm font-bold text-gray-900">{data.totalScheduled}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Failed</span>
                  <span className="text-sm font-bold text-gray-900">{data.totalErrors}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Posts Chart */}
          <div className="bg-background rounded-xl border border-gray-200 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Posts Over Time</h3>
            {data.monthlyPosts.length > 0 ? (
              <div className="flex items-end gap-3 h-48">
                {data.monthlyPosts.map((entry) => {
                  const height = (entry.count / maxMonthly) * 100;
                  const label = MONTH_NAMES[entry._id.month - 1];
                  return (
                    <div key={`${entry._id.year}-${entry._id.month}`} className="flex-1 flex flex-col items-center gap-2">
                      <span className="text-xs font-semibold text-gray-700">{entry.count}</span>
                      <div
                        className="w-full bg-gray-800 rounded-t-md transition-all"
                        style={{ height: `${height}%`, minHeight: entry.count > 0 ? "8px" : "2px" }}
                      />
                      <span className="text-xs text-gray-500">{label}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                Start publishing posts to see trends over time.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="bg-background rounded-xl border border-gray-200 p-12 text-center">
          <p className="text-gray-500">Unable to load analytics data.</p>
        </div>
      )}
    </div>
  );
}
