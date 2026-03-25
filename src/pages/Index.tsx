import React, { useState } from "react";
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
  Users2
} from "lucide-react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { BusinessCard } from "@/components/portal/BusinessCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { getDistance } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Input } from "@/components/ui/input";
import { motion, useScroll, useTransform, Variants } from "framer-motion";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 } 
  }
};

const floatingVariants: Variants = {
  animate: {
    y: ["-3%", "3%", "-3%"],
    rotate: [-2, 2, -2],
    transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
  }
};

const Index = () => {
  const { user, isLojista, isAdmin, isSuperAdmin } = useAuth();
  const userLoc = useLocation();
  const navigate = useNavigate();
  const { config } = usePlatform();
  const [search, setSearch] = useState("");
  const { scrollY } = useScroll();
  const yHero = useTransform(scrollY, [0, 500], [0, 150]);
  const opacityHero = useTransform(scrollY, [0, 300], [1, 0]);

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
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-0 overflow-x-hidden selection:bg-primary/20 selection:text-primary">
      <Header />

      {/* Hero Section Premium */}
      <section className="relative pt-16 pb-24 md:pt-32 md:pb-40 overflow-hidden bg-white border-b border-slate-100 flex items-center justify-center min-h-[90vh]">
        {/* Abstract 3D-like Background Elements */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
          
          <motion.div 
            variants={floatingVariants} 
            animate="animate" 
            className="absolute top-[10%] left-[5%] w-64 h-64 bg-primary/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          />
          <motion.div 
            variants={floatingVariants} 
            animate="animate" 
            style={{ animationDelay: '2s' }}
            className="absolute top-[20%] right-[10%] w-72 h-72 bg-emerald-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          />
          <motion.div 
            variants={floatingVariants} 
            animate="animate" 
            style={{ animationDelay: '4s' }}
            className="absolute -bottom-10 left-[40%] w-80 h-80 bg-blue-300/20 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
          />

          {/* Floating Glass Orbs */}
          <motion.div
            animate={{ y: [0, -20, 0], x: [0, 10, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/4 left-1/4 w-12 h-12 rounded-full border border-white bg-white/10 backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] hidden md:block"
          />
          <motion.div
            animate={{ y: [0, 30, 0], x: [0, -20, 0], rotate: [0, -15, 0] }}
            transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-1/3 right-1/4 w-20 h-20 rounded-3xl border border-white bg-white/20 backdrop-blur-lg shadow-[0_8px_32px_rgba(0,0,0,0.1)] hidden md:block"
          />
        </div>

        <motion.div 
          className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center z-10 w-full"
          style={{ y: yHero, opacity: opacityHero }}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 bg-white/50 backdrop-blur-md border border-white/80 text-primary text-[10px] md:text-sm font-black px-5 py-2.5 rounded-full mb-8 shadow-xl shadow-primary/5 uppercase tracking-widest relative overflow-hidden group"
          >
            <div className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white to-transparent skew-x-12 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <Sparkles className="h-4 w-4 animate-pulse" />
            O Guia Oficial de {config.platform_city}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-5xl md:text-8xl font-black text-slate-900 leading-[1.05] max-w-5xl tracking-tighter mb-6 relative"
          >
            Descubra o que há de <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-blue-600 relative inline-block">
              melhor
              <motion.svg 
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
                className="absolute -bottom-2 md:-bottom-4 left-0 w-full h-4 md:h-6 text-primary" 
                viewBox="0 0 100 10" 
                preserveAspectRatio="none"
              >
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
              </motion.svg>
            </span> em sua cidade.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-slate-500 mt-4 max-w-2xl text-lg md:text-2xl font-medium leading-relaxed mb-12"
          >
            Conectamos você aos estabelecimentos mais bem avaliados, 
            serviços de elite e as novidades mais quentes da região.
          </motion.p>

          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            onSubmit={handleSearch} 
            className="w-full max-w-3xl group"
          >
            <div className="relative flex items-center p-2.5 bg-white/80 backdrop-blur-xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] border border-white/50 group-focus-within:ring-4 ring-primary/20 group-focus-within:shadow-[0_30px_80px_-15px_rgba(var(--primary),0.3)] transition-all duration-300">
              <div className="p-4 text-slate-400 group-focus-within:text-primary transition-colors">
                <SearchIcon className="h-7 w-7" />
              </div>
              <Input 
                className="border-none bg-transparent h-16 text-xl focus-visible:ring-0 placeholder:text-slate-400 font-medium"
                placeholder="Exortar padarias, academias, médicos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" className="h-14 px-10 rounded-[1.5rem] bg-slate-900 text-white hover:bg-primary font-black text-lg shadow-xl shadow-slate-900/20 hover:shadow-primary/40 transition-all duration-500 hover:scale-105 active:scale-95 ml-2 hidden md:flex overflow-hidden relative group/btn">
                <span className="relative z-10 flex items-center gap-2">Buscar <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" /></span>
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12 -translate-x-full group-hover/btn:animate-[shimmer_1.5s_infinite]" />
              </Button>
            </div>
            
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <span className="text-xs font-black text-slate-400 uppercase tracking-widest px-2 py-1">Em alta:</span>
              {['Gastronomia', 'Saúde', 'Serviços Auto', 'Moda'].map((tag, i) => (
                <motion.button 
                  key={tag} 
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1 + (i * 0.1) }}
                  onClick={() => {setSearch(tag); navigate(`/buscar?q=${tag}`)}} 
                  className="text-xs font-bold text-slate-600 bg-white/50 backdrop-blur-sm border border-slate-200 hover:border-primary hover:text-primary px-4 py-1.5 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-lg shadow-sm"
                >
                  {tag}
                </motion.button>
              ))}
            </div>
          </motion.form>
        </motion.div>
      </section>

      {/* Stats Bar (Glassmorphic) */}
      <section className="bg-slate-900 py-12 overflow-hidden relative border-y border-white/10">
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:20px_20px]" />
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { label: 'Negócios Verificados', value: '1.2k+', icon: Building2 },
            { label: 'Categorias Premium', value: '45+', icon: TrendingUp },
            { label: 'Usuários Locais', value: '15k+', icon: Users2 },
            { label: 'Selo de Confiança', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className="flex flex-col items-center text-center group cursor-default"
            >
              <div className="p-4 bg-white/5 backdrop-blur-sm rounded-2xl mb-4 group-hover:bg-primary/20 group-hover:shadow-[0_0_30px_rgba(var(--primary),0.3)] transition-all duration-500 border border-white/10 group-hover:border-primary/50 relative">
                <stat.icon className="h-7 w-7 text-slate-300 group-hover:text-primary transition-colors" />
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              <div className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-1">{stat.value}</div>
              <div className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Categories Grid Premium */}
      <section className="max-w-7xl mx-auto px-6 py-28 relative">
        <div className="absolute top-1/2 left-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="flex flex-col md:flex-row items-start md:items-end justify-between mb-16 gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-3 mb-4">
               <div className="h-1.5 w-10 bg-primary rounded-full" />
               <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Explorador de Cidades</span>
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none">Categorias<br/><span className="text-slate-400">em Alta</span></h2>
          </div>
          <Link to="/buscar">
            <Button variant="ghost" className="group font-black text-sm hover:bg-primary/5 text-primary rounded-full px-6 py-6 transition-all duration-300">
              VER TODAS <ChevronRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {catLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 relative z-10"
          >
            {categories.map((cat, index) => (
              <motion.div 
                key={cat.id}
                variants={itemVariants}
                whileHover={{ y: -5, scale: 1.02 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="group relative h-48 rounded-[2rem] bg-white border border-slate-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-transparent transition-all duration-300 overflow-hidden"
              >
                {/* Efeito Hover 3D Glass */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="absolute -inset-px rounded-[2rem] bg-gradient-to-b from-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-[1px]" />
                
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500 transform group-hover:scale-150" />
                
                <div className="h-16 w-16 rounded-2xl bg-slate-100 border border-white flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-white transition-all duration-500 shadow-[inset_0_2px_10px_rgba(0,0,0,0.02)] group-hover:shadow-[0_10px_20px_rgba(var(--primary),0.3)] relative z-10 group-hover:-translate-y-2">
                  <MapPin className="h-7 w-7" />
                </div>
                <span className="font-black text-slate-700 text-sm group-hover:text-slate-900 transition-colors relative z-10">{cat.name}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
      </section>

      {/* Featured Businesses Section Premium */}
      <section id="destaques" className="py-32 relative bg-slate-900 text-white overflow-hidden">
        {/* Dark Background Decorative Elements */}
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-5" />
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/10 blur-[150px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-1/2 h-full bg-blue-500/10 blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-8">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-px w-12 bg-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-[0.3em] flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Seleção Exclusiva
                </span>
              </div>
              <h2 className="text-4xl md:text-7xl font-black text-white leading-[1.1] tracking-tighter">
                Lugares Premium em <br className="hidden md:block" /> {config.platform_city}
              </h2>
            </div>
            <Link to="/buscar">
              <Button className="rounded-full px-8 py-7 bg-white/10 backdrop-blur-md border border-white/20 text-white font-black hover:bg-white hover:text-slate-900 transition-all duration-300">
                Ver Mapa Completo
              </Button>
            </Link>
          </div>

          {bizLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-100px" }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
            >
              {businesses
                .map((biz) => {
                  let distance;
                  if (!userLoc.loading && userLoc.lat && (biz as any).latitude) {
                    distance = getDistance(
                      userLoc.lat,
                      userLoc.lng,
                      (biz as any).latitude,
                      (biz as any).longitude
                    );
                  }
                  return { ...biz, distance };
                })
                .sort((a, b) => {
                  if (a.distance !== undefined && b.distance !== undefined) {
                    return a.distance - b.distance;
                  }
                  return 0;
                })
                .map((biz) => (
                   <motion.div key={biz.id} variants={itemVariants}>
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
            </motion.div>
          )}
        </div>
      </section>

      {/* CTA Section Premium - Parallax 3D */}
      <section className="max-w-7xl mx-auto px-6 py-32 relative">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="relative rounded-[40px] bg-slate-900 overflow-hidden shadow-2xl p-10 md:p-24 group perspective-1000 border border-slate-800"
        >
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/40 via-slate-900 to-slate-900 group-hover:opacity-100 transition-opacity duration-1000" />
          
          <div className="absolute top-0 right-0 w-3/4 h-full bg-white/5 skew-x-12 translate-x-1/3 pointer-events-none group-hover:bg-white/10 transition-all duration-1000" />
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-40 -right-40 h-96 w-96 border-[40px] border-primary/20 rounded-full blur-sm" 
          />
          
          <div className="relative z-10 grid md:grid-cols-2 items-center gap-16">
            <div className="text-center md:text-left">
              <motion.div 
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white text-xs font-black uppercase tracking-widest mb-8">
                  <Star className="h-4 w-4 text-amber-400" /> Exclusivo para Empreendedores
                </div>
                <h3 className="text-5xl md:text-7xl font-black text-white leading-[1.1] mb-8 tracking-tighter">
                  Leve o seu negócio para o <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-400">futuro</span>.
                </h3>
                <p className="text-slate-400 text-lg md:text-xl font-medium mb-12 max-w-lg leading-relaxed">
                  Junte-se a elite de lojistas locais, domine sua região com tecnologia 3D e inteligência artificial para vendas.
                </p>
                <div className="flex flex-col sm:flex-row gap-6 justify-center md:justify-start items-center">
                  <Link to={user ? (isLojista || isAdmin || isSuperAdmin ? "/dashboard" : "/perfil") : "/auth"}>
                    <Button size="lg" className="h-[68px] px-10 rounded-[2rem] bg-primary text-white font-black text-lg hover:bg-primary/90 transition-all shadow-[0_0_40px_rgba(var(--primary),0.4)] hover:shadow-[0_0_60px_rgba(var(--primary),0.6)] hover:scale-105 active:scale-95 group/btn">
                      {user ? "Acessar Painel" : "Criar Conta Elite"}
                      <ArrowRight className="ml-2 h-6 w-6 group-hover/btn:translate-x-2 transition-transform" />
                    </Button>
                  </Link>
                </div>
              </motion.div>
            </div>
            
            <div className="hidden md:flex flex-col gap-6 relative">
               {/* 3D Floating Cards */}
              <motion.div 
                animate={{ y: [0, -15, 0], rotateX: [0, 5, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="bg-white/10 backdrop-blur-xl p-8 rounded-[32px] border border-white/20 transform rotate-3 shadow-2xl relative z-20"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex gap-5 items-center" style={{ transform: "translateZ(30px)" }}>
                  <div className="h-16 w-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-inner">
                    R$
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xl mb-1">Aumente suas vendas</h4>
                    <p className="text-slate-400 text-sm">Visibilidade premium 24h por dia para clientes na sua cidade.</p>
                  </div>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0], rotateX: [0, -5, 0] }}
                transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="bg-slate-800/80 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 transform -rotate-3 translate-x-12 shadow-2xl relative z-10"
                style={{ transformStyle: "preserve-3d" }}
              >
                <div className="flex gap-5 items-center" style={{ transform: "translateZ(30px)" }}>
                  <div className="h-16 w-16 bg-slate-900 border border-slate-700 rounded-2xl flex items-center justify-center text-primary font-black text-2xl shadow-inner">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <div>
                    <h4 className="text-white font-black text-xl mb-1">Tecnologia Avançada</h4>
                    <p className="text-slate-400 text-sm">Design 3D imersivo e vitrines que vendem para você.</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <footer className="bg-slate-900 py-16 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="flex justify-center mb-8">
             <div className="h-12 w-12 bg-white/10 rounded-2xl flex items-center justify-center border border-white/20">
                <MapPin className="text-primary h-6 w-6" />
             </div>
          </div>
          <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-md mx-auto">
            {config.platform_footer_text}
          </p>
          <div className="mt-8 pt-8 border-t border-slate-800/50 text-slate-600 text-xs font-medium">
             © {new Date().getFullYear()} Todos os direitos reservados. Design Premium.
          </div>
        </div>
      </footer>

      <BottomTabBar />
    </div>
  );
};

export default Index;
