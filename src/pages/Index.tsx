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
  
  const heroOpacity = useTransform(scrollY, [0, 300], [1, 0]);
  const heroScale = useTransform(scrollY, [0, 300], [1, 0.98]);

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

      {/* Premium Light Hero Section */}
      <section ref={heroRef} className="relative min-h-[85vh] flex items-center justify-center overflow-hidden pt-28 bg-[#F8FAFC]">
        {/* Soft Background Accents */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-blue-100/30 blur-[100px] rounded-full"></div>
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-6 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white border border-slate-200 text-slate-600 text-sm font-bold mb-8 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-primary" />
            O guia definitivo de {config.platform_city}
          </motion.div>

          <h1 className="text-5xl md:text-8xl font-black text-slate-900 tracking-tight leading-[1] mb-8">
            Encontre o <span className="text-primary italic">Melhor</span> <br />
            da nossa região.
          </h1>

          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-12 leading-relaxed">
            Descubra estabelecimentos premium, serviços exclusivos e experiências únicas selecionadas pela nossa curadoria local.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="max-w-3xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative flex flex-col md:flex-row items-center bg-white border border-slate-200 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] p-2 gap-2 group-focus-within:border-primary/30 transition-all duration-300">
                <div className="flex items-center flex-1 w-full pl-4">
                  <SearchIcon className="h-6 w-6 text-slate-400 group-hover:text-primary transition-colors" />
                  <Input 
                    className="border-none bg-transparent h-14 text-xl focus-visible:ring-0 placeholder:text-slate-300 w-full font-bold text-slate-800"
                    placeholder="O que você procura hoje?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto h-14 px-10 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-xl shadow-primary/10 active:scale-95 transition-all">
                  Explorar
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* Social Proof Stats - Clean */}
      <section className="bg-white py-20 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: 'Estabelecimentos', value: '1.2k+', icon: Building2 },
              { label: 'Categorias', value: '45+', icon: TrendingUp },
              { label: 'Usuários Ativos', value: '15k+', icon: Users2 },
              { label: 'Verificados', value: '100%', icon: ShieldCheck },
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl font-black text-slate-900 mb-1">{stat.value}</div>
                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Strategic Categories - Light Grid */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">Curadoria por Segmento</h2>
          <p className="text-slate-500 text-lg font-medium">Explore as melhores opções selecionadas para você.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {catLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-40 rounded-3xl bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {categories.map((cat, i) => (
                <motion.div 
                  key={cat.id}
                  whileHover={{ y: -5 }}
                  onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                  className="group bg-white border border-slate-100 rounded-3xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
                >
                  <div className="h-16 w-16 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary/5 transition-colors">
                    <MapPin className="h-7 w-7 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-black text-slate-700 text-sm group-hover:text-slate-900 mb-1">{cat.name}</span>
                  <div className="text-[9px] font-bold text-slate-300 uppercase tracking-widest">Explorar</div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Businesses - The Selection */}
      <section id="destaques" className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-16">
            <div className="text-center md:text-left">
              <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Destaques da Semana</h2>
              <p className="text-slate-500 text-lg font-medium mt-2">Os favoritos da comunidade em {config.platform_city}.</p>
            </div>
            <Link to="/buscar" className="mt-6 md:mt-0">
              <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5 rounded-full px-8">
                Ver Todos <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {bizLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="aspect-[4/5] rounded-3xl bg-slate-100 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {businesses.map((biz, i) => (
                <motion.div 
                  key={biz.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
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
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Merchant Benefits - Light & Professional */}
      <section className="py-24 bg-slate-50 overflow-hidden relative border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight tracking-tight text-slate-900">Digitalize sua <span className="text-primary italic">Presença Local.</span></h2>
              <p className="text-lg text-slate-500 mb-10 font-medium leading-relaxed">Oferecemos a infraestrutura tecnológica essencial para que sua marca domine o mercado local e conquiste novos clientes em {config.platform_city}.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {[
                  { title: 'Página Premium', desc: 'Sua marca em destaque com design de nível mundial.', icon: Globe },
                  { title: 'Leads Diretos', desc: 'Conecte-se via WhatsApp em um clique sem intermediários.', icon: Zap },
                  { title: 'Agendamento', desc: 'Sistema inteligente de reservas para seus clientes.', icon: CheckCircle2 },
                  { title: 'Vitrine 24/7', desc: 'Sua empresa sendo encontrada a qualquer hora do dia.', icon: Smartphone }
                ].map((benefit, i) => (
                  <div key={i} className="flex flex-col gap-3">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                      <benefit.icon className="h-5 w-5 text-primary" />
                    </div>
                    <h4 className="text-lg font-black text-slate-800 leading-tight">{benefit.title}</h4>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">{benefit.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[4/3] rounded-[2rem] bg-slate-200 relative overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800" 
                  alt="Business Intelligence" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-primary/10 mix-blend-overlay"></div>
              </div>
              
              {/* Floating Metric */}
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute -bottom-8 -left-8 bg-white p-6 rounded-2xl shadow-xl border border-slate-100 max-w-[200px] hidden md:block"
              >
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-8 w-8 rounded-lg bg-green-50 flex items-center justify-center">
                    <TrendingUp className="h-4 w-4 text-green-500" />
                  </div>
                  <span className="text-2xl font-black text-slate-800">+240%</span>
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest uppercase">Alcance Local Médio</p>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Wall of Love - Clean Style */}
      <section className="py-28 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-16">
          <div className="inline-flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-5 w-5 fill-primary text-primary" />)}
          </div>
          <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">O que dizem os nossos usuários</h2>
          <p className="text-slate-500 text-lg font-medium mt-4">Pessoas reais compartilhando experiências autênticas.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {DUMMY_TESTIMONIALS.map((testimonial, i) => (
            <motion.div 
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100 flex flex-col justify-between hover:bg-white hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300"
            >
              <div>
                <Quote className="h-8 w-8 text-primary/20 mb-6" />
                <p className="text-slate-600 font-medium italic mb-10 leading-relaxed italic">"{testimonial.text}"</p>
              </div>

              <div className="flex items-center gap-4">
                <img 
                  src={testimonial.avatar_url} 
                  alt={testimonial.name} 
                  className="h-12 w-12 rounded-full object-cover border-2 border-white shadow-md"
                />
                <div>
                  <div className="font-black text-slate-900 text-sm leading-none mb-1">{testimonial.name}</div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-widest">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Clean CTA Section */}
      <section className="bg-[#F8FAFC] py-32 border-y border-slate-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-none mb-8">
            Dê o próximo passo com o <span className="text-primary italic">Guia.</span>
          </h3>
          <p className="text-lg md:text-xl text-slate-500 font-medium mb-12 max-w-2xl mx-auto leading-relaxed">
            Seja você um usuário buscando o melhor da cidade ou um lojista querendo escalar, nós somos o seu parceiro digital ideal.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? (isLojista || isAdmin || isSuperAdmin ? "/dashboard" : "/perfil") : "/auth?mode=register"}>
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black text-xl hover:bg-primary/90 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                Começar Agora <ArrowRight className="h-6 w-6 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white py-16 border-t border-slate-100 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
                <MapPin className="text-white h-6 w-6" />
              </div>
              <span className="font-black text-2xl text-slate-900 tracking-tighter uppercase">{config.platform_name}</span>
            </div>
            
            <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
              <a href="#" className="hover:text-primary transition-colors">Termos</a>
              <a href="#" className="hover:text-primary transition-colors">Privacidade</a>
              <a href="#" className="hover:text-primary transition-colors">Suporte</a>
            </div>

            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">
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
