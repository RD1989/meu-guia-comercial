-- Tabela de Configurações de Checkout (Temas e Layouts)
CREATE TABLE IF NOT EXISTS public.checkout_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    active_theme TEXT DEFAULT 'glassmorphism', -- 'glassmorphism', 'minimalist', 'corporate'
    primary_color TEXT DEFAULT '#2563eb',
    secondary_color TEXT DEFAULT '#64748b',
    show_logo BOOLEAN DEFAULT true,
    security_badge_text TEXT DEFAULT 'Pagamento 100% Seguro',
    custom_css TEXT, -- Para ajustes finos pelo Admin
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para checkout_settings
ALTER TABLE public.checkout_settings ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas Super Admin pode editar
CREATE POLICY "Super Admin manage checkout settings" ON public.checkout_settings
    FOR ALL USING (auth.jwt() ->> 'email' = 'rodrigotechpro@gmail.com');

-- Inserir registro inicial
INSERT INTO public.checkout_settings (id) VALUES (gen_random_uuid()) ON CONFLICT DO NOTHING;

-- Tabela de Gateways de Pagamento
CREATE TABLE IF NOT EXISTS public.payment_gateways (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE, -- 'efi', 'mercadopago', 'pagseguro', 'stripe', 'pushinpay', 'hypercash'
    is_active BOOLEAN DEFAULT false,
    config JSONB DEFAULT '{}'::jsonb, -- Armazena keys específicas como {public_key: '...', secret_key: '...'}
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS public.payment_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    amount DECIMAL(10,2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'refunded'
    gateway TEXT NOT NULL,
    external_id TEXT, -- ID na plataforma de pagamento
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.payment_gateways ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_transactions ENABLE ROW LEVEL SECURITY;

-- Políticas: Apenas Super Admin pode ver/editar gateways
CREATE POLICY "Super Admin manage gateways" ON public.payment_gateways
    FOR ALL USING (auth.jwt() ->> 'email' = 'rodrigotechpro@gmail.com');

-- Políticas: Usuários veem suas próprias transações
CREATE POLICY "Users view own transactions" ON public.payment_transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Inserir registros iniciais desativados
INSERT INTO public.payment_gateways (name, is_active) VALUES 
('efi', false),
('mercadopago', false),
('pagseguro', false),
('stripe', false),
('pushinpay', false),
('hypercash', false)
ON CONFLICT (name) DO NOTHING;
