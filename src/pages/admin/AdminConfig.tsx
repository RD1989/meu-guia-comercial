import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePlatform } from "@/contexts/PlatformContext";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Save, 
  Palette, 
  Globe, 
  Share2, 
  Image as ImageIcon, 
  MapPin, 
  CreditCard, 
  Sparkles, 
  Loader2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { paymentService } from "@/services/payment";
import { toast } from "sonner";

// Modular Config Tabs
import { GeneralConfigTab } from "@/components/admin/config/GeneralConfigTab";
import { VisualIdentityTab } from "@/components/admin/config/VisualIdentityTab";
import { SocialLinksTab } from "@/components/admin/config/SocialLinksTab";
import { CitiesManagerTab } from "@/components/admin/config/CitiesManagerTab";
import { BannersManagerTab } from "@/components/admin/config/BannersManagerTab";
import { PaymentGatewaysTab } from "@/components/admin/config/PaymentGatewaysTab";
import { AIConfigTab } from "@/components/admin/config/AIConfigTab";

export default function AdminConfig() {
  const { config, refetch } = usePlatform();
  const [formData, setFormData] = useState(config);
  const [saving, setSaving] = useState(false);
  const [banners, setBanners] = useState<any[]>([]);
  const [bannersLoading, setBannersLoading] = useState(false);
  const [gateways, setGateways] = useState<any[]>([]);
  const [checkoutSettings, setCheckoutSettings] = useState<any>(null);
  const [gatewaysLoading, setGatewaysLoading] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState<string | null>(null);

  const fetchBanners = async () => {
    setBannersLoading(true);
    try {
      const { data } = await supabase
        .from("banners")
        .select("*")
        .order("sort_order");
      if (data) setBanners(data);
    } catch (err) {
      console.error("Erro ao buscar banners:", err);
    } finally {
      setBannersLoading(false);
    }
  };

  const fetchPaymentData = async () => {
    setGatewaysLoading(true);
    try {
      const gres = await supabase.from("payment_gateways").select("*");
      if (gres.data) setGateways(gres.data);
      
      const sres = await paymentService.getCheckoutSettings();
      setCheckoutSettings(sres);
    } catch (err) {
      console.error("Erro ao buscar dados de pagamento:", err);
    } finally {
      setGatewaysLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchPaymentData();
  }, []);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleFileUpload = async (file: File, bucket: string, path: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${path}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from(bucket)
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
      return null;
    }
  };

  const onLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingLogo(true);
    const file = e.target.files[0];
    const url = await handleFileUpload(file, 'platform-assets', 'logo');
    if (url) {
      setFormData(prev => ({ ...prev, platform_logo_url: url }));
      toast.success("Logotipo carregado com sucesso!");
    }
    setUploadingLogo(false);
  };

  const onBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>, bannerId: string, index: number) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setUploadingBanner(bannerId);
    const file = e.target.files[0];
    const url = await handleFileUpload(file, 'platform-assets', 'banner');
    if (url) {
      const updated = [...banners];
      updated[index].image_url = url;
      setBanners(updated);
      toast.success("Imagem do banner carregada!");
    }
    setUploadingBanner(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const platformUpdates = Object.entries(formData)
        .filter(([key]) => !['openrouter_api_key', 'default_model'].includes(key))
        .map(([key, value]) => ({
          key,
          value: String(value)
        }));

      // Salva configurações da plataforma
      for (const update of platformUpdates) {
        await supabase
          .from("platform_config")
          .upsert({ key: update.key, value: update.value }, { onConflict: "key" });
      }

      // Salva configurações de IA (OpenRouter)
      if (formData.openrouter_api_key || formData.default_model) {
        const { data: aiSettings } = await (supabase as any)
          .from("ai_settings")
          .select("id")
          .limit(1)
          .maybeSingle();

        const aiData = {
          openrouter_api_key: formData.openrouter_api_key,
          default_model: formData.default_model
        };

        if (aiSettings) {
          await (supabase as any)
            .from("ai_settings")
            .update(aiData)
            .eq("id", aiSettings.id);
        } else {
          await (supabase as any)
            .from("ai_settings")
            .insert([aiData]);
        }
      }

      // Salva banners
      for (let i = 0; i < banners.length; i++) {
        const b = banners[i];
        const bData = {
          image_url: b.image_url,
          title: b.title,
          sort_order: i + 1,
          active: true
        };
        if (b.isNew) {
          await supabase.from("banners").insert([bData]);
        } else {
          await supabase.from("banners").update(bData).eq("id", b.id);
        }
      }

      toast.success("Todas as configurações foram salvas com sucesso!");
      refetch();
      fetchBanners();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">Configurações da Plataforma</h1>
            <p className="text-slate-500 font-medium text-xs">Personalize a marca, cidades, cores, gateways e IA do seu Guia Comercial.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 px-8 h-12 rounded-xl font-bold bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="bg-slate-100 p-1.5 rounded-2xl mb-8 flex flex-wrap gap-1 h-auto">
            <TabsTrigger value="geral" className="gap-2 rounded-xl font-bold text-xs"><Globe className="h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-2 rounded-xl font-bold text-xs"><Palette className="h-4 w-4" /> Aparência</TabsTrigger>
            <TabsTrigger value="cidades" className="gap-2 rounded-xl font-bold text-xs"><MapPin className="h-4 w-4" /> Multi-Cidades</TabsTrigger>
            <TabsTrigger value="social" className="gap-2 rounded-xl font-bold text-xs"><Share2 className="h-4 w-4" /> Redes Sociais</TabsTrigger>
            <TabsTrigger value="banners" className="gap-2 rounded-xl font-bold text-xs"><ImageIcon className="h-4 w-4" /> Banners Hero</TabsTrigger>
            <TabsTrigger value="pagamentos" className="gap-2 rounded-xl font-bold text-xs"><CreditCard className="h-4 w-4" /> Gateways & Checkout</TabsTrigger>
            <TabsTrigger value="ia" className="gap-2 rounded-xl font-bold text-xs"><Sparkles className="h-4 w-4" /> Inteligência Artificial</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <GeneralConfigTab 
              formData={formData} 
              onChange={handleChange} 
              onLogoUpload={onLogoUpload} 
              uploadingLogo={uploadingLogo} 
            />
          </TabsContent>

          <TabsContent value="aparencia">
            <VisualIdentityTab 
              formData={formData} 
              onChange={handleChange} 
              setFormData={setFormData} 
            />
          </TabsContent>

          <TabsContent value="cidades">
            <CitiesManagerTab 
              formData={formData} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="social">
            <SocialLinksTab 
              formData={formData} 
              onChange={handleChange} 
            />
          </TabsContent>

          <TabsContent value="banners">
            <BannersManagerTab 
              formData={formData} 
              onChange={handleChange} 
              banners={banners} 
              setBanners={setBanners} 
              bannersLoading={bannersLoading} 
              onBannerUpload={onBannerUpload} 
              uploadingBanner={uploadingBanner} 
            />
          </TabsContent>

          <TabsContent value="pagamentos">
            <PaymentGatewaysTab 
              gateways={gateways} 
              setGateways={setGateways} 
              checkoutSettings={checkoutSettings} 
              setCheckoutSettings={setCheckoutSettings} 
              refetchPaymentData={fetchPaymentData} 
            />
          </TabsContent>

          <TabsContent value="ia">
            <AIConfigTab 
              formData={formData} 
              onChange={handleChange} 
              saving={saving} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
