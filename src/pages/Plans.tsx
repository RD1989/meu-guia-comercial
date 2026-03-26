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
  { name: "Fotos na Galeria", free: "1 foto", basic: "Até 10 fotos", pro: "Ilimitado" },
  { name: "Botão WhatsApp Direto", free: true, basic: true, pro: true },
  { name: "Horário de Funcionamento", free: true, basic: true, pro: true },
  { name: "Cardápio Digital / Produtos", free: false, basic: true, pro: true },
  { name: "Selo de Verificação", free: false, basic: "Bronze", pro: "Diamante" },
  { name: "Prioridade na Busca", free: "Padrão", basic: "Alta", pro: "Máxima" },
  { name: "Sistema de Agendamento", free: false, basic: false, pro: true },
  { name: "Estatísticas (Analytics)", free: false, basic: "Simplificado", pro: "Avançado" },
  { name: "Destaque na Home/Blog", free: false, basic: false, pro: true },
  { name: "Inteligência Artificial (IA)", free: false, basic: false, pro: "Full Access" },
];

const Plans = () => {
  return (
    <div className="min-h-screen bg-white pb-24">
      <Header />

      {/* Hero */}
      <section className="bg-slate-950 pt-32 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-primary/5 blur-[120px] rounded-full translate-y-[-50%] translate-x-[20%]"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6"
          >
            <Crown className="h-3.5 w-3.5 text-amber-400" />
            Parceria de Sucesso
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-[900] text-white tracking-tighter mb-4 leading-[0.9]">
            Performance <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-emerald-400">Inteligente</span> para o seu Negócio
          </h1>
          <p className="text-slate-400 text-lg font-medium max-w-2xl mx-auto">
            Escolha o nível de autoridade ideal para conectar sua empresa ao público certo.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="max-w-7xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Plan: Gratuito */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full group hover:border-slate-300 transition-all duration-500"
          >
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 mb-6 group-hover:bg-slate-100 transition-all">
                <Rocket className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Gratuito</h3>
              <p className="text-sm text-slate-500 font-medium">Ideal para começar.</p>
            </div>
            
            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ 0</span>
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
               {PLAN_FEATURES.slice(0, 4).map((f, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                     <Check className="h-3 w-3 text-emerald-500" />
                   </div>
                   <span className="text-[13px] font-bold text-slate-600">{f.name}</span>
                 </div>
               ))}
            </div>

            <Link to="/auth?mode=register">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-slate-100 font-black tracking-tight text-slate-900 hover:bg-slate-50">
                Começar Grátis
              </Button>
            </Link>
          </motion.div>

          {/* Plan: Básico */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-900 rounded-[3rem] p-12 border border-slate-800 shadow-2xl shadow-primary/20 flex flex-col h-full relative"
          >
            <div className="absolute top-0 right-10 -translate-y-1/2">
               <div className="bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl">Mais Popular</div>
            </div>

            <div className="mb-8">
              <div className="h-16 w-16 rounded-[1.5rem] bg-primary flex items-center justify-center text-white mb-6 shadow-lg shadow-primary/20">
                <Zap className="h-8 w-8" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tight">Básico</h3>
              <p className="text-sm text-slate-400 font-medium">Para negócios em expansão.</p>
            </div>
            
            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-5xl font-black text-white tracking-tighter">R$ 49</span>
              <span className="text-slate-500 text-xs font-black uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-5 mb-10 flex-1">
               {PLAN_FEATURES.map((f, i) => (
                 <div key={i} className={cn("flex items-center gap-3", !f.basic && "opacity-40")}>
                   <div className={cn("h-6 w-6 rounded-full flex items-center justify-center", f.basic ? "bg-primary/20" : "bg-slate-800")}>
                     {f.basic ? <Check className="h-3.5 w-3.5 text-primary" /> : <X className="h-3.5 w-3.5 text-slate-600" />}
                   </div>
                   <span className="text-[14px] font-bold text-slate-200">
                     {typeof f.basic === 'string' ? `${f.name}: ${f.basic}` : f.name}
                   </span>
                 </div>
               ))}
            </div>

            <Link to="/auth?mode=register">
              <Button className="w-full h-16 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black text-lg tracking-tight shadow-xl shadow-primary/20 transition-all active:scale-95">
                Quero este Plano
              </Button>
            </Link>
          </motion.div>

          {/* Plan: Avançado */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl shadow-slate-200/40 flex flex-col h-full group hover:border-primary/20 transition-all duration-500"
          >
            <div className="mb-8">
              <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-500 mb-6 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <Star className="h-7 w-7" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">Avançado</h3>
              <p className="text-sm text-slate-500 font-medium">Domínio total do mercado.</p>
            </div>
            
            <div className="mb-10 flex items-baseline gap-1">
              <span className="text-4xl font-black text-slate-900 tracking-tighter">R$ 99</span>
              <span className="text-slate-400 text-xs font-black uppercase tracking-widest">/mês</span>
            </div>

            <div className="space-y-4 mb-10 flex-1">
               {PLAN_FEATURES.map((f, i) => (
                 <div key={i} className="flex items-center gap-3">
                   <div className="h-5 w-5 rounded-full bg-emerald-50 flex items-center justify-center">
                     <Check className="h-3 w-3 text-emerald-500" />
                   </div>
                   <span className="text-[13px] font-bold text-slate-600">
                     {typeof f.pro === 'string' ? f.pro + ' ' + f.name : f.name}
                   </span>
                 </div>
               ))}
            </div>

            <Link to="/auth?mode=register">
              <Button variant="outline" className="w-full h-14 rounded-2xl border-2 border-primary/20 font-black tracking-tight text-primary hover:bg-primary hover:text-white transition-all">
                Potencial Máximo
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
