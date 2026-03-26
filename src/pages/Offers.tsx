import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Tag, Calendar, MapPin, Clock, Zap, Gift, Percent, Ticket } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { SEO } from "@/components/SEO";

const DISCOUNT_CONFIG = {
  percent: { icon: Percent, label: "Desconto", color: "bg-primary/10 text-primary" },
  fixed: { icon: Tag, label: "Fixo", color: "bg-blue-100 text-blue-700" },
  freebie: { icon: Gift, label: "Brinde", color: "bg-emerald-100 text-emerald-700" },
};

export default function PublicOffers() {
  const { data: coupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["public-coupons"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("coupons")
        .select("*, businesses(name, slug, image_url)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(30);
      if (error) throw error;
      return data;
    },
  });

  const { data: events = [], isLoading: loadingEvents } = useQuery({
    queryKey: ["public-events"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("local_events")
        .select("*, businesses(name, slug, image_url)")
        .eq("active", true)
        .gte("event_date", new Date().toISOString())
        .order("event_date", { ascending: true })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <SEO title="Ofertas & Eventos | Meu Guia Comercial" description="Cupons exclusivos, promoções e eventos locais dos melhores negócios da sua cidade." />
      <Header />

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            <Zap className="h-3.5 w-3.5 fill-primary" />
            Ofertas Exclusivas
          </div>
          <h1 className="text-4xl md:text-5xl font-[900] text-slate-900 tracking-tighter mb-3">
            Cupons & Eventos <span className="text-primary">Locais</span>
          </h1>
          <p className="text-slate-500 font-medium">Economize nos melhores negócios da sua cidade</p>
        </div>

        {/* ──── Cupons ──── */}
        <section className="mb-16">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-6 w-1.5 bg-primary rounded-full" />
            <h2 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">
              Cupons Ativos ({coupons.length})
            </h2>
          </div>

          {loadingCoupons ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 bg-white rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : coupons.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
              <Ticket className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-black uppercase tracking-widest">Nenhum cupom ativo no momento</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {coupons.map((coupon: any, i: number) => {
                const cfg = DISCOUNT_CONFIG[coupon.discount_type as keyof typeof DISCOUNT_CONFIG];
                const Icon = cfg?.icon || Tag;
                const isExpiring = coupon.valid_until && new Date(coupon.valid_until).getTime() - Date.now() < 48 * 3600 * 1000;
                return (
                  <motion.div key={coupon.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Link to={`/negocio/${coupon.businesses?.slug}`}>
                      <Card className="border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:shadow-primary/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer group">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className={`h-10 w-10 rounded-2xl flex items-center justify-center ${cfg?.color || "bg-slate-100"}`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {coupon.code && (
                                <span className="text-[9px] font-black font-mono bg-slate-900 text-white px-2 py-0.5 rounded-lg tracking-widest">
                                  {coupon.code}
                                </span>
                              )}
                              {isExpiring && (
                                <span className="flex items-center gap-1 text-[8px] font-black text-red-500 uppercase tracking-widest">
                                  <Clock className="h-2.5 w-2.5" /> Expirando
                                </span>
                              )}
                            </div>
                          </div>
                          <h3 className="font-black text-slate-900 text-sm leading-tight mb-1">{coupon.title}</h3>
                          {coupon.description && (
                            <p className="text-xs text-slate-400 mb-3 line-clamp-2">{coupon.description}</p>
                          )}
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1.5">
                              {coupon.businesses?.image_url && (
                                <img src={coupon.businesses.image_url} alt="" className="h-5 w-5 rounded-full object-cover" />
                              )}
                              <span className="text-[10px] font-black text-slate-500 group-hover:text-primary transition-colors">
                                {coupon.businesses?.name}
                              </span>
                            </div>
                          </div>
                          {coupon.valid_until && (
                            <p className="text-[9px] text-slate-300 font-bold mt-2">
                              Válido até {format(new Date(coupon.valid_until), "dd/MM/yyyy")}
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
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
              Próximos Eventos ({events.length})
            </h2>
          </div>

          {loadingEvents ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-56 bg-white rounded-[2rem] animate-pulse" />
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-[2rem] border border-slate-100">
              <Calendar className="h-10 w-10 text-slate-200 mx-auto mb-3" />
              <p className="text-sm text-slate-400 font-black uppercase tracking-widest">Nenhum evento próximo</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {events.map((event: any, i: number) => (
                <motion.div key={event.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
                  <Link to={`/negocio/${event.businesses?.slug}`}>
                    <Card className="border border-slate-100 rounded-[2rem] overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                      {event.cover_image_url ? (
                        <img src={event.cover_image_url} alt={event.title} className="w-full h-40 object-cover" />
                      ) : (
                        <div className="w-full h-40 bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center">
                          <Calendar className="h-12 w-12 text-purple-400/50" />
                        </div>
                      )}
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                          {event.is_free ? (
                            <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[8px] font-black">Grátis</Badge>
                          ) : (
                            <Badge className="bg-amber-100 text-amber-700 border-0 text-[8px] font-black">R$ {event.price}</Badge>
                          )}
                        </div>
                        <h3 className="font-black text-slate-900 text-sm mb-2 line-clamp-2">{event.title}</h3>
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(event.event_date), "EEE, dd 'de' MMM • HH:mm", { locale: ptBR })}
                          </div>
                          {event.location && (
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </div>
                          )}
                          <div className="flex items-center gap-1.5 text-[10px] text-primary font-black group-hover:underline">
                            <span>{event.businesses?.name}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </section>
      </div>

      <BottomTabBar />
    </div>
  );
}
