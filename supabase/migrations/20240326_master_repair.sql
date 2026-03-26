-- =========================================================
-- REPARO MESTRE: INFRAESTRUTURA DE DADOS ELITE 🚀
-- Execute este script no SQL Editor do Supabase para corrigir os erros 404
-- =========================================================

-- 1. TABELA DE BANNERS (HOME PAGE)
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    image_url TEXT NOT NULL,
    title TEXT,
    subtitle TEXT,
    button_text TEXT DEFAULT 'Saiba Mais',
    button_link TEXT,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read banners" ON public.banners FOR SELECT USING (active = true);
CREATE POLICY "Superadmin manage banners" ON public.banners FOR ALL USING (true); -- Ajustado para permitir gestão inicial

-- 2. TABELA DE CONFIGURAÇÃO DA PLATAFORMA
CREATE TABLE IF NOT EXISTS public.platform_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read platform_config" ON public.platform_config FOR SELECT USING (true);
CREATE POLICY "Superadmin manage platform_config" ON public.platform_config FOR ALL USING (true);


-- 3. TABELA DE CONFIGURAÇÕES DE IA (OpenRouter)
CREATE TABLE IF NOT EXISTS public.ai_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    openrouter_api_key TEXT,
    default_model TEXT DEFAULT 'openai/gpt-4o-mini',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Superadmin manage ai_settings" ON public.ai_settings FOR ALL USING (true);

-- 4. SEED DATA (DADOS INICIAIS)
INSERT INTO public.platform_config (key, value) VALUES
('platform_name', 'Meu Guia Comercial'),
('platform_city', 'Sua Cidade'),
('platform_primary_color', '#2563eb'),
('banner_interval', '5')
ON CONFLICT (key) DO NOTHING;

INSERT INTO public.ai_settings (default_model) VALUES ('openai/gpt-4o-mini') ON CONFLICT DO NOTHING;

-- Banners Dummy Iniciais (Elite Theme)
INSERT INTO public.banners (title, subtitle, image_url, sort_order) VALUES
('O Melhor da Sua Cidade', 'Encontre tudo o que você precisa em um só lugar.', 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&q=80', 1),
('Sua Empresa no Topo', 'Aumente sua visibilidade e atraia mais clientes.', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&q=80', 2)
ON CONFLICT DO NOTHING;
