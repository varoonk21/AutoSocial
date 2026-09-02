import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
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
} from "lucide-react";
import { api } from "../../api";
import { useFileUpload } from "@/hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

export function MediaLibraryPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { upload, uploading, progress } = useFileUpload();

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
  const [copiedId, setCopiedId] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");

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
    try {
      const newItems = [];
      for (const file of Array.from(files)) {
        const isVid = file.type.startsWith("video");
        const isPdf = file.type.includes("pdf");

        let fileUrl = URL.createObjectURL(file);
        try {
          const media = await upload(file);
          if (media?.path) fileUrl = media.path;
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
    }
  };

  const handleAiGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setAiGenerating(true);
    try {
      const res = await api.post("/media/generate-image", { prompt: aiPrompt });
      
      if (res.media) {
        setMediaList((prev) => [res.media, ...prev]);
      }
      
      setAiModalOpen(false);
      setAiPrompt("");
      showToast("AI Media generated!");
    } catch (e) {
      showToast("Failed to generate AI media");
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
    <div className="max-w-[1360px] mx-auto space-y-6  text-neutral-900 pb-16 select-none">
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
          <span>Uploading... {progress > 0 ? `${progress}%` : ""}</span>
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
        <p className="text-sm text-gray-500 mt-0.5">Store and manage all your media files in one place.</p>
      </div>

      {/* Filters & Control Toolbar */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          {/* Left Segmented Filter Pill Box (Type Filter) */}
          <ToggleGroup type="single" value={typeFilter} onValueChange={(value) => value && setTypeFilter(value)} variant="outline" size="sm">
            <ToggleGroupItem value="all">
              <ImageIcon className="w-4 h-4 text-[#243746]" />
              <span>All Media</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="image">
              <ImageIcon className="w-4 h-4 text-gray-500" />
              <span>Images</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="video">
              <Video className="w-4 h-4 text-gray-500" />
              <span>Videos</span>
            </ToggleGroupItem>
            <ToggleGroupItem value="document">
              <FileText className="w-4 h-4 text-gray-500" />
              <span>Documents</span>
            </ToggleGroupItem>
          </ToggleGroup>

          {/* Middle Source Filters (User Uploads / AI Generated) */}
          <div className="flex items-center gap-2">
            <ToggleGroup
              type="single"
              value={sourceFilter}
              onValueChange={(value) => value && setSourceFilter(value)}
              variant="outline"
              size="sm"
            >
              <ToggleGroupItem value="user">
                <Sparkles className="w-4 h-4 text-[#243746]" />
                <span>User Uploads</span>
              </ToggleGroupItem>
              <ToggleGroupItem value="ai">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>AI Generated</span>
              </ToggleGroupItem>
            </ToggleGroup>

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
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[150px]">
                <ArrowUpDown className="w-3.5 h-3.5 text-gray-500" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name (A-Z)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Search Bar Row */}
        <div className="relative w-full">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search media..." className="pl-10" />
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
                    <span className="bg-red-500 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-2xs">{asset.docType || "PDF"}</span>
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
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={(e) => copyLink(asset.path, asset._id, e)}>
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
          <Button variant="outline" size="icon-sm" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}>
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <Button variant={currentPage === 1 ? "default" : "ghost"} size="icon-sm" onClick={() => setCurrentPage(1)}>
            1
          </Button>

          <Button variant={currentPage === 2 ? "default" : "ghost"} size="icon-sm" onClick={() => setCurrentPage(2)}>
            2
          </Button>

          <Button variant={currentPage === 3 ? "default" : "ghost"} size="icon-sm" onClick={() => setCurrentPage(3)}>
            3
          </Button>

          <span className="text-xs text-gray-400 px-1">...</span>

          <Button variant={currentPage === 10 ? "default" : "ghost"} size="icon-sm" onClick={() => setCurrentPage(10)}>
            10
          </Button>

          <Button variant="outline" size="icon-sm" onClick={() => setCurrentPage(Math.min(10, currentPage + 1))}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <span className="text-xs text-gray-400 font-medium text-center sm:text-right">Showing 1 to {filteredMedia.length} of 120</span>
      </div>

      {/* ASSET DETAIL MODAL */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl space-y-0">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#1c2b36] truncate">{selectedAsset.name}</h3>
              <Button variant="ghost" size="icon-sm" onClick={() => setSelectedAsset(null)}>
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
                  <span className="font-bold text-[#1c2b36]">{selectedAsset.source === "ai" ? "AI Generated" : "User Upload"}</span>
                </div>
                <div>
                  <span className="text-gray-400 block text-[10px] uppercase font-bold">Date</span>
                  <span className="font-bold text-[#1c2b36]">{selectedAsset.date}</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between gap-3">
              <Button variant="destructive" size="sm" onClick={() => handleDelete(selectedAsset._id)}>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => copyLink(selectedAsset.path, selectedAsset._id)}>
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
      <Dialog open={aiModalOpen} onOpenChange={setAiModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-[#243746]/10 text-[#243746]">
                <Sparkles className="w-5 h-5" />
              </div>
              AI Image Generator
            </DialogTitle>
          </DialogHeader>

          <p className="text-xs text-gray-500 leading-relaxed">Describe the visual asset you want to generate using AI.</p>

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">Image Prompt</label>
            <Textarea
              rows={4}
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
              placeholder="e.g. Sleek black wireless headphones on purple studio background..."
            />
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setAiModalOpen(false)}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleAiGenerateImage} disabled={aiGenerating || !aiPrompt.trim()}>
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{aiGenerating ? "Generating..." : "Generate Asset"}</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
