import { Globe, Lock, Check } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { PLATFORMS_CONFIG } from "./platformConfig";

interface PrivacyCardProps {
  activePlatformId: string;
  privacySetting: "public" | "restricted";
  onChangePrivacy: (setting: "public" | "restricted") => void;
}

export function PrivacyCard({
  activePlatformId,
  privacySetting,
  onChangePrivacy,
}: PrivacyCardProps) {
  const pConfig = PLATFORMS_CONFIG[activePlatformId];
  if (!pConfig || !pConfig.supportsPrivacy) {
    return null; // Shown only for platforms that support privacy (Facebook)
  }

  return (
    <Card className="rounded-[16px] border border-gray-100 bg-background shadow-xs transition-shadow hover:shadow-sm">
      <CardContent className="p-5 sm:p-6 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[17px] font-bold text-foreground tracking-tight">Privacy settings</h2>
            <p className="text-xs text-gray-500 font-normal mt-0.5">
              Control who can see this post on Facebook.
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#1877F2] bg-primary-50 px-2 py-0.5 rounded-md border border-primary-100">
            Facebook only
          </span>
        </div>

        {/* Radio Option Rows */}
        <div className="space-y-2">
          {/* Public Radio Row */}
          <div
            onClick={() => onChangePrivacy("public")}
            className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
              privacySetting === "public"
                ? "bg-primary-50/70 border-primary ring-1 ring-primary/20 shadow-2xs"
                : "bg-background border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${privacySetting === "public" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Public</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Anyone on or off Facebook can see this post.
                </p>
              </div>
            </div>

            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 transition-colors ${
                privacySetting === "public" ? "border-primary bg-primary text-white" : "border-gray-300 bg-background"
              }`}
            >
              {privacySetting === "public" && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>

          {/* Restricted Radio Row */}
          <div
            onClick={() => onChangePrivacy("restricted")}
            className={`flex items-start justify-between p-3.5 rounded-xl border cursor-pointer transition-all ${
              privacySetting === "restricted"
                ? "bg-primary-50/70 border-primary ring-1 ring-primary/20 shadow-2xs"
                : "bg-background border-gray-200 hover:border-gray-300 hover:bg-gray-50/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-lg ${privacySetting === "restricted" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                <Lock className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Restricted</p>
                <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                  Visible only to selected audiences or age groups.
                </p>
              </div>
            </div>

            <div
              className={`w-4 h-4 rounded-full border flex items-center justify-center mt-1 transition-colors ${
                privacySetting === "restricted" ? "border-primary bg-primary text-white" : "border-gray-300 bg-background"
              }`}
            >
              {privacySetting === "restricted" && <Check className="w-3 h-3 stroke-[3]" />}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
