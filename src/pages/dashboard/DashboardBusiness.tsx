import { useEffect, useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Save, MapPin, Phone, MessageCircle, Loader2, Globe, Instagram, Facebook, Youtube, Twitter, Video, Search, Plus, Camera, Image as ImageIcon } from "lucide-react";
import { useBusiness } from "@/hooks/use-business";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import { BusinessGallery } from "@/components/dashboard/BusinessGallery";
import { AICompanyOptimizer } from "@/components/admin/AICompanyOptimizer";
import { AISeoOptimizer } from "@/components/admin/AISeoOptimizer";

import { Link } from "react-router-dom";

const DashboardBusiness = () => {
  const { business, isLoading, updateBusiness } = useBusiness();
  const [form, setForm] = useState({
    name: "",
    description: "",
    phone: "",
    whatsapp: "",
    address: "",
    average_ticket: "",
    image_url: "",
    // Novos campos SEO e Sociais
    seo_title: "",
    seo_description: "",
    meta_keywords: "",
    instagram: "",
    facebook: "",
    twitter_url: "",
    youtube_url: "",
    tiktok_url: "",
    has_menu: false,
    has_booking: false,
    gallery: [] as { url: string; type: "image" | "video" }[],
  });

  useEffect(() => {
    if (business) {
      setForm({
        name: business.name || "",
        description: business.description || "",
        phone: business.phone || "",
        whatsapp: business.whatsapp || "",
        address: business.address || "",
        average_ticket: business.average_ticket?.toString() || "0",
        image_url: business.image_url || "",
        seo_title: (business as any).seo_title || "",
        seo_description: (business as any).seo_description || "",
        meta_keywords: (business as any).meta_keywords || "",
        instagram: (business as any).instagram || "",
        facebook: (business as any).facebook || "",
        twitter_url: (business as any).twitter_url || "",
        youtube_url: (business as any).youtube_url || "",
        tiktok_url: (business as any).tiktok_url || "",
        has_menu: (business as any).has_menu || false,
        has_booking: (business as any).has_booking || false,
        gallery: (business as any).gallery || [],
      });
    }
  }, [business]);

  const handleChange = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateBusiness.mutate({
      name: form.name,
      description: form.description,
      phone: form.phone,
      whatsapp: form.whatsapp,
      address: form.address,
      average_ticket: parseFloat(form.average_ticket) || 0,
      image_url: form.image_url || null,
      // Novos campos com casting para contornar tipos antigos
      ...({
        seo_title: form.seo_title,
        seo_description: form.seo_description,
        meta_keywords: form.meta_keywords,
        instagram: form.instagram,
        facebook: form.facebook,
        twitter_url: form.twitter_url,
        youtube_url: form.youtube_url,
        tiktok_url: form.tiktok_url,
        has_menu: form.has_menu,
        has_booking: form.has_booking,
        gallery: form.gallery,
      } as any)
    });
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Meu Negócio">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!business) {
    return (
      <DashboardLayout title="Meu Negócio">
        <Card className="p-12 text-center shadow-xl border-none rounded-[40px]">
          <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Search className="h-10 w-10 text-slate-300" />
          </div>
          <h3 className="text-xl font-black text-slate-900 mb-2">Nenhum Negócio Encontrado</h3>
          <p className="text-sm text-muted-foreground max-w-xs mx-auto mb-8">
            Você ainda não possui um estabelecimento vinculado à sua conta de lojista.
          </p>
          <Button className="rounded-2xl font-black h-12 px-8">Criar Meu Perfil</Button>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Meu Negócio">
      <div className="max-w-2xl space-y-6">
        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-4 w-4 text-primary" />
              Galeria de Mídia (Fotos e Vídeos)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <BusinessGallery 
              items={form.gallery}
              onChange={(items) => handleChange("gallery", items)}
              maxPhotos={20}
              maxVideos={5}
            />
            <p className="text-[10px] text-muted-foreground mt-4">
              Dica: Perfis com vídeos convertem até **3x mais**. Max: 5MB (foto) / 20MB (vídeo).
            </p>
          </CardContent>
        </Card>

        <Card className="border-none shadow-xl rounded-[32px] overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-primary" />
              Foto de Capa Principal
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUpload
              bucket="business-images"
              currentUrl={form.image_url || null}
              onUpload={(url) => handleChange("image_url", url)}
              onRemove={() => handleChange("image_url", "")}
            />
            <p className="text-[10px] text-muted-foreground mt-2">
              Recomendado: 800×500px. Máximo 5MB.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Informações do Estabelecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-xs">Nome do Negócio</Label>
              <Input id="name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="description" className="text-xs font-semibold">Descrição do Estabelecimento</Label>
              <Textarea 
                id="description" 
                value={form.description} 
                onChange={(e) => handleChange("description", e.target.value)} 
                className="mt-1.5 rounded-xl min-h-[120px] focus-visible:ring-primary/20 border-slate-200"
                placeholder="Conte um pouco sobre sua empresa, produtos e diferenciais..."
              />
              <div className="mt-3">
                <AICompanyOptimizer 
                  businessName={form.name} 
                  currentDescription={form.description}
                  onSelect={(txt) => handleChange("description", txt)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Contato
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="phone" className="text-xs">Telefone</Label>
              <Input id="phone" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} className="mt-1.5 h-11 rounded-xl" />
            </div>
            <div>
              <Label htmlFor="whatsapp" className="text-xs flex items-center gap-1">
                <MessageCircle className="h-3 w-3" />
                WhatsApp (com código do país)
              </Label>
              <Input id="whatsapp" value={form.whatsapp} onChange={(e) => handleChange("whatsapp", e.target.value)} placeholder="5522999991234" className="mt-1.5 h-11 rounded-xl" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4 text-primary" />
              Redes Sociais
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="instagram" className="text-xs flex items-center gap-1">
                  <Instagram className="h-3 w-3" /> Instagram
                </Label>
                <Input id="instagram" value={form.instagram} onChange={(e) => handleChange("instagram", e.target.value)} placeholder="@seuprofile" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="facebook" className="text-xs flex items-center gap-1">
                  <Facebook className="h-3 w-3" /> Facebook
                </Label>
                <Input id="facebook" value={form.facebook} onChange={(e) => handleChange("facebook", e.target.value)} placeholder="facebook.com/suapagina" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="youtube_url" className="text-xs flex items-center gap-1">
                  <Youtube className="h-3 w-3" /> YouTube
                </Label>
                <Input id="youtube_url" value={form.youtube_url} onChange={(e) => handleChange("youtube_url", e.target.value)} placeholder="youtube.com/@seu-canal" className="h-10 rounded-xl" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tiktok_url" className="text-xs flex items-center gap-1">
                  <Video className="h-3 w-3" /> TikTok
                </Label>
                <Input id="tiktok_url" value={form.tiktok_url} onChange={(e) => handleChange("tiktok_url", e.target.value)} placeholder="@seutiktok" className="h-10 rounded-xl" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Search className="h-4 w-4 text-primary" />
              SEO & Google (IA)
            </CardTitle>
            <AISeoOptimizer 
              businessName={form.name} 
              businessDescription={form.description}
              onSelect={(seo) => {
                setForm(prev => ({
                  ...prev,
                  seo_title: seo.title,
                  seo_description: seo.description,
                  meta_keywords: seo.keywords
                }));
              }}
            />
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-[10px] text-slate-500 mb-2">
              Configure como sua empresa aparece nos resultados de busca. Use o botão de Otimização se desejar ajuda da IA.
            </p>
            <div className="space-y-3">
              <div>
                <Label htmlFor="seo_title" className="text-xs">Título SEO (Meta Title)</Label>
                <Input id="seo_title" value={form.seo_title} onChange={(e) => handleChange("seo_title", e.target.value)} placeholder="Título para o Google" className="mt-1 h-10 rounded-xl bg-white" />
              </div>
              <div>
                <Label htmlFor="seo_description" className="text-xs">Meta Description</Label>
                <Textarea id="seo_description" value={form.seo_description} onChange={(e) => handleChange("seo_description", e.target.value)} placeholder="Resumo para busca" className="mt-1 rounded-xl bg-white min-h-[80px]" />
              </div>
              <div>
                <Label htmlFor="meta_keywords" className="text-xs">Palavras-chave (separadas por vírgula)</Label>
                <Input id="meta_keywords" value={form.meta_keywords} onChange={(e) => handleChange("meta_keywords", e.target.value)} placeholder="pizza, entrega, restaurante" className="mt-1 h-10 rounded-xl bg-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Recursos de Conversão (Módulos)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="p-4 bg-white rounded-2xl border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Cardápio Digital & Pedido</Label>
                  <p className="text-[10px] text-muted-foreground">Permitir que clientes montem pedidos para o WhatsApp.</p>
                </div>
                <button 
                  onClick={() => setForm(prev => ({ ...prev, has_menu: !prev.has_menu }))}
                  className={`h-6 w-11 rounded-full p-1 transition-colors ${form.has_menu ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${form.has_menu ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {form.has_menu && (
                <Button variant="outline" size="sm" className="w-full text-[10px] h-8 rounded-lg gap-1.5" asChild>
                  <Link to="/dashboard/produtos">
                    Gerenciar Produtos do Cardápio
                  </Link>
                </Button>
              )}
            </div>

            <div className="p-4 bg-white rounded-2xl border border-primary/10">
              <div className="flex items-center justify-between mb-4">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Agendamento de Horários</Label>
                  <p className="text-[10px] text-muted-foreground">Permitir reservas de serviços direto na sua página.</p>
                </div>
                <button 
                  onClick={() => setForm(prev => ({ ...prev, has_booking: !prev.has_booking }))}
                  className={`h-6 w-11 rounded-full p-1 transition-colors ${form.has_booking ? 'bg-primary' : 'bg-slate-200'}`}
                >
                  <div className={`h-4 w-4 rounded-full bg-white transition-transform ${form.has_booking ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
              {form.has_booking && (
                <Button variant="outline" size="sm" className="w-full text-[10px] h-8 rounded-lg gap-1.5" asChild>
                  <Link to="/dashboard/servicos">
                    Configurar Serviços & Agendas
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Financeiro</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <Label htmlFor="average_ticket" className="text-xs">Ticket Médio (R$)</Label>
              <Input id="average_ticket" type="number" step="0.01" value={form.average_ticket} onChange={(e) => handleChange("average_ticket", e.target.value)} className="mt-1.5 h-11 rounded-xl" />
              <p className="text-[10px] text-muted-foreground mt-1">
                Valor médio gasto por cliente. Usado para calcular o ROI Mágico.
              </p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={updateBusiness.isPending} className="w-full h-11 rounded-xl gap-2 font-semibold">
          {updateBusiness.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Salvar Alterações
        </Button>
      </div>
    </DashboardLayout>
  );
};

export default DashboardBusiness;
