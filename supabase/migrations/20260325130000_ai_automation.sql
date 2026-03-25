
-- =========================================================
-- ai_references: banco de fontes para a IA
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_references (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  url TEXT,
  content TEXT,
  source_type TEXT NOT NULL DEFAULT 'url' CHECK (source_type IN ('url', 'text')),
  status TEXT NOT NULL DEFAULT 'available' CHECK (status IN ('available', 'used', 'error')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_references ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can manage ai_references" ON public.ai_references
  FOR ALL USING (public.has_role(auth.uid(), 'SUPERADMIN') OR public.has_role(auth.uid(), 'ADMIN'));

-- =========================================================
-- ai_media_library: biblioteca de mídias para suporte
-- =========================================================
CREATE TABLE IF NOT EXISTS public.ai_media_library (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  media_url TEXT NOT NULL,
  media_type TEXT DEFAULT 'image',
  category TEXT DEFAULT 'Geral',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_media_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Superadmin can manage ai_media_library" ON public.ai_media_library
  FOR ALL USING (public.has_role(auth.uid(), 'SUPERADMIN') OR public.has_role(auth.uid(), 'ADMIN'));

-- =========================================================
-- Atualização de ai_settings para automação
-- =========================================================
ALTER TABLE public.ai_settings 
  ADD COLUMN IF NOT EXISTS automation_enabled BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS post_frequency TEXT DEFAULT 'daily' CHECK (post_frequency IN ('daily', 'weekly', 'biweekly')),
  ADD COLUMN IF NOT EXISTS last_auto_post_at TIMESTAMPTZ;

-- Triggers de updated_at
CREATE TRIGGER update_ai_references_updated_at BEFORE UPDATE ON public.ai_references
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
