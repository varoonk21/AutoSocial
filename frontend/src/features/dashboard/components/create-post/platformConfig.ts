export interface PlatformConfig {
  id: string;
  name: string;
  shortName: string;
  badge: string;
  color: string;
  bgGradient?: string;
  maxCharacters: number;
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
    mediaRules: {
      maxFiles: 10,
      allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
      maxSizeMB: 100,
      recommendedAspect: "1:1 or 4:5",
    },
  },
  x: {
    id: "x",
    name: "X",
    shortName: "X",
    badge: "𝕏",
    color: "#000000",
    maxCharacters: 280,
    mediaRules: {
      maxFiles: 4,
      allowedTypes: ["image/jpeg", "image/png", "image/webp", "video/mp4"],
      maxSizeMB: 100,
      recommendedAspect: "16:9 or 1:1",
    },
  },
  linkedin: {
    id: "linkedin",
    name: "LinkedIn",
    shortName: "LinkedIn",
    badge: "in",
    color: "#0A66C2",
    maxCharacters: 3000,
    mediaRules: {
      maxFiles: 9,
      allowedTypes: ["image/jpeg", "image/png", "video/mp4"],
      maxSizeMB: 100,
      recommendedAspect: "1.91:1 or 1:1",
    },
  },
};

export const DEFAULT_PLATFORM_ID = "facebook";
