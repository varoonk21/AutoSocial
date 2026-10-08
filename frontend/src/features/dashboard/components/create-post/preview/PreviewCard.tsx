import { useState } from "react";
import {
  Bookmark,
  Globe,
  Heart,
  ImagePlus,
  MessageCircle,
  MessageSquare,
  MoreHorizontal,
  Repeat,
  Send,
  Share2,
  ThumbsUp,
} from "lucide-react";
import type { ConnectedAccount, Platform, PostMedia } from "../types";

interface PreviewCardProps {
  platform: Platform;
  account: ConnectedAccount | null;
  text: string;
  hashtags: string;
  media: PostMedia[];
  ctaLabel: string;
}

function displayName(account: ConnectedAccount | null): string {
  return account?.name || "Select an account to preview";
}

function Avatar({ account, platform }: { account: ConnectedAccount | null; platform: Platform }) {
  if (account?.picture) {
    const rounded = platform === "linkedin" ? "rounded-md" : "rounded-full";
    return <img src={account.picture} alt="" className={`w-9 h-9 object-cover ${rounded}`} />;
  }
  const initials = account ? account.name?.charAt(0)?.toUpperCase() || "?" : "";
  const style: React.CSSProperties =
    platform === "facebook"
      ? { backgroundColor: "#d8dade" }
      : platform === "linkedin"
        ? { backgroundColor: "#0A66C2" }
        : platform === "x"
          ? { backgroundColor: "#000000" }
          : { backgroundColor: "#c9ccd1" };
  return (
    <span
      className={`w-9 h-9 flex items-center justify-center font-bold text-white text-xs ${
        platform === "linkedin" ? "rounded-md" : "rounded-full"
      }`}
      style={style}
    >
      {initials || <span className="w-4 h-4 rounded-full border-2 border-gray-400" />}
    </span>
  );
}

function MediaBlock({ media, platform }: { media: PostMedia[]; platform: Platform }) {
  const [index, setIndex] = useState(0);
  const safeIndex = Math.min(index, Math.max(media.length - 1, 0));

  if (media.length === 0) {
    const isX = platform === "x";
    return (
      <div className={isX ? "px-3.5 pb-3" : ""}>
        <div
          className={`flex flex-col items-center justify-center gap-1.5 bg-gray-50 text-gray-400 ${
            isX
              ? "min-h-[140px] rounded-2xl border border-dashed border-gray-200"
              : "min-h-[160px] border-y border-gray-100"
          }`}
        >
          <ImagePlus className="w-5 h-5" />
          <p className="text-[10px] font-medium">Add a photo or video to see it here</p>
        </div>
      </div>
    );
  }

  const current = media[safeIndex];
  return (
    <div className="relative bg-gray-50">
      <img src={current.path} alt="" className="w-full h-56 object-cover" />
      {media.length > 1 && (
        <div className="absolute bottom-2.5 left-0 right-0 flex items-center justify-center gap-1.5">
          {media.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Media ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`w-1.5 h-1.5 rounded-full transition-colors cursor-pointer ${
                i === safeIndex ? "bg-white" : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CtaBar({ ctaLabel, bordered = true }: { ctaLabel: string; bordered?: boolean }) {
  if (!ctaLabel) return null;
  return (
    <div className="px-3.5 pb-3">
      <div
        className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-gray-700 ${
          bordered ? "border border-gray-300 bg-white" : "bg-gray-100"
        }`}
      >
        {ctaLabel}
        <span aria-hidden>→</span>
      </div>
    </div>
  );
}

function EmptyText({ placeholder }: { placeholder: string }) {
  return <span className="text-gray-300 italic">{placeholder}</span>;
}

function PreviewBody({ platform, account, text, hashtags, media, ctaLabel }: PreviewCardProps) {
  const name = displayName(account);
  const hasAccount = Boolean(account);
  const nameClass = hasAccount ? "text-gray-900" : "text-gray-400";
  const body = text ? (
    <span className="whitespace-pre-wrap">{text}</span>
  ) : (
    <EmptyText
      placeholder={
        platform === "x"
          ? "What's happening?"
          : platform === "linkedin"
            ? "Write your professional post..."
            : "Write your post caption..."
      }
    />
  );
  const tags = hashtags ? (
    <p
      className={`text-[11px] font-medium mt-1 ${platform === "facebook" ? "text-[#1877F2]" : platform === "linkedin" ? "text-[#0A66C2]" : platform === "x" ? "text-blue-500" : "text-indigo-600"}`}
    >
      {hashtags}
    </p>
  ) : null;

  if (platform === "instagram") {
    return (
      <div>
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600 p-[2px]">
              <div className="w-full h-full rounded-full bg-white flex items-center justify-center p-[1px]">
                <div className="w-full h-full rounded-full overflow-hidden bg-[#243746] flex items-center justify-center text-white text-[10px] font-bold">
                  {account?.picture ? (
                    <img src={account.picture} alt="" className="w-full h-full object-cover" />
                  ) : (
                    account?.name?.charAt(0)?.toUpperCase() || (
                      <span className="w-3 h-3 rounded-full border-2 border-gray-400" />
                    )
                  )}
                </div>
              </div>
            </div>
            <span className={`text-xs font-bold ${nameClass}`}>{name}</span>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </div>

        <MediaBlock media={media} platform={platform} />

        <div className="p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-gray-800">
            <div className="flex items-center gap-3.5">
              <Heart className="w-5 h-5" />
              <MessageCircle className="w-5 h-5" />
              <Send className="w-5 h-5" />
            </div>
            <Bookmark className="w-5 h-5" />
          </div>
          <CtaBar ctaLabel={ctaLabel} bordered={false} />
          <div className="text-xs leading-relaxed text-gray-900">
            <span className={`font-bold mr-1.5 ${hasAccount ? "" : "text-gray-400"}`}>{name}</span>
            {body}
            {tags}
          </div>
        </div>
      </div>
    );
  }

  if (platform === "facebook") {
    return (
      <div>
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar account={account} platform={platform} />
            <div>
              <p
                className={`text-xs font-bold leading-tight ${hasAccount ? "text-[#1877F2]" : "text-gray-400"}`}
              >
                {name}
              </p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span>Now</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </div>

        <div className="px-3.5 pb-3 space-y-1">
          <p className="text-xs text-gray-900 leading-relaxed">{body}</p>
          {tags}
        </div>

        <MediaBlock media={media} platform={platform} />
        <CtaBar ctaLabel={ctaLabel} />

        <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-around text-xs text-gray-600 font-medium">
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-md">
            <ThumbsUp className="w-4 h-4 text-gray-500" />
            <span>Like</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-md">
            <MessageSquare className="w-4 h-4 text-gray-500" />
            <span>Comment</span>
          </span>
          <span className="flex items-center gap-1.5 px-3 py-1 rounded-md">
            <Share2 className="w-4 h-4 text-gray-500" />
            <span>Share</span>
          </span>
        </div>
      </div>
    );
  }

  if (platform === "linkedin") {
    return (
      <div>
        <div className="flex items-center justify-between px-3.5 py-3">
          <div className="flex items-center gap-2.5">
            <Avatar account={account} platform={platform} />
            <div>
              <p className={`text-xs font-bold leading-tight ${nameClass}`}>{name}</p>
              <div className="flex items-center gap-1 text-[10px] text-gray-400">
                <span>{hasAccount ? "12,480 followers" : "Followers"}</span>
                <span>•</span>
                <span>Now</span>
                <span>•</span>
                <Globe className="w-2.5 h-2.5" />
              </div>
            </div>
          </div>
          <MoreHorizontal className="w-4 h-4 text-gray-500" />
        </div>

        <div className="px-3.5 pb-3 space-y-1">
          <p className="text-xs text-gray-900 leading-relaxed">{body}</p>
          {tags}
        </div>

        <MediaBlock media={media} platform={platform} />
        <CtaBar ctaLabel={ctaLabel} />

        <div className="px-2 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-medium">
          <span className="flex items-center gap-1 px-2 py-1 rounded">
            <ThumbsUp className="w-3.5 h-3.5 text-gray-500" />
            <span>Like</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded">
            <MessageSquare className="w-3.5 h-3.5 text-gray-500" />
            <span>Comment</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded">
            <Repeat className="w-3.5 h-3.5 text-gray-500" />
            <span>Repost</span>
          </span>
          <span className="flex items-center gap-1 px-2 py-1 rounded">
            <Send className="w-3.5 h-3.5 text-gray-500" />
            <span>Send</span>
          </span>
        </div>
      </div>
    );
  }

  // x
  const handle = account ? `@${account.name.toLowerCase().replace(/[^a-z0-9]+/g, "")}` : null;
  return (
    <div>
      <div className="flex items-center justify-between px-3.5 py-3">
        <div className="flex items-center gap-2.5">
          <Avatar account={account} platform={platform} />
          <div className="flex items-center gap-1 text-xs">
            <span className={`font-bold ${nameClass}`}>{name}</span>
            {handle && <span className="text-gray-400">{handle}</span>}
            <span className="text-gray-400">• Now</span>
          </div>
        </div>
        <span className="font-bold text-black text-xs">𝕏</span>
      </div>

      <div className="px-3.5 pb-3 space-y-1">
        <p className="text-xs text-gray-900 leading-relaxed">{body}</p>
        {tags}
      </div>

      <MediaBlock media={media} platform={platform} />
      <CtaBar ctaLabel={ctaLabel} />

      <div className="px-3.5 py-2.5 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <MessageSquare className="w-3.5 h-3.5" /> 12
        </span>
        <span className="flex items-center gap-1">
          <Repeat className="w-3.5 h-3.5" /> 5
        </span>
        <span className="flex items-center gap-1">
          <Heart className="w-3.5 h-3.5" /> 48
        </span>
        <span className="flex items-center gap-1">
          <Bookmark className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
}

export function PreviewCard({
  platform,
  account,
  text,
  hashtags,
  media,
  ctaLabel,
}: PreviewCardProps) {
  return (
    <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
      <PreviewBody
        platform={platform}
        account={account}
        text={text}
        hashtags={hashtags}
        media={media}
        ctaLabel={ctaLabel}
      />
    </div>
  );
}
