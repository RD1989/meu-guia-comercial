-- =========================================================
-- REPARO MESTRE V2: INTELIGÊNCIA E SINCRONIA TOTAL 🧠
-- Execute este script para corrigir Erros 400 e ativar Rankings
-- =========================================================

-- 1. GARANTIR COLUNAS DE PERFORMANCE EM BUSINESSES
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS performance_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS rating_average FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;

-- 2. GARANTIR COLUNAS EM BANNERS (CASO TENHA SUCEDIDO PARCIALMENTE)
ALTER TABLE public.banners 
ADD COLUMN IF NOT EXISTS subtitle TEXT,
ADD COLUMN IF NOT EXISTS button_text TEXT DEFAULT 'Saiba Mais',
ADD COLUMN IF NOT EXISTS button_link TEXT;

-- 3. FUNÇÃO DE CÁLCULO DE SCORE PRO-RANKING
CREATE OR REPLACE FUNCTION public.calculate_performance_score()
RETURNS TRIGGER AS $$
DECLARE
    r_avg FLOAT;
BEGIN
    SELECT COALESCE(AVG(rating), 0) INTO r_avg FROM public.reviews WHERE business_id = NEW.id;
    NEW.performance_score := (r_avg * 10) + (NEW.profile_views * 0.1) + (NEW.whatsapp_clicks * 0.5);
    NEW.rating_average := r_avg;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. TRIGGER DE PERFORMANCE
DROP TRIGGER IF EXISTS tr_update_performance_on_business ON public.businesses;
CREATE TRIGGER tr_update_performance_on_business
BEFORE UPDATE ON public.businesses
FOR EACH ROW EXECUTE FUNCTION public.calculate_performance_score();

-- 5. TRIGER DE REVIEWS (PARA DISPARAR O NEGÓCIO)
CREATE OR REPLACE FUNCTION public.trigger_recalculate_business_score()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.businesses SET last_activity_at = now() WHERE id = COALESCE(NEW.business_id, OLD.business_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_recalculate_on_review ON public.reviews;
CREATE TRIGGER tr_recalculate_on_review
AFTER INSERT OR UPDATE OR DELETE ON public.reviews
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_business_score();

-- 6. GARANTIR POLÍTICAS DE RLS (SÃO CRÍTICAS PARA O PORTAL LER)
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read businesses" ON public.businesses;
CREATE POLICY "Public read businesses" ON public.businesses FOR SELECT USING (true);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Public read reviews" ON public.reviews;
CREATE POLICY "Public read reviews" ON public.reviews FOR SELECT USING (true);
