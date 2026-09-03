import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
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
  ImagePlus,
} from "lucide-react";
import { apiGetPaginated, apiPost, apiPut, apiDelete } from "../../../lib/fetcher";
import { useFileUpload } from "../hooks/useFileUpload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

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
  const [paginationMeta, setPaginationMeta] = useState({ page: 1, pageSize: 24, total: 0, pageCount: 1 });

  // Modals & Interactivity
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [menuOpenId, setMenuOpenId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [aiModalOpen, setAiModalOpen] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const [aiReferenceImage, setAiReferenceImage] = useState(null);
  const [aiReferencePreview, setAiReferencePreview] = useState(null);
  const [aiReferenceUploading, setAiReferenceUploading] = useState(false);
  const aiReferenceInputRef = useRef(null);

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

  useEffect(() => {
    fetchBackendMedia();
  }, [typeFilter, sourceFilter, searchQuery, sortBy, currentPage]);

  const fetchBackendMedia = async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter && typeFilter !== "all") params.append("type", typeFilter);
      if (sourceFilter && sourceFilter !== "all") params.append("source", sourceFilter);
      if (searchQuery) params.append("search", searchQuery);
      params.append("page", currentPage.toString());

      if (sortBy === "newest") params.append("sort", "createdAt:desc");
      else if (sortBy === "oldest") params.append("sort", "createdAt:asc");
      else if (sortBy === "name") params.append("sort", "originalName:asc");
      
      const queryString = params.toString();
      const { items, meta } = await apiGetPaginated(`/media${queryString ? `?${queryString}` : ""}`);
      
      if (items) {
        const backendItems = items.map((item) => ({
          _id: item._id,
          name: item.originalName || item.name || "uploaded-file.jpg",
          type: item.type === "video" ? "video" : "image",
          badge: item.type === "video" ? "VIDEO" : "IMAGE",
          path: item.path,
          size: item.fileSize ? `${(item.fileSize / 1024 / 1024).toFixed(1)} MB` : "0 MB",
          date: new Date(item.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
          source: item.source || "user",
        }));
        setMediaList(backendItems);
        setPaginationMeta(meta);
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
      const body = { prompt: aiPrompt };
      if (aiReferenceImage?.path) {
        body.referenceImageUrl = aiReferenceImage.path;
      }
      const res = await apiPost("/ai/generate-image", body);
      
      if (res.media) {
        setMediaList((prev) => [res.media, ...prev]);
      }
      
      setAiModalOpen(false);
      setAiPrompt("");
      setAiReferenceImage(null);
      setAiReferencePreview(null);
      showToast("AI Media generated!");
    } catch (e) {
      showToast("Failed to generate AI media");
    } finally {
      setAiGenerating(false);
    }
  };

  const handleReferenceImageSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAiReferenceUploading(true);
    try {
      const preview = URL.createObjectURL(file);
      setAiReferencePreview(preview);

      const media = await upload(file);
      if (media) {
        setAiReferenceImage(media);
      }
    } catch (err) {
      showToast("Failed to upload reference image");
      setAiReferencePreview(null);
    } finally {
      setAiReferenceUploading(false);
    }
  };

  const handleRemoveReferenceImage = () => {
    setAiReferenceImage(null);
    setAiReferencePreview(null);
    if (aiReferenceInputRef.current) {
      aiReferenceInputRef.current.value = "";
    }
  };

  const handleDeleteClick = (id, e) => {
    e?.stopPropagation();
    setDeleteConfirmId(id);
    setMenuOpenId(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirmId) return;
    try {
      await apiDelete(`/media/${deleteConfirmId}`);
      setMediaList((prev) => prev.filter((item) => item._id !== deleteConfirmId));
      if (selectedAsset?._id === deleteConfirmId) setSelectedAsset(null);
      showToast("Media deleted");
    } catch (err) {
      showToast("Failed to delete media");
    } finally {
      setDeleteConfirmId(null);
    }
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

  // Filtered List (filtering done on backend)
  const filteredMedia = mediaList;

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
      <div className="pb-2 border-b border-gray-200/80 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1c2b36] tracking-tight">Media Library</h1>
          <p className="text-sm text-gray-500 mt-0.5">Store and manage all your media files in one place.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAiModalOpen(true)}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generator</span>
          </Button>
          <Button
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Media</span>
          </Button>
        </div>
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
                      navigate("/dashboard/create-post");
                    }}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Use in Post</span>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50"
                    onClick={(e) => handleDeleteClick(asset._id, e)}
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
                    navigate("/dashboard/create-post");
                  }}
                  className="shadow-md"
                >
                  Use in Post
                </Button>
                <Button
                  variant="destructive"
                  size="icon-sm"
                  onClick={(e) => handleDeleteClick(asset._id, e)}
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
        <div className="flex-1">
          {paginationMeta.pageCount > 1 && (
            <Pagination className="justify-start">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setCurrentPage(Math.max(1, currentPage - 1)); }} 
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(5, paginationMeta.pageCount) }).map((_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === pageNum}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(pageNum); }}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}

                {paginationMeta.pageCount > 5 && (
                  <>
                    <PaginationItem>
                      <PaginationEllipsis />
                    </PaginationItem>
                    <PaginationItem>
                      <PaginationLink 
                        href="#" 
                        isActive={currentPage === paginationMeta.pageCount}
                        onClick={(e) => { e.preventDefault(); setCurrentPage(paginationMeta.pageCount); }}
                      >
                        {paginationMeta.pageCount}
                      </PaginationLink>
                    </PaginationItem>
                  </>
                )}

                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); setCurrentPage(Math.min(paginationMeta.pageCount, currentPage + 1)); }} 
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </div>
        
        <span className="text-xs text-gray-400 font-medium text-center sm:text-right shrink-0">
          Showing {mediaList.length > 0 ? (currentPage - 1) * paginationMeta.pageSize + 1 : 0} to {Math.min(currentPage * paginationMeta.pageSize, paginationMeta.total)} of {paginationMeta.total}
        </span>
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
              <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(selectedAsset._id)}>
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
                    navigate("/dashboard/create-post");
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
      <Dialog open={aiModalOpen} onOpenChange={(open) => {
        if (!open) {
          setAiReferenceImage(null);
          setAiReferencePreview(null);
        }
        setAiModalOpen(open);
      }}>
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

          <div className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">Reference Image (Optional)</label>
            <p className="text-[11px] text-gray-400">Upload a reference image to guide the AI generation.</p>
            
            <input
              ref={aiReferenceInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleReferenceImageSelect}
            />

            {aiReferencePreview ? (
              <div className="relative inline-block">
                <img
                  src={aiReferencePreview}
                  alt="Reference"
                  className="w-24 h-24 object-cover rounded-xl border border-gray-200"
                />
                {aiReferenceUploading && (
                  <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
                <Button
                  variant="destructive"
                  size="icon-xs"
                  className="absolute -top-2 -right-2"
                  onClick={handleRemoveReferenceImage}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => aiReferenceInputRef.current?.click()}
                disabled={aiReferenceUploading}
                className="w-full border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-gray-300 transition-colors cursor-pointer disabled:opacity-50"
              >
                <ImagePlus className="w-8 h-8 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {aiReferenceUploading ? "Uploading..." : "Click to upload reference image"}
                </span>
              </button>
            )}
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

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={(open) => !open && setDeleteConfirmId(null)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>Delete Media</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            Are you sure you want to delete this media? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setDeleteConfirmId(null)}>
              Cancel
            </Button>
            <Button variant="destructive" size="sm" onClick={handleDeleteConfirm}>
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
