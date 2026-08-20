export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500 mt-1">Track your content performance across platforms.</p>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Total Posts</h3>
          <p className="text-3xl font-bold text-gray-900">1,247</p>
          <p className="text-sm text-emerald-600 mt-2">↑ 18% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Total Engagement</h3>
          <p className="text-3xl font-bold text-gray-900">45.2K</p>
          <p className="text-sm text-emerald-600 mt-2">↑ 24% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Followers Growth</h3>
          <p className="text-3xl font-bold text-gray-900">+892</p>
          <p className="text-sm text-emerald-600 mt-2">↑ 8% from last month</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Best Performing Platform</h3>
          <p className="text-3xl font-bold text-gray-900">LinkedIn</p>
          <p className="text-sm text-gray-500 mt-2">6.2% avg engagement</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Engagement Over Time</h3>
        <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
          Analytics charts coming soon
        </div>
      </div>
    </div>
  )
}
