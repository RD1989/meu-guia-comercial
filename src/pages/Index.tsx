import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { useLocation } from "@/hooks/use-location";
import { useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import { SmartAdSlot } from "@/components/portal/SmartAdSlot";
import { SEO } from "@/components/SEO";

// Modular Home Components
import { HeroSection } from "@/components/portal/home/HeroSection";
import { HomeBannersCarousel } from "@/components/portal/home/HomeBannersCarousel";
import { CategoryGrid } from "@/components/portal/home/CategoryGrid";
import { HomeCouponsSection } from "@/components/portal/home/HomeCouponsSection";
import { FeaturedBusinesses } from "@/components/portal/home/FeaturedBusinesses";
import { HomeJobsSection } from "@/components/portal/home/HomeJobsSection";
import { BentoEcosystem } from "@/components/portal/home/BentoEcosystem";
import { HomeFooter } from "@/components/portal/home/HomeFooter";

const Index = () => {
  const navigate = useNavigate();
  const { config, currentCity, setCurrentCity } = usePlatform();
  const userLocation = useLocation();
  const [search, setSearch] = useState("");

  // Categories Query
  const { data: categories = [], isLoading: catLoading } = useQuery({
    queryKey: ["categories-home"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("name")
        .limit(12);
      if (error) throw error;
      return data || [];
    },
  });

  // Featured Businesses Query (Filtered by active city if present)
  const { data: businesses = [], isLoading: bizLoading } = useQuery({
    queryKey: ["featured-businesses-home", currentCity],
    queryFn: async () => {
      let q = supabase
        .from("businesses")
        .select("*, categories(name)")
        .eq("active", true);

      if (currentCity && currentCity !== "Todas as Cidades") {
        q = q.ilike("city", `%${currentCity}%`);
      }

      const { data, error } = await q
        .order("profile_views", { ascending: false })
        .limit(6);

      if (error) throw error;
      
      // Fallback: se não houver empresas suficientes na cidade filtrada, traz as mais vistas gerais
      if (!data || data.length === 0) {
        const { data: fallbackData } = await supabase
          .from("businesses")
          .select("*, categories(name)")
          .eq("active", true)
          .order("profile_views", { ascending: false })
          .limit(6);
        return fallbackData || [];
      }

      return data || [];
    },
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search.trim()) params.set("q", search.trim());
    if (currentCity.trim() && currentCity !== "Todas as Cidades") {
      params.set("cidade", currentCity.trim());
    }
    navigate(`/buscar?${params.toString()}`);
  };

  // Structured Data (WebSite + SearchAction) para Google
  const homeSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": config.platform_name || "Meu Guia Comercial",
    "url": typeof window !== "undefined" ? window.location.origin : "",
    "potentialAction": {
      "@type": "SearchAction",
      "target": `${typeof window !== "undefined" ? window.location.origin : ""}/buscar?q={search_term_string}`,
      "query-input": "required name=search_term_string"
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 pb-20 md:pb-0 font-sans">
      <SEO 
        title={config.platform_name || "Guia Comercial Local"}
        description={config.platform_description || "Descubra os melhores restaurantes, comércios e serviços da sua região."}
        schema={homeSchema}
      />

      <Header />

      {/* 1. Hero Section com Busca Inteligente & Popover de Cidades */}
      <HeroSection 
        search={search}
        setSearch={setSearch}
        selectedCity={currentCity}
        setSelectedCity={setCurrentCity}
        onSearch={handleSearchSubmit}
        platformName={config.platform_name}
        platformDescription={config.platform_description}
      />

      {/* 2. Carrossel de Banners Promocionais Dinâmicos dos Patrocinadores */}
      <HomeBannersCarousel />

      {/* 3. Grade de Categorias em Destaque */}
      <CategoryGrid 
        categories={categories}
        isLoading={catLoading}
      />

      {/* 4. Vitrine de Cupons & Ofertas Relâmpago */}
      <HomeCouponsSection />

      {/* 5. Estabelecimentos em Destaque com Avaliações & WhatsApp */}
      <FeaturedBusinesses 
        businesses={businesses}
        isLoading={bizLoading}
      />

      {/* 6. Vagas de Emprego Locais na Cidade */}
      <HomeJobsSection />

      {/* 7. Bento Ecosystem (Comunidade, Notícias & Serviços) */}
      <BentoEcosystem />

      {/* 8. Pop-up de Oferta Especial */}
      <SmartAdSlot type="popup" />

      {/* 9. CTA do Lojista & Rodapé Completo */}
      <HomeFooter />

      <BottomTabBar />
    </div>
  );
};

export default Index;
