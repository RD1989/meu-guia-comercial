import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
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
import { CategoryCard } from "@/components/portal/CategoryCard";
import { BusinessCard } from "@/components/portal/BusinessCard";
import { Button } from "@/components/ui/button";
import { useLocation } from "@/hooks/use-location";
import { getDistance } from "@/lib/utils";
import { Link, useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { Input } from "@/components/ui/input";

const Index = () => {
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
        .limit(12); // Limitar para não quebrar o layout se houver muitas
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
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-0">
      <Header />

      {/* Hero Section Premium */}
      <section className="relative pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden bg-white border-b border-slate-100">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }} />
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="relative max-w-7xl mx-auto px-6 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-600 border border-slate-200 text-[10px] md:text-xs font-black px-4 py-2 rounded-full mb-8 uppercase tracking-widest shadow-sm">
            <Sparkles className="h-3 w-3 text-primary animate-bounce" />
            O Guia Oficial de {config.platform_city}
          </div>

          <h1 className="text-4xl md:text-7xl font-black text-slate-900 leading-[1.1] max-w-4xl tracking-tight mb-6">
            Descubra o que há de <br className="hidden md:block" />
            <span className="text-primary italic relative">
              melhor
              <svg className="absolute -bottom-2 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 10" preserveAspectRatio="none">
                <path d="M0 5 Q 25 0, 50 5 T 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
              </svg>
            </span> em sua cidade.
          </h1>

          <p className="text-slate-500 mt-2 max-w-2xl text-base md:text-xl font-medium leading-relaxed mb-12">
            Conectamos você com os estabelecimentos mais bem avaliados, 
            serviços exclusivos e notícias fresquinhas da nossa região.
          </p>

          <form onSubmit={handleSearch} className="w-full max-w-2xl group">
            <div className="relative flex items-center p-2 bg-white rounded-3xl shadow-2xl shadow-slate-200 border border-slate-100 group-focus-within:ring-4 ring-primary/10 transition-all duration-300">
              <div className="p-3 text-slate-400">
                <SearchIcon className="h-6 w-6" />
              </div>
              <Input 
                className="border-none bg-transparent h-14 text-lg focus-visible:ring-0 placeholder:text-slate-400"
                placeholder="O que você está procurando hoje?"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" className="h-12 px-8 rounded-2xl bg-primary text-white font-bold text-base shadow-lg shadow-primary/25 hover:shadow-primary/40 transition-all ml-2 hidden md:flex">
                Buscar Agora
              </Button>
            </div>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest px-2">Sugestões:</span>
              {['Pizza', 'Dentistas', 'Academias', 'Eventos'].map(tag => (
                <button key={tag} onClick={() => {setSearch(tag); navigate(`/buscar?q=${tag}`)}} className="text-xs font-bold text-primary hover:bg-primary/5 px-2 rounded-lg transition-colors underline-offset-4 hover:underline">
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-10 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Estabelecimentos', value: '500+', icon: Building2 },
            { label: 'Categorias', value: '25+', icon: TrendingUp },
            { label: 'Usuários Ativos', value: '10k+', icon: Users2 },
            { label: 'Aprovado Regional', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center group">
              <div className="p-3 bg-white/5 rounded-2xl mb-3 group-hover:bg-primary/20 transition-colors">
                <stat.icon className="h-6 w-6 text-primary" />
              </div>
              <div className="text-2xl md:text-3xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid Premium */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex items-end justify-between mb-12 border-l-4 border-primary pl-6">
          <div>
            <span className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-2 block">Explorar</span>
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">Categorias em Alta</h2>
          </div>
          <Link to="/buscar" className="group flex items-center gap-2 text-primary font-black text-sm hover:gap-3 transition-all">
            VER TODAS <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {catLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="group relative h-40 rounded-3xl bg-white border border-slate-100 p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 active:scale-95 overflow-hidden"
              >
                <div className="absolute -right-4 -bottom-4 h-24 w-24 bg-slate-50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-white transition-all duration-300 shadow-inner">
                  {/* Categorias podem ter ícones definidos, fallback para MapPin */}
                  <MapPin className="h-7 w-7" />
                </div>
                <span className="font-black text-slate-800 text-sm group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Businesses Section Premium */}
      <section id="destaques" className="py-24 bg-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-12">
            <div className="max-w-xl">
              <div className="flex items-center gap-2 mb-4">
                <div className="h-px w-8 bg-primary" />
                <span className="text-xs font-black text-primary uppercase tracking-[0.3em]">Exclusivo</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-none">
                Melhores Lugares em <br /> {config.platform_city}
              </h2>
            </div>
            <Link to="/buscar">
              <Button variant="outline" className="mt-8 md:mt-0 rounded-full px-8 py-6 border-slate-300 text-slate-700 font-bold hover:bg-primary hover:text-white hover:border-primary transition-all">
                Ver Mapa Completo
              </Button>
            </Link>
          </div>

          {bizLoading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
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
                  <BusinessCard
                    key={biz.id}
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
                ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section Premium */}
      <section className="max-w-7xl mx-auto px-6 py-24">
        <div className="relative rounded-[40px] bg-primary overflow-hidden shadow-2xl shadow-primary/40 p-8 md:p-20 group">
          <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/2 pointer-events-none group-hover:bg-white/10 transition-all duration-700" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 border-[40px] border-white/10 rounded-full" />
          
          <div className="relative z-10 grid md:grid-cols-2 items-center gap-12">
            <div className="text-center md:text-left">
              <h3 className="text-4xl md:text-6xl font-black text-white leading-tight mb-6">
                Leve o seu negócio para o <span className="text-slate-900 underline underline-offset-8 decoration-white/30">próximo nível</span>.
              </h3>
              <p className="text-white/80 text-lg md:text-xl font-medium mb-10 max-w-md">
                Junte-se a centenas de lojistas que já estão atraindo milhares de clientes locais todos os meses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                <Link to="/auth">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-white text-primary font-black text-lg hover:bg-slate-50 transition-all shadow-xl shadow-black/10">
                    Cadastrar Empresa
                  </Button>
                </Link>
                <div className="flex items-center gap-2 text-white/60 px-4">
                  <Star className="h-4 w-4 fill-white text-white" />
                  <span className="text-sm font-bold">Avaliação 4.9/5 estrelas</span>
                </div>
              </div>
            </div>
            
            <div className="hidden md:flex flex-col gap-4">
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 transform rotate-2 hover:rotate-0 transition-all duration-500">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold">R$</div>
                  <div>
                    <h4 className="text-white font-bold">Aumente suas vendas</h4>
                    <p className="text-white/60 text-xs">Visibilidade 24h por dia para sua cidade.</p>
                  </div>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 transform -rotate-2 translate-x-12 hover:rotate-0 hover:translate-x-0 transition-all duration-500">
                <div className="flex gap-4 items-center">
                  <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center text-primary font-bold text-xl leading-none">AI</div>
                  <div>
                    <h4 className="text-white font-bold">Tecnologia de ponta</h4>
                    <p className="text-white/60 text-xs">Blog automatizado e SEO otimizado por IA.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-white py-12 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="text-slate-400 text-sm font-medium">
            {config.platform_footer_text}
          </div>
        </div>
      </footer>

      <BottomTabBar />
    </div>
  );
};

export default Index;
