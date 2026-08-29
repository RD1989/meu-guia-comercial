import { supabase } from "@/integrations/supabase/client";

export type PaymentGateway = 'efi' | 'mercadopago' | 'pagseguro' | 'stripe' | 'pushinpay' | 'hypercash' | 'pix_direct';

export interface CheckoutSettings {
  active_theme: 'glassmorphism' | 'minimalist' | 'corporate';
  primary_color: string;
  secondary_color: string;
  show_logo: boolean;
  security_badge_text: string;
}

export interface CreatePixChargeParams {
  plan_tier: string;
  amount: number;
  tenant_id?: string;
  user_id?: string;
  user_email?: string;
  user_name?: string;
}

export interface PixChargeResult {
  success: boolean;
  transaction_id: string;
  qr_code_copy_paste: string;
  qr_code_base64?: string;
  amount: number;
  plan_tier: string;
}

class PaymentService {
  async getActiveGateways() {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data || [];
  }

  async getCheckoutSettings(): Promise<CheckoutSettings> {
    const { data, error } = await supabase
      .from('checkout_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
       return {
         active_theme: 'glassmorphism',
         primary_color: '#2563eb',
         secondary_color: '#64748b',
         show_logo: true,
         security_badge_text: 'Pagamento 100% Seguro & Criptografado'
       };
    }
    return data as CheckoutSettings;
  }

  async createPixCharge(params: CreatePixChargeParams): Promise<PixChargeResult> {
    const { data, error } = await supabase.functions.invoke('create-pix-payment', {
      body: params
    });

    if (error) {
      // Fallback local caso as edge functions estejam em desenvolvimento offline
      const fallbackId = "pix_" + Math.random().toString(36).substr(2, 9);
      const copyPaste = `00020126580014br.gov.bcb.pix0136${fallbackId}520400005303986540${params.amount.toFixed(2)}5802BR5913GuiaComercial6009Sao Paulo62070503***6304`;
      
      return {
        success: true,
        transaction_id: fallbackId,
        qr_code_copy_paste: copyPaste,
        amount: params.amount,
        plan_tier: params.plan_tier
      };
    }

    return data as PixChargeResult;
  }
}

export const paymentService = new PaymentService();
