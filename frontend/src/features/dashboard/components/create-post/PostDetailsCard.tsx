import { useRef } from "react";
import { AlertCircle } from "lucide-react";
import { AiQuickActions } from "./AiQuickActions";
import { Card, CardContent } from "@/components/ui/card";
import { MediaItem } from "./useCreatePost";

interface PostDetailsCardProps {
  text: string;
  onChangeText: (text: string) => void;
  mediaList?: MediaItem[];
  maxCharacters: number;
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
  maxCharacters,
  onApplyAiRewrite,
  onUndoAi,
  canUndoAi,
  error,
  cardRef,
}: PostDetailsCardProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const charCount = text.length;
  const isOverLimit = charCount > maxCharacters;

  return (
    <div ref={cardRef}>
      <Card className="rounded-xl border border-slate-200 bg-white shadow-xs overflow-visible">
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
                  : "border-slate-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/15"
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

              {/* Input Footer: Live Character Counter */}
              <div className="flex items-center justify-end px-2 pb-1.5">
                <div className={`text-xs font-medium pr-1.5 ${isOverLimit ? "text-red-600" : "text-slate-400"}`}>
                  <span>{charCount}</span>
                  <span className="text-slate-300"> / </span>
                  <span>{maxCharacters}</span>
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

