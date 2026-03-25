import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    // 1. Buscar Configurações de IA
    const { data: settings, error: sError } = await supabase
      .from("ai_settings")
      .select("*")
      .single();

    if (sError || !settings?.autopilot_enabled) {
      return new Response(JSON.stringify({ message: "Autopilot desativado ou erro na config." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Definir Missão (Notícias ou Lojista)
    let mission = settings.target_focus;
    if (mission === "MIXED") {
      mission = Math.random() > 0.5 ? "NEWS_ONLY" : "BUSINESS_ONLY";
    }

    let result = {};

    if (mission === "NEWS_ONLY") {
      // 🕵️ MISSÃO NOTÍCIAS: Crawling de fontes externas
      const { data: source } = await supabase
        .from("news_sources")
        .select("*")
        .eq("is_active", true)
        .order("last_fetched_at", { ascending: true })
        .limit(1)
        .single();

      if (source) {
        console.log(`[Autopilot] Processando fonte: ${source.name} (${source.url})`);
        
        let rawContent = "";
        try {
          const fetchRes = await fetch(source.url);
          rawContent = await fetchRes.text();
          // Limpeza básica para economizar tokens (remove tags mas mantém texto)
          rawContent = rawContent.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gi, "")
                                .replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, "")
                                .substr(0, 10000); // Primeiros 10k caracteres
        } catch (e) {
          console.error(`[Autopilot] Erro ao ler URL: ${source.url}`);
          rawContent = "Erro de conexão ao ler o site. Use seu conhecimento geral sobre esta fonte.";
        }

        const prompt = `Você é um jornalista sênior do portal "${settings.target_city}". 
        Leia o conteúdo bruto abaixo extraído de: ${source.name}.
        Crie um artigo de blog EXCELENTE (em Markdown) para o público local.
        
        CONTEÚDO BRUTO: 
        ${rawContent}
        
        Tom de voz desejado: ${source.tone_of_voice || settings.tone_of_voice}.
        Cidade Alvo: ${settings.target_city}.
        
        IMPORTANTE: Responda APENAS o JSON puro abaixo:
        { "title": "...", "content": "Markdown format", "excerpt": "Curto resumo...", "category": "${source.name}" }`;

        const aiResponse = await callOpenRouter(prompt, settings.openrouter_api_key);
        
        const { error: postError } = await supabase.from("posts").insert({
          ...aiResponse,
          slug: aiResponse.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          published: true,
          tenant_id: settings.tenant_id,
          image_url: `https://source.unsplash.com/featured/?journalism,news,${encodeURIComponent(settings.target_city)}`
        });

        if (!postError) {
          await supabase.from("news_sources").update({ last_fetched_at: new Date().toISOString() }).eq("id", source.id);
        }
        result = { mission: "NEWS", title: aiResponse.title };
      }
    } else {
      // 🏬 MISSÃO BUSINESS: Promover empresas do portal (Ler o Cérebro)
      const { data: business } = await supabase
        .from("businesses")
        .select("*, categories(name)")
        .neq("id", settings.last_featured_business_id || '00000000-0000-0000-0000-000000000000') // Placeholder UUID
        .limit(1)
        .single();

      if (business) {
        console.log(`[Autopilot] Destacando empresa: ${business.name}`);

        const prompt = `Crie um artigo de curadoria de luxo destacando a empresa "${business.name}" no portal de ${settings.target_city}. 
        Categoria: ${business.categories?.name || 'Comércio Local'}.
        Descrição da empresa: ${business.description}.
        Objetivo: Mostrar por que os moradores de ${settings.target_city} devem visitar este local.
        Use Markdown rico (tópicos, negrito, títulos).
        
        IMPORTANTE: Responda APENAS o JSON puro abaixo:
        { "title": "...", "content": "Markdown format", "excerpt": "Curto resumo...", "category": "Destaque Local" }`;

        const aiResponse = await callOpenRouter(prompt, settings.openrouter_api_key);

        const { error: postError } = await supabase.from("posts").insert({
          ...aiResponse,
          slug: aiResponse.title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/ /g, '-').replace(/[^\w-]+/g, ''),
          published: true,
          tenant_id: settings.tenant_id,
          image_url: business.image_url || `https://source.unsplash.com/featured/?store,${encodeURIComponent(business.name)}`
        });

        if (!postError) {
          await supabase.from("ai_settings").update({ 
            last_featured_business_id: business.id,
            last_autopilot_run: new Date().toISOString()
          }).eq("id", settings.id);
        }
        result = { mission: "BUSINESS", title: aiResponse.title, business: business.name };
      }
    }

    return new Response(JSON.stringify({ success: true, mission, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: any) {
    console.error("[Autopilot Critical Error]", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function callOpenRouter(prompt: string, apiKey: string) {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "openai/gpt-4o-mini",
      messages: [{ role: "user", content: prompt + " \nIMPORTANTE: Responda APENAS o JSON puro, sem markdown tags." }]
    })
  });
  const data = await response.json();
  return JSON.parse(data.choices[0].message.content);
}
