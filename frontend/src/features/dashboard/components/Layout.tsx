import { useEffect } from 'react'
import { Outlet } from 'react-router-dom'
import { AppSidebar } from './Sidebar'
import { useImageStore } from '@/store/imageStore'

export function Layout() {
  const fetchS3PublicUrl = useImageStore((state) => state.fetchS3PublicUrl)

  useEffect(() => {
    fetchS3PublicUrl()
  }, [fetchS3PublicUrl])

  return (
    <div className="flex min-h-screen bg-white">
      <AppSidebar />
      <main className="flex-1 min-w-0 overflow-y-auto">
        <div className="px-10 py-8 max-w-[1400px]">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
