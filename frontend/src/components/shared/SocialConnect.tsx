import { useState } from 'react'
import { api } from '../../api'
import { Button } from "@/components/ui/button"

const PLATFORMS = [
  { id: 'facebook', name: 'Facebook', color: '#1877F2' },
  { id: 'instagram', name: 'Instagram', color: '#E1306C' },
  { id: 'x', name: 'X (Twitter)', color: '#000000' },
  { id: 'linkedin', name: 'LinkedIn', color: '#0A66C2' },
]

export function SocialConnect({ connectedProviders = [] }) {
  const [connecting, setConnecting] = useState(null)
  const [error, setError] = useState('')

  const handleConnect = async (providerId) => {
    setError('')
    setConnecting(providerId)
    try {
      const data = await api.get(`/integrations/social/${providerId}`)
      if (!data.url) throw new Error(data.error || 'Failed to get OAuth URL')
      window.location.href = data.url
    } catch (err) {
      setError(err.message)
      setConnecting(null)
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-gray-700">Connect a Social Account</h3>
      {error && <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-lg border border-red-200">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        {PLATFORMS.map((platform) => {
          const isConnected = connectedProviders.includes(platform.id)
          return (
            <Button
              key={platform.id}
              variant={isConnected ? "outline" : "default"}
              className={`justify-start ${
                isConnected ? "bg-emerald-50 border-emerald-200" : ""
              }`}
              onClick={() => handleConnect(platform.id)}
              disabled={connecting === platform.id}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: platform.color + '15' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={platform.color}>
                  {platform.id === 'facebook' && <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />}
                  {platform.id === 'instagram' && <><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke={platform.color} strokeWidth="2" /><circle cx="12" cy="12" r="5" fill="none" stroke={platform.color} strokeWidth="2" /></>}
                  {platform.id === 'x' && <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />}
                  {platform.id === 'linkedin' && <><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6zM2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></>}
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-gray-900">{platform.name}</p>
                <p className="text-xs text-gray-400">{isConnected ? 'Connected' : 'Not connected'}</p>
              </div>
            </Button>
          )
        })}
      </div>
    </div>
  )
}
