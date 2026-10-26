import { Plus, Image, Check, X } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { useBrandKit, useSaveBrandKit } from "../hooks/useBrandKitQueries";
import { useFileUpload } from "../hooks/useFileUpload";
import { useImageStore } from "@/store/imageStore";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const AVAILABLE_FONTS = ["Inter", "Roboto", "Outfit", "Poppins", "Plus Jakarta Sans", "Montserrat", "Open Sans", "Lato"];

const TONE_OPTIONS = ["Professional", "Friendly", "Playful", "Bold", "Minimal", "Luxury"];

export function BrandKitPage() {
  const getImageUrl = useImageStore((state) => state.getImageUrl);
  const { data: brandKitData, isLoading } = useBrandKit();
  const saveMutation = useSaveBrandKit();

  const [noticeDismissed, setNoticeDismissed] = useState(
    () => localStorage.getItem("brandkit-notice-dismissed") === "1",
  );
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
  const [saveError, setSaveError] = useState(false);
  const [hexErrors, setHexErrors] = useState<Record<string, string>>({});
  const savedSnapshot = useRef<string>("");

  const buildSnapshot = (v: {
    primaryLogoId: unknown;
    watermarkLogoId: unknown;
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    primaryFont: string;
    secondaryFont: string;
    selectedTones: string[];
    styleNotes: string;
  }) => JSON.stringify(v);

  const currentSnapshot = () =>
    buildSnapshot({
      primaryLogoId,
      watermarkLogoId,
      primaryColor,
      secondaryColor,
      accentColor,
      primaryFont,
      secondaryFont,
      selectedTones,
      styleNotes,
    });

  const isDirty = savedSnapshot.current !== "" && savedSnapshot.current !== currentSnapshot();

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
    savedSnapshot.current = buildSnapshot({
      primaryLogoId: bk.primaryLogo?._id || null,
      watermarkLogoId: bk.watermarkLogo?._id || null,
      primaryColor: bk.primaryColor || "#2F8587",
      secondaryColor: bk.secondaryColor || "#FFFFFF",
      accentColor: bk.accentColor || "#DDF3D4",
      primaryFont: bk.fonts?.[0] || "Inter",
      secondaryFont: bk.fonts?.[1] || "Roboto",
      selectedTones: bk.tones?.length ? bk.tones : ["Professional", "Bold"],
      styleNotes: bk.styleNotes || "",
    });
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
          savedSnapshot.current = currentSnapshot();
          setSaveError(false);
          setSavedSuccess(true);
          setTimeout(() => setSavedSuccess(false), 3000);
        },
        onError: () => {
          setSaveError(true);
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

  // Hex inputs: strip invalid characters, require a leading #, cap at 7 chars.
  // A value that isn't a full #RRGGBB is kept editable but flagged, and the
  // preview falls back to the last valid color instead of breaking.
  const handleHexChange =
    (setter: (v: string) => void, label: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleaned = e.target.value.replace(/[^0-9a-fA-F#]/g, "").slice(0, 7);
      const normalized = cleaned && !cleaned.startsWith("#") ? `#${cleaned}` : cleaned;
      setter(normalized);
      setHexErrors((prev) => {
        const next = { ...prev };
        if (normalized !== "" && !/^#[0-9a-fA-F]{6}$/.test(normalized)) {
          next[label] = `${label} needs a 6-digit hex code (e.g. #2F8587)`;
        } else {
          delete next[label];
        }
        return next;
      });
    };

  const previewColor = (v: string, fallback: string) =>
    /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback;

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
      <div className="w-full space-y-6 antialiased" aria-busy="true" aria-label="Loading brand kit">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-2">
            <Skeleton className="h-8 w-40" />
            <Skeleton className="h-4 w-72 max-w-full" />
          </div>
          <Skeleton className="h-9 w-32 shrink-0" />
        </div>

        {/* Notice bar */}
        <Skeleton className="h-11 w-full rounded-xl" />

        {/* Two-column grid mirroring the real layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="space-y-4">
            {/* Logo & Assets */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-28" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-[120px] rounded-xl" />
                  <Skeleton className="h-[120px] rounded-xl" />
                </div>
              </CardContent>
            </Card>

            {/* Brand Colors */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20 rounded-lg" />
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2.5">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="flex items-center gap-3">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-8 w-8 rounded-full" />
                      <Skeleton className="h-8 flex-1 rounded-lg" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {/* Brand Fonts */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 gap-3">
                  <Skeleton className="h-9 w-full rounded-lg" />
                  <Skeleton className="h-9 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>

            {/* Brand Voice & Tone */}
            <Card>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-36" />
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div className="flex flex-wrap gap-2">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <Skeleton key={i} className="h-7 w-20 rounded-md" />
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Skeleton className="h-3 w-40" />
                  <Skeleton className="h-16 w-full rounded-lg" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brand Kit</h1>
          <p className="text-sm text-slate-500 mt-1">This brand kit will automatically be applied to all future AI-generated content.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && (
            <span className="text-xs font-semibold text-primary-600 flex items-center gap-1">
              <Check className="w-3.5 h-3.5" /> Saved!
            </span>
          )}
          {!savedSuccess && isDirty && (
            <span className="text-xs font-medium text-slate-400">Unsaved changes</span>
          )}
          {saveError && (
            <span className="text-xs font-medium text-red-600">Couldn't save. Try again.</span>
          )}
          <Button onClick={handleSave} disabled={saveMutation.isPending || !isDirty}>
            {saveMutation.isPending ? "Saving..." : "Save Brand Kit"}
          </Button>
        </div>
      </div>

      {!noticeDismissed && !primaryLogoId && !watermarkLogoId && !styleNotes.trim() && (
        <div className="bg-accent/70 border border-primary-200 rounded-xl px-4 py-2.5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-background text-primary-700 flex items-center justify-center font-semibold text-[11px] shrink-0">
              i
            </div>
            <p className="text-xs font-medium text-foreground">Complete your Brand Kit to unlock personalized AI generation.</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => {
              localStorage.setItem("brandkit-notice-dismissed", "1");
              setNoticeDismissed(true);
            }}
            title="Dismiss notice"
            aria-label="Dismiss notice"
          >
            <X className="w-4 h-4" />
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
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Primary Logo</label>
                  <div
                    onClick={primaryLogoUpload.openPicker}
                    className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px] bg-slate-50/50 hover:bg-primary-50/20 group relative overflow-hidden"
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
                        <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-primary-100 group-hover:text-primary-600 flex items-center justify-center text-slate-400 mb-1.5 transition-colors">
                          <Plus className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-700">
                          <span className="text-primary-600">Click to upload</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5">PNG, SVG (Max 5MB)</p>
                      </>
                    )}
                    {primaryLogoUpload.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <p className="text-xs font-medium text-slate-600">Uploading...</p>
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">Watermark / Icon</label>
                  <div
                    onClick={watermarkUpload.openPicker}
                    className="border-2 border-dashed border-slate-200 hover:border-primary-400 rounded-xl p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[120px] bg-slate-50/50 hover:bg-primary-50/20 group relative overflow-hidden"
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
                        <div className="w-9 h-9 rounded-lg bg-slate-100 group-hover:bg-primary-100 group-hover:text-primary-600 flex items-center justify-center text-slate-400 mb-1.5 transition-colors">
                          <Image className="w-4 h-4" />
                        </div>
                        <p className="text-[11px] font-medium text-slate-600">Square ratio</p>
                      </>
                    )}
                    {watermarkUpload.uploading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <p className="text-xs font-medium text-slate-600">Uploading...</p>
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
                <div className="flex rounded-lg overflow-hidden h-4 w-20 border border-slate-200">
                  <div className="w-1/3 h-full" style={{ backgroundColor: previewColor(primaryColor, "#2F8587") }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: previewColor(secondaryColor, "#FFFFFF") }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: previewColor(accentColor, "#DDF3D4") }} />
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2.5">
                {[
                  { label: "Primary", value: primaryColor, set: setPrimaryColor, fallback: "#2F8587" },
                  { label: "Secondary", value: secondaryColor, set: setSecondaryColor, fallback: "#FFFFFF" },
                  { label: "Accent", value: accentColor, set: setAccentColor, fallback: "#DDF3D4" },
                ].map((c) => (
                  <div key={c.label} className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-500 w-16">{c.label}</span>
                    <div className="flex items-center gap-2.5 flex-1">
                      <div className="relative w-8 h-8 rounded-full overflow-hidden border border-slate-200 shadow-xs shrink-0 cursor-pointer">
                        <input
                          type="color"
                          value={previewColor(c.value, c.fallback)}
                          onChange={(e) => c.set(e.target.value)}
                          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                          aria-label={`${c.label} color picker`}
                        />
                        <div className="w-full h-full rounded-full" style={{ backgroundColor: previewColor(c.value, c.fallback) }} />
                      </div>
                      <input
                        type="text"
                        value={c.value.toUpperCase()}
                        onChange={handleHexChange(c.set, c.label)}
                        spellCheck={false}
                        className="flex-1 px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-lg text-xs font-mono text-slate-800 focus:bg-background focus:outline-none focus:ring-2 focus:ring-primary-500 aria-invalid:border-red-400"
                        aria-invalid={c.value !== "" && !/^#[0-9a-fA-F]{6}$/.test(c.value)}
                      />
                    </div>
                    </div>
                    {hexErrors[c.label] && <p className="text-xs text-red-600 pl-[76px]">{hexErrors[c.label]}</p>}
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
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Primary Font</label>
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
                  <label className="block text-xs font-medium text-slate-500 mb-1.5">Secondary Font</label>
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
                <ToggleGroup
                  multiple
                  value={selectedTones}
                  onValueChange={(value) => setSelectedTones(value)}
                  variant="outline"
                  size="sm"
                  className="gap-2"
                >
                  {TONE_OPTIONS.map((tone) => (
                    <ToggleGroupItem
                      key={tone}
                      value={tone}
                      className="data-[state=on]:bg-primary data-[state=on]:text-white data-[state=on]:border-primary data-[state=on]:shadow-sm data-[state=on]:hover:bg-primary/90 data-[state=on]:hover:text-white"
                    >
                      {tone}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1.5">Content Style Notes (Optional)</label>
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
