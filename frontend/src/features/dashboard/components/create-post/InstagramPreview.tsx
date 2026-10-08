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

  const shouldTruncate = text.length > 140;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 140) + "..." : text;

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-2xs overflow-hidden text-gray-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3.5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-pink-500 to-purple-600">
            <img
              src={avatar}
              alt={name}
              referrerPolicy="no-referrer"
              onError={handleAvatarError}
              className="w-full h-full rounded-full object-cover border border-white"
            />
          </div>
          <span className="text-xs font-bold text-gray-900">{name}</span>
        </div>
        <MoreHorizontal className="w-4 h-4 text-gray-500 cursor-pointer" />
      </div>

      {/* Media Image/Video Container */}
      <div className="bg-[#f0f4f8] relative overflow-hidden flex items-center justify-center min-h-[260px] aspect-square border-t border-b border-gray-100">
        {mediaList.length > 0 ? (
          <img src={mediaList[0].path} alt="Post media" className="w-full h-full object-cover" />
        ) : (
          <div className="w-36 h-36 border-4 border-dashed border-gray-300/80 rounded-2xl flex items-center justify-center relative bg-white/30">
            <svg className="w-20 h-20 text-gray-300" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8.5" cy="8.5" r="2.5" />
              <path d="M4 19h16l-5-7-4 5-3-4z" />
            </svg>
          </div>
        )}

        {mediaList.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
            {mediaList.map((_, idx) => (
              <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-white" : "bg-white/40"}`} />
            ))}
          </div>
        )}
      </div>

      {/* Action Row & Caption */}
      <div className="p-3.5 space-y-2.5">
        <div className="flex items-center justify-between text-gray-800">
          <div className="flex items-center gap-3.5">
            <Heart className="w-5 h-5 hover:text-red-500 cursor-pointer transition-colors" />
            <MessageCircle className="w-5 h-5 hover:text-gray-600 cursor-pointer transition-colors" />
            <Send className="w-5 h-5 hover:text-gray-600 cursor-pointer transition-colors" />
          </div>
          <Bookmark className="w-5 h-5 hover:text-gray-600 cursor-pointer transition-colors" />
        </div>

        {/* Caption */}
        <div className="text-xs leading-relaxed text-gray-900">
          <span className="font-bold mr-1.5">{name}</span>
          {text.trim() ? (
            <span>
              {displayText}
              {shouldTruncate && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="text-xs font-semibold text-gray-400 hover:text-gray-600 ml-1 cursor-pointer"
                >
                  {isExpanded ? "less" : "more"}
                </button>
              )}
            </span>
          ) : (
            <div className="space-y-1.5 pt-1">
              <div className="h-2.5 bg-gray-100 rounded-full w-3/4" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
