import React, { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { 
  ArrowRight, 
  TrendingUp, 
  Loader2, 
  Sparkles, 
  Search as SearchIcon, 
  MapPin, 
  Star, 
  ChevronRight,
  ShieldCheck,
  Building2,
  CheckCircle2,
  Zap,
  Globe,
  ArrowUpRight,
  Smartphone,
  Quote,
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
  Palmtree
} from "lucide-react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { BusinessCard } from "@/components/portal/BusinessCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Input } from "@/components/ui/input";
import { motion, useScroll, useTransform } from "framer-motion";
import { DUMMY_TESTIMONIALS, DUMMY_CATEGORIES, DUMMY_BUSINESSES } from "@/data/dummy-data";

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
  slate: "text-slate-500 bg-slate-50 border-slate-100",
  zinc: "text-zinc-500 bg-zinc-50 border-zinc-100",
  indigo: "text-indigo-500 bg-indigo-50 border-indigo-100",
  amber: "text-amber-500 bg-amber-50 border-amber-100",
  orange: "text-orange-500 bg-orange-50 border-orange-100",
  cyan: "text-cyan-500 bg-cyan-50 border-cyan-100",
  violet: "text-violet-500 bg-violet-50 border-violet-100",
  teal: "text-teal-500 bg-teal-50 border-teal-100",
};

const Index = () => {
  const { user, isLojista, isAdmin, isSuperAdmin } = useAuth();
  const navigate = useNavigate();
  const { config } = usePlatform();
  const [search, setSearch] = useState("");
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.99]);

  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name")
        .limit(12);
      if (error) throw error;
      return data;
    },
  });

  const { data: businesses = [], isLoading: bizLoading } = useQuery({
    queryKey: ["featured-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, categories(name), reviews(count)")
        .eq("active", true)
        .order("performance_score", { ascending: false })
        .limit(8);
      if (error) throw error;
      return data;
    },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/buscar?q=${encodeURIComponent(search)}`);
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden text-slate-900">
      <Header />

      {/* Elite Compact Hero Section */}
      <section ref={heroRef} className="relative min-h-[70vh] flex items-center justify-center overflow-hidden pt-20 bg-[#F8FAFC]">
        {/* Soft Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-0 w-[40%] h-[40%] bg-primary/5 blur-[80px] rounded-full"></div>
          <div className="absolute bottom-0 right-0 w-[30%] h-[30%] bg-emerald-50/20 blur-[60px] rounded-full"></div>
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-5xl mx-auto px-6 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] mb-8 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            Guia Premium {config.platform_city}
          </motion.div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-[900] text-slate-950 tracking-tighter leading-[0.9] mb-6">
            Sua cidade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">bem conectada.</span>
          </h1>

          <p className="text-base md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10 leading-relaxed">
            Descubra estabelecimentos de elite, serviços exclusivos e oportunidades únicas na palma da sua mão.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative flex flex-col md:flex-row items-center bg-white border border-slate-200 rounded-[1.5rem] shadow-[0_15px_40px_rgba(0,0,0,0.05)] p-2 gap-2 group-focus-within:border-primary/40 transition-all duration-500">
                <div className="flex items-center flex-1 w-full pl-4">
                  <SearchIcon className="h-5 w-5 text-slate-300 group-hover:text-primary transition-colors" />
                  <Input 
                    className="border-none bg-transparent h-12 text-lg focus-visible:ring-0 placeholder:text-slate-200 w-full font-black text-slate-900"
                    placeholder="O que você busca hoje?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto h-12 px-8 rounded-[1.2rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-base shadow-xl active:scale-95 transition-all">
                  Explorar
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats - Compact */}
      <section className="bg-white py-12 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { label: 'Empresas', value: '4.8k+', color: 'text-primary' },
              { label: 'Categorias', value: '50+', color: 'text-emerald-500' },
              { label: 'Visitas', value: '25k+', color: 'text-indigo-500' },
              { label: 'Satisfação', value: '100%', color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className={cn("text-3xl font-[900] tracking-tighter mb-1", stat.color)}>{stat.value}</div>
                <div className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Compact Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-12">
          <h2 className="text-3xl md:text-5xl font-black text-slate-950 tracking-tighter mb-4">Destaques por Segmento</h2>
          <p className="text-slate-500 text-lg font-medium max-w-xl mx-auto">Explore as melhores opções cuidadosamente selecionadas.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {catLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-[1.5rem] bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {(categories.length > 0 ? categories : DUMMY_CATEGORIES).map((cat: any, i) => {
                const Icon = ICON_MAP[cat.icon] || Building2;
                const colors = COLOR_MAP[cat.color] || "text-primary bg-primary/5 border-primary/10";
                
                return (
                  <motion.div 
                    key={cat.id}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                    className="group bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl hover:shadow-primary/5 transition-all duration-500"
                  >
                    <div className={cn("h-14 w-14 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 border", colors)}>
                      <Icon className="h-7 w-7 transition-transform group-hover:scale-110" />
                    </div>
                    <span className="font-black text-slate-900 text-sm mb-1">{cat.name}</span>
                    <div className="h-0.5 w-4 bg-slate-100 group-hover:w-8 group-hover:bg-primary transition-all rounded-full"></div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Featured Businesses - Compact */}
      <section id="destaques" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-2 block">Premium Selection</span>
              <h2 className="text-3xl md:text-5xl font-[900] text-slate-950 tracking-tighter">O Melhor da Região</h2>
            </div>
            <Link to="/buscar">
              <Button variant="ghost" className="h-10 px-6 rounded-xl font-black text-primary hover:bg-primary/5 transition-all text-xs">
                Ver Tudo <ArrowUpRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bizLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] rounded-[2rem] bg-slate-100 animate-pulse"></div>)
            ) : (
              (businesses.length > 0 ? businesses : DUMMY_BUSINESSES).map((biz: any, i) => (
                <motion.div 
                  key={biz.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <BusinessCard 
                    {...biz} 
                    imageUrl={biz.image_url} // Fix for image fallback
                    categoryName={biz.categories?.name || biz.categoryName} 
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* NEW: Elite Ribbon Content (Continuous Carousel) */}
      <section className="py-12 bg-slate-50 border-y border-slate-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-8 text-center md:text-left">
          <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-2 block">Parceiros de Elite</span>
          <h2 className="text-xl md:text-3xl font-black text-slate-950 tracking-tighter">Empresas Certificadas</h2>
        </div>
        
        <div className="relative flex overflow-x-hidden pt-4 pb-12">
          <motion.div 
            animate={{ x: "-100%" }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap gap-8 items-center px-4"
          >
            {[...DUMMY_BUSINESSES, ...DUMMY_BUSINESSES].map((biz, i) => (
              <Link 
                key={`${biz.id}-${i}`} 
                to={`/negocio/${biz.slug}`}
                className="flex items-center gap-6 bg-white px-10 py-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-primary transition-all group shrink-0 min-w-[300px]"
              >
                <div className="h-20 w-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 group-hover:border-primary/20 shadow-inner">
                   <img src={biz.image_url} alt={biz.name} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110" />
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{biz.name}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{biz.address}</div>
                   <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-black text-slate-600">{biz.average_rating} Professional</span>
                   </div>
                </div>
              </Link>
            ))}
          </motion.div>

          <motion.div 
            animate={{ x: "-100%" }}
            transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
            className="flex whitespace-nowrap gap-8 items-center px-4 absolute top-4 left-full h-full"
          >
            {[...DUMMY_BUSINESSES, ...DUMMY_BUSINESSES].map((biz, i) => (
              <Link 
                key={`${biz.id}-dup-${i}`} 
                to={`/negocio/${biz.slug}`}
                className="flex items-center gap-6 bg-white px-10 py-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/20 hover:border-primary transition-all group shrink-0 min-w-[300px]"
              >
                <div className="h-20 w-20 rounded-2xl bg-slate-50 overflow-hidden border border-slate-100 group-hover:border-primary/20 shadow-inner">
                   <img src={biz.image_url} alt={biz.name} className="h-full w-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-110" />
                </div>
                <div className="flex flex-col gap-1">
                   <div className="text-xl font-black text-slate-900 group-hover:text-primary transition-colors leading-tight">{biz.name}</div>
                   <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{biz.address}</div>
                   <div className="flex items-center gap-1 mt-1">
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                      <span className="text-[10px] font-black text-slate-600">{biz.average_rating} Professional</span>
                   </div>
                </div>
              </Link>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Benefits - Professional Compact */}
      <section className="py-24 bg-slate-950 text-white overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Para Negócios</span>
              <h2 className="text-4xl md:text-5xl font-[900] tracking-tighter mb-8 leading-[0.9]">Escale sua <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">Autoridade Local.</span></h2>
              <p className="text-lg text-slate-400 font-medium mb-10 leading-relaxed">Conecte-se com clientes de alto valor através de uma presença digital de elite.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'IA Local', desc: 'Sugestões inteligentes para o público certo.', icon: Zap },
                  { title: 'Social Connect', desc: 'Integração WhatsApp e Redes Sociais.', icon: Globe },
                  { title: 'Booking Pro', desc: 'Reservas e orçamentos simplificados.', icon: CheckCircle2 },
                  { title: 'Growth Engine', desc: 'Dados reais sobre seu crescimento.', icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-2 group">
                    <div className="h-10 w-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all">
                      <item.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-black mb-1">{item.title}</h4>
                      <p className="text-slate-500 text-xs font-medium">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12">
                 <Link to="/auth?mode=register">
                    <Button size="lg" className="h-12 px-10 rounded-xl bg-white text-slate-950 font-black text-sm hover:bg-slate-200 transition-all">
                      Anunciar Empresa <ArrowUpRight className="ml-2 h-5 w-5 text-primary" />
                    </Button>
                 </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="relative hidden lg:block"
            >
              <div className="aspect-square max-w-sm ml-auto rounded-[2rem] bg-indigo-500 overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800" 
                  alt="Elite Office" 
                  className="w-full h-full object-cover grayscale"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Compact */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-[900] text-slate-950 tracking-tighter">Vozes da Comunidade</h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {DUMMY_TESTIMONIALS.slice(0, 3).map((testimonial, i) => (
            <motion.div 
              key={testimonial.id}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="p-8 bg-slate-50 rounded-[2rem] border border-slate-100 flex flex-col justify-between"
            >
              <p className="text-lg text-slate-600 font-medium italic mb-8 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar_url} 
                  alt={testimonial.name} 
                  className="h-12 w-12 rounded-2xl object-cover border-2 border-white shadow-lg"
                />
                <div>
                  <div className="font-black text-slate-950 text-sm leading-none mb-1">{testimonial.name}</div>
                  <div className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA Compact */}
      <section className="bg-primary py-24 relative overflow-hidden">
        <div className="max-w-3xl mx-auto px-6 text-center relative z-10 text-white">
          <h3 className="text-4xl md:text-6xl font-[900] tracking-tighter mb-10 leading-[0.9]">Pronto para <br /> ser encontrado?</h3>
          <Link to="/auth?mode=register">
            <Button size="lg" className="h-14 px-12 rounded-xl bg-white text-primary font-black text-xl hover:bg-slate-100 shadow-2xl active:scale-95 transition-all">
              Cadastrar Agora
            </Button>
          </Link>
        </div>
      </section>

      <footer className="bg-slate-950 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center">
               <MapPin className="text-white h-5 w-5" />
            </div>
            <span className="font-black text-xl tracking-tighter uppercase">{config.platform_name}</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-8">Developed with Elite Standards — {new Date().getFullYear()}</p>
          <div className="flex justify-center gap-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
             <a href="#" className="hover:text-white transition-colors">Termos</a>
             <a href="#" className="hover:text-white transition-colors">Privacidade</a>
             <a href="#" className="hover:text-white transition-colors">Suporte</a>
          </div>
        </div>
      </footer>

      <BottomTabBar />
    </div>
  );
};

export default Index;
