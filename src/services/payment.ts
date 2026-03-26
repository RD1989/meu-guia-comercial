import { supabase } from "@/integrations/supabase/client";

export type PaymentGateway = 'efi' | 'mercadopago' | 'pagseguro' | 'stripe' | 'pushinpay' | 'hypercash';

export interface CheckoutSettings {
  active_theme: 'glassmorphism' | 'minimalist' | 'corporate';
  primary_color: string;
  secondary_color: string;
  show_logo: boolean;
  security_badge_text: string;
}

export interface PaymentPreference {
  items: {
    title: string;
    unit_price: number;
    quantity: number;
  }[];
  external_reference: string;
  payer?: {
    email: string;
    name?: string;
  };
}

class PaymentService {
  async getActiveGateways() {
    const { data, error } = await supabase
      .from('payment_gateways')
      .select('*')
      .eq('is_active', true);
    
    if (error) throw error;
    return data;
  }

  async getCheckoutSettings(): Promise<CheckoutSettings> {
    const { data, error } = await supabase
      .from('checkout_settings')
      .select('*')
      .limit(1)
      .single();

    if (error) {
       // Fallback defaults if table doesn't exist yet or is empty
       return {
         active_theme: 'glassmorphism',
         primary_color: '#2563eb',
         secondary_color: '#64748b',
         show_logo: true,
         security_badge_text: 'Pagamento 100% Seguro'
       };
    }
    return data as CheckoutSettings;
  }

  async createTransaction(amount: number, gateway: PaymentGateway, externalId?: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { data, error } = await supabase
      .from('payment_transactions')
      .insert({
        user_id: user?.id,
        amount,
        gateway,
        external_id: externalId,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  // Placeholder for gateway processing (would call Edge Functions)
  async processPayment(gateway: PaymentGateway, preference: PaymentPreference) {
    console.log(`Processando pagamento via ${gateway}`, preference);
    
    // Aqui chamaríamos uma Supabase Edge Function para processar de forma segura no server-side
    // Por enquanto retornamos um mock de sucesso para a UI
    return {
      id: "mock_" + Math.random().toString(36).substr(2, 9),
      url: "#", // URL de checkout ou instrução de Pix
    };
  }
}

export const paymentService = new PaymentService();
