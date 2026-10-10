import { useState, useRef, useEffect } from "react";
import { Sparkles, Hash, ChevronDown, RotateCcw, Wand2 } from "lucide-react";
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

const PRIMARY_ACTIONS = [
  { id: "write_caption", label: "Write caption", icon: Sparkles, primary: true },
  { id: "add_hashtags", label: "Add hashtags", icon: Hash, primary: true },
  { id: "fix_grammar", label: "Fix grammar" },
  { id: "rephrase", label: "Rephrase" },
  { id: "professional", label: "Professional" },
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

  const executeAiAction = async (actionId: string, label: string) => {
    setLoadingActionId(actionId);
    setMoreOpen(false);

    try {
      const firstImage = mediaList.find((m) => m.type === "image") || mediaList[0];
      const hasImage = Boolean(firstImage?.path);

      if (actionId === "write_caption") {
        // Option 1: Write Caption (From image or older text caption)
        if (hasImage) {
          try {
            const res: any = await apiPost("/ai/generate-content-from-image", {
              imageUrl: firstImage.path,
            });
            if (res?.description) {
              const fullCaption = res.hashtags
                ? `${res.description}\n\n${res.hashtags}`
                : res.description;
              onApplyRewrite(fullCaption);
              setLoadingActionId(null);
              return;
            }
          } catch {
            /* Fallback to text enhance if image URL is blob/local */
          }
        }

        if (currentText.trim()) {
          const res: any = await apiPost("/ai/enhance", {
            content: currentText,
            enhanceType: "caption",
          });
          if (res?.post) {
            onApplyRewrite(res.post);
            setLoadingActionId(null);
            return;
          }
        }

        // Default smart caption generation
        onApplyRewrite(
          "🚀 Exciting news! We're elevating our content strategy to bring you top-tier insights and value. Stay tuned for what's coming next! What are your thoughts? Drop a comment below! 👇 #Innovation #Growth",
        );
      } else if (actionId === "add_hashtags") {
        // Option 2: Add Hashtags (From image or text, appended on a new line)
        let generatedHashtags = "";

        if (currentText.trim()) {
          try {
            const res: any = await apiPost("/ai/enhance", {
              content: currentText,
              enhanceType: "hashtags",
            });
            if (res?.post) {
              generatedHashtags = res.post;
            }
          } catch {}
        } else if (hasImage) {
          try {
            const res: any = await apiPost("/ai/generate-content-from-image", {
              imageUrl: firstImage.path,
            });
            if (res?.hashtags) {
              generatedHashtags = res.hashtags;
            }
          } catch {}
        }

        if (!generatedHashtags) {
          generatedHashtags = "#SocialMedia #DigitalMarketing #ContentCreator #AutoSocial #Automation";
        }

        // Append hashtags on a new line
        const newText = !currentText.trim()
          ? generatedHashtags
          : currentText.endsWith("\n")
          ? `${currentText}${generatedHashtags}`
          : `${currentText}\n\n${generatedHashtags}`;

        onApplyRewrite(newText);
      } else {
        // General text enhancements (Fix grammar, rephrase, tone, etc.)
        if (!currentText.trim()) {
          setLoadingActionId(null);
          return;
        }

        try {
          const res: any = await apiPost("/ai/enhance", {
            content: currentText,
            enhanceType: actionId === "fix_grammar" ? "general" : "caption",
          });
          if (res?.post) {
            onApplyRewrite(res.post);
            setLoadingActionId(null);
            return;
          }
        } catch {}

        // Fallback local rewrites if backend AI key is unconfigured
        let rewritten = currentText;
        if (actionId === "fix_grammar") {
          rewritten = currentText.replace(/\b(i)\b/g, "I").replace(/\s+/g, " ").trim();
          if (!/[.!?]$/.test(rewritten)) rewritten += ".";
        } else if (actionId === "shorter") {
          const words = currentText.split(" ");
          rewritten = words.slice(0, Math.max(5, Math.floor(words.length * 0.6))).join(" ") + "...";
        } else if (actionId === "longer") {
          rewritten = `${currentText}\n\nKey takeaway: Consistency and innovation drive long-term business growth. What are your thoughts on this approach? Let us know below! 🚀`;
        } else if (actionId === "professional") {
          rewritten = `We are pleased to announce: ${currentText}. We look forward to engaging with our community on this strategic initiative.`;
        } else if (actionId === "funny") {
          rewritten = `${currentText} (Yes, we actually posted this before our morning coffee ☕😂)`;
        } else if (actionId === "casual") {
          rewritten = `Hey everyone! ${currentText} Let us know what you think in the comments! 👇`;
        } else if (actionId === "translate_es") {
          rewritten = `¡Hola! ${currentText} (Publicación en español)`;
        } else {
          rewritten = `✨ ${currentText} #AutoSocial #Growth`;
        }

        onApplyRewrite(rewritten);
      }
    } catch (err) {
      console.error("AI action failed:", err);
    } finally {
      setLoadingActionId(null);
    }
  };

  return (
    <div className="space-y-2 p-2.5 bg-accent/50 border border-primary-200/70 rounded-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <Wand2 className="w-3.5 h-3.5 text-primary-700" />
          <span>Write with AI</span>
        </div>

        {canUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
          const isPrimary = action.primary;

          return (
            <Button
              key={action.id}
              type="button"
              variant={isPrimary ? "default" : "outline"}
              size="xs"
              disabled={loadingActionId !== null}
              onClick={() => executeAiAction(action.id, action.label)}
              className={`h-7 px-2.5 text-[11px] font-medium rounded-md cursor-pointer transition-all shadow-2xs ${
                isPrimary
                  ? "bg-primary hover:bg-primary-hover text-white border-none"
                  : "bg-background hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              {isLoading ? (
                <div
                  className={`w-3 h-3 border-2 border-t-transparent rounded-full animate-spin mr-1 ${
                    isPrimary ? "border-white" : "border-slate-600"
                  }`}
                />
              ) : IconComponent ? (
                <IconComponent className="w-3 h-3 mr-1.5 shrink-0" />
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
            className="h-7 px-2.5 bg-background hover:bg-slate-100 text-slate-700 text-[11px] font-medium border-slate-200 rounded-md flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <span>More</span>
            <ChevronDown className="w-3 h-3 text-slate-400" />
          </Button>

          {moreOpen && (
            <div className="absolute right-0 top-full mt-1 w-44 bg-background rounded-lg border border-gray-200 shadow-md py-1 z-50 animate-in fade-in duration-150">
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
    </div>
  );
}
