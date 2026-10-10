import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { PLATFORMS_CONFIG, ShareToPlacement } from "./platformConfig";

interface ShareToCardProps {
  activePlatformId: string;
  shareToPlacements: Record<string, boolean>;
  onTogglePlacement: (placementId: string) => void;
}

export function ShareToCard({
  activePlatformId,
  shareToPlacements,
  onTogglePlacement,
}: ShareToCardProps) {
  const pConfig = PLATFORMS_CONFIG[activePlatformId];
  if (!pConfig || !pConfig.supportsShareTo || pConfig.shareToPlacements.length === 0) {
    return null;
  }

  return (
    <Card className="rounded-[16px] border border-gray-100 bg-background shadow-xs transition-shadow hover:shadow-sm">
      <CardContent className="p-5 sm:p-6 space-y-3">
        <div>
          <h2 className="text-[17px] font-bold text-foreground tracking-tight">Share to</h2>
          <p className="text-xs text-gray-500 font-normal mt-0.5">
            Select additional placements for {pConfig.name}.
          </p>
        </div>

        <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-gray-50/40">
          {pConfig.shareToPlacements.map((placement: ShareToPlacement) => {
            const isChecked = !!shareToPlacements[placement.id];

            return (
              <div
                key={placement.id}
                className="flex items-center justify-between p-3.5 hover:bg-background transition-colors"
              >
                <div>
                  <p className="text-xs font-bold text-gray-900">{placement.label}</p>
                  {placement.sublabel && (
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">{placement.sublabel}</p>
                  )}
                </div>

                <Switch
                  checked={isChecked}
                  onCheckedChange={() => onTogglePlacement(placement.id)}
                />
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
