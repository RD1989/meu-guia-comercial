// Edge Function: payment-webhook
// Recebe notificações de confirmação de pagamento e ativa o plano no banco
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json();
    console.log("Recebendo webhook de pagamento:", body);

    // Extrair ID da transação (Mercado Pago, Asaas ou simulação direta)
    const externalId = body.data?.id || body.external_reference || body.transaction_id;
    const isApproved = body.action === "payment.created" || body.status === "approved" || body.event === "PAYMENT_RECEIVED";

    if (externalId && isApproved) {
      // 1. Atualizar transação para 'approved'
      const { data: transaction } = await supabaseClient
        .from("payment_transactions")
        .update({ status: "approved" })
        .eq("external_id", String(externalId))
        .select()
        .maybeSingle();

      // 2. Se a transação tiver tenant_id e plan_tier, ativar plano
      if (transaction?.metadata?.tenant_id && transaction?.metadata?.plan_tier) {
        await supabaseClient
          .from("tenants")
          .update({
            plan_tier: transaction.metadata.plan_tier,
            plan_status: "ACTIVE",
            updated_at: new Date().toISOString()
          })
          .eq("id", transaction.metadata.tenant_id);

        console.log(`Plano ${transaction.metadata.plan_tier} ativado com sucesso para tenant ${transaction.metadata.tenant_id}`);
      }
    }

    return new Response(
      JSON.stringify({ received: true }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error: any) {
    console.error("Erro no webhook de pagamento:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
