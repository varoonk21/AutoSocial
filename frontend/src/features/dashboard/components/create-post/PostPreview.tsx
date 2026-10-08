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
    <Card className="sticky top-20 rounded-[16px] border border-gray-100 bg-white shadow-xs py-0">
      <CardContent className="p-5 space-y-4">
        {/* Header Title & Desktop/Mobile Segmented Toggle */}
        <div className="flex items-center justify-between pb-1 border-b border-gray-100">
          <h3 className="text-sm font-bold text-[#1c2b36] tracking-tight">
            {pConfig.name} Feed preview
          </h3>

          <ToggleGroup
            type="single"
            value={viewMode}
            onValueChange={(val) => val && onChangeViewMode(val as "desktop" | "mobile")}
            variant="outline"
            size="sm"
            className="bg-gray-50 p-0.5 rounded-xl border border-gray-200"
          >
            <ToggleGroupItem value="desktop" aria-label="Desktop view" title="Desktop view" className="h-7 px-2 text-xs">
              <Monitor className="w-3.5 h-3.5" />
            </ToggleGroupItem>
            <ToggleGroupItem value="mobile" aria-label="Mobile view" title="Mobile view" className="h-7 px-2 text-xs">
              <Smartphone className="w-3.5 h-3.5" />
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Platform Tabs Selector Bar */}
        <div className="flex items-center gap-6 border-b border-gray-100 pb-0.5 px-1 overflow-x-auto">
          {Object.values(PLATFORMS_CONFIG).map((p) => {
            const isActive = activePlatformId === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => onSelectPlatform(p.id)}
                className={`flex items-center gap-2 pb-2 text-xs font-semibold transition-all cursor-pointer relative shrink-0 ${
                  isActive ? "text-[#1c2b36] font-bold" : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {p.id === "facebook" ? (
                  <FacebookLogo className="w-4 h-4 shrink-0" />
                ) : (
                  <InstagramLogo className="w-4 h-4 shrink-0" />
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
