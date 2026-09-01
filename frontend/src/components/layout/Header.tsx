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
          <button
            onClick={() => dispatchAction("ai-generator")}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 rounded-xl text-xs font-bold shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>AI Generator</span>
          </button>
          <button
            onClick={() => dispatchAction("upload-media")}
            className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Media</span>
          </button>
        </div>
      );
    }

    if (path === "/create-post") {
      return (
        <div className="flex items-center gap-2">
          <button
            onClick={() => dispatchAction("save-draft")}
            className="px-3.5 py-2 bg-white border border-gray-300 hover:bg-gray-50 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Save className="w-4 h-4" />
            <span>Save Draft</span>
          </button>
          <button
            onClick={() => dispatchAction("publish-post")}
            className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule / Publish</span>
          </button>
        </div>
      );
    }

    if (path === "/scheduled-posts") {
      return (
        <button
          onClick={() => navigate("/create-post")}
          className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Post</span>
        </button>
      );
    }

    if (path === "/analytics") {
      return (
        <button
          onClick={() => dispatchAction("export-report")}
          className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>Export Report</span>
        </button>
      );
    }

    if (path === "/brand-kit") {
      return (
        <button
          onClick={() => dispatchAction("save-brand-kit")}
          className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Brand Kit</span>
        </button>
      );
    }

    if (path === "/connected-accounts") {
      return (
        <button
          onClick={() => dispatchAction("connect-account")}
          className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
        >
          <Share2 className="w-4 h-4" />
          <span>Connect Account</span>
        </button>
      );
    }

    // Default Dashboard action
    return (
      <button
        onClick={() => navigate("/create-post")}
        className="px-4 py-2 bg-[#243746] hover:bg-[#1a2935] text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        <span>Create Post</span>
      </button>
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
        <button
          onClick={toggleDarkMode}
          className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
          title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-gray-600" />}
        </button>

        {/* Notification Bell */}
        <button className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer relative" title="Notifications">
          <Bell className="w-4 h-4 text-gray-600 dark:text-gray-300" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
        </button>

        {/* Profile Avatar Icon */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="relative shrink-0 cursor-pointer group flex items-center gap-1"
            title="User Account"
          >
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=80&h=80"
              alt="User profile"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-gray-200 dark:ring-gray-700 group-hover:ring-[#243746] transition-all"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-gray-900" />
            <ChevronDown className="w-3 h-3 text-gray-500" />
          </button>

          {/* Dropdown Menu */}
          {showUserMenu && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate("/settings");
                  }}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Profile Settings</span>
                </button>
                <div className="my-1.5 border-t border-gray-100 dark:border-gray-700" />
                <button
                  onClick={handleLogout}
                  className="w-full px-3 py-2 text-left text-xs font-semibold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

