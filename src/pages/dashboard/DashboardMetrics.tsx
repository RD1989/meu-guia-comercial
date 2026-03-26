import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { ROIMagico } from "@/components/dashboard/ROIMagico";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusiness } from "@/hooks/use-business";
import { Loader2, MapPin, Target, TrendingUp, Bot } from "lucide-react";
import { MapContainer, TileLayer, Circle } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const DashboardMetrics = () => {
  const { business, isLoading } = useBusiness();

  if (isLoading) {
    return (
      <DashboardLayout title="Métricas">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout title="Métricas">
        <Card className="p-12 text-center text-muted-foreground">
          Nenhum negócio vinculado.
        </Card>
      </DashboardLayout>
    );
  }

  const metrics = {
    profileViews: business.profile_views || 0,
    whatsappClicks: business.whatsapp_clicks || 0,
    averageTicket: (business as any).average_ticket || 0,
  };

  const conversionRate = 0.20;
  const estimatedRevenue = metrics.whatsappClicks * conversionRate * metrics.averageTicket;

  return (
    <DashboardLayout title="Métricas">
      <div className="space-y-6">
        <ROIMagico {...metrics} />

        <Card className="border-none shadow-sm bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader>
            <div className="flex items-center justify-between">
               <div>
                  <CardTitle className="text-xl font-black text-slate-900 tracking-tighter">Mapa de Calor de Demanda</CardTitle>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Onde as pessoas estão buscando seu negócio</p>
               </div>
               <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Target className="h-5 w-5 text-primary" />
               </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="h-[400px] w-full relative group">
              <MapContainer 
                center={[(business as any).latitude || -23.5505, (business as any).longitude || -46.6333]} 
                zoom={14} 
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
                className="z-0"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                
                {/* Business Position */}
                <Circle 
                  center={[(business as any).latitude || -23.5505, (business as any).longitude || -46.6333]} 
                  radius={100} 
                  pathOptions={{ fillColor: '#0F172A', color: '#0F172A', weight: 5, fillOpacity: 0.8 }} 
                />

                {/* Demand Samples (Dummy Heatmap) */}
                {[
                  { pos: [(business as any).latitude + 0.005 || -23.5455, (business as any).longitude + 0.005 || -46.6283], r: 300, op: 0.4 },
                  { pos: [(business as any).latitude - 0.004 || -23.5545, (business as any).longitude + 0.002 || -46.6313], r: 500, op: 0.2 },
                  { pos: [(business as any).latitude + 0.003 || -23.5475, (business as any).longitude - 0.006 || -46.6393], r: 200, op: 0.5 },
                  { pos: [(business as any).latitude - 0.008 || -23.5585, (business as any).longitude - 0.001 || -46.6343], r: 400, op: 0.3 },
                ].map((point, i) => (
                  <Circle 
                    key={i}
                    center={point.pos as [number, number]} 
                    radius={point.r} 
                    pathOptions={{ fillColor: '#FF6B2C', color: 'transparent', weight: 0, fillOpacity: point.op }} 
                  />
                ))}
              </MapContainer>
              
              <div className="absolute bottom-6 left-6 z-[10] bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-xl max-w-[200px]">
                 <div className="flex items-center gap-2 mb-2">
                    <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                    <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">Tempo Real</span>
                 </div>
                 <p className="text-[9px] font-medium text-slate-500 leading-tight">
                   Zonas com maior concentração de buscas pelo seu ticket médio.
                 </p>
              </div>
            </div>
            
            <div className="p-8 grid grid-cols-2 md:grid-cols-4 gap-6 bg-slate-50 border-t border-slate-100">
               {[
                 { label: 'Bairro Líder', value: 'Centro Histórico', icon: MapPin },
                 { label: 'Distância Média', value: '4.2 km', icon: TrendingUp },
                 { label: 'Fidelidade Regional', value: '85%', icon: Target },
                 { label: 'Alcance Único', value: '1.2k pax', icon: Bot },
               ].map((item, i) => (
                 <div key={i} className="space-y-1">
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.label}</p>
                    <p className="text-sm font-black text-slate-900">{item.value}</p>
                 </div>
               ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
          <CardHeader>
            <CardTitle className="text-base">Como o ROI Mágico é calculado?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span>Cliques no WhatsApp</span>
                <span className="font-semibold text-foreground">{metrics.whatsappClicks}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span>Taxa de conversão estimada</span>
                <span className="font-semibold text-foreground">20%</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-border">
                <span>Ticket médio</span>
                <span className="font-semibold text-foreground">R$ {metrics.averageTicket.toFixed(2)}</span>
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
