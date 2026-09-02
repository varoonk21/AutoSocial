import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { AppSidebar } from './Sidebar'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'

export function Layout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
