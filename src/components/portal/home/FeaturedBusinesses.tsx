import React from "react";
import { Sparkles, ArrowRight, ShieldCheck, Star, MapPin, Store, MessageCircle, Clock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatWhatsAppUrl } from "@/lib/whatsapp";
import { toast } from "sonner";

interface FeaturedBusinessesProps {
  businesses: any[];
  isLoading: boolean;
}

export function FeaturedBusinesses({ businesses = [], isLoading }: FeaturedBusinessesProps) {
  const navigate = useNavigate();

  const handleWhatsAppClick = (e: React.MouseEvent, phone?: string, name?: string) => {
    e.stopPropagation();
    if (!phone) {
      toast.info("WhatsApp do estabelecimento não disponível.");
      return;
    }
    const message = `Olá! Vi seu anúncio no Guia Comercial e gostaria de mais informações.`;
    const url = formatWhatsAppUrl(phone, message);
    if (url && url !== "#") {
      window.open(url, "_blank");
    } else {
      toast.error("Número de WhatsApp inválido.");
    }
  };

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-100 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-primary text-xs font-black uppercase tracking-wider mb-1">
            <ShieldCheck className="h-4 w-4 text-emerald-500" /> Estabelecimentos Verificados
          </div>
          <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 tracking-tight">Destaques da Cidade</h2>
        </div>
        <Link 
          to="/buscar" 
          className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold hover:underline"
        >
          Explorar Todos <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-88 rounded-3xl bg-slate-100 animate-pulse" />
          ))}
        </div>
      ) : businesses.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200 p-8">
          <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-black text-slate-800 text-base">Nenhum estabelecimento cadastrado ainda</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1 mb-6">Seja o primeiro a anunciar seu comércio e apareça no topo da cidade.</p>
          <Button onClick={() => navigate("/planos")} className="rounded-2xl h-12 px-6 bg-primary text-white font-bold text-xs uppercase tracking-wider">
            Anunciar Minha Loja
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {businesses.slice(0, 6).map((biz, i) => {
            const hasPhone = !!(biz.whatsapp || biz.phone);

            return (
              <motion.div
                key={biz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                whileHover={{ y: -6 }}
                onClick={() => navigate(`/negocio/${biz.slug}`)}
                className="group bg-white rounded-[2rem] border border-slate-200/80 overflow-hidden shadow-sm hover:shadow-2xl hover:border-primary/30 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Foto de Capa */}
                  <div className="h-48 w-full bg-slate-100 relative overflow-hidden">
                    {biz.image_url ? (
                      <img 
                        src={biz.image_url} 
                        alt={biz.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 text-white font-black text-4xl">
                        {biz.name[0]}
                      </div>
                    )}

                    {/* Badge de Categoria */}
                    {biz.categories?.name && (
                      <Badge className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-slate-900 border-none text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {biz.categories.name}
                      </Badge>
                    )}

                    {/* Selo Verificado */}
                    <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg" title="Empresa Verificada">
                      <ShieldCheck className="h-4 w-4" />
                    </div>
                  </div>

                  {/* Informações da Empresa */}
                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="text-lg font-[900] text-slate-900 group-hover:text-primary transition-colors line-clamp-1">
                        {biz.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs font-black text-amber-500 shrink-0">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>5.0</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">
                      {biz.description || "Estabelecimento local com atendimento de excelência e produtos de qualidade."}
                    </p>

                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400 pt-1">
                      <MapPin className="h-3.5 w-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">{biz.address || biz.city || "Centro da Cidade"}</span>
                    </div>
                  </div>
                </div>

                {/* Rodapé do Card com Ações */}
                <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between gap-3">
                  <span className="text-xs font-bold text-slate-700 group-hover:text-primary transition-colors flex items-center gap-1">
                    Ver Vitrine <ArrowRight className="h-3.5 w-3.5 text-slate-400 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                  </span>

                  {hasPhone && (
                    <Button
                      size="sm"
                      onClick={(e) => handleWhatsAppClick(e, biz.whatsapp || biz.phone, biz.name)}
                      className="h-9 px-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-wider gap-1.5 shadow-md shadow-emerald-500/20"
                    >
                      <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </section>
  );
}
