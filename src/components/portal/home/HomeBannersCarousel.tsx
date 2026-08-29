import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/contexts/PlatformContext";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Sparkles, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const FALLBACK_BANNERS = [
  {
    id: "fb_1",
    title: "Anuncie Sua Empresa Aqui",
    subtitle: "Alcance milhares de clientes na sua cidade todos os dias",
    image_url: "https://images.unsplash.com/photo-1556742049-0a67c55c0624?q=80&w=1200",
    link_url: "/planos",
    button_text: "Quero Anunciar"
  },
  {
    id: "fb_2",
    title: "Economize no Comércio Local",
    subtitle: "Aproveite cupons de desconto exclusivos nas lojas parceiras",
    image_url: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200",
    link_url: "/ofertas",
    button_text: "Ver Cupons"
  }
];

export function HomeBannersCarousel() {
  const { currentCity } = usePlatform();
  const [currentIndex, setCurrentIndex] = useState(0);

  const { data: dbBanners = [] } = useQuery({
    queryKey: ["platform-home-banners", currentCity],
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("platform_banners")
          .select("*")
          .eq("active", true)
          .order("sort_order", { ascending: true });
        
        if (error) throw error;
        return data || [];
      } catch {
        return [];
      }
    }
  });

  const banners = dbBanners.length > 0 ? dbBanners : FALLBACK_BANNERS;

  // Auto-play a cada 6 segundos
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [banners.length]);

  const nextSlide = () => setCurrentIndex((prev) => (prev + 1) % banners.length);
  const prevSlide = () => setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);

  const currentBanner = banners[currentIndex] || banners[0];

  return (
    <section className="max-w-7xl mx-auto px-6 -mt-8 relative z-20">
      <div className="relative h-48 sm:h-64 md:h-80 w-full rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-900/10 border border-slate-100 group bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner.id || currentIndex}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 w-full h-full"
          >
            {/* Background Image */}
            <img
              src={currentBanner.image_url}
              alt={currentBanner.title}
              className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

            {/* Banner Content */}
            <div className="absolute inset-0 p-6 sm:p-12 flex flex-col justify-center max-w-xl text-white space-y-2 sm:space-y-4">
              <span className="inline-flex items-center gap-1.5 text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 w-fit px-3 py-1 rounded-full border border-primary/20 backdrop-blur-md">
                <Sparkles className="h-3 w-3" /> Destaque da Semana
              </span>
              <h3 className="text-xl sm:text-3xl md:text-4xl font-[900] tracking-tight leading-tight drop-shadow-md">
                {currentBanner.title}
              </h3>
              {currentBanner.subtitle && (
                <p className="text-slate-300 text-xs sm:text-sm font-medium line-clamp-2 leading-relaxed">
                  {currentBanner.subtitle}
                </p>
              )}
              {currentBanner.link_url && (
                <div className="pt-2">
                  <Button
                    asChild
                    className="h-10 sm:h-12 px-6 rounded-xl sm:rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-primary/30"
                  >
                    <a href={currentBanner.link_url}>
                      {currentBanner.button_text || "Conferir"} <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Navigation Arrows */}
        {banners.length > 1 && (
          <>
            <button
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-black/40 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10 rounded-2xl bg-black/40 hover:bg-primary text-white backdrop-blur-md flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>

            {/* Indicator Dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
              {banners.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`h-2 rounded-full transition-all ${
                    currentIndex === i ? "w-6 bg-primary" : "w-2 bg-white/40"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
