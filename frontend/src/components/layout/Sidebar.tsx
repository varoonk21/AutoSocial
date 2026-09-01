import { NavLink, useNavigate } from "react-router-dom";
import { LayoutGrid, PlusSquare, Calendar, Image, BarChart3, Palette, Share2, Settings, HelpCircle } from "lucide-react";
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
} from "@/components/ui/sidebar";

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

export function AppSidebar() {
  const navigate = useNavigate();

  return (
    <Sidebar>
      <SidebarHeader>
        <div
          className="flex items-center gap-3 px-3 py-2 cursor-pointer"
          onClick={() => navigate("/")}
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
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={window.location.pathname === item.to}
                  >
                    <NavLink to={item.to} end={item.to === "/"}>
                      {ICONS[item.icon]}
                      <span>{item.label}</span>
                    </NavLink>
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
              asChild
              onClick={() => navigate("/settings")}
            >
              <a href="/settings">
                <HelpCircle className="w-5 h-5" />
                <span>Help</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
