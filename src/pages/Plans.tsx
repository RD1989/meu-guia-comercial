import React from "react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { motion } from "framer-motion";
import { Check, X, Zap, Crown, Rocket, Star, ShieldCheck, ArrowRight, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

const PLAN_FEATURES = [
  { name: "Perfil de Negócio", free: "Básico", basic: "Profissional", pro: "Elite" },
  { name: "Fotos na Galeria", free: "1 foto", basic: "Máximo 20", pro: "Ilimitado" },
  { name: "Vídeos na Galeria", free: false, basic: "1 Vídeo", pro: "Ilimitado" },
  { name: "Selo de Verificação", free: false, basic: "Bronze", pro: "Diamante" },
  { name: "Prioridade na Busca", free: "Padrão", basic: "Alta", pro: "Máxima" },
  { name: "Geolocalização Customizada", free: false, basic: "20km", pro: "Ilimitado" },
  { name: "Comunidade Elite", free: "Leitura", basic: "Interação", pro: "Moderação & Full" },
  { name: "IA Recrutadora (Vagas)", free: false, basic: "Triagem Básica", pro: "Análise Total" },
  { name: "Inteligência Artificial (IA)", free: false, basic: "Assistente", pro: "Elite Creator" },
  { name: "Cardápio / Reservas", free: false, basic: true, pro: true },
  { name: "Estatísticas (Analytics)", free: false, basic: "Básico", pro: "Avançado" },
];

const Plans = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
           {/* High-Fidelity Hero */}
      <section className="bg-slate-950 pt-32 pb-32 relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20">
           <img 
             src="/world_map_abstract_bg_1774527556200.png" 
             className="w-full h-full object-cover" 
             alt="Background" 
           />
           <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-transparent to-white" />
        </div>

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
          <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
            Escolha o nível de autoridade ideal para conectar sua empresa ao público certo.
          </p>
        </div>
      </section>

      {/* Pricing Cards - Modern High-Fidelity Grid */}
      <section className="max-w-7xl mx-auto px-6 py-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
          
          {/* Plan: Gratuito */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl flex flex-col h-full group hover:border-primary/20 transition-all duration-700"
          >
            <div className="mb-6">
              <div className="h-14 w-14 rounded-[1.2rem] bg-slate-50 flex items-center justify-center text-slate-400 mb-6 overflow-hidden relative shadow-inner">
                <Rocket className="h-7 w-7 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-1">Gratuito</h3>
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Presença Básica</p>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-950 tracking-tighter">R$ 0</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-3 mb-10 flex-1">
               {PLAN_FEATURES.slice(0, 5).map((f, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded-lg bg-orange-100 flex items-center justify-center">
                     <Check className="h-3 w-3 text-primary" />
                   </div>
                   <span className="text-xs font-bold text-slate-600">{f.name}</span>
                 </div>
               ))}
            </div>

            <Link to="/auth?mode=register">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-black uppercase text-[10px] tracking-widest text-slate-950 hover:bg-slate-100 transition-all shadow-lg shadow-slate-200/20">
                Começar Agora
              </Button>
            </Link>
          </motion.div>

          {/* Plan: Básico (The Star) */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-950 rounded-[3rem] p-10 border-2 border-white/5 shadow-[0_40px_80px_-15px_rgba(255,107,44,0.4)] flex flex-col h-full relative overflow-hidden group"
          >
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] -mr-32 -mt-32 rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />

            <div className="absolute top-8 right-8">
               <div className="bg-primary text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-full shadow-2xl shadow-primary/40 animate-pulse">Recomendado</div>
            </div>

            <div className="mb-6 relative z-10">
              <div className="h-16 w-16 rounded-[1.4rem] bg-primary flex items-center justify-center text-white mb-6 shadow-2xl shadow-primary/30 ring-4 ring-primary/20">
                <Zap className="h-8 w-8 fill-white" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight mb-1">Profissional</h3>
              <p className="text-[10px] text-primary font-black uppercase tracking-widest">Elite Local</p>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1 relative z-10">
              <span className="text-5xl font-black text-white tracking-tighter">R$ 49</span>
              <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-3 mb-10 flex-1 relative z-10">
               {PLAN_FEATURES.map((f, i) => (
                 <div key={i} className={cn("flex items-center gap-3", !f.basic && "opacity-20")}>
                   <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center", f.basic ? "bg-white/10" : "bg-white/5")}>
                     {f.basic ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-white/40" />}
                   </div>
                   <span className="text-[11px] font-bold text-white/90">
                     {typeof f.basic === 'string' ? `${f.name}: ${f.basic}` : f.name}
                   </span>
                 </div>
               ))}
            </div>

            <Link to="/checkout?plan=prof&amount=49&name=Plano%20Profissional" className="relative z-10">
              <Button className="w-full h-16 py-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/40 transition-all active:scale-95">
                Ativar Plano Pro
              </Button>
            </Link>
          </motion.div>

          {/* Plan: Avançado (Enterprise) */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-8 border-2 border-slate-100 shadow-xl flex flex-col h-full group hover:border-emerald-500/20 transition-all duration-700"
          >
            <div className="mb-6">
              <div className="h-14 w-14 rounded-[1.2rem] bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6 shadow-inner overflow-hidden relative">
                <Crown className="h-7 w-7 transition-transform group-hover:scale-110" />
              </div>
              <h3 className="text-2xl font-black text-slate-950 tracking-tight mb-1">Elite Max</h3>
              <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Autoridade Regional</p>
            </div>
            
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-950 tracking-tighter">R$ 149</span>
              <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-3 mb-10 flex-1">
               {PLAN_FEATURES.map((f, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded-lg bg-emerald-100 flex items-center justify-center">
                     <Check className="h-3 w-3 text-emerald-500" />
                   </div>
                   <span className="text-xs font-bold text-slate-600">
                     {typeof f.pro === 'string' ? `${f.name}: ${f.pro}` : f.name}
                   </span>
                 </div>
               ))}
            </div>

            <Link to="/checkout?plan=elite&amount=149&name=Plano%20Elite%20Max">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-emerald-500/20 font-black uppercase text-[10px] tracking-widest text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all shadow-lg shadow-emerald-500/10">
                Domination Regional
              </Button>
            </Link>
          </motion.div>

        </div>
      </section>

      {/* Trust & Comparison */}
      <section className="py-24 max-w-7xl mx-auto px-6">
         <div className="bg-slate-50 rounded-[3rem] p-8 md:p-16 border border-slate-100 text-center">
             <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8">
               <ShieldCheck className="h-3.5 w-3.5" />
               Garantia de Autoridade
             </div>
             <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tighter mb-6">Por que ser um parceiro Pro?</h2>
             <p className="text-slate-500 text-lg font-medium max-w-2xl mx-auto mb-16">Nossa plataforma foi desenhada para valorizar quem entrega qualidade. Empresas nos planos Básico e Avançado possuem selos de confiança e maior ranking na rede.</p>
             
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  { title: "Visibilidade", desc: "Apareça nas primeiras páginas.", icon: TrendingUp },
                  { title: "Gestão", desc: "Controle total via dashboard.", icon: Rocket },
                  { title: "Conversão", desc: "Venda mais com o cardápio digital.", icon: Zap },
                  { title: "Fidelidade", desc: "Crie laços reais com avaliações.", icon: Star }
                ].map((item, i) => (
                  <div key={i} className="flex flex-col items-center gap-4">
                     <div className="h-12 w-12 rounded-2xl bg-white flex items-center justify-center shadow-lg shadow-slate-200/50 text-slate-900">
                        <item.icon className="h-6 w-6" />
                     </div>
                     <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight text-sm mb-1">{item.title}</h4>
                        <p className="text-slate-400 text-xs font-medium">{item.desc}</p>
                     </div>
                  </div>
                ))}
             </div>
         </div>
      </section>

      {/* FAQ / Final CTA */}
      <section className="py-24 text-center">
         <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-8 leading-[0.9]">Dúvidas sobre os planos?</h3>
         <p className="text-slate-500 mb-10 font-medium">Nossa equipe de especialistas está pronta para ajudar você a escolher.</p>
         <Button variant="outline" className="h-14 px-10 rounded-2xl font-black border-2 gap-2 text-slate-800 hover:bg-slate-50">
           Falar com Especialista <ArrowRight className="h-5 w-5" />
         </Button>
      </section>

      <BottomTabBar />
    </div>
  );
};

export default Plans;
