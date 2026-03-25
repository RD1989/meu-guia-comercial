import { LayoutDashboard, Store, Users, FileText, Settings, Sparkles, LogOut, Tags, Link as LinkIcon, Image as ImageIcon, Briefcase } from "lucide-react";
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

const adminMenuItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "Empresas", url: "/admin/empresas", icon: Store },
  { title: "Usuários", url: "/admin/usuarios", icon: Users },
  { title: "Categorias", url: "/admin/categorias", icon: Tags },
  { title: "Blog / Artigos", url: "/admin/blog", icon: FileText },
  { title: "Banco de Referências", url: "/admin/referencias", icon: LinkIcon },
  { title: "Vagas de Emprego", url: "/admin/vagas", icon: Briefcase },
  { title: "Biblioteca de Mídias", url: "/admin/midias", icon: ImageIcon },
  { title: "Configuração IA", url: "/admin/ia", icon: Sparkles },
  { title: "Configurações", url: "/admin/config", icon: Settings },
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
    <Sidebar collapsible="icon" className="border-r border-border bg-slate-950 text-slate-200">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs uppercase tracking-wider text-slate-500 px-4 py-4">
            {!collapsed && "Painel Administrative"}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === "/admin"}
                      className="hover:bg-slate-900 transition-colors"
                      activeClassName="bg-primary/20 text-primary border-l-2 border-primary font-medium"
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

      <SidebarFooter className="p-3 bg-slate-950 border-t border-slate-900">
        {!collapsed && (
          <div className="mb-4 px-2">
            <p className="text-xs font-medium text-slate-200 truncate">
              Super Admin
            </p>
            <p className="text-[10px] text-slate-500 truncate">{user?.email}</p>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-slate-400 hover:text-white hover:bg-slate-900 gap-2"
        >
          <LogOut className="h-4 w-4" />
          {!collapsed && "Sair do Sistema"}
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
