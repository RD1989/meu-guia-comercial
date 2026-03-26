import { AdminLayout } from "@/components/admin/AdminLayout";
import { usePlatform } from "@/contexts/PlatformContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Palette, Globe, HelpCircle, Share2, Upload, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function AdminConfig() {
  const { config, refetch } = usePlatform();
  const [formData, setFormData] = useState(config);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFormData(config);
  }, [config]);

  const handleChange = (e: any) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
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

      toast.success("Configurações salvas com sucesso!");
      refetch();
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Configurações da Plataforma</h1>
            <p className="text-slate-500">Personalize a identidade visual e informações básicas do seu Guia Comercial.</p>
          </div>
          <Button onClick={handleSave} disabled={saving} className="gap-2 px-6">
            <Save className="h-4 w-4" /> {saving ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>

        <Tabs defaultValue="geral" className="w-full">
          <TabsList className="bg-white border p-1 rounded-lg mb-6">
            <TabsTrigger value="geral" className="gap-2"><Globe className="h-4 w-4" /> Geral</TabsTrigger>
            <TabsTrigger value="aparencia" className="gap-2"><Palette className="h-4 w-4" /> Aparência</TabsTrigger>
            <TabsTrigger value="social" className="gap-2"><Share2 className="h-4 w-4" /> Redes Sociais</TabsTrigger>
            <TabsTrigger value="ia" className="gap-2"><Sparkles className="h-4 w-4" /> Inteligência Artificial</TabsTrigger>
          </TabsList>

          <TabsContent value="geral">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Identidade do Sistema</CardTitle>
                  <CardDescription>Nome e descrições principais para o SEO.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform_name">Nome da Plataforma</Label>
                    <Input id="platform_name" value={formData.platform_name} onChange={handleChange} placeholder="Ex: Guia Local Pro" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="platform_description">Descrição (Slogan)</Label>
                    <Textarea id="platform_description" value={formData.platform_description} onChange={handleChange} rows={3} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="platform_city">Cidade</Label>
                      <Input id="platform_city" value={formData.platform_city} onChange={handleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="platform_state">Estado</Label>
                      <Input id="platform_state" value={formData.platform_state} onChange={handleChange} />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Logotipo e Favicon</CardTitle>
                  <CardDescription>Upload de imagens para a marca.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="platform_logo_url">URL do Logotipo</Label>
                    <div className="flex gap-2">
                      <Input id="platform_logo_url" value={formData.platform_logo_url} onChange={handleChange} placeholder="https://..." />
                      <Button variant="outline" size="icon" title="Upload em breve"><Upload className="h-4 w-4" /></Button>
                    </div>
                  </div>
                  <div className="h-40 w-full border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center bg-slate-50 overflow-hidden">
                    {formData.platform_logo_url ? (
                      <img src={formData.platform_logo_url} alt="Preview Logo" className="max-h-32 object-contain" />
                    ) : (
                      <div className="text-center">
                        <HelpCircle className="h-8 w-8 text-slate-300 mx-auto" />
                        <p className="text-xs text-slate-400 mt-2">Preview da Logo</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="aparencia">
            <Card className="border-none shadow-sm bg-white max-w-xl">
              <CardHeader>
                <CardTitle>Cores do Sistema</CardTitle>
                <CardDescription>Define a cor primária que será usada em botões e destaques.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-6">
                  <div 
                    className="h-20 w-20 rounded-2xl shadow-inner border border-white"
                    style={{ backgroundColor: formData.platform_primary_color }}
                  ></div>
                  <div className="flex-1 space-y-2">
                    <Label htmlFor="platform_primary_color">Cor Primária (HEX)</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="platform_primary_color" 
                        value={formData.platform_primary_color} 
                        onChange={handleChange}
                        placeholder="#2563eb"
                      />
                      <input 
                        type="color" 
                        value={formData.platform_primary_color} 
                        onChange={(e) => setFormData(prev => ({ ...prev, platform_primary_color: e.target.value }))}
                        className="h-10 w-12 rounded border cursor-pointer p-0"
                      />
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg text-xs text-slate-500 border border-slate-100 italic">
                  * A alteração da cor será aplicada globalmente no portal público imediatamente após salvar.
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="social">
            <Card className="border-none shadow-sm bg-white max-w-2xl">
              <CardHeader>
                <CardTitle>Contatos e Redes Sociais</CardTitle>
                <CardDescription>Links que aparecerão no rodapé e páginas de contato.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="platform_whatsapp">WhatsApp (com DDD)</Label>
                  <Input id="platform_whatsapp" value={formData.platform_whatsapp} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_email">E-mail de Contato</Label>
                  <Input id="platform_email" value={formData.platform_email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_instagram">Instagram (URL)</Label>
                  <Input id="platform_instagram" value={formData.platform_instagram} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform_facebook">Facebook (URL)</Label>
                  <Input id="platform_facebook" value={formData.platform_facebook} onChange={handleChange} />
                </div>
                <div className="col-span-full space-y-2">
                  <Label htmlFor="platform_footer_text">Texto do Rodapé</Label>
                  <Input id="platform_footer_text" value={formData.platform_footer_text} onChange={handleChange} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="ia">
            <div className="grid gap-6 md:grid-cols-2">
              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-primary" /> Coração de IA (OpenRouter)
                  </CardTitle>
                  <CardDescription>Configure a inteligência que processa o blog, concierge e automações.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="openrouter_api_key">Chave de API OpenRouter</Label>
                    <Input 
                      id="openrouter_api_key" 
                      type="password"
                      value={formData.openrouter_api_key} 
                      onChange={handleChange} 
                      placeholder="sk-or-v1-..." 
                      className="bg-slate-50 border-none"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default_model">Modelo Cognitivo Padrão</Label>
                    <Input 
                      id="default_model" 
                      value={formData.default_model || "openai/gpt-4o-mini"} 
                      onChange={handleChange} 
                      placeholder="Ex: openai/gpt-4o-mini"
                      className="bg-slate-50 border-none"
                    />
                  </div>
                  <div className="p-4 bg-primary/5 rounded-lg border border-primary/10 flex items-start gap-3 mt-4">
                    <HelpCircle className="h-4 w-4 text-primary mt-0.5" />
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Esta chave é utilizada em todo o ecossistema. Certifique-se de ter saldo no OpenRouter para garantir o funcionamento do Concierge e da Automação de Blog.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardHeader>
                  <CardTitle>Status da Inteligência</CardTitle>
                  <CardDescription>Verifique se os serviços de IA estão operacionais.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`h-3 w-3 rounded-full ${formData.openrouter_api_key ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                      <span className="text-sm font-bold text-slate-700">OpenRouter API</span>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-[10px] h-8 font-bold uppercase tracking-wider" 
                      disabled={!formData.openrouter_api_key || saving}
                      onClick={async () => {
                        toast.info("Testando conexão...");
                        try {
                          const { data, error } = await supabase.functions.invoke("test-openrouter", {
                            body: { key: formData.openrouter_api_key }
                          });
                          if (error) throw error;
                          toast.success("Conexão estabelecida com sucesso!");
                        } catch (err: any) {
                          toast.error("Falha na conexão: " + err.message);
                        }
                      }}
                    >
                      Testar Conexão
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-slate-400 uppercase">Aplicações Ativas</p>
                    <div className="grid grid-cols-2 gap-2">
                      {['Blog Autônomo', 'Concierge IA', 'Otimizador SEO', 'Classificador'].map(feature => (
                        <div key={feature} className="p-2 border border-slate-100 rounded-lg text-[10px] flex items-center gap-2 text-slate-500">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" /> {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
