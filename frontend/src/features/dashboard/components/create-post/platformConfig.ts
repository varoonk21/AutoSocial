export interface ShareToPlacement {
  id: string;
  label: string;
  sublabel?: string;
  defaultChecked: boolean;
}

export interface PlatformConfig {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  bgGradient?: string;
  maxCharacters: number;
  supportsPrivacy: boolean;
  supportsShareTo: boolean;
  shareToPlacements: ShareToPlacement[];
  mediaRules: {
    maxFiles: number;
    allowedTypes: string[];
    maxSizeMB: number;
    recommendedAspect: string;
  };
}

export const PLATFORMS_CONFIG: Record<string, PlatformConfig> = {
  facebook: {
    id: "facebook",
    name: "Facebook",
    shortName: "Facebook",
    badge: "f",
    color: "#1877F2",
    maxCharacters: 63206,
    supportsPrivacy: true,
    supportsShareTo: true,
    shareToPlacements: [
      { id: "fb_feed", label: "Facebook feed", sublabel: "Public", defaultChecked: true },
      { id: "fb_story", label: "Facebook story", sublabel: "Public · 24 hrs", defaultChecked: false },
    ],
    mediaRules: {
      maxFiles: 10,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
      maxSizeMB: 100,
      recommendedAspect: "1.91:1 or 1:1",
    },
  },
  instagram: {
    id: "instagram",
    name: "Instagram",
    shortName: "Instagram",
    badge: "📷",
    color: "#E4405F",
    bgGradient: "linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)",
    maxCharacters: 2200,
    supportsPrivacy: false,
    supportsShareTo: true,
    shareToPlacements: [
      { id: "ig_feed", label: "Instagram feed", sublabel: "Main profile grid", defaultChecked: true },
      { id: "ig_story", label: "Instagram story", sublabel: "Disappears after 24h", defaultChecked: false },
      { id: "ig_reels", label: "Instagram reels", sublabel: "For video posts", defaultChecked: false },
    ],
    mediaRules: {
      maxFiles: 10,
      allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
      maxSizeMB: 100,
      recommendedAspect: "1:1 or 4:5",
    },
  },
};

export const DEFAULT_PLATFORM_ID = "facebook";
