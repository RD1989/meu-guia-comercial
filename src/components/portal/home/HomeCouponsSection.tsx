import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/contexts/PlatformContext";
import { Ticket, ArrowRight, Copy, Clock, Zap, Percent, Tag, Gift } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { format } from "date-fns";

const DISCOUNT_ICONS: Record<string, any> = {
  percent: Percent,
  fixed: Tag,
  freebie: Gift,
};

export function HomeCouponsSection() {
  const navigate = useNavigate();
  const { currentCity } = usePlatform();

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["home-coupons-highlight", currentCity],
    queryFn: async () => {
      let query = (supabase as any)
        .from("coupons")
        .select("*, businesses(name, slug, image_url, city)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(4);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const handleCopyCode = (e: React.MouseEvent, code: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    toast.success(`Cupom "${code}" copiado! Apresente no balcão.`);
  };

  if (!isLoading && coupons.length === 0) {
    return null; // Não ocupa espaço se não houver cupons
  }

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-100 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-amber-500 text-xs font-black uppercase tracking-wider mb-1">
            <Zap className="h-4 w-4" /> Economize na Cidade
          </div>
          <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 tracking-tight">
            Cupons & Ofertas em Alta
          </h2>
        </div>
        <Link 
          to="/ofertas" 
          className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold hover:underline"
        >
          Ver Todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-44 rounded-3xl bg-slate-100 animate-pulse" />
          ))
        ) : (
          coupons.map((c: any, i: number) => {
            const discountLabel = c.discount_type === "percent"
              ? `${c.discount_value}% OFF`
              : c.discount_type === "fixed"
              ? `R$ ${c.discount_value} OFF`
              : "Brinde";

            const Icon = DISCOUNT_ICONS[c.discount_type] || Tag;

            return (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
                onClick={() => navigate(`/negocio/${c.businesses?.slug}`)}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group shadow-sm border-l-4 border-l-primary relative overflow-hidden"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 truncate max-w-[130px]">
                      {c.businesses?.name || "Comércio Local"}
                    </span>
                    <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px] px-2 py-0.5">
                      {discountLabel}
                    </Badge>
                  </div>

                  <h3 className="font-black text-slate-900 text-sm leading-tight line-clamp-1 group-hover:text-primary transition-colors">
                    {c.title}
                  </h3>

                  {c.description && (
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {c.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-2">
                  <div className="font-mono font-black text-[11px] bg-slate-100 text-slate-800 px-2.5 py-1 rounded-xl">
                    {c.code || "OFERTA"}
                  </div>
                  <Button
                    size="sm"
                    onClick={(e) => handleCopyCode(e, c.code || "OFERTA")}
                    className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-primary hover:bg-primary/90 text-white gap-1"
                  >
                    <Copy className="h-3 w-3" /> Copiar
                  </Button>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </section>
  );
}
