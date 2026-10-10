import { useState } from "react";
import { MessageSquare, Repeat, Heart, BarChart2, Bookmark, MoreHorizontal } from "lucide-react";
import { MediaItem, AccountItem } from "./useCreatePost";

interface PreviewProps {
  account?: AccountItem;
  text: string;
  mediaList: MediaItem[];
}

export function XPreview({ account, text, mediaList }: PreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const name = account?.name || "AutoSocial";
  const handle = account?.handle || "@autosocial";
  const avatar =
    account?.avatar ||
    (account?.internalId
      ? `https://graph.facebook.com/${account.internalId}/picture?type=large`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2F8587&color=fff`);

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (account?.internalId && !img.dataset.triedGraph) {
      img.dataset.triedGraph = "true";
      img.src = `https://graph.facebook.com/${account.internalId}/picture?type=large`;
      return;
    }
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=2F8587&color=fff`;
  };

  const shouldTruncate = text.length > 200;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 200) + "..." : text;

  return (
  return (
    <div className="bg-background rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-slate-900 font-sans">
      {/* Header */}
      <div className="flex items-start justify-between p-3 pb-2">
        <div className="flex items-center gap-2">
          <img
            src={avatar}
            alt={name}
            referrerPolicy="no-referrer"
            onError={handleAvatarError}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
          />
          <div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="font-semibold text-slate-900 hover:underline cursor-pointer">{name}</span>
              <span className="text-slate-400 font-normal">{handle}</span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400 font-normal">Just now</span>
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
      </div>

      {/* Tweet Body Text */}
      <div className="px-3 pb-2.5">
        {text.trim() ? (
          <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
            {displayText}
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-primary-500 hover:underline ml-1 cursor-pointer"
              >
                {isExpanded ? "Show less" : "Show more"}
              </button>
            )}
          </p>
        ) : (
          <div className="space-y-1.5 py-1">
            <div className="h-2 bg-slate-100 rounded-full w-full" />
            <div className="h-2 bg-slate-100 rounded-full w-1/3" />
          </div>
        )}
      </div>

      {/* Media Box */}
      {mediaList.length > 0 ? (
        <div className="px-3 pb-2.5">
          <div className="rounded-lg border border-gray-200 overflow-hidden bg-gray-100 relative max-h-60 flex items-center justify-center">
            <img src={mediaList[0].path} alt="Tweet media" className="w-full max-h-60 object-contain" />
          </div>
        </div>
      ) : (
        <div className="px-3 pb-2.5">
          <div className="bg-slate-50 rounded-lg border border-gray-200/80 h-36 flex items-center justify-center">
            <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative bg-background/40">
              <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="8.5" cy="8.5" r="2.5" />
                <path d="M4 19h16l-5-7-4 5-3-4z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* X Action & Metrics Bar */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-slate-400">
        <span className="flex items-center gap-1.5 hover:text-primary-500 cursor-pointer transition-colors">
          <MessageSquare className="w-3.5 h-3.5" /> 12
        </span>
        <span className="flex items-center gap-1.5 hover:text-primary-500 cursor-pointer transition-colors">
          <Repeat className="w-3.5 h-3.5" /> 5
        </span>
        <span className="flex items-center gap-1.5 hover:text-pink-500 cursor-pointer transition-colors">
          <Heart className="w-3.5 h-3.5" /> 48
        </span>
        <span className="flex items-center gap-1.5 hover:text-primary-500 cursor-pointer transition-colors">
          <BarChart2 className="w-3.5 h-3.5" /> 1.2K
        </span>
        <Bookmark className="w-3.5 h-3.5 hover:text-slate-700 cursor-pointer transition-colors" />
      </div>
    </div>
  );
}
