import { Home, LayoutDashboard, Shield, FileText, Scale, Mail, Accessibility, ChevronDown, ChevronRight } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useState } from "react";
import { useSidebar } from "@/components/ui/sidebar";
import { NavLink } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";

const mainItems = [
  { title: "Inicio", url: "/", icon: Home },
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard, requireAuth: true },
];

const infoItems = [
  { title: "Privacidad", url: "/privacy", icon: FileText },
  { title: "Términos", url: "/terms", icon: Scale },
  { title: "Contacto", url: "/contact", icon: Mail },
];

export function AppSidebar() {
  const [infoOpen, setInfoOpen] = useState(true);
  const { state } = useSidebar();
  const { user, isAdmin } = useAuth();

  const getNavClassName = ({ isActive }: { isActive: boolean }) =>
    isActive 
      ? "bg-primary/10 text-primary font-medium" 
      : "hover:bg-muted/50";

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-4 py-3 relative">
        {state !== "collapsed" ? (
          <>
            <div className="absolute right-2 top-2">
              <SidebarTrigger />
            </div>
            <div className="flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-primary" />
              <span className="font-semibold">EcoSense</span>
            </div>
          </>
        ) : null}
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegación</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => {
                if (item.requireAuth && !user) return null;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavClassName}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton asChild>
                    <NavLink to="/admin" className={getNavClassName}>
                      <Shield className="h-4 w-4" />
                      <span>Admin</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Información</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild onClick={() => setInfoOpen((v) => !v)}>
                  <button className="flex w-full items-center justify-between p-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      <span>Información</span>
                    </div>
                    <div className="opacity-70">
                      {infoOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </div>
                  </button>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {infoOpen &&
                infoItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavClassName}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <p className="text-xs text-muted-foreground">
          © 2024 EcoSense
        </p>
      </SidebarFooter>
    </Sidebar>
  );
}
