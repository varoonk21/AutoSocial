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
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-30 select-none">
      {/* Left: Dynamic Context Actions for Active Page */}
      <div className="flex items-center gap-3">{renderDynamicActions()}</div>

      {/* Far Right: Notification Bell, Profile Icon */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <Button variant="ghost" size="icon-sm" title="Notifications" className="relative">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </Button>

        {/* Profile Avatar Icon */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-ring group"
            title="User Account"
          >
            <Avatar className="size-9 ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#243746] dark:group-hover:ring-gray-500 transition-all">
              <AvatarImage
                src={
                  session?.user?.image
                    ? getImageUrl(session.user.image)
                    : "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
                }
                alt={session?.user?.name || "User profile"}
              />
              <AvatarFallback className="text-xs font-semibold">
                {session?.user?.name ? session.user.name.slice(0, 2).toUpperCase() : "US"}
              </AvatarFallback>
              <AvatarBadge className="bg-emerald-500 ring-2 ring-white dark:ring-gray-900" />
            </Avatar>
            <ChevronDown className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/dashboard/settings");
                  }}
                >
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </Button>
                <div className="my-1.5 border-t border-gray-100 dark:border-gray-700" />
                <Button
                  variant="ghost"
                  className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  onClick={handleLogout}
                >
                  <LogOut className="w-4 h-4" />
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
