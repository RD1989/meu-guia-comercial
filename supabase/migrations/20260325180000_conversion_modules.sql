-- 🛒 📅 Migration: Conversion Modules (Menu & Booking)

-- 1. Extensão da tabela businesses para filtros de módulo
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS has_menu BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS has_booking BOOLEAN DEFAULT FALSE;

-- 2. Tabela de Serviços para Agendamento
CREATE TABLE IF NOT EXISTS public.business_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2),
  duration_minutes INTEGER DEFAULT 30,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Melhorias na tabela de produtos para o Cardápio
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Geral',
ADD COLUMN IF NOT EXISTS is_available BOOLEAN DEFAULT TRUE;

-- 4. RLS para business_services
ALTER TABLE public.business_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Serviços são públicos" 
ON public.business_services FOR SELECT 
USING (true);

CREATE POLICY "Dono pode gerenciar seus serviços" 
ON public.business_services FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.businesses 
    WHERE id = business_id AND owner_id = auth.uid()
  )
);

-- Habilitar Realtime
alter publication supabase_realtime add table business_services;
