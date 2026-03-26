import { Eye, MousePointerClick, DollarSign, TrendingUp, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
  trend?: string;
}

function MetricCard({ title, value, description, icon: Icon, trend }: MetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        <div className="flex items-center gap-1 mt-1">
          {trend && (
            <span className="text-xs text-green-600 flex items-center gap-0.5">
              <ArrowUpRight className="h-3 w-3" />
              {trend}
            </span>
          )}
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <MetricCard
        title="Visualizações do Perfil"
        value={profileViews.toLocaleString("pt-BR")}
        description="total de acessos"
        icon={Eye}
      />
      <MetricCard
        title="Cliques no WhatsApp"
        value={whatsappClicks.toLocaleString("pt-BR")}
        description={`${clickRate}% de conversão`}
        icon={MousePointerClick}
      />
      <MetricCard
        title="Ticket Médio"
        value={`R$ ${averageTicket.toFixed(2)}`}
        description="por atendimento"
        icon={DollarSign}
      />
      <MetricCard
        title="ROI Mágico"
        value={`R$ ${estimatedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
        description="valor gerado estimado"
        icon={TrendingUp}
      />
    </div>
  );
}
