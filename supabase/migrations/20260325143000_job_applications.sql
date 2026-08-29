-- Tabela de Candidaturas a Vagas (Job Applications)
CREATE TABLE IF NOT EXISTS public.job_applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    candidate_name TEXT NOT NULL,
    candidate_email TEXT NOT NULL,
    candidate_phone TEXT,
    resume_url TEXT, -- Link do Supabase Storage (job_resumes bucket)
    cover_letter TEXT,
    status TEXT DEFAULT 'PENDENTE', -- PENDENTE, ANALISADO, ENTREVISTA, REJEITADO, CONTRATADO
    ai_score INTEGER, -- Pontuação dada pela IA (0-100)
    ai_feedback TEXT, -- Feedback resumido da IA
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;

-- Políticas de Acesso
CREATE POLICY "Lojista pode ver candidaturas de suas vagas" 
ON public.job_applications FOR SELECT 
TO authenticated 
USING (
    job_id IN (
        SELECT id FROM public.jobs WHERE business_id IN (
            SELECT id FROM public.businesses WHERE owner_id = auth.uid()
        )
    )
);

CREATE POLICY "Qualquer um pode se candidatar" 
ON public.job_applications FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Índice para performance
CREATE INDEX IF NOT EXISTS idx_applications_job ON public.job_applications(job_id);
