import { useRef, useState } from "react";
import { apiPost } from "@/lib/fetcher";
import { Button } from "@/components/ui/button";

export function MediaUpload({ media = [], onMediaChange }) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef(null);

  const handleFiles = async (files) => {
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

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  return (
    <div className="space-y-3">
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          dragOver ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300 bg-gray-50"
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
          <p className="text-sm text-gray-500">Uploading...</p>
        ) : (
          <div className="space-y-2">
            <svg
              className="mx-auto text-gray-300"
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
            <p className="text-sm text-gray-500">Drop files here or click to upload</p>
            <p className="text-xs text-gray-400">Images (JPG, PNG, GIF, WebP) or MP4 videos</p>
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
                size="icon-xs"
                type="button"
                className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100"
                onClick={() => onMediaChange(media.filter((_, i) => i !== idx))}
              >
                ×
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
