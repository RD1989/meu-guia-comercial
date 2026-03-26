import React from "react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
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
  Search,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award
} from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { DUMMY_CATEGORIES } from "@/data/dummy-data";
import { Button } from "@/components/ui/button";

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

const Categories = () => {
  const navigate = useNavigate();

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const featuredCategories = categories.slice(0, 3);
  const displayCategories = categories.length > 0 ? categories : DUMMY_CATEGORIES;

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header />
      
      {/* Hero Header */}
      <section className="bg-slate-950 pt-32 pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 blur-[120px] rounded-full translate-y-[-50%] translate-x-[-20%]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            Explorar Segmentos
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-[900] text-white tracking-tighter mb-4">
            Todas as <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Categorias</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-xl mx-auto">
            Navegue pelos melhores estabelecimentos e serviços da sua cidade organizados por segmento.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Main Grid */}
          <div className="lg:col-span-3 space-y-8">
            {/* Search Bar in Categories */}
            <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 flex items-center gap-4">
              <Search className="h-5 w-5 text-slate-300 ml-2" />
              <input 
                type="text" 
                placeholder="Qual categoria você procura?"
                className="flex-1 bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {isLoading ? (
                Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="h-44 rounded-3xl bg-slate-200 animate-pulse"></div>
                ))
              ) : (
                displayCategories.map((cat: any, i) => {
                  const Icon = ICON_MAP[cat.icon] || Building2;
                  const colors = COLOR_MAP[cat.color] || "text-primary bg-primary/5 border-primary/10";
                  
                  return (
                    <motion.div
                      key={cat.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: i * 0.02 }}
                      whileHover={{ y: -5 }}
                      onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                      className="group bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                    >
                      <div className={cn("h-16 w-16 rounded-[1.2rem] flex items-center justify-center mb-4 transition-all duration-300 border shadow-inner", colors)}>
                        <Icon className="h-8 w-8 transition-transform group-hover:scale-110" />
                      </div>
                      <span className="font-black text-slate-900 text-xs mb-1 uppercase tracking-tight">{cat.name}</span>
                      <div className="h-1 w-4 bg-slate-100 group-hover:w-8 group-hover:bg-primary transition-all rounded-full"></div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

          {/* Sidebar Ads / Featured */}
          <div className="space-y-6">
            <div className="bg-primary rounded-[2.5rem] p-8 text-white relative overflow-hidden group">
               <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-24 w-24" />
               </div>
               <div className="relative z-10">
                  <Badge className="bg-white/20 text-white border-white/10 text-[10px] font-black uppercase tracking-widest mb-4">Em Destaque</Badge>
                  <h3 className="text-2xl font-black tracking-tighter leading-tight mb-4">Anuncie sua Empresa Aqui</h3>
                  <p className="text-white/70 text-sm font-medium mb-6">Apareça no topo das buscas e ganhe visibilidade total na sua região.</p>
                  <Button variant="outline" className="w-full bg-white text-primary border-none font-black rounded-xl hover:bg-slate-100">
                    Saiba Mais
                  </Button>
               </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 space-y-6 shadow-sm">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                 <Award className="h-4 w-4 text-primary" /> Segmentos Populares
               </h4>
               <div className="space-y-4">
                  {DUMMY_CATEGORIES.slice(0, 5).map((cat) => (
                    <div 
                      key={cat.id} 
                      onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                      className="flex items-center justify-between group cursor-pointer"
                    >
                       <div className="flex items-center gap-3">
                          <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center border", COLOR_MAP[cat.color])}>
                             {React.createElement(ICON_MAP[cat.icon] || Building2, { className: "h-4 w-4" })}
                          </div>
                          <span className="text-sm font-bold text-slate-700 group-hover:text-primary transition-colors">{cat.name}</span>
                       </div>
                       <ArrowRight className="h-4 w-4 text-slate-200 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  ))}
               </div>
            </div>

            {/* Simulated Banner/Ad */}
            <div className="aspect-[4/5] rounded-[2.5rem] overflow-hidden relative shadow-lg group cursor-pointer ring-1 ring-slate-100">
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10"></div>
               <img 
                 src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=800" 
                 alt="Ad" 
                 className="w-full h-full object-cover grayscale-[0.2] transition-transform duration-700 group-hover:scale-110"
               />
               <div className="absolute bottom-0 left-0 p-8 z-20">
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Restaurante do Mês</div>
                  <div className="text-xl font-black text-white leading-tight">Gastrô Gourmet Elite</div>
               </div>
            </div>
          </div>
        </div>
      </main>

      <BottomTabBar />
    </div>
  );
};

const Badge = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border", className)}>
    {children}
  </span>
);

export default Categories;
