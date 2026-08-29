-- Adicionar colunas necessárias para o Motor de Autopiloto
ALTER TABLE public.news_sources 
  ADD COLUMN IF NOT EXISTS last_fetched_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Adicionar colunas de controle de Autopiloto em ai_settings
ALTER TABLE public.ai_settings 
  ADD COLUMN IF NOT EXISTS autopilot_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS autopilot_frequency_hours INTEGER DEFAULT 24,
  ADD COLUMN IF NOT EXISTS posts_per_day INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS autopilot_interval_minutes INTEGER DEFAULT 480,
  ADD COLUMN IF NOT EXISTS target_focus TEXT DEFAULT 'MIXED' CHECK (target_focus IN ('MIXED', 'NEWS_ONLY', 'BUSINESS_ONLY')),
  ADD COLUMN IF NOT EXISTS last_autopilot_run TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS last_featured_business_id UUID;

-- Comentários para documentação
COMMENT ON COLUMN public.ai_settings.target_focus IS 'Define se o robô posta Notícias, Lojistas ou Híbrido.';
