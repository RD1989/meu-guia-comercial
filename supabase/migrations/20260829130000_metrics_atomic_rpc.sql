-- ====================================================================
-- RPCs ATÔMICAS PARA INCREMENTO DE MÉTRICAS (VIEWS E WHATSAPP CLICKS)
-- Permite que visitantes anônimos registrem acessos sem quebrar RLS
-- ====================================================================

-- 1. Incrementar visualizações de perfil de comércio com segurança
CREATE OR REPLACE FUNCTION public.increment_business_views(b_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.businesses
  SET profile_views = COALESCE(profile_views, 0) + 1
  WHERE id = b_id;
END;
$$;

-- 2. Incrementar cliques no botão de WhatsApp com segurança
CREATE OR REPLACE FUNCTION public.increment_whatsapp_clicks(b_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.businesses
  SET whatsapp_clicks = COALESCE(whatsapp_clicks, 0) + 1
  WHERE id = b_id;
END;
$$;

-- 3. Conceder permissão de execução para visitantes anônimos e autenticados
GRANT EXECUTE ON FUNCTION public.increment_business_views(UUID) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_whatsapp_clicks(UUID) TO anon, authenticated;
