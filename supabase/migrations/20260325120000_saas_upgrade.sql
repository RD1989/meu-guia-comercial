
-- Add ADMIN role to the existing enum (safe approach)
-- Note: In Postgres, we can't easily remove enum values, so we add ADMIN
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'ADMIN';

-- =========================================================
-- platform_config: configurações gerais da plataforma
-- =========================================================
CREATE TABLE IF NOT EXISTS public.platform_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL UNIQUE,
  value TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.platform_config ENABLE ROW LEVEL SECURITY;

-- Anyone can read platform config (public)
CREATE POLICY "Anyone can read platform config" ON public.platform_config
  FOR SELECT USING (true);

-- Only superadmin can modify
CREATE POLICY "Superadmin can manage platform config" ON public.platform_config
  FOR ALL USING (public.has_role(auth.uid(), 'SUPERADMIN'));

-- Seed default config values
INSERT INTO public.platform_config (key, value) VALUES
  ('platform_name', 'Meu Guia Comercial'),
  ('platform_city', 'Sua Cidade'),
  ('platform_state', 'Estado'),
  ('platform_logo_url', ''),
  ('platform_primary_color', '#2563eb'),
  ('platform_description', 'O guia comercial mais completo da cidade'),
  ('platform_whatsapp', ''),
  ('platform_instagram', ''),
  ('platform_facebook', ''),
  ('platform_email', ''),
  ('platform_footer_text', '© 2026 Meu Guia Comercial. Todos os direitos reservados.')
ON CONFLICT (key) DO NOTHING;

-- =========================================================
-- blog_posts: artigos do blog com campos SEO completos
-- =========================================================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  excerpt TEXT,
  cover_image_url TEXT,
  category TEXT DEFAULT 'Geral',
  tags TEXT[] DEFAULT '{}',
  author_name TEXT DEFAULT 'Administrador',
  author_avatar_url TEXT,
  seo_title TEXT,
  seo_description TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'scheduled')),
  published_at TIMESTAMPTZ,
  ai_generated BOOLEAN NOT NULL DEFAULT false,
  reading_time_minutes INTEGER DEFAULT 5,
  views INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public can read published posts
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts
  FOR SELECT USING (status = 'published' AND (published_at IS NULL OR published_at <= now()));

-- Superadmin can manage all posts
CREATE POLICY "Superadmin can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'SUPERADMIN'));

-- Admin can manage posts
CREATE POLICY "Admin can manage blog posts" ON public.blog_posts
  FOR ALL USING (public.has_role(auth.uid(), 'ADMIN'));

-- =========================================================
-- ai_settings: configurações da IA (OpenRouter)
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  openrouter_api_key TEXT,
  default_model TEXT DEFAULT 'openai/gpt-4o-mini',
  article_prompt_template TEXT DEFAULT 'Você é um especialista em marketing de conteúdo local. Escreva um artigo completo sobre o tema: {tema}. O artigo deve ser voltado para moradores de {cidade}, com tom {tom}, e ter aproximadamente 800 palavras. Inclua dicas práticas e informações úteis. Retorne em formato JSON com os campos: title, seo_title, seo_description, excerpt, content (em markdown), suggested_tags (array de strings).',
  tone_of_voice TEXT DEFAULT 'informativo e amigável',
  target_city TEXT DEFAULT 'nossa cidade',
  auto_generate_image BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_settings ENABLE ROW LEVEL SECURITY;

-- Only superadmin/admin can read AI settings (has sensitive API key)
CREATE POLICY "Superadmin can manage ai_settings" ON public.ai_settings
  FOR ALL USING (public.has_role(auth.uid(), 'SUPERADMIN') OR public.has_role(auth.uid(), 'ADMIN'));

-- Seed one default row
INSERT INTO public.ai_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- =========================================================
-- Triggers de updated_at para novas tabelas
-- =========================================================
CREATE TRIGGER update_platform_config_updated_at BEFORE UPDATE ON public.platform_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_settings_updated_at BEFORE UPDATE ON public.ai_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================
-- Indexes para performance
-- =========================================================
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON public.blog_posts(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON public.blog_posts(slug);

-- =========================================================
-- Ampliar campos da tabela businesses (para melhorias do portal)
-- =========================================================
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS website TEXT,
  ADD COLUMN IF NOT EXISTS instagram TEXT,
  ADD COLUMN IF NOT EXISTS facebook TEXT,
  ADD COLUMN IF NOT EXISTS opening_hours JSONB,
  ADD COLUMN IF NOT EXISTS gallery_urls TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS average_rating FLOAT DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_reviews INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS featured BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS plan_tier TEXT NOT NULL DEFAULT 'FREE' CHECK (plan_tier IN ('FREE', 'BASIC', 'PRO', 'MAX'));
