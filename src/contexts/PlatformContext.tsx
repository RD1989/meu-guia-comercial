import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { hexToHsl } from "@/lib/utils";

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
  platform_cities: string;
  openrouter_api_key: string;
  default_model: string;
  banner_interval: number;
}

const defaultConfig: PlatformConfig = {
  platform_name: "Meu Guia Comercial",
  platform_city: "São Paulo",
  platform_cities: "São Paulo, Campinas, Santos, Sorocaba",
  platform_state: "SP",
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
  banner_interval: 5,
};

interface PlatformContextType {
  config: PlatformConfig;
  loading: boolean;
  currentCity: string;
  setCurrentCity: (city: string) => void;
  availableCities: string[];
  refetch: () => void;
}

const PlatformContext = createContext<PlatformContextType | undefined>(undefined);

const LOCAL_STORAGE_CITY_KEY = "guia_selected_city";

export function PlatformProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<PlatformConfig>(defaultConfig);
  const [loading, setLoading] = useState(true);
  const [currentCity, setCurrentCityState] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem(LOCAL_STORAGE_CITY_KEY) || "";
    }
    return "";
  });
  const [dbCities, setDbCities] = useState<string[]>([]);

  const setCurrentCity = (city: string) => {
    setCurrentCityState(city);
    if (typeof window !== "undefined") {
      if (city) {
        localStorage.setItem(LOCAL_STORAGE_CITY_KEY, city);
      } else {
        localStorage.removeItem(LOCAL_STORAGE_CITY_KEY);
      }
    }
  };

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("platform_config")
        .select("key, value");

      if (error) {
        console.warn("Tabela platform_config não encontrada ou erro de permissão:", error.message);
      }

      const configObj: any = {};
      if (data && data.length > 0) {
        data.forEach(({ key, value }) => {
          configObj[key] = value || "";
        });
      }

      // Merge with defaultConfig to ensure a working state
      const finalConfig = { ...defaultConfig, ...configObj };
      setConfig(finalConfig);

      // Se nenhuma cidade estiver no localStorage, usa a cidade padrão da plataforma
      if (!localStorage.getItem(LOCAL_STORAGE_CITY_KEY) && finalConfig.platform_city) {
        setCurrentCityState(finalConfig.platform_city);
      }

      // Apply primary color as CSS variables
      const color = configObj.platform_primary_color || defaultConfig.platform_primary_color;
      document.documentElement.style.setProperty("--platform-primary", color);
      const hslTriplet = hexToHsl(color);
      document.documentElement.style.setProperty("--primary", hslTriplet);
      document.documentElement.style.setProperty("--ring", hslTriplet);

      // Buscar cidades com empresas ativas
      const { data: businessCities } = await supabase
        .from("businesses")
        .select("city")
        .eq("active", true)
        .not("city", "is", null);

      if (businessCities) {
        const unique = Array.from(
          new Set(businessCities.map((b: any) => b.city?.trim()).filter(Boolean))
        ) as string[];
        setDbCities(unique);
      }
    } catch (err) {
      console.error("Erro ao carregar configurações públicas da plataforma:", err);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  // Combina cidades configuradas no admin com as cidades com negócios ativos
  const configuredCities = (config.platform_cities || "")
    .split(",")
    .map(c => c.trim())
    .filter(Boolean);

  const availableCities = Array.from(
    new Set([...configuredCities, ...dbCities, config.platform_city].filter(Boolean))
  );

  return (
    <PlatformContext.Provider value={{ 
      config, 
      loading, 
      currentCity: currentCity || config.platform_city,
      setCurrentCity,
      availableCities,
      refetch: fetchConfig 
    }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const context = useContext(PlatformContext);
  if (!context) throw new Error("usePlatform must be used within PlatformProvider");
  return context;
}

