import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { 
  Sparkles, 
  Save, 
  Key, 
  Bot, 
  Type, 
  Clock, 
  Activity, 
  Target, 
  BarChart,
  Zap
} from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

export default function AdminIAConfig() {
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);

  const { data: aiSettings, isLoading } = useQuery({
    queryKey: ["admin-ai-settings"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ai_settings")
        .select("*")
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    }
  });

  const [formData, setFormData] = useState({
    openrouter_api_key: "",
    default_model: "openai/gpt-4o-mini",
    tone_of_voice: "informativo e amigável",
    target_city: "",
    article_prompt_template: "",
    auto_generate_image: false,
    automation_enabled: false,
    posts_per_day: 3,
    autopilot_interval_minutes: 480,
    target_focus: "MIXED"
  });

  useEffect(() => {
    if (aiSettings) {
      setFormData({
        openrouter_api_key: aiSettings.openrouter_api_key || "",
        default_model: aiSettings.default_model || "openai/gpt-4o-mini",
        tone_of_voice: aiSettings.tone_of_voice || "informativo e amigável",
        target_city: aiSettings.target_city || "",
        article_prompt_template: aiSettings.article_prompt_template || "",
        auto_generate_image: aiSettings.auto_generate_image || false,
        automation_enabled: aiSettings.autopilot_enabled || false,
        posts_per_day: aiSettings.posts_per_day || 3,
        autopilot_interval_minutes: aiSettings.autopilot_interval_minutes || 480,
        target_focus: aiSettings.target_focus || "MIXED"
      });
    }
  }, [aiSettings]);

  const saveMutation = useMutation({
    mutationFn: async (newData: any) => {
      setSaving(true);
      // Mapear para os nomes das colunas no banco
      const dbData = {
        ...newData,
        autopilot_enabled: newData.automation_enabled
      };
      delete dbData.automation_enabled;

      const { error } = await (supabase as any)
        .from("ai_settings")
        .update(dbData)
        .eq("id", (aiSettings as any)?.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-settings"] });
      toast.success("Configurações de IA salvas!");
    },
    onError: (err) => {
      toast.error("Erro ao salvar: " + err.message);
    },
    onSettled: () => setSaving(false)
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Sparkles className="h-7 w-7 text-primary" />
              </div>
              Centro de Comando IA
            </h1>
            <p className="text-slate-500 mt-1">Gerencie o cérebro autônomo do seu portal comercial.</p>
          </div>
          <Button onClick={() => saveMutation.mutate(formData)} disabled={saving} className="gap-2 px-8 h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all active:scale-95">
            <Save className="h-5 w-5" /> {saving ? "Processando..." : "Salvar Configurações"}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Card de API */}
          <Card className="border-none shadow-sm bg-white md:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Key className="h-5 w-5 text-slate-400" /> Acesso à Inteligência
              </CardTitle>
              <CardDescription>Conexão via OpenRouter Engine</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="openrouter_api_key" className="text-xs font-bold uppercase text-slate-400">Chave OpenRouter</Label>
                <Input 
                  id="openrouter_api_key" 
                  type="password"
                  value={formData.openrouter_api_key} 
                  onChange={(e) => setFormData(p => ({...p, openrouter_api_key: e.target.value}))}
                  placeholder="sk-or-v1-..." 
                  className="bg-slate-50 border-none h-11"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Modelo Cognitivo</Label>
                <Select 
                  value={formData.default_model} 
                  onValueChange={(val) => setFormData(p => ({...p, default_model: val}))}
                >
                  <SelectTrigger className="bg-slate-50 border-none h-11">
                    <SelectValue placeholder="Selecione o modelo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini (Ultra Rápido)</SelectItem>
                    <SelectItem value="openai/gpt-4o">GPT-4o (Alta Precisão)</SelectItem>
                    <SelectItem value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</SelectItem>
                    <SelectItem value="meta-llama/llama-3.1-70b">Llama 3.1 70B</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Card de Autopiloto Pro */}
          <Card className="border-none shadow-xl bg-slate-900 text-white md:col-span-2 overflow-hidden relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Zap className="h-32 w-32 text-primary" />
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl font-black">
                    <Bot className="h-6 w-6 text-primary" /> Modo Autopilot Pro
                  </CardTitle>
                  <CardDescription className="text-slate-400">O robô que mantém seu portal vivo 24/7</CardDescription>
                </div>
                <Switch 
                  checked={formData.automation_enabled}
                  onCheckedChange={(val) => setFormData(p => ({...p, automation_enabled: val}))}
                  className="data-[state=checked]:bg-primary"
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-8 pt-4">
              <div className="grid gap-8 md:grid-cols-2">
                {/* Sliders de Frequência */}
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <BarChart className="h-4 w-4 text-primary" /> Posts por Dia
                      </Label>
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {formData.posts_per_day} artigos
                      </span>
                    </div>
                    <Slider 
                      value={[formData.posts_per_day]} 
                      onValueChange={([val]) => setFormData(p => ({...p, posts_per_day: val}))}
                      max={12} 
                      min={1} 
                      step={1}
                      disabled={!formData.automation_enabled}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-sm font-bold flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" /> Intervalo (Minutos)
                      </Label>
                      <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        {formData.autopilot_interval_minutes} min
                      </span>
                    </div>
                    <Slider 
                      value={[formData.autopilot_interval_minutes]} 
                      onValueChange={([val]) => setFormData(p => ({...p, autopilot_interval_minutes: val}))}
                      max={1440} 
                      min={30} 
                      step={30}
                      disabled={!formData.automation_enabled}
                    />
                  </div>
                </div>

                {/* Seletor de Foco */}
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold flex items-center gap-2">
                      <Target className="h-4 w-4 text-primary" /> Foco do Algoritmo
                    </Label>
                    <div className="grid grid-cols-1 gap-2">
                      {[
                        { id: 'MIXED', label: 'Híbrido (Notícias + Lojistas)', desc: 'Equilíbrio total.' },
                        { id: 'NEWS_ONLY', label: 'Apenas Notícias', desc: 'Foco em tráfego orgânico.' },
                        { id: 'BUSINESS_ONLY', label: 'Marketing de Lojistas', desc: 'Promover empresas cadastradas.' }
                      ].map((opt) => (
                        <div 
                          key={opt.id}
                          onClick={() => formData.automation_enabled && setFormData(p => ({...p, target_focus: opt.id}))}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            formData.target_focus === opt.id 
                            ? 'bg-primary border-primary text-white shadow-lg' 
                            : 'bg-slate-800/50 border-slate-700 text-slate-400 hover:border-slate-500'
                          } ${!formData.automation_enabled && 'opacity-50 cursor-not-allowed'}`}
                        >
                          <p className="text-xs font-bold">{opt.label}</p>
                          <p className="text-[10px] opacity-70 mt-1">{opt.desc}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3">
                <Activity className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  <strong className="text-slate-200">Visão do Robô:</strong> Atualmente configurado para criar <span className="text-primary font-bold">{formData.posts_per_day} posts</span> diários focando em <span className="text-primary font-bold">{formData.target_focus === 'MIXED' ? 'estratégia híbrida' : formData.target_focus}</span>. O cérebro lerá todas as descrições dos lojistas e portais de notícias para gerar conteúdo relevante 100% original.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Identidade */}
          <Card className="border-none shadow-sm bg-white md:col-span-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg font-bold">
                <Type className="h-5 w-5 text-slate-400" /> Personalidade do Portal
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="target_city" className="text-xs font-bold uppercase text-slate-400">Cidade Alvo</Label>
                  <Input 
                    id="target_city" 
                    value={formData.target_city} 
                    onChange={(e) => setFormData(p => ({...p, target_city: e.target.value}))}
                    placeholder="Ex: São Paulo, Rio Verde..." 
                    className="bg-slate-50 border-none h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tone_of_voice" className="text-xs font-bold uppercase text-slate-400">Tom de Voz da IA</Label>
                  <Input 
                    id="tone_of_voice" 
                    value={formData.tone_of_voice} 
                    onChange={(e) => setFormData(p => ({...p, tone_of_voice: e.target.value}))}
                    placeholder="Ex: Informativo, Vendedor, Amigável..." 
                    className="bg-slate-50 border-none h-11"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase text-slate-400">Instruções Mestre (Prompt Template)</Label>
                <Textarea 
                  value={formData.article_prompt_template} 
                  onChange={(e) => setFormData(p => ({...p, article_prompt_template: e.target.value}))}
                  className="bg-slate-50 border-none min-h-[120px] font-mono text-xs p-4"
                  placeholder="Escreva as diretrizes que a IA deve seguir para todo artigo..."
                />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
