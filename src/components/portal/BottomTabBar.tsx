import { Home, Search, Newspaper, User } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const tabs = [
  { icon: Home, label: "Início", path: "/" },
  { icon: Search, label: "Buscar", path: "/buscar" },
  { icon: Newspaper, label: "Notícias", path: "/noticias" },
  { icon: User, label: "Perfil", path: "/perfil" },
];

export function BottomTabBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border backdrop-blur-lg bg-opacity-95 md:hidden">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => (
          <NavLink
            key={tab.path}
            to={tab.path}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl transition-all text-muted-foreground",
                isActive && "text-primary"
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
