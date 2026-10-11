import { useState, useRef, useEffect } from "react";
import { Sparkles, Hash, ChevronDown, RotateCcw, Wand2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { apiPost } from "../../../../lib/fetcher";
import { MediaItem } from "./useCreatePost";

interface AiQuickActionsProps {
  currentText: string;
  mediaList?: MediaItem[];
  onApplyRewrite: (newText: string) => void;
  onUndo: () => void;
  canUndo: boolean;
}

type EnhanceType =
  | "caption"
  | "hashtags"
  | "general"
  | "fix_grammar"
  | "rephrase"
  | "shorter"
  | "longer"
  | "funny"
  | "casual"
  | "inspirational"
  | "translate_es";

const PRIMARY_ACTIONS = [
  { id: "write_caption", label: "Generate caption", icon: Sparkles, primary: true },
  { id: "add_hashtags", label: "Add hashtags", icon: Hash, primary: true },
  { id: "fix_grammar", label: "Fix grammar" },
  { id: "rephrase", label: "Rephrase" },
];

const MORE_ACTIONS = [
  { id: "shorter", label: "Make shorter" },
  { id: "longer", label: "Make longer" },
  { id: "funny", label: "Funny & witty" },
  { id: "casual", label: "Casual tone" },
  { id: "inspirational", label: "Inspirational" },
  { id: "translate_es", label: "Translate to Spanish" },
];

export function AiQuickActions({
  currentText,
  mediaList = [],
  onApplyRewrite,
  onUndo,
  canUndo,
}: AiQuickActionsProps) {
  const [loadingActionId, setLoadingActionId] = useState<string | null>(null);
  const [moreOpen, setMoreOpen] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const moreRef = useRef<HTMLDivElement>(null);

  // Close "More" dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    }
    if (moreOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [moreOpen]);

  // Calls /ai/enhance-safe — brand-aware, never throws; falls back to
  // templates server-side when the AI key is unconfigured.
  const enhanceSafe = async (content: string, enhanceType: EnhanceType): Promise<string | null> => {
    const res: any = await apiPost("/ai/enhance-safe", { content, enhanceType });
    return res?.suggestion?.trim() || null;
  };

  const executeAiAction = async (actionId: string, label: string) => {
    setLoadingActionId(actionId);
    setMoreOpen(false);
    setAiError(null);

    try {
      const firstImage = mediaList.find((m) => m.type === "image") || mediaList[0];
      const hasImage = Boolean(firstImage?.path);
      const hasText = Boolean(currentText.trim());

      if (actionId === "write_caption") {
        // Caption from the attached image when available
        if (hasImage) {
          const res: any = await apiPost("/ai/generate-content-from-image", {
            imageUrl: firstImage.path,
          });
          const description = res?.description?.trim();
          if (description) {
            const hashtags = res.hashtags?.trim();
            onApplyRewrite(hashtags ? `${description}\n\n${hashtags}` : description);
            return;
          }
        }

        // Otherwise enhance whatever the user already typed
        if (hasText) {
          const suggestion = await enhanceSafe(currentText, "caption");
          if (suggestion) {
            onApplyRewrite(suggestion);
            return;
          }
        }

        setAiError(
          hasImage
            ? "Couldn't generate a caption from this image. Please try again."
            : "Add an image or type a topic first, then generate a caption.",
        );
        return;
      }

      if (actionId === "add_hashtags") {
        if (hasText) {
          const suggestion = await enhanceSafe(currentText, "hashtags");
          if (suggestion) {
            onApplyRewrite(suggestion);
            return;
          }
        } else if (hasImage) {
          const res: any = await apiPost("/ai/generate-content-from-image", {
            imageUrl: firstImage.path,
          });
          if (res?.hashtags?.trim()) {
            onApplyRewrite(res.hashtags.trim());
            return;
          }
        }

        setAiError(
          hasText || hasImage
            ? "Couldn't generate hashtags. Please try again."
            : "Type some content or add an image first to generate hashtags.",
        );
        return;
      }

      // Text refinements (fix grammar, rephrase, tone, length, translate…)
      if (!hasText) {
        setAiError(`Type some content first to use "${label}".`);
        return;
      }

      const suggestion = await enhanceSafe(currentText, actionId as EnhanceType);
      if (suggestion) {
        onApplyRewrite(suggestion);
      } else {
        setAiError(`Couldn't ${label.toLowerCase()} this text. Please try again.`);
      }
    } catch (err: any) {
      console.error("AI action failed:", err);
      setAiError(err?.message || "AI request failed. Please try again.");
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-2 pt-1">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
          <Wand2 className="w-3.5 h-3.5 text-primary" />
          <span>Write with AI</span>
        </div>

        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Undo AI rewrite</span>
          </button>
        )}
      </div>

      {/* Action Buttons Row */}
      <div className="flex flex-wrap items-center gap-1.5">
        {PRIMARY_ACTIONS.map((action) => {
          const isLoading = loadingActionId === action.id;
          const IconComponent = action.icon;

          return (
            <Button
              key={action.id}
              type="button"
              variant="outline"
              size="xs"
              disabled={loadingActionId !== null}
              onClick={() => executeAiAction(action.id, action.label)}
              className="text-slate-600"
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin mr-1" />
              ) : IconComponent ? (
                <IconComponent className="w-3 h-3 mr-1.5 shrink-0 text-primary" />
              ) : null}
              <span>{action.label}</span>
            </Button>
          );
        })}

        {/* More Dropdown */}
        <div className="relative" ref={moreRef}>
          <Button
            type="button"
            variant="outline"
            size="xs"
            disabled={loadingActionId !== null}
            onClick={() => setMoreOpen(!moreOpen)}
          >
            <span>More</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>

          {moreOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-background rounded-lg border border-slate-200 shadow-md py-1 z-50 animate-in fade-in duration-150">
              {MORE_ACTIONS.map((action) => (
                <button
                  key={action.id}
                  type="button"
                  onClick={() => executeAiAction(action.id, action.label)}
                  className="w-full px-3 py-1.5 text-left text-[11px] font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {aiError && (
        <div className="flex items-center gap-1.5 text-xs text-red-600 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{aiError}</span>
        </div>
      )}
    </div>
  );
}
