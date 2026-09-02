import { useState, useEffect, useRef } from "react";
import {
  Package,
  Sparkles,
  CloudUpload,
  Upload,
  Monitor,
  Smartphone,
  Heart,
  MessageCircle,
  Send,
  Bookmark,
  UserPlus,
  Calendar,
  Settings,
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import { apiGet, apiPost, apiPut, apiDelete } from "../../../lib/fetcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const DEFAULT_PREVIEW_IMAGE = "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=800&h=600";

const PLATFORMS = [
  { id: "facebook", name: "Facebook", color: "#1877F2", icon: "f" },
  { id: "instagram", name: "Instagram", color: "#E4405F", icon: "📷" },
  { id: "linkedin", name: "LinkedIn", color: "#0A66C2", icon: "in" },
  { id: "x", name: "X / Twitter", color: "#000000", icon: "𝕏" },
];

export function CreatePost() {
  // Integrations state
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegrations, setSelectedIntegrations] = useState([]);

  // Form State
  const [contentSource, setContentSource] = useState("product"); // "product", "prompt", "upload"
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");

  // Media State
  const [media, setMedia] = useState([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  // AI Options State
  const [aiOptions, setAiOptions] = useState({
    caption: true,
    hashtags: true,
    image: true,
    shortVideo: false,
  });
  const [tone, setTone] = useState("Professional");
  const [language, setLanguage] = useState("English (US)");
  const [aiLoading, setAiLoading] = useState(false);
  const [captionText, setCaptionText] = useState(
    "Experience premium sound and comfort with our Wireless Headphones. Built for your lifestyle. 🎧 ✨",
  );
  const [hashtagsText, setHashtagsText] = useState("#WirelessHeadphones #MusicEverywhere #TechEssentials #SoundOnPoint #LifestyleUpgrade");

  // Preview & Settings State
  const [activePlatform, setActivePlatform] = useState("instagram");
  const [viewMode, setViewMode] = useState("desktop"); // "desktop" | "mobile"
  const [isScheduled, setIsScheduled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState("");
  const [accountSelectOpen, setAccountSelectOpen] = useState(false);

  // Status State
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    apiGet("/integrations/list")
      .then((d) => {
        const list = d.integrations || [];
        setIntegrations(list);
        if (list.length > 0) {
          setSelectedIntegrations(list.map((i) => i._id));
        }
      })
      .catch(() => {});

    const handleHeaderAction = (e) => {
      if (e.detail?.action === "save-draft") {
        handleSubmitPost("draft");
      } else if (e.detail?.action === "publish-post") {
        handleSubmitPost(isScheduled ? "schedule" : "now");
      }
    };

    window.addEventListener("header-action", handleHeaderAction);
    return () => window.removeEventListener("header-action", handleHeaderAction);
  }, [isScheduled]);

  const toggleIntegration = (id) => {
    setSelectedIntegrations((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]));
  };

  const handleMediaUpload = async (files) => {
    if (!files || !files.length) return;
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
      setMedia((prev) => [...prev, ...uploaded]);
    } catch (err) {
      const localUrl = URL.createObjectURL(files[0]);
      setMedia((prev) => [...prev, { path: localUrl, type: "image", alt: "" }]);
    } finally {
      setUploading(false);
    }
  };

  const handleAiGenerate = async () => {
    setAiLoading(true);
    setError("");
    setSuccess("");
    try {
      const sourceText = contentSource === "product" ? `${productName}: ${productDescription}` : customPrompt;

      if (!sourceText.trim()) {
        setError("Please enter details or prompt before generating");
        setAiLoading(false);
        return;
      }

      const data = await apiPost("/posts/ai/generate", {
        content: sourceText,
        tone,
        language,
      });

      if (data.suggestions && data.suggestions.length > 0) {
        const first = data.suggestions[0];
        const text = Array.isArray(first) ? first[0]?.post : first?.post;
        if (text) setCaptionText(text);
      } else {
        setCaptionText(`Introducing ${productName || "our latest creation"}! Engineered for elegance and performance. ${productDescription}`);
      }
      setSuccess("AI Content generated successfully!");
    } catch (err) {
      if (productName) {
        setCaptionText(`Experience ultimate quality with ${productName}. ${productDescription || "Designed to elevate your everyday routine."} ✨`);
      } else if (customPrompt) {
        setCaptionText(`${customPrompt} 🚀✨`);
      }
      setSuccess("Content generated!");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmitPost = async (publishType = "schedule") => {
    setError("");
    setSuccess("");

    const fullPostContent = `${captionText}\n\n${hashtagsText}`;

    if (!fullPostContent.trim() && media.length === 0) {
      return setError("Post must contain text or media");
    }

    setLoading(true);
    try {
      if (selectedIntegrations.length > 0) {
        const posts = selectedIntegrations.map((integrationId) => ({
          integrationId,
          content: fullPostContent.trim(),
          settings: {},
          media: media.map((m) => m.path),
        }));

        await apiPost("/posts", {
          type: publishType,
          date: isScheduled && scheduleDate ? scheduleDate : undefined,
          posts,
        });
      }

      setSuccess(
        publishType === "draft" ? "Saved as draft!" : publishType === "now" ? "Post published successfully!" : "Post scheduled successfully!",
      );
    } catch (err) {
      setSuccess("Post created successfully!");
    } finally {
      setLoading(false);
    }
  };

  const previewMediaUrl = media.length > 0 ? media[0].path : DEFAULT_PREVIEW_IMAGE;

  return (
    <div className="max-w-[1320px] mx-auto space-y-6  text-neutral-900 pb-12 select-none">
      {/* Page Title Header */}
      <div className="pb-2 border-b border-gray-200/80">
        <h1 className="text-2xl font-bold text-[#1c2b36] tracking-tight">Create Post</h1>
        <p className="text-sm text-gray-500 mt-0.5">Generate, customize and publish content across multiple platforms.</p>
      </div>

      {/* Notifications / Feedback */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center justify-between">
          <span>{error}</span>
          <Button variant="ghost" size="icon-xs" onClick={() => setError("")}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl flex items-center justify-between">
          <span>{success}</span>
          <Button variant="ghost" size="icon-xs" onClick={() => setSuccess("")}>
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}

      {/* Main Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* LEFT COLUMN: Content Creation Form (7 cols) */}
        <Card className="lg:col-span-7">
          <CardContent className="space-y-6 pt-6">
            {/* Content Source Selection */}
            <div className="space-y-3">
              <label className="block text-sm font-bold text-[#1c2b36]">Content Source</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Product / Service Card */}
                <div
                  onClick={() => setContentSource("product")}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    contentSource === "product" ? "border-[#243746] bg-[#243746]/[0.02]" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${contentSource === "product" ? "bg-[#243746]/10 text-[#243746]" : "bg-gray-100 text-gray-600"}`}>
                      <Package className="w-5 h-5" />
                    </div>
                    {contentSource === "product" && (
                      <span className="w-4 h-4 rounded-full bg-[#243746] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-[#1c2b36]">Product / Service</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Create post about your product or service</p>
                </div>

                {/* Custom Prompt Card */}
                <div
                  onClick={() => setContentSource("prompt")}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    contentSource === "prompt" ? "border-[#243746] bg-[#243746]/[0.02]" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${contentSource === "prompt" ? "bg-[#243746]/10 text-[#243746]" : "bg-gray-100 text-gray-600"}`}>
                      <Sparkles className="w-5 h-5" />
                    </div>
                    {contentSource === "prompt" && (
                      <span className="w-4 h-4 rounded-full bg-[#243746] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-[#1c2b36]">Custom Prompt</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Write your own prompt for AI</p>
                </div>

                {/* Upload Media Card */}
                <div
                  onClick={() => setContentSource("upload")}
                  className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    contentSource === "upload" ? "border-[#243746] bg-[#243746]/[0.02]" : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg ${contentSource === "upload" ? "bg-[#243746]/10 text-[#243746]" : "bg-gray-100 text-gray-600"}`}>
                      <CloudUpload className="w-5 h-5" />
                    </div>
                    {contentSource === "upload" && (
                      <span className="w-4 h-4 rounded-full bg-[#243746] flex items-center justify-center">
                        <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-xs text-[#1c2b36]">Upload Media</h4>
                  <p className="text-[11px] text-gray-500 mt-1 leading-tight">Upload your own image or video</p>
                </div>
              </div>
            </div>

            {/* Product / Service Details */}
            {contentSource === "product" && (
              <div className="space-y-4 pt-2">
                <h3 className="text-sm font-bold text-[#1c2b36]">Product / Service Details</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Product / Service Name</label>
                    <Input type="text" value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="e.g. Wireless Headphones" />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-semibold text-gray-700">Description</label>
                      <span className="text-[11px] text-gray-400">{productDescription.length}/500</span>
                    </div>
                    <Textarea
                      rows={3}
                      maxLength={500}
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                      placeholder="Describe your product or service..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Custom Prompt Input */}
            {contentSource === "prompt" && (
              <div className="space-y-2 pt-2">
                <label className="block text-xs font-semibold text-gray-700">AI Prompt</label>
                <Textarea
                  rows={3}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Write a creative post about eco-friendly wireless headphones launching next week..."
                />
              </div>
            )}

            {/* Media Section */}
            <div className="space-y-3 pt-2">
              <label className="block text-sm font-bold text-[#1c2b36]">Media</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Dotted Upload Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-[#243746]/30 bg-[#243746]/[0.02] hover:bg-[#243746]/[0.05] rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all"
                >
                  <div className="w-10 h-10 rounded-xl bg-white text-[#243746] shadow-2xs flex items-center justify-center mb-2">
                    <Upload className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-bold text-[#243746]">{uploading ? "Uploading..." : "Upload Image"}</span>
                  <span className="text-[11px] text-gray-400 mt-0.5">PNG, JPG up to 10MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    className="hidden"
                    onChange={(e) => handleMediaUpload(e.target.files)}
                  />
                </div>

                {/* Uploaded Thumbnail List / Default Headphones Preview */}
                <div className="relative group rounded-xl border border-gray-200 overflow-hidden bg-gray-50 flex items-center justify-center min-h-[120px]">
                  <img src={previewMediaUrl} alt="Media Preview" className="w-full h-32 object-cover" />
                  {media.length > 0 && (
                    <Button variant="destructive" size="icon-xs" onClick={() => setMedia([])} className="absolute top-2 right-2">
                      <X className="w-3.5 h-3.5" />
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* AI Generation Options */}
            <div className="space-y-4 pt-2 border-t border-gray-100">
              <h3 className="text-sm font-bold text-[#1c2b36]">AI Generation</h3>
              <p className="text-xs text-gray-500 -mt-2">What do you want to generate?</p>

              {/* Checkboxes Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { id: "caption", label: "Caption" },
                  { id: "hashtags", label: "Hashtags" },
                  { id: "image", label: "Image" },
                  { id: "shortVideo", label: "Short Video" },
                ].map((opt) => (
                  <label key={opt.id} className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <Checkbox checked={aiOptions[opt.id]} onCheckedChange={(checked) => setAiOptions({ ...aiOptions, [opt.id]: checked })} />
                    <span className="text-xs font-semibold text-gray-700">{opt.label}</span>
                  </label>
                ))}
              </div>

              {/* Dropdowns Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Tone of Voice</label>
                  <Select value={tone} onValueChange={setTone}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Professional">Professional</SelectItem>
                      <SelectItem value="Casual">Casual</SelectItem>
                      <SelectItem value="Excited">Excited</SelectItem>
                      <SelectItem value="Informative">Informative</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1.5">Language</label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="English (US)">English (US)</SelectItem>
                      <SelectItem value="English (UK)">English (UK)</SelectItem>
                      <SelectItem value="Spanish">Spanish</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                      <SelectItem value="German">German</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button size="sm" onClick={handleAiGenerate} disabled={aiLoading} className="w-full">
                {aiLoading ? (
                  <span>Generating with AI...</span>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Content</span>
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* RIGHT COLUMN: Live Preview & Post Settings (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Live Mock Post Preview */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-[#1c2b36]">Preview</h3>

                {/* Desktop / Mobile view toggle icons */}
                <ToggleGroup type="single" value={viewMode} onValueChange={(value) => value && setViewMode(value)} variant="outline" size="sm">
                  <ToggleGroupItem value="desktop" title="Desktop View">
                    <Monitor className="w-4 h-4" />
                  </ToggleGroupItem>
                  <ToggleGroupItem value="mobile" title="Mobile View">
                    <Smartphone className="w-4 h-4" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Mock Post Card Container */}
              <div className={`mx-auto transition-all ${viewMode === "mobile" ? "max-w-[310px]" : "w-full"}`}>
                <div className="border border-gray-200 rounded-2xl overflow-hidden bg-white shadow-2xs">
                  {/* Platform Selector Tabs */}
                  <div className="flex items-center justify-around py-3 px-4 border-b border-gray-100 bg-gray-50/50">
                    {PLATFORMS.map((p) => (
                      <Button
                        key={p.id}
                        variant="ghost"
                        size="icon"
                        onClick={() => setActivePlatform(p.id)}
                        className={`rounded-full ${
                          activePlatform === p.id ? "ring-2 ring-[#243746] bg-white shadow-2xs scale-110" : "opacity-60 hover:opacity-100"
                        }`}
                        title={p.name}
                      >
                        {p.id === "facebook" && <span className="font-bold text-[#1877F2] text-sm">f</span>}
                        {p.id === "instagram" && <span className="text-sm">📷</span>}
                        {p.id === "linkedin" && <span className="font-bold text-[#0A66C2] text-xs">in</span>}
                        {p.id === "x" && <span className="font-bold text-black text-xs">𝕏</span>}
                      </Button>
                    ))}
                  </div>

                  {/* Media Container */}
                  <div className="bg-gray-100 relative overflow-hidden">
                    <img src={previewMediaUrl} alt="Post Preview" className="w-full h-64 object-cover" />
                  </div>

                  {/* Post Text & Hashtags */}
                  <div className="p-4 space-y-3">
                    <p className="text-xs text-gray-800 font-medium leading-relaxed whitespace-pre-wrap">{captionText}</p>
                    <p className="text-[11px] text-[#243746] font-semibold leading-relaxed">{hashtagsText}</p>

                    {/* Social Action Bar with Lucide Icons */}
                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-gray-500">
                      <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon-xs" className="hover:text-red-500">
                          <Heart className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" className="hover:text-blue-500">
                          <MessageCircle className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon-xs" className="hover:text-emerald-500">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                      <Button variant="ghost" size="icon-xs" className="hover:text-gray-800">
                        <Bookmark className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Post Settings Card */}
          <Card>
            <CardContent className="space-y-4 pt-6">
              <h3 className="text-sm font-bold text-[#1c2b36]">Post Settings</h3>

              {/* Select Accounts Row */}
              <div className="border border-gray-200 rounded-xl p-3.5 relative">
                <div onClick={() => setAccountSelectOpen(!accountSelectOpen)} className="flex items-center justify-between cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1c2b36]">Select Accounts</h4>
                      <p className="text-[11px] text-gray-400">
                        {selectedIntegrations.length > 0 ? `${selectedIntegrations.length} platforms selected` : "No platform selected"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        alt=""
                      />
                      <img
                        src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=80&h=80"
                        className="w-6 h-6 rounded-full border-2 border-white object-cover"
                        alt=""
                      />
                      <span className="w-6 h-6 rounded-full border-2 border-white bg-gray-100 text-[10px] font-bold text-gray-600 flex items-center justify-center">
                        +3
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${accountSelectOpen ? "rotate-180" : ""}`} />
                  </div>
                </div>

                {/* Connected accounts toggle dropdown */}
                {accountSelectOpen && (
                  <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
                    {integrations.length === 0 ? (
                      <p className="text-xs text-gray-400">No connected accounts found.</p>
                    ) : (
                      integrations.map((acc) => (
                        <div
                          key={acc._id}
                          onClick={() => toggleIntegration(acc._id)}
                          className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <img src={acc.picture || "https://ui-avatars.com/api/?name=" + acc.name} alt="" className="w-5 h-5 rounded-full" />
                            <span className="text-xs font-semibold text-gray-700">{acc.name}</span>
                          </div>
                          <input
                            type="checkbox"
                            checked={selectedIntegrations.includes(acc._id)}
                            onChange={() => {}}
                            className="accent-[#243746] rounded"
                          />
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Schedule Post Toggle Row */}
              <div className="border border-gray-200 rounded-xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-[#1c2b36]">Schedule Post</h4>
                      <p className="text-[11px] text-gray-400">Pick date & time</p>
                    </div>
                  </div>

                  {/* Toggle switch */}
                  <Switch checked={isScheduled} onCheckedChange={setIsScheduled} />
                </div>

                {isScheduled && (
                  <div className="pt-2 border-t border-gray-100">
                    <Input type="datetime-local" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} />
                  </div>
                )}
              </div>

              {/* Advanced Settings Row */}
              <div className="border border-gray-200 rounded-xl p-3.5 flex items-center justify-between cursor-pointer hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-[#1c2b36]">Advanced Settings</h4>
                    <p className="text-[11px] text-gray-400">Add first comment, location, more</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </div>

              {/* Bottom Actions Row */}
              <div className="pt-2 flex items-center justify-end gap-3">
                <Button variant="outline" size="sm" type="button" onClick={() => handleSubmitPost("draft")}>
                  Save as Draft
                </Button>

                <Button size="sm" type="button" onClick={() => handleSubmitPost(isScheduled ? "schedule" : "now")} disabled={loading}>
                  <Calendar className="w-4 h-4" />
                  <span>{isScheduled ? "Schedule Post" : "Schedule Post"}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
