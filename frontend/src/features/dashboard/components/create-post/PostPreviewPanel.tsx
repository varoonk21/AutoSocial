import { Info, Monitor, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { PlatformIcon } from "@/features/dashboard/components/PlatformIcon";
import { PLATFORM_COLORS } from "@/constants/platforms";
import { PREVIEW_TITLES } from "./constants";
import type { ConnectedAccount, Platform, PostMedia, ViewMode } from "./types";
import { PreviewCard } from "./preview/PreviewCard";

interface PostPreviewPanelProps {
  platform: Platform;
  onPlatformChange: (platform: Platform) => void;
  viewMode: ViewMode;
  onViewModeChange: (viewMode: ViewMode) => void;
  account: ConnectedAccount | null;
  text: string;
  hashtags: string;
  media: PostMedia[];
  ctaLabel: string;
}

const TABS: { id: Platform; label: string }[] = [
  { id: "facebook", label: "Facebook" },
  { id: "instagram", label: "Instagram" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "x", label: "X" },
];

export function PostPreviewPanel({
  platform,
  onPlatformChange,
  viewMode,
  onViewModeChange,
  account,
  text,
  hashtags,
  media,
  ctaLabel,
}: PostPreviewPanelProps) {
  return (
    <Card className="py-0">
      <CardContent className="p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-foreground">{PREVIEW_TITLES[platform]}</h3>
          <ToggleGroup
            value={[viewMode]}
            onValueChange={(next) => {
              const value = next[next.length - 1];
              if (value) onViewModeChange(value as ViewMode);
            }}
            variant="outline"
            size="sm"
          >
            <ToggleGroupItem value="desktop" title="Desktop view">
              <Monitor className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" title="Mobile view">
              <Smartphone className="w-3.5 h-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <div className="flex items-center gap-5 border-b border-gray-100 px-1">
          {TABS.map((tab) => {
            const isActive = platform === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onPlatformChange(tab.id)}
                className={`flex items-center gap-1.5 pb-2 text-xs font-semibold transition-colors cursor-pointer relative ${
                  isActive ? "text-foreground" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                <PlatformIcon platform={tab.id} size={13} />
                <span>{tab.label}</span>
                {isActive && (
                  <span
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: PLATFORM_COLORS[tab.id] }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <div
          className={`mx-auto transition-all ${viewMode === "mobile" ? "max-w-[310px]" : "w-full"}`}
        >
          <PreviewCard
            platform={platform}
            account={account}
            text={text}
            hashtags={hashtags}
            media={media}
            ctaLabel={ctaLabel}
          />
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-gray-50 px-3 py-2.5">
          <Info className="w-3.5 h-3.5 text-gray-400 shrink-0 mt-0.5" />
          <p className="text-[10px] leading-relaxed text-gray-500">
            This is a preview of how your post may appear. Final rendering can vary slightly by
            platform and device.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
