import { useState, useEffect, useCallback } from "react";

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  loading: boolean;
  error: string | null;
  source?: "ip" | "browser" | "cache";
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>(() => {
    // Tenta carregar do cache para resposta imediata
    const cached = localStorage.getItem("user_location_cache");
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        return { ...parsed, loading: false, source: "cache" };
      } catch (e) {
        // ignore
      }
    }
    return {
      lat: 0,
      lng: 0,
      loading: true,
      error: null,
    };
  });

  const detectLocation = useCallback(async (forceBrowser = false) => {
    setLocation(prev => ({ ...prev, loading: true, error: null }));

    // 1. Tenta Browser Geolocation (Mais preciso) se solicitado ou se IP falhar
    if (forceBrowser && navigator.geolocation) {
      try {
        const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
        });

        const newLoc: UserLocation = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          loading: false,
          error: null,
          source: "browser"
        };

        // Tenta reverter lat/lng para cidade via API reversa básica ou mantém lat/lng
        setLocation(newLoc);
        localStorage.setItem("user_location_cache", JSON.stringify(newLoc));
        return;
      } catch (err) {
        console.warn("Navegador negou ou falhou na geolocalização:", err);
      }
    }

    // 2. Fallback: IP API (ipapi.co)
    try {
      const response = await fetch("https://ipapi.co/json/");
      if (!response.ok) throw new Error("API de IP indisponível");
      
      const data = await response.json();
      if (data && data.latitude && data.longitude) {
        const newLoc: UserLocation = {
          lat: data.latitude,
          lng: data.longitude,
          city: data.city,
          region: data.region,
          loading: false,
          error: null,
          source: "ip"
        };
        setLocation(newLoc);
        localStorage.setItem("user_location_cache", JSON.stringify(newLoc));
      } else {
        throw new Error("Dados de IP incompletos");
      }
    } catch (err) {
      console.error("Todas as tentativas de geolocalização falharam:", err);
      setLocation({ 
        lat: 0, 
        lng: 0, 
        loading: false, 
        error: "Não foi possível detectar sua localização.",
        source: undefined
      });
    }
  }, []);

  useEffect(() => {
    // Se não temos cache ou se o cache está vazio (0,0), detecta via IP
    if (location.lat === 0) {
      detectLocation();
    } else {
      // Se veio do cache, ainda assim marca como não carregando
      setLocation(prev => ({ ...prev, loading: false }));
    }
  }, [detectLocation, location.lat]);

  return { ...location, refetch: detectLocation };
}
