import { CalendarClock, Loader2, Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComposerActionBarProps {
  primaryDisabled: boolean;
  canSaveDraft: boolean;
  loading: boolean;
  saving: boolean;
  scheduleOn: boolean;
  editingDraft: boolean;
  onCancel: () => void;
  onFinishLater: () => void;
  onPrimary: () => void;
}

export function ComposerActionBar({
  primaryDisabled,
  canSaveDraft,
  loading,
  saving,
  scheduleOn,
  editingDraft,
  onCancel,
  onFinishLater,
  onPrimary,
}: ComposerActionBarProps) {
  return (
    <div className="sticky bottom-0 z-10 flex flex-wrap items-center gap-2 border-t border-gray-200/80 bg-background pt-3 pb-1">
      <Button variant="ghost" size="sm" onClick={onCancel} className="text-gray-600">
        Cancel
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={onFinishLater}
        disabled={saving || !canSaveDraft}
      >
        {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
        <span>{editingDraft ? "Save draft" : "Finish later"}</span>
      </Button>
      <Button
        size="sm"
        onClick={onPrimary}
        disabled={primaryDisabled || loading}
        className="ml-auto bg-foreground hover:bg-foreground/85 text-white"
      >
        {loading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : scheduleOn ? (
          <CalendarClock className="w-3.5 h-3.5" />
        ) : (
          <Send className="w-3.5 h-3.5" />
        )}
        <span>{scheduleOn ? "Schedule" : "Publish"}</span>
      </Button>
    </div>
  );
}
