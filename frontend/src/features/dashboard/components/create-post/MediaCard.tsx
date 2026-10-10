import { useState, useRef, useEffect } from "react";
import { Image, Upload, Film, X, GripVertical, AlertTriangle, Plus, Sparkles } from "lucide-react";
import { MediaItem } from "./useCreatePost";
import { MediaLibraryModal } from "../MediaLibraryModal";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { apiPost } from "../../../../lib/fetcher";
import { useImageStore } from "../../../../store/imageStore";
import { uploadFileToS3 } from "../../../../api/index";

interface MediaCardProps {
  mediaList: MediaItem[];
  onAddMedia: (item: Omit<MediaItem, "id">) => void;
  onRemoveMedia: (id: string) => void;
  onReorderMedia: (startIndex: number, endIndex: number) => void;
  error?: string;
  cardRef?: React.RefObject<HTMLDivElement | null>;
}

export function MediaCard({
  mediaList,
  onAddMedia,
  onRemoveMedia,
  onReorderMedia,
  error,
  cardRef,
}: MediaCardProps) {
  const [mediaModalOpen, setMediaModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [validationError, setValidationError] = useState<string | null>(null);

  // AI Image Generation state
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [aiPreview, setAiPreview] = useState<{ path: string; key?: string; name: string } | null>(null);
  const [aiSaving, setAiSaving] = useState(false);
  const getImageUrl = useImageStore((s) => s.getImageUrl);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const dragItemIndex = useRef<number | null>(null);
  const dragOverItemIndex = useRef<number | null>(null);

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuOpen]);

  // Handle device file upload by saving to Media Library first
  const handleDeviceUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setValidationError(null);
    const fileList = Array.from(files);

    // Validate size against the media library limit (backend enforces 10MB)
    for (const file of fileList) {
      if (file.size > 10 * 1024 * 1024) {
        setValidationError(`File "${file.name}" exceeds the media library limit of 10MB.`);
        return;
      }
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const failedFiles: string[] = [];

      for (let i = 0; i < fileList.length; i++) {
        const file = fileList[i];

        try {
          // Upload to S3 and save a record to the Media Library first.
          // The returned `path` is the library URL Facebook can fetch at publish time.
          const uploadedMedia = await uploadFileToS3(file, (p: number) => {
            const fileShare = 100 / fileList.length;
            const currentTotal = Math.round(i * fileShare + (p * fileShare) / 100);
            setUploadProgress(Math.min(99, Math.max(10, currentTotal)));
          });

          const mediaUrl = uploadedMedia?.path || getImageUrl(uploadedMedia?.key);

          if (!mediaUrl) {
            failedFiles.push(file.name);
            continue;
          }

          onAddMedia({
            path: mediaUrl,
            type: file.type.startsWith("video/") ? "video" : "image",
            name: file.name,
            sizeMB: parseFloat((file.size / (1024 * 1024)).toFixed(1)),
          });
        } catch {
          // Do not fall back to local blob: URLs — Facebook cannot fetch those.
          // Surface the failure so the user retries and gets a real library URL.
          failedFiles.push(file.name);
        }
      }

      if (failedFiles.length > 0) {
        setValidationError(
          failedFiles.length === 1
            ? `Failed to save "${failedFiles[0]}" to the media library. Please try again.`
            : `Failed to save ${failedFiles.length} files to the media library. Please try again.`,
        );
      }

      setUploadProgress(100);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to upload file to media library.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Handle selection from Media Library Modal
  const handleMediaLibrarySelect = (selected: { path: string; type: string }) => {
    onAddMedia({
      path: selected.path,
      type: selected.type === "video" ? "video" : "image",
    });
    setMediaModalOpen(false);
  };

  // Handle AI Image Generation via Backend API (/api/ai/generate-image)
  // Generates a preview; user confirms with Add / Regenerate / Skip
  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;

    setAiGenerating(true);
    setValidationError(null);
    try {
      const res: any = await apiPost("/ai/generate-image", { prompt: aiPrompt });
      if (res?.media) {
        const fullUrl = res.media.key ? getImageUrl(res.media.key) : res.media.path;
        setAiPreview({
          path: fullUrl || res.media.path,
          key: res.media.key,
          name: res.media.originalName || "AI Generated Image",
        });
      }
    } catch (err: any) {
      setValidationError(err?.message || "Failed to generate image with AI. Please try again.");
    } finally {
      setAiGenerating(false);
    }
  };

  // Add: save to Media Library, then attach to draft
  const handleAiAdd = async () => {
    if (!aiPreview) return;
    setAiSaving(true);
    try {
      // Persist to Media Library
      if (aiPreview.key) {
        await apiPost("/media", {
          key: aiPreview.key,
          originalName: aiPreview.name,
          contentType: "image/png",
          fileSize: 0,
          source: "ai",
        });
      }
      // Attach to draft
      onAddMedia({
        path: aiPreview.path,
        type: "image",
        name: aiPreview.name,
      });
      setAiModalOpen(false);
      setAiPrompt("");
      setAiPreview(null);
    } catch (err: any) {
      setValidationError(err?.message || "Failed to save image. Please try again.");
    } finally {
      setAiSaving(false);
    }
  };

  const handleAiSkip = () => {
    setAiModalOpen(false);
    setAiPrompt("");
    setAiPreview(null);
    setValidationError(null);
  };

  // Drag and drop reorder handlers
  const handleDragStart = (index: number) => {
    dragItemIndex.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItemIndex.current = index;
  };

  const handleDragEnd = () => {
    if (dragItemIndex.current !== null && dragOverItemIndex.current !== null && dragItemIndex.current !== dragOverItemIndex.current) {
      onReorderMedia(dragItemIndex.current, dragOverItemIndex.current);
    }
    dragItemIndex.current = null;
    dragOverItemIndex.current = null;
  };

  return (
    <div ref={cardRef}>
      <MediaLibraryModal
        open={mediaModalOpen}
        onOpenChange={setMediaModalOpen}
        onSelect={handleMediaLibrarySelect}
      />

      {/* AI Image Generator Modal */}
      <Dialog open={aiModalOpen} onOpenChange={(open) => { if (!open) handleAiSkip(); else setAiModalOpen(true); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm font-semibold text-slate-900">Create Image with AI</span>
            </DialogTitle>
          </DialogHeader>

          {!aiPreview ? (
            <>
              <div className="space-y-3 py-1">
                <p className="text-xs text-slate-500">
                  Describe the image you want to generate. Our AI will create a high-quality visual asset for your post.
                </p>

                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Image Prompt</label>
                  <Textarea
                    rows={3}
                    value={aiPrompt}
                    onChange={(e) => setAiPrompt(e.target.value)}
                    placeholder="e.g. A vibrant sunset over a modern city skyline with neon aesthetic..."
                    className="text-xs resize-none"
                  />
                </div>
                {validationError && (
                  <p className="text-xs text-red-600 font-medium">{validationError}</p>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiSkip}
                  disabled={aiGenerating}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAiGenerate}
                  disabled={!aiPrompt.trim() || aiGenerating}
                >
                  {aiGenerating ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Generating...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Generate Image</span>
                    </div>
                  )}
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <div className="space-y-3 py-1">
                <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                  <img
                    src={aiPreview.path}
                    alt={aiPreview.name}
                    className="w-full max-h-72 object-contain"
                  />
                </div>
                <p className="text-xs text-slate-500 truncate" title={aiPrompt}>
                  Prompt: {aiPrompt}
                </p>
                {validationError && (
                  <p className="text-xs text-red-600 font-medium">{validationError}</p>
                )}
              </div>

              <DialogFooter className="gap-2 sm:gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiSkip}
                  disabled={aiGenerating || aiSaving}
                >
                  Skip
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAiGenerate}
                  disabled={aiGenerating || aiSaving}
                >
                  {aiGenerating ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin" />
                      <span>Regenerating...</span>
                    </div>
                  ) : (
                    <span>Regenerate</span>
                  )}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  onClick={handleAiAdd}
                  disabled={aiGenerating || aiSaving}
                >
                  {aiSaving ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>Add</span>
                  )}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleDeviceUpload}
        accept="image/*,video/*"
        multiple
        className="hidden"
      />

      <Card className="rounded-xl border border-gray-200 bg-background shadow-xs overflow-visible">
        <CardContent className="p-4 space-y-3 overflow-visible">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900 tracking-tight">Media</h2>
              <p className="text-xs text-slate-500 font-normal mt-0.5">Share photos and videos.</p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setAiModalOpen(true)}
                className="h-8 px-2.5 border-gray-300 hover:bg-slate-50 text-slate-800 font-medium text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span>Generate with AI</span>
              </Button>

              {/* Compact "Add photo/video" Outlined Button with Dropdown Menu */}
              <div className="relative" ref={menuRef}>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="h-8 px-2.5 border-gray-300 hover:bg-gray-50 text-slate-800 font-medium text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <Plus className="w-3.5 h-3.5 text-primary" />
                  <span>Add photo/video</span>
                </Button>

                {menuOpen && (
                  <div className="absolute right-0 top-full mt-1.5 w-48 bg-background rounded-lg border border-gray-200 shadow-md py-1 z-50 animate-in fade-in duration-150">
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        fileInputRef.current?.click();
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer"
                    >
                      <Upload className="w-4 h-4 text-slate-500" />
                      <span>Upload from device</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setMediaModalOpen(true);
                      }}
                      className="w-full px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 cursor-pointer border-t border-gray-100"
                    >
                      <Image className="w-4 h-4 text-slate-500" />
                      <span>Choose from media library</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upload Progress Bar */}
          {isUploading && (
            <div className="space-y-1.5 p-2.5 bg-primary-50/50 rounded-lg border border-primary-100">
              <div className="flex justify-between text-xs font-semibold text-primary-900">
                <span>Uploading asset...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full h-1.5 bg-primary-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-200"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Validation Errors */}
          {(validationError || error) && (
            <div className="flex items-center gap-2 p-2.5 bg-red-50 text-red-700 rounded-lg text-xs font-medium border border-red-100">
              <AlertTriangle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{validationError || error}</span>
            </div>
          )}

          {/* Uploaded Thumbnails Row with Drag Reorder & Cover Badge */}
          {mediaList.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Reorder thumbnails (First item is cover)
              </p>

              <div className="flex items-center gap-2.5 overflow-x-auto pb-1 scrollbar-none">
                {mediaList.map((item, idx) => {
                  const isCover = idx === 0;

                  return (
                    <div
                      key={item.id}
                      draggable
                      onDragStart={() => handleDragStart(idx)}
                      onDragEnter={() => handleDragEnter(idx)}
                      onDragEnd={handleDragEnd}
                      onDragOver={(e) => e.preventDefault()}
                      className={`relative group shrink-0 w-20 h-20 rounded-lg border overflow-hidden bg-gray-100 transition-all cursor-grab active:cursor-grabbing ${
                        isCover ? "border-primary ring-2 ring-primary/15" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      {item.type === "video" ? (
                        <div className="w-full h-full bg-black/80 flex items-center justify-center text-white">
                          <Film className="w-6 h-6 opacity-80" />
                        </div>
                      ) : (
                        <img src={item.path} alt="" className="w-full h-full object-cover" />
                      )}

                      {/* Drag Handle Icon */}
                      <div className="absolute top-1 left-1 p-0.5 rounded bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        <GripVertical className="w-3 h-3" />
                      </div>

                      {/* Cover Badge */}
                      {isCover && (
                        <span className="absolute bottom-1 left-1 bg-primary text-white text-[8px] font-extrabold px-1 py-0.5 rounded shadow-xs">
                          COVER
                        </span>
                      )}

                      {/* Delete Button */}
                      <button
                        type="button"
                        aria-label="Remove media item"
                        onClick={() => onRemoveMedia(item.id)}
                        className="absolute top-1 right-1 p-0.5 rounded-full bg-black/60 text-white hover:bg-red-600 transition-colors cursor-pointer"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
