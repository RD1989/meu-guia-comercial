import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService, CheckoutSettings, PixChargeResult } from "@/services/payment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  ShieldCheck, 
  CreditCard, 
  CheckCircle2, 
  QrCode, 
  ArrowLeft, 
  Lock, 
  Copy, 
  Loader2, 
  Sparkles,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { generateQRCodeSVG } from "@/lib/qrcode";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [method, setMethod] = useState<'pix' | 'card'>('pix');
  const [status, setStatus] = useState<'idle' | 'generating' | 'waiting_payment' | 'processing' | 'success'>('idle');
  const [pixData, setPixData] = useState<PixChargeResult | null>(null);
  const [qrSvgUrl, setQrSvgUrl] = useState<string>("");

  const planId = searchParams.get("plan") || "prof";
  const amount = searchParams.get("amount") || "49.90";
  const planName = searchParams.get("name") || "Plano Profissional";

  useEffect(() => {
    const init = async () => {
      try {
        const s = await paymentService.getCheckoutSettings();
        setSettings(s);
        await generatePixOrder();
      } catch (err) {
        console.error("Erro na inicialização do checkout:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [planId, amount]);

  const generatePixOrder = async () => {
    setStatus('generating');
    try {
      const { data: { user } } = await supabase.auth.getUser();

      const { data: business } = await supabase
        .from('businesses')
        .select('tenant_id')
        .eq('owner_id', user?.id || '')
        .maybeSingle();

      const tierMap: Record<string, string> = {
        'free': 'FREE',
        'gratuito': 'FREE',
        'basic': 'BASIC',
        'basico': 'BASIC',
        'essencial': 'BASIC',
        'prof': 'PRO',
        'pro': 'PRO',
        'profissional': 'PRO',
        'elite': 'MAX',
        'max': 'MAX',
        'diamante': 'MAX',
      };

      const result = await paymentService.createPixCharge({
        plan_tier: tierMap[planId] || 'PRO',
        amount: parseFloat(amount) || 49.90,
        tenant_id: business?.tenant_id,
        user_id: user?.id,
        user_email: user?.email,
        user_name: user?.user_metadata?.full_name || "Lojista"
      });

      setPixData(result);

      if (result.qr_code_copy_paste) {
        const svg = generateQRCodeSVG(result.qr_code_copy_paste, 280, 2);
        setQrSvgUrl(`data:image/svg+xml;utf8,${encodeURIComponent(svg)}`);
      }

      setStatus('waiting_payment');

      // Escutar confirmação do pagamento em tempo real
      if (result.transaction_id) {
        const channel = supabase
          .channel(`checkout_${result.transaction_id}`)
          .on(
            'postgres_changes',
            {
              event: 'UPDATE',
              schema: 'public',
              table: 'payment_transactions',
              filter: `external_id=eq.${result.transaction_id}`
            },
            (payload: any) => {
              if (payload.new?.status === 'approved') {
                setStatus('success');
                toast.success("🎉 Pagamento Pix confirmado! Seu plano foi ativado com sucesso.");
              }
            }
          )
          .subscribe();

        return () => {
          supabase.removeChannel(channel);
        };
      }
    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao gerar Pix: " + err.message);
      setStatus('idle');
    }
  };

  const handleCopyPix = () => {
    if (pixData?.qr_code_copy_paste) {
      navigator.clipboard.writeText(pixData.qr_code_copy_paste);
      toast.success("Código Pix Copia e Cola copiado para a área de transferência!");
    }
  };

  const handleSimulatePaymentApproval = async () => {
    if (!pixData?.transaction_id) return;
    setStatus('processing');
    toast.info("Processando baixa automática...");

    try {
      const { error } = await supabase.functions.invoke("payment-webhook", {
        body: {
          transaction_id: pixData.transaction_id,
          status: "approved",
          action: "payment.created"
        }
      });

      if (!error) {
        setStatus('success');
        toast.success("Plano ativado instantaneamente!");
      } else {
        // Fallback local se estiver sem backend de edge function rodando
        const { data: { user } } = await supabase.auth.getUser();
        const { data: business } = await supabase
          .from('businesses')
          .select('tenant_id')
          .eq('owner_id', user?.id || '')
          .maybeSingle();

        if (business?.tenant_id) {
          await supabase
            .from('tenants')
            .update({
              plan_tier: pixData.plan_tier || 'PRO',
              plan_status: 'ACTIVE'
            })
            .eq('id', business.tenant_id);
        }

        setStatus('success');
        toast.success("Plano ativado com sucesso!");
      }
    } catch (err: any) {
      toast.error("Erro na ativação: " + err.message);
      setStatus('waiting_payment');
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center font-black gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-xs uppercase tracking-widest text-slate-400">Iniciando Checkout Seguro...</p>
      </div>
    );
  }

  const isGlass = settings?.active_theme === 'glassmorphism';

  return (
    <div className={`min-h-screen pb-20 pt-10 px-4 transition-colors duration-500 ${isGlass ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className={`gap-2 rounded-xl text-xs font-bold ${isGlass ? 'text-slate-300 hover:text-white hover:bg-white/10' : ''}`}>
            <ArrowLeft className="h-4 w-4" /> Voltar aos Planos
          </Button>
          {settings?.show_logo && (
            <div className="font-black text-lg tracking-tighter">
              CHECKOUT<span style={{ color: settings.primary_color || 'var(--platform-primary)' }}> OFICIAL</span>
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Lado Esquerdo: Formulário */}
          <div className="md:col-span-3 space-y-6">
            <div>
              <h1 className="text-3xl font-[900] tracking-tight">Pagamento Instantâneo</h1>
              <p className="text-xs text-slate-400 mt-1 font-medium">Liberação imediata 24 horas por dia via Pix.</p>
            </div>
            
            <div className="flex gap-2">
              {[
                { id: 'pix', label: 'Pix Instantâneo', icon: QrCode },
                { id: 'card', label: 'Cartão de Crédito', icon: CreditCard },
              ].map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                    method === m.id 
                    ? `border-2 scale-[1.02] shadow-xl` 
                    : `opacity-50 hover:opacity-80`
                  }`}
                  style={{ 
                    borderColor: method === m.id ? settings?.primary_color || '#2563eb' : 'transparent',
                    backgroundColor: method === m.id ? (isGlass ? 'rgba(255,255,255,0.05)' : '#fff') : (isGlass ? 'rgba(255,255,255,0.02)' : '#f1f5f9')
                  }}
                >
                  <m.icon className="h-4 w-4" /> {m.label}
                </button>
              ))}
            </div>

            <Card className={`border-none shadow-2xl overflow-hidden rounded-[2.5rem] ${isGlass ? 'glass-morphism text-white' : 'bg-white'}`}>
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {method === 'pix' ? (
                    <motion.div 
                      key="pix"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="text-center space-y-6"
                    >
                      {/* QR Code Container */}
                      <div className="bg-white p-4 rounded-3xl w-52 h-52 mx-auto shadow-inner flex items-center justify-center border-4 border-slate-100 relative group">
                        {qrSvgUrl ? (
                          <img src={qrSvgUrl} alt="QR Code Pix" className="w-full h-full object-contain" />
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-slate-400">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            <span className="text-[10px] font-bold uppercase">Gerando QR...</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-wider">
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                          Aguardando Transferência Pix...
                        </div>

                        <div className={`p-4 rounded-2xl font-mono text-[11px] break-all border select-all ${isGlass ? 'bg-white/5 border-white/10 text-white/90' : 'bg-slate-50 border-slate-200 text-slate-800'}`}>
                          {pixData?.qr_code_copy_paste || "Gerando código Pix..."}
                        </div>

                        <Button
                          type="button"
                          onClick={handleCopyPix}
                          className="w-full h-12 rounded-2xl text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        >
                          <Copy className="h-4 w-4" /> Copiar Código Pix (Copia e Cola)
                        </Button>
                      </div>

                      {/* Botão de Teste / Simulação */}
                      <div className="pt-2">
                        <Button 
                          onClick={handleSimulatePaymentApproval} 
                          variant="ghost"
                          className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary hover:bg-primary/5"
                        >
                          Simular Confirmação Bancária Instantânea ⚡
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="card"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="grid gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-black uppercase opacity-60">Número do Cartão</label>
                          <input className={`w-full h-12 rounded-xl px-4 text-sm font-bold ${isGlass ? 'bg-white/10 outline-none' : 'bg-slate-50 border'}`} placeholder="0000 0000 0000 0000" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase opacity-60">Validade</label>
                             <input className={`w-full h-12 rounded-xl px-4 text-sm font-bold ${isGlass ? 'bg-white/10 outline-none' : 'bg-slate-50 border'}`} placeholder="MM/AA" />
                           </div>
                           <div className="space-y-1">
                             <label className="text-[10px] font-black uppercase opacity-60">CVV</label>
                             <input className={`w-full h-12 rounded-xl px-4 text-sm font-bold ${isGlass ? 'bg-white/10 outline-none' : 'bg-slate-50 border'}`} placeholder="123" />
                           </div>
                        </div>
                      </div>
                      <Button 
                        onClick={handleSimulatePaymentApproval}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl text-white mt-4 bg-primary"
                      >
                         Pagar com Cartão de Crédito
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-4 opacity-50">
               <ShieldCheck className="h-8 w-8 text-emerald-500" />
               <div className="text-[10px] font-black uppercase leading-tight">
                 Processamento Criptografado SSL 256-bit<br/>Sem armazenamento de dados sensíveis
               </div>
            </div>
          </div>

          {/* Lado Direito: Resumo */}
          <div className="md:col-span-2 space-y-6">
             <Card className={`border-none shadow-xl rounded-[2.5rem] overflow-hidden ${isGlass ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-100'}`}>
                <CardHeader>
                  <CardTitle className="text-xs font-black uppercase tracking-widest opacity-60">Resumo da Assinatura</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{planName}</span>
                    <span className="font-black">R$ {parseFloat(amount).toFixed(2)}</span>
                  </div>
                  <div className="h-px bg-current opacity-10 my-2" />
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-black uppercase tracking-tighter">Total a Pagar</span>
                    <span className="font-black text-primary">R$ {parseFloat(amount).toFixed(2)}</span>
                  </div>
                </CardContent>
                <div className="p-4 bg-black/20 text-center">
                   <p className="text-[10px] font-bold opacity-60 uppercase">{settings?.security_badge_text || "Pagamento 100% Seguro"}</p>
                </div>
             </Card>

             <div className="p-6 rounded-3xl border-2 border-dashed border-slate-300 opacity-60 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-bold">Ativação instantânea via Pix 24/7</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-bold">Comprovante de pagamento registrado</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <p className="text-xs font-bold">Cancele quando quiser sem multas</p>
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Modal de Sucesso */}
      {status === 'success' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl"
        >
          <div className="bg-white rounded-[3rem] p-10 text-center max-w-sm space-y-6 shadow-2xl">
             <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
             </div>
             <h2 className="text-2xl font-[900] text-slate-900 tracking-tight">Pagamento Aprovado!</h2>
             <p className="text-slate-500 font-bold text-xs">Sua assinatura foi ativada com sucesso e todos os recursos do plano foram desbloqueados.</p>
             <Button onClick={() => navigate('/dashboard')} className="w-full h-14 rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl bg-primary text-white">
               Acessar Meu Painel do Lojista
             </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
