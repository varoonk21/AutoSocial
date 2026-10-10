import { useState, useEffect, useRef } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutGrid,
  Layers,
  PlusSquare,
  FolderKanban,
  Calendar,
  Image,
  BarChart3,
  Palette,
  Share2,
  Settings,
  ChevronDown,
  ChevronUp,
  User,
  LogOut,
} from "lucide-react";
import { signOut, useSession } from "@/lib/auth-client";
import { useImageStore } from "@/store/imageStore";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "home", label: "Dashboard", end: true },
  { to: "/dashboard/brand-kit", icon: "brand-kit", label: "Brand Kit" },
  { to: "/dashboard/media-library", icon: "media", label: "Media Library" },
  { to: "/dashboard/analytics", icon: "analytics", label: "Analytics" },
  { to: "/dashboard/connected-accounts", icon: "accounts", label: "Connected Accounts" },
  { to: "/dashboard/settings", icon: "settings", label: "Settings" },
];

const CONTENT_SUBMENU = [
  {
    to: "/dashboard/content/create",
    icon: "create",
    label: "Create",
    matchPaths: ["/dashboard/content/create", "/dashboard/create-post"],
  },
  {
    to: "/dashboard/content/manage",
    icon: "manage",
    label: "Manage",
    matchPaths: ["/dashboard/content/manage", "/dashboard/drafts"],
  },
  {
    to: "/dashboard/content/schedule",
    icon: "schedule",
    label: "Schedule",
    matchPaths: ["/dashboard/content/schedule", "/dashboard/scheduled-posts", "/dashboard/calendar"],
  },
];

const ICONS: Record<string, React.ReactNode> = {
  home: <LayoutGrid className="w-[18px] h-[18px]" />,
  content: <Layers className="w-[18px] h-[18px]" />,
  create: <PlusSquare className="w-[18px] h-[18px]" />,
  manage: <FolderKanban className="w-[18px] h-[18px]" />,
  schedule: <Calendar className="w-[18px] h-[18px]" />,
  "brand-kit": <Palette className="w-[18px] h-[18px]" />,
  media: <Image className="w-[18px] h-[18px]" />,
  analytics: <BarChart3 className="w-[18px] h-[18px]" />,
  accounts: <Share2 className="w-[18px] h-[18px]" />,
  settings: <Settings className="w-[18px] h-[18px]" />,
};

const isContentChildRoute = (path: string) => {
  return (
    path.startsWith("/dashboard/content") ||
    path.startsWith("/dashboard/create-post") ||
    path.startsWith("/dashboard/scheduled-posts") ||
    path.startsWith("/dashboard/calendar") ||
    path.startsWith("/dashboard/drafts")
  );
};

const navItemClass = (isActive: boolean) =>
  cn(
    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer",
    isActive
      ? "bg-slate-100 text-slate-900"
      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
  );

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { data: session } = useSession();
  const getImageUrl = useImageStore((state) => state.getImageUrl);

  const isContentActive = isContentChildRoute(location.pathname);
  const [isContentOpen, setIsContentOpen] = useState(() => isContentChildRoute(location.pathname));
  const [showUserMenu, setShowUserMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isContentChildRoute(location.pathname)) {
      setIsContentOpen(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = async () => {
    await signOut();
    navigate("/login");
  };

  const isSubItemActive = (matchPaths: string[]) =>
    matchPaths.some((p) => location.pathname.startsWith(p));

  return (
    <aside className="w-[260px] shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      {/* Logo */}
      <div className="px-5 pt-5 pb-4">
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img
            src="/Icon.png"
            alt="AutoSocial"
            className="w-9 h-9 object-contain rounded-lg"
          />
          <span className="font-bold text-slate-900 text-lg tracking-tight">
            AutoSocial
          </span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-2 space-y-1">
        <NavLink to="/dashboard" end className={({ isActive }) => navItemClass(isActive)}>
          {ICONS.home}
          <span>Dashboard</span>
        </NavLink>

        {/* Content accordion */}
        <div>
          <button
            type="button"
            onClick={() => setIsContentOpen(!isContentOpen)}
            className={navItemClass(isContentActive) + " w-full"}
          >
            {ICONS.content}
            <span>Content</span>
            <ChevronDown
              className={cn(
                "w-4 h-4 ml-auto transition-transform duration-200 text-slate-400",
                isContentOpen && "rotate-180"
              )}
            />
          </button>
          {isContentOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l border-slate-200 pl-3">
              {CONTENT_SUBMENU.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    navItemClass(isActive || isSubItemActive(item.matchPaths))
                  }
                >
                  {ICONS[item.icon]}
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        {NAV_ITEMS.filter((item) => item.to !== "/dashboard").map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => navItemClass(isActive)}
          >
            {ICONS[item.icon]}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer: user */}
      <div className="px-3 pb-4 pt-2 space-y-1">
        {/* User profile */}
        <div className="relative pt-2" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Avatar className="size-9 ring-1 ring-slate-200">
              <AvatarImage
                src={
                  session?.user?.image
                    ? getImageUrl(session.user.image)
                    : undefined
                }
                alt={session?.user?.name || "User"}
              />
              <AvatarFallback className="text-xs font-semibold bg-teal-50 text-teal-700">
                {session?.user?.name
                  ? session.user.name.slice(0, 2).toUpperCase()
                  : "US"}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium text-slate-900 truncate flex-1 text-left">
              {session?.user?.name || "User"}
            </span>
            <ChevronUp
              className={cn(
                "w-4 h-4 text-slate-400 transition-transform",
                showUserMenu && "rotate-180"
              )}
            />
          </button>

          {showUserMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 bg-white border border-slate-200 rounded-xl shadow-lg py-1.5 z-50">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(false);
                  navigate("/dashboard/settings");
                }}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                <User className="w-4 h-4" />
                Profile Settings
              </button>
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2.5 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
