import { useState, useRef, useEffect } from "react";
import { Smile, AlertCircle } from "lucide-react";
import { AiQuickActions } from "./AiQuickActions";
import { Card, CardContent } from "@/components/ui/card";
import { MediaItem } from "./useCreatePost";

interface PostDetailsCardProps {
  text: string;
  onChangeText: (text: string) => void;
  mediaList?: MediaItem[];
  isAdPost?: boolean;
  onToggleAdPost?: (val: boolean) => void;
  language?: string;
  onChangeLanguage?: (lang: string) => void;
  maxCharacters: number;
  platformName: string;
  onApplyAiRewrite: (newText: string) => void;
  onUndoAi: () => void;
  canUndoAi: boolean;
  error?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

const EMOJIS = ["✨", "🚀", "🔥", "💡", "🎯", "🎉", "👏", "❤️", "👍", "🙌", "💬", "👇", "🌟", "📈", "😊", "😍", "🥳", "💯", "🔥", "👇", "🤩"];

export function PostDetailsCard({
  text,
  onChangeText,
  mediaList = [],
  isAdPost,
  onToggleAdPost,
  language,
  onChangeLanguage,
  maxCharacters,
  platformName,
  onApplyAiRewrite,
  onUndoAi,
  canUndoAi,
  error,
  cardRef,
}: PostDetailsCardProps) {
  const [emojiOpen, setEmojiOpen] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // Close emoji popover on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setEmojiOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Insert emoji at cursor position
  const insertEmojiAtCursor = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChangeText(text + emoji);
      return;
    }

    const start = textarea.selectionStart ?? text.length;
    const end = textarea.selectionEnd ?? text.length;

    const newText = text.substring(0, start) + emoji + text.substring(end);
    onChangeText(newText);

    // Restore focus and update cursor position after render
    setTimeout(() => {
      textarea.focus();
      const newCursorPos = start + emoji.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  const handleEmojiButtonClick = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.focus();
      // Attempt native OS emoji picker if supported by browser/device
      if ("showPicker" in textarea && typeof (textarea as any).showPicker === "function") {
        try {
          (textarea as any).showPicker();
        } catch {
          // Fallback to custom emoji popover
        }
      }
    }
    setEmojiOpen((prev) => !prev);
  };

  const charCount = text.length;
  const isOverLimit = charCount > maxCharacters;

  return (
    <div ref={cardRef}>
      <Card className="rounded-xl border border-gray-200 bg-white shadow-xs overflow-visible">
        <CardContent className="p-4 space-y-3 overflow-visible">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Post details</h2>
          </div>

          {/* Clean Textarea Container */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Text</label>

            <div
              className={`rounded-lg border transition-all bg-white ${
                error || isOverLimit
                  ? "border-red-500 ring-2 ring-red-100"
                  : "border-gray-200 focus-within:border-[#0A7CFF] focus-within:ring-2 focus-within:ring-[#0A7CFF]/15"
              }`}
            >
              <textarea
                ref={textareaRef}
                rows={4}
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder="Write your post caption here or click Write with AI options below..."
                className="w-full p-3 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed border-none rounded-lg"
              />
            </div>
          </div>

          {/* Under Textarea: Write with AI Component */}
          <AiQuickActions
            currentText={text}
            mediaList={mediaList}
            onApplyRewrite={onApplyAiRewrite}
            onUndo={onUndoAi}
            canUndo={canUndoAi}
          />

          {/* Bottom Row: Emoji Button on Left & Live Character Counter on Right */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="relative" ref={emojiRef}>
              <button
                type="button"
                onClick={handleEmojiButtonClick}
                aria-label="Add feeling or emoji"
                className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <Smile className="w-4 h-4" />
              </button>

              {emojiOpen && (
                <div className="absolute left-0 bottom-full mb-1.5 w-56 bg-white rounded-lg border border-gray-200 shadow-md p-2 z-50 animate-in fade-in duration-150">
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {EMOJIS.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => {
                          insertEmojiAtCursor(emoji);
                          setEmojiOpen(false);
                        }}
                        className="text-sm p-1 hover:bg-slate-100 rounded cursor-pointer transition-transform hover:scale-110"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Live Character Counter */}
            <div className={`text-xs font-medium ${isOverLimit ? "text-red-600" : "text-slate-400"}`}>
              <span>{charCount}</span> / <span>{maxCharacters}</span>
              <span className="ml-1 text-[11px] text-slate-400 font-normal">({platformName})</span>
            </div>
          </div>

          {/* Validation Error Message */}
          {error && (
            <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium pt-0.5">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

