import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Phone, MessageCircle, MapPin, Star, Share2, Loader2, Info, Utensils, Calendar, Star as StarIcon, Clock, Globe, ArrowUpRight, Sparkles } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DigitalMenu } from "@/components/portal/DigitalMenu";
import { BookingSection } from "@/components/portal/BookingSection";
import { AddReviewModal } from "@/components/portal/AddReviewModal";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DUMMY_PRODUCTS, DUMMY_SERVICES } from "@/data/dummy-data";
import { motion } from "framer-motion";

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  // Core Business Query
  const { data: business, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, categories(name)")
        .eq("slug", slug!)
        .eq("active", true)
        .maybeSingle();
      if (error) {
        console.error("Critical error fetching business:", error);
        return null;
      }
      return data;
    },
    enabled: !!slug,
  });

  // Products Query (Defensive)
  const { data: products = [] } = useQuery({
    queryKey: ["business-products", business?.id],
    enabled: !!business,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("business_id", business!.id)
          .eq("active", true)
          .order("name");
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Products query failed:", err);
        return [];
      }
    },
  });

  // Services Query (Defensive - uses fallback to common 'services' table name)
  const { data: services = [] } = useQuery({
    queryKey: ["business-services", business?.id],
    enabled: !!business,
    queryFn: async () => {
      try {
        // Try business_services first, then services
        let result = await (supabase as any).from("business_services").select("*").eq("business_id", business!.id).eq("active", true).order("name");
        
        if (result.error) {
          result = await (supabase as any).from("services").select("*").eq("business_id", business!.id).eq("active", true).order("name");
        }
        
        if (result.error) throw result.error;
        return result.data || [];
      } catch (err) {
        console.error("Services query failed:", err);
        return [];
      }
    },
  });

  // Reviews Query (Defensive)
  const { data: reviews = [] } = useQuery({
    queryKey: ["business-reviews", business?.id],
    enabled: !!business,
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("reviews")
          .select("*, profiles(name)")
          .eq("business_id", business!.id)
          .order("created_at", { ascending: false })
          .limit(10);
        if (error) throw error;
        return data || [];
      } catch (err) {
        console.error("Reviews query failed:", err);
        return [];
      }
    },
  });

  // Increment profile views
  useQuery({
    queryKey: ["increment-views", business?.id],
    enabled: !!business,
    queryFn: async () => {
      await supabase
        .from("businesses")
        .update({ profile_views: (business!.profile_views || 0) + 1 })
        .eq("id", business!.id);
      return true;
    },
    staleTime: Infinity,
  });

  const handleWhatsAppClick = async () => {
    if (!business) return;
    await supabase.from("businesses").update({ whatsapp_clicks: (business.whatsapp_clicks || 0) + 1 }).eq("id", business.id);
    const message = encodeURIComponent(`Olá! Vi seu anúncio no *${window.location.host}* e gostaria de informações.`);
    window.open(`https://wa.me/${business.whatsapp}?text=${message}`, "_blank");
  };

  const avgRating = reviews && reviews.length > 0
    ? reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / reviews.length
    : 5.0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="flex items-center justify-center py-20"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        <BottomTabBar />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-xl font-black text-slate-800 tracking-tighter uppercase mb-2">Não Encontrado</p>
          <p className="text-sm text-slate-500 font-medium mb-6">Este estabelecimento pode estar inativo ou o link está incorreto.</p>
          <Button className="rounded-2xl h-14 px-8 font-black uppercase text-xs tracking-widest shadow-xl shadow-primary/20" onClick={() => navigate("/")}>Voltar ao Início</Button>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  const displayProducts = products && products.length > 0 ? products : DUMMY_PRODUCTS.filter(p => p.business_id === business?.id).slice(0, 8);
  const displayServices = services && services.length > 0 ? services : DUMMY_SERVICES.filter(s => s.business_id === business?.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Header />

      {/* GMB Style Hero Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 group overflow-hidden">
        {business.image_url ? (
          <img src={business.image_url} alt={business.name} className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
             <span className="text-8xl font-black text-white/5 uppercase">{business.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        <button onClick={() => navigate(-1)} className="absolute top-6 left-6 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center z-20 hover:bg-white/20 transition-all">
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        {/* Business Hero Info */}
        <div className="absolute bottom-10 left-0 w-full px-6 z-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-white border-0 text-[10px] px-3 py-1 font-black uppercase tracking-widest leading-none">
                  {(business.categories as any)?.name || "Comercial"}
                </Badge>
                {(business as any).plan_tier === 'MAX' && (
                  <Badge className="bg-amber-400 text-amber-950 border-0 text-[10px] px-3 py-1 font-black uppercase tracking-widest flex gap-1 items-center leading-none">
                    <Sparkles className="h-3 w-3" /> Elite
                  </Badge>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tighter drop-shadow-2xl">
                {business.name}
              </h1>
              <div className="flex items-center gap-4 text-white/90">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10 text-sm font-bold">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {avgRating.toFixed(1)}
                  <span className="text-white/60 font-medium ml-1">({reviews.length || "0"})</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm font-medium">
                  <MapPin className="h-4 w-4 text-primary" />
                  {business.address?.split(',')[0]}
                </div>
              </div>
            </div>

            {/* Quick GMB Actions Bar */}
            <div className="flex flex-wrap gap-3 bg-white/10 backdrop-blur-xl p-2 rounded-[2rem] border border-white/20 shadow-2xl">
              <Button onClick={handleWhatsAppClick} className="rounded-full h-12 px-6 gap-2 bg-emerald-500 hover:bg-emerald-600 text-white border-0 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-emerald-500/20 transition-all active:scale-95">
                <MessageCircle className="h-4 w-4" /> WhatsApp
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 w-12 p-0 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <a href={`tel:${business.phone}`} title="Ligar"><Phone className="h-4 w-4" /></a>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 w-12 p-0 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address || '')}`} target="_blank" rel="noopener noreferrer" title="Ver no Mapa"><ArrowUpRight className="h-4 w-4" /></a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with Tabs */}
      <div className="max-w-5xl mx-auto px-6 -mt-4 relative z-30">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full flex justify-start gap-4 h-14 bg-white/80 backdrop-blur-xl border border-white p-1 rounded-3xl shadow-xl shadow-slate-200/50 mb-8 sticky top-20 z-40 overflow-x-auto no-scrollbar">
            <TabsTrigger value="about" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Info className="h-3.5 w-3.5" /> Sobre
            </TabsTrigger>
            <TabsTrigger value="menu" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Utensils className="h-3.5 w-3.5" /> Cardápio
            </TabsTrigger>
            <TabsTrigger value="booking" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <Calendar className="h-3.5 w-3.5" /> Reserva
            </TabsTrigger>
            <TabsTrigger value="reviews" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white transition-all">
              <StarIcon className="h-3.5 w-3.5" /> Avaliações
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <TabsContent value="about" className="mt-0 outline-none">
                <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-1.5 bg-primary rounded-full" />Descrição
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {business.description || "Este estabelecimento ainda não forneceu uma descrição detalhada."}
                    </p>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Contato</h4>
                       <div className="space-y-3">
                         {business.phone && <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><Phone className="h-4 w-4 text-primary" /> {business.phone}</div>}
                         <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp Disponível</div>
                         <div className="flex items-center gap-3 text-sm font-bold text-slate-700"><Globe className="h-4 w-4 text-blue-500" /> Website Oficial</div>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Localização</h4>
                       <div className="flex items-start gap-3 text-sm font-bold leading-tight text-slate-700"><MapPin className="h-4 w-4 text-rose-500 shrink-0" /> {business.address || "Endereço não informado"}</div>
                       <Button variant="link" className="text-primary p-0 h-auto font-black text-[10px] uppercase tracking-wider" asChild>
                         <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address || '')}`} target="_blank" rel="noopener noreferrer">Ver no Google Maps</a>
                       </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="menu" className="mt-0 outline-none">
                <DigitalMenu products={displayProducts} businessName={business.name} whatsapp={business.whatsapp || ''} />
              </TabsContent>

              <TabsContent value="booking" className="mt-0 outline-none">
                <BookingSection services={displayServices} businessName={business.name} whatsapp={business.whatsapp || ''} />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 outline-none">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">Avaliações</h3>
                    <Button onClick={() => user ? setReviewModalOpen(true) : toast.error("Faça login para avaliar")} className="rounded-full px-6 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest">Avaliar agora</Button>
                  </div>
                  {/* Rating Breakdown */}
                  <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white">
                    <div className="grid md:grid-cols-3 gap-8 items-center text-center md:text-left">
                      <div>
                        <div className="text-6xl font-black text-slate-900 mb-2">{avgRating.toFixed(1)}</div>
                        <div className="flex justify-center md:justify-start gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating) ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />
                          ))}
                        </div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{reviews.length} Avaliações</div>
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;
                          return (
                            <div key={stars} className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-slate-900 w-4">{stars}</span>
                              <div className="flex-1 h-2 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full bg-amber-400" />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 w-4">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>
                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed rounded-[2.5rem] bg-white text-slate-400 font-bold uppercase text-xs tracking-widest">Ainda não há avaliações</div>
                    ) : (
                      reviews.map((review) => (
                        <Card key={review.id} className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">{(review.profiles as any)?.name?.[0] || 'U'}</div>
                              <div>
                                <div className="font-bold text-slate-900 text-sm">{(review.profiles as any)?.name || "Usuário"}</div>
                                <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{format(new Date(review.created_at), "d MMMM yyyy", { locale: ptBR })}</div>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-100'}`} />)}
                            </div>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed italic">"{review.comment || "Excelente estabelecimento!"}"</p>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white space-y-6">
                 <h4 className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 leading-none"><Clock className="h-4 w-4 text-primary" /> Horários</h4>
                 <div className="space-y-3">
                   {(() => {
                     const schedule = (business as any)?.business_hours || {
                       mon: { open: "08:00", close: "18:00", closed: false },
                       tue: { open: "08:00", close: "18:00", closed: false },
                       wed: { open: "08:00", close: "18:00", closed: false },
                       thu: { open: "08:00", close: "18:00", closed: false },
                       fri: { open: "08:00", close: "18:00", closed: false },
                       sat: { open: "08:00", close: "18:00", closed: false },
                       sun: { open: "08:00", close: "18:00", closed: true },
                     };
                     
                     const daysMap: any = {
                       0: 'sun', 1: 'mon', 2: 'tue', 3: 'wed', 4: 'thu', 5: 'fri', 6: 'sat'
                     };
                     
                     const dayLabels: any = {
                       mon: 'Segunda', tue: 'Terça', wed: 'Quarta', thu: 'Quinta', fri: 'Sexta', sat: 'Sábado', sun: 'Domingo'
                     };

                     const now = new Date();
                     const currentDayKey = daysMap[now.getDay()];
                     const currentSchedule = schedule[currentDayKey];
                     
                     let isOpen = false;
                     if (currentSchedule && !currentSchedule.closed) {
                       const currentTime = now.getHours() * 60 + now.getMinutes();
                       const [openH, openM] = currentSchedule.open.split(':').map(Number);
                       const [closeH, closeM] = currentSchedule.close.split(':').map(Number);
                       const openTime = openH * 60 + openM;
                       const closeTime = closeH * 60 + closeM;
                       isOpen = currentTime >= openTime && currentTime <= closeTime;
                     }

                     return (
                       <>
                         {Object.entries(dayLabels).map(([key, label]: [any, any]) => {
                           const dayData = schedule[key];
                           const isToday = key === currentDayKey;
                           
                           return (
                             <div key={key} className={`flex justify-between text-[11px] font-bold ${isToday ? 'bg-primary/5 -mx-2 px-2 py-1 rounded-lg border border-primary/10' : ''}`}>
                               <span className="text-slate-400 uppercase tracking-tighter">{label}</span>
                               <span className={dayData?.closed ? 'text-rose-500' : 'text-slate-900'}>
                                 {dayData?.closed ? 'Fechado' : `${dayData?.open} - ${dayData?.close}`}
                               </span>
                             </div>
                           );
                         })}
                         <Badge 
                           variant="outline" 
                           className={`w-full justify-center py-2 rounded-xl font-black uppercase text-[9px] tracking-widest mt-2 ${
                             isOpen 
                               ? 'border-emerald-100 bg-emerald-50 text-emerald-600' 
                               : 'border-rose-100 bg-rose-50 text-rose-600'
                           }`}
                         >
                           {isOpen ? 'Aberto Agora' : 'Fechado no Momento'}
                         </Badge>
                       </>
                     );
                   })()}
                 </div>
              </Card>
              <Card onClick={handleWhatsAppClick} className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-primary group hover:bg-slate-900 transition-all cursor-pointer text-center space-y-4">
                 <div className="h-16 w-16 rounded-full bg-white/20 mx-auto flex items-center justify-center backdrop-blur-md transition-transform group-hover:scale-110"><MessageCircle className="h-8 w-8 text-white" /></div>
                 <div className="space-y-1"><div className="text-lg font-black uppercase tracking-tight text-white leading-none">Dúvidas?</div><p className="text-white/70 text-[10px] font-medium leading-tight">Fale com o proprietário direto por aqui.</p></div>
                 <ArrowUpRight className="h-5 w-5 text-white/50 mx-auto transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
              </Card>
            </div>
          </div>
        </Tabs>
      </div>

      <BottomTabBar />
      <AddReviewModal isOpen={reviewModalOpen} onClose={() => setReviewModalOpen(false)} businessId={business.id} businessName={business.name} tenantId={business.tenant_id} />
    </div>
  );
};

export default BusinessDetail;
