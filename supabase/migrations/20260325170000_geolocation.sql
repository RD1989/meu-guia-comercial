-- 🗺️ Migration: Geolocation Support
-- Adiciona suporte a coordenadas para cálculo de proximidade

-- 1. Novas colunas na tabela businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS latitude FLOAT,
ADD COLUMN IF NOT EXISTS longitude FLOAT;

-- 2. Função SQL para calcular distância entre dois pontos (Haversine Formula)
-- Retorna a distância em quilômetros
CREATE OR REPLACE FUNCTION public.calculate_distance(
  lat1 FLOAT, lon1 FLOAT, 
  lat2 FLOAT, lon2 FLOAT
) 
RETURNS FLOAT AS $$
DECLARE                                                     
  dist FLOAT = 0;          
  rad_lat1 FLOAT; rad_lat2 FLOAT;
  theta FLOAT; rad_theta FLOAT;
BEGIN
  IF lat1 IS NULL OR lon1 IS NULL OR lat2 IS NULL OR lon2 IS NULL THEN
    RETURN NULL;
  END IF;

  rad_lat1 := pi() * lat1 / 180;
  rad_lat2 := pi() * lat2 / 180;
  theta := lon1 - lon2;
  rad_theta := pi() * theta / 180;
  
  dist := sin(rad_lat1) * sin(rad_lat2) + cos(rad_lat1) * cos(rad_lat2) * cos(rad_theta);
  
  IF dist > 1 THEN dist := 1; END IF;
  
  dist := acos(dist);
  dist := dist * 180 / pi();
  dist := dist * 60 * 1.1515;
  dist := dist * 1.609344; -- Converter milhas para KM
  
  RETURN dist;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 3. Atualizar o cálculo do Performance Score para incluir Proximidade (Opcional no SQL)
-- Nota: A proximidade é dinâmica por usuário, então o score base não a inclui, 
-- mas a query de busca usará a função calculate_distance para ordenar.
