import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ROIMagico } from "@/components/dashboard/ROIMagico";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight, Loader2, TrendingUp, Star, Award, Info, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useBusiness } from "@/hooks/use-business";
import { useProducts } from "@/hooks/use-products";
import { Progress } from "@/components/ui/progress";

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
    <DashboardLayout title="Painel">
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              ROI Mágico
            </h2>
            <ROIMagico
              profileViews={business.profile_views}
              whatsappClicks={business.whatsapp_clicks}
              averageTicket={(business as any).average_ticket ?? 0}
            />
          </div>

          <div>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Performance PRO-RANK
            </h2>
            <Card className="bg-white border border-slate-200 overflow-hidden relative group h-full shadow-sm hover:border-primary/20 transition-all">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Award className="h-24 w-24 text-primary" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <Badge className="bg-primary/10 text-primary border-primary/20 font-bold text-[9px] uppercase tracking-wider">Ranking Ativo</Badge>
                  <TrendingUp className="h-4 w-4 text-emerald-500 animate-pulse" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-end gap-2">
                  <span className="text-5xl font-black text-slate-800 leading-none tracking-tighter">
                    {Math.round((business as any).performance_score || 0)}
                  </span>
                  <span className="text-slate-500 font-bold text-[10px] uppercase mb-1">PONTOS</span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
                    <span>Nível de Elite</span>
                    <span className="text-primary font-bold">
                      {(business as any).performance_score >= 85 ? "Ouro 🥇" : 
                       (business as any).performance_score >= 65 ? "Prata 🥈" : 
                       (business as any).performance_score >= 40 ? "Bronze 🥉" : "Iniciante 🚀"}
                    </span>
                  </div>
                  <Progress value={(business as any).performance_score || 5} className="h-2 bg-slate-100" />
                </div>

                <div className="pt-2 flex flex-col gap-2 relative z-10">
                   <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                      <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                      <span>{((business as any).rating_average || 0).toFixed(1)} Avaliação Média</span>
                   </div>
                   <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
                      <p className="text-[10px] text-slate-500 leading-tight">
                         💡 <span className="font-bold text-slate-700">DICA PRO:</span> {(business as any).performance_score < 70 ? "Peça mais avaliações para subir no ranking." : "Mantenha seus produtos atualizados para não cair."}
                      </p>
                   </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Link to="/dashboard/produtos">
                <Button variant="outline" className="w-full justify-between h-11 rounded-xl">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Adicionar Produto
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/dashboard/negocio">
                <Button variant="outline" className="w-full justify-between h-11 rounded-xl mt-2">
                  <span className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Editar Vitrine
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base">Produtos Recentes</CardTitle>
              <Link to="/dashboard/produtos" className="text-xs text-primary hover:underline">
                Ver todos
              </Link>
            </CardHeader>
            <CardContent>
              {prodsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                </div>
              ) : recentProducts.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">Nenhum produto cadastrado</p>
              ) : (
                <div className="space-y-3">
                  {recentProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{product.name}</p>
                        <p className="text-xs text-primary font-semibold">
                          R$ {(product.price ?? 0).toFixed(2)}
                        </p>
                      </div>
                      <Badge variant={product.active ? "default" : "secondary"} className="text-[10px]">
                        {product.active ? "Ativo" : "Inativo"}
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
