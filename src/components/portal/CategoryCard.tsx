import { Store, Utensils, Wrench, Heart, GraduationCap, Car, ShoppingBag, Scissors, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  store: Store,
  utensils: Utensils,
  wrench: Wrench,
  heart: Heart,
  "graduation-cap": GraduationCap,
  car: Car,
  "shopping-bag": ShoppingBag,
  scissors: Scissors,
};

interface CategoryCardProps {
  name: string;
  icon?: string;
  onClick?: () => void;
  className?: string;
}

export function CategoryCard({ name, icon, onClick, className }: CategoryCardProps) {
  const IconComp = icon ? iconMap[icon] || Store : Store;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-2.5 p-4 rounded-2xl bg-card border border-border",
        "hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all duration-200",
        "group active:scale-95",
        className
      )}
    >
      <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/15 transition-colors">
        <IconComp className="h-5 w-5 text-primary" />
      </div>
      <span className="text-xs font-medium text-foreground">{name}</span>
    </button>
  );
}
