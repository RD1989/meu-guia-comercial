import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ROIMagico } from "@/components/dashboard/ROIMagico";
import { QRCodeVitrine } from "@/components/dashboard/QRCodeVitrine";
import { ProfileCompletion } from "@/components/dashboard/ProfileCompletion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader2, TrendingUp, Star, Award, Info, Zap, Calendar, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/hooks/use-business";
import { useProducts } from "@/hooks/use-products";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";

const DashboardHome = () => {
  const { business, isLoading: bizLoading } = useBusiness();
  const { products, isLoading: prodsLoading } = useProducts();

  if (bizLoading) {
    return (
      <DashboardLayout title="Painel">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout title="Painel">
        <Card className="p-12 text-center">
          <p className="text-sm text-muted-foreground">
            Nenhum negócio vinculado à sua conta. Peça ao administrador para cadastrá-lo.
          </p>
        </Card>
      </DashboardLayout>
    );
  }

  const recentProducts = products.slice(0, 3);

  return (
    <DashboardLayout title="Painel de Controle">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tighter mb-1">Olá, {business.name.split(' ')[0]}! 👋</h1>
            <p className="text-sm text-slate-500 font-medium">Sua empresa está com ótima visibilidade hoje.</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-100 rounded-2xl text-emerald-600 text-[10px] font-black uppercase tracking-widest">
            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Sistema Online
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-[0.2em]">ROI Estratégico</h2>
            </div>
            <ROIMagico
              profileViews={business.profile_views}
              whatsappClicks={business.whatsapp_clicks}
              averageTicket={(business as any).average_ticket ?? 0}
            />
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="h-6 w-1.5 bg-primary rounded-full" />
              <h2 className="text-xs font-black text-slate-950 uppercase tracking-[0.2em]">Performance Elite</h2>
            </div>
            <Card className="bg-slate-950 border-none rounded-[2.5rem] overflow-hidden relative group h-full shadow-[0_30px_60px_-15px_rgba(0,0,0,0.3)] hover:shadow-primary/20 transition-all duration-700">
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-all duration-700 group-hover:scale-110">
                <Award className="h-32 w-32 text-primary" />
              </div>
              
              {/* Glow Background */}
              <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-primary/20 blur-[100px] rounded-full opacity-30 group-hover:opacity-50 transition-opacity" />

              <CardHeader className="pb-2 relative z-10">
                <div className="flex justify-between items-center">
                  <Badge className="bg-primary text-white border-0 font-black text-[9px] uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg shadow-primary/30">PRO-RANK</Badge>
                  <TrendingUp className="h-5 w-5 text-emerald-400 animate-bounce" />
                </div>
              </CardHeader>
              <CardContent className="space-y-6 relative z-10 pt-4">
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-[900] text-white leading-[0.85] tracking-tighter">
                    {Math.round((business as any).performance_score || 0)}
                  </span>
                  <span className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-2">PTS</span>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span className="flex items-center gap-2">
                       <Zap className="h-3 w-3 text-primary fill-primary" /> Nível atual
                    </span>
                    <span className="text-white">
                      {(business as any).performance_score >= 85 ? "Ouro 🥇" : 
                       (business as any).performance_score >= 65 ? "Prata 🥈" : 
                       (business as any).performance_score >= 40 ? "Bronze 🥉" : "Bronze 🥉"}
                    </span>
                  </div>
                  <div className="h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 p-0.5">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(business as any).performance_score || 5}%` }}
                      className="h-full bg-gradient-to-r from-primary to-orange-400 rounded-full shadow-[0_0_15px_rgba(255,107,44,0.5)]" 
                    />
                  </div>
                </div>

                <div className="pt-2 flex flex-col gap-3">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span>{(Number((business as any).rating_average) || 0).toFixed(1)} / 5.0 Estrelas</span>
                   </div>
                   <div className="p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 mt-2">
                      <p className="text-[10px] text-slate-400 leading-relaxed">
                         💡 <span className="font-black text-primary">TIP:</span> {(business as any).performance_score < 70 ? "Adicione mais fotos e produtos para subir para o nível Prata hoje!" : "Sua performance está excelente! Continue postando novidades."}
                      </p>
                   </div>
                </div>
              </CardContent>
            </Card>
        </div>
      </div>

        {/* Completude do Perfil + QR Code */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ProfileCompletion business={business} />
          <QRCodeVitrine slug={business.slug} businessName={business.name} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="pb-4 p-8">
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-8 pt-0">
              <Link to="/dashboard/produtos">
                <Button className="w-full justify-between h-14 rounded-2xl glass-morphism border-primary/10 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all group px-6">
                  <span className="flex items-center gap-3 font-bold text-sm">
                    <Plus className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    Novo Produto
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/dashboard/negocio">
                <Button className="w-full justify-between h-14 rounded-2xl glass-morphism border-primary/10 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all group px-6 mt-3">
                  <span className="flex items-center gap-3 font-bold text-sm">
                    <Zap className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    Gerenciar Vitrine
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/dashboard/servicos">
                <Button className="w-full justify-between h-14 rounded-2xl glass-morphism border-primary/10 text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition-all group px-6 mt-3">
                  <span className="flex items-center gap-3 font-bold text-sm">
                    <Calendar className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    Horários & Agendas
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Button>
              </Link>
              <Link to="/comunidade">
                <Button className="w-full justify-between h-14 rounded-2xl glass-morphism border-primary/20 text-slate-900 hover:bg-primary hover:text-white hover:border-primary transition-all group px-6 mt-3">
                  <span className="flex items-center gap-3 font-black text-sm">
                    <Sparkles className="h-5 w-5 text-primary group-hover:text-white transition-colors" />
                    Postar na Comunidade
                  </span>
                  <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white overflow-hidden">
            <CardHeader className="pb-4 p-8 flex flex-row items-center justify-between">
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight">Produtos Recentes</CardTitle>
              <Link to="/dashboard/produtos" className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-slate-900 transition-colors bg-primary/5 px-4 py-2 rounded-full">
                Ver todos
              </Link>
            </CardHeader>
            <CardContent className="p-8 pt-0">
              {prodsLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-primary opacity-20" />
                </div>
              ) : recentProducts.length === 0 ? (
                <div className="p-12 text-center border-2 border-dashed border-slate-50 rounded-3xl">
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Nenhum produto cadastrado</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl transition-all hover:bg-white hover:border-primary/20 group">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-xl bg-white flex items-center justify-center font-black text-slate-400 border border-slate-100 group-hover:border-primary/20 transition-all text-xs">
                          {product.name[0]}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-900">{product.name}</p>
                          <p className="text-[10px] text-primary font-black uppercase tracking-wider">
                            R$ {(product.price ?? 0).toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </div>
                      <Badge className={`${product.active ? "bg-emerald-500" : "bg-slate-300"} text-white border-none text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full`}>
                        {product.active ? "Ativo" : "Off"}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardHome;
