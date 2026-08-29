-- =========================================================
-- subscription_plans: Tabela oficial de planos do SaaS
-- =========================================================
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  tier TEXT NOT NULL DEFAULT 'PRO' CHECK (tier IN ('FREE', 'PRO', 'MAX')),
  description TEXT,
  monthly_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  annual_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  features TEXT[] NOT NULL DEFAULT '{}',
  max_photos INTEGER NOT NULL DEFAULT 5,
  max_products INTEGER NOT NULL DEFAULT 10,
  has_ai BOOLEAN NOT NULL DEFAULT false,
  has_menu BOOLEAN NOT NULL DEFAULT false,
  has_booking BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode consultar planos ativos
CREATE POLICY "Anyone can read active subscription plans" ON public.subscription_plans
  FOR SELECT USING (true);

-- Apenas administradores e superadmins podem criar e editar planos
CREATE POLICY "Admin can manage subscription plans" ON public.subscription_plans
  FOR ALL USING (public.is_admin(auth.uid()));

-- Seed inicial de planos
INSERT INTO public.subscription_plans (name, slug, tier, description, monthly_price, annual_price, features, max_photos, max_products, has_ai, has_menu, has_booking, is_featured, sort_order) VALUES
  (
    'Gratuito', 
    'free', 
    'FREE', 
    'Para pequenos negócios locais começando no digital', 
    0.00, 
    0.00, 
    ARRAY['Perfil Básico', '1 Foto de Capa', 'Endereço e WhatsApp', 'Horário de Funcionamento'], 
    1, 
    5, 
    false, 
    false, 
    false, 
    false, 
    1
  ),
  (
    'Profissional', 
    'prof', 
    'PRO', 
    'Destaque e recursos essenciais para atrair mais clientes', 
    49.90, 
    39.90, 
    ARRAY['Até 20 Fotos na Galeria', 'Cardápio Digital Interativo', 'Agendamento de Serviços', 'Selo de Verificado Bronze', 'Prioridade nas Buscas', 'Cupons de Desconto (2 ativos)', 'QR Code de Balcão para Impressão'], 
    20, 
    50, 
    false, 
    true, 
    true, 
    true, 
    2
  ),
  (
    'Elite Max', 
    'elite', 
    'MAX', 
    'Autoridade máxima com IA, catálogo ilimitado e visibilidade total', 
    149.90, 
    119.90, 
    ARRAY['Fotos e Vídeos Ilimitados', 'Catálogo e Produtos Ilimitados', 'IA Creator para Textos e Anúncios', 'IA Recrutadora para Vagas', 'Selo Diamante de Destaque', 'Raio de Alcance Ilimitado', 'Eventos Locais Patrocinados', 'Cupons & Cartão Fidelidade Ilimitados', 'Suporte Prioritário VIP'], 
    999, 
    999, 
    true, 
    true, 
    true, 
    false, 
    3
  )
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price = EXCLUDED.monthly_price,
  annual_price = EXCLUDED.annual_price,
  features = EXCLUDED.features,
  max_photos = EXCLUDED.max_photos,
  max_products = EXCLUDED.max_products,
  has_ai = EXCLUDED.has_ai,
  has_menu = EXCLUDED.has_menu,
  has_booking = EXCLUDED.has_booking,
  is_featured = EXCLUDED.is_featured,
  sort_order = EXCLUDED.sort_order;
