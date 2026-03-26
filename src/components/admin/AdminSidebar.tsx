import { LayoutDashboard, Store, Users, FileText, Settings, Sparkles, LogOut, Tags, Link as LinkIcon, Image as ImageIcon, Briefcase, CreditCard, Ticket, Bell, LifeBuoy, ExternalLink } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useNavigate } from "react-router-dom";
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

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Anúncios Pendentes", url: "/admin/pendentes", icon: Sparkles },
  { title: "Empresas", url: "/admin/empresas", icon: Store },
  { title: "Categorias", url: "/admin/categorias", icon: Tags },
  { title: "Planos", url: "/admin/planos", icon: CreditCard },
  { title: "Blog / Artigos", url: "/admin/blog", icon: FileText },
  { title: "Categorias do Blog", url: "/admin/blog/categorias", icon: Tags },
  { title: "Vagas de Emprego", url: "/admin/vagas", icon: Briefcase },
  { title: "Biblioteca de Mídias", url: "/admin/midias", icon: ImageIcon },
  { title: "Configurações", url: "/admin/config", icon: Settings },
  { title: "Usuários (Admins)", url: "/admin/usuarios", icon: Users },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
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
            {!collapsed && <span className="text-lg font-black text-white tracking-tight">Admin<span className="text-primary">Panel</span></span>}
            {collapsed && <span className="text-lg font-black text-primary mx-auto">AP</span>}
          </div>
          
          <SidebarGroupLabel className="text-[10px] font-bold uppercase tracking-widest text-slate-400 px-4 mb-2">
            {!collapsed && "Painel de Controle"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
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

      <SidebarFooter className="p-4 bg-sidebar border-t border-sidebar-border">
        {!collapsed && (
          <div className="mb-4">
            <Link to="/" target="_blank">
              <Button variant="outline" className="w-full justify-center text-white border-white/20 hover:bg-white/10 gap-2 mb-4 h-9 rounded-xl">
                <ExternalLink className="h-4 w-4" />
                Ver site
              </Button>
            </Link>
            <div className="flex items-center gap-3 px-2">
              <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center text-white font-black text-xs">
                SA
              </div>
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-white truncate">
                  Super Admin
                </p>
                <p className="text-[10px] text-sidebar-foreground/50 truncate">{user?.email}</p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className={`w-full text-sidebar-foreground/60 hover:text-white hover:bg-red-500/20 gap-2 rounded-xl ${collapsed ? "justify-center" : "justify-start px-2"}`}
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sair do Sistema"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
