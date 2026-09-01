import { useState, useRef } from 'react'

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

  const toggleTone = (tone) => {
    if (selectedTones.includes(tone)) {
      setSelectedTones(selectedTones.filter((t) => t !== tone))
    } else {
      setSelectedTones([...selectedTones, tone])
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
          <button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm px-6 py-2.5 rounded-xl shadow-xs transition-all duration-150 cursor-pointer active:scale-95 flex items-center gap-2"
          >
            Save Brand Kit
          </button>
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
          <button
            onClick={() => setShowNotice(false)}
            className="text-gray-400 hover:text-gray-600 text-sm p-1 rounded-md transition-colors"
            title="Dismiss notice"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Logo & Assets</h2>
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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                        </svg>
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
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <p className="text-xs font-medium text-gray-600">Square ratio</p>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900 tracking-tight">Brand Colors</h2>
              <div className="flex rounded-md overflow-hidden h-5 w-24 border border-gray-200">
                <div className="w-1/3 h-full" style={{ backgroundColor: primaryColor }} />
                <div className="w-1/3 h-full" style={{ backgroundColor: secondaryColor }} />
                <div className="w-1/3 h-full" style={{ backgroundColor: accentColor }} />
              </div>
            </div>
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
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Brand Fonts</h2>
            <div className="space-y-3">
              {selectedFonts.map((font, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <select
                    value={font}
                    onChange={(e) => handleFontChange(idx, e.target.value)}
                    className="flex-1 px-3.5 py-2.5 bg-gray-50/70 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {AVAILABLE_FONTS.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                  {selectedFonts.length > 1 && (
                    <button
                      onClick={() => handleRemoveFont(idx)}
                      className="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove font"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={handleAddFont}
                className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 pt-1 cursor-pointer"
              >
                + Add Another Font
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 p-6 shadow-xs space-y-4">
            <h2 className="text-base font-semibold text-gray-900 tracking-tight">Brand Voice & Tone</h2>
            <div className="flex flex-wrap gap-2.5">
              {TONE_OPTIONS.map((tone) => {
                const isSelected = selectedTones.includes(tone)
                return (
                  <button
                    key={tone}
                    type="button"
                    onClick={() => toggleTone(tone)}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-150 cursor-pointer ${
                      isSelected ? 'bg-blue-600 text-white shadow-xs scale-105' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tone}
                  </button>
                )
              })}
            </div>
            <div className="pt-2">
              <label className="block text-xs font-medium text-gray-500 mb-2">Content Style Notes (Optional)</label>
              <textarea
                rows="3"
                value={styleNotes}
                onChange={(e) => setStyleNotes(e.target.value)}
                placeholder="e.g., Avoid emojis, always mention free shipping"
                className="w-full px-4 py-3 bg-gray-50/70 border border-gray-200 rounded-xl text-sm text-gray-800 placeholder-gray-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 sticky top-6">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">LIVE PREVIEW</span>
              <div className="p-1 text-gray-400">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                </svg>
              </div>
            </div>
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
              <button
                className="w-full font-semibold text-xs py-2.5 px-4 rounded-lg text-white shadow-xs transition-all duration-150 active:scale-[0.99] cursor-pointer"
                style={{ backgroundColor: accentColor }}
              >
                Learn More
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
