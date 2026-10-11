import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { AppSidebar } from './Sidebar'
import { useImageStore } from '@/store/imageStore'

export function Layout() {
  const fetchS3PublicUrl = useImageStore((state) => state.fetchS3PublicUrl)
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    fetchS3PublicUrl()
  }, [fetchS3PublicUrl])

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  // The dashboard home renders its own full-bleed cover, so it manages its
  // own padding instead of using the standard content container.
  const isDashboardHome = location.pathname === '/dashboard' || location.pathname === '/dashboard/'

  return (
    <div className="flex min-h-screen bg-white">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-white border-b border-slate-200 flex items-center gap-3 px-4">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          aria-label="Open navigation menu"
          className="w-10 h-10 -ml-2 flex items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100"
        >
          <Menu className="w-5 h-5" />
        </button>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
          aria-label="Go to dashboard"
        >
          <img src="/Icon.png" alt="" className="w-8 h-8 object-contain rounded-lg" />
          <span className="font-bold text-slate-900 tracking-tight">AutoSocial</span>
        </button>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:block">
        <AppSidebar />
      </div>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40 animate-in fade-in duration-150"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
      <div
        className={`lg:hidden fixed inset-y-0 left-0 z-50 w-[260px] transform transition-transform duration-200 ease-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <AppSidebar />
      </div>

      <main className="flex-1 min-w-0 overflow-y-auto pt-14 lg:pt-0">
        {isDashboardHome ? (
          <Outlet />
        ) : (
          <div className="px-4 sm:px-10 py-6 sm:py-8 max-w-[1400px]">
            <Outlet />
          </div>
        )}
      </main>
    </div>
  )
}
