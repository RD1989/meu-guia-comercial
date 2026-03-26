import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);

  const { data: business, isLoading } = useQuery({
    queryKey: ["business", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, categories(name)")
        .eq("slug", slug!)
        .eq("active", true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!slug,
  });

  const { data: products = [] } = useQuery({
    queryKey: ["business-products", business?.id],
    enabled: !!business,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", business!.id)
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["business-services", business?.id],
    enabled: !!business && (business as any).has_booking,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("business_services")
        .select("*")
        .eq("business_id", business!.id)
        .eq("active", true)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ["business-reviews", business?.id],
    enabled: !!business,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, profiles(name)")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    },
  });

  // Increment profile views on load
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
    gcTime: Infinity,
  });

  const handleWhatsAppClick = async () => {
    if (!business) return;

    // Increment whatsapp clicks
    await supabase
      .from("businesses")
      .update({ whatsapp_clicks: (business.whatsapp_clicks || 0) + 1 })
      .eq("id", business.id);
    
    const message = encodeURIComponent(`Olá! Vi seu anúncio no *${window.location.host === 'localhost' ? 'Meu Guia Comercial' : window.location.host}* e gostaria de mais informações.`);
    window.open(`https://wa.me/${business.whatsapp}?text=${message}`, "_blank");
  };

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
        <BottomTabBar />
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen bg-background pb-20 md:pb-0">
        <Header />
        <div className="max-w-3xl mx-auto px-4 py-20 text-center">
          <p className="text-lg font-semibold text-foreground">Negócio não encontrado</p>
          <p className="text-sm text-muted-foreground mt-2">O estabelecimento pode estar inativo ou não existe.</p>
          <Button variant="outline" className="mt-6 rounded-xl" onClick={() => navigate("/")}>
            Voltar ao início
          </Button>
        </div>
        <BottomTabBar />
      </div>
    );
  }

  // Fallbacks for display
  const displayProducts = products.length > 0 ? products : DUMMY_PRODUCTS.filter(p => p.business_id === business?.id).slice(0, 8);
  const displayServices = services.length > 0 ? services : DUMMY_SERVICES.filter(s => s.business_id === business?.id).slice(0, 6);

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0">
      <Header />

      {/* GMB Style Hero Banner */}
      <div className="relative h-64 md:h-80 lg:h-96 group overflow-hidden">
        {business.image_url ? (
          <img 
            src={business.image_url} 
            alt={business.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
          />
        ) : (
          <div className="w-full h-full bg-slate-900 flex items-center justify-center">
             <span className="text-8xl font-black text-white/5 uppercase">{business.name[0]}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
        
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center z-20 hover:bg-white/20 transition-all"
        >
          <ArrowLeft className="h-5 w-5 text-white" />
        </button>

        <div className="absolute top-6 right-6 flex gap-2 z-20">
          <button className="h-10 w-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center hover:bg-white/20 transition-all">
            <Share2 className="h-4 w-4 text-white" />
          </button>
        </div>

        {/* Business Hero Info */}
        <div className="absolute bottom-10 left-0 w-full px-6 z-20">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge className="bg-primary text-white border-0 text-[10px] px-3 py-1 font-black uppercase tracking-widest">
                  {(business.categories as any)?.name || "Comercial"}
                </Badge>
                {business.plan_tier === 'MAX' && (
                  <Badge className="bg-amber-400 text-amber-950 border-0 text-[10px] px-3 py-1 font-black uppercase tracking-widest flex gap-1 items-center">
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
                  {avgRating > 0 ? avgRating.toFixed(1) : "5.0"}
                  <span className="text-white/60 font-medium ml-1">({reviews.length || "Nova"})</span>
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
                <a href={`tel:${business.phone}`} title="Ligar">
                  <Phone className="h-4 w-4" />
                </a>
              </Button>
              <Button asChild variant="outline" className="rounded-full h-12 w-12 p-0 bg-white/10 text-white border-white/20 hover:bg-white/20">
                <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address || '')}`} target="_blank" rel="noopener noreferrer" title="Ver no Mapa">
                  <ArrowUpRight className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section with Tabs */}
      <div className="max-w-5xl mx-auto px-6 -mt-4 relative z-30">
        <Tabs defaultValue="about" className="w-full">
          <TabsList className="w-full flex justify-start gap-4 h-14 bg-white/80 backdrop-blur-xl border border-white p-1 rounded-3xl shadow-xl shadow-slate-200/50 mb-8 sticky top-20 z-40 overflow-x-auto no-scrollbar">
            <TabsTrigger value="about" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Info className="h-3.5 w-3.5" /> Sobre
            </TabsTrigger>
            {(business.has_menu || true) && (
              <TabsTrigger value="menu" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Utensils className="h-3.5 w-3.5" /> {business.category_id === 'cat-1' ? 'Cardápio' : 'Loja'}
              </TabsTrigger>
            )}
            {(business.has_booking || true) && (
              <TabsTrigger value="booking" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
                <Calendar className="h-3.5 w-3.5" /> Reserva
              </TabsTrigger>
            )}
            <TabsTrigger value="reviews" className="rounded-2xl gap-2 px-6 font-black uppercase text-[10px] tracking-widest data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <StarIcon className="h-3.5 w-3.5" /> Avaliações
            </TabsTrigger>
          </TabsList>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
            {/* Main Content Area */}
            <div className="lg:col-span-2 space-y-8">
              <TabsContent value="about" className="mt-0 animate-in fade-in duration-500">
                <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white space-y-8">
                  <div className="space-y-4">
                    <h3 className="text-xl font-black text-slate-900 flex items-center gap-3">
                      <div className="h-8 w-1.5 bg-primary rounded-full" />
                      Descrição do Estabelecimento
                    </h3>
                    <p className="text-slate-600 leading-relaxed font-medium">
                      {business.description || "Este estabelecimento ainda não forneceu uma descrição detalhada para o guia comercial. Entre em contato para saber mais sobre os serviços e produtos oferecidos."}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 text-slate-900">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Informações de Contato</h4>
                       <div className="space-y-3">
                         {business.phone && (
                           <div className="flex items-center gap-3 text-sm font-bold">
                             <Phone className="h-4 w-4 text-primary" /> {business.phone}
                           </div>
                         )}
                         {business.whatsapp && (
                           <div className="flex items-center gap-3 text-sm font-bold">
                             <MessageCircle className="h-4 w-4 text-emerald-500" /> WhatsApp Disponível
                           </div>
                         )}
                         <div className="flex items-center gap-3 text-sm font-bold">
                           <Globe className="h-4 w-4 text-blue-500" /> Website Oficial
                         </div>
                       </div>
                    </div>
                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 text-slate-900">
                       <h4 className="text-xs font-black uppercase tracking-widest text-slate-400">Localização</h4>
                       <div className="flex items-start gap-3 text-sm font-bold leading-tight">
                         <MapPin className="h-4 w-4 text-rose-500 shrink-0" /> {business.address || "Endereço não informado"}
                       </div>
                       <Button variant="link" className="text-primary p-0 h-auto font-black text-[10px] uppercase tracking-wider" asChild>
                         <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address || '')}`} target="_blank" rel="noopener noreferrer">Ver Rota no Google Maps</a>
                       </Button>
                    </div>
                  </div>
                </Card>
              </TabsContent>

              <TabsContent value="menu" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <DigitalMenu 
                  products={displayProducts} 
                  businessName={business.name} 
                  whatsapp={business.whatsapp} 
                />
              </TabsContent>

              <TabsContent value="booking" className="mt-0 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <BookingSection 
                  services={displayServices} 
                  businessName={business.name} 
                  whatsapp={business.whatsapp} 
                />
              </TabsContent>

              <TabsContent value="reviews" className="mt-0 animate-in fade-in duration-500">
                <div className="space-y-8">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-black text-slate-900">O que dizem os clientes</h3>
                    <Button 
                      onClick={() => {
                        if (!user) {
                          toast.error("Faça login para avaliar");
                          return;
                        }
                        setReviewModalOpen(true);
                      }}
                      className="rounded-full px-6 bg-slate-900 text-white font-black uppercase text-[10px] tracking-widest"
                    >
                      Avaliar Agora
                    </Button>
                  </div>

                  {/* GMB Review Summary breakdown */}
                  <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white">
                    <div className="grid md:grid-cols-3 gap-8 items-center">
                      <div className="text-center md:border-r border-slate-100 md:pr-8">
                        <div className="text-6xl font-black text-slate-900 mb-2">
                          {avgRating > 0 ? avgRating.toFixed(1) : "5.0"}
                        </div>
                        <div className="flex justify-center gap-0.5 mb-2">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`h-5 w-5 ${i < Math.round(avgRating || 5) ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`} />
                          ))}
                        </div>
                        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                          {reviews.length} Avaliações
                        </div>
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        {[5, 4, 3, 2, 1].map((stars) => {
                          const count = reviews.filter(r => r.rating === stars).length;
                          const total = reviews.length || 1;
                          const percentage = (count / total) * 100;
                          return (
                            <div key={stars} className="flex items-center gap-4">
                              <span className="text-xs font-black text-slate-900 w-4">{stars}</span>
                              <div className="flex-1 h-2.5 bg-slate-50 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${percentage}%` }}
                                  transition={{ duration: 1, ease: "easeOut" }}
                                  className="h-full bg-amber-400"
                                />
                              </div>
                              <span className="text-[10px] font-bold text-slate-400 w-6 text-right">{count}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </Card>

                  <div className="space-y-4">
                    {reviews.length === 0 ? (
                      <div className="p-12 text-center border-2 border-dashed rounded-[2.5rem] bg-white text-slate-400 font-bold">
                        Ainda não há avaliações para este local. Seja o primeiro a avaliar!
                      </div>
                    ) : (
                      reviews.map((review) => (
                        <Card key={review.id} className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center font-black text-slate-400">
                                {(review.profiles as any)?.name?.[0] || 'U'}
                              </div>
                              <div>
                                <div className="font-black text-slate-900">{(review.profiles as any)?.name || "Usuário"}</div>
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  {format(new Date(review.created_at), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-0.5">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-3.5 w-3.5 ${i < review.rating ? 'fill-amber-400 text-amber-400' : 'fill-slate-100 text-slate-100'}`} />
                              ))}
                            </div>
                          </div>
                          <p className="text-slate-600 font-medium leading-relaxed italic">
                            "{review.comment || "Excelente estabelecimento, recomendo a todos pela qualidade e atendimento."}"
                          </p>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>

            {/* Sidebar View (GMB style) */}
            <div className="space-y-6">
              <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-white space-y-6">
                 <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <Clock className="h-4 w-4 text-primary" /> Horários
                 </h4>
                 <div className="space-y-3">
                   {[
                     { d: 'Segunda', h: '08:00 - 18:00' },
                     { d: 'Terça', h: '08:00 - 18:00' },
                     { d: 'Quarta', h: '08:00 - 18:00' },
                     { d: 'Quinta', h: '08:00 - 18:00' },
                     { d: 'Sexta', h: '08:00 - 18:00' },
                     { d: 'Sábado', h: '09:00 - 13:00' },
                     { d: 'Domingo', h: 'Fechado', closed: true },
                   ].map(item => (
                     <div key={item.d} className="flex justify-between text-xs font-bold">
                       <span className="text-slate-400">{item.d}</span>
                       <span className={item.closed ? 'text-rose-500' : 'text-slate-900'}>{item.h}</span>
                     </div>
                   ))}
                 </div>
                 <div className="pt-4 border-t border-slate-50">
                    <Badge variant="outline" className="w-full justify-center py-2 border-emerald-100 bg-emerald-50 text-emerald-600 rounded-xl font-black uppercase text-[9px] tracking-widest">
                       Aberto Agora
                    </Badge>
                 </div>
              </Card>

              <Card className="p-8 border-none shadow-xl shadow-slate-200/40 rounded-[2.5rem] bg-primary group hover:bg-slate-900 transition-colors cursor-pointer" onClick={handleWhatsAppClick}>
                 <div className="flex flex-col items-center text-center gap-4 text-white">
                   <div className="h-16 w-16 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md">
                     <MessageCircle className="h-8 w-8" />
                   </div>
                   <div className="space-y-1">
                     <div className="text-lg font-black uppercase tracking-tighter">Ficou com dúvida?</div>
                     <p className="text-white/70 text-xs font-medium">Fale diretamente com o proprietário via WhatsApp.</p>
                   </div>
                   <ArrowUpRight className="h-5 w-5 text-white/50 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                 </div>
              </Card>
            </div>
          </div>
        </Tabs>
      </div>

      <BottomTabBar />

      <AddReviewModal 
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        businessId={business.id}
        businessName={business.name}
        tenantId={business.tenant_id}
      />
    </div>
  );
};

export default BusinessDetail;
