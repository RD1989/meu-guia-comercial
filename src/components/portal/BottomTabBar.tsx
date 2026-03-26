import { Home, Search, Tag, User, Grid } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Search, label: "Buscar", path: "/buscar" },
  { icon: Tag, label: "Ofertas", path: "/ofertas" },
  { icon: Grid, label: "Categorias", path: "/categorias" },
  { icon: User, label: "Perfil", path: "/perfil" },
];


export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-slate-100 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1.5 px-3 py-1 rounded-2xl transition-all text-slate-400",
                isActive && "text-primary bg-primary/5 font-bold"
              )
            }
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
