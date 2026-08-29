import React from "react";
import { 
  Search as SearchIcon, 
  MapPin, 
  Sparkles, 
  ArrowRight, 
  Utensils, 
  Scissors, 
  Coffee, 
  ShoppingBag,
  ShieldCheck,
  Ticket,
  Briefcase,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { usePlatform } from "@/contexts/PlatformContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface HeroSectionProps {
  search: string;
  setSearch: (val: string) => void;
  selectedCity: string;
  setSelectedCity: (val: string) => void;
  onSearch: (e: React.FormEvent) => void;
  platformName?: string;
  platformDescription?: string;
}

export function HeroSection({
  search,
  setSearch,
  selectedCity,
  setSelectedCity,
  onSearch,
  platformName = "Meu Guia Comercial",
  platformDescription = "Conecte-se aos melhores comércios, restaurantes e serviços da sua região."
}: HeroSectionProps) {
  const navigate = useNavigate();
  const { availableCities } = usePlatform();

  const quickPills = [
    { label: "Restaurantes", icon: Utensils, query: "restaurante" },
    { label: "Salões & Barbearias", icon: Scissors, query: "barbearia" },
    { label: "Cafés & Padarias", icon: Coffee, query: "cafe" },
    { label: "Lojas & Roupas", icon: ShoppingBag, query: "roupas" },
  ];

  return (
    <section className="bg-slate-950 pt-32 pb-20 md:pt-40 md:pb-28 relative overflow-hidden font-sans">
      {/* Background Cinematic Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-primary/20 blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-5xl mx-auto px-6 relative z-10 text-center">
        {/* Badge Flutuante */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-white text-[10px] font-black uppercase tracking-[0.2em] mb-6 shadow-xl shadow-black/30"
        >
          <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
          Guia Comercial Oficial {selectedCity ? `• ${selectedCity}` : ""}
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="text-4xl sm:text-6xl md:text-7xl font-[900] text-white tracking-tight leading-[1.05] mb-6"
        >
          Descubra o melhor <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-orange-400 to-amber-300">
            do comércio da sua cidade.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-slate-400 text-sm md:text-lg font-medium max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          {platformDescription}
        </motion.p>

        {/* Barra de Busca de Alta Conversão */}
        <motion.form
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.22 }}
          onSubmit={onSearch}
          className="bg-white p-2.5 sm:p-3 rounded-2xl sm:rounded-[2rem] shadow-2xl shadow-black/50 border border-slate-200/80 flex flex-col sm:flex-row items-center gap-2 max-w-3xl mx-auto"
        >
          {/* Input de Busca */}
          <div className="flex items-center gap-3 flex-1 w-full px-3 h-12">
            <SearchIcon className="h-5 w-5 text-slate-400 shrink-0" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="O que você procura? (ex: Pizza, Dentista, Academia...)"
              className="w-full bg-transparent border-none outline-none text-slate-800 font-bold text-sm placeholder:text-slate-400"
            />
          </div>

          {/* Seletor de Cidades em Dropdown */}
          <div className="hidden sm:flex items-center px-2 h-10 border-l border-slate-200">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-100 text-xs font-bold text-slate-700 transition-colors"
                >
                  <MapPin className="h-4 w-4 text-primary shrink-0" />
                  <span className="max-w-[130px] truncate">{selectedCity || "Todas Cidades"}</span>
                  <ChevronDown className="h-3 w-3 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl p-1.5 bg-white shadow-xl border-slate-100">
                <DropdownMenuItem
                  onClick={() => setSelectedCity("Todas as Cidades")}
                  className={`rounded-xl text-xs font-bold py-2 cursor-pointer ${
                    selectedCity === "Todas as Cidades" ? "bg-primary/10 text-primary" : ""
                  }`}
                >
                  Todas as Cidades
                </DropdownMenuItem>
                {availableCities.map((city) => (
                  <DropdownMenuItem
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`rounded-xl text-xs font-bold py-2 cursor-pointer ${
                      selectedCity === city ? "bg-primary/10 text-primary" : ""
                    }`}
                  >
                    <MapPin className="h-3.5 w-3.5 mr-2 text-primary" />
                    {city}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Botão de Busca */}
          <Button
            type="submit"
            className="w-full sm:w-auto h-12 px-8 rounded-xl sm:rounded-2xl font-black text-xs uppercase tracking-wider bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/30 shrink-0"
          >
            Buscar <ArrowRight className="h-4 w-4 ml-1.5" />
          </Button>
        </motion.form>

        {/* Micro-Barra de Prova Social */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 mt-6 text-[11px] font-bold text-slate-400"
        >
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-emerald-400" /> Lojas & Serviços Verificados
          </span>
          <span className="flex items-center gap-1.5">
            <Ticket className="h-4 w-4 text-amber-400" /> Cupons de Desconto no Balcão
          </span>
          <span className="flex items-center gap-1.5">
            <Briefcase className="h-4 w-4 text-blue-400" /> Oportunidades de Emprego Locais
          </span>
        </motion.div>

        {/* Pílulas de Atalho */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
          className="flex flex-wrap items-center justify-center gap-2 mt-6"
        >
          {quickPills.map((pill, i) => (
            <button
              key={i}
              type="button"
              onClick={() => navigate(`/buscar?q=${encodeURIComponent(pill.query)}`)}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white text-xs font-bold transition-all shadow-sm"
            >
              <pill.icon className="h-3.5 w-3.5 text-primary" />
              {pill.label}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
