import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { signOut } from "@/lib/auth-client";
import {
  Sun,
  Moon,
  Bell,
  Upload,
  Sparkles,
  Plus,
  Save,
  Download,
  Share2,
  Calendar,
  LogOut,
  User,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  // Dispatch custom action to active page
  const dispatchAction = (actionName) => {
    window.dispatchEvent(
      new CustomEvent("header-action", { detail: { action: actionName } })
    );
  };

  // Render Dynamic Page Action Buttons depending on location.pathname
  const renderDynamicActions = () => {
    const path = location.pathname;

    if (path === "/media-library") {
      return (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => dispatchAction("ai-generator")}
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Generator</span>
          </Button>
          <Button
            size="sm"
            onClick={() => dispatchAction("upload-media")}
          >
            <Upload className="w-4 h-4" />
            <span>Upload Media</span>
          </Button>
        </div>
      );
    }

    if (path === "/create-post") {
      return null;
    }

    if (path === "/scheduled-posts") {
      return (
        <Button
          size="sm"
          onClick={() => navigate("/create-post")}
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </Button>
      );
    }

    if (path === "/analytics") {
      return (
        <Button
          size="sm"
          onClick={() => dispatchAction("export-report")}
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </Button>
      );
    }

    if (path === "/connected-accounts") {
      return (
        <Button
          size="sm"
          onClick={() => dispatchAction("connect-account")}
        >
          <Share2 className="w-4 h-4" />
          <span>Connect Account</span>
        </Button>
      );
    }

    // Default Dashboard action
    return (
      <Button
        size="sm"
        onClick={() => navigate("/create-post")}
      >
        <Plus className="w-4 h-4" />
        <span>Create Post</span>
      </Button>
    );
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200/80 dark:border-gray-800 flex items-center justify-between px-8 shrink-0 sticky top-0 z-30 select-none">
      {/* Left: Dynamic Context Actions for Active Page */}
      <div className="flex items-center gap-3">
        {renderDynamicActions()}
      </div>

      {/* Far Right: Dark Mode Toggle, Notification Bell, Profile Icon */}
      <div className="flex items-center gap-3">
        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon-sm"
          onClick={toggleDarkMode}
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </Button>

        {/* Notification Bell */}
        <Button variant="ghost" size="icon-sm" title="Notifications" className="relative">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </Button>

        {/* Profile Avatar Icon */}
        <div className="relative">
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative shrink-0 group"
            title="User Account"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
              alt="User profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#243746] transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </Button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in">
                <Button
                  variant="ghost"
                  className="w-full justify-start"
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
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

