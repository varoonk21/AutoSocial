import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useIntegrations } from "@/features/dashboard/hooks/useIntegrationQueries";
import { usePosts } from "@/features/dashboard/hooks/usePostQueries";
import { useMedia } from "@/features/dashboard/hooks/useMediaQueries";
import { useBrandKit } from "@/features/dashboard/hooks/useBrandKitQueries";
import { apiGet } from "@/lib/fetcher";

export function LoadingScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { refetch: refetchIntegrations } = useIntegrations();
  const { refetch: refetchPosts } = usePosts();
  const { refetch: refetchMedia } = useMedia();
  const { refetch: refetchBrandKit } = useBrandKit();

  useEffect(() => {
    async function preloadData() {
      try {
        await Promise.all([
          refetchIntegrations(),
          refetchPosts(),
          refetchMedia(),
          refetchBrandKit(),
          queryClient.prefetchQuery({
            queryKey: ["posts", "stats"],
            queryFn: () => apiGet("/posts/stats"),
          }),
        ]);
      } catch (error) {
        console.error("Failed to preload data:", error);
      } finally {
        navigate("/dashboard", { replace: true });
      }
    }

    preloadData();
  }, [navigate, queryClient, refetchIntegrations, refetchPosts, refetchMedia, refetchBrandKit]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-white">
      <div className="text-center space-y-6">
        <div className="mx-auto">
          <img src="/Icon.png" alt="AutoSocial" className="w-16 h-16 object-contain" />
        </div>
        <div className="space-y-4">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-lg font-medium text-slate-900">Loading your workspace</p>
          <p className="text-sm text-slate-500">Fetching your data...</p>
        </div>
      </div>
    </div>
  );
}