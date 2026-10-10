import { useRef } from "react";
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Focus the editor so the user can open their native OS emoji picker
  // (Win + . on Windows, Ctrl + Cmd + Space on Mac)
  const handleEmojiButtonClick = () => {
    textareaRef.current?.focus();
  };

  const charCount = text.length;
  const isOverLimit = charCount > maxCharacters;

  return (
    <div ref={cardRef}>
      <Card className="rounded-xl border border-gray-200 bg-background shadow-xs overflow-visible">
        <CardContent className="p-4 space-y-3 overflow-visible">
          {/* Section Header */}
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Post details</h2>
          </div>

          {/* Clean Textarea Container */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Text</label>

            <div
              className={`rounded-lg border transition-all bg-background ${
                error || isOverLimit
                  ? "border-red-500 ring-2 ring-red-100"
                  : "border-gray-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
              }`}
            >
              <textarea
                ref={textareaRef}
                rows={4}
                value={text}
                onChange={(e) => onChangeText(e.target.value)}
                placeholder="Write your post caption here or click Write with AI options below..."
                className="w-full p-3 pb-1 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed border-none rounded-t-lg"
              />

              {/* Input Footer Inside Text Field: Emoji Button & Live Character Counter */}
              <div className="flex items-center justify-between px-2 pb-1.5">
                <button
                  type="button"
                  onClick={handleEmojiButtonClick}
                  aria-label="Add emoji (Win + . / Ctrl + Cmd + Space)"
                  title="Emoji (Win + . / Ctrl + Cmd + Space)"
                  className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <Smile className="w-4 h-4" />
                </button>

                <div className={`text-xs font-medium pr-1.5 ${isOverLimit ? "text-red-600" : "text-slate-400"}`}>
                  <span>{charCount}</span> / <span>{maxCharacters}</span>
                  <span className="ml-1 text-[11px] text-slate-400 font-normal">({platformName})</span>
                </div>
              </div>
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

