import { Send, Calendar, Check, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActionBarProps {
  isScheduleOn: boolean;
  isSaving: boolean;
  lastSaved: Date | null;
  isValid: boolean;
  onCancel: () => void;
  onSaveDraft: () => void;
  onPublish: () => void;
  onOpenMobilePreview?: () => void;
  variant?: "inline" | "fixed";
}

export function ActionBar({
  isScheduleOn,
  isSaving,
  lastSaved,
  isValid,
  onCancel,
  onSaveDraft,
  onPublish,
  onOpenMobilePreview,
  variant = "inline",
}: ActionBarProps) {
  if (variant === "fixed") {
    return (
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200/90 p-3 sm:px-6 shadow-2xl transition-all">
        <div className="max-w-[1320px] mx-auto flex items-center justify-end gap-2">
          {/* Right Action Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {onOpenMobilePreview && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onOpenMobilePreview}
                className="h-8 px-2.5 text-xs font-semibold text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Preview</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onCancel}
              className="h-8 px-2.5 text-xs font-semibold text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer rounded-xl"
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onSaveDraft}
              className="h-8 px-2.5 text-xs font-semibold text-gray-800 border-gray-300 hover:bg-gray-100 cursor-pointer rounded-xl"
            >
              Finish later
            </Button>

            <Button
              type="button"
              size="sm"
              onClick={onPublish}
              disabled={!isValid || isSaving}
              className={`h-8 px-3.5 text-xs font-bold text-white shadow-md transition-all rounded-xl cursor-pointer ${
                !isValid
                  ? "bg-gray-300 text-gray-500 shadow-none cursor-not-allowed"
                  : "bg-[#0A7CFF] hover:bg-[#0066DB] active:scale-[0.98] shadow-blue-500/20"
              }`}
            >
              {isScheduleOn ? (
                <Calendar className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Send className="w-3.5 h-3.5 mr-1" />
              )}
              <span>{isScheduleOn ? "Schedule" : "Publish"}</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Inline Variant (Placed directly under the preview card)
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3 shadow-xs space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Left: Save Status */}
        <div className="flex items-center gap-3">
          {/* Auto-save Draft Status Indicator */}
          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
            {isSaving ? (
              <div className="flex items-center gap-1 text-[#0A7CFF]">
                <div className="w-2.5 h-2.5 border-2 border-[#0A7CFF] border-t-transparent rounded-full animate-spin" />
                <span>Saving...</span>
              </div>
            ) : lastSaved ? (
              <div className="flex items-center gap-1 text-emerald-600 font-semibold">
                <Check className="w-3 h-3 text-emerald-500" />
                <span>Saved just now</span>
              </div>
            ) : null}
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Cancel Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            className="h-8 px-3 text-xs font-semibold text-slate-700 border-gray-300 hover:bg-slate-50 cursor-pointer rounded-lg shadow-none"
          >
            Cancel
          </Button>

          {/* Finish later (Draft) Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onSaveDraft}
            className="h-8 px-3 text-xs font-semibold text-slate-800 border-gray-300 hover:bg-slate-50 cursor-pointer rounded-lg shadow-none"
          >
            Finish later
          </Button>

          {/* Primary Blue (#0A7CFF) Publish/Schedule Button */}
          <Button
            type="button"
            size="sm"
            onClick={onPublish}
            disabled={!isValid || isSaving}
            className={`h-8 px-4 text-xs font-semibold text-white transition-all rounded-lg cursor-pointer ${
              !isValid
                ? "bg-slate-200 text-slate-400 shadow-none cursor-not-allowed"
                : "bg-[#0A7CFF] hover:bg-[#0066DB] shadow-xs"
            }`}
          >
            {isScheduleOn ? (
              <Calendar className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Send className="w-3.5 h-3.5 mr-1.5" />
            )}
            <span>{isScheduleOn ? "Schedule" : "Publish"}</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
