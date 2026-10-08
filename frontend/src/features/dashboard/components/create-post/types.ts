import type { PLATFORM_COLORS } from "@/constants/platforms";

export type Platform = keyof typeof PLATFORM_COLORS;

export type PreviewPlatform = Platform;

export interface PostMedia {
  path: string;
  type: string;
}

export interface ConnectedAccount {
  _id: string;
  name: string;
  picture?: string;
  providerIdentifier: string;
}

export type CtaButton =
  | ""
  | "shop_now"
  | "book_now"
  | "learn_more"
  | "sign_up"
  | "contact_us"
  | "subscribe";

export type PrivacyOption = "public" | "connections" | "groups" | "specific";

export type ShareToOption = "page" | "profile" | "group" | "story";

export interface PostSettings {
  isAdPost: boolean;
  ctaButton: CtaButton;
  privacy: PrivacyOption;
  shareToStory: boolean;
}

export type ViewMode = "desktop" | "mobile";
