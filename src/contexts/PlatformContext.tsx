import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";

interface PlatformConfig {
  platform_name: string;
  platform_city: string;
  platform_state: string;
  platform_logo_url: string;
  platform_primary_color: string;
  platform_description: string;
  platform_whatsapp: string;
  platform_instagram: string;
  platform_facebook: string;
  platform_email: string;
  platform_footer_text: string;
  openrouter_api_key: string;
  default_model: string;
}

const defaultConfig: PlatformConfig = {
  platform_name: "Meu Guia Comercial",
  platform_city: "Sua Cidade",
  platform_state: "Estado",
  platform_logo_url: "",
  platform_primary_color: "#2563eb",
  platform_description: "O guia comercial mais completo da cidade",
  platform_whatsapp: "",
  platform_instagram: "",
  platform_facebook: "",
  platform_email: "",
  platform_footer_text: "© 2026 Meu Guia Comercial. Todos os direitos reservados.",
  openrouter_api_key: "",
  default_model: "openai/gpt-4o-mini",
};

interface PlatformContextType {
  config: PlatformConfig;
  loading: boolean;
  refetch: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PlatformConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);

  const fetchConfig = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("platform_config")
      .select("key, value");

    if (data && data.length > 0) {
      const configObj: any = {};
      data.forEach(({ key, value }) => {
        configObj[key] = value || "";
      });

      setConfig({ ...defaultConfig, ...configObj });

      // Apply primary color as CSS variable
      const color = configObj.platform_primary_color || defaultConfig.platform_primary_color;
      document.documentElement.style.setProperty("--platform-primary", color);

      // Fetch AI settings
      const { data: aiData } = await (supabase as any)
        .from("ai_settings")
        .select("openrouter_api_key, default_model")
        .maybeSingle();
      
      if (aiData) {
        setConfig(prev => ({ 
          ...prev, 
          ...configObj,
          openrouter_api_key: aiData.openrouter_api_key || "",
          default_model: aiData.default_model || "openai/gpt-4o-mini"
        }));
      } else {
        setConfig({ ...defaultConfig, ...configObj });
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  return (
    <PlatformContext.Provider value={{ config, loading, refetch: fetchConfig }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
}
