import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, PlusSquare, Calendar, Image, BarChart3, Palette, Share2, Settings, HelpCircle } from "lucide-react";

const NAV_ITEMS = [
  { to: "/", icon: "home", label: "Dashboard" },
  { to: "/create-post", icon: "create", label: "Create Post" },
  { to: "/scheduled-posts", icon: "calendar", label: "Scheduled Posts" },
  { to: "/media-library", icon: "media", label: "Media Library" },
  { to: "/analytics", icon: "analytics", label: "Analytics" },
  { to: "/brand-kit", icon: "brand-kit", label: "Brand Kit" },
  { to: "/connected-accounts", icon: "accounts", label: "Connected Accounts" },
  { to: "/settings", icon: "settings", label: "Settings" },
];

const ICONS = {
  home: <LayoutGrid className="w-5 h-5" />,
  create: <PlusSquare className="w-5 h-5" />,
  calendar: <Calendar className="w-5 h-5" />,
  media: <Image className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
  "brand-kit": <Palette className="w-5 h-5" />,
  accounts: <Share2 className="w-5 h-5" />,
  settings: <Settings className="w-5 h-5" />,
};

export function Sidebar() {
  const navigate = useNavigate();

  return (
    <aside className="w-68 bg-white border-r border-gray-200 flex flex-col shrink-0 select-none h-screen overflow-y-auto custom-scroll">
      {/* Header Logo - AutoSocial Branding */}
      <div className="pt-6 pb-4 px-5 flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
        <img src="/Icon.png" alt="AutoSocial Icon" className="w-8 h-8 object-contain rounded-md" />
        <span className="font-bold text-[#1c2b36] text-[20px] tracking-tight">AutoSocial</span>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 px-3 pt-3 space-y-1">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/"}
            className={({ isActive }) =>
              `group flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[14.5px] font-semibold transition-all duration-150 ${
                isActive ? "bg-[#243746] text-white shadow-xs" : "text-[#1c2b36] hover:bg-[#f0f2f5] hover:text-[#0c1014]"
              }`
            }
          >
            {({ isActive }) => (
              <div className="flex items-center gap-3.5">
                <span className={isActive ? "text-white" : "text-[#1c2b36] group-hover:text-[#0c1014]"}>{ICONS[item.icon]}</span>
                <span>{item.label}</span>
              </div>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom Help Section */}
      <div className="p-3 mt-auto">
        <div
          onClick={() => navigate("/settings")}
          className="bg-[#edf2f7] hover:bg-[#e2e8f0] rounded-xl px-3.5 py-2.5 flex items-center gap-3 text-[#1c2b36] font-semibold text-sm cursor-pointer transition-colors"
        >
          <HelpCircle className="w-5 h-5 text-[#1c2b36]" />
          <span>Help</span>
        </div>
      </div>
    </aside>
  );
}
