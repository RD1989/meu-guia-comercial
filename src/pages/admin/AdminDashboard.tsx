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
  Bot
} from "lucide-react";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

import { motion } from "framer-motion";

const StatCard = ({ title, value, icon: Icon, description, index }: any) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.1 }}
  >
    <Card className="border-none shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden bg-white group cursor-default">
      <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
        <CardTitle className="text-sm font-medium text-slate-500 group-hover:text-primary transition-colors">{title}</CardTitle>
        <div className="p-2 bg-slate-50 group-hover:bg-primary/10 rounded-lg transition-colors">
          <Icon className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-slate-800">{value}</div>
        <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
          <TrendingUp className="h-3 w-3 text-emerald-500" />
          {description}
        </p>
      </CardContent>
    </Card>
  </motion.div>
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

      // Dados simulados para o gráfico de performance semanal
      const chartData = [
        { name: "Seg", views: 400 },
        { name: "Ter", views: 300 },
        { name: "Qua", views: 600 },
        { name: "Qui", views: 800 },
        { name: "Sex", views: 500 },
        { name: "Sáb", views: 900 },
        { name: "Dom", views: 1100 },
      ];

      return {
        businesses: businesses.count || 0,
        users: users.count || 0,
        posts: posts.count || 0,
        views: totalViews,
        chartData
      };
    }
  });

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-6 p-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-800">Seja bem-vindo, Admin</h2>
          <p className="text-slate-500 mt-1">Veja como está o desempenho do seu Guia Comercial hoje.</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard 
            title="Total de Empresas" 
            value={stats?.businesses || 0} 
            icon={Store} 
            description="Lojistas cadastrados" 
            index={0}
          />
          <StatCard 
            title="Total de Usuários" 
            value={stats?.users || 0} 
            icon={Users} 
            description="Usuários na plataforma" 
            index={1}
          />
          <StatCard 
            title="Artigos no Blog" 
            value={stats?.posts || 0} 
            icon={FileText} 
            description="Conteúdo publicado" 
            index={2}
          />
          <StatCard 
            title="Visualizações Totais" 
            value={stats?.views || 0} 
            icon={Eye} 
            description="Impressões nas empresas" 
            index={3}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg">Visualizações da Semana</CardTitle>
                <p className="text-xs text-slate-400">Desempenho total do portal</p>
              </div>
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </CardHeader>
            <CardContent className="h-[300px] w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats?.chartData || []}>
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 12, fill: "#94a3b8" }} 
                    dy={10}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)" }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="views" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorViews)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="col-span-3 border-none shadow-sm bg-white overflow-hidden flex flex-col">
            <CardHeader>
              <CardTitle className="text-lg">Distribuição por Categoria</CardTitle>
              <CardDescription className="text-[10px]">Segmentos dos lojistas cadastrados</CardDescription>
            </CardHeader>
            <CardContent className="h-[200px] pt-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: "Gastronomia", value: 35 },
                      { name: "Saúde", value: 20 },
                      { name: "Moda", value: 25 },
                      { name: "Serviços", value: 20 },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={70}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {[
                      "hsl(var(--primary))", 
                      "#f43f5e", 
                      "#8b5cf6", 
                      "#10b981"
                    ].map((color, idx) => (
                      <Cell key={`cell-${idx}`} fill={color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
            <div className="px-6 pb-6 mt-auto">
              <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-primary" /> Gastronomia</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-rose-500" /> Saúde</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-violet-500" /> Moda</div>
                <div className="flex items-center gap-1.5"><div className="h-2 w-2 rounded-full bg-emerald-500" /> Serviços</div>
              </div>
            </div>
          </Card>

          <Card className="col-span-4 border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">Inovações da IA</CardTitle>
                <CardDescription className="text-xs">Sugestões baseadas no seu contexto</CardDescription>
              </div>
              <div className="p-2 bg-primary/5 rounded-full animate-pulse">
                <Bot className="h-5 w-5 text-primary" />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all group cursor-pointer">
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:bg-primary/5 transition-colors">
                  <Calendar className="h-5 w-5 text-slate-400 group-hover:text-primary transition-colors" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-700 line-clamp-1">Guia: Melhores {new Date().toLocaleString('pt-BR', { month: 'long' })} em Rio Verde</p>
                  <p className="text-xs text-slate-400">Sugestão Automática IA • Hoje, 10:00</p>
                </div>
                <Button size="sm" className="shadow-none rounded-lg font-bold h-8 px-3 text-xs gap-2">
                  <Sparkles className="h-3 w-3" /> Gerar
                </Button>
              </div>

              <div className="pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 px-1">Atividade Recente</h4>
                <div className="space-y-3">
                  {[
                    { text: "Nova empresa 'Restaurante Sabor' cadastrada", time: "Há 10 min", icon: Store, color: "text-blue-500" },
                    { text: "Artigo IA 'Tendências 2026' publicado", time: "Há 1h", icon: Sparkles, color: "text-amber-500" },
                    { text: "Novo usuário registrado na plataforma", time: "Há 3h", icon: Users, color: "text-emerald-500" },
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3 px-1">
                      <div className={`mt-0.5 p-1 rounded-full bg-slate-100 ${item.color}`}>
                        <item.icon className="h-3 w-3" />
                      </div>
                      <div className="flex-1 border-b border-slate-50 pb-2">
                        <p className="text-xs text-slate-600 font-medium leading-tight">{item.text}</p>
                        <p className="text-[10px] text-slate-400">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </AnimatedPage>
    </AdminLayout>
  );
}
