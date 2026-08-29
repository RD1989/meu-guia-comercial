import React from "react";
import { 
  Building2, 
  UtensilsCrossed, 
  Laptop, 
  Shirt, 
  HeartPulse, 
  Briefcase, 
  CarFront, 
  GraduationCap, 
  Dumbbell, 
  Dog, 
  FileText, 
  Palmtree,
  ArrowRight
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  UtensilsCrossed,
  Laptop,
  Shirt,
  HeartPulse,
  Briefcase,
  CarFront,
  GraduationCap,
  Dumbbell,
  Dog,
  FileText,
  Building2,
  Palmtree
};

const COLOR_MAP: Record<string, string> = {
  rose: "text-rose-500 bg-rose-50 border-rose-100",
  blue: "text-blue-500 bg-blue-50 border-blue-100",
  pink: "text-pink-500 bg-pink-50 border-pink-100",
  emerald: "text-emerald-500 bg-emerald-50 border-emerald-100",
  indigo: "text-indigo-500 bg-indigo-50 border-indigo-100",
  amber: "text-amber-500 bg-amber-50 border-amber-100",
  orange: "text-orange-500 bg-orange-50 border-orange-100",
  cyan: "text-cyan-500 bg-cyan-50 border-cyan-100",
  violet: "text-violet-500 bg-violet-50 border-violet-100",
  teal: "text-teal-500 bg-teal-50 border-teal-100",
};

interface CategoryGridProps {
  categories: any[];
  isLoading: boolean;
}

export function CategoryGrid({ categories = [], isLoading }: CategoryGridProps) {
  const navigate = useNavigate();

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 tracking-tight">Categorias em Destaque</h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mt-0.5">Explore os principais segmentos comerciais</p>
        </div>
        <Link 
          to="/categorias" 
          className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold hover:underline"
        >
          Ver Todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 rounded-3xl bg-slate-100 animate-pulse" />
          ))
        ) : (
          categories.slice(0, 12).map((cat, i) => {
            const Icon = ICON_MAP[cat.icon] || Building2;
            const colors = COLOR_MAP[cat.color] || "text-primary bg-primary/5 border-primary/10";

            return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.03 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="group bg-white border border-slate-200/80 rounded-2xl sm:rounded-3xl p-5 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl hover:shadow-primary/5 hover:border-primary/30 transition-all duration-300"
              >
                <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-3 border shadow-inner transition-transform group-hover:scale-110", colors)}>
                  <Icon className="h-7 w-7" />
                </div>
                <span className="font-bold text-slate-800 text-xs line-clamp-1 group-hover:text-primary transition-colors">
                  {cat.name}
                </span>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}
