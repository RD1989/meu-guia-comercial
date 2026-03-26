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
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("Falha na resposta da API de geolocalização");
        
        const data = await response.json();
        if (data && data.latitude && data.longitude) {
          setLocation({
            lat: data.latitude,
            lng: data.longitude,
            city: data.city,
            region: data.region,
            loading: false,
            error: null,
          });
        } else {
          throw new Error("Dados de localização incompletos");
        }
      } catch (err) {
        console.error("Erro na geolocalização por IP:", err);
        setLocation(prev => ({ 
          ...prev, 
          loading: false, 
          error: "Não foi possível detectar sua localização automaticamente." 
        }));
      }
    };

    fetchLocation();
  }, []);

  return location;
}
