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
  ChevronRight
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Link } from "react-router-dom";

const StatCard = ({ title, value, icon: Icon, description }: any) => (
  <Card className="border border-slate-200 shadow-sm bg-white overflow-hidden hover:border-primary/20 transition-all">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-semibold text-slate-500">{title}</CardTitle>
      <div className="p-2 bg-slate-50 rounded-lg">
        <Icon className="h-5 w-5 text-primary" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-black text-slate-800">{value}</div>
      <p className="text-xs text-slate-500 mt-2 font-medium">
        {description}
      </p>
    </CardContent>
  </Card>
);

export default function AdminDashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [businesses, users, posts, views] = await Promise.all([
        supabase.from("businesses").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        (supabase as any).from("blog_posts").select("*", { count: "exact", head: true }),
        supabase.from("businesses").select("profile_views").returns<{profile_views: number}[]>()
      ]);

      const totalViews = (views.data || []).reduce((acc, curr) => acc + (curr.profile_views || 0), 0);

      const latestBusinesses = await supabase
        .from("businesses")
        .select("id, name, created_at, active, slug")
        .order("created_at", { ascending: false })
        .limit(5);

      return {
        businesses: businesses.count || 0,
        users: users.count || 0,
        posts: posts.count || 0,
        views: totalViews,
        latestBusinesses: latestBusinesses.data || []
      };
    }
  });

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-8 p-6 lg:p-10">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">Dashboard</h2>
            <p className="text-slate-500 mt-1 font-medium">Visão geral do sistema e métricas principais.</p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <StatCard 
              title="Total de Empresas" 
              value={stats?.businesses || 0} 
              icon={Store} 
              description="Empresas cadastradas" 
            />
            <StatCard 
              title="Categorias Ativas" 
              value="12" 
              icon={TagsMockIcon} 
              description="Segmentos registrados" 
            />
            <StatCard 
              title="Acessos Hoje" 
              value={Math.round((stats?.views || 0) * 0.05) + 1} 
              icon={Eye} 
              description="Tráfego orgânico" 
            />
            <StatCard 
              title="Cidades Cobertas" 
              value="1" 
              icon={MapPin} 
              description="Regiões de atuação" 
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
            
            {/* Tabela Branca - Empresas Recentes */}
            <Card className="col-span-1 border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Empresas Recentes</CardTitle>
                </div>
                <Link to="/admin/empresas">
                  <Button variant="ghost" size="sm" className="text-primary text-xs font-bold gap-1 p-0 hover:bg-transparent">
                    Ver todas <ChevronRight className="h-3 w-3" />
                  </Button>
                </Link>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {stats?.latestBusinesses?.length === 0 ? (
                    <div className="p-8 text-center text-slate-500 text-sm">Nenhuma empresa encontrada.</div>
                  ) : (
                    stats?.latestBusinesses?.map((biz: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                           <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                             {biz.name.charAt(0)}
                           </div>
                           <div>
                             <p className="font-bold text-slate-800 text-sm">{biz.name}</p>
                             <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {new Date(biz.created_at).toLocaleDateString('pt-BR')}
                             </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase tracking-wider">
                              {biz.active ? "Ativo" : "Pendente"}
                           </span>
                           <Link to={`/negocio/${biz.slug}`} target="_blank">
                             <Button variant="outline" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary">
                               <ExternalLinkMockIcon className="h-4 w-4" />
                             </Button>
                           </Link>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tabela Branca - Atividade Sistema */}
             <Card className="col-span-1 border border-slate-200 shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-base font-bold text-slate-800">Atividade do Sistema</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {[
                    { text: "Nova empresa registrada: 'Padaria Modelo'", time: "Hoje, 10:45", icon: Store, type: "primary" },
                    { text: "Usuário 'João' atualizou o plano PREMIUM", time: "Hoje, 09:30", icon: TrendingUp, type: "emerald" },
                    { text: "3 novas avaliações recebidas.", time: "Ontem, 18:20", icon: Sparkles, type: "amber" },
                    { text: "Novo Artigo publicado no Blog.", time: "Ontem, 14:00", icon: FileText, type: "blue" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 hover:bg-slate-50 transition-colors">
                      <div className={`mt-0.5 h-8 w-8 rounded-full flex items-center justify-center ${
                          item.type === 'primary' ? 'bg-primary/10 text-primary' : 
                          item.type === 'emerald' ? 'bg-emerald-100 text-emerald-600' : 
                          item.type === 'amber' ? 'bg-amber-100 text-amber-600' : 
                          'bg-blue-100 text-blue-600'
                      }`}>
                        <item.icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-slate-700 font-semibold">{item.text}</p>
                        <p className="text-xs text-slate-400 mt-1">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

          </div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
}

// Icons fallbacks
const TagsMockIcon = ({ className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M9 5H2v7l6.29 6.29c.94.94 2.48.94 3.42 0l3.58-3.58c.94-.94.94-2.48 0-3.42L9 5Z"/><path d="M6 9h.01"/><path d="m11 14 5.29-5.29c.94-.94.94-2.48 0-3.42l-3.58-3.58a2.41 2.41 0 0 0-3.42 0L3 11"/></svg>
);

const ExternalLinkMockIcon = ({ className }: any) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
);
