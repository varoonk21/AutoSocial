import { useState, useRef } from 'react'
import { Plus, Image, Trash2 } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"

const AVAILABLE_FONTS = [
  'Inter (Primary)',
  'Roboto (Secondary)',
  'Outfit (Primary)',
  'Poppins (Secondary)',
  'Plus Jakarta Sans',
  'Montserrat',
  'Open Sans',
  'Lato',
]

const TONE_OPTIONS = ['Professional', 'Friendly', 'Playful', 'Bold', 'Minimal', 'Luxury']

export function BrandKitPage() {
  const [showNotice, setShowNotice] = useState(true)
  const [primaryLogo, setPrimaryLogo] = useState(null)
  const [watermarkLogo, setWatermarkLogo] = useState(null)
  const primaryLogoInputRef = useRef(null)
  const watermarkInputRef = useRef(null)
  const [primaryColor, setPrimaryColor] = useState('#2563EB')
  const [secondaryColor, setSecondaryColor] = useState('#FFFFFF')
  const [accentColor, setAccentColor] = useState('#F59E0B')
  const [selectedFonts, setSelectedFonts] = useState(['Inter (Primary)', 'Roboto (Secondary)'])
  const [selectedTones, setSelectedTones] = useState(['Professional', 'Bold'])
  const [styleNotes, setStyleNotes] = useState('')
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleLogoUpload = (e, setLogo) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setLogo(url)
    }
  }

  const handleAddFont = () => {
    const unused = AVAILABLE_FONTS.find((f) => !selectedFonts.includes(f))
    if (unused) {
      setSelectedFonts([...selectedFonts, unused])
    }
  }

  const handleRemoveFont = (index) => {
    setSelectedFonts(selectedFonts.filter((_, i) => i !== index))
  }

  const handleFontChange = (index, value) => {
    const updated = [...selectedFonts]
    updated[index] = value
    setSelectedFonts(updated)
  }

  const handleSave = () => {
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="w-full space-y-6 font-['Inter'] antialiased">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-200/60">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Brand Kit</h1>
          <p className="text-xs text-gray-500 font-normal mt-0.5">This brand kit will automatically be applied to all future AI-generated content.</p>
        </div>
        <div className="flex items-center gap-3">
          {savedSuccess && <span className="text-xs font-semibold text-emerald-600 animate-fade-in flex items-center gap-1">✓ Saved!</span>}
          <Button
            onClick={handleSave}
          >
            Save Brand Kit
          </Button>
        </div>
      </div>

      {showNotice && (
        <div className="bg-indigo-50/80 border border-indigo-100/90 rounded-xl p-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-semibold text-xs shrink-0">
              i
            </div>
            <p className="text-xs font-medium text-indigo-900">Complete your Brand Kit to unlock personalized AI generation.</p>
          </div>
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowNotice(false)}
            title="Dismiss notice"
          >
            ✕
          </Button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Logo & Assets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Primary Logo</label>
                  <div
                    onClick={() => primaryLogoInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[140px] bg-gray-50/50 hover:bg-blue-50/20 group relative overflow-hidden"
                  >
                    <input
                      type="file"
                      ref={primaryLogoInputRef}
                      onChange={(e) => handleLogoUpload(e, setPrimaryLogo)}
                      accept="image/*"
                      className="hidden"
                    />
                    {primaryLogo ? (
                      <img src={primaryLogo} alt="Primary Logo" className="max-h-20 object-contain" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center text-gray-400 mb-2 transition-colors">
                          <Plus className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-gray-700">
                          Drag and drop or <span className="text-blue-600">click to upload</span>
                        </p>
                        <p className="text-[11px] text-gray-400 mt-1">PNG, SVG (Max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-2">Watermark / Icon</label>
                  <div
                    onClick={() => watermarkInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-200 hover:border-blue-400 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-colors min-h-[140px] bg-gray-50/50 hover:bg-blue-50/20 group relative overflow-hidden"
                  >
                    <input
                      type="file"
                      ref={watermarkInputRef}
                      onChange={(e) => handleLogoUpload(e, setWatermarkLogo)}
                      accept="image/*"
                      className="hidden"
                    />
                    {watermarkLogo ? (
                      <img src={watermarkLogo} alt="Watermark Icon" className="max-h-16 object-contain" />
                    ) : (
                      <>
                        <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center justify-center text-gray-400 mb-2 transition-colors">
                          <Image className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-medium text-gray-600">Square ratio</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Brand Colors</CardTitle>
                <div className="flex rounded-md overflow-hidden h-5 w-24 border border-gray-200">
                  <div className="w-1/3 h-full" style={{ backgroundColor: primaryColor }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: secondaryColor }} />
                  <div className="w-1/3 h-full" style={{ backgroundColor: accentColor }} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 w-20">Primary</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-xs shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: primaryColor }} />
                    </div>
                    <input
                      type="text"
                      value={primaryColor.toUpperCase()}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 w-20">Secondary</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-xs shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: secondaryColor }} />
                    </div>
                    <input
                      type="text"
                      value={secondaryColor.toUpperCase()}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-gray-500 w-20">Accent</span>
                  <div className="flex items-center gap-3 flex-1">
                    <div className="relative w-9 h-9 rounded-full overflow-hidden border border-gray-200 shadow-xs shrink-0 cursor-pointer">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                      />
                      <div className="w-full h-full rounded-full" style={{ backgroundColor: accentColor }} />
                    </div>
                    <input
                      type="text"
                      value={accentColor.toUpperCase()}
                      onChange={(e) => setAccentColor(e.target.value)}
                      className="flex-1 px-3.5 py-2 bg-gray-50/70 border border-gray-200 rounded-lg text-sm font-mono text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Fonts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {selectedFonts.map((font, idx) => (
                  <div key={idx} className="flex items-center gap-3">
                    <Select
                      value={font}
                      onValueChange={(value) => handleFontChange(idx, value)}
                    >
                      <SelectTrigger className="flex-1">
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
                    {selectedFonts.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleRemoveFont(idx)}
                        title="Remove font"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  variant="link"
                  size="sm"
                  onClick={handleAddFont}
                  className="text-blue-600 hover:text-blue-700 p-0 h-auto"
                >
                  + Add Another Font
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brand Voice & Tone</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2.5">
                <ToggleGroup
                  multiple
                  value={selectedTones}
                  onValueChange={(value) => setSelectedTones(value)}
                  variant="outline"
                  size="sm"
                >
                  {TONE_OPTIONS.map((tone) => (
                    <ToggleGroupItem key={tone} value={tone}>
                      {tone}
                    </ToggleGroupItem>
                  ))}
                </ToggleGroup>
              </div>
              <div className="pt-2">
                <label className="block text-xs font-medium text-gray-500 mb-2">Content Style Notes (Optional)</label>
                <Textarea
                  rows={3}
                  value={styleNotes}
                  onChange={(e) => setStyleNotes(e.target.value)}
                  placeholder="e.g., Avoid emojis, always mention free shipping"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-5 sticky top-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">LIVE PREVIEW</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="border border-gray-200/80 rounded-xl p-4 space-y-3 bg-white shadow-xs">
                <div className="flex items-center gap-2.5">
                  {primaryLogo ? (
                    <img src={primaryLogo} alt="Logo" className="w-8 h-8 rounded-full object-cover border" />
                  ) : (
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
                      style={{ backgroundColor: primaryColor }}
                    >
                      AS
                    </div>
                  )}
                  <span className="font-semibold text-sm text-gray-900">AutoSocial</span>
                </div>
                <div className="relative rounded-lg overflow-hidden border border-gray-100">
                  <img
                    src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=500&q=80"
                    alt="Post content preview"
                    className="w-full h-44 object-cover"
                  />
                  <div className="absolute bottom-2 right-2 bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded shadow-xs">
                    {watermarkLogo ? <img src={watermarkLogo} alt="WM" className="w-4 h-4 object-contain" /> : 'AS'}
                  </div>
                </div>
                <p className="text-xs text-gray-700 leading-relaxed font-normal">
                  <span className="font-semibold text-gray-900">AutoSocial</span> Elevate your content strategy with AI. Streamline your workflow and
                  ensure brand consistency across all channels. 🚀 #AutoSocial #ContentCreation
                </p>
                <Button
                  className="w-full font-semibold text-xs"
                  style={{ backgroundColor: accentColor }}
                >
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
