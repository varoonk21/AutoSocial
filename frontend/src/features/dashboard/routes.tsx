import { Route, Routes } from "react-router-dom";
import { Layout } from "./components/Layout";
import { DashboardOverview } from "./pages/DashboardOverview";
import { CreatePost } from "./pages/CreatePost";
import { ScheduledPostsPage } from "./pages/ScheduledPostsPage";
import { DraftsPage } from "./pages/DraftsPage";
import { MediaLibraryPage } from "./pages/MediaLibraryPage";
import { AnalyticsPage } from "./pages/AnalyticsPage";
import { BrandKitPage } from "./pages/BrandKitPage";
import { ConnectedAccountsPage } from "./pages/ConnectedAccountsPage";
import { SettingsPage } from "./pages/SettingsPage";
import { OAuthCallbackPage } from "./pages/OAuthCallbackPage";

export default function DashboardRoutes() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<DashboardOverview />} />
        <Route path="create-post" element={<CreatePost />} />
        <Route path="create-post/:id" element={<CreatePost />} />
        <Route path="scheduled-posts" element={<ScheduledPostsPage />} />
        <Route path="calendar" element={<ScheduledPostsPage />} />
        <Route path="drafts" element={<DraftsPage />} />
        <Route path="media-library" element={<MediaLibraryPage />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="brand-kit" element={<BrandKitPage />} />
        <Route path="connected-accounts" element={<ConnectedAccountsPage />} />
        <Route path="integrations/social/:provider" element={<OAuthCallbackPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
