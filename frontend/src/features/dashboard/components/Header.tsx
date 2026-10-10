import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut, useSession } from "@/lib/auth-client";
import { Bell, LogOut, User, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useImageStore } from "@/store/imageStore";
import { Avatar, AvatarImage, AvatarFallback, AvatarBadge } from "@/components/ui/avatar";

export function Header() {
  const getImageUrl = useImageStore((state) => state.getImageUrl);
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: session } = useSession();

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Dispatch custom action to active page
  const dispatchAction = (actionName: any) => {
    window.dispatchEvent(new CustomEvent("header-action", { detail: { action: actionName } }));
  };

  // Render Dynamic Page Action Buttons depending on location.pathname

  const renderDynamicActions = () => {
    const path = location.pathname;

    if (path === "/dashboard/media-library") {
      return null;
    }

    if (path === "/dashboard/create-post" || path.startsWith("/dashboard/content/create")) {
      return null;
    }

    if (path === "/dashboard/scheduled-posts" || path === "/dashboard/content/schedule") {
      return null;
    }

    if (path === "/dashboard/drafts" || path === "/dashboard/content/manage") {
      return null;
    }

    if (path === "/dashboard/analytics") {
      return null;
    }

    if (path === "/dashboard/connected-accounts") {
      return null;
    }

    // Default Dashboard action
    return null;
  };

  return (
    <header className="h-14 bg-background border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-30 select-none">
      {/* Left: Dynamic Context Actions for Active Page */}
      <div className="flex items-center gap-3">{renderDynamicActions()}</div>

      {/* Far Right: Notification Bell, Profile Icon */}
      <div className="flex items-center gap-2.5">
        {/* Notification Bell */}
        <Button variant="ghost" size="icon-sm" title="Notifications" className="relative">
          <Bell className="w-4 h-4 text-muted-foreground" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
        </Button>

        {/* Profile Avatar Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-muted transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring group"
            title="User Account"
          >
            <Avatar className="size-8 ring-1 ring-border group-hover:ring-muted-foreground transition-all">
              <AvatarImage
                src={
                  session?.user?.image
                    ? getImageUrl(session.user.image)
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                }
                alt={session?.user?.name || "User profile"}
              />
              <AvatarFallback className="text-[11px] font-semibold">
                {session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "US"}
              </AvatarFallback>
              <AvatarBadge className="bg-primary ring-2 ring-background" />
            </Avatar>
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-1.5 w-48 bg-popover border border-border rounded-lg shadow-md z-50 py-1 text-xs animate-in fade-in">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-8 px-3 text-xs"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/dashboard/settings");
                  }}
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Profile Settings</span>
                </Button>
                <div className="my-1 border-t border-border" />
                <Button
                  variant="ghost"
                  className="w-full justify-start h-8 px-3 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </Button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
