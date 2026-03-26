import { Eye, MousePointerClick, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

function MetricCard({ title, value, description, icon: Icon, trend, isSpecial }: MetricCardProps & { isSpecial?: boolean }) {
  return (
    <Card className={`border-none shadow-xl shadow-slate-200/40 rounded-[2rem] transition-all duration-500 hover:translate-y-[-4px] overflow-hidden group ${isSpecial ? 'bg-slate-900' : 'bg-white'}`}>
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-6">
        <CardTitle className={`text-[10px] font-black uppercase tracking-widest ${isSpecial ? 'text-slate-400' : 'text-slate-500'}`}>{title}</CardTitle>
        <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 ${isSpecial ? 'bg-primary shadow-lg shadow-primary/20' : 'bg-primary/5'}`}>
          <Icon className={`h-5 w-5 ${isSpecial ? 'text-white' : 'text-primary'}`} />
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className={`text-3xl font-[900] tracking-tighter ${isSpecial ? 'text-white' : 'text-slate-900'} leading-none mb-2`}>{value}</div>
        <div className="flex items-center gap-2">
          {trend && (
            <span className="text-[10px] font-black text-emerald-500 flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
          <p className={`text-[10px] font-bold ${isSpecial ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-wider`}>{description}</p>
        </div>
        {isSpecial && (
          <div className="absolute -bottom-4 -right-4 h-24 w-24 bg-primary/20 blur-[60px] rounded-full" />
        )}
      </CardContent>
    </Card>
  );
}

interface ROIMagicoProps {
  profileViews: number;
  whatsappClicks: number;
  averageTicket: number;
}

export function ROIMagico({ profileViews, whatsappClicks, averageTicket }: ROIMagicoProps) {
  const conversionRate = 0.20;
  const estimatedRevenue = whatsappClicks * conversionRate * averageTicket;
  const clickRate = profileViews > 0 ? ((whatsappClicks / profileViews) * 100).toFixed(1) : "0";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCard
        title="Visualizações"
        value={profileViews.toLocaleString("pt-BR")}
        description="Acessos Totais"
        icon={Eye}
        trend="+12%"
      />
      <MetricCard
        title="Conversão"
        value={whatsappClicks.toLocaleString("pt-BR")}
        description={`${clickRate}% de cliques`}
        icon={MousePointerClick}
        trend="+18%"
      />
      <MetricCard
        title="Ticket Médio"
        value={`R$ ${averageTicket.toFixed(0)}`}
        description="Por Venda"
        icon={DollarSign}
      />
      <MetricCard
        title="ROI Estimado"
        value={`R$ ${estimatedRevenue.toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`}
        description="Valor Gerado"
        icon={TrendingUp}
        isSpecial
      />
    </div>
  );
}
