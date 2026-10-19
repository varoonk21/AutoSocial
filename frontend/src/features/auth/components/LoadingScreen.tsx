import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/features/dashboard/hooks/queryKeys";
import { apiGet, apiGetPaginated } from "@/lib/fetcher";
import { useSession } from "@/lib/auth-client";
import { useImageStore } from "@/store/imageStore";

interface IntegrationInfo {
  id: string;
  platform: string;
}

export function LoadingScreen() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isPending: sessionPending } = useSession();
  const [dataReady, setDataReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function preloadData() {
      const integrationsPromise = queryClient
        .fetchQuery({
          queryKey: queryKeys.integrations,
          queryFn: () => apiGet<{ integrations: IntegrationInfo[] }>("/integrations/list"),
        })
        .catch(() => null);

      await Promise.allSettled([
        integrationsPromise,
        queryClient.fetchQuery({
          queryKey: queryKeys.postsList(),
          queryFn: () => apiGet("/posts"),
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.mediaList(),
          queryFn: () => apiGetPaginated("/media"),
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.brandKit,
          queryFn: () => apiGet("/brand-kit"),
        }),
        queryClient.fetchQuery({
          queryKey: queryKeys.postsStats,
          queryFn: () => apiGet("/posts/stats"),
        }),
        useImageStore.getState().fetchS3PublicUrl(),
        import("@/features/dashboard/routes"),
      ]);

      const integrations = await integrationsPromise;
      const fbPages = (integrations?.integrations || []).filter((p) => p.platform === "facebook");
      await Promise.allSettled(
        fbPages.map((p) =>
          queryClient.fetchQuery({
            queryKey: queryKeys.integrationCover(p.id),
            queryFn: () => apiGet(`/integrations/${p.id}/cover`),
          })
        )
      );

      if (!cancelled) setDataReady(true);
    }

    preloadData().catch((error) => {
      console.error("Failed to preload data:", error);
      if (!cancelled) setDataReady(true);
    });

    return () => {
      cancelled = true;
    };
  }, [queryClient]);

  useEffect(() => {
    if (dataReady && !sessionPending) {
      navigate("/dashboard", { replace: true });
    }
  }, [dataReady, sessionPending, navigate]);

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
