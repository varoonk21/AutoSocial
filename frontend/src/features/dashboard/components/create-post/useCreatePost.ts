import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../../../lib/fetcher";
import { PLATFORMS_CONFIG, DEFAULT_PLATFORM_ID } from "./platformConfig";

export interface AccountItem {
  id: string;
  internalId?: string;
  name: string;
  provider: string; // "facebook" | "instagram" | "linkedin" | "x"
  handle?: string;
  avatar?: string;
  badge?: string;
}

export interface MediaItem {
  id: string;
  path: string;
  type: "image" | "video";
  name?: string;
  sizeMB?: number;
  error?: string;
}

export interface ValidationErrors {
  accounts?: string;
  content?: string;
  media?: string;
  schedule?: string;
}

export function useCreatePost() {
  const navigate = useNavigate();
  const { id: draftIdParam } = useParams<{ id?: string }>();
  const [searchParams] = useSearchParams();
  // Preset date/time from Schedule page (e.g. ?date=2026-10-15&time=14:00)
  const presetDate = searchParams.get("date");
  const presetTime = searchParams.get("time");
  // Preset media from Media Library (e.g. ?mediaPath=...&mediaType=image)
  const presetMediaPath = searchParams.get("mediaPath");
  const presetMediaType = searchParams.get("mediaType") as "image" | "video" | null;

  // Accounts state
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Media state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Post details state
  const [text, setText] = useState("");
  const [undoHistory, setUndoHistory] = useState<string[]>([]);

  // Schedule state
  const [isScheduleOn, setIsScheduleOn] = useState(!!presetDate);
  const [scheduleDate, setScheduleDate] = useState<string>(
    presetDate || new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );
  const [scheduleTime, setScheduleTime] = useState(presetTime || "10:00");

  // Action Bar state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(draftIdParam || null);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

  // Preview state
  const [activePreviewPlatform, setActivePreviewPlatform] = useState<string>(DEFAULT_PLATFORM_ID);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [isPreviewDrawerOpen, setIsPreviewDrawerOpen] = useState(false);

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [toastMessage, setToastMessage] = useState<{
    type: "success" | "error" | "info";
    text: string;
  } | null>(null);

  // Auto-save tracking refs
  const lastSavedContentRef = useRef("");
  const hasChangesRef = useRef(false);

  // Section refs for scroll-to-error
  const cardRefs = {
    accounts: useRef<HTMLDivElement>(null),
    media: useRef<HTMLDivElement>(null),
    postDetails: useRef<HTMLDivElement>(null),
    schedule: useRef<HTMLDivElement>(null),
  };

  // Fetch connected accounts from backend. No fallback data: when nothing
  // is connected, the composer shows its "Connect account" empty state.
  useEffect(() => {
    setLoadingAccounts(true);
    apiGet("/integrations/list")
      .then((data: any) => {
        const list = data.integrations || [];
        const mapped = list.map((acc: any) => {
          const provider = (acc.platform || "facebook").toLowerCase();
          let avatarUrl = acc.avatar;
          if (!avatarUrl && acc.targetId && (provider === "facebook" || provider === "instagram")) {
            avatarUrl = `https://graph.facebook.com/${acc.targetId}/picture?type=large`;
          }
          if (!avatarUrl) {
            avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name || "User")}&background=2F8587&color=fff`;
          }

          return {
            id: acc.id,
            internalId: acc.targetId,
            name: acc.name || "Connected Account",
            provider,
            handle: "@" + (acc.name || "account").toLowerCase().replace(/\s+/g, ""),
            avatar: avatarUrl,
          };
        });
        setAccounts(mapped);
        if (mapped.length > 0) setSelectedAccountIds([mapped[0].id]);
      })
      .catch(() => {
        setAccounts([]);
      })
      .finally(() => setLoadingAccounts(false));
  }, []);

  // Update active preview platform when account selection changes
  useEffect(() => {
    if (selectedAccountIds.length > 0) {
      const primaryAcc = accounts.find((a) => a.id === selectedAccountIds[0]);
      if (primaryAcc && PLATFORMS_CONFIG[primaryAcc.provider]) {
        setActivePreviewPlatform(primaryAcc.provider);
      }
    }
  }, [selectedAccountIds, accounts]);

  // Load draft if draftId is in URL
  useEffect(() => {
    if (draftIdParam) {
      apiGet(`/posts/${draftIdParam}`)
        .then((data: any) => {
          const draft = data.post;
          if (draft) {
            setEditingDraftId(draft._id);
            setText(draft.content || "");
            try {
              const media = JSON.parse(draft.image || "[]");
              if (Array.isArray(media) && media.length > 0) {
                setMediaList(
                  media.map((m: any, idx: number) => ({
                    id: `media_${idx}_${Date.now()}`,
                    path: typeof m === "string" ? m : m.path,
                    type: "image",
                  })),
                );
              }
            } catch {}
          }
        })
        .catch(() => {});
    }

    // Preset media from Media Library "Use in Post"
    if (presetMediaPath) {
      setMediaList([
        {
          id: `media_preset_${Date.now()}`,
          path: presetMediaPath,
          type: presetMediaType === "video" ? "video" : "image",
        },
      ]);
    }
  }, [draftIdParam]);

  // Track content signature for auto-save
  const currentSignature = `${text}|||${mediaList.map((m) => m.path).join(",")}`;

  useEffect(() => {
    if (currentSignature !== lastSavedContentRef.current && (text.trim() || mediaList.length > 0)) {
      hasChangesRef.current = true;
    }
  }, [currentSignature, text, mediaList]);

  // Auto-save routine
  const autoSave = useCallback(async () => {
    if (!hasChangesRef.current || (!text.trim() && mediaList.length === 0)) return;

    setIsSaving(true);
    try {
      const postData = {
        content: text,
        media: mediaList.map((m) => ({ path: m.path, type: m.type })),
      };

      if (editingDraftId) {
        await apiPut(`/posts/${editingDraftId}`, postData);
      } else {
        const res: any = await apiPost("/posts", {
          type: "draft",
          posts: [{ content: text, settings: {}, media: postData.media }],
        });
        if (res?.posts?.[0]?._id) {
          setEditingDraftId(res.posts[0]._id);
          window.history.replaceState(null, "", `/dashboard/content/create/${res.posts[0]._id}`);
        }
      }

      lastSavedContentRef.current = currentSignature;
      hasChangesRef.current = false;
      setLastSaved(new Date());
    } catch (err) {
      console.error("Auto-save failed:", err);
    } finally {
      setIsSaving(false);
    }
  }, [text, mediaList, editingDraftId, currentSignature]);

  // Interval for auto-save
  useEffect(() => {
    const interval = setInterval(() => {
      if (hasChangesRef.current) {
        autoSave();
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [autoSave]);

  // Multi-select toggle account
  const toggleAccount = (id: string) => {
    setSelectedAccountIds((prev) => {
      if (prev.includes(id)) {
        if (prev.length === 1) return prev; // Keep at least one or allow empty with validation error
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
    setValidationErrors((prev) => ({ ...prev, accounts: undefined }));
  };

  // Add media
  const addMedia = (item: Omit<MediaItem, "id">) => {
    const newMedia: MediaItem = {
      ...item,
      id: `med_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    };
    setMediaList((prev) => [...prev, newMedia]);
    setValidationErrors((prev) => ({ ...prev, content: undefined, media: undefined }));
  };

  // Remove media
  const removeMedia = (id: string) => {
    setMediaList((prev) => prev.filter((m) => m.id !== id));
  };

  // Reorder media
  const reorderMedia = (startIndex: number, endIndex: number) => {
    setMediaList((prev) => {
      const result = Array.from(prev);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return result;
    });
  };

  // AI text rewrites
  const applyAiRewrite = (newText: string) => {
    setUndoHistory((prev) => [...prev, text]);
    setText(newText);
    setToastMessage({ type: "info", text: "Text updated with AI" });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const undoAiRewrite = () => {
    if (undoHistory.length === 0) return;
    const prevText = undoHistory[undoHistory.length - 1];
    setUndoHistory((prev) => prev.slice(0, -1));
    setText(prevText);
    setToastMessage({ type: "info", text: "AI edit undone" });
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Toast notification helper
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastMessage({ type, text: message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Character limit that actually binds: the strictest limit among the
  // selected accounts (e.g. X's 280 beats Facebook's 63,206). Publishing
  // over a platform's limit fails server-side, so enforce it here.
  const effectiveMaxChars = (() => {
    const selected = accounts.filter((a) => selectedAccountIds.includes(a.id));
    if (selected.length === 0) {
      const fallback = PLATFORMS_CONFIG[activePreviewPlatform] || PLATFORMS_CONFIG.facebook;
      return { limit: fallback.maxCharacters, platform: fallback.name };
    }
    let strictest = PLATFORMS_CONFIG[selected[0].provider] || PLATFORMS_CONFIG.facebook;
    for (const acc of selected) {
      const cfg = PLATFORMS_CONFIG[acc.provider];
      if (cfg && cfg.maxCharacters < strictest.maxCharacters) strictest = cfg;
    }
    return { limit: strictest.maxCharacters, platform: strictest.name };
  })();

  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (selectedAccountIds.length === 0) {
      errors.accounts = "Please select at least one social account to post to.";
    }

    if (!text.trim() && mediaList.length === 0) {
      errors.content = "Please enter some text or add a photo/video before publishing.";
    } else if (text.length > effectiveMaxChars.limit) {
      errors.content = `Text is ${text.length - effectiveMaxChars.limit} characters over the ${effectiveMaxChars.platform} limit (${effectiveMaxChars.limit}). Shorten it or remove ${effectiveMaxChars.platform} from the selected accounts.`;
    }

    if (isScheduleOn && (!scheduleDate || !scheduleTime)) {
      errors.schedule = "Please specify a valid date and time for scheduling.";
    }

    setValidationErrors(errors);

    if (Object.keys(errors).length > 0) {
      // Scroll to first problem card
      if (errors.accounts && cardRefs.accounts.current) {
        cardRefs.accounts.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (errors.content && cardRefs.postDetails.current) {
        cardRefs.postDetails.current.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (errors.schedule && cardRefs.schedule.current) {
        cardRefs.schedule.current.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return false;
    }

    return true;
  };

  // Publish / Schedule action
  const handlePublish = async (actionType: "publish" | "draft" | "schedule") => {
    if (actionType === "publish" || actionType === "schedule") {
      if (!validateForm()) return;
    }

    setIsSaving(true);
    try {
      const fullContent = text;
      const mediaPayload = mediaList.map((m) => ({ path: m.path, type: m.type }));

      if (actionType === "draft") {
        if (editingDraftId) {
          await apiPut(`/posts/${editingDraftId}`, { content: fullContent, media: mediaPayload });
        } else {
          await apiPost("/posts", {
            type: "draft",
            posts: [{ content: fullContent, settings: {}, media: mediaPayload }],
          });
        }
        showToast("success", "Draft saved successfully!");
      } else {
        const scheduledAt = isScheduleOn ? new Date(`${scheduleDate}T${scheduleTime}:00`) : null;
        if (scheduledAt && Number.isNaN(scheduledAt.getTime())) {
          showToast("error", "Please specify a valid date and time for scheduling.");
          setIsSaving(false);
          return;
        }

        const posts = selectedAccountIds.map((integrationId) => ({
          integrationId,
          content: fullContent,
          settings: {
            scheduledFor: scheduledAt ? scheduledAt.toISOString() : undefined,
          },
          media: mediaPayload,
        }));

        await apiPost("/posts", {
          type: isScheduleOn ? "schedule" : "now",
          date: scheduledAt ? scheduledAt.toISOString() : undefined,
          posts,
        });

        showToast(
          "success",
          isScheduleOn
            ? `Post scheduled for ${scheduleDate} at ${scheduleTime}!`
            : "Post published successfully to selected platforms!",
        );

        // Reset form after publish
        setText("");
        setMediaList([]);
        setUndoHistory([]);
        setEditingDraftId(null);
        hasChangesRef.current = false;
        lastSavedContentRef.current = "";
      }
    } catch (err: any) {
      showToast("error", err?.message || "Failed to submit post. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  // Cancel action — opens the discard-changes dialog (rendered by the page)
  const handleCancel = () => {
    if (hasChangesRef.current || text.trim() || mediaList.length > 0) {
      setConfirmCancelOpen(true);
    } else {
      navigate("/dashboard");
    }
  };

  const confirmCancel = () => {
    setConfirmCancelOpen(false);
    navigate("/dashboard");
  };

  const selectedAccounts = accounts.filter((a) => selectedAccountIds.includes(a.id));
  const activePlatformConfig = PLATFORMS_CONFIG[activePreviewPlatform] || PLATFORMS_CONFIG.facebook;

  return {
    // Accounts
    accounts,
    selectedAccountIds,
    selectedAccounts,
    loadingAccounts,
    toggleAccount,

    // Media
    mediaList,
    addMedia,
    removeMedia,
    reorderMedia,

    // Details
    text,
    setText,
    applyAiRewrite,
    undoAiRewrite,
    canUndoAi: undoHistory.length > 0,
    effectiveMaxChars,

    // Schedule
    isScheduleOn,
    setIsScheduleOn,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,

    // Action Bar & Save
    isSaving,
    lastSaved,
    handlePublish,
    handleCancel,
    confirmCancelOpen,
    setConfirmCancelOpen,
    confirmCancel,

    // Preview
    activePreviewPlatform,
    setActivePreviewPlatform,
    viewMode,
    setViewMode,
    isPreviewDrawerOpen,
    setIsPreviewDrawerOpen,
    activePlatformConfig,

    // Validation & Toast
    validationErrors,
    toastMessage,
    cardRefs,
  };
}
