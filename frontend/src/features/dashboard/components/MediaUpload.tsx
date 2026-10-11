import { useRef, useState } from "react";
import { apiPost } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface MediaItem {
  path: string
  type: string
  alt: string
}

interface MediaUploadProps {
  media?: MediaItem[]
  onMediaChange: (media: MediaItem[]) => void
}

export function MediaUpload({ media = [], onMediaChange }: MediaUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList) => {
    setUploading(true);
    try {
      const uploaded = await Promise.all(
        Array.from(files).map(async (file) => {
          const formData = new FormData();
          formData.append("file", file);
          const data = await apiPost("/media/upload", formData);
          return { path: data.media.path, type: data.media.type, alt: "" };
        }),
      );
      onMediaChange([...media, ...uploaded]);
    } catch (err) {
      alert("Upload failed: " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? "border-primary-400 bg-primary-50" : "border-slate-200 hover:border-slate-300 bg-slate-50"
        } ${uploading ? "opacity-50 pointer-events-none" : ""}`}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
      >
        {uploading ? (
          <p className="text-sm text-slate-500">Uploading...</p>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto text-slate-300"
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <p className="text-sm text-slate-500">Drop files here or click to upload</p>
            <p className="text-xs text-slate-400">Images (JPG, PNG, GIF, WebP) or MP4 videos</p>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/mp4"
        multiple
        className="hidden"
        onChange={(e) => e.target.files?.length && handleFiles(e.target.files)}
      />

      {media.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {media.map((item, idx) => (
            <div key={idx} className="relative group">
              {item.type === "video" ? (
                <video src={item.path} className="w-20 h-20 object-cover rounded-lg" muted />
              ) : (
                <img src={item.path} alt="" className="w-20 h-20 object-cover rounded-lg" />
              )}
              <Button
                variant="destructive"
                size="icon"
                type="button"
                aria-label="Remove media"
                className="absolute -top-2 -right-2 size-8 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100"
                onClick={() => onMediaChange(media.filter((_, i) => i !== idx))}
              >
                <X className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
