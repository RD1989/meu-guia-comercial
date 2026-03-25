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
    const { query, tenant_id } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Buscar Informações de IA (Cidade Alvo, Tom de Voz)
    const { data: settings } = await supabase
      .from("ai_settings")
      .select("*")
      .limit(1)
      .single();

    // 2. Buscar Empresas Relevantes (Busca básica por texto enquanto não temos vetores)
    // Buscamos em nome, descrição e categoria
    const { data: businesses } = await supabase
      .from("businesses")
      .select("*, categories(name)")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5);

    // 3. Preparar Contexto para a IA
    const businessContext = businesses?.map(b => 
      `- ${b.name} (${b.categories?.name}): ${b.description?.substring(0, 100)}... Endereço: ${b.address}`
    ).join("\n") || "Nenhuma empresa específica encontrada para esta busca.";

    const prompt = `Você é o Concierge Oficial do portal "${settings.target_city}". 
    Seu objetivo é ajudar os moradores a encontrar o que precisam na cidade.
    
    PERGUNTA DO USUÁRIO: "${query}"
    
    EMPRESAS NO NOSSO BANCO DE DADOS:
    ${businessContext}
    
    Instruções:
    - Seja extremamente útil, amigável e use um tom local.
    - Se houver empresas no contexto, recomende-as com entusiasmo mas honestidade.
    - Se não houver empresas específicas, use seu conhecimento geral para dar dicas sobre ${settings.target_city} mas mencione que "estamos sempre cadastrando novos locais".
    - Responda de forma concisa (máximo 150 palavras).
    - Use Markdown para destacar nomes de empresas.
    
    Responda apenas com o texto da resposta.`;

    // 4. Chamar OpenRouter
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${settings.openrouter_api_key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: settings.default_model || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const answer = aiData.choices[0].message.content;

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Concierge Error]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
