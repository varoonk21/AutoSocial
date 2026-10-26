import { useState, useEffect } from "react";
import { apiGet, apiPut } from "../../../lib/fetcher";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Toast } from "@/components/ui/toast";
import {
  Camera,
  User as UserIcon,
  Bell,
  ShieldCheck,
  Send,
  XCircle,
  KeyRound,
  LogOut,
  Loader2,
} from "lucide-react";
import { useFileUpload } from "../hooks/useFileUpload";
import { authClient, useSession, signOut } from "@/lib/auth-client";
import { useImageStore } from "@/store/imageStore";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { id: "profile", label: "Profile", icon: UserIcon },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]["id"];

const NOTIFICATION_ITEMS = [
  {
    key: "postPublished",
    label: "Post published",
    desc: "Get notified when a scheduled post goes live",
    icon: Send,
    tint: "bg-primary-50",
    iconColor: "text-primary-600",
  },
  {
    key: "postFailed",
    label: "Post failed",
    desc: "Get notified when a post fails to publish",
    icon: XCircle,
    tint: "bg-red-50",
    iconColor: "text-red-600",
  },
  {
    key: "tokenExpiring",
    label: "Token expiring",
    desc: "Get notified when a social account token needs renewal",
    icon: KeyRound,
    tint: "bg-amber-50",
    iconColor: "text-amber-600",
  },
];

export function SettingsPage() {
  const getImageUrl = useImageStore((state) => state.getImageUrl);
  const { data: session } = useSession();
  const { upload, inputRef, uploading, openPicker } = useFileUpload({
    onUpload: async (media) => {
      await authClient.updateUser({ image: media.key });
      setToast({ type: "success", msg: "Profile picture updated!" });
      setTimeout(() => setToast(null), 3000);
    },
    onError: () => {
      setToast({ type: "error", msg: "Failed to upload picture" });
      setTimeout(() => setToast(null), 3000);
    },
  });

  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notifications, setNotifications] = useState({
    postPublished: true,
    postFailed: true,
    tokenExpiring: true,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<{ name: string; notifications: typeof notifications } | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; msg: string } | null>(null);

  // Change password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    try {
      const data = await apiGet("/settings");
      const loadedName = data.name || "";
      const loadedEmail = data.email || "";
      const loadedNotifications = data.notifications || {
        postPublished: true,
        postFailed: true,
        tokenExpiring: true,
      };
      setName(loadedName);
      setEmail(loadedEmail);
      setNotifications(loadedNotifications);
      setSavedSnapshot({ name: loadedName, notifications: loadedNotifications });
    } catch (err) {
      console.error("Failed to load settings:", err);
      // Don't leave the form blank: fall back to the signed-in session
      setName(session?.user?.name || "");
      setEmail(session?.user?.email || "");
      setToast({ type: "error", msg: "Couldn't load your settings. Showing your account info instead." });
      setTimeout(() => setToast(null), 4000);
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    setSaving(true);
    setToast(null);
    try {
      await apiPut("/settings", { name, notifications });
      setSavedSnapshot({ name, notifications });
      setToast({ type: "success", msg: "Settings saved successfully!" });
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setToast({ type: "error", msg: "Failed to save settings" });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  }

  async function handleChangePassword() {
    if (!currentPassword || !newPassword) {
      setToast({ type: "error", msg: "Fill in both password fields" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setToast({ type: "error", msg: "New passwords do not match" });
      return;
    }
    if (newPassword.length < 8) {
      setToast({ type: "error", msg: "New password must be at least 8 characters" });
      return;
    }
    setChangingPassword(true);
    try {
      const { error } = await authClient.changePassword({
        currentPassword,
        newPassword,
        revokeOtherSessions: true,
      });
      if (error) throw new Error(error.message || "Password change failed");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setToast({ type: "success", msg: "Password changed successfully!" });
    } catch (err: any) {
      setToast({ type: "error", msg: err.message || "Failed to change password" });
    } finally {
      setChangingPassword(false);
      setTimeout(() => setToast(null), 4000);
    }
  }

  async function handleSignOut() {
    await signOut();
    window.location.href = "/login";
  }

  if (loading) {
    return (
      <div className="max-w-5xl">
        {/* Page header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
            <p className="text-sm text-slate-500 mt-1">Manage your account and preferences.</p>
          </div>
          <Skeleton className="h-10 w-32 rounded-lg shrink-0" />
        </div>

        <div className="mt-6 space-y-6">
          {/* Tab row */}
          <div className="flex items-center gap-1 p-1 rounded-xl border border-slate-200 bg-white w-fit">
            {NAV_ITEMS.map((item) => (
              <div key={item.id} className="flex items-center gap-2 px-4 py-2">
                <Skeleton className="size-4 rounded" />
                <Skeleton className="h-4 w-16 rounded-md" />
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="space-y-6">
            {/* Profile header card */}
            <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <Skeleton className="h-28 w-full rounded-none" />
              <div className="px-6 pb-6">
                <div className="-mt-10 flex items-end justify-between gap-4">
                  <Skeleton className="size-20 rounded-full ring-4 ring-white" />
                  <div className="pb-1">
                    <Skeleton className="h-3 w-40 rounded-md" />
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <Skeleton className="h-5 w-48 rounded-md" />
                  <Skeleton className="h-4 w-64 rounded-md" />
                </div>
              </div>
            </div>

            {/* Profile fields */}
            <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
              <Skeleton className="h-4 w-44 rounded-md" />
              <div className="grid sm:grid-cols-2 gap-5">
                {[0, 1].map((i) => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-12 rounded-md" />
                    <Skeleton className="h-9 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      {/* Page header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Manage your account and preferences.</p>
        </div>
        {(activeSection === "profile" || activeSection === "notifications") && (
          <div className="flex flex-col items-end gap-1 shrink-0">
            <Button
              onClick={handleSave}
              disabled={
                saving ||
                !savedSnapshot ||
                (savedSnapshot.name === name &&
                  JSON.stringify(savedSnapshot.notifications) === JSON.stringify(notifications))
              }
              className="shrink-0"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {saving ? "Saving..." : "Save Changes"}
            </Button>
            {savedSnapshot &&
              (savedSnapshot.name !== name ||
                JSON.stringify(savedSnapshot.notifications) !== JSON.stringify(notifications)) && (
                <p className="text-xs text-amber-600 font-medium">You have unsaved changes</p>
              )}
          </div>
        )}
      </div>

      <div className="mt-6 space-y-6">
        {/* Top tab row */}
        <div className="flex items-center gap-1 border-b border-slate-200" aria-label="Settings sections">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={activeSection === item.id ? "true" : undefined}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                "flex items-center gap-2 px-3.5 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors cursor-pointer",
                activeSection === item.id
                  ? "text-slate-900 font-semibold border-primary"
                  : "text-slate-500 border-transparent hover:text-slate-900 hover:border-slate-300",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeSection === "profile" && (
            <section className="space-y-6">
              {/* Profile header card */}
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div
                  className="h-28 w-full"
                  style={{ background: "linear-gradient(120deg, #2f8587 0%, #5fa4a6 55%, #8cc2c3 100%)" }}
                />
                <div className="px-6 pb-6">
                  <div className="-mt-10 flex items-end justify-between gap-4">
                    <div className="relative">
                      <Avatar className="size-20 ring-4 ring-white shadow-md">
                        <AvatarImage
                          src={session?.user?.image ? getImageUrl(session.user.image) : undefined}
                          alt="Profile Picture"
                        />
                        <AvatarFallback className="bg-slate-200">
                          <UserIcon className="w-8 h-8 text-slate-500" />
                        </AvatarFallback>
                      </Avatar>
                      {uploading && (
                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-full">
                          <Loader2 className="w-5 h-5 animate-spin text-primary-600" />
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={openPicker}
                        disabled={uploading}
                        title="Change picture"
                        className="absolute -bottom-1 -right-1 size-10 rounded-full bg-slate-900 text-white flex items-center justify-center shadow-md hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="pb-1">
                      <input
                        type="file"
                        ref={inputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          if (file.size > 10 * 1024 * 1024) {
                            setToast({ type: "error", msg: "Image must be under 10MB" });
                            setTimeout(() => setToast(null), 3000);
                            e.target.value = "";
                            return;
                          }
                          upload(file);
                        }}
                      />
                      <p className="text-xs text-slate-400 text-right">JPG, PNG, GIF or WEBP · Max 10MB</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <h2 className="text-lg font-bold text-slate-900">{name || session?.user?.name || "Your Name"}</h2>
                    <p className="text-sm text-slate-500">{email || session?.user?.email}</p>
                  </div>
                </div>
              </div>

              {/* Profile fields */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 space-y-5">
                <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wide">Personal Information</h3>
                <div className="grid sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Name</label>
                    <Input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
                    <Input type="email" value={email} readOnly className="cursor-default bg-slate-50" />
                    <p className="text-xs text-slate-400 mt-1.5">Email cannot be changed</p>
                  </div>
                </div>
              </div>
            </section>
          )}

          {activeSection === "notifications" && (
            <section className="rounded-xl border border-slate-200 bg-white overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="text-base font-bold text-slate-900">Notifications</h3>
                <p className="text-sm text-slate-500 mt-0.5">Choose what you want to be notified about.</p>
              </div>
              <div className="divide-y divide-slate-50">
                {NOTIFICATION_ITEMS.map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50/60 cursor-pointer transition-colors"
                  >
                    <span className={cn("size-10 rounded-full flex items-center justify-center shrink-0", item.tint)}>
                      <item.icon className={cn("w-5 h-5", item.iconColor)} />
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <Switch
                      checked={notifications[item.key as keyof typeof notifications]}
                      onCheckedChange={(checked) =>
                        setNotifications((prev) => ({ ...prev, [item.key]: checked }))
                      }
                    />
                  </label>
                ))}
              </div>
            </section>
          )}

          {activeSection === "security" && (
            <section className="space-y-6">
              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-base font-bold text-slate-900">Change Password</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Use a strong password you don't reuse elsewhere.</p>
                </div>
                <div className="p-6 space-y-4 max-w-md">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Current password</label>
                    <div className="relative">
                      <Input
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-16"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs text-slate-500"
                      >
                        {showCurrentPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">New password</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-16"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs text-slate-500"
                      >
                        {showNewPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm new password</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="pr-16"
                      />
                      <Button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        variant="ghost"
                        size="sm"
                        className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 text-xs text-slate-500"
                      >
                        {showConfirmPassword ? "Hide" : "Show"}
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleChangePassword} disabled={changingPassword} variant="outline">
                    {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
                    {changingPassword ? "Updating..." : "Update Password"}
                  </Button>
                  <p className="text-xs text-slate-400">Changing your password signs you out of other devices.</p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
                <div className="px-6 py-5 flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Sign Out</h3>
                    <p className="text-sm text-slate-500 mt-0.5">Sign out of AutoSocial on this device.</p>
                  </div>
                  <Button variant="outline" onClick={handleSignOut}>
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </Button>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* Toast */}
      {toast && <Toast kind={toast.type} message={toast.msg} />}
    </div>
  );
}
