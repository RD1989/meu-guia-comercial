import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, RefreshCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AICompanyOptimizerProps {
  businessName: string;
  currentDescription: string;
  onSelect: (newDescription: string) => void;
}

export const AICompanyOptimizer = ({ businessName, currentDescription, onSelect }: AICompanyOptimizerProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<string | null>(null);

  const handleOptimize = async () => {
    if (!businessName) {
      toast.error("Por favor, informe o nome da empresa primeiro.");
      return;
    }

    setIsLoading(true);
    try {
      // Usaremos a Edge Function 'generate-article' ou similar, adaptada para descrições
      // Por enquanto, faremos o fetch direto para o OpenRouter via Edge Function se disponível
      // Caso contrário, simularemos ou usaremos um prompt de sistema via generate-article
      
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { 
          prompt: `Melhore a descrição comercial da empresa "${businessName}". 
                   Descrição atual: "${currentDescription}". 
                   O objetivo é torná-la atraente, profissional e focada em conversão para um guia comercial local. 
                   Responda APENAS com o texto da nova descrição, sem introduções.`,
          isShortDescription: true 
        }
      });

      if (error) throw error;
      
      setSuggestion(data.content);
      toast.success("Sugestão de IA gerada com sucesso!");
    } catch (error) {
      console.error("Erro na IA:", error);
      toast.error("Erro ao gerar sugestão da IA.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4 p-4 rounded-xl border border-primary/20 bg-primary/5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-bold text-slate-700">Otimizador de Descrição IA</span>
        </div>
        {!suggestion ? (
          <Button 
            size="sm" 
            onClick={handleOptimize} 
            disabled={isLoading}
            className="gap-2 shadow-sm"
          >
            {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
            Otimizar com IA
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="ghost"
            onClick={() => setSuggestion(null)} 
            className="text-slate-500 hover:text-primary transition-colors h-8 w-8 p-0"
          >
            <RefreshCcw className="h-4 w-4" />
          </Button>
        )}
      </div>

      {suggestion && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="p-3 bg-white rounded-lg border border-primary/10 text-sm text-slate-600 italic leading-relaxed">
            {suggestion}
          </div>
          <div className="flex justify-end gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => onSelect(suggestion)}
              className="gap-2 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              <Check className="h-3.5 w-3.5" /> Usar esta sugestão
            </Button>
          </div>
        </div>
      )}
      
      {!suggestion && !isLoading && (
        <p className="text-[10px] text-slate-400">
          Nossa IA gera textos persuasivos baseados no nome e descrição atual.
        </p>
      )}
    </div>
  );
};
