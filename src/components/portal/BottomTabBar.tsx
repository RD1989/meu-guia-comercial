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
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-2xl border-t border-slate-100/80 shadow-[0_-4px_20px_rgba(0,0,0,0.03)] md:hidden pb-[env(safe-area-inset-bottom)]">
      <div className="flex items-center justify-around h-16 px-3">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-1.5 rounded-2xl transition-all text-slate-400 active:scale-90",
                isActive && "text-primary bg-primary/10 font-black shadow-sm"
              )
            }
          >
            <tab.icon className="h-5 w-5" />
            <span className="text-[10px] font-semibold tracking-tight">{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
