import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Layout, ShieldCheck, Save, CreditCard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentGatewaysTabProps {
  gateways: any[];
  setGateways: React.Dispatch<React.SetStateAction<any[]>>;
  checkoutSettings: any;
  setCheckoutSettings: React.Dispatch<React.SetStateAction<any>>;
  refetchPaymentData: () => void;
}

export function PaymentGatewaysTab({
  gateways,
  setGateways,
  checkoutSettings,
  setCheckoutSettings,
  refetchPaymentData
}: PaymentGatewaysTabProps) {

  const handleToggleGateway = async (gw: any) => {
    const { error } = await supabase
      .from("payment_gateways")
      .update({ is_active: !gw.is_active })
      .eq("id", gw.id);

    if (!error) {
      toast.success(`${gw.name} ${!gw.is_active ? "ativado" : "desativado"}`);
      refetchPaymentData();
    } else {
      toast.error("Erro ao alterar status: " + error.message);
    }
  };

  const handleSaveKeys = async (gw: any) => {
    const { error } = await supabase
      .from("payment_gateways")
      .update({ config: gw.config })
      .eq("id", gw.id);

    if (!error) {
      toast.success(`Chaves de ${gw.name} salvas com sucesso!`);
    } else {
      toast.error("Erro ao salvar chaves: " + error.message);
    }
  };

  const handleSaveCheckoutSettings = async () => {
    const { error } = await supabase
      .from("checkout_settings")
      .upsert(checkoutSettings);

    if (!error) {
      toast.success("Design do checkout salvo com sucesso!");
    } else {
      toast.error("Erro ao salvar configurações do checkout: " + error.message);
    }
  };

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader>
            <CardTitle>Gateways de Pagamento (Mercado Pago, Asaas, Stripe)</CardTitle>
            <CardDescription>
              Ative e insira as chaves de API dos provedores para processamento de Pix e Cartão.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {gateways.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed text-slate-400 text-xs">
                Nenhum gateway cadastrado na tabela payment_gateways.
              </div>
            ) : (
              gateways.map((gw) => (
                <div key={gw.id} className="p-6 border rounded-2xl bg-slate-50/50 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black text-xs ${gw.is_active ? 'bg-primary text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {gw.name.toUpperCase().substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="font-black text-slate-900 uppercase tracking-tight">{gw.name}</h4>
                        <p className="text-[10px] font-bold text-slate-400">
                          STATUS: {gw.is_active ? <span className="text-emerald-600 font-black">ATIVO</span> : "DESATIVADO"}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant={gw.is_active ? "destructive" : "default"} 
                      size="sm"
                      onClick={() => handleToggleGateway(gw)}
                      className="rounded-xl text-xs font-bold"
                    >
                      {gw.is_active ? "Desativar" : "Ativar Provedor"}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-600">Chave Pública / Client ID</Label>
                      <Input 
                        value={gw.config?.public_key || ""} 
                        onChange={(e) => {
                          const newGateways = [...gateways];
                          const idx = gateways.findIndex(g => g.id === gw.id);
                          newGateways[idx].config = { ...newGateways[idx].config, public_key: e.target.value };
                          setGateways(newGateways);
                        }} 
                        placeholder="pk_test_..."
                        className="bg-white text-xs font-mono"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase text-slate-600">Chave Secreta / Access Token</Label>
                      <Input 
                        type="password"
                        value={gw.config?.secret_key || ""} 
                        onChange={(e) => {
                          const newGateways = [...gateways];
                          const idx = gateways.findIndex(g => g.id === gw.id);
                          newGateways[idx].config = { ...newGateways[idx].config, secret_key: e.target.value };
                          setGateways(newGateways);
                        }} 
                        placeholder="sk_test_..."
                        className="bg-white text-xs font-mono"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="h-9 rounded-xl text-xs font-bold"
                      onClick={() => handleSaveKeys(gw)}
                    >
                      Salvar Chaves de {gw.name}
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Checkout Customizer */}
      <div className="space-y-6">
        <Card className="border-none shadow-sm bg-white sticky top-24">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-black">
              <Layout className="h-5 w-5 text-primary" /> Checkout Customizer
            </CardTitle>
            <CardDescription className="text-xs">Personalize a experiência de pagamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-bold">Tema Visual do Checkout</Label>
              <select 
                className="w-full h-10 rounded-xl border bg-slate-50 px-3 text-xs font-bold"
                value={checkoutSettings?.active_theme || "glassmorphism"}
                onChange={(e) => setCheckoutSettings({ ...checkoutSettings, active_theme: e.target.value })}
              >
                <option value="glassmorphism">Glassmorphism Elite</option>
                <option value="minimalist">Minimalista Clean</option>
                <option value="corporate">Corporativo Sólido</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Cor de Destaque</Label>
              <div className="flex gap-2">
                <Input 
                  value={checkoutSettings?.primary_color || "#2563eb"} 
                  onChange={(e) => setCheckoutSettings({ ...checkoutSettings, primary_color: e.target.value })}
                  className="text-xs"
                />
                <input 
                  type="color" 
                  value={checkoutSettings?.primary_color || "#2563eb"}
                  onChange={(e) => setCheckoutSettings({ ...checkoutSettings, primary_color: e.target.value })}
                  className="h-10 w-12 rounded border cursor-pointer p-0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold">Selo de Segurança</Label>
              <div className="flex items-center gap-2 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
                <Input 
                  value={checkoutSettings?.security_badge_text || "Pagamento 100% Seguro & Criptografado"}
                  onChange={(e) => setCheckoutSettings({ ...checkoutSettings, security_badge_text: e.target.value })}
                  className="bg-transparent border-none h-auto p-0 text-xs font-bold text-emerald-800 focus-visible:ring-0"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button 
                className="w-full bg-slate-900 hover:bg-black text-white rounded-xl font-bold text-xs gap-2"
                onClick={handleSaveCheckoutSettings}
              >
                <Save className="h-4 w-4" /> Salvar Estética do Checkout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
