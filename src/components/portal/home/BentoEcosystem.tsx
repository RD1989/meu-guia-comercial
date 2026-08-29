import React from "react";
import { Users, TicketPercent, CalendarCheck, Briefcase, ArrowUpRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function BentoEcosystem() {
  return (
    <section className="py-20 px-6 max-w-7xl mx-auto border-t border-slate-100">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-wider mb-2">
          <Sparkles className="h-4 w-4" /> Ecossistema Completo
        </div>
        <h2 className="text-3xl sm:text-4xl font-[900] text-slate-900 tracking-tight">
          Muito mais que uma simples lista.
        </h2>
        <p className="text-slate-500 text-sm font-medium mt-2">
          Tudo o que você precisa para interagir, economizar e se conectar com o comércio local.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Comunidade */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-slate-950 text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/20 blur-[80px] rounded-full pointer-events-none" />
          
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center mb-6 text-primary border border-white/10">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Comunidade Local</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed mb-6">
              Veja fotos, avaliações e novidades publicadas em tempo real pelos comércios da sua cidade.
            </p>
          </div>

          <Link to="/comunidade" className="relative z-10">
            <Button variant="outline" className="w-full bg-white/10 hover:bg-white text-white hover:text-slate-900 border-white/20 rounded-xl text-xs font-bold gap-2">
              Acessar Feed <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Card 2: Cupons & Ofertas */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-gradient-to-br from-primary to-orange-600 text-white rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-xl"
        >
          <div className="relative z-10">
            <div className="h-12 w-12 rounded-2xl bg-white/20 flex items-center justify-center mb-6 text-white border border-white/20">
              <TicketPercent className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black tracking-tight mb-2">Cupons de Desconto</h3>
            <p className="text-white/80 text-xs font-medium leading-relaxed mb-6">
              Economize nos seus estabelecimentos preferidos resgatando cupons e promoções exclusivas.
            </p>
          </div>

          <Link to="/ofertas" className="relative z-10">
            <Button className="w-full bg-white text-primary hover:bg-slate-100 rounded-xl text-xs font-black uppercase tracking-wider gap-2">
              Ver Promoções <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>

        {/* Card 3: Vagas de Emprego */}
        <motion.div 
          whileHover={{ y: -4 }}
          className="bg-white border border-slate-200/80 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group shadow-sm hover:shadow-xl transition-all"
        >
          <div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-50 flex items-center justify-center mb-6 text-emerald-600 border border-emerald-100">
              <Briefcase className="h-6 w-6" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Vagas de Emprego</h3>
            <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6">
              Encontre oportunidades de trabalho nos comércios da sua região e candidate-se com 1 clique.
            </p>
          </div>

          <Link to="/vagas">
            <Button variant="outline" className="w-full rounded-xl text-xs font-bold gap-2 hover:bg-slate-50">
              Consultar Vagas <ArrowUpRight className="h-4 w-4" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
