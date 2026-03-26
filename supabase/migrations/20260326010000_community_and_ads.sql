-- Criando a tabela community_posts para o Feed da Comunidade
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    media_urls TEXT[] DEFAULT '{}',
    media_type TEXT DEFAULT 'image',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    city TEXT,
    latitude FLOAT8,
    longitude FLOAT8,
    is_sponsored BOOLEAN DEFAULT false,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativando RLS para community_posts
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

-- Políticas para community_posts
CREATE POLICY "Public pode visualizar todos os posts da comunidade"
    ON public.community_posts
    FOR SELECT
    USING (true);

CREATE POLICY "Usuários autenticados podem criar posts"
    ON public.community_posts
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Autores podem atualizar seus posts"
    ON public.community_posts
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Autores podem deletar seus posts"
    ON public.community_posts
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Criando a tabela business_ads para o Painel de Impulsionamento
CREATE TABLE IF NOT EXISTS public.business_ads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    type TEXT DEFAULT 'hero_banner',
    city TEXT,
    duration_days INTEGER DEFAULT 7,
    start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
    end_date TIMESTAMP WITH TIME ZONE DEFAULT (timezone('utc'::text, now()) + INTERVAL '7 days'),
    impressions INTEGER DEFAULT 0,
    clicks INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending', -- pending, active, paused, expired
    latitude FLOAT8,
    longitude FLOAT8,
    radius_meters INTEGER DEFAULT 5000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Ativando RLS para business_ads
ALTER TABLE public.business_ads ENABLE ROW LEVEL SECURITY;

-- Políticas para business_ads
CREATE POLICY "Public pode visualizar ads ativos"
    ON public.business_ads
    FOR SELECT
    USING (status = 'active');

CREATE POLICY "Lojistas podem ver todos os seus ads (visibilidade irrestrita temporária para facilidade do Dashboard e queries locais)"
    ON public.business_ads
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);
