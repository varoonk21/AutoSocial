import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiGet, apiPost, apiPut } from "../../../../lib/fetcher";
import { PLATFORMS_CONFIG, DEFAULT_PLATFORM_ID } from "./platformConfig";

export interface AccountItem {
  id: string;
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

  // Accounts state
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>([]);
  const [loadingAccounts, setLoadingAccounts] = useState(true);

  // Media state
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);

  // Post details state
  const [isAdPost, setIsAdPost] = useState(false);
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("English");
  const [undoHistory, setUndoHistory] = useState<string[]>([]);

  // Schedule state
  const [isScheduleOn, setIsScheduleOn] = useState(false);
  const [scheduleDate, setScheduleDate] = useState<string>(
    new Date(Date.now() + 86400000).toISOString().split("T")[0],
  );
  const [scheduleTime, setScheduleTime] = useState("10:00");
  const [timezone, setTimezone] = useState("Eastern Time (US & Canada) GMT-4");

  // Per-account Share-to placements
  const [shareToPlacements, setShareToPlacements] = useState<Record<string, boolean>>({
    fb_feed: true,
    fb_story: false,
    ig_feed: true,
    ig_story: false,
  });

  // Privacy settings
  const [privacySetting, setPrivacySetting] = useState<"public" | "restricted">("public");

  // Action Bar state
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [editingDraftId, setEditingDraftId] = useState<string | null>(draftIdParam || null);

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

  // Fetch connected accounts from backend or use realistic mock fallback
  useEffect(() => {
    setLoadingAccounts(true);
    apiGet("/integrations/list")
      .then((data: any) => {
        const list = data.integrations || [];
        if (list.length > 0) {
          const mapped = list.map((acc: any) => {
            const provider = (acc.platform || "facebook").toLowerCase();
            let avatarUrl = acc.avatar;
            if (!avatarUrl && acc.targetId && (provider === "facebook" || provider === "instagram")) {
              avatarUrl = `https://graph.facebook.com/${acc.targetId}/picture?type=large`;
            }
            if (!avatarUrl) {
              avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(acc.name || "User")}&background=0A7CFF&color=fff`;
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
          setSelectedAccountIds([mapped[0].id]);
        } else {
          useMockAccounts();
        }
      })
      .catch(() => {
        useMockAccounts();
      })
      .finally(() => setLoadingAccounts(false));

    function useMockAccounts() {
      const mockAccounts: AccountItem[] = [
        {
          id: "acc_fb_1",
          name: "AutoSocial Brand",
          provider: "facebook",
          handle: "@autosocial",
          avatar:
            "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=100&h=100&fit=crop",
        },
        {
          id: "acc_ig_1",
          name: "autosocial_app",
          provider: "instagram",
          handle: "@autosocial_app",
          avatar:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop",
        },
        {
          id: "acc_li_1",
          name: "AutoSocial Technologies",
          provider: "linkedin",
          handle: "company/autosocial",
          avatar:
            "https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=100&h=100&fit=crop",
        },
        {
          id: "acc_x_1",
          name: "AutoSocial",
          provider: "x",
          handle: "@autosocial",
          avatar:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop",
        },
      ];
      setAccounts(mockAccounts);
      setSelectedAccountIds([mockAccounts[0].id]);
    }
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

  // Toggle placement
  const toggleShareToPlacement = (placementId: string) => {
    setShareToPlacements((prev) => ({
      ...prev,
      [placementId]: !prev[placementId],
    }));
  };

  // Toast notification helper
  const showToast = (type: "success" | "error" | "info", message: string) => {
    setToastMessage({ type, text: message });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Validate form
  const validateForm = (): boolean => {
    const errors: ValidationErrors = {};

    if (selectedAccountIds.length === 0) {
      errors.accounts = "Please select at least one social account to post to.";
    }

    if (!text.trim() && mediaList.length === 0) {
      errors.content = "Please enter some text or add a photo/video before publishing.";
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
        const posts = selectedAccountIds.map((integrationId) => ({
          integrationId,
          content: fullContent,
          settings: {
            isAdPost,
            privacySetting,
            shareToPlacements,
            scheduledFor: isScheduleOn ? `${scheduleDate}T${scheduleTime}:00` : undefined,
          },
          media: mediaPayload,
        }));

        await apiPost("/posts", {
          type: isScheduleOn ? "schedule" : "now",
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

  // Cancel action
  const handleCancel = () => {
    if (hasChangesRef.current || text.trim() || mediaList.length > 0) {
      if (
        window.confirm("You have unsaved changes. Are you sure you want to discard them and exit?")
      ) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
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
    isAdPost,
    setIsAdPost,
    text,
    setText,
    language,
    setLanguage,
    applyAiRewrite,
    undoAiRewrite,
    canUndoAi: undoHistory.length > 0,

    // Schedule
    isScheduleOn,
    setIsScheduleOn,
    scheduleDate,
    setScheduleDate,
    scheduleTime,
    setScheduleTime,
    timezone,
    setTimezone,

    // Share to & Privacy
    shareToPlacements,
    toggleShareToPlacement,
    privacySetting,
    setPrivacySetting,

    // Action Bar & Save
    isSaving,
    lastSaved,
    handlePublish,
    handleCancel,

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
