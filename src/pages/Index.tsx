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
  Globe,
  ArrowUpRight,
  Smartphone,
  Quote
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
import { DUMMY_TESTIMONIALS } from "@/data/dummy-data";

const Index = () => {
  const { user, isLojista, isAdmin, isSuperAdmin } = useAuth();
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

      {/* Elite Light Hero Section */}
      <section ref={heroRef} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-28 bg-[#F8FAFC]">
        {/* Soft Background Accents */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full"></div>
          <div className="absolute bottom-[10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/30 blur-[100px] rounded-full"></div>
        </div>

        <motion.div 
          style={{ opacity: heroOpacity, scale: heroScale }}
          className="max-w-7xl mx-auto px-6 relative z-10 text-center"
        >
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white border border-slate-200 text-slate-800 text-xs font-black uppercase tracking-[0.2em] mb-10 shadow-sm"
          >
            <Sparkles className="h-4 w-4 text-primary animate-pulse" />
            Guia Premium {config.platform_city}
          </motion.div>

          <h1 className="text-6xl md:text-8xl lg:text-9xl font-[900] text-slate-950 tracking-tighter leading-[0.85] mb-10">
            Sua cidade <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-500">bem conectada.</span>
          </h1>

          <p className="text-lg md:text-2xl text-slate-500 font-medium max-w-3xl mx-auto mb-16 leading-relaxed">
            Descubra estabelecimentos de elite, serviços exclusivos e oportunidades únicas na palma da sua mão.
          </p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 1 }}
            className="max-w-4xl mx-auto"
          >
            <form onSubmit={handleSearch} className="relative group">
              <div className="relative flex flex-col md:flex-row items-center bg-white border border-slate-200 rounded-[2.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.08)] p-3 gap-3 group-focus-within:border-primary/40 transition-all duration-500">
                <div className="flex items-center flex-1 w-full pl-6">
                  <SearchIcon className="h-7 w-7 text-slate-300 group-hover:text-primary transition-colors" />
                  <Input 
                    className="border-none bg-transparent h-16 text-2xl focus-visible:ring-0 placeholder:text-slate-200 w-full font-black text-slate-900"
                    placeholder="O que você busca hoje?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto h-16 px-12 rounded-[1.8rem] bg-slate-900 hover:bg-slate-800 text-white font-black text-xl shadow-2xl active:scale-95 transition-all">
                  Explorar
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      </section>

      {/* Stats - Ultra Clean */}
      <section className="bg-white py-24 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
            {[
              { label: 'Empresas Ativas', value: '4.8k+', color: 'text-primary' },
              { label: 'Categorias', value: '50+', color: 'text-emerald-500' },
              { label: 'Usuários Mensais', value: '25k+', color: 'text-indigo-500' },
              { label: 'Satisfação', value: '100%', color: 'text-amber-500' },
            ].map((stat, i) => (
              <div key={i} className="text-center group cursor-default">
                <div className={cn("text-5xl font-[900] tracking-tighter mb-2 transition-transform group-hover:scale-110 duration-300", stat.color)}>{stat.value}</div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories - Elegant Grid */}
      <section className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 text-center mb-20">
          <h2 className="text-4xl md:text-6xl font-black text-slate-950 tracking-tighter mb-6">Categorias de Elite</h2>
          <p className="text-slate-500 text-xl font-medium max-w-2xl mx-auto">Navegue pelos melhores segmentos cuidadosamente selecionados por nossa equipe local.</p>
        </div>

        <div className="max-w-7xl mx-auto px-6">
          {catLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 rounded-[2rem] bg-slate-200 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {categories.map((cat, i) => (
                <motion.div 
                  key={cat.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -10 }}
                  onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                  className="group bg-white border border-slate-100 rounded-[2.5rem] p-10 flex flex-col items-center justify-center text-center cursor-pointer hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500"
                >
                  <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors shadow-inner">
                    <Building2 className="h-10 w-10 text-slate-200 group-hover:text-primary transition-colors" />
                  </div>
                  <span className="font-black text-slate-900 text-base mb-2">{cat.name}</span>
                  <div className="h-1 w-8 bg-slate-100 group-hover:w-12 group-hover:bg-primary transition-all rounded-full"></div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Businesses */}
      <section id="destaques" className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-20 gap-8">
            <div className="text-left">
              <span className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-4 block">Destaques Premium</span>
              <h2 className="text-4xl md:text-6xl font-[900] text-slate-950 tracking-tighter">O Melhor da Região</h2>
            </div>
            <Link to="/buscar">
              <Button variant="outline" className="h-14 px-10 rounded-2xl border-slate-200 font-black text-slate-600 hover:border-primary hover:text-primary transition-all">
                Ver Tudo <ArrowUpRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
            {bizLoading ? (
              [1, 2, 3, 4].map((i) => <div key={i} className="aspect-[3/4] rounded-[2.5rem] bg-slate-100 animate-pulse"></div>)
            ) : (
              businesses.map((biz, i) => (
                <motion.div 
                  key={biz.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <BusinessCard {...biz} categoryName={(biz.categories as any)?.name} />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Benefits - Professional Context */}
      <section className="py-32 bg-slate-950 text-white overflow-hidden relative">
        <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[60%] h-[60%] bg-primary/20 blur-[150px] rounded-full"></div>
          <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[120px] rounded-full"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <motion.div>
              <span className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-6 block">Soluções para Negócios</span>
              <h2 className="text-5xl md:text-7xl font-[900] tracking-tighter mb-10 leading-[0.9]">Escale sua <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-primary">Autoridade Local.</span></h2>
              <p className="text-xl text-slate-400 font-medium mb-12 leading-relaxed">Não apenas um anúncio, mas uma presença digital de elite desenvolvida para converter e fidelizar clientes de alto valor.</p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {[
                  { title: 'IA Local', desc: 'Sua empresa sugerida para quem realmente busca.', icon: Zap },
                  { title: 'Social Connect', desc: 'Integração total com WhatsApp e Redes Sociais.', icon: Globe },
                  { title: 'Booking Pro', desc: 'Sistema de reservas e orçamentos via Web Local.', icon: CheckCircle2 },
                  { title: 'Growth Engine', desc: 'Acompanhe seu crescimento com dados reais.', icon: TrendingUp }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col gap-4 group">
                    <div className="h-14 w-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary transition-all duration-500">
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                    <div>
                      <h4 className="text-xl font-black mb-1 group-hover:text-primary transition-colors">{item.title}</h4>
                      <p className="text-slate-500 text-sm font-medium leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-16">
                 <Link to="/auth?mode=register">
                    <Button size="lg" className="h-16 px-12 rounded-[1.5rem] bg-white text-slate-950 font-black text-xl hover:bg-slate-200 shadow-2xl transition-all">
                      Anunciar Minha Empresa <ArrowUpRight className="ml-2 h-6 w-6 text-primary" />
                    </Button>
                 </Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="relative hidden lg:block"
            >
              <div className="aspect-[4/5] rounded-[3rem] bg-indigo-500 relative overflow-hidden shadow-2xl rotate-3">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=800" 
                  alt="Elite Office" 
                  className="w-full h-full object-cover grayscale ml-1"
                />
                <div className="absolute inset-0 bg-primary/20 mix-blend-multiply"></div>
              </div>
              {/* Overlay elements */}
              <div className="absolute -bottom-10 -left-10 bg-white p-10 rounded-[2rem] shadow-2xl border border-slate-100 max-w-[280px] -rotate-3">
                 <div className="flex items-center gap-4 mb-4">
                    <Users2 className="h-8 w-8 text-primary" />
                    <div className="text-4xl font-black text-slate-900">4.9/5</div>
                 </div>
                 <p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-normal">Satisfação média dos lojistas da plataforma</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials - Elite Carousel Style */}
      <section className="py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6 text-center mb-24">
          <span className="text-primary font-black text-xs uppercase tracking-[0.3em] mb-4 block">Experiências Reais</span>
          <h2 className="text-4xl md:text-6xl font-[900] text-slate-950 tracking-tighter">Vozes da Comunidade</h2>
        </div>

        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
          {DUMMY_TESTIMONIALS.slice(0, 3).map((testimonial, i) => (
            <motion.div 
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="relative p-12 bg-slate-50 rounded-[3rem] border border-slate-100 flex flex-col justify-between"
            >
              <Quote className="absolute top-10 right-10 h-12 w-12 text-slate-200" />
              <p className="text-xl text-slate-700 font-medium italic mb-12 leading-relaxed">"{testimonial.text}"</p>

              <div className="flex items-center gap-5">
                <img 
                  src={testimonial.avatar_url} 
                  alt={testimonial.name} 
                  className="h-16 w-16 rounded-3xl object-cover border-4 border-white shadow-xl"
                />
                <div>
                  <div className="font-[900] text-slate-950 text-base leading-none mb-1">{testimonial.name}</div>
                  <div className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{testimonial.role}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-primary py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,_white_1px,_transparent_1px)] bg-[size:40px_40px]"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10 text-white">
          <h3 className="text-5xl md:text-8xl font-[900] tracking-tighter leading-[0.85] mb-12">Pronto para <br /> ser encontrado?</h3>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Link to="/auth?mode=register">
              <Button size="lg" className="h-20 px-16 rounded-[2rem] bg-white text-primary font-black text-2xl hover:bg-slate-100 shadow-3xl active:scale-95 transition-all">
                Cadastrar Agora
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Corporate Footer */}
      <footer className="bg-slate-950 text-white py-24 relative z-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-8">
                <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center">
                   <MapPin className="text-white h-7 w-7" />
                </div>
                <span className="font-[900] text-3xl tracking-tighter uppercase">{config.platform_name}</span>
              </div>
              <p className="text-slate-400 text-lg max-w-sm mb-10 font-medium">Liderando a transformação digital de {config.platform_city} através de conexões autênticas e tecnologia de elite.</p>
              <div className="flex gap-4">
                 {[Globe, Users2, ShieldCheck, Zap].map((Icon, i) => (
                    <a key={i} href="#" className="h-12 w-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all duration-300">
                       <Icon className="h-5 w-5" />
                    </a>
                 ))}
              </div>
            </div>
            
            <div>
              <h5 className="font-black text-xs uppercase tracking-[0.3em] text-primary mb-10">Plataforma</h5>
              <ul className="flex flex-col gap-6 text-slate-400 font-bold text-sm uppercase tracking-widest">
                <li><Link to="/buscar" className="hover:text-white transition-colors">Busca Local</Link></li>
                <li><Link to="/categorias" className="hover:text-white transition-colors">Categorias</Link></li>
                <li><Link to="/noticias" className="hover:text-white transition-colors">Blog Local</Link></li>
                <li><Link to="/planos" className="hover:text-white transition-colors">Planos Elite</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-black text-xs uppercase tracking-[0.3em] text-emerald-400 mb-10">Suporte</h5>
              <ul className="flex flex-col gap-6 text-slate-400 font-bold text-sm uppercase tracking-widest">
                <li><a href="#" className="hover:text-white transition-colors">Central de Ajuda</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Políticas</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Fale Conosco</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Anunciar</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-12 border-t border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
            <span>© {new Date().getFullYear()} {config.platform_name} — Developed with Elite Standards.</span>
            <div className="flex gap-10">
               <a href="#" className="hover:text-white transition-colors">Termos</a>
               <a href="#" className="hover:text-white transition-colors">Privacidade</a>
               <a href="#" className="hover:text-white transition-colors">Segurança</a>
            </div>
          </div>
        </div>
      </footer>

      <BottomTabBar />
    </div>
  );
};

export default Index;
