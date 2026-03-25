import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { topic } = await req.json()
    
    // 1. Conectar ao Supabase para buscar chaves de IA
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: aiSettings, error: aiError } = await supabase
      .from('ai_settings')
      .select('*')
      .limit(1)
      .single()

    if (aiError || !aiSettings?.openrouter_api_key) {
      throw new Error('Configurações de IA não encontradas ou Chave OpenRouter ausente.')
    }

    // 2. Buscar config da plataforma para contexto regional
    const { data: configs } = await supabase.from('platform_config').select('key, value')
    const configMap = configs?.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {}) || {}

    const city = aiSettings.target_city || configMap.platform_city || 'nossa cidade'
    const tone = aiSettings.tone_of_voice || 'amigável e informativo'
    const promptTemplate = aiSettings.article_prompt_template || 'Escreva sobre {tema} em {cidade} com tom {tom}.'

    const prompt = promptTemplate
      .replace('{tema}', topic)
      .replace('{cidade}', city)
      .replace('{tom}', tone)

    // 3. Chamar OpenRouter
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${aiSettings.openrouter_api_key}`,
        "HTTP-Referer": "https://meuguiacomercial.com", // Opcional para rankings do OpenRouter
        "X-Title": "Meu Guia Comercial SaaS",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        "model": aiSettings.default_model || "openai/gpt-4o-mini",
        "messages": [
          { "role": "system", "content": "Você é um gerador de conteúdo para Guias Comerciais. Retorne APENAS o JSON solicitado, sem explicações." },
          { "role": "user", "content": prompt }
        ],
        "response_format": { "type": "json_object" }
      })
    })

    const aiResult = await response.json()
    const result = JSON.parse(aiResult.choices[0].message.content)

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
