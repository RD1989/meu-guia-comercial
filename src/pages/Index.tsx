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

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans selection:bg-primary/20 selection:text-primary">
      <Header />

      {/* Hero Section Clean */}
      <section className="bg-white border-b border-slate-200 py-16 md:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100/80 border border-slate-200 text-slate-700 text-sm font-semibold mb-8">
            <MapPin className="h-4 w-4 text-primary" />
            O Guia Comercial Oficial de {config.platform_city}
          </div>

          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-4xl mx-auto mb-6">
            Encontre as melhores empresas e serviços em <span className="text-primary">{config.platform_city}</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto mb-10">
            Conectamos você aos estabelecimentos locais mais bem avaliados. Tudo o que você precisa, a um clique de distância.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto relative group">
            <div className="flex items-center bg-white border-2 border-slate-200 rounded-xl shadow-sm focus-within:border-primary focus-within:ring-4 focus-within:ring-primary/10 transition-all p-2">
              <SearchIcon className="h-6 w-6 text-slate-400 ml-3" />
              <Input 
                className="border-none bg-transparent h-12 text-lg focus-visible:ring-0 placeholder:text-slate-400"
                placeholder="Buscar padarias, médicos, serviços..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Button type="submit" className="h-12 px-8 rounded-lg bg-primary hover:bg-primary/90 text-white font-bold text-base shadow-none">
                Buscar
              </Button>
            </div>
            
            <div className="mt-5 flex flex-wrap justify-center gap-2">
              <span className="text-sm font-semibold text-slate-500 py-1">Em alta:</span>
              {['Gastronomia', 'Saúde', 'Serviços Auto', 'Moda'].map((tag) => (
                <button 
                  key={tag} 
                  type="button"
                  onClick={() => {setSearch(tag); navigate(`/buscar?q=${tag}`)}} 
                  className="text-sm font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 px-4 py-1.5 rounded-full transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </form>
        </div>
      </section>

      {/* Stats Bar */}
      <section className="bg-slate-900 py-12 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { label: 'Negócios Cadastrados', value: '1.2k+', icon: Building2 },
            { label: 'Categorias Ativas', value: '45+', icon: TrendingUp },
            { label: 'Acessos Mensais', value: '15k+', icon: Users2 },
            { label: 'Avaliações Reais', value: '100%', icon: ShieldCheck },
          ].map((stat, i) => (
            <div key={i} className="flex flex-col items-center text-center">
              <stat.icon className="h-8 w-8 text-primary mb-3" />
              <div className="text-3xl font-extrabold text-white tracking-tight mb-1">{stat.value}</div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories Grid Clean */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Categorias em Destaque</h2>
            <p className="text-slate-500 mt-2 font-medium">Explore os principais segmentos da nossa cidade.</p>
          </div>
          <Link to="/buscar">
            <Button variant="outline" className="font-semibold text-primary border-slate-200 hover:bg-slate-50">
              Ver todas as categorias <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>

        {catLoading ? (
          <div className="flex justify-center flex-col items-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
            <span className="text-slate-500">Carregando categorias...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <div 
                key={cat.id}
                onClick={() => navigate(`/buscar?categoria=${cat.slug}`)}
                className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-primary hover:shadow-md transition-all group"
              >
                <div className="h-14 w-14 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                  <MapPin className="h-6 w-6 text-slate-600 group-hover:text-primary transition-colors" />
                </div>
                <span className="font-bold text-slate-700 text-sm group-hover:text-primary transition-colors">{cat.name}</span>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Featured Businesses Section Clean */}
      <section id="destaques" className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between mb-10 gap-4">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Estabelecimentos Premium</h2>
              <p className="text-slate-500 mt-2 font-medium">Os lugares mais bem avaliados pelos clientes.</p>
            </div>
            <Link to="/buscar">
              <Button variant="outline" className="font-semibold text-primary border-slate-200 hover:bg-slate-50">
                Ver Mapa Completo <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>

          {bizLoading ? (
            <div className="flex justify-center flex-col items-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
              <span className="text-slate-500">Carregando estabelecimentos...</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
                  <div key={biz.id}>
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
                  </div>
                ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section Clean */}
      <section className="bg-primary py-24 border-t border-primary/20">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h3 className="text-3xl md:text-5xl font-extrabold text-white leading-tight mb-6">
            Destaque sua empresa no {config.platform_name}
          </h3>
          <p className="text-primary-foreground/90 text-lg md:text-xl font-medium mb-10 max-w-2xl mx-auto">
            Junte-se a centenas de empresas locais e aumente sua visibilidade na cidade. Cadastro rápido e fácil.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to={user ? (isLojista || isAdmin || isSuperAdmin ? "/dashboard" : "/perfil") : "/auth?mode=register"}>
              <Button size="lg" className="h-14 px-10 rounded-xl bg-white text-primary font-bold text-lg hover:bg-slate-50 shadow-sm border-none">
                {user ? "Acessar Painel" : "Cadastrar Minha Empresa"}
              </Button>
            </Link>
            {!user && (
              <Link to="/auth?mode=register">
                <Button size="lg" variant="outline" className="h-14 px-10 rounded-xl border-white/30 text-white bg-transparent hover:bg-white/10 font-bold text-lg">
                  Começar Agora
                </Button>
              </Link>
            )}
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
