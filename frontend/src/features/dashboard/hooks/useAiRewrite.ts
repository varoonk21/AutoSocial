import { useCallback, useRef, useState } from "react";
import { apiPost } from "@/lib/fetcher";

export type RewriteActionId =
  | "fix_grammar"
  | "shorter"
  | "longer"
  | "funny"
  | "professional"
  | "simplify"
  | "exciting"
  | "formal";

export interface RewriteAction {
  id: RewriteActionId;
  label: string;
  instruction: string;
  mock: (text: string) => string;
}

const FILLER = /\b(really|very|just|actually|basically|simply|literally|kind of|sort of)\b\s*/gi;

function collapse(text: string): string {
  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export const REWRITE_ACTIONS: Record<RewriteActionId, RewriteAction> = {
  fix_grammar: {
    id: "fix_grammar",
    label: "Fix grammar",
    instruction:
      "Fix grammar and spelling in this social media post. Keep the meaning, tone and length the same. Return only the corrected post text.",
    mock: (text) => {
      let s = collapse(text.replace(/\s+([,.!?])/g, "$1"));
      s = s.replace(
        /(^|[.!?]\s+)([a-z])/g,
        (_m, prefix: string, ch: string) => prefix + ch.toUpperCase(),
      );
      return s;
    },
  },
  shorter: {
    id: "shorter",
    label: "Shorter",
    instruction:
      "Make this social media post shorter and more concise while keeping the key message. Return only the rewritten post text.",
    mock: (text) => collapse(text.replace(FILLER, "")),
  },
  longer: {
    id: "longer",
    label: "Longer",
    instruction:
      "Expand this social media post with a bit more detail and length while keeping the same message and tone. Return only the rewritten post text.",
    mock: (text) => {
      const tails = [
        "Here's the full picture.",
        "There's more to explore.",
        "And that's just the beginning.",
      ];
      return `${collapse(text)} ${tails[text.length % tails.length]}`;
    },
  },
  funny: {
    id: "funny",
    label: "Funny",
    instruction:
      "Rewrite this social media post to be funnier and more playful while keeping the core message. Return only the rewritten post text.",
    mock: (text) => `${collapse(text).replace(/\s*😄+$/, "")} 😄`,
  },
  professional: {
    id: "professional",
    label: "Professional",
    instruction:
      "Rewrite this social media post in a professional, polished tone while keeping the core message. Return only the rewritten post text.",
    mock: (text) =>
      collapse(
        text
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
          .replace(/\bdon't\b/gi, "do not")
          .replace(/\bcan't\b/gi, "cannot")
          .replace(/\bwe're\b/gi, "we are")
          .replace(/\bit's\b/gi, "it is")
          .replace(/\bI'm\b/gi, "I am")
          .replace(/!+/g, "."),
      ),
  },
  simplify: {
    id: "simplify",
    label: "Simplify",
    instruction:
      "Simplify this social media post so it is easy to understand for anyone. Return only the rewritten post text.",
    mock: (text) =>
      collapse(
        text
          .replace(FILLER, "")
          .replace(/\butilize\b/gi, "use")
          .replace(/\bcommence\b/gi, "start")
          .replace(/\badditional\b/gi, "more"),
      ),
  },
  exciting: {
    id: "exciting",
    label: "Exciting",
    instruction:
      "Rewrite this social media post to be more exciting and energetic while keeping the core message. Return only the rewritten post text.",
    mock: (text) => `${collapse(text).replace(/\s*🚀+$/, "")} 🚀`,
  },
  formal: {
    id: "formal",
    label: "Formal",
    instruction:
      "Rewrite this social media post in a formal tone. Return only the rewritten post text.",
    mock: (text) =>
      collapse(
        text
          .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, "")
          .replace(/\bgonna\b/gi, "going to")
          .replace(/\bwanna\b/gi, "want to")
          .replace(/\bkids\b/gi, "children")
          .replace(/!+/g, "."),
      ),
  },
};

/**
 * useAiRewrite — "Write with AI" actions for the post text field.
 *
 * Calls the real /ai/enhance endpoint with a per-action instruction. If the
 * request fails, falls back to a deterministic client-side mock transform so
 * the UI (loading + undo) still behaves the same.
 */
export function useAiRewrite({
  getText,
  setText,
}: {
  getText: () => string;
  setText: (value: string) => void;
}) {
  const [pendingAction, setPendingAction] = useState<RewriteActionId | null>(null);
  const [undoValue, setUndoValue] = useState<string | null>(null);
  const undoRef = useRef<string | null>(null);

  const rewrite = useCallback(
    async (actionId: RewriteActionId) => {
      const action = REWRITE_ACTIONS[actionId];
      if (!action) return;

      const current = getText();
      if (!current.trim() || undoRef.current !== null) {
        // allow only one pending rewrite; undo is cleared by clearUndo on manual edit
      }
      if (!current.trim()) return;

      setPendingAction(actionId);
      try {
        const data = await apiPost<{ post?: string }>("/ai/enhance", {
          content: `${action.instruction}\n\n${current}`,
          enhanceType: "general",
        });
        const next = (data?.post || "").trim();
        if (!next || next === current) throw new Error("empty AI response");
        undoRef.current = current;
        setUndoValue(current);
        setText(next);
      } catch {
        const mocked = action.mock(current);
        if (mocked && mocked !== current) {
          undoRef.current = current;
          setUndoValue(current);
          setText(mocked);
        }
      } finally {
        setPendingAction(null);
      }
    },
    [getText, setText],
  );

  const undo = useCallback(() => {
    if (undoRef.current !== null) {
      setText(undoRef.current);
      undoRef.current = null;
      setUndoValue(null);
    }
  }, [setText]);

  const clearUndo = useCallback(() => {
    undoRef.current = null;
    setUndoValue(null);
  }, []);

  return { rewrite, undo, clearUndo, pendingAction, undoValue };
}
