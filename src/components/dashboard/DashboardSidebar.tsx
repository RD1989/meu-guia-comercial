import { LayoutDashboard, Package, Store, BarChart3, Settings, LogOut, Briefcase, ExternalLink } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Link } from "react-router-dom";

const menuItems = [
  { title: "Painel", url: "/dashboard", icon: LayoutDashboard },
  { title: "Meu Negócio", url: "/dashboard/negocio", icon: Store },
  { title: "Produtos", url: "/dashboard/produtos", icon: Package },
  { title: "Vagas", url: "/dashboard/vagas", icon: Briefcase },
  { title: "Métricas", url: "/dashboard/metricas", icon: BarChart3 },
  { title: "Configurações", url: "/dashboard/config", icon: Settings },
];

export function DashboardSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-slate-200 bg-white">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center px-4 py-4 mb-2">
            {!collapsed && <span className="text-lg font-black text-slate-800 tracking-tight">Painel<span className="text-primary">Lojista</span></span>}
            {collapsed && <span className="text-lg font-black text-primary mx-auto">PL</span>}
          </div>

          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-2">
            {!collapsed && "Menu Principal"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/dashboard"}
                      className="text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors mx-2 rounded-lg"
                      activeClassName="bg-primary/10 text-primary font-bold"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-4 bg-white border-t border-slate-100">
        {!collapsed && (
          <div className="mb-4">
            <Link to="/" target="_blank">
              <Button variant="outline" className="w-full justify-center text-slate-600 border-slate-200 hover:bg-slate-50 gap-2 mb-4 h-9">
                <ExternalLink className="h-4 w-4" />
                Ver site
              </Button>
            </Link>
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                {user?.user_metadata?.name?.[0]?.toUpperCase() || "L"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-slate-800 truncate">
                  {user?.user_metadata?.name || "Lojista"}
                </p>
                <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={`w-full text-slate-500 hover:text-red-600 hover:bg-red-50 gap-2 ${collapsed ? "justify-center" : "justify-start px-2"}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sair"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
