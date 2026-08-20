import { Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LandingPage } from './components/pages/LandingPage'
import { DashboardOverview } from './components/tabs/DashboardOverview'
import { CreatePost } from './components/tabs/CreatePost'
import { ScheduledPostsPage } from './components/tabs/ScheduledPostsPage'
import { MediaLibraryPage } from './components/tabs/MediaLibraryPage'
import { AnalyticsPage } from './components/tabs/AnalyticsPage'
import { BrandKitPage } from './components/tabs/BrandKitPage'
import { ConnectedAccountsPage } from './components/tabs/ConnectedAccountsPage'
import { SettingsPage } from './components/tabs/SettingsPage'

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LandingPage />} />

      <Route element={<Layout />}>
        <Route path="/" element={<DashboardOverview />} />
        <Route path="/create-post" element={<CreatePost />} />
        <Route path="/scheduled-posts" element={<ScheduledPostsPage />} />
        <Route path="/media-library" element={<MediaLibraryPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/brand-kit" element={<BrandKitPage />} />
        <Route path="/connected-accounts" element={<ConnectedAccountsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
