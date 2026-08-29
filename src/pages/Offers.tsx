import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Tag, 
  Calendar, 
  MapPin, 
  Clock, 
  Zap, 
  Gift, 
  Percent, 
  Ticket, 
  Copy, 
  Check, 
  Store, 
  ExternalLink,
  Sparkles
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SEO } from "@/components/SEO";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { usePlatform } from "@/contexts/PlatformContext";

const DISCOUNT_CONFIG = {
  percent: { icon: Percent, label: "Desconto", color: "bg-primary/10 text-primary" },
  fixed: { icon: Tag, label: "Fixo", color: "bg-blue-100 text-blue-700" },
  freebie: { icon: Gift, label: "Brinde", color: "bg-emerald-100 text-emerald-700" },
};

export default function PublicOffers() {
  const navigate = useNavigate();
  const { currentCity } = usePlatform();
  const [selectedCoupon, setSelectedCoupon] = useState<any>(null);

  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["public-coupons", currentCity],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("coupons")
        .select("*, businesses(name, slug, image_url, city, address)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data || [];
    },
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["public-events", currentCity],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("local_events")
        .select("*, businesses(name, slug, image_url, city, address)")
        .eq("active", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data || [];
    },
  });

  const filteredCoupons = coupons.filter((c: any) => 
    !currentCity || c.businesses?.city === currentCity
  );

  const filteredEvents = events.filter((e: any) => 
    !currentCity || e.businesses?.city === currentCity
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Código "${code}" copiado! Apresente no balcão da loja.`);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12">
      <SEO
        title={`Ofertas, Cupons e Eventos ${currentCity ? `em ${currentCity}` : ""}`}
        description="Economize com descontos exclusivos no comércio local e confira a programação de eventos da cidade."
      />
      <Header />

      {/* Hero Header */}
      <div className="bg-slate-950 text-white pt-32 pb-16 px-6 relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto relative z-10">
          <Badge className="bg-primary/20 text-primary border-none mb-3 px-3 py-1 font-black uppercase text-[10px] tracking-wider">
            <Zap className="h-3.5 w-3.5 mr-1 inline" /> Economia Local {currentCity ? `• ${currentCity}` : ""}
          </Badge>
          <h1 className="text-3xl md:text-5xl font-[900] tracking-tight mb-2">
            Cupons & Eventos Exclusivos
          </h1>
          <p className="text-slate-400 text-sm md:text-base font-medium max-w-xl">
            Aproveite promoções de balcão e fique por dentro do que está acontecendo na cidade.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-12">
        {/* ──── Cupons de Desconto ──── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1.5 bg-primary rounded-full" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
              Cupons Ativos ({filteredCoupons.length})
            </h2>
          </div>

          {loadingCoupons ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : filteredCoupons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <Ticket className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-black uppercase tracking-widest">Nenhum cupom ativo no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredCoupons.map((coupon: any, i: number) => {
                const cfg = DISCOUNT_CONFIG[coupon.discount_type as keyof typeof DISCOUNT_CONFIG];
                const Icon = cfg?.icon || Tag;
                const isExpiring = coupon.valid_until && new Date(coupon.valid_until).getTime() - Date.now() < 48 * 3600 * 1000;
                
                return (
                  <motion.div key={coupon.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                    <Card 
                      onClick={() => setSelectedCoupon(coupon)}
                      className="border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group bg-white"
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${cfg?.color || "bg-slate-100"}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            {coupon.code && (
                              <span className="text-[9px] font-black font-mono bg-slate-900 text-white px-2.5 py-1 rounded-lg tracking-widest">
                                {coupon.code}
                              </span>
                            )}
                            {isExpiring && (
                              <span className="flex items-center gap-1 text-[8px] font-black text-rose-500 uppercase tracking-widest">
                                <Clock className="h-2.5 w-2.5" /> Expirando
                              </span>
                            )}
                          </div>
                        </div>
                        <h3 className="font-black text-slate-900 text-base leading-snug mb-1">{coupon.title}</h3>
                        {coupon.description && (
                          <p className="text-xs text-slate-400 mb-3 line-clamp-2">{coupon.description}</p>
                        )}
                        <div className="flex items-center gap-2">
                          {coupon.businesses?.image_url && (
                            <img src={coupon.businesses.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                          )}
                          <span className="text-[10px] font-black text-slate-500 group-hover:text-primary transition-colors">
                            {coupon.businesses?.name}
                          </span>
                        </div>
                        {coupon.valid_until && (
                          <p className="text-[9px] text-slate-300 font-bold mt-2">
                            Válido até {format(new Date(coupon.valid_until), "dd/MM/yyyy")}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* ──── Eventos ──── */}
        <section>
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1.5 bg-purple-500 rounded-full" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
              Próximos Eventos ({filteredEvents.length})
            </h2>
          </div>

          {loadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-56 bg-white rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100 shadow-sm">
              <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-black uppercase tracking-widest">Nenhum evento próximo agendado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredEvents.map((event: any, i: number) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                  <Link to={`/negocio/${event.businesses?.slug}`}>
                    <Card className="border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group bg-white">
                      {event.cover_image_url ? (
                        <img src={event.cover_image_url} alt={event.title} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <Calendar className="h-10 w-10 text-purple-400/50" />
                        </div>
                      )}
                      <CardContent className="p-5 space-y-2">
                        <div className="flex items-center justify-between">
                          <Badge className="bg-purple-100 text-purple-700 border-none font-black text-[9px] uppercase">
                            {event.is_free ? "Gratuito" : "Ingresso Pago"}
                          </Badge>
                          <span className="text-[10px] font-bold text-slate-400">
                            {format(new Date(event.event_date), "dd/MM 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                        <h3 className="font-black text-slate-900 text-base">{event.title}</h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{event.description}</p>
                        <p className="text-[10px] font-bold text-primary flex items-center gap-1 pt-1">
                          <Store className="h-3 w-3" /> {event.businesses?.name}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Modal de Resgate de Cupom em Destaque */}
      {selectedCoupon && (
        <Dialog open={!!selectedCoupon} onOpenChange={(open) => !open && setSelectedCoupon(null)}>
          <DialogContent className="sm:max-w-[450px] rounded-3xl p-8 bg-white text-center border-none shadow-2xl">
            <div className="w-16 h-16 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mx-auto mb-4">
              <Ticket className="h-8 w-8" />
            </div>

            <DialogHeader className="text-center space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                {selectedCoupon.businesses?.name}
              </span>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                {selectedCoupon.title}
              </DialogTitle>
              {selectedCoupon.description && (
                <DialogDescription className="text-xs text-slate-500 font-medium pt-1">
                  {selectedCoupon.description}
                </DialogDescription>
              )}
            </DialogHeader>

            {/* Código do Cupom em Destaque */}
            <div className="my-6 p-6 bg-slate-900 text-white rounded-3xl space-y-3 shadow-xl">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Código de Validação</p>
              <p className="font-mono font-[900] text-3xl text-emerald-400 tracking-widest select-all">
                {selectedCoupon.code || "OFERTA"}
              </p>
              <Button
                onClick={() => handleCopyCode(selectedCoupon.code || "OFERTA")}
                className="w-full h-11 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-emerald-500/20"
              >
                <Copy className="h-4 w-4" /> Copiar Código do Cupom
              </Button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
              💡 <strong>Como usar:</strong> Apresente este código no caixa ou informe pelo WhatsApp da loja para obter seu desconto.
            </p>

            <div className="pt-4 flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setSelectedCoupon(null)}
                className="flex-1 rounded-2xl h-11 text-xs font-bold"
              >
                Fechar
              </Button>
              <Button 
                onClick={() => {
                  const slug = selectedCoupon.businesses?.slug;
                  setSelectedCoupon(null);
                  if (slug) navigate(`/negocio/${slug}`);
                }}
                className="flex-1 rounded-2xl h-11 text-xs font-black uppercase bg-slate-900 text-white gap-1.5"
              >
                Ver Estabelecimento <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      <BottomTabBar />
    </div>
  );
}
