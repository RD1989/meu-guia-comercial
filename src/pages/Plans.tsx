import React, { useState } from "react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Zap, Crown, Rocket, Star, ShieldCheck, ArrowRight, TrendingUp, Calendar, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { SEO } from "@/components/SEO";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  tier: "FREE" | "PRO" | "MAX";
  description: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  max_photos: number;
  max_products: number;
  has_ai: boolean;
  has_menu: boolean;
  has_booking: boolean;
  is_featured: boolean;
  sort_order: number;
}

const Plans = () => {
  const [isAnnual, setIsAnnual] = useState(false);
  const navigate = useNavigate();

  const { data: dbPlans = [], isLoading } = useQuery({
    queryKey: ["subscription-plans"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscription_plans")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data || []) as SubscriptionPlan[];
    }
  });

  const plans: SubscriptionPlan[] = dbPlans.length > 0 ? dbPlans : [
    {
      id: "free",
      name: "Gratuito",
      slug: "free",
      tier: "FREE",
      description: "Presença básica no guia",
      monthly_price: 0,
      annual_price: 0,
      features: ["Perfil Básico", "1 Foto de Capa", "Endereço e WhatsApp", "Horário de Funcionamento"],
      max_photos: 1,
      max_products: 5,
      has_ai: false,
      has_menu: false,
      has_booking: false,
      is_featured: false,
      sort_order: 1
    },
    {
      id: "prof",
      name: "Profissional",
      slug: "prof",
      tier: "PRO",
      description: "Destaque e catálogo para vendas",
      monthly_price: 49.90,
      annual_price: 39.90,
      features: ["Até 20 Fotos na Galeria", "Cardápio Digital & Catálogo", "Agendamento Online", "Selo de Verificado", "Prioridade nas Buscas", "Cupons de Desconto (2 ativos)", "QR Code de Balcão"],
      max_photos: 20,
      max_products: 50,
      has_ai: false,
      has_menu: true,
      has_booking: true,
      is_featured: true,
      sort_order: 2
    },
    {
      id: "elite",
      name: "Elite Max",
      slug: "elite",
      tier: "MAX",
      description: "Autoridade máxima e IA exclusiva",
      monthly_price: 149.90,
      annual_price: 119.90,
      features: ["Fotos e Vídeos Ilimitados", "Catálogo e Produtos Ilimitados", "IA Recrutadora para Vagas", "IA Creator de Anúncios", "Selo Diamante", "Raio Ilimitado", "Suporte Prioritário VIP"],
      max_photos: 999,
      max_products: 999,
      has_ai: true,
      has_menu: true,
      has_booking: true,
      is_featured: false,
      sort_order: 3
    }
  ];

  return (
    <div className="min-h-screen bg-white pb-24">
      <SEO 
        title="Planos e Preços para Empresas"
        description="Destaque seu comércio local com cardápio digital, agendamento online e autoridade máxima na sua cidade."
      />
      <Header />

      {/* High-Fidelity Hero */}
      <section className="bg-slate-950 pt-32 pb-32 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 backdrop-blur-md border border-primary/20 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8"
          >
            <Crown className="h-3.5 w-3.5" />
            Parceria de Sucesso
          </motion.div>
          <h1 className="text-5xl md:text-7xl font-[900] text-white tracking-tighter mb-6 leading-[0.85]">
            Performance <br />
            <span className="text-primary italic">Inteligente</span> para <br />
            seu Negócio.
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto mb-10">
            Escolha o nível de autoridade ideal para conectar sua empresa ao público certo.
          </p>

          {/* Toggle Mensal / Anual */}
          <div className="inline-flex items-center gap-4 bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-2">
            <button
              onClick={() => setIsAnnual(false)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                !isAnnual ? "bg-white text-slate-900 shadow-lg" : "text-slate-400 hover:text-slate-200"
              )}
            >
              Mensal
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={cn(
                "px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2",
                isAnnual ? "bg-primary text-white shadow-lg shadow-primary/30" : "text-slate-400 hover:text-slate-200"
              )}
            >
              <Calendar className="h-3.5 w-3.5" />
              Anual
              {!isAnnual && (
                <span className="bg-emerald-500 text-white text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                  -20%
                </span>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 bg-white rounded-3xl shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {plans.map((plan, index) => {
              const price = isAnnual ? plan.annual_price : plan.monthly_price;
              const isFree = plan.monthly_price === 0;
              const isFeatured = plan.is_featured;

              return (
                <motion.div
                  key={plan.id || plan.slug}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={cn(
                    "rounded-[2.5rem] p-8 md:p-10 flex flex-col justify-between transition-all duration-500 relative overflow-hidden",
                    isFeatured 
                      ? "bg-slate-950 text-white border-2 border-primary shadow-[0_40px_80px_-15px_rgba(255,107,44,0.3)] md:-translate-y-4"
                      : "bg-white text-slate-900 border-2 border-slate-100 shadow-xl hover:border-slate-300"
                  )}
                >
                  {isFeatured && (
                    <div className="absolute top-6 right-6">
                      <span className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg animate-pulse">
                        Mais Popular
                      </span>
                    </div>
                  )}

                  <div>
                    <div className="mb-6">
                      <div className={cn(
                        "h-14 w-14 rounded-2xl flex items-center justify-center mb-6",
                        isFeatured ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                      )}>
                        {isFree ? <Rocket className="h-6 w-6" /> : isFeatured ? <Zap className="h-6 w-6" /> : <Crown className="h-6 w-6" />}
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">{plan.name}</h3>
                      <p className={cn("text-xs font-medium mt-1", isFeatured ? "text-slate-400" : "text-slate-500")}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="mb-8">
                      <div className="flex items-baseline gap-1">
                        <span className="text-4xl md:text-5xl font-[900] tracking-tighter">
                          R$ {Number(price).toFixed(2)}
                        </span>
                        <span className={cn("text-xs font-bold", isFeatured ? "text-slate-400" : "text-slate-500")}>
                          /mês
                        </span>
                      </div>
                      {isAnnual && !isFree && (
                        <p className="text-[11px] font-bold text-emerald-500 mt-1">
                          Cobrado anualmente (R$ {(price * 12).toFixed(2)}/ano)
                        </p>
                      )}
                    </div>

                    <div className="space-y-3 mb-10">
                      <p className={cn("text-[10px] font-black uppercase tracking-widest", isFeatured ? "text-slate-400" : "text-slate-400")}>
                        Recursos inclusos:
                      </p>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-start gap-3">
                          <div className={cn(
                            "h-5 w-5 rounded-lg flex items-center justify-center shrink-0 mt-0.5",
                            isFeatured ? "bg-white/10" : "bg-emerald-50"
                          )}>
                            <Check className={cn("h-3 w-3", isFeatured ? "text-primary" : "text-emerald-600")} />
                          </div>
                          <span className={cn("text-xs font-semibold leading-tight", isFeatured ? "text-slate-200" : "text-slate-700")}>
                            {feature}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    {isFree ? (
                      <Link to="/auth?mode=register">
                        <Button 
                          variant="outline" 
                          className="w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest border-2 hover:bg-slate-50"
                        >
                          Criar Conta Grátis
                        </Button>
                      </Link>
                    ) : (
                      <Link to={`/checkout?plan=${plan.slug}&annual=${isAnnual}&amount=${price}`}>
                        <Button 
                          className={cn(
                            "w-full h-14 rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl transition-all active:scale-95 text-white",
                            isFeatured ? "bg-primary hover:bg-primary/90" : "bg-slate-900 hover:bg-slate-800"
                          )}
                        >
                          {isAnnual ? `Assinar ${plan.name} Anual` : `Assinar ${plan.name}`}
                        </Button>
                      </Link>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      <BottomTabBar />
    </div>
  );
};

export default Plans;
