import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFavorites } from "@/hooks/use-favorites";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  LogOut, 
  User, 
  Mail, 
  Store, 
  Star, 
  Heart, 
  ArrowRight, 
  Ticket, 
  Trash2, 
  Copy, 
  ExternalLink,
  MessageSquare,
  Sparkles,
  Loader2
} from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Profile() {
  const { user, signOut, loading, userRole, isLojista, isConsumer } = useAuth();
  const navigate = useNavigate();
  const { favorites, isLoading: loadingFavs, toggleFavorite } = useFavorites();

  // Buscar Avaliações feitas por este usuário
  const { data: myReviews = [], isLoading: loadingReviews } = useQuery({
    queryKey: ["my-reviews", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reviews")
        .select("*, businesses(name, slug, image_url)")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // Buscar Cupons Ativos (das empresas favoritas ou do portal)
  const { data: availableCoupons = [], isLoading: loadingCoupons } = useQuery({
    queryKey: ["consumer-coupons", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("coupons")
        .select("*, businesses(name, slug, image_url, city)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(10);
      if (error) throw error;
      return data || [];
    }
  });

  if (!loading && !user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Cupom "${code}" copiado! Apresente no balcão da loja.`);
  };

  const roleLabels: Record<string, string> = {
    SUPERADMIN: "Super Administrador",
    ADMIN: "Administrador",
    LOJISTA: "Lojista",
    USER: "Consumidor",
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24 md:pb-12 font-sans">
      <Header />

      <div className="max-w-4xl mx-auto px-4 pt-28 pb-12 space-y-8">
        {/* Header do Perfil */}
        <div className="bg-white p-6 sm:p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-3xl bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner">
              {user?.user_metadata?.name?.[0]?.toUpperCase() || <User className="h-7 w-7" />}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-[900] text-slate-900 tracking-tight">
                  {user?.user_metadata?.name || "Meu Perfil"}
                </h1>
                <Badge className="bg-primary/10 text-primary border-none font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full">
                  {roleLabels[userRole || "USER"]}
                </Badge>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                <Mail className="h-3.5 w-3.5" />
                <span>{user?.email}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {isLojista && (
              <Button
                onClick={() => navigate("/dashboard")}
                className="flex-1 sm:flex-none h-11 px-5 rounded-2xl bg-primary text-white font-black uppercase text-xs tracking-wider gap-2 shadow-lg shadow-primary/20"
              >
                <Store className="h-4 w-4" /> Painel Lojista
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleSignOut}
              className="h-11 px-4 rounded-2xl text-xs font-black uppercase tracking-wider text-rose-500 hover:text-rose-600 hover:bg-rose-50 border-rose-100 gap-1.5"
            >
              <LogOut className="h-4 w-4" /> Sair
            </Button>
          </div>
        </div>

        {/* CTA Lojista para Consumidores */}
        {isConsumer && (
          <Card className="border-none shadow-md bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-[2.5rem] p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div className="space-y-1">
                <Badge className="bg-primary text-white border-none text-[9px] font-black uppercase tracking-wider mb-2">
                  Destaque seu Comércio
                </Badge>
                <h3 className="text-xl font-black tracking-tight">Você é dono de uma empresa?</h3>
                <p className="text-xs text-slate-400 font-medium max-w-md">
                  Cadastre seu estabelecimento no guia comercial e seja encontrado por milhares de clientes todos os dias.
                </p>
              </div>
              <Button 
                onClick={() => navigate("/planos")}
                className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-xs tracking-widest gap-2 shadow-lg shadow-primary/30 shrink-0"
              >
                Anunciar Minha Empresa <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        )}

        {/* Abas do Painel do Consumidor */}
        <Tabs defaultValue="favorites" className="w-full">
          <TabsList className="w-full grid grid-cols-3 h-14 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 mb-6">
            <TabsTrigger 
              value="favorites" 
              className="rounded-xl font-black uppercase text-[10px] tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
            >
              <Heart className="h-3.5 w-3.5" /> Favoritos ({favorites.length})
            </TabsTrigger>
            <TabsTrigger 
              value="coupons" 
              className="rounded-xl font-black uppercase text-[10px] tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
            >
              <Ticket className="h-3.5 w-3.5" /> Cupons ({availableCoupons.length})
            </TabsTrigger>
            <TabsTrigger 
              value="reviews" 
              className="rounded-xl font-black uppercase text-[10px] tracking-wider data-[state=active]:bg-primary data-[state=active]:text-white gap-2"
            >
              <Star className="h-3.5 w-3.5" /> Minhas Avaliações ({myReviews.length})
            </TabsTrigger>
          </TabsList>

          {/* 1. ABA FAVORITOS */}
          <TabsContent value="favorites" className="mt-0 outline-none space-y-4">
            {loadingFavs ? (
              <div className="flex justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : favorites.length === 0 ? (
              <Card className="p-16 text-center border-none shadow-sm rounded-[2.5rem] bg-white">
                <Heart className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-800">Nenhum estabelecimento favoritado</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-6">
                  Explore o guia e clique no coração para salvar seus restaurantes, lojas e serviços preferidos.
                </p>
                <Button 
                  onClick={() => navigate("/categorias")}
                  className="rounded-2xl h-11 px-6 bg-primary text-white font-bold text-xs uppercase tracking-wider"
                >
                  Explorar Estabelecimentos
                </Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favorites.map((fav: any) => {
                  const b = fav.businesses || fav;
                  if (!b) return null;
                  return (
                    <Card key={fav.id || b.id} className="border-none shadow-sm bg-white rounded-3xl p-5 hover:shadow-md transition-all flex items-center justify-between gap-4 group">
                      <Link to={`/negocio/${b.slug}`} className="flex items-center gap-4 flex-1 min-w-0">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.name} className="h-16 w-16 rounded-2xl object-cover shrink-0 shadow-sm" />
                        ) : (
                          <div className="h-16 w-16 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xl shrink-0">
                            {b.name?.[0]}
                          </div>
                        )}
                        <div className="min-w-0 space-y-1">
                          <Badge variant="secondary" className="text-[8px] font-black uppercase px-2 py-0.5">
                            {b.categories?.name || "Comércio"}
                          </Badge>
                          <h4 className="font-black text-slate-900 text-sm truncate group-hover:text-primary transition-colors">
                            {b.name}
                          </h4>
                          <p className="text-[10px] text-slate-400 truncate">
                            {b.address || b.city || "Ver detalhes"}
                          </p>
                        </div>
                      </Link>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleFavorite(b.id)}
                        className="text-slate-300 hover:text-rose-500 rounded-xl h-9 w-9 shrink-0"
                        title="Remover dos favoritos"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 2. ABA CUPONS DISPONÍVEIS */}
          <TabsContent value="coupons" className="mt-0 outline-none space-y-4">
            {loadingCoupons ? (
              <div className="flex justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : availableCoupons.length === 0 ? (
              <Card className="p-16 text-center border-none shadow-sm rounded-[2.5rem] bg-white">
                <Ticket className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-800">Nenhum cupom disponível no momento</h3>
                <p className="text-xs text-slate-400 mt-1">Fique atento às ofertas promocionais da sua cidade!</p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availableCoupons.map((coupon: any) => {
                  const discountText = coupon.discount_type === "percent"
                    ? `${coupon.discount_value}% OFF`
                    : coupon.discount_type === "fixed"
                    ? `R$ ${coupon.discount_value} OFF`
                    : "Brinde Especial";

                  return (
                    <Card key={coupon.id} className="border-none shadow-sm bg-white rounded-3xl p-6 hover:shadow-md transition-all flex flex-col justify-between gap-4 border-l-4 border-l-primary">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                            {coupon.businesses?.name || "Loja Local"}
                          </span>
                          <Badge className="bg-emerald-50 text-emerald-700 border-none font-black text-[10px]">
                            {discountText}
                          </Badge>
                        </div>
                        <h4 className="font-black text-slate-900 text-base leading-snug">{coupon.title}</h4>
                        {coupon.description && (
                          <p className="text-xs text-slate-500 line-clamp-2">{coupon.description}</p>
                        )}
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-100">
                        <div className="font-mono font-black text-xs bg-slate-100 text-slate-800 px-3 py-1.5 rounded-xl">
                          {coupon.code || "OFERTA"}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleCopyCoupon(coupon.code || "OFERTA")}
                            className="rounded-xl h-9 px-3 text-[10px] font-black uppercase bg-primary hover:bg-primary/90 text-white gap-1"
                          >
                            <Copy className="h-3 w-3" /> Copiar Código
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/negocio/${coupon.businesses?.slug}`)}
                            className="rounded-xl h-9 px-3 text-[10px] font-bold text-slate-500"
                          >
                            Ver Loja
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* 3. ABA MINHAS AVALIAÇÕES */}
          <TabsContent value="reviews" className="mt-0 outline-none space-y-4">
            {loadingReviews ? (
              <div className="flex justify-center p-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : myReviews.length === 0 ? (
              <Card className="p-16 text-center border-none shadow-sm rounded-[2.5rem] bg-white">
                <Star className="h-12 w-12 text-slate-200 mx-auto mb-3" />
                <h3 className="text-lg font-black text-slate-800">Você ainda não avaliou nenhum local</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
                  Deixe sua opinião sincera nos estabelecimentos que você frequentar e ajude a comunidade local!
                </p>
              </Card>
            ) : (
              <div className="space-y-4">
                {myReviews.map((rev: any) => (
                  <Card key={rev.id} className="border-none shadow-sm bg-white rounded-3xl p-6 space-y-3">
                    <div className="flex items-center justify-between">
                      <Link to={`/negocio/${rev.businesses?.slug}`} className="font-black text-slate-900 text-sm hover:text-primary transition-colors flex items-center gap-2">
                        <Store className="h-4 w-4 text-primary" />
                        {rev.businesses?.name || "Estabelecimento"}
                      </Link>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className={`h-3.5 w-3.5 ${i < rev.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 italic">"{rev.comment}"</p>

                    {rev.owner_reply && (
                      <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-2.5 mt-2">
                        <MessageSquare className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        <div>
                          <p className="text-[10px] font-black uppercase text-slate-700">Resposta da Empresa:</p>
                          <p className="text-xs text-slate-600 mt-0.5">{rev.owner_reply}</p>
                        </div>
                      </div>
                    )}

                    <p className="text-[9px] text-slate-400 font-bold uppercase">
                      Avaliado em {format(new Date(rev.created_at), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomTabBar />
    </div>
  );
}
