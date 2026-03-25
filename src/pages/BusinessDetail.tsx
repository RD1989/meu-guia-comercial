import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ArrowLeft, Phone, MessageCircle, MapPin, Star, Share2, Loader2 } from "lucide-react";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DigitalMenu } from "@/components/portal/DigitalMenu";
import { BookingSection } from "@/components/portal/BookingSection";

const BusinessDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

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
    
    const message = encodeURIComponent(`Olá! Vi seu anúncio no *${window.location.host === 'localhost' ? 'Meu Guia Comercial' : window.location.host}* e gostaria de mais informações sobre seus produtos/serviços.`);
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

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      {/* Hero */}
      <div className="relative h-48 md:h-64 bg-gradient-to-br from-primary/10 to-primary/5">
        {business.image_url && (
          <img src={business.image_url} alt={business.name} className="w-full h-full object-cover" />
        )}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-4 left-4 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center z-10"
        >
          <ArrowLeft className="h-4 w-4 text-foreground" />
        </button>
        <button className="absolute top-4 right-4 h-9 w-9 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center z-10">
          <Share2 className="h-4 w-4 text-foreground" />
        </button>
        {!business.image_url && (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl font-bold text-primary/10">{business.name[0]}</span>
          </div>
        )}
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-6 relative z-10">
        <Card className="p-5">
          <div className="flex items-start justify-between">
            <div>
              {(business.categories as any)?.name && (
                <Badge className="bg-primary/10 text-primary border-0 text-[10px] mb-2">
                  {(business.categories as any).name}
                </Badge>
              )}
              <h1 className="text-xl font-bold text-foreground">{business.name}</h1>
            </div>
            {reviews.length > 0 && (
              <div className="flex items-center gap-1 bg-accent/10 px-2.5 py-1 rounded-lg">
                <Star className="h-3.5 w-3.5 fill-accent text-accent" />
                <span className="text-sm font-bold text-foreground">{avgRating.toFixed(1)}</span>
                <span className="text-[10px] text-muted-foreground">({reviews.length})</span>
              </div>
            )}
          </div>

          {business.address && (
            <div className="flex items-center gap-1.5 mt-3 text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              <span className="text-xs">{business.address}</span>
            </div>
          )}

          {business.description && (
            <p className="text-sm text-muted-foreground mt-4 leading-relaxed">
              {business.description}
            </p>
          )}

          <div className="flex gap-2 mt-5">
            {business.whatsapp && (
              <Button onClick={handleWhatsAppClick} className="flex-1 h-11 rounded-xl gap-2 bg-[hsl(142,70%,45%)] hover:bg-[hsl(142,70%,40%)] text-white">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
            )}
            {business.phone && (
              <Button variant="outline" className="flex-1 h-11 rounded-xl gap-2" asChild>
                <a href={`tel:${business.phone}`}>
                  <Phone className="h-4 w-4" />
                  Ligar
                </a>
              </Button>
            )}
            {business.address && (
              <Button variant="outline" className="h-11 rounded-xl gap-2" asChild>
                <a href={`https://maps.google.com/?q=${encodeURIComponent(business.address)}`} target="_blank" rel="noopener noreferrer">
                  <MapPin className="h-4 w-4" />
                  Mapa
                </a>
              </Button>
            )}
          </div>
        </Card>

        {/* Módulos de Conversão Estratégica */}
        {(business as any).has_booking && services.length > 0 && (
          <BookingSection 
            services={services} 
            businessName={business.name} 
            whatsapp={business.whatsapp} 
          />
        )}

        {(business as any).has_menu && products.length > 0 ? (
          <DigitalMenu 
            products={products} 
            businessName={business.name} 
            whatsapp={business.whatsapp} 
          />
        ) : (
          /* Só mostra a lista simples de produtos se não houver NENHUM módulo de conversão ativo */
          !(business as any).has_menu && !(business as any).has_booking && products.length > 0 && (
            <section className="mt-6">
              <h2 className="text-base font-bold text-foreground mb-3">Produtos & Serviços</h2>
              <div className="grid grid-cols-2 gap-3">
                {products.map((product) => (
                  <Card key={product.id} className="p-4">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="aspect-square rounded-xl mb-3 object-cover w-full" />
                    ) : (
                      <div className="aspect-square bg-muted rounded-xl mb-3 flex items-center justify-center">
                        <span className="text-2xl text-muted-foreground/30">📦</span>
                      </div>
                    )}
                    <h4 className="text-sm font-medium text-foreground">{product.name}</h4>
                    {product.price != null && (
                      <p className="text-sm font-bold text-primary mt-1">
                        R$ {product.price.toFixed(2)}
                      </p>
                    )}
                  </Card>
                ))}
              </div>
            </section>
          )
        )}

        {/* Reviews */}
        {reviews.length > 0 && (
          <section className="mt-6 pb-8">
            <h2 className="text-base font-bold text-foreground mb-3">Avaliações</h2>
            <div className="space-y-3">
              {reviews.map((review) => (
                <Card key={review.id} className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">
                      {(review.profiles as any)?.name || "Usuário"}
                    </span>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: review.rating }).map((_, i) => (
                        <Star key={i} className="h-3 w-3 fill-accent text-accent" />
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-muted-foreground mt-2">{review.comment}</p>
                  )}
                  <span className="text-[10px] text-muted-foreground mt-2 block">
                    {format(new Date(review.created_at), "d 'de' MMM 'de' yyyy", { locale: ptBR })}
                  </span>
                </Card>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomTabBar />
    </div>
  );
};

export default BusinessDetail;
