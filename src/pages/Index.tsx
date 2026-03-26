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
  Users2,
  CheckCircle2,
  Zap,
  MessageSquare,
  Globe,
  Rocket
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
import { motion, AnimatePresence } from "framer-motion";

const Index = () => {
  const { user, isLojista, isAdmin, isSuperAdmin } = useAuth();
  const userLoc = useLocation();
  const navigate = useNavigate();
  const { config } = usePlatform();
  const [search, setSearch] = useState("");

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans selection:bg-primary/20 selection:text-primary overflow-x-hidden">
      <Header />

      {/* Hero Section Premium */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200">
        {/* Animated Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
          <motion.div 
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 45, 0],
              opacity: [0.1, 0.2, 0.1]
            }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] bg-primary/20 blur-[120px] rounded-full"
          />
          <motion.div 
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -45, 0],
              opacity: [0.1, 0.15, 0.1]
            }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute -bottom-[20%] -left-[10%] w-[500px] h-[500px] bg-blue-400/20 blur-[100px] rounded-full"
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-20 md:py-32 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center text-center"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-bold mb-8 shadow-sm">
              <Sparkles className="h-4 w-4" />
              O Guia Comercial Inteligente de {config.platform_city}
            </div>

            <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] max-w-5xl mx-auto mb-8">
              Encontre o que você precisa em <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600 font-extrabold">{config.platform_city}</span>
            </h1>

            <p className="text-xl md:text-2xl text-slate-600 font-medium max-w-3xl mx-auto mb-12 leading-relaxed">
              Descubra os melhores estabelecimentos, serviços e ofertas da região com a confiança de quem conhece a cidade.
            </p>

            <motion.form 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              onSubmit={handleSearch} 
              className="w-full max-w-3xl mx-auto relative group"
            >
              <div className="flex flex-col md:flex-row items-center bg-white/80 backdrop-blur-xl border-2 border-slate-200 rounded-2xl shadow-2xl shadow-primary/5 focus-within:border-primary focus-within:ring-8 focus-within:ring-primary/5 transition-all p-3 gap-3">
                <div className="flex items-center flex-1 w-full pl-3">
                  <SearchIcon className="h-6 w-6 text-slate-400" />
                  <Input 
                    className="border-none bg-transparent h-14 text-xl focus-visible:ring-0 placeholder:text-slate-400 w-full font-medium"
                    placeholder="O que você está procurando hoje?"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <Button type="submit" className="w-full md:w-auto h-14 px-10 rounded-xl bg-primary hover:bg-primary/90 text-white font-black text-lg shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all">
                  Explorar Agora
                </Button>
              </div>
              
              <div className="mt-8 flex flex-wrap justify-center items-center gap-3">
                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mr-2">Buscas comuns:</span>
                {['Restaurantes', 'Academias', 'Saúde', 'Pet Shops', 'Imóveis'].map((tag) => (
                  <button 
                    key={tag} 
                    type="button"
                    onClick={() => {setSearch(tag); navigate(`/buscar?q=${tag}`)}} 
                    className="group flex items-center gap-1.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 hover:border-primary hover:text-primary px-5 py-2 rounded-full transition-all shadow-sm hover:shadow-md"
                  >
                    <Zap className="h-3.5 w-3.5 text-slate-300 group-hover:text-primary transition-colors" />
                    {tag}
                  </button>
                ))}
              </div>
            </motion.form>
          </motion.div>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-16 border-b border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-10">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
          {[
            { label: 'Negócios Cadastrados', value: '1.2k+', icon: Building2 },
            { label: 'Categorias Ativas', value: '45+', icon: TrendingUp },
            { label: 'Acessos Mensais', value: '15k+', icon: Users2 },
            { label: 'Avaliações Reais', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="h-12 w-12 rounded-xl bg-primary/20 flex items-center justify-center mb-4 border border-primary/30">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-4xl font-black text-white tracking-tight mb-1">{stat.value}</div>
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-24 bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">Como o Guia Funciona?</h2>
            <p className="text-lg text-slate-500 font-medium">Três passos simples para encontrar o que você precisa ou destacar seu negócio.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                step: '01', 
                title: 'Pesquise', 
                desc: 'Use nossa busca inteligente para encontrar categorias, produtos ou serviços específicos.',
                icon: SearchIcon,
                color: 'bg-blue-500'
              },
              { 
                step: '02', 
                title: 'Compare', 
                desc: 'Veja fotos, avaliações reais e informações detalhadas de cada estabelecimento.',
                icon: Star,
                color: 'bg-primary'
              },
              { 
                step: '03', 
                title: 'Conecte-se', 
                desc: 'Chame no WhatsApp, faça um pedido ou reserve um horário diretamente pela plataforma.',
                icon: MessageSquare,
                color: 'bg-green-500'
              }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="relative p-8 rounded-3xl bg-slate-50 border border-slate-100 group hover:bg-white hover:border-primary/20 hover:shadow-2xl hover:shadow-primary/5 transition-all"
              >
                <div className={`h-14 w-14 rounded-2xl ${item.color} text-white flex items-center justify-center mb-6 shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                  <item.icon className="h-7 w-7" />
                </div>
                <div className="text-5xl font-black text-slate-200 absolute top-8 right-8 group-hover:text-primary/10 transition-colors">{item.step}</div>
                <h3 className="text-2xl font-bold text-slate-900 mb-3">{item.title}</h3>
                <p className="text-slate-500 font-medium leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Grid Clean */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
          <div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight">Categorias Populares</h2>
            <p className="text-slate-500 mt-2 text-lg font-medium">O que você deseja explorar hoje?</p>
          </div>
          <Link to="/buscar">
            <Button variant="ghost" className="font-bold text-primary hover:bg-primary/5 group">
              Explorar tudo <ArrowRight className="h-5 w-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {catLoading ? (
          <div className="flex justify-center flex-col items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <span className="text-slate-500">Sincronizando categorias...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
            {categories.map((cat, i) => (
              <motion.div 
                key={cat.id}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: (i % 6) * 0.05 }}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="bg-white border border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:shadow-xl hover:-translate-y-1 transition-all group"
              >
                <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center mb-5 group-hover:bg-primary/10 group-hover:scale-110 transition-all shadow-sm">
                  <MapPin className="h-7 w-7 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <span className="font-black text-slate-800 text-base group-hover:text-primary transition-colors">{cat.name}</span>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Merchant Benefits Section */}
      <section className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/20 blur-[100px] rounded-full -mr-48 -mt-24"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">Por que colocar sua empresa no <span className="text-primary">nosso guia?</span></h2>
              <div className="space-y-6">
                {[
                  { title: 'Presença Digital Imediata', desc: 'Sua empresa com uma página profissional em minutos, otimizada para buscadores.', icon: Globe },
                  { title: 'Gestão de Lead', desc: 'Receba contatos diretamente no WhatsApp e gerencie pedidos de forma simples.', icon: Zap },
                  { title: 'Sistema de Agendamento', desc: 'Permita que seus clientes reservem serviços sem precisar te ligar.', icon: CheckCircle2 },
                  { title: 'Cardápio Digital', desc: 'Exiba seus produtos com fotos, preços e categorias de forma moderna.', icon: Building2 }
                ].map((benefit, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-primary/20 border border-primary/30 flex items-center justify-center">
                      <benefit.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{benefit.title}</h4>
                      <p className="text-slate-400 font-medium">{benefit.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-square rounded-3xl bg-gradient-to-br from-primary/20 to-blue-600/20 border border-white/10 p-4 relative">
                <img 
                  src="https://images.unsplash.com/photo-1556742044-3c52d6e88c62?q=80&w=800" 
                  alt="Merchant using the platform" 
                  className="w-full h-full object-cover rounded-2xl shadow-2xl opacity-80"
                />
                <div className="absolute -bottom-6 -right-6 md:-right-12 bg-white p-6 rounded-2xl shadow-2xl max-w-xs border border-slate-100 hidden md:block">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Rocket className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-black text-slate-800 text-lg">+150% Leads</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium">Empresas verificadas têm aumento imediato na visibilidade local.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Businesses Section Clean */}
      <section id="destaques" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-4">
            <div>
              <h2 className="text-4xl font-black text-slate-900 tracking-tight">Experiências Exclusivas</h2>
              <p className="text-slate-500 mt-2 text-lg font-medium">Conheça os favoritos da comunidade em {config.platform_city}.</p>
            </div>
            <Link to="/buscar">
              <Button variant="outline" className="font-bold text-primary border-primary/20 hover:bg-primary/5 rounded-full px-8">
                Mapa Completo <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          </div>

          {bizLoading ? (
            <div className="flex justify-center flex-col items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <span className="text-slate-500">Buscando melhores opções...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
                .sort((a, b) => {
                  if (a.distance !== undefined && b.distance !== undefined) {
                    return a.distance - b.distance;
                  }
                  return 0;
                })
                .map((biz) => (
                  <motion.div 
                    key={biz.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: biz.animationDelay }}
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
                      distance={biz.distance}
                    />
                  </motion.div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">O que dizem nossos usuários</h2>
            <div className="flex justify-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-6 w-6 fill-yellow-400 text-yellow-400" />)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Ricardo Silva', role: 'Usuário', text: 'Encontrei uma oficina excelente que nem sabia que existia no meu bairro. O agendamento foi super rápido!' },
              { name: 'Ana Oliveira', role: 'Dona de Restaurante', text: 'Desde que cadastrei minha pizzaria, o número de pedidos via WhatsApp cresceu muito graças à vitrine do guia.' },
              { name: 'Marcos Souza', role: 'Usuário', text: 'Uso sempre para descobrir novos lugares para levar a família no final de semana. Essencial para a cidade.' }
            ].map((testimonial, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm relative"
              >
                <div className="absolute -top-4 -left-4 bg-primary text-white p-2 rounded-xl shadow-lg">
                  <MessageSquare className="h-5 w-5" />
                </div>
                <p className="text-slate-600 font-medium italic mb-6 leading-relaxed">"{testimonial.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 uppercase">{testimonial.name[0]}</div>
                  <div>
                    <div className="font-black text-slate-900 leading-none">{testimonial.name}</div>
                    <div className="text-xs font-bold text-primary uppercase mt-1 tracking-tight">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section Clean */}
      <section className="bg-primary/5 py-24 border-y border-primary/10 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-[500px] bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-4xl mx-auto px-6 text-center relative z-10">
          <h3 className="text-4xl md:text-6xl font-black text-slate-900 leading-tight mb-8">
            Pronto para impulsionar seu <span className="text-primary italic">negócio?</span>
          </h3>
          <p className="text-slate-600 text-xl font-medium mb-12 max-w-2xl mx-auto">
            Junte-se à nossa rede e seja encontrado por milhares de pessoas que buscam pelos seus serviços todos os dias.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Link to={user ? (isLojista || isAdmin || isSuperAdmin ? "/dashboard" : "/perfil") : "/auth?mode=register"}>
              <Button size="lg" className="h-16 px-12 rounded-2xl bg-primary text-white font-black text-xl hover:bg-primary/90 shadow-2xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all">
                {user ? "Acessar Meu Painel" : "Cadastrar Agora — É Grátis"}
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <MapPin className="text-primary h-6 w-6" />
            <span className="font-bold text-slate-800 tracking-tight">{config.platform_name}</span>
          </div>
          <p className="text-slate-500 text-sm font-medium text-center md:text-left">
            © {new Date().getFullYear()} Todos os direitos reservados. {config.platform_city}
          </p>
        </div>
      </footer>

      <BottomTabBar />
    </div>
  );
};

export default Index;
