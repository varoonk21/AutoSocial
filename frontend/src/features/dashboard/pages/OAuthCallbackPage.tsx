import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { apiGet, apiPost } from '@/lib/fetcher'
import { Button } from "@/components/ui/button"

const PLATFORM_INFO: Record<string, { name: string }> = {
  facebook: { name: 'Facebook' },
  instagram: { name: 'Instagram' },
  x: { name: 'X (Twitter)' },
  linkedin: { name: 'LinkedIn' },
}

interface FacebookPage {
  id: string
  name: string
  username?: string
  picture?: { data?: { url?: string } }
}

export function OAuthCallbackPage() {
  const { provider } = useParams<{ provider: string }>()
  const navigate = useNavigate()
  const platform = PLATFORM_INFO[provider || ''] || { name: provider }

  const [status, setStatus] = useState<'loading' | 'pages' | 'success' | 'error'>('loading')
  const [error, setError] = useState('')
  const [pages, setPages] = useState<FacebookPage[]>([])
  const [tempState, setTempState] = useState('')
  const [selectedPage, setSelectedPage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!provider) {
      setStatus('error')
      setError('Unknown provider')
      return
    }

    const params = new URLSearchParams(window.location.search)

    // X (OAuth 1.0a) returns oauth_token + oauth_verifier instead of state + code
    const code = params.get('code') || params.get('oauth_verifier') || ''
    const state = params.get('state') || params.get('oauth_token') || ''

    if (!code || !state) {
      setStatus('error')
      setError('Missing authorization parameters. Please try connecting again.')
      return
    }

    handleCallback(provider, code, state)
  }, [provider])

  async function handleCallback(prov: string, code: string, state: string) {
    try {
      const data = await apiGet(
        `/integrations/social/${prov}/callback?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`
      )

      if (data.success) {
        setStatus('success')
        setTimeout(() => navigate('/dashboard/connected-accounts'), 2000)
        return
      }

      if (data.inBetweenSteps) {
        setTempState(data.tempState)
        await loadPages(prov, data.tempState)
        return
      }

      setStatus('error')
      setError(data.error || 'Connection failed. Please try again.')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Connection failed. Please try again.')
    }
  }

  async function loadPages(prov: string, state: string) {
    try {
      const data = await apiGet(`/integrations/social/${prov}/pages?tempState=${encodeURIComponent(state)}`)
      const pageList = data.pages || []

      if (pageList.length === 0) {
        setStatus('error')
        setError('No pages found. Please make sure you have pages available and try again.')
        return
      }

      setPages(pageList)
      setStatus('pages')
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to load pages.')
    }
  }

  async function handlePageSelect(pageData: FacebookPage) {
    if (!provider || !tempState) return

    setSelectedPage(pageData.id)
    setSaving(true)
    try {
      const data = await apiPost(`/integrations/social/${provider}/page`, {
        tempState,
        pageData,
      })

      if (data.success) {
        setStatus('success')
        setTimeout(() => navigate('/dashboard/connected-accounts'), 2000)
      } else {
        setStatus('error')
        setError(data.error || 'Failed to save page. Please try again.')
      }
    } catch (err: unknown) {
      setStatus('error')
      setError(err instanceof Error ? err.message : 'Failed to save page. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  function handleBack() {
    navigate('/dashboard/connected-accounts')
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-background rounded-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="animate-spin w-8 h-8 border-4 border-slate-200 border-t-slate-900 rounded-full mx-auto mb-4" />
          <p className="text-sm text-slate-600">Connecting to {platform.name}...</p>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-background rounded-xl border border-slate-200 p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-primary-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Connected!</h2>
          <p className="text-sm text-slate-500 mb-6">
            {platform.name} has been connected successfully. Redirecting...
          </p>
          <Button onClick={handleBack}>Continue</Button>
        </div>
      </div>
    )
  }

  // Page selection state
  if (status === 'pages') {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="bg-background rounded-xl border border-slate-200 p-8 max-w-md w-full">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Select a Page</h2>
          <p className="text-sm text-slate-500 mb-6">
            Choose which {platform.name} page to connect.
          </p>

          <div className="space-y-2 max-h-96 overflow-y-auto mb-6">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => handlePageSelect(page)}
                disabled={saving}
                className={`w-full flex items-center gap-3 p-3 rounded-lg border transition-colors text-left ${
                  selectedPage === page.id
                    ? 'border-slate-900 bg-slate-50'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {page.picture?.data?.url ? (
                  <img
                    src={page.picture.data.url}
                    alt={page.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="w-10 h-10 rounded-full bg-slate-100 text-slate-500 text-xs font-semibold flex items-center justify-center shrink-0">
                    {page.name.slice(0, 2).toUpperCase()}
                  </span>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 truncate">{page.name}</p>
                  {page.username && (
                    <p className="text-xs text-slate-400">@{page.username}</p>
                  )}
                </div>
                {selectedPage === page.id && saving && (
                  <div className="animate-spin w-4 h-4 border-2 border-slate-200 border-t-slate-900 rounded-full" />
                )}
              </button>
            ))}
          </div>

          <Button variant="outline" className="w-full" onClick={handleBack} disabled={saving}>
            Cancel
          </Button>
        </div>
      </div>
    )
  }

  // Error state
  return (
    <div className="flex items-center justify-center py-16">
      <div className="bg-background rounded-xl border border-slate-200 p-8 max-w-md w-full text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-900 mb-1">Connection Failed</h2>
        <p className="text-sm text-slate-500 mb-6">{error}</p>
        <Button onClick={handleBack}>Back to Connected Accounts</Button>
      </div>
    </div>
  )
}
