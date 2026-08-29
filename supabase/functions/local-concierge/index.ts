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
    const { query, location } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // 1. Buscar Informações de IA (Cidade Alvo, Chave API)
    const { data: settings } = await supabase
      .from("ai_settings")
      .select("*")
      .limit(1)
      .maybeSingle();

    const targetCity = location?.city || settings?.target_city || "sua cidade";
    const apiKey = settings?.openrouter_api_key || Deno.env.get("OPENROUTER_API_KEY");

    // 2. Buscar Empresas Relevantes no Banco de Dados
    let bizQuery = supabase
      .from("businesses")
      .select("*, categories(name)")
      .eq("active", true);

    if (query?.trim()) {
      bizQuery = bizQuery.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: businesses } = await bizQuery.limit(5);

    // 3. Se não houver chave de IA configurada, responder com recomendação direta baseada no banco
    if (!apiKey) {
      if (businesses && businesses.length > 0) {
        const list = businesses.map(b => `📍 **${b.name}** (${b.categories?.name || 'Comércio'})\n${b.address ? `Endereço: ${b.address}` : ''}\n[Ver detalhes](/negocio/${b.slug})`).join("\n\n");
        const answer = `Encontrei as seguintes opções em **${targetCity}** para a sua busca:\n\n${list}\n\nPosso te ajudar com mais alguma informação?`;
        return new Response(JSON.stringify({ answer }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      } else {
        const answer = `Ainda não encontrei um estabelecimento específico para "${query}" em **${targetCity}**, mas novos comércios são cadastrados diariamente. Você pode conferir todas as categorias na página de [Categorias](/categorias)!`;
        return new Response(JSON.stringify({ answer }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
    }

    // 4. Preparar Contexto para a IA
    const businessContext = businesses?.map(b => 
      `- ${b.name} (${b.categories?.name}): ${b.description?.substring(0, 100)}... Endereço: ${b.address}`
    ).join("\n") || "Nenhuma empresa específica encontrada para esta busca no momento.";

    const prompt = `Você é o Concierge Oficial do portal comercial de "${targetCity}". 
    Seu objetivo é ajudar os moradores e visitantes a encontrar comércios, restaurantes e serviços de excelência na cidade.
    
    PERGUNTA DO USUÁRIO: "${query}"
    
    EMPRESAS NO NOSSO BANCO DE DADOS:
    ${businessContext}
    
    Instruções:
    - Seja prestativo, acolhedor e transmita entusiasmo pela cidade.
    - Se houver empresas no contexto, recomende-as destacando o segmento.
    - Se não houver empresas específicas, dê dicas gerais sobre ${targetCity} e incentive a explorar as categorias do portal.
    - Responda em no máximo 120 palavras usando Markdown.`;

    // 5. Chamar OpenRouter
    const aiRes = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: settings?.default_model || "openai/gpt-4o-mini",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const aiData = await aiRes.json();
    const answer = aiData.choices?.[0]?.message?.content || "Encontrei ótimas opções para você na cidade! Confira no nosso guia.";

    return new Response(JSON.stringify({ answer }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Concierge Error]", err);
    return new Response(JSON.stringify({ error: err.message, answer: "Olá! Como posso te ajudar a encontrar os melhores estabelecimentos da cidade hoje?" }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
