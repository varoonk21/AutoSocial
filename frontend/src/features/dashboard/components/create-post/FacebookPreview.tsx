import { useState } from "react";
import { Globe, MoreHorizontal, ThumbsUp, MessageSquare, Share2 } from "lucide-react";
import { MediaItem, AccountItem } from "./useCreatePost";

interface PreviewProps {
  account?: AccountItem;
  text: string;
  mediaList: MediaItem[];
}

export function FacebookPreview({ account, text, mediaList }: PreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const name = account?.name || "Auto Social";
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

  const shouldTruncate = text.length > 220;
  const displayText = shouldTruncate && !isExpanded ? text.slice(0, 220) + "..." : text;

  return (
    <div className="bg-background rounded-xl border border-gray-200 shadow-2xs overflow-hidden text-slate-900 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between p-3 pb-2.5">
        <div className="flex items-center gap-2.5">
          <img
            src={avatar}
            alt={name}
            referrerPolicy="no-referrer"
            onError={handleAvatarError}
            className="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
          />
          <div>
            <p className="text-xs font-semibold text-slate-900 leading-tight hover:underline cursor-pointer">{name}</p>
            <div className="flex items-center gap-1 text-[11px] text-slate-400 font-normal mt-0.5">
              <span>Just now</span>
              <span>•</span>
              <Globe className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </div>
        <MoreHorizontal className="w-4 h-4 text-slate-400 cursor-pointer" />
      </div>

      {/* Post Text (Facebook renders text ABOVE media) */}
      <div className="px-3 pb-2.5">
        {text.trim() ? (
          <p className="text-xs text-slate-900 leading-relaxed whitespace-pre-wrap">
            {displayText}
            {shouldTruncate && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="text-xs font-semibold text-slate-500 hover:underline ml-1 cursor-pointer"
              >
                {isExpanded ? "See less" : "See more"}
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

      {/* Media Carousel / Empty State Box */}
      {mediaList.length > 0 ? (
        <div className="bg-black/5 relative overflow-hidden flex items-center justify-center min-h-[200px]">
          <img src={mediaList[0].path} alt="Post media" className="w-full max-h-72 object-cover" />
          {mediaList.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-black/60 px-2 py-1 rounded-full">
              {mediaList.map((_, idx) => (
                <div key={idx} className={`w-1.5 h-1.5 rounded-full ${idx === 0 ? "bg-background" : "bg-background/40"}`} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Empty State Graphic */
        <div className="bg-slate-50 w-full min-h-[160px] flex items-center justify-center p-4 border-t border-b border-gray-100">
          <div className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center relative bg-background/40">
            <svg className="w-10 h-10 text-slate-300" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="8.5" cy="8.5" r="2.5" />
              <path d="M4 19h16l-5-7-4 5-3-4z" />
            </svg>
          </div>
        </div>
      )}

      {/* Facebook Action Bar */}
      <div className="px-3 py-2 border-t border-gray-100 flex items-center justify-around text-xs text-slate-600 font-medium">
        <button type="button" className="flex items-center gap-1.5 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors cursor-pointer text-slate-600">
          <ThumbsUp className="w-3.5 h-3.5 text-slate-500" />
          <span>Like</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors cursor-pointer text-slate-600">
          <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
          <span>Comment</span>
        </button>
        <button type="button" className="flex items-center gap-1.5 hover:bg-slate-50 px-3 py-1 rounded-md transition-colors cursor-pointer text-slate-600">
          <Share2 className="w-3.5 h-3.5 text-slate-500" />
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}
