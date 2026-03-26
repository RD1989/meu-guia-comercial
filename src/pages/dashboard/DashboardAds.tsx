import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Plus, 
  Play, 
  Pause, 
  Trash2, 
  Eye, 
  Zap, 
  Image as ImageIcon, 
  Target, 
  MapPin, 
  Calendar,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  Rocket
} from "lucide-react";
import { useState } from "react";
import { DUMMY_ADS } from "@/data/dummy-data";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatform } from "@/contexts/PlatformContext";
import { MapSelector } from "@/components/dashboard/MapSelector";
import { Slider } from "@/components/ui/slider";

export default function DashboardAds() {
  const { user } = useAuth();
  const { config } = usePlatform();
  const [ads, setAds] = useState(DUMMY_ADS);
  const [activeTab, setActiveTab] = useState("overview");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // New Ad State
  const [newAd, setNewAd] = useState({
    title: "",
    description: "",
    image_url: "",
    type: "hero_banner",
    city: config.platform_city || "São Paulo",
    duration: "15",
    lat: -23.5505,
    lng: -46.6333,
    radius: 5000
  });

  const handleGenerateCopy = async () => {
    setIsGenerating(true);
    toast.info("A Inteligência Elite está redigindo seu anúncio...");
    
    // Simulate IA call
    setTimeout(() => {
      setNewAd(prev => ({
        ...prev,
        title: "OFERTA EXCLUSIVA: Transforme seu Estilo de Vida! 🚀",
        description: "Seja a sua melhor versão com o suporte da Elite Fitness. Hoje com condições especiais para novos membros da comunidade local. Não perca tempo!"
      }));
      setIsGenerating(false);
      toast.success("Copy persuasiva gerada com sucesso!");
    }, 2000);
  };

  const handleGenerateImage = async () => {
    setIsGenerating(true);
    toast.info("Criando banner artístico via IA...");
    
    // Simulate IA Image call
    setTimeout(() => {
      setNewAd(prev => ({
        ...prev,
        image_url: "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800"
      }));
      setIsGenerating(false);
      toast.success("Banner gerado com excelência!");
    }, 3000);
  };

  const calculateROI = (duration: string) => {
    const days = parseInt(duration);
    const reach = days * 500; // Mock estimate
    return { reach, clicks: Math.floor(reach * 0.08) };
  };

  const roi = calculateROI(newAd.duration);

  return (
    <DashboardLayout title="Impulsionar (Ads) - Elite Engine">
      <div className="space-y-8 pb-20">
        
        {/* Header Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: 'Alcance Total', value: '45.2k', icon: Eye, color: 'text-primary' },
            { label: 'Cliques Reais', value: '2.8k', icon: Zap, color: 'text-amber-500' },
            { label: 'Campanhas Ativas', value: ads.filter(a => a.status === 'active').length, icon: Target, color: 'text-emerald-500' },
            { label: 'Saldo Elite', value: 'R$ 450,00', icon: TrendingUp, color: 'text-indigo-500' },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden group">
               <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                        <h3 className={cn("text-2xl font-black tracking-tighter", stat.color)}>{stat.value}</h3>
                     </div>
                     <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <stat.icon className={cn("h-5 w-5", stat.color)} />
                     </div>
                  </div>
               </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="overview" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-white border p-1 rounded-xl mb-8 flex-wrap h-auto gap-2">
            <TabsTrigger value="overview" className="gap-2 rounded-lg px-6"><Target className="h-4 w-4" /> Minhas Campanhas</TabsTrigger>
            <TabsTrigger value="create" className="gap-2 rounded-lg px-6 bg-primary/5 text-primary data-[state=active]:bg-primary data-[state=active]:text-white transition-all">
              <Plus className="h-4 w-4" /> Nova Campanha Elite
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
             <div className="grid gap-6">
                {ads.map((ad) => (
                  <motion.div 
                    layout
                    key={ad.id}
                    className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 flex flex-col md:flex-row gap-6 items-center group hover:shadow-xl transition-all"
                  >
                     <div className="h-24 w-40 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-100">
                        <img src={ad.image_url} alt={ad.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                     </div>
                     
                     <div className="flex-1 space-y-1">
                        <div className="flex items-center gap-2 mb-1">
                           <span className={cn(
                             "text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full",
                             ad.status === 'active' ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                           )}>
                             {ad.status === 'active' ? '● Ativo' : '● Pausado'}
                           </span>
                           <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">ID: {ad.id}</span>
                        </div>
                        <h4 className="text-lg font-black text-slate-900 tracking-tight">{ad.title}</h4>
                        <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                           <div className="flex items-center gap-1.5"><MapPin className="h-3 w-3 text-primary" /> {ad.city}</div>
                           <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> Expira em {new Date(ad.end_date).toLocaleDateString()}</div>
                        </div>
                     </div>

                     <div className="hidden lg:flex items-center gap-10 px-10 border-x border-slate-50">
                        <div className="text-center">
                           <div className="text-xl font-black text-slate-900 leading-none">{ad.impressions}</div>
                           <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Vistas</div>
                        </div>
                        <div className="text-center">
                           <div className="text-xl font-black text-primary leading-none">{ad.clicks}</div>
                           <div className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Cliques</div>
                        </div>
                     </div>

                     <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-50 border-slate-100">
                           {ad.status === 'active' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl hover:bg-rose-50 hover:text-rose-500 border-slate-100">
                           <Trash2 className="h-4 w-4" />
                        </Button>
                     </div>
                  </motion.div>
                ))}
             </div>
          </TabsContent>

          <TabsContent value="create">
             <div className="grid lg:grid-cols-2 gap-10">
                {/* Form Section */}
                <div className="space-y-8">
                   <Card className="border-none shadow-xl bg-slate-950 text-white rounded-[2.5rem] overflow-hidden relative">
                      <div className="absolute top-0 right-0 p-8 opacity-10">
                         <BrainCircuit className="h-32 w-32 text-primary" />
                      </div>
                      <CardHeader className="relative z-10">
                         <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center mb-4">
                            <Sparkles className="h-5 w-5 text-white" />
                         </div>
                         <CardTitle className="text-2xl font-[900] tracking-tighter">Elite Creative Assistant</CardTitle>
                         <CardDescription className="text-slate-400">Nossa IA está pronta para criar sua campanha de alta conversão.</CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-6 relative z-10">
                         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                            <div>
                               <p className="text-xs font-black uppercase tracking-widest text-primary">Copywriter Pro</p>
                               <p className="text-[10px] text-slate-400">Gere textos persuasivos automaticamente.</p>
                            </div>
                            <Button 
                              onClick={handleGenerateCopy} 
                              disabled={isGenerating}
                              className="bg-white text-slate-950 font-black text-xs h-9 px-4 rounded-xl hover:bg-primary hover:text-white transition-all"
                            >
                               {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Texto"}
                            </Button>
                         </div>

                         <div className="p-4 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-between gap-4">
                            <div>
                               <p className="text-xs font-black uppercase tracking-widest text-primary">Banner Artist</p>
                               <p className="text-[10px] text-slate-400">Crie imagens exclusivas via IA para seu anúncio.</p>
                            </div>
                            <Button 
                              onClick={handleGenerateImage}
                              disabled={isGenerating}
                              className="bg-white text-slate-950 font-black text-xs h-9 px-4 rounded-xl hover:bg-primary hover:text-white transition-all"
                            >
                               {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Gerar Imagem"}
                            </Button>
                         </div>
                      </CardContent>
                   </Card>

                   <Card className="border-none shadow-sm bg-white rounded-[2.5rem]">
                      <CardContent className="p-8 space-y-6">
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Título do Anúncio</Label>
                            <Input 
                              value={newAd.title} 
                              onChange={(e) => setNewAd(prev => ({ ...prev, title: e.target.value }))}
                              placeholder="Título chamativo..." 
                              className="h-12 border-slate-100 rounded-xl focus:ring-primary"
                            />
                         </div>
                         <div className="space-y-2">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Mensagem (Copy)</Label>
                            <Textarea 
                              value={newAd.description} 
                              onChange={(e) => setNewAd(prev => ({ ...prev, description: e.target.value }))}
                              rows={3} 
                              placeholder="O que você quer oferecer aos seus clientes?" 
                              className="border-slate-100 rounded-xl focus:ring-primary"
                            />
                         </div>
                         <div className="space-y-4">
                            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Segmentação de Alcance (Mapa)</Label>
                            <MapSelector 
                               initialPosition={[newAd.lat, newAd.lng]}
                               initialRadius={newAd.radius}
                               onChange={(pos, rad) => setNewAd(prev => ({ ...prev, lat: pos[0], lng: pos[1], radius: rad }))}
                            />
                         </div>

                         <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Cidade Principal</Label>
                               <div className="relative">
                                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-primary" />
                                  <Input 
                                    value={newAd.city} 
                                    className="pl-10 h-12 border-slate-100 rounded-xl"
                                    onChange={(e) => setNewAd(prev => ({ ...prev, city: e.target.value }))}
                                  />
                               </div>
                            </div>
                            <div className="space-y-2">
                               <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Duração da Campanha</Label>
                               <select 
                                 className="w-full h-12 border border-slate-100 rounded-xl px-4 text-sm font-bold bg-slate-50 cursor-pointer"
                                 value={newAd.duration}
                                 onChange={(e) => setNewAd(prev => ({ ...prev, duration: e.target.value }))}
                               >
                                  <option value="7">7 Dias (Básico)</option>
                                  <option value="15">15 Dias (Plus)</option>
                                  <option value="30">30 Dias (Elite)</option>
                               </select>
                            </div>
                         </div>
                      </CardContent>
                   </Card>
                </div>

                {/* Preview & Activation Section */}
                <div className="space-y-8">
                   <div className="sticky top-10 space-y-8">
                      <div className="text-left">
                         <span className="text-primary font-black text-[9px] uppercase tracking-[0.3em] mb-2 block">Visualização Real</span>
                         <h2 className="text-3xl font-[900] text-slate-950 tracking-tighter leading-none">Preview da Campanha</h2>
                      </div>

                      <AnimatePresence mode="wait">
                         <motion.div 
                           key={newAd.image_url + newAd.title}
                           initial={{ opacity: 0, scale: 0.95 }}
                           animate={{ opacity: 1, scale: 1 }}
                           className="bg-white p-6 rounded-[3rem] shadow-2xl border border-slate-100 relative overflow-hidden group"
                         >
                            <div className="absolute top-6 right-6 z-10">
                               <div className="bg-primary text-white text-[9px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg flex items-center gap-1.5">
                                  <ShieldCheck className="h-3.5 w-3.5" /> Ad Especial
                               </div>
                            </div>

                            <div className="aspect-[16/9] rounded-[2rem] bg-slate-100 mb-6 overflow-hidden border border-slate-100">
                               {newAd.image_url ? (
                                  <img src={newAd.image_url} alt="Ad Preview" className="w-full h-full object-cover" />
                               ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-50">
                                     <ImageIcon className="h-12 w-12 text-slate-200" />
                                  </div>
                               )}
                            </div>

                            <div className="space-y-3">
                               <h3 className="text-2xl font-black text-slate-900 tracking-tighter leading-none">
                                  {newAd.title || "Seu Título Aparecerá Aqui"}
                               </h3>
                               <p className="text-slate-500 font-medium text-sm leading-relaxed">
                                  {newAd.description || "O texto criativo e persuasivo gerado pela IA ou manual será exibido nesta área para atrair seus futuros clientes com autoridade."}
                               </p>
                               
                               <div className="pt-4 flex items-center justify-between border-t border-slate-50 mt-4">
                                  <div className="flex items-center gap-2">
                                     <div className="h-8 w-8 rounded-full bg-slate-100" />
                                     <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">
                                        Anunciante<br/><span className="text-slate-900">{user?.user_metadata?.name || "Sua Empresa"}</span>
                                     </div>
                                  </div>
                                  <Button size="sm" className="bg-slate-950 text-white rounded-xl font-black text-[10px] h-9 px-6 uppercase tracking-widest group">
                                     Saiba Mais <ArrowUpRight className="ml-2 h-3.5 w-3.5 text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                                  </Button>
                               </div>
                            </div>
                         </motion.div>
                      </AnimatePresence>

                      {/* ROI Estimator */}
                      <Card className="border-none shadow-sm bg-primary/5 border border-primary/10 rounded-[2.5rem]">
                         <CardContent className="p-8">
                            <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                               <TrendingUp className="h-4 w-4 text-primary" /> Estimativa de Impacto Elite
                            </h4>
                            <div className="grid grid-cols-2 gap-8">
                               <div>
                                  <div className="text-3xl font-black text-slate-950 leading-none">~{roi.reach.toLocaleString()}</div>
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Alcance Estimado</div>
                               </div>
                               <div>
                                  <div className="text-3xl font-black text-primary leading-none">~{roi.clicks.toLocaleString()}</div>
                                  <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-2">Visitas no Perfil</div>
                               </div>
                            </div>
                         </CardContent>
                      </Card>

                      {/* Activation Button */}
                      <Button className="w-full h-16 rounded-3xl bg-primary hover:bg-primary/90 text-white font-black text-xl shadow-2xl shadow-primary/30 group active:scale-95 transition-all">
                         Ativar Campanha Impulsionada <Rocket className="ml-3 h-6 w-6 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                      </Button>
                      <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">
                         * O custo será debitado do seu saldo Elite após a aprovação manual.
                      </p>
                   </div>
                </div>
             </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
}

// Reuse some icons/components from lucide that were missed in main list
const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>
);

const Loader2 = ({ className }: { className?: string }) => (
  <svg className={cn("animate-spin", className)} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
);
