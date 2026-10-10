import { Plus, Image } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useBrandKit, useSaveBrandKit } from "../hooks/useBrandKitQueries";
import { useFileUpload } from "../hooks/useFileUpload";
import { useImageStore } from "@/store/imageStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const AVAILABLE_FONTS = ["Inter", "Roboto", "Outfit", "Poppins", "Plus Jakarta Sans", "Montserrat", "Open Sans", "Lato"];

const TONE_OPTIONS = ["Professional", "Friendly", "Playful", "Bold", "Minimal", "Luxury"];

export function BrandKitPage() {
  const getImageUrl = useImageStore((state) => state.getImageUrl);
  const { data: brandKitData, isLoading } = useBrandKit();
  const saveMutation = useSaveBrandKit();

  const [showNotice, setShowNotice] = useState(true);
  const [primaryLogoId, setPrimaryLogoId] = useState(null);
  const [watermarkLogoId, setWatermarkLogoId] = useState(null);
  const [primaryLogoUrl, setPrimaryLogoUrl] = useState(null);
  const [watermarkLogoUrl, setWatermarkLogoUrl] = useState(null);
  const [primaryColor, setPrimaryColor] = useState("#2F8587");
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF");
  const [accentColor, setAccentColor] = useState("#DDF3D4");
  const [primaryFont, setPrimaryFont] = useState("Inter");
  const [secondaryFont, setSecondaryFont] = useState("Roboto");
  const [selectedTones, setSelectedTones] = useState(["Professional", "Bold"]);
  const [styleNotes, setStyleNotes] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Populate state from fetched brand kit data
  useEffect(() => {
    const bk = brandKitData?.brandKit;
    if (!bk) return;
    setPrimaryLogoId(bk.primaryLogo?._id || null);
    setWatermarkLogoId(bk.watermarkLogo?._id || null);
    setPrimaryLogoUrl(bk.primaryLogoUrl || null);
    setWatermarkLogoUrl(bk.watermarkLogoUrl || null);
    setPrimaryColor(bk.primaryColor || "#2F8587");
    setSecondaryColor(bk.secondaryColor || "#FFFFFF");
    setAccentColor(bk.accentColor || "#DDF3D4");
    setPrimaryFont(bk.fonts?.[0] || "Inter");
    setSecondaryFont(bk.fonts?.[1] || "Roboto");
    setSelectedTones(bk.tones?.length ? bk.tones : ["Professional", "Bold"]);
    setStyleNotes(bk.styleNotes || "");
  }, [brandKitData]);

  const handleSave = useCallback(() => {
    saveMutation.mutate(
      {
        primaryLogo: primaryLogoId || null,
        watermarkLogo: watermarkLogoId || null,
        primaryColor,
        secondaryColor,
        accentColor,
        fonts: [primaryFont, secondaryFont],
        tones: selectedTones,
        styleNotes,
      },
      {
        onSuccess: () => {
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        },
      },
    );
  }, [
    saveMutation,
    primaryLogoId,
    watermarkLogoId,
    primaryColor,
    secondaryColor,
    accentColor,
    primaryFont,
    secondaryFont,
    selectedTones,
    styleNotes,
  ]);

  const primaryLogoUpload = useFileUpload({
    onUpload: (media) => {
      setPrimaryLogoId(media._id);
      setPrimaryLogoUrl(getImageUrl(media.key));
    },
  });

  const watermarkUpload = useFileUpload({
    onUpload: (media) => {
      setWatermarkLogoId(media._id);
      setWatermarkLogoUrl(getImageUrl(media.key));
    },
  });

  if (isLoading) {
    return (
      <div className="w-full flex items-center justify-center py-20">
        <div className="text-sm text-gray-500">Loading brand kit...</div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Brand Kit</h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">This brand kit will automatically be applied to all future AI-generated content.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && <span className="text-xs font-semibold text-primary-600 animate-fade-in flex items-center gap-1">✓ Saved!</span>}
          <Button onClick={handleSave} disabled={saveMutation.isPending}>
            {saveMutation.isPending ? "Saving..." : "Save Brand Kit"}
          </Button>
        </div>
      </div>

      {showNotice && (
        <div className="bg-accent/70 border border-primary-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-background text-primary-700 flex items-center justify-center font-semibold text-[11px] shrink-0">
              i
            </div>
            <p className="text-xs font-medium text-foreground">Complete your Brand Kit to unlock personalized AI generation.</p>
          </div>
          <Button variant="ghost" size="icon-sm" onClick={() => setShowNotice(false)} title="Dismiss notice">
            ✕
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
        {/* Left column: Logo & Colors */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Logo & Assets</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Primary Logo</label>
                  <div
                    onClick={primaryLogoUpload.openPicker}
                    className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px] bg-gray-50/50 hover:bg-primary-50/20 group relative overflow-hidden"
                  >
                    <input
                      type="file"
                      ref={primaryLogoUpload.inputRef}
                      onChange={primaryLogoUpload.handleInputChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {primaryLogoUrl ? (
                      <img src={primaryLogoUrl} alt="Primary Logo" className="max-h-16 object-contain" />
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-primary-100 group-hover:text-primary-600 flex items-center justify-center text-gray-400 mb-1.5 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-medium text-gray-700">
                          Drag and drop or <span className="text-primary-600">click to upload</span>
                        </p>
                        <p className="text-[10px] text-gray-400 mt-0.5">PNG, SVG (Max 5MB)</p>
                      </>
                    )}
                    {primaryLogoUpload.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <p className="text-xs font-medium text-gray-600">Uploading...</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5">Watermark / Icon</label>
                  <div
                    onClick={watermarkUpload.openPicker}
                    className="border-2 border-dashed border-gray-200 hover:border-primary-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px] bg-gray-50/50 hover:bg-primary-50/20 group relative overflow-hidden"
                  >
                    <input
                      type="file"
                      ref={watermarkUpload.inputRef}
                      onChange={watermarkUpload.handleInputChange}
                      accept="image/*"
                      className="hidden"
                    />
                    {watermarkLogoUrl ? (
                      <img src={watermarkLogoUrl} alt="Watermark Icon" className="max-h-14 object-contain" />
                    ) : (
                      <>
                        <div className="w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-primary-100 group-hover:text-primary-600 flex items-center justify-center text-gray-400 mb-1.5 transition-colors">
                          <Image className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-medium text-gray-600">Square ratio</p>
                      </>
                    )}
                    {watermarkUpload.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <p className="text-xs font-medium text-gray-600">Uploading...</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Brand Colors</CardTitle>
                <div className="flex rounded-md overflow-hidden h-4 w-20 border border-gray-200">
                  <div className="w-1/3 h-full" style={{ backgroundColor: primaryColor }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: secondaryColor }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: accentColor }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {[
                  { label: "Primary", value: primaryColor, set: setPrimaryColor },
                  { label: "Secondary", value: secondaryColor, set: setSecondaryColor },
                  { label: "Accent", value: accentColor, set: setAccentColor },
                ].map((c) => (
                  <div key={c.label} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-gray-500 w-16">{c.label}</span>
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-gray-200 shadow-xs shrink-0 cursor-pointer">
                        <input
                          type="color"
                          value={c.value}
                          onChange={(e) => c.set(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                        />
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: c.value }} />
                      </div>
                      <input
                        type="text"
                        value={c.value.toUpperCase()}
                        onChange={(e) => c.set(e.target.value)}
                        className="flex-1 px-3 py-1.5 bg-gray-50/70 border border-gray-200 rounded-lg text-xs font-mono text-gray-800 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Fonts & Voice */}
        <div className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Brand Fonts</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Primary Font</label>
                  <Select value={primaryFont} onValueChange={setPrimaryFont}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FONTS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">Secondary Font</label>
                  <Select value={secondaryFont} onValueChange={setSecondaryFont}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {AVAILABLE_FONTS.map((f) => (
                        <SelectItem key={f} value={f}>
                          {f}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Brand Voice & Tone</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3">
              <div className="flex flex-wrap gap-2">
                <ToggleGroup multiple value={selectedTones} onValueChange={(value) => setSelectedTones(value)} variant="outline" size="sm">
                  {TONE_OPTIONS.map((tone) => (
                    <ToggleGroupItem key={tone} value={tone}>
                      {tone}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">Content Style Notes (Optional)</label>
                <Textarea
                  rows={2}
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="e.g., Avoid emojis, always mention free shipping"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
