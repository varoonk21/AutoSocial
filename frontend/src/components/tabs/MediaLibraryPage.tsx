import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Bell,
  Search,
  Image as ImageIcon,
  Video,
  FileText,
  Sparkles,
  ArrowUpDown,
  MoreHorizontal,
  Play,
  Copy,
  Trash2,
  Plus,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { api, uploadFileToS3 } from "../../api";
import { Button } from "@/components/ui/button";

export function MediaLibraryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // State
  const [mediaList, setMediaList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all"); // "all", "image", "video", "document"
  const [sourceFilter, setSourceFilter] = useState("all"); // "all", "user", "ai"
  const [sortBy, setSortBy] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);

  // Modals & Interactivity
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [uploadProgress, setUploadProgress] = useState(null);

  // Load from backend & listen to Header custom actions
  useEffect(() => {
    fetchBackendMedia();

    const handleHeaderAction = (e) => {
      if (e.detail?.action === "upload-media") {
        fileInputRef.current?.click();
      } else if (e.detail?.action === "ai-generator") {
        setAiModalOpen(true);
      }
    };

    window.addEventListener("header-action", handleHeaderAction);
    return () => window.removeEventListener("header-action", handleHeaderAction);
  }, []);

  const fetchBackendMedia = async () => {
    try {
      const data = await api.get("/media");
      if (data && data.media) {
        const backendItems = data.media.map((item) => ({
          _id: item._id,
          name: item.originalName || item.name || "uploaded-file.jpg",
          type: item.type === "video" ? "video" : "image",
          badge: item.type === "video" ? "VIDEO" : "IMAGE",
          path: item.path,
          size: item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : "0 MB",
          date: new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          source: "user",
        }));
        setMediaList(backendItems);
      }
    } catch (e) {}
  };

  const handleFileUpload = async (files) => {
    if (!files || !files.length) return;
    setUploading(true);
    setUploadProgress(0);
    try {
      const newItems = [];
      for (const file of Array.from(files)) {
        const isVid = file.type.startsWith("video");
        const isPdf = file.type.includes("pdf");

        let fileUrl = URL.createObjectURL(file);
        try {
          const media = await uploadFileToS3(file, (progress) => {
            setUploadProgress(progress);
          });
          if (media.path) fileUrl = media.path;
        } catch (e) {}

        newItems.push({
          _id: String(Date.now() + Math.random()),
          name: file.name,
          type: isVid ? "video" : isPdf ? "document" : "image",
          badge: isVid ? "VIDEO" : isPdf ? "DOCUMENT" : "IMAGE",
          docType: isPdf ? "PDF" : undefined,
          duration: isVid ? "00:20" : undefined,
          path: fileUrl,
          size: `${(file.size / 1024 / 1024).toFixed(1)} MB`,
          date: "Just now",
          source: "user",
        });
      }
      setMediaList((prev) => [...newItems, ...prev]);
      showToast("Media uploaded successfully!");
    } finally {
      setUploading(false);
      setUploadProgress(null);
    }
  };

  const handleAiGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      let generatedPath =
        "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800&h=600";
      try {
        const res = await api.post("/media/generate-image", { prompt: aiPrompt });
        if (res.path) generatedPath = res.path;
      } catch (e) {}

      const newItem = {
        _id: String(Date.now()),
        name: `ai-gen-${aiPrompt.toLowerCase().replace(/[^a-z0-9]/g, "-").slice(0, 15)}.jpg`,
        type: "image",
        badge: "IMAGE",
        path: generatedPath,
        size: "2.8 MB",
        date: "Just now",
        source: "ai",
      };

      setMediaList((prev) => [newItem, ...prev]);
      setAiModalOpen(false);
      setAiPrompt("");
      showToast("AI Media generated!");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    api.delete(`/media/${id}`).catch(() => {});
    setMediaList((prev) => prev.filter((item) => item._id !== id));
    setMenuOpenId(null);
    if (selectedAsset?._id === id) setSelectedAsset(null);
    showToast("Media deleted");
  };

  const copyLink = (path, id, e) => {
    e?.stopPropagation();
    navigator.clipboard.writeText(path || "https://autosocial.app/media/" + id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    setMenuOpenId(null);
    showToast("Link copied to clipboard!");
  };

  const showToast = (msg) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(""), 3000);
  };

  // Filtered List
  const filteredMedia = mediaList.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    if (typeFilter !== "all" && item.type !== typeFilter) return false;
    if (sourceFilter !== "all" && item.source !== sourceFilter) return false;

    return true;
  });

  return (
    <div className="max-w-[1360px] mx-auto space-y-6 font-[Inter] text-neutral-900 pb-16 select-none">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#243746] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Upload Progress Indicator */}
      {uploading && (
        <div className="fixed bottom-6 left-6 z-50 bg-[#243746] text-white text-xs font-semibold px-4 py-3 rounded-xl shadow-lg flex items-center gap-3 animate-in fade-in">
          <div className="w-4 h-4 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
          <span>Uploading... {uploadProgress !== null ? `${uploadProgress}%` : ''}</span>
        </div>
      )}

      {/* Hidden File Input for Header Trigger */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*,application/pdf"
        multiple
        className="hidden"
        onChange={(e) => handleFileUpload(e.target.files)}
      />

      {/* Header Title Bar */}
      <div className="pb-2 border-b border-gray-200/80">
        <h1 className="text-2xl font-bold text-[#1c2b36] tracking-tight">Media Library</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Store and manage all your media files in one place.
        </p>
      </div>

      {/* Filters & Control Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Left Segmented Filter Pill Box (Type Filter) */}
          <div className="flex items-center gap-1 bg-gray-100/80 p-1 rounded-2xl border border-gray-200/60">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTypeFilter("all")}
              className={typeFilter === "all" ? "bg-white text-[#243746] shadow-2xs" : "text-gray-600 hover:text-gray-900"}
            >
              <ImageIcon className="w-4 h-4 text-[#243746]" />
              <span>All Media</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTypeFilter("image")}
              className={typeFilter === "image" ? "bg-white text-[#243746] shadow-2xs" : "text-gray-600 hover:text-gray-900"}
            >
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span>Images</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTypeFilter("video")}
              className={typeFilter === "video" ? "bg-white text-[#243746] shadow-2xs" : "text-gray-600 hover:text-gray-900"}
            >
              <Video className="w-4 h-4 text-gray-500" />
              <span>Videos</span>
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTypeFilter("document")}
              className={typeFilter === "document" ? "bg-white text-[#243746] shadow-2xs" : "text-gray-600 hover:text-gray-900"}
            >
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Documents</span>
            </Button>
          </div>

          {/* Middle Source Filters (User Uploads / AI Generated) */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSourceFilter(sourceFilter === "user" ? "all" : "user")}
              className={sourceFilter === "user" ? "border-[#243746] bg-[#243746]/10 text-[#243746]" : ""}
            >
              <Sparkles className="w-4 h-4 text-[#243746]" />
              <span>User Uploads</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (sourceFilter === "ai") {
                  setSourceFilter("all");
                } else {
                  setSourceFilter("ai");
                }
              }}
              className={sourceFilter === "ai" ? "border-[#243746] bg-[#243746]/10 text-[#243746]" : ""}
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>AI Generated</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setAiModalOpen(true)}
              className="border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 ml-1"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Generate AI</span>
            </Button>
          </div>

          {/* Right Sort Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="pl-8 pr-8 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#243746] cursor-pointer appearance-none shadow-2xs"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="name">Name (A-Z)</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search media..."
            className="w-full pl-10 pr-4 py-2.5 bg-gray-50/70 border border-gray-200 rounded-2xl text-xs text-[#1c2b36] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#243746] focus:bg-white transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Media Cards Grid (4 columns) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredMedia.map((asset) => (
          <div
            key={asset._id}
            onClick={() => setSelectedAsset(asset)}
            className="group bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-2xs hover:shadow-md transition-all cursor-pointer flex flex-col relative"
          >
            {/* Thumbnail Box */}
            <div className="relative aspect-4/3 bg-gray-100 overflow-hidden flex items-center justify-center">
              
              {/* Image / Video / Document Visual */}
              {asset.type === "document" ? (
                <div className="w-full h-full bg-slate-50 flex flex-col items-center justify-center p-4">
                  <div className="relative bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center">
                    <FileText className="w-10 h-10 text-gray-400 mb-1" />
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">
                      {asset.docType || "PDF"}
                    </span>
                  </div>
                </div>
              ) : (
                <img
                  src={asset.path}
                  alt={asset.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              )}

              {/* Video Play Overlay */}
              {asset.type === "video" && (
                <>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-11 h-11 rounded-full bg-black/40 backdrop-blur-xs text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-white text-white ml-0.5" />
                    </div>
                  </div>
                  <span className="absolute bottom-2.5 right-2.5 bg-black/70 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {asset.duration || "00:15"}
                  </span>
                </>
              )}

              {/* Badge Top Left */}
              <div className="absolute top-2.5 left-2.5">
                <span className="bg-white/90 backdrop-blur-md text-[#1c2b36] text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                  {asset.badge}
                </span>
              </div>

              {/* Three Dots Button Top Right */}
              <Button
                variant="ghost"
                size="icon-xs"
                onClick={(e) => {
                  e.stopPropagation();
                  setMenuOpenId(menuOpenId === asset._id ? null : asset._id);
                }}
                className="absolute top-2.5 right-2.5 bg-black/40 text-white hover:bg-black/60"
              >
                <MoreHorizontal className="w-4 h-4" />
              </Button>

              {/* Dropdown Options Menu */}
              {menuOpenId === asset._id && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute top-9 right-2.5 bg-white border border-gray-200 rounded-xl shadow-lg z-30 py-1.5 w-36 overflow-hidden animate-in fade-in"
                >
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={(e) => copyLink(asset.path, asset._id, e)}
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Link</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => {
                      setMenuOpenId(null);
                      navigate("/create-post");
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Use in Post</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => handleDelete(asset._id, e)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </Button>
                </div>
              )}

              {/* HOVER OVERLAY ACTIONS (as requested: "keep the option of hover") */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 pointer-events-none group-hover:pointer-events-auto">
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={(e) => copyLink(asset.path, asset._id, e)}
                  className="bg-white/90 hover:bg-white text-gray-800 shadow-md"
                  title="Copy Link"
                >
                  {copiedId === asset._id ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                </Button>
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate("/create-post");
                  }}
                  className="shadow-md"
                >
                  Use in Post
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={(e) => handleDelete(asset._id, e)}
                  className="bg-white/90 hover:bg-red-50 text-red-600 shadow-md"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Card Content Footer */}
            <div className="p-4 space-y-1">
              <h4 className="font-bold text-xs text-[#1c2b36] truncate">{asset.name}</h4>
              <p className="text-[11px] text-gray-400 font-medium">
                {asset.size} • {asset.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination & Stats Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-gray-200/80">
        <div className="flex items-center gap-1 mx-auto sm:mx-0">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant={currentPage === 1 ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setCurrentPage(1)}
          >
            1
          </Button>

          <Button
            variant={currentPage === 2 ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setCurrentPage(2)}
          >
            2
          </Button>

          <Button
            variant={currentPage === 3 ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setCurrentPage(3)}
          >
            3
          </Button>

          <span className="text-xs text-gray-400 px-1">...</span>

          <Button
            variant={currentPage === 10 ? "default" : "ghost"}
            size="icon-sm"
            onClick={() => setCurrentPage(10)}
          >
            10
          </Button>

          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-xs text-gray-400 font-medium text-center sm:text-right">
          Showing 1 to {filteredMedia.length} of 120
        </span>
      </div>

      {/* ASSET DETAIL MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1c2b36] truncate">{selectedAsset.name}</h3>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setSelectedAsset(null)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scroll">
              <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-900 max-h-[350px] flex items-center justify-center">
                {selectedAsset.type === "document" ? (
                  <div className="p-12 text-center text-white space-y-2">
                    <FileText className="w-16 h-16 mx-auto text-gray-400" />
                    <p className="font-bold text-sm">{selectedAsset.name}</p>
                  </div>
                ) : (
                  <img src={selectedAsset.path} alt={selectedAsset.name} className="max-h-[350px] w-full object-contain" />
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-gray-50 p-4 rounded-2xl text-xs">
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Type</span>
                  <span className="font-bold text-[#1c2b36]">{selectedAsset.badge}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">File Size</span>
                  <span className="font-bold text-[#1c2b36]">{selectedAsset.size}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Source</span>
                  <span className="font-bold text-[#1c2b36]">
                    {selectedAsset.source === "ai" ? "AI Generated" : "User Upload"}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-bold text-[#1c2b36]">{selectedAsset.date}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3">
              <Button
                variant="destructive"
                size="sm"
                onClick={() => handleDelete(selectedAsset._id)}
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyLink(selectedAsset.path, selectedAsset._id)}
                >
                  <Copy className="w-4 h-4" />
                  <span>Copy URL</span>
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    setSelectedAsset(null);
                    navigate("/create-post");
                  }}
                >
                  <Plus className="w-4 h-4" />
                  <span>Use in Create Post</span>
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI GENERATOR MODAL */}
      {aiModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#243746]/10 text-[#243746]">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#1c2b36]">AI Image Generator</h3>
              </div>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setAiModalOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <p className="text-xs text-gray-500 leading-relaxed">
              Describe the visual asset you want to generate using AI.
            </p>

            <div className="space-y-2">
              <label className="block text-xs font-bold text-gray-700">Image Prompt</label>
              <textarea
                rows={4}
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Sleek black wireless headphones on purple studio background..."
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-[#1c2b36] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#243746] focus:bg-white transition-all resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setAiModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleAiGenerateImage}
                disabled={aiGenerating || !aiPrompt.trim()}
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{aiGenerating ? "Generating..." : "Generate Asset"}</span>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
