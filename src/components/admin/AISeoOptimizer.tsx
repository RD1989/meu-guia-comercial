import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Check, Wand2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AISeoOptimizerProps {
  businessName: string;
  businessDescription: string;
  onSelect: (seo: { title: string; description: string; keywords: string }) => void;
}

export const AISeoOptimizer = ({ businessName, businessDescription, onSelect }: AISeoOptimizerProps) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleOptimize = async () => {
    if (!businessName || !businessDescription) {
      toast.error("Preencha o nome e a descrição da empresa primeiro.");
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { 
          prompt: `Gere metadados de SEO para a empresa "${businessName}". 
                   Contexto: "${businessDescription}". 
                   Retorne um JSON com os campos: title (max 60 chars), description (max 160 chars), keywords (string separada por vírgula).
                   Não adicione explicações, apenas o JSON bruto.`,
          isSeoMode: true 
        }
      });

      if (error) throw error;
      
      // Tentar parsear o JSON se vier como string
      let seoData = data;
      if (typeof data === 'string') {
        try {
          seoData = JSON.parse(data.replace(/```json|```/g, "").trim());
        } catch (e) {
          console.error("Erro ao parsear SEO JSON:", e);
        }
      }
      
      if (seoData.title && seoData.description) {
        onSelect({
          title: seoData.title,
          description: seoData.description,
          keywords: seoData.keywords || seoData.suggested_tags?.join(", ") || ""
        });
        toast.success("SEO otimizado com sucesso!");
      }

    } catch (error) {
      console.error("Erro na IA SEO:", error);
      toast.error("Erro ao gerar metadados de SEO.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      type="button"
      size="sm" 
      variant="outline"
      onClick={handleOptimize} 
      disabled={isLoading}
      className="gap-2 border-primary/30 text-primary hover:bg-primary/5 shadow-none h-8 text-[10px] font-bold"
    >
      {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : <Wand2 className="h-3 w-3" />}
      Sugestão Mágica IA
    </Button>
  );
};
