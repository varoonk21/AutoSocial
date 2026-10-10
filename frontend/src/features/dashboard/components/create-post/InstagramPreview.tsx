import { useState } from "react";
import { Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from "lucide-react";
import { MediaItem, AccountItem } from "./useCreatePost";

interface PreviewProps {
  account?: AccountItem;
  text: string;
  mediaList: MediaItem[];
}

export function InstagramPreview({ account, text, mediaList }: PreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const name = account?.name || "autosocial_app";
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

  const shouldTruncate = text.length > 140;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 140) + "..." : text;

  return (
    <div className="bg-background rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-slate-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3">
        <div className="flex items-center gap-2">
          <img
            src={avatar}
            alt={name}
            referrerPolicy="no-referrer"
            onError={handleAvatarError}
            className="w-7 h-7 rounded-full object-cover border border-gray-200"
          />
          <span className="text-xs font-semibold text-slate-900">{name}</span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
      </div>

      {/* Media Image/Video Container */}
      <div className="bg-slate-50 relative overflow-hidden flex items-center justify-center min-h-[180px] aspect-square border-t border-b border-gray-100">
        {mediaList.length > 0 ? (
          <img src={mediaList[0].path} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative bg-background/40">
            <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8.5" cy="8.5" r="2.5" />
              <path d="M4 19h16l-5-7-4 5-3-4z" />
            </svg>
          </div>
        )}

        {mediaList.length > 1 && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
            {mediaList.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-background" : "bg-background/40"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Action Row & Caption */}
      <div className="p-3 space-y-2">
        <div className="flex items-center justify-between text-slate-700">
          <div className="flex items-center gap-3">
            <Heart className="w-4.5 h-4.5 hover:text-red-500 cursor-pointer transition-colors" />
            <MessageCircle className="w-4.5 h-4.5 hover:text-slate-900 cursor-pointer transition-colors" />
            <Send className="w-4.5 h-4.5 hover:text-slate-900 cursor-pointer transition-colors" />
          </div>
          <Bookmark className="w-4.5 h-4.5 hover:text-slate-900 cursor-pointer transition-colors" />
        </div>

        {/* Caption */}
        <div className="text-xs leading-relaxed text-slate-900">
          <span className="font-semibold mr-1.5">{name}</span>
          {text.trim() ? (
            <span>
              {displayText}
              {shouldTruncate && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-medium text-slate-400 hover:text-slate-600 ml-1 cursor-pointer"
                >
                  {isExpanded ? "less" : "more"}
                </button>
              )}
            </span>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="h-2 bg-slate-100 rounded-full w-3/4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
