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
      const configObj = data.reduce((acc, { key, value }) => {
        acc[key as keyof PlatformConfig] = value || "";
        return acc;
      }, {} as Partial<PlatformConfig>);

      setConfig({ ...defaultConfig, ...configObj });

      // Apply primary color as CSS variable
      const color = configObj.platform_primary_color || defaultConfig.platform_primary_color;
      document.documentElement.style.setProperty("--platform-primary", color);
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
