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
import { SmartAdSlot } from "@/components/portal/SmartAdSlot";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { DUMMY_TESTIMONIALS, DUMMY_CATEGORIES, DUMMY_BUSINESSES, DUMMY_BANNERS } from "@/data/dummy-data";

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
  const userLocation = useLocation();
  const [search, setSearch] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [activeTab, setActiveTab] = useState<"businesses" | "promotions">("businesses");
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

  const { data: banners = [] } = useQuery({
    queryKey: ["banners"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .eq("active", true)
        .order("sort_order");
      
      if (error || !data || data.length === 0) return DUMMY_BANNERS;
      return data;
    },
  });

  const [currentBanner, setCurrentBanner] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, (config.banner_interval || 5) * 1000);

    return () => clearInterval(interval);
  }, [banners.length, config.banner_interval]);

  useEffect(() => {
    if (config.platform_city && !selectedCity) {
      setSelectedCity(config.platform_city);
    }
  }, [config.platform_city, selectedCity]);

  // Atualiza a cidade selecionada se o usuário for detectado em outra cidade
  useEffect(() => {
    if (userLocation.city && !selectedCity) {
      setSelectedCity(userLocation.city);
    }
  }, [userLocation.city, selectedCity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      const cityParam = selectedCity && selectedCity !== config.platform_city ? `&cidade=${encodeURIComponent(selectedCity)}` : '';
      if (activeTab === "businesses") {
        navigate(`/buscar?q=${encodeURIComponent(search)}${cityParam}`);
      } else {
        navigate(`/promocoes?q=${encodeURIComponent(search)}${cityParam}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0 font-sans selection:bg-primary/10 selection:text-primary overflow-x-hidden text-slate-900">
      <Header />

      {/* Hero Banners Carousel */}
      <section className="relative w-full h-[60vh] md:h-[75vh] overflow-hidden bg-slate-950">
        <AnimatePresence mode="wait">
          {banners.length > 0 && (
            <motion.div
              key={currentBanner}
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="absolute inset-0"
            >
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent z-10" />
              <img
                src={banners[currentBanner]?.image_url}
                alt={banners[currentBanner]?.title}
                className="w-full h-full object-cover opacity-60"
              />
              
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-6">
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="max-w-4xl space-y-6"
                >
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em]">
                    <Sparkles className="h-3.5 w-3.5" />
                    Elite Partner
                  </span>
                  <h2 className="text-4xl md:text-7xl font-[900] text-white tracking-tighter leading-[0.85] text-balance">
                    {banners[currentBanner]?.title}
                  </h2>
                  <p className="text-lg md:text-xl text-slate-300 font-medium max-w-2xl mx-auto line-clamp-2">
                    {banners[currentBanner]?.subtitle}
                  </p>
                  
                  {banners[currentBanner]?.button_link && (
                    <div className="pt-8">
                       <Button 
                         onClick={() => navigate(banners[currentBanner].button_link)}
                         size="lg" 
                         className="rounded-full h-14 px-10 bg-primary text-white hover:bg-primary/90 font-black uppercase text-xs tracking-widest gap-2 shadow-xl shadow-primary/20 border border-primary/50"
                       >
                         {banners[currentBanner]?.button_text || "Saiba Mais"} <ArrowUpRight className="h-4 w-4" />
                       </Button>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Carousel Indicators */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-30 flex gap-3">
          {banners.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentBanner(i)}
              className={cn(
                "h-1.5 transition-all duration-500 rounded-full",
                currentBanner === i ? "w-12 bg-primary" : "w-4 bg-white/20 hover:bg-white/40"
              )}
            />
          ))}
        </div>
      </section>

      {/* Hero Search Section - Compactada */}
      <section className="relative py-16 flex items-center justify-center overflow-hidden bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 relative z-20 w-full">
          <div className="bg-slate-950 p-8 md:p-12 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 blur-[100px] rounded-full -mr-32 -mt-32" />
             
             <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <div className="text-center lg:text-left">
                   <h2 className="text-3xl md:text-5xl font-[900] text-white tracking-tighter leading-none mb-4">
                      O que você busca <br /> em <span className="text-primary italic">{selectedCity || config.platform_city}?</span>
                   </h2>
                   <p className="text-slate-400 font-medium">Encontre os melhores serviços e empresas da sua região.</p>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                   <div className="flex-1 relative group">
                      <SearchIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-500 group-focus-within:text-primary transition-colors" />
                      <Input 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Ex: Restaurantes, Academias..." 
                        className="h-16 pl-14 pr-6 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-primary/50 focus:bg-white/10 transition-all font-bold"
                      />
                   </div>
                   <Button type="submit" size="lg" className="h-16 px-10 rounded-2xl bg-primary text-white hover:bg-primary/90 font-black uppercase text-xs tracking-widest gap-2">
                      Buscar <ArrowRight className="h-4 w-4" />
                   </Button>
                </form>
             </div>
          </div>
        </div>
      </section>

      {/* Featured Businesses - Simplificado */}
      <section id="destaques" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-end justify-between mb-12 gap-4">
            <div className="text-left">
              <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-2 block">Destaques Locais</span>
              <h2 className="text-3xl md:text-5xl font-[900] text-slate-950 tracking-tighter">O Melhor da Região</h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bizLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] rounded-[2rem] bg-slate-100 animate-pulse"></div>)
            ) : (
              (businesses.length > 0 ? businesses : DUMMY_BUSINESSES).slice(0, 4).map((biz: any, i) => (
                <div key={biz.id}>
                  <BusinessCard 
                    {...biz} 
                    imageUrl={biz.image_url}
                    categoryName={biz.categories?.name || biz.categoryName} 
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* NEW: Elite Ribbon Content (Continuous Carousel) */}
      <section className="py-20 bg-slate-50 border-y border-slate-100 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="text-left">
            <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-2 block">Parceiros de Elite</span>
            <h2 className="text-3xl md:text-5xl font-[900] text-slate-950 tracking-tighter leading-none">Empresas Certificadas</h2>
          </div>
          <div className="bg-primary/5 px-6 py-3 rounded-2xl border border-primary/10">
             <div className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 text-center md:text-left">Destaques em:</div>
             <div className="text-lg font-black text-slate-900">{selectedCity || config.platform_city}</div>
          </div>
        </div>
        
        <div className="relative flex overflow-x-hidden pt-4 pb-12">
          <motion.div 
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
            className="flex gap-8 items-center px-4"
          >
            {[
              { id: 'elite-1', name: 'Elite Fitness Center', address: 'Av. Principal, 1000', rating: '4.8', badge: 'Professional', slug: 'elite-fitness' },
              ...DUMMY_BUSINESSES,
              ...DUMMY_BUSINESSES
            ].map((biz: any, i) => (
              <motion.div 
                key={`${biz.id}-${i}`}
                className="inline-block w-[320px] bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-100 relative group cursor-pointer shrink-0"
                whileHover={{ y: -10 }}
              >
                <div className="absolute top-4 right-4 z-10">
                   <div className="bg-primary text-white text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" /> Certified
                   </div>
                </div>

                <div className="aspect-[16/9] rounded-[1.5rem] bg-slate-100 mb-4 overflow-hidden shadow-inner">
                   <img 
                     src={biz.image_url || `https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=400&u=${i}`}
                     className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                     alt={biz.name} 
                   />
                </div>

                <div className="space-y-2">
                   <h3 className="text-lg font-[900] text-slate-950 tracking-tight">{biz.name}</h3>
                   <div className="flex items-center gap-2 text-slate-400">
                      <MapPin className="h-3 w-3" />
                      <span className="text-[10px] font-bold truncate">{biz.address || "Endereço em " + (selectedCity || config.platform_city)}</span>
                   </div>
                   <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center gap-1">
                         <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                         <span className="text-xs font-black text-slate-900">{biz.rating || "5.0"}</span>
                      </div>
                      <div className="text-[9px] font-black text-primary uppercase tracking-[0.2em]">{biz.badge || "Premium"}</div>
                   </div>
                </div>
              </motion.div>
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

      {/* Testimonials - High-Fidelity Style */}
      <section className="py-32 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[3rem] overflow-hidden shadow-2xl relative group">
                <img 
                  src="/testimonial_woman_hat_1774527569763.png" 
                  alt="Testimonial" 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
              </div>
              
              {/* Floating Badge */}
              <div className="absolute -bottom-6 -right-6 bg-white p-6 rounded-[2rem] shadow-2xl border border-slate-100 hidden md:block">
                 <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                 </div>
                 <div className="text-xl font-black text-slate-900">4.9/5.0</div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avaliação Média</div>
              </div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div>
                <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Depoimentos</span>
                <h2 className="text-5xl md:text-6xl font-[900] text-slate-950 tracking-tighter leading-[0.9]">O que dizem <br /> sobre nós.</h2>
              </div>

              <div className="space-y-12">
                <div className="flex gap-4">
                   <div className="h-12 w-12 rounded-xl bg-orange-100 flex items-center justify-center shrink-0">
                      <Quote className="h-6 w-6 text-primary" />
                   </div>
                   <div className="flex-1">
                      <p className="text-xl md:text-2xl text-slate-600 font-medium leading-relaxed italic">
                        "O Guia Comercial mudou a forma como exploramos a cidade. Encontramos lugares incríveis que nunca tínhamos reparado antes. A interface é rápida e os benefícios de elite são reais!"
                      </p>
                      <div className="mt-6">
                         <div className="font-black text-slate-950 text-lg leading-none">Ana Carla Mendonça</div>
                         <div className="text-[10px] font-black text-primary uppercase tracking-widest mt-1">Usuária Premium</div>
                      </div>
                   </div>
                </div>

                <div className="flex gap-4 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 relative">
                   <div className="absolute -top-4 -left-4 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white shadow-lg">
                      <Quote className="h-4 w-4" />
                   </div>
                   <div className="flex-1">
                      <p className="text-lg text-slate-600 font-medium leading-relaxed">
                        "Como empresário, o retorno foi imediato. A plataforma nos coloca na frente do público certo com uma estética que passa muita autoridade."
                      </p>
                      <div className="mt-4 flex items-center gap-4">
                         <div className="h-10 w-10 rounded-full overflow-hidden bg-slate-200">
                            <img src="/testimonial_woman_hat_1774527569763.png" className="w-full h-full object-cover" alt="User" />
                         </div>
                         <div>
                            <div className="font-black text-slate-950 text-sm leading-none">Roberto Silveira</div>
                            <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">CEO - Tech Synergy</div>
                         </div>
                      </div>
                   </div>
                </div>
              </div>

              <div className="pt-8 flex items-center gap-12 border-t border-slate-100">
                 <div>
                    <div className="text-3xl font-black text-slate-900 leading-none">2.5k+</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Avaliações</div>
                 </div>
                 <div>
                    <div className="text-3xl font-black text-slate-900 leading-none">100%</div>
                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Segurança</div>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Community Section - Meet Our Community (Orange BG) */}
      <section className="py-32 bg-primary relative overflow-hidden">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
           <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent opacity-20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center text-white space-y-16">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-[900] tracking-tighter leading-[0.9] mb-6">Conheça nossa Comunidade</h2>
            <p className="text-lg text-white/80 font-medium leading-relaxed">Milhares de empresários e clientes conectados em uma jornada única de crescimento e descoberta.</p>
          </div>

          <div className="relative h-[500px] flex items-center justify-center">
             {/* Central Feature Card */}
             <motion.div 
               initial={{ scale: 0.8, opacity: 0 }}
               whileInView={{ scale: 1, opacity: 1 }}
               className="bg-white p-6 rounded-[2.5rem] shadow-2xl relative z-20 w-72 md:w-80 group cursor-pointer"
             >
                <div className="aspect-[4/5] rounded-[2rem] overflow-hidden mb-4 border border-slate-100 shadow-inner">
                   <img src="/community_center_card_1774527586781.png" alt="Community Main" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
                <div className="space-y-1 text-left">
                   <div className="text-xl font-black text-slate-950">Centro da Cidade</div>
                   <div className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{config.platform_city}</span>
                   </div>
                </div>
             </motion.div>

             {/* Orbital Avatars (Floating) */}
             <div className="absolute inset-0 pointer-events-none">
               {[
                 { x: '-25%', y: '-30%', s: 64, d: 2 },
                 { x: '25%', y: '-35%', s: 56, d: 3 },
                 { x: '-35%', y: '10%', s: 72, d: 4 },
                 { x: '35%', y: '15%', s: 60, d: 2.5 },
                 { x: '-15%', y: '40%', s: 48, d: 3.5 },
                 { x: '15%', y: '45%', s: 64, d: 2.8 },
                 { x: '-40%', y: '-15%', s: 50, d: 4.2 },
                 { x: '40%', y: '-10%', s: 68, d: 3.2 },
               ].map((pos, i) => (
                 <motion.div 
                   key={i}
                   animate={{ 
                     y: [0, -15, 0],
                     x: [0, 5, 0],
                   }}
                   transition={{ 
                     duration: 4 + pos.d, 
                     repeat: Infinity, 
                     delay: i * 0.2 
                   }}
                   className="absolute left-1/2 top-1/2 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden bg-white/10 hidden md:block"
                   style={{ 
                     transform: `translate(calc(${pos.x} - 50%), calc(${pos.y} - 50%))`,
                     width: pos.s, 
                     height: pos.s 
                   }}
                 >
                   <img 
                     src={`https://i.pravatar.cc/150?u=${i + 1}`} 
                     alt="Community Member" 
                     className="w-full h-full object-cover" 
                   />
                 </motion.div>
               ))}
             </div>
          </div>

          <div className="pt-8">
             <Link to="/auth?mode=register">
                <Button size="lg" className="h-14 px-12 rounded-2xl bg-white text-primary hover:bg-slate-100 shadow-2xl active:scale-95 transition-all font-black text-lg">
                  Cadastrar Agora
                </Button>
             </Link>
          </div>
        </div>
      </section>

      {/* Google Maps Section - Discovery */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
           <div>
              <span className="text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-4 block">Exploração Local</span>
              <h2 className="text-4xl md:text-5xl font-[900] text-slate-950 tracking-tighter leading-none">Descubra em {selectedCity || config.platform_city}.</h2>
           </div>
           <p className="text-slate-500 font-medium max-w-sm">Navegue pelo mapa e encontre os estabelecimentos de elite mais próximos de você.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          <div className="w-full h-[500px] rounded-[3rem] overflow-hidden shadow-2xl border border-slate-100 bg-slate-100 relative group">
             {/* Floating Location Notice */}
             {userLocation.city && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute top-6 left-6 z-20 glass-morphism px-6 py-3 rounded-2xl shadow-xl border border-primary/20 flex items-center gap-3"
                >
                   <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                   <div className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      Você está em <span className="text-primary underline decoration-2 underline-offset-4">{userLocation.city}</span>
                   </div>
                </motion.div>
             )}

             <iframe 
               width="100%" 
               height="100%" 
               key={`${userLocation.lat}-${userLocation.lng}`}
               style={{ border: 0 }} 
               loading="lazy" 
               allowFullScreen 
               referrerPolicy="no-referrer-when-downgrade"
               src={userLocation.lat && userLocation.lng 
                 ? `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&output=embed` 
                 : `https://www.google.com/maps?q=${encodeURIComponent(selectedCity || config.platform_city || "Rio de Janeiro")}&output=embed`}
               title="Google Maps"
             ></iframe>
          </div>
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
      <SmartAdSlot type="popup" />
    </div>
  );
};

export default Index;
