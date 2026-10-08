import { Monitor, Smartphone } from "lucide-react";
import { PLATFORMS_CONFIG } from "./platformConfig";
import { AccountItem, MediaItem } from "./useCreatePost";
import { FacebookPreview } from "./FacebookPreview";
import { InstagramPreview } from "./InstagramPreview";
import { FacebookLogo, InstagramLogo } from "./PlatformIcons";
import { Card, CardContent } from "@/components/ui/card";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

interface PostPreviewProps {
  activePlatformId: string;
  onSelectPlatform: (platformId: string) => void;
  viewMode: "desktop" | "mobile";
  onChangeViewMode: (mode: "desktop" | "mobile") => void;
  account?: AccountItem;
  text: string;
  mediaList: MediaItem[];
}

export function PostPreview({
  activePlatformId,
  onSelectPlatform,
  viewMode,
  onChangeViewMode,
  account,
  text,
  mediaList,
}: PostPreviewProps) {
  const pConfig = PLATFORMS_CONFIG[activePlatformId] || PLATFORMS_CONFIG.facebook;

  return (
    <Card className="rounded-xl border border-gray-200 bg-white shadow-xs py-0">
      <CardContent className="p-3.5 space-y-3">
        {/* Header Title & Desktop/Mobile Segmented Toggle */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
            {pConfig.name} Feed preview
          </h3>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => val && onChangeViewMode(val as "desktop" | "mobile")}
            variant="outline"
            size="sm"
            className="bg-slate-100 p-0.5 rounded-lg border border-slate-200"
          >
            <ToggleGroupItem value="desktop" aria-label="Desktop view" title="Desktop view" className="h-6.5 px-2 text-xs">
              <Monitor className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Mobile view" title="Mobile view" className="h-6.5 px-2 text-xs">
              <Smartphone className="w-3.5 h-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Platform Tabs Selector Bar */}
        <div className="flex items-center gap-4 border-b border-gray-100 pb-1 px-0.5 overflow-x-auto">
          {Object.values(PLATFORMS_CONFIG).map((p) => {
            const isActive = activePlatformId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlatform(p.id)}
                className={`flex items-center gap-1.5 pb-1 text-xs font-medium transition-all cursor-pointer relative shrink-0 ${
                  isActive ? "text-slate-900 font-semibold" : "text-slate-400 hover:text-slate-600"
                }`}
              >
                {p.id === "facebook" ? (
                  <FacebookLogo className="w-3.5 h-3.5 shrink-0" />
                ) : (
                  <InstagramLogo className="w-3.5 h-3.5 shrink-0" />
                )}
                <span>{p.shortName}</span>

                {isActive && (
                  <div
                    className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full"
                    style={{ backgroundColor: p.color }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Mockup Canvas Container with Adjustable Width */}
        <div className={`mx-auto transition-all duration-300 ${viewMode === "mobile" ? "max-w-[320px]" : "w-full"}`}>
          {activePlatformId === "facebook" && (
            <FacebookPreview account={account} text={text} mediaList={mediaList} />
          )}

          {activePlatformId === "instagram" && (
            <InstagramPreview account={account} text={text} mediaList={mediaList} />
          )}
        </div>
      </CardContent>
    </Card>
  );
}
