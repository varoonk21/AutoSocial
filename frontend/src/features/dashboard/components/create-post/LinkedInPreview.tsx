import { useState } from "react";
import { Globe, MoreHorizontal, ThumbsUp, MessageSquare, Repeat, Send } from "lucide-react";
import { MediaItem, AccountItem } from "./useCreatePost";

interface PreviewProps {
  account?: AccountItem;
  text: string;
  mediaList: MediaItem[];
}

export function LinkedInPreview({ account, text, mediaList }: PreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const name = account?.name || "AutoSocial Technologies";
  const avatar =
    account?.avatar ||
    (account?.internalId
      ? `https://graph.facebook.com/${account.internalId}/picture?type=large`
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A7CFF&color=fff`);

  const handleAvatarError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const img = e.currentTarget;
    if (account?.internalId && !img.dataset.triedGraph) {
      img.dataset.triedGraph = "true";
      img.src = `https://graph.facebook.com/${account.internalId}/picture?type=large`;
      return;
    }
    img.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=0A7CFF&color=fff`;
  };

  const shouldTruncate = text.length > 200;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 200) + "..." : text;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden text-gray-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5 pb-2">
        <div className="flex items-center gap-2.5">
          <img
            src={avatar}
            alt={name}
            referrerPolicy="no-referrer"
            onError={handleAvatarError}
            className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
          />
          <div>
            <p className="text-xs font-bold text-gray-900 leading-tight hover:underline cursor-pointer">{name}</p>
            <div className="flex items-center gap-1 text-[10px] text-gray-500 font-normal mt-0.5">
              <span>12,480 followers</span>
              <span>•</span>
              <span>Just now</span>
              <span>•</span>
              <Globe className="w-2.5 h-2.5 text-gray-400" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
      </div>

      {/* Text (LinkedIn renders text ABOVE media) */}
      <div className="px-3.5 pb-3">
        {text.trim() ? (
          <p className="text-xs text-gray-900 leading-relaxed whitespace-pre-wrap">
            {displayText}
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-bold text-[#0A66C2] hover:underline ml-1 cursor-pointer"
              >
                {isExpanded ? "...see less" : "...see more"}
              </button>
            )}
          </p>
        ) : (
          <div className="space-y-2 py-1">
            <div className="h-2.5 bg-gray-100 rounded-full w-full" />
            <div className="h-2.5 bg-gray-100 rounded-full w-1/3" />
          </div>
        )}
      </div>

      {/* Media Box / Empty State */}
      {mediaList.length > 0 ? (
        <div className="bg-gray-100 relative overflow-hidden flex items-center justify-center min-h-[220px]">
          <img src={mediaList[0].path} alt="Post media" className="w-full max-h-80 object-cover" />
        </div>
      ) : (
        <div className="bg-[#f0f4f8] w-full min-h-[260px] flex items-center justify-center p-8 border-t border-b border-gray-100">
          <div className="w-36 h-36 border-4 border-dashed border-gray-300/80 rounded-2xl flex items-center justify-center relative bg-white/30">
            <svg className="w-20 h-20 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8.5" cy="8.5" r="2.5" />
              <path d="M4 19h16l-5-7-4 5-3-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* LinkedIn Actions */}
      <div className="px-2 py-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600 font-semibold">
        <button type="button" className="flex items-center gap-1 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors cursor-pointer text-gray-600">
          <ThumbsUp className="w-4 h-4 text-gray-500" />
          <span>Like</span>
        </button>
        <button type="button" className="flex items-center gap-1 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors cursor-pointer text-gray-600">
          <MessageSquare className="w-4 h-4 text-gray-500" />
          <span>Comment</span>
        </button>
        <button type="button" className="flex items-center gap-1 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors cursor-pointer text-gray-600">
          <Repeat className="w-4 h-4 text-gray-500" />
          <span>Repost</span>
        </button>
        <button type="button" className="flex items-center gap-1 hover:bg-gray-100 px-2.5 py-1.5 rounded transition-colors cursor-pointer text-gray-600">
          <Send className="w-4 h-4 text-gray-500" />
          <span>Send</span>
        </button>
      </div>
    </div>
  );
}
