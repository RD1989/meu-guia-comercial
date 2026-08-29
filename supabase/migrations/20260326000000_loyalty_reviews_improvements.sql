-- =========================================================
-- 🏆 Migration: Melhorias Gerais (Loyalty, Reviews, Events, Posts, Referrals)
-- =========================================================

-- 1. Reviews: adicionar fotos e resposta do lojista
ALTER TABLE public.reviews
  ADD COLUMN IF NOT EXISTS photos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS owner_reply TEXT,
  ADD COLUMN IF NOT EXISTS owner_reply_at TIMESTAMPTZ;

-- 2. Tabela de Postagens do Negócio (Feed)
CREATE TABLE IF NOT EXISTS public.business_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  post_type TEXT NOT NULL DEFAULT 'update' CHECK (post_type IN ('update', 'promo', 'event')),
  event_date TIMESTAMPTZ,
  promo_until TIMESTAMPTZ,
  likes INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.business_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Posts são públicos para leitura" ON public.business_posts
  FOR SELECT USING (true);

CREATE POLICY "Dono pode gerenciar seus posts" ON public.business_posts
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE INDEX IF NOT EXISTS idx_business_posts_business_id ON public.business_posts(business_id);
CREATE INDEX IF NOT EXISTS idx_business_posts_created_at ON public.business_posts(created_at DESC);

-- 3. Tabela de Pontos de Fidelidade (Loyalty Points)
CREATE TABLE IF NOT EXISTS public.loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  level TEXT NOT NULL DEFAULT 'bronze' CHECK (level IN ('bronze', 'silver', 'gold', 'diamond')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.loyalty_points ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seus próprios pontos" ON public.loyalty_points
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode gerenciar pontos" ON public.loyalty_points
  FOR ALL USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'SUPERADMIN'));

-- 4. Tabela de Transações de Pontos
CREATE TABLE IF NOT EXISTS public.loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  points INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('earn_checkin', 'earn_review', 'earn_referral', 'earn_purchase', 'redeem')),
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.loyalty_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas próprias transações" ON public.loyalty_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Sistema pode inserir transações" ON public.loyalty_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 5. Tabela de Carimbo Digital (Stamp Cards)
CREATE TABLE IF NOT EXISTS public.stamp_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stamps_current INTEGER NOT NULL DEFAULT 0,
  stamps_required INTEGER NOT NULL DEFAULT 10,
  reward_description TEXT NOT NULL DEFAULT 'Brinde especial',
  completed_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(business_id, user_id)
);

ALTER TABLE public.stamp_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê seus carimbos" ON public.stamp_cards
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Lojista vê carimbos do seu negócio" ON public.stamp_cards
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

CREATE POLICY "Sistema pode gerenciar carimbos" ON public.stamp_cards
  FOR ALL USING (auth.uid() = user_id OR
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- 6. Configuração de Carimbo por Negócio
ALTER TABLE public.businesses
  ADD COLUMN IF NOT EXISTS stamp_enabled BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS stamp_required INTEGER DEFAULT 10,
  ADD COLUMN IF NOT EXISTS stamp_reward TEXT DEFAULT 'Brinde especial',
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Gerar códigos de referência para negócios existentes
UPDATE public.businesses 
SET referral_code = UPPER(SUBSTRING(MD5(id::text), 1, 8))
WHERE referral_code IS NULL;

-- 7. Tabela de Referências/Indicações
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  business_id UUID REFERENCES public.businesses(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário vê suas indicações" ON public.referrals
  FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Usuário pode criar indicações" ON public.referrals
  FOR INSERT WITH CHECK (auth.uid() = referrer_id);

-- 8. Tabela de Cupons / Ofertas
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percent' CHECK (discount_type IN ('percent', 'fixed', 'freebie')),
  discount_value DECIMAL(10,2),
  code TEXT,
  valid_until TIMESTAMPTZ,
  max_uses INTEGER,
  current_uses INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Cupons ativos são públicos" ON public.coupons
  FOR SELECT USING (active = TRUE AND (valid_until IS NULL OR valid_until > now()));

CREATE POLICY "Lojista gerencia seus cupons" ON public.coupons
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- 9. Eventos Locais
CREATE TABLE IF NOT EXISTS public.local_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  cover_image_url TEXT,
  event_date TIMESTAMPTZ NOT NULL,
  event_end_date TIMESTAMPTZ,
  location TEXT,
  is_free BOOLEAN DEFAULT TRUE,
  price DECIMAL(10,2),
  max_attendees INTEGER,
  current_attendees INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.local_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Eventos são públicos" ON public.local_events
  FOR SELECT USING (active = TRUE AND event_date >= now());

CREATE POLICY "Lojista gerencia seus eventos" ON public.local_events
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.businesses WHERE id = business_id AND owner_id = auth.uid())
  );

-- 10. Índices de performance
CREATE INDEX IF NOT EXISTS idx_stamp_cards_user_id ON public.stamp_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_stamp_cards_business_id ON public.stamp_cards(business_id);
CREATE INDEX IF NOT EXISTS idx_coupons_business_id ON public.coupons(business_id);
CREATE INDEX IF NOT EXISTS idx_local_events_event_date ON public.local_events(event_date);
CREATE INDEX IF NOT EXISTS idx_local_events_business_id ON public.local_events(business_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_user_id ON public.loyalty_transactions(user_id);

-- 11. Reabilitar Realtime nas novas tabelas
ALTER PUBLICATION supabase_realtime ADD TABLE business_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE loyalty_points;
ALTER PUBLICATION supabase_realtime ADD TABLE stamp_cards;
ALTER PUBLICATION supabase_realtime ADD TABLE coupons;
ALTER PUBLICATION supabase_realtime ADD TABLE local_events;

-- 12. Triggers de updated_at
CREATE TRIGGER update_business_posts_updated_at BEFORE UPDATE ON public.business_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loyalty_points_updated_at BEFORE UPDATE ON public.loyalty_points
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_stamp_cards_updated_at BEFORE UPDATE ON public.stamp_cards
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_coupons_updated_at BEFORE UPDATE ON public.coupons
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_local_events_updated_at BEFORE UPDATE ON public.local_events
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
