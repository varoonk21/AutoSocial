import { useState } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { LayoutGrid, PlusSquare, Calendar, Image, BarChart3, Palette, Share2, Settings, HelpCircle, ChevronDown, FileText, Clock } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from "@/components/ui/sidebar";

const NAV_ITEMS = [
  { to: "/dashboard", icon: "home", label: "Dashboard" },
  { to: "/dashboard/media-library", icon: "media", label: "Media Library" },
  { to: "/dashboard/analytics", icon: "analytics", label: "Analytics" },
  { to: "/dashboard/brand-kit", icon: "brand-kit", label: "Brand Kit" },
  { to: "/dashboard/connected-accounts", icon: "accounts", label: "Connected Accounts" },
  { to: "/dashboard/settings", icon: "settings", label: "Settings" },
];

const POST_SUBMENU = [
  { to: "/dashboard/drafts", icon: "draft", label: "Draft" },
  { to: "/dashboard/create-post", icon: "create", label: "Create" },
  { to: "/dashboard/scheduled-posts", icon: "scheduled", label: "Scheduled Post" },
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
  draft: <FileText className="w-4 h-4" />,
  scheduled: <Clock className="w-4 h-4" />,
};

export function AppSidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const [isPostMenuOpen, setIsPostMenuOpen] = useState(() => {
    return location.pathname.startsWith("/dashboard/create-post") ||
           location.pathname.startsWith("/dashboard/scheduled-posts") ||
           location.pathname.startsWith("/dashboard/drafts");
  });

  const isPostMenuActive = location.pathname.startsWith("/dashboard/create-post") ||
                           location.pathname.startsWith("/dashboard/scheduled-posts") ||
                           location.pathname.startsWith("/dashboard/drafts");

  return (
    <Sidebar>
      <SidebarHeader>
        <div
          className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          onClick={() => navigate("/dashboard")}
        >
          <img src="/Icon.png" alt="AutoSocial Icon" className="w-8 h-8 object-contain rounded-md" />
          <span className="font-bold text-[#1c2b36] text-[20px] tracking-tight">AutoSocial</span>
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Dashboard - First Item */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<NavLink to="/dashboard" end />}
                  isActive={location.pathname === "/dashboard"}
                >
                  {ICONS.home}
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Post Menu Item with Submenu */}
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={isPostMenuActive}
                  onClick={() => setIsPostMenuOpen(!isPostMenuOpen)}
                >
                  <PlusSquare className="w-5 h-5" />
                  <span>Post</span>
                  <ChevronDown
                    className={`w-4 h-4 ml-auto transition-transform duration-200 ${
                      isPostMenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </SidebarMenuButton>
                {isPostMenuOpen && (
                  <SidebarMenuSub>
                    {POST_SUBMENU.map((item) => (
                      <SidebarMenuSubItem key={item.to}>
                        <SidebarMenuSubButton
                          render={<NavLink to={item.to} />}
                          isActive={location.pathname === item.to}
                        >
                          {ICONS[item.icon]}
                          <span>{item.label}</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>

              {/* Other Nav Items */}
              {NAV_ITEMS.filter(item => item.to !== "/dashboard").map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    render={<NavLink to={item.to} end={item.to === "/"} />}
                    isActive={window.location.pathname === item.to}
                  >
                    {ICONS[item.icon]}
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<a href="/dashboard/settings" />}
              onClick={() => navigate("/dashboard/settings")}
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
