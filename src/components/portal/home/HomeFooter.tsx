import React from "react";
import { Link } from "react-router-dom";
import { Store, ArrowRight, ShieldCheck, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePlatform } from "@/contexts/PlatformContext";

export function HomeFooter() {
  const { config } = usePlatform();

  const platformName = config.platform_name || "Meu Guia Comercial";
  const platformCity = config.platform_city || "Sua Cidade";

  return (
    <div>
      {/* Merchant CTA Section */}
      <section className="bg-slate-900 text-white py-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10 space-y-6">
          <div className="h-16 w-16 rounded-3xl bg-primary/20 text-primary flex items-center justify-center mx-auto border border-primary/30 shadow-2xl">
            <Store className="h-8 w-8" />
          </div>

          <h2 className="text-3xl sm:text-5xl font-[900] tracking-tight">
            Você é dono de um negócio em {platformCity}?
          </h2>

          <p className="text-slate-400 text-sm sm:text-base max-w-xl mx-auto font-medium">
            Coloque sua empresa no topo das buscas, receba pedidos no WhatsApp e atraia novos clientes todos os dias.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/planos">
              <Button className="h-14 px-8 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-wider gap-2 shadow-xl shadow-primary/30">
                Ver Planos e Anunciar <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/auth?mode=register">
              <Button variant="outline" className="h-14 px-8 rounded-2xl bg-white/10 hover:bg-white text-white hover:text-slate-900 border-white/20 font-bold text-xs">
                Criar Cadastro Grátis
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Footer */}
      <footer className="bg-slate-950 text-slate-400 py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div>
            <span className="text-lg font-black text-white tracking-tight flex items-center gap-1.5 mb-3">
              <span className="text-primary">📍</span> {platformName}
            </span>
            <p className="text-xs text-slate-500 leading-relaxed">
              O portal oficial do comércio e serviços de {platformCity}.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-3">Para Moradores</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/buscar" className="hover:text-white transition-colors">Buscar Empresas</Link></li>
              <li><Link to="/categorias" className="hover:text-white transition-colors">Categorias</Link></li>
              <li><Link to="/ofertas" className="hover:text-white transition-colors">Cupons & Ofertas</Link></li>
              <li><Link to="/vagas" className="hover:text-white transition-colors">Vagas de Emprego</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-3">Para Lojistas</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/planos" className="hover:text-white transition-colors">Planos de Assinatura</Link></li>
              <li><Link to="/auth?mode=register" className="hover:text-white transition-colors">Cadastrar Empresa</Link></li>
              <li><Link to="/auth" className="hover:text-white transition-colors">Painel do Lojista</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-200 mb-3">Institucional</h4>
            <ul className="space-y-2 text-xs font-medium">
              <li><Link to="/blog" className="hover:text-white transition-colors">Notícias & Blog</Link></li>
              <li><Link to="/comunidade" className="hover:text-white transition-colors">Comunidade Local</Link></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-900 text-center text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} {platformName}. Todos os direitos reservados.</p>
          <p className="flex items-center justify-center gap-1">
            Feito para fortalecer o comércio local <Heart className="h-3.5 w-3.5 text-rose-500 fill-rose-500" />
          </p>
        </div>
      </footer>
    </div>
  );
}
