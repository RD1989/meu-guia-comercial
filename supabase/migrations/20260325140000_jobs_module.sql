-- Migração para o Módulo de Vagas de Emprego (Job Board)
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    requirements TEXT,
    benefits TEXT,
    salary_range TEXT,
    job_type TEXT DEFAULT 'Efetivo', -- CLT, Freelance, Meio Período
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Qualquer um pode ver vagas ativas" 
ON public.jobs FOR SELECT 
USING (is_active = true);

CREATE POLICY "Dono da empresa pode gerenciar suas vagas" 
ON public.jobs FOR ALL 
TO authenticated 
USING (
    business_id IN (
        SELECT id FROM public.businesses WHERE owner_id = auth.uid()
    )
);

-- Índice para busca rápida
CREATE INDEX IF NOT EXISTS idx_jobs_business ON public.jobs(business_id);
CREATE INDEX IF NOT EXISTS idx_jobs_tenant ON public.jobs(tenant_id);
