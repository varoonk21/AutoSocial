import type { CtaButton, Platform, PrivacyOption, ShareToOption } from "./types";

export const CTA_OPTIONS: { value: CtaButton; label: string }[] = [
  { value: "", label: "No button" },
  { value: "shop_now", label: "Shop now" },
  { value: "book_now", label: "Book now" },
  { value: "learn_more", label: "Learn more" },
  { value: "sign_up", label: "Sign up" },
  { value: "contact_us", label: "Contact us" },
  { value: "subscribe", label: "Subscribe" },
];

export const PRIVACY_OPTIONS: { value: PrivacyOption; label: string }[] = [
  { value: "public", label: "Public" },
  { value: "connections", label: "Connections only" },
  { value: "groups", label: "Group members" },
  { value: "specific", label: "Specific audience" },
];

export const SHARE_TO_OPTIONS: { value: ShareToOption; label: string }[] = [
  { value: "page", label: "Page" },
  { value: "profile", label: "Personal profile" },
  { value: "group", label: "Group" },
  { value: "story", label: "Story" },
];

export const POST_TEMPLATES: { id: string; label: string; content: string }[] = [
  {
    id: "announcement",
    label: "Announcement",
    content:
      "Big news is here! 🎉\n\nWe're thrilled to share something we've been working on. Stay tuned for all the details — you won't want to miss this.",
  },
  {
    id: "product_launch",
    label: "Product launch",
    content:
      "It's here. 🚀\n\nMeet the newest addition to our lineup — built to make your day easier. Tap the link to explore everything it can do.",
  },
  {
    id: "question",
    label: "Question / poll",
    content:
      "Quick question for you 👇\n\nWhat matters most to you when choosing a product? Drop your answer in the comments — we're listening!",
  },
  {
    id: "event",
    label: "Event",
    content:
      "Save the date 📅\n\nJoin us for an event you won't want to miss. Mark your calendar and let us know if you're in!",
  },
  {
    id: "quote",
    label: "Quote",
    content:
      '"Simplicity is the ultimate sophistication."\n\nSometimes the best ideas are the simplest ones. What do you think?',
  },
];

export const EMOJIS = [
  "😀",
  "😂",
  "😍",
  "🥳",
  "😎",
  "🤔",
  "🙌",
  "👏",
  "🔥",
  "✨",
  "🎉",
  "🚀",
  "💪",
  "❤️",
  "👍",
  "👀",
  "💡",
  "⭐",
  "🌈",
  "☕",
  "📸",
  "🎯",
  "⚡",
  "🏆",
  "🌱",
  "📌",
  "✅",
  "💬",
  "🗓️",
  "🎵",
];

export const SUGGESTED_HASHTAGS = [
  "#instagood",
  "#photooftheday",
  "#business",
  "#marketing",
  "#startup",
  "#entrepreneur",
  "#community",
  "#newlaunch",
  "#trending",
  "#behindthescenes",
];

export const PREVIEW_TITLES: Record<Platform, string> = {
  facebook: "Facebook Feed preview",
  instagram: "Instagram Feed preview",
  linkedin: "LinkedIn Feed preview",
  x: "X Feed preview",
};

export const SCHEDULE_DATE_MIN_OFFSET_MS = 5 * 60 * 1000;
