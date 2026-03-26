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
  Users2,
  CheckCircle2,
  Zap,
  MessageSquare,
  Globe,
  Rocket,
  Play,
  ArrowUpRight,
  Smartphone,
  Quote
} from "lucide-react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { BusinessCard } from "@/components/portal/BusinessCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { getDistance, cn } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { DUMMY_TESTIMONIALS } from "@/data/dummy-data";

const Index = () => {
  const { user, isLojista, isAdmin, isSuperAdmin } = useAuth();
  const userLoc = useLocation();
  const navigate = useNavigate();
  const { config } = usePlatform();
  const [search, setSearch] = useState("");
  const heroRef = useRef(null);
  const { scrollY } = useScroll();
  
  const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 400], [1, 0.95]);
  const heroY = useTransform(scrollY, [0, 400], [0, 50]);

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
    <div className="min-h-screen bg-[#0A0C10] pb-20 md:pb-0 font-sans selection:bg-primary/30 selection:text-white overflow-x-hidden text-slate-200">
      <Header />

      {/* Ultra Premium Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20">
        {/* Advanced Background Mesh */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0A0C10]"></div>
          <motion.div 
            animate={{ 
              backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
              opacity: [0.3, 0.5, 0.3]
            }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(37,99,235,0.15),transparent_50%),radial-gradient(circle_at_20%_30%,rgba(59,130,246,0.1),transparent_40%),radial-gradient(circle_at_80%_70%,rgba(29,78,216,0.1),transparent_40%)]"
            style={{ backgroundSize: "200% 200%" }}
          />
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dust.png')] opacity-20"></div>
          
          {/* Floating Luxury Elements */}
          <motion.div 
            animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-[20%] left-[10%] w-32 h-32 bg-primary/20 blur-3xl rounded-full hidden lg:block"
          />
          <motion.div 
            animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-[20%] right-[10%] w-48 h-48 bg-blue-600/10 blur-3xl rounded-full hidden lg:block"
          />
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
          className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 backdrop-blur-md border border-white/10 text-slate-300 text-sm font-bold mb-10 shadow-2xl">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              O Novo Padrão de Guia Comercial em {config.platform_city}
            </div>

            <h1 className="text-6xl md:text-8xl font-black text-white tracking-tight leading-[0.95] max-w-5xl mx-auto mb-10">
              Conecte-se às <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-primary to-blue-600">Melhores Experiências</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-400 font-medium max-w-3xl mx-auto mb-16 leading-relaxed">
              O ecossistema digital mais completo para descobrir estabelecimentos premium, serviços exclusivos e oportunidades únicas na sua região.
            </p>

            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8 }}
              className="max-w-4xl mx-auto"
            >
              <form onSubmit={handleSearch} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/50 to-blue-600/50 rounded-[2rem] blur opacity-25 group-focus-within:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex flex-col md:flex-row items-center bg-[#12141C]/80 backdrop-blur-3xl border border-white/10 rounded-[1.8rem] shadow-2xl p-3 gap-3">
                  <div className="flex items-center flex-1 w-full pl-5">
                    <SearchIcon className="h-7 w-7 text-primary mr-4" />
                    <Input 
                      className="border-none bg-transparent h-16 text-2xl focus-visible:ring-0 placeholder:text-slate-500 w-full font-bold text-white"
                      placeholder="Empresas, gastronomia, lazer..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>
                  <Button type="submit" className="w-full md:w-auto h-16 px-12 rounded-[1.2rem] bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/40 hover:scale-[1.02] active:scale-95 transition-all flex gap-3">
                    Descobrir <ArrowRight className="h-6 w-6" />
                  </Button>
                </div>
                
                <div className="mt-10 flex flex-wrap justify-center items-center gap-4 text-sm">
                  <span className="text-slate-500 font-black uppercase tracking-[0.2em]">Trending:</span>
                  {['Gastrô', 'Saúde Plus', 'Imóveis Luxo', 'Travel'].map((tag) => (
                    <button 
                      key={tag} 
                      type="button"
                      onClick={() => {setSearch(tag); navigate(`/buscar?q=${tag}`)}} 
                      className="group flex items-center gap-2 text-slate-300 hover:text-white transition-colors py-2 px-1 relative overflow-hidden"
                    >
                      <span className="relative z-10 font-bold tracking-tight">{tag}</span>
                      <motion.span 
                        className="absolute bottom-1 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all"
                      />
                    </button>
                  ))}
                </div>
              </form>
            </motion.div>
          </motion.div>
        </motion.div>
      </section>

      {/* Elite Stats Bar */}
      <section className="bg-[#0D1017] py-20 border-y border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-5 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-[size:40px_40px]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 lg:grid-cols-4 gap-12 relative z-10">
          {[
            { label: 'Empresas Ativas', value: '1.2k+', icon: Building2, color: 'text-blue-400' },
            { label: 'Setores Estratégicos', value: '45+', icon: TrendingUp, color: 'text-primary' },
            { label: 'Usuários/Mês', value: '15k+', icon: Users2, color: 'text-blue-500' },
            { label: 'Índice de Confiança', value: '100%', icon: ShieldCheck, color: 'text-green-400' },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center group"
            >
              <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center mb-6 border border-white/10 group-hover:border-primary/50 transition-all group-hover:shadow-[0_0_20px_rgba(37,99,235,0.2)]">
                <stat.icon className={cn("h-7 w-7", stat.color)} />
              </div>
              <div className="text-5xl font-black text-white tracking-tighter mb-2">{stat.value}</div>
              <div className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works - The Journey */}
      <section className="py-32 bg-[#0A0C10] relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <motion.h2 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight"
              >
                A Jornada da <span className="text-primary">Confiabilidade</span>
              </motion.h2>
              <p className="text-xl text-slate-400 font-medium">Arquitetamos uma experiência fluida para você encontrar excelência em cada clique.</p>
            </div>
            <div className="hidden md:block">
              <div className="h-px w-32 bg-gradient-to-r from-primary to-transparent"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                step: '01', 
                title: 'Descoberta Inteligente', 
                desc: 'Nossa IA filtra os melhores estabelecimentos baseados em geolocalização e performance real.',
                icon: SearchIcon,
                gradient: 'from-blue-500/20 to-transparent'
              },
              { 
                step: '02', 
                title: 'Análise de Autoridade', 
                desc: 'Acesse fotos 4K, cardápios atualizados e depoimentos verificados de outros usuários.',
                icon: Star,
                gradient: 'from-primary/20 to-transparent'
              },
              { 
                step: '03', 
                title: 'Conexão Direta', 
                desc: 'Interaja via WhatsApp, reserve serviços ou peça delivery sem intermediários e taxas extras.',
                icon: MessageSquare,
                gradient: 'from-green-500/20 to-transparent'
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative p-10 rounded-[2.5rem] bg-gradient-to-b from-white/5 to-transparent border border-white/5 group hover:border-primary/30 transition-all duration-500"
              >
                <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-[2.5rem] -z-10", item.gradient)}></div>
                <div className="h-16 w-16 rounded-2xl bg-white/5 border border-white/10 text-white flex items-center justify-center mb-8 shadow-xl group-hover:scale-110 group-hover:bg-primary transition-all duration-500">
                  <item.icon className="h-8 w-8" />
                </div>
                <div className="text-6xl font-black text-white/5 absolute top-10 right-10 group-hover:text-primary/10 transition-colors">{item.step}</div>
                <h3 className="text-2xl font-black text-white mb-4 tracking-tight">{item.title}</h3>
                <p className="text-slate-400 font-medium leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Categories */}
      <section className="max-w-7xl mx-auto px-6 py-32">
        <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-6">
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">Eixos de Valor</h2>
            <p className="text-slate-500 mt-4 text-xl font-medium">Explore os setores que movem a economia de {config.platform_city}.</p>
          </div>
          <Link to="/buscar">
            <Button variant="outline" className="font-black text-primary border-primary/20 hover:bg-primary/10 rounded-full px-10 h-14 text-lg group bg-transparent">
              Ver Catálogo Completo <ArrowUpRight className="h-5 w-5 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {catLoading ? (
          <div className="flex justify-center flex-col items-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
            <span className="text-slate-500 font-bold uppercase tracking-widest">Indexando Mercados...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.05 }}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="group relative bg-[#12141C] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 transition-all duration-300 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <div className="h-20 w-20 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500 relative z-10">
                  <MapPin className="h-8 w-8 text-primary" />
                </div>
                <span className="font-black text-slate-300 text-lg group-hover:text-white transition-colors relative z-10">{cat.name}</span>
                <div className="mt-2 text-[10px] font-black text-slate-600 uppercase tracking-widest group-hover:text-primary/60 transition-colors relative z-10">Explorar</div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Merchant Benefits - Enterprise Focus */}
      <section className="py-32 bg-[#0D1017] text-white overflow-hidden relative border-y border-white/5">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/10 blur-[150px] rounded-full -mr-72 -mt-32"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-5xl md:text-6xl font-black mb-10 leading-[1.1] tracking-tight">Transforme sua Presença <span className="text-primary">Regional</span></h2>
              <p className="text-xl text-slate-400 mb-12 font-medium">Arquitetamos a infraestrutura necessária para que sua marca domine o cenário local e converta leads qualificados em {config.platform_city}.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'Autoridade Digital', desc: 'Páginas otimizadas para SEO que posicionam sua marca no topo.', icon: Globe },
                  { title: 'Ecossistema WhatsApp', desc: 'Conversão em um clique com rastreamento de performance.', icon: Zap },
                  { title: 'Smart Booking', desc: 'Gestão de agenda automatizada para prestadores de serviço.', icon: CheckCircle2 },
                  { title: 'Premium Showcase', desc: 'Exibição de produtos com estética de catálogo de luxo.', icon: Building2 }
                ].map((benefit, i) => (
                  <div key={i} className="group">
                    <div className="h-14 w-14 shrink-0 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 group-hover:border-primary/50 transition-all">
                      <benefit.icon className="h-7 w-7 text-primary" />
                    </div>
                    <h4 className="text-xl font-black mb-2 text-white">{benefit.title}</h4>
                    <p className="text-slate-500 font-medium text-sm leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative"
            >
              <div className="aspect-[4/5] rounded-[3rem] bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary/20 mix-blend-overlay"></div>
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800" 
                  alt="Business Intelligence" 
                  className="w-full h-full object-cover rounded-[2.5rem] opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                />
                
                {/* Floating Metric Card */}
                <motion.div 
                  animate={{ y: [0, -15, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute bottom-10 -left-10 bg-[#12141C] p-8 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-xl max-w-xs hidden xl:block"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center">
                      <Rocket className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <div className="text-2xl font-black text-white">+240%</div>
                      <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Crescimento Orgânico</div>
                    </div>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '85%' }}
                      transition={{ duration: 2, delay: 0.5 }}
                      className="h-full bg-primary"
                    />
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Businesses - The Elite Selection */}
      <section id="destaques" className="py-32 bg-[#0A0C10]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-20 gap-8">
            <div className="max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-none mb-4 italic">The <span className="text-primary not-italic">Elite list</span></h2>
              <p className="text-slate-500 text-xl font-medium">Descubra os estabelecimentos que definem o padrão de qualidade em {config.platform_city}.</p>
            </div>
            <Link to="/buscar">
              <Button variant="ghost" className="font-black text-slate-300 hover:text-white hover:bg-white/5 rounded-full px-8 h-12 border border-white/10">
                Explorar por Ranking <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {bizLoading ? (
            <div className="flex justify-center flex-col items-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary mb-6" />
              <span className="text-slate-500 font-black tracking-widest uppercase">Selecionando Melhores...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {businesses
                .map((biz, i) => {
                  let distance;
                  if (!userLoc.loading && userLoc.lat && (biz as any).latitude) {
                    distance = getDistance(
                      userLoc.lat,
                      userLoc.lng,
                      (biz as any).latitude,
                      (biz as any).longitude
                    );
                  }
                  return { ...biz, distance, animationDelay: i * 0.1 };
                })
                .map((biz) => (
                  <motion.div 
                    key={biz.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: biz.animationDelay, duration: 0.6 }}
                    className="relative group"
                  >
                    <div className="absolute -inset-2 bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity blur-xl -z-10 rounded-[2rem]"></div>
                    <BusinessCard
                      id={biz.id}
                      name={biz.name}
                      description={biz.description || undefined}
                      address={biz.address || undefined}
                      imageUrl={biz.image_url || undefined}
                      categoryName={(biz.categories as any)?.name || undefined}
                      slug={biz.slug}
                      performanceScore={(biz as any).performance_score}
                      ratingAverage={(biz as any).rating_average}
                      reviewCount={(biz as any).reviews?.[0]?.count || 0}
                      distance={biz.distance}
                    />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Wall of Love - Professional Testimonials */}
      <section className="py-32 bg-[#0D1017] border-y border-white/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(37,99,235,0.05),transparent_40%)]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-24">
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-widest mb-6"
            >
              Vozes da Comunidade
            </motion.div>
            <h2 className="text-5xl md:text-6xl font-black text-white mb-6 tracking-tight">O que dizem os <span className="italic text-primary">líderes locais?</span></h2>
            <div className="flex justify-center gap-1.5 items-center">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-6 w-6 fill-primary text-primary" />)}
              <span className="ml-4 font-black text-white text-xl">4.9/5.0</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {DUMMY_TESTIMONIALS.map((testimonial, i) => (
              <motion.div 
                key={testimonial.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.8 }}
                className="bg-[#12141C] p-10 rounded-[2.5rem] border border-white/5 relative flex flex-col justify-between hover:border-primary/40 transition-all duration-500 group overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Quote className="h-20 w-20 text-white" />
                </div>
                
                <div>
                  <div className="flex gap-1 mb-6">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} className={cn("h-4 w-4", s <= testimonial.rating ? "fill-primary text-primary" : "text-slate-700")} />
                    ))}
                  </div>
                  <p className="text-slate-300 font-medium italic text-lg leading-relaxed mb-10 relative z-10">
                    "{testimonial.text}"
                  </p>
                </div>

                <div className="flex items-center gap-4 relative z-10 border-t border-white/5 pt-8">
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary to-blue-600 rounded-full blur-[2px] opacity-50"></div>
                    <img 
                      src={testimonial.avatar_url} 
                      alt={testimonial.name} 
                      className="h-14 w-14 rounded-full object-cover border-2 border-[#12141C] relative z-10"
                    />
                  </div>
                  <div>
                    <div className="font-black text-white text-lg tracking-tight leading-none mb-1">{testimonial.name}</div>
                    <div className="text-xs font-black text-primary uppercase tracking-widest">{testimonial.role}</div>
                    <div className="text-[10px] text-slate-500 font-bold mt-1 flex items-center gap-1">
                      <MapPin className="h-2.5 w-2.5" /> {testimonial.location}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Elite CTA - Final Conversion */}
      <section className="bg-[#0A0C10] py-40 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[800px] bg-primary/10 blur-[180px] rounded-full pointer-events-none"></div>
        <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <h3 className="text-5xl md:text-8xl font-black text-white leading-none mb-10 tracking-tighter">
              DOMINE O <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-400 to-primary/80 animate-pulse">MERCADO LOCAL.</span>
            </h3>
            <p className="text-slate-400 text-xl md:text-2xl font-medium mb-16 max-w-3xl mx-auto leading-relaxed">
              Posicione sua marca na vitrine de maior prestígio da cidade e conecte-se com clientes que buscam excelência.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link to={user ? (isLojista || isAdmin || isSuperAdmin ? "/dashboard" : "/perfil") : "/auth?mode=register"}>
                <Button size="lg" className="h-20 px-16 rounded-[1.5rem] bg-primary text-white font-black text-2xl hover:bg-primary/90 shadow-[0_20px_50px_rgba(37,99,235,0.4)] hover:scale-105 active:scale-95 transition-all flex gap-4">
                  Começar Agora <Rocket className="h-7 w-7" />
                </Button>
              </Link>
              <button className="flex items-center gap-3 text-slate-400 hover:text-white font-black transition-colors px-6 h-20 group">
                <div className="h-14 w-14 rounded-full border border-white/10 flex items-center justify-center group-hover:border-primary transition-all">
                  <Play className="h-5 w-5 fill-current" />
                </div>
                Veja como funciona
              </button>
            </div>
            
            <div className="mt-20 flex items-center justify-center gap-8 grayscale opacity-30">
              <Building2 className="h-10 w-10" />
              <ShieldCheck className="h-10 w-10" />
              <Globe className="h-10 w-10" />
              <Smartphone className="h-10 w-10" />
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="bg-[#0A0C10] py-20 border-t border-white/5 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="flex flex-col items-center md:items-start gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                  <MapPin className="text-white h-6 w-6" />
                </div>
                <span className="font-black text-2xl text-white tracking-tighter uppercase">{config.platform_name}</span>
              </div>
              <p className="text-slate-500 font-bold max-w-xs text-center md:text-left text-sm uppercase tracking-widest leading-loose">
                Elevando o padrão do comércio local em {config.platform_city}.
              </p>
            </div>
            
            <div className="flex gap-12 text-sm font-black text-slate-400 uppercase tracking-[0.2em]">
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
            </div>

            <div className="text-slate-500 text-xs font-black uppercase tracking-widest">
              © {new Date().getFullYear()} {config.platform_city} — All Rights Reserved.
            </div>
          </div>
        </div>
      </footer>

      <BottomTabBar />
    </div>
  );
};

export default Index;
