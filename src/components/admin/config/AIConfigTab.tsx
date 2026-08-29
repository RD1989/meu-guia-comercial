import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Sparkles, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AIConfigTabProps {
  formData: any;
  onChange: (e: any) => void;
  saving: boolean;
}

export function AIConfigTab({ formData, onChange, saving }: AIConfigTabProps) {
  const handleTestConnection = async () => {
    if (!formData.openrouter_api_key) {
      toast.error("Informe a chave da OpenRouter antes de testar.");
      return;
    }

    toast.info("Testando conexão com a API de IA...");
    try {
      const { data, error } = await supabase.functions.invoke("autopilot-engine", {
        body: { 
          test: true,
          key: formData.openrouter_api_key 
        }
      });
      if (error) throw error;
      toast.success("Conexão com a IA estabelecida com sucesso!");
    } catch (err: any) {
      toast.error("Falha na conexão: " + err.message);
    }
  };

  return (
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
              value={formData.openrouter_api_key || ""} 
              onChange={onChange} 
              placeholder="sk-or-v1-..." 
              className="bg-slate-50 font-mono text-xs"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="default_model">Modelo Cognitivo Padrão</Label>
            <Input 
              id="default_model" 
              value={formData.default_model || "openai/gpt-4o-mini"} 
              onChange={onChange} 
              placeholder="Ex: openai/gpt-4o-mini"
              className="bg-slate-50 font-mono text-xs"
            />
          </div>
          <div className="p-4 bg-primary/5 rounded-2xl border border-primary/10 flex items-start gap-3 mt-4">
            <HelpCircle className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <p className="text-xs text-slate-500 leading-relaxed">
              Esta chave é utilizada pelo Concierge da Home e pelo piloto automático de postagens no Blog.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="border-none shadow-sm bg-white">
        <CardHeader>
          <CardTitle>Status dos Serviços de IA</CardTitle>
          <CardDescription>Verifique se os serviços cognitivos estão operacionais.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className={`h-3 w-3 rounded-full ${formData.openrouter_api_key ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
              <span className="text-xs font-bold text-slate-800">OpenRouter API</span>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-xs h-9 rounded-xl font-bold" 
              disabled={!formData.openrouter_api_key || saving}
              onClick={handleTestConnection}
            >
              Testar Conexão
            </Button>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Recursos Habilitados</p>
            <div className="grid grid-cols-2 gap-2">
              {['Blog Autônomo', 'Concierge IA', 'Otimizador SEO', 'Classificador'].map(feature => (
                <div key={feature} className="p-3 border border-slate-100 rounded-xl text-xs flex items-center gap-2 text-slate-600 bg-slate-50/50">
                  <div className="h-2 w-2 rounded-full bg-primary" /> {feature}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
