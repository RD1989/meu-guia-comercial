-- ====================================================================
-- MIGRAÇÃO DE ENDURECIMENTO DE SEGURANÇA E RLS (BYTEBYTEGO PATTERNS)
-- Data: 2026-08-29
-- ====================================================================

-- 1. Assegurar Função de Verificação de Roles de Alta Performance (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin(_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('SUPERADMIN', 'ADMIN')
  );
$$;

-- 2. HARDENING: ai_settings (Isolamento total de chaves e parâmetros de IA)
ALTER TABLE IF EXISTS public.ai_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin manage ai_settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Allow all for ai_settings" ON public.ai_settings;
DROP POLICY IF EXISTS "Public read ai_settings" ON public.ai_settings;

CREATE POLICY "Admin manage ai_settings" ON public.ai_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 3. HARDENING: platform_config (Leitura pública controlada, escrita estrita)
ALTER TABLE IF EXISTS public.platform_config ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin manage platform_config" ON public.platform_config;
DROP POLICY IF EXISTS "Public read platform_config" ON public.platform_config;

CREATE POLICY "Public read platform_config" ON public.platform_config
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage platform_config" ON public.platform_config
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. HARDENING: banners (Leitura apenas de ativos para o público, escrita admin)
ALTER TABLE IF EXISTS public.banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Superadmin manage banners" ON public.banners;
DROP POLICY IF EXISTS "Public read banners" ON public.banners;

CREATE POLICY "Public read active banners" ON public.banners
  FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admin manage banners" ON public.banners
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 5. HARDENING: payment_gateways & checkout_settings (Remoção de emails hardcoded)
ALTER TABLE IF EXISTS public.checkout_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.payment_transactions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Super Admin manage checkout settings" ON public.checkout_settings;
DROP POLICY IF EXISTS "Super Admin manage gateways" ON public.payment_gateways;
DROP POLICY IF EXISTS "Users view own transactions" ON public.payment_transactions;

-- Configurações visuais de checkout: Leitura pública, escrita Admin
CREATE POLICY "Public read checkout settings" ON public.checkout_settings
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin manage checkout settings" ON public.checkout_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Gateways com secrets: Estritamente restrito a Administradores
CREATE POLICY "Admin manage payment gateways" ON public.payment_gateways
  FOR ALL
  TO authenticated
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Transações: Usuário vê e cria suas próprias transações, Admin tem visão global
CREATE POLICY "Users manage own transactions" ON public.payment_transactions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin(auth.uid()));

CREATE POLICY "Users create transactions" ON public.payment_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
