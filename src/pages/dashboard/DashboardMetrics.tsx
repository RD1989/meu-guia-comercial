import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ROIMagico } from "@/components/dashboard/ROIMagico";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const DashboardMetrics = () => {
  const mockMetrics = {
    profileViews: 1247,
    whatsappClicks: 89,
    averageTicket: 75.0,
  };

  const conversionRate = 0.20;
  const estimatedRevenue = mockMetrics.whatsappClicks * conversionRate * mockMetrics.averageTicket;

  return (
    <DashboardLayout title="Métricas">
      <div className="space-y-6">
        <ROIMagico {...mockMetrics} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Como o ROI Mágico é calculado?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span>Cliques no WhatsApp</span>
                <span className="font-semibold text-foreground">{mockMetrics.whatsappClicks}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span>Taxa de conversão estimada</span>
                <span className="font-semibold text-foreground">20%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span>Ticket médio</span>
                <span className="font-semibold text-foreground">R$ {mockMetrics.averageTicket.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between py-2 bg-primary/5 rounded-lg px-3 -mx-3">
                <span className="font-semibold text-foreground">Valor gerado estimado</span>
                <span className="font-bold text-primary text-lg">
                  R$ {estimatedRevenue.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Fórmula: Cliques no WhatsApp × 20% (conversão) × Ticket Médio = Valor Gerado
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardMetrics;
