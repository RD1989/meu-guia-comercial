import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { job_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Buscar Detalhes da Vaga
    const { data: job, error: jobErr } = await supabase
      .from("jobs")
      .select("*, businesses(name)")
      .eq("id", job_id)
      .single();

    if (jobErr || !job) throw new Error("Vaga não encontrada.");

    // 2. Buscar Candidatos
    const { data: applications, error: appErr } = await supabase
      .from("job_applications")
      .select("*")
      .eq("job_id", job_id);

    if (appErr || !applications || applications.length === 0) {
      return new Response(JSON.stringify({ message: "Nenhum candidato para analisar." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 3. Buscar Chave de IA nas configurações
    const { data: aiSettings, error: aiErr } = await supabase.from("ai_settings").select("*").limit(1).maybeSingle();

    if (aiErr || !aiSettings?.openrouter_api_key) {
      throw new Error("Configurações de IA (OpenRouter API Key) não encontradas no banco.");
    }

    // 4. Preparar Prompt para o Rankeamento
    const candidatesList = applications.map((app: any, index: number) => 
      `Candidato #${index + 1}:
      Nome: ${app.candidate_name}
      Email: ${app.candidate_email}
      Apresentação: ${app.cover_letter || "Não enviada"}
      CV URL: ${app.resume_url || "Não enviado"}`
    ).join("\n\n");

    const prompt = `Você é um Consultor de RH Sênior especializado no mercado de ${aiSettings.target_city || "sua região"}. 
    Sua missão é analisar os candidatos abaixo para uma vaga específica.
    
    VAGA: ${job.title} em ${job.businesses?.name}.
    REQUISITOS/DESCRIÇÃO: ${job.description}
    
    CANDIDATOS INSCRITOS:
    ${candidatesList}
    
    Instruções de Resposta:
    1. Identifique os TOP 3 candidatos que melhor se encaixam no perfil.
    2. Liste por que eles foram escolhidos (justificativa curta).
    3. Dê uma pontuação de 0 a 100 para cada um dos Top 3.
    
    IMPORTANTE: Responda APENAS em JSON puro no formato:
    {
      "top_candidates": [
        { "name": "...", "score": 95, "feedback": "...", "id": "uuid_ou_index" },
        { "name": "...", "score": 88, "feedback": "...", "id": "uuid_ou_index" },
        { "name": "...", "score": 82, "feedback": "...", "id": "uuid_ou_index" }
      ],
      "overall_summary": "Resumo da qualidade dos candidatos..."
    }`;

    // 5. Chamar OpenRouter
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${aiSettings.openrouter_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: aiSettings.default_model || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    if (!aiData.choices?.[0]?.message?.content) {
      throw new Error("A IA não retornou uma resposta válida.");
    }

    // Limpar markdown de código se a IA retornar (comum em LLMs)
    let content = aiData.choices[0].message.content.trim();
    if (content.startsWith("```json")) content = content.substring(7);
    if (content.endsWith("```")) content = content.substring(0, content.length - 3);
    content = content.trim();

    try {
      const recommendation = JSON.parse(content);
      return new Response(JSON.stringify(recommendation), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (parseErr) {
      console.error("Erro ao processar JSON da IA:", content);
      throw new Error("Erro de resposta da IA (Formato Inválido).");
    }

  } catch (err: any) {
    console.error("[AI Recruiter Error]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
