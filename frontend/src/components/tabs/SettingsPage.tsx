import { useState, useEffect } from "react"
import { apiGet, apiPost, apiPut, apiDelete } from "../../lib/fetcher"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export function SettingsPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed: true,
    tokenExpiring: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState("")

  useEffect(() => {
    loadSettings()
  }, [])

  async function loadSettings() {
    try {
      const data = await apiGet("/settings")
      setName(data.name || "")
      setEmail(data.email || "")
      setNotifications(data.notifications || {
        postPublished: true,
        postFailed: true,
        tokenExpiring: true,
      })
    } catch (err) {
      console.error("Failed to load settings:", err)
    } finally {
      setLoading(false)
    }
  }

  async function handleSave() {
    setSaving(true)
    setToast("")
    try {
      await apiPut("/settings", { name, notifications })
      setToast("Settings saved successfully!")
      setTimeout(() => setToast(""), 3000)
    } catch (err) {
      setToast("Failed to save settings")
      setTimeout(() => setToast(""), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-500 mt-1">Manage your account preferences.</p>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-gray-400">Loading...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account preferences.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <Input
              type="email"
              value={email}
              readOnly
              className="cursor-default"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            { key: "postPublished", label: "Post published", desc: "Get notified when a scheduled post goes live" },
            { key: "postFailed", label: "Post failed", desc: "Get notified when a post fails to publish" },
            { key: "tokenExpiring", label: "Token expiring", desc: "Get notified when a social account token needs renewal" },
          ].map((item) => (
            <label key={item.key} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div>
                <p className="text-sm font-medium text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <Switch
                checked={notifications[item.key]}
                onCheckedChange={(checked) =>
                  setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                }
              />
            </label>
          ))}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Changes"}
        </Button>
        {toast && (
          <p className={`text-sm ${toast.includes("success") ? "text-green-600" : "text-red-600"}`}>
            {toast}
          </p>
        )}
      </div>
    </div>
  )
}
