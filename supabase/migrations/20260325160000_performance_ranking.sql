-- 🏆 Migration: Performance Ranking System
-- Adiciona o "Cérebro" de ordenação inteligente ao portal

-- 1. Novas colunas na tabela businesses
ALTER TABLE public.businesses 
ADD COLUMN IF NOT EXISTS performance_score FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS avg_response_time FLOAT DEFAULT 0, -- em minutos
ADD COLUMN IF NOT EXISTS last_activity_at TIMESTAMPTZ DEFAULT now(),
ADD COLUMN IF NOT EXISTS rating_average FLOAT DEFAULT 0;

-- 2. Índice para busca ultra-rápida por ranking
CREATE INDEX IF NOT EXISTS idx_businesses_performance ON public.businesses (performance_score DESC);

-- 3. Função para recalcular o Score de Performance
CREATE OR REPLACE FUNCTION public.calculate_performance_score()
RETURNS TRIGGER AS $$
DECLARE
    r_avg FLOAT;
    e_total FLOAT;
    rc_score FLOAT;
BEGIN
    -- Pegar média de ratings recalculando (para maior precisão)
    SELECT COALESCE(AVG(rating), 0) INTO r_avg FROM public.reviews WHERE business_id = NEW.id;
    
    -- Engajamento (Views + 2.5x Cliques WhatsApp)
    e_total := NEW.profile_views + (NEW.whatsapp_clicks * 2.5);
    
    -- Recência (Escala de 0-10 baseada na última atividade)
    rc_score := CASE 
        WHEN NEW.last_activity_at > now() - interval '1 day' THEN 10
        WHEN NEW.last_activity_at > now() - interval '7 days' THEN 7
        WHEN NEW.last_activity_at > now() - interval '30 days' THEN 4
        ELSE 0
    END;

    -- Fórmula PRO-RANK (0-100)
    -- Rating (40 pts) + Engajamento (30 pts - log scale) + Recência (10 pts) + Atividade Constante (20 pts)
    NEW.performance_score := (r_avg * 8) + (LEAST(LN(e_total + 1) * 3, 30)) + rc_score + (CASE WHEN r_avg > 0 THEN 10 ELSE 0 END);
    NEW.rating_average := r_avg;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Triggers para atualização automática
-- Ao atualizar dados do negócio (cliques/views)
DROP TRIGGER IF EXISTS tr_update_performance_on_business ON public.businesses;
CREATE TRIGGER tr_update_performance_on_business
BEFORE UPDATE ON public.businesses
FOR EACH ROW
WHEN (OLD.* IS DISTINCT FROM NEW.*) -- Evita loops e atualizações desnecessárias
EXECUTE FUNCTION public.calculate_performance_score();

-- Função auxiliar para reviews disparar o update do negócio
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
FOR EACH ROW
EXECUTE FUNCTION public.trigger_recalculate_business_score();
