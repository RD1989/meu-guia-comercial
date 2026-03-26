import { LayoutDashboard, Package, Store, BarChart3, Settings, LogOut, Briefcase, ExternalLink, Zap, Sparkles } from "lucide-react";
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
  { title: "Serviços", url: "/dashboard/servicos", icon: Zap },
  { title: "Vagas", url: "/dashboard/vagas", icon: Briefcase },
  { title: "Impulsionar (Ads)", url: "/dashboard/anuncios", icon: Sparkles },
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
    <Sidebar collapsible="icon" className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent>
        <SidebarGroup>
          <div className="flex items-center px-4 py-4 mb-2">
            {!collapsed && <span className="text-lg font-black text-white tracking-tight">Painel<span className="text-primary">Lojista</span></span>}
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
                      className="text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground transition-colors mx-2 rounded-xl"
                      activeClassName="bg-primary text-white font-black shadow-lg shadow-primary/20"
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

      <SidebarFooter className="p-4 bg-sidebar border-t border-sidebar-border/50">
        {!collapsed && (
          <div className="mb-4">
            <Link to="/" target="_blank">
              <Button className="w-full justify-center glass-morphism text-slate-900 border-none hover:bg-white gap-2 mb-4 h-12 rounded-xl font-black shadow-lg transition-all active:scale-95">
                <ExternalLink className="h-4 w-4" />
                Ver site
              </Button>
            </Link>
            <div className="flex items-center gap-3 px-2 py-3 rounded-2xl bg-sidebar-accent/50 border border-sidebar-border/30">
              <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white font-black text-sm shadow-lg shadow-primary/20">
                {user?.user_metadata?.name?.[0]?.toUpperCase() || "L"}
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-black text-white truncate leading-tight">
                  {user?.user_metadata?.name || "Lojista"}
                </p>
                <p className="text-[10px] font-medium text-slate-400 truncate tracking-tight">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={`w-full text-slate-400 hover:text-white hover:bg-red-500/20 gap-2 rounded-xl h-10 font-bold transition-all ${collapsed ? "justify-center" : "justify-start px-2"}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sair da Conta"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
