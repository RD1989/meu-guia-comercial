import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnimatedPage } from "@/components/admin/AnimatedPage";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Store, 
  FileText, 
  TrendingUp, 
  Eye, 
  Calendar,
  Sparkles,
  Bot,
  MapPin,
  Clock,
  ChevronRight,
  Tags,
  ExternalLink,
  Ticket,
  Briefcase
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, description }: any) => (
  <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden hover:border-primary/20 transition-all rounded-2xl">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">{title}</CardTitle>
      <div className="p-2 bg-slate-50 rounded-xl">
        <Icon className="h-4 w-4 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-[900] text-slate-800">{value}</div>
      <p className="text-[11px] text-slate-400 mt-1 font-medium">
        {description}
      </p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      // Consultas defensivas
      const [businesses, users, blogRes, views, categories, coupons, jobs] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        (supabase as any).from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("profile_views"),
        supabase.from("categories").select("*", { count: "exact", head: true }),
        (supabase as any).from("coupons").select("*", { count: "exact", head: true }),
        (supabase as any).from("jobs").select("*", { count: "exact", head: true })
      ]);

      const totalViews = (views.data || []).reduce((acc, curr) => acc + (curr.profile_views || 0), 0);

      const [latestBusinesses, latestReviews, latestPosts] = await Promise.all([
        supabase.from("businesses").select("id, name, created_at, active, slug").order("created_at", { ascending: false }).limit(4),
        supabase.from("reviews")
          .select("id, rating, created_at, businesses(name), profiles(name)")
          .order("created_at", { ascending: false })
          .limit(3),
        (supabase as any).from("blog_posts").select("id, title, created_at").order("created_at", { ascending: false }).limit(2)
      ]);

      const recentActivity: any[] = [
        ...(latestBusinesses.data || []).map(b => ({
          text: `Novo estabelecimento: '${b.name}'`,
          time: new Date(b.created_at),
          icon: Store,
          type: "primary"
        })),
        ...(latestReviews.data || []).map((r: any) => ({
          text: `${r.profiles?.name || 'Cliente'} avaliou '${r.businesses?.name}' com ${r.rating} estrelas`,
          time: new Date(r.created_at),
          icon: Sparkles,
          type: "amber"
        })),
        ...(latestPosts.data || []).map((p: any) => ({
          text: `Artigo publicado no blog: '${p.title}'`,
          time: new Date(p.created_at),
          icon: FileText,
          type: "blue"
        }))
      ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 6);

      return {
        businesses: businesses.count || 0,
        users: users.count || 0,
        posts: blogRes.count || 0,
        views: totalViews,
        categories: categories.count || 0,
        coupons: coupons.count || 0,
        jobs: jobs.count || 0,
        latestBusinesses: latestBusinesses.data || [],
        recentActivity
      };
    }
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes} min atrás`;
    if (hours < 24) return `${hours}h atrás`;
    return `${days}d atrás`;
  };

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-8 p-6 lg:p-10 font-sans">
          <div>
            <h2 className="text-2xl font-[900] tracking-tight text-slate-900">Visão Geral do Superadmin</h2>
            <p className="text-xs text-slate-500 mt-1 font-medium">Métricas em tempo real de todo o ecossistema local.</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Empresas Cadastradas" 
              value={stats?.businesses || 0} 
              icon={Store} 
              description="Total de comércios no guia" 
            />
            <StatCard 
              title="Visualizações Totais" 
              value={(stats?.views || 0).toLocaleString("pt-BR")} 
              icon={Eye} 
              description="Tráfego orgânico nas vitrines" 
            />
            <StatCard 
              title="Cupons & Ofertas" 
              value={stats?.coupons || 0} 
              icon={Ticket} 
              description="Promoções ativas no portal" 
            />
            <StatCard 
              title="Usuários Registrados" 
              value={stats?.users || 0} 
              icon={Users} 
              description="Consumidores e lojistas" 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            {/* Tabela Branca - Empresas Recentes */}
            <Card className="col-span-1 border border-slate-200 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between p-4">
                <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Últimos Estabelecimentos
                </CardTitle>
                <Link to="/admin/empresas">
                  <Button variant="ghost" size="sm" className="text-primary text-xs font-bold gap-1 p-0 hover:bg-transparent">
                    Ver todas <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {stats?.latestBusinesses?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Nenhuma empresa encontrada.</div>
                  ) : (
                    stats?.latestBusinesses?.map((biz: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-primary/10 text-primary font-black text-sm">
                             {biz.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800 text-xs">{biz.name}</p>
                             <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {new Date(biz.created_at).toLocaleDateString('pt-BR')}
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-2">
                           <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${biz.active ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-700"}`}>
                              {biz.active ? "Ativo" : "Pendente"}
                           </span>
                           <Link to={`/negocio/${biz.slug}`} target="_blank">
                             <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary rounded-lg">
                               <ExternalLink className="h-3.5 w-3.5" />
                             </Button>
                           </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Atividade do Sistema */}
            <Card className="col-span-1 border border-slate-200 shadow-sm bg-white overflow-hidden rounded-2xl">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between p-4">
                <CardTitle className="text-xs font-black text-slate-800 uppercase tracking-wider">
                  Atividade em Tempo Real
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {stats?.recentActivity?.length === 0 ? (
                    <div className="p-8 text-center text-slate-400 text-xs">Nenhuma atividade recente registrada.</div>
                  ) : (
                    stats?.recentActivity?.map((item: any, idx: number) => (
                      <div key={idx} className="flex items-start gap-3 p-4 hover:bg-slate-50 transition-colors">
                        <div className={`mt-0.5 h-8 w-8 rounded-xl flex items-center justify-center shrink-0 ${
                            item.type === 'primary' ? 'bg-primary/10 text-primary' : 
                            item.type === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 
                            item.type === 'amber' ? 'bg-amber-100 text-amber-600' : 
                            'bg-blue-100 text-blue-600'
                        }`}>
                          <item.icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-slate-700 font-bold truncate">{item.text}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">{formatTime(item.time)}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}
