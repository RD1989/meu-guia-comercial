import { useState, useEffect } from "react";

interface UserLocation {
  lat: number;
  lng: number;
  city?: string;
  region?: string;
  loading: boolean;
  error: string | null;
}

export function useLocation() {
  const [location, setLocation] = useState<UserLocation>({
    lat: 0,
    lng: 0,
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        // Tentativa 1: IP-API (Gratuito, sem chave, mas HTTP por padrão - pode precisar de proxy ou https://ipapi.co)
        const response = await fetch("https://ipapi.co/json/");
        const data = await response.json();

        if (data.latitude && data.longitude) {
          setLocation({
            lat: data.latitude,
            lng: data.longitude,
            city: data.city,
            region: data.region,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Não foi possível detectar a localização pelo IP.");
        }
      } catch (err) {
        console.error("Erro na geolocalização por IP:", err);
        setLocation(prev => ({ ...prev, loading: false, error: "Falha ao obter localização." }));
      }
    };

    fetchLocation();
  }, []);

  return location;
}
