import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { paymentService, CheckoutSettings } from "@/services/payment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldCheck, CreditCard, CheckCircle2, QrCode, ArrowLeft, Lock } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

export default function Checkout() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<CheckoutSettings | null>(null);
  const [method, setMethod] = useState<'pix' | 'card' | 'boleto'>('pix');
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');

  // Dados mockados baseados nos params da URL
  const planId = searchParams.get("plan");
  const amount = searchParams.get("amount") || "0";
  const planName = searchParams.get("name") || "Plano Profissional";

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const s = await paymentService.getCheckoutSettings();
        setSettings(s);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handlePayment = async () => {
    if (!planId) {
      toast.error("Plano inválido");
      return;
    }

    setStatus('processing');
    
    try {
      // 1. Buscar o tenant do usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: business } = await supabase
        .from('businesses')
        .select('tenant_id')
        .eq('owner_id', user.id)
        .single();

      if (!business) throw new Error("Negócio não encontrado para este usuário");

      // 2. Mapear o planId para o Enum do banco
      const tierMap: Record<string, any> = {
        'prof': 'PRO',
        'elite': 'MAX',
        'free': 'FREE'
      };

      const newTier = tierMap[planId as string] || 'PRO';

      // 3. Atualizar o tenant
      const { error: updateError } = await supabase
        .from('tenants')
        .update({ 
          plan_tier: newTier,
          plan_status: 'ACTIVE'
        })
        .eq('id', business.tenant_id);

      if (updateError) throw updateError;

      // Sucesso simulado (delay de rede)
      setTimeout(() => {
        setStatus('success');
        toast.success("Plano ativado com sucesso!");
      }, 1500);

    } catch (err: any) {
      console.error(err);
      toast.error("Erro ao ativar plano: " + err.message);
      setStatus('idle');
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center font-black animate-pulse">CARREGANDO CHECKOUT ELITE...</div>;

  const isGlass = settings?.active_theme === 'glassmorphism';

  return (
    <div className={`min-h-screen pb-20 pt-10 px-4 transition-colors duration-500 ${isGlass ? 'bg-slate-900 text-white' : 'bg-slate-50 text-slate-900'}`}>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate(-1)} className={`gap-2 ${isGlass ? 'text-slate-300 hover:text-white hover:bg-white/10' : ''}`}>
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          {settings?.show_logo && (
            <div className="font-black text-xl tracking-tighter italic">
              GUIA<span style={{ color: settings.primary_color }}>COMERCIAL</span>
            </div>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-5">
          {/* Lado Esquerdo: Formulário */}
          <div className="md:col-span-3 space-y-6">
            <h1 className="text-3xl font-black tracking-tight mb-2">Finalize seu Investimento</h1>
            
            <div className="flex gap-2">
              {[
                { id: 'pix', label: 'Pix', icon: QrCode },
                { id: 'card', label: 'Cartão', icon: CreditCard },
              ].map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => setMethod(m.id)}
                  className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                    method === m.id 
                    ? `border-2 scale-105 shadow-xl` 
                    : `opacity-50 grayscale hover:opacity-80`
                  }`}
                  style={{ 
                    borderColor: method === m.id ? settings?.primary_color : 'transparent',
                    backgroundColor: method === m.id ? (isGlass ? 'rgba(255,255,255,0.05)' : '#fff') : (isGlass ? 'rgba(255,255,255,0.02)' : '#f1f5f9')
                  }}
                >
                  <m.icon className="h-4 w-4" /> {m.label}
                </button>
              ))}
            </div>

            <Card className={`border-none shadow-2xl overflow-hidden rounded-[2rem] ${isGlass ? 'glass-morphism text-white' : 'bg-white'}`}>
              <CardContent className="p-8">
                <AnimatePresence mode="wait">
                  {method === 'pix' ? (
                    <motion.div 
                      key="pix"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-center space-y-6"
                    >
                      <div className="bg-white p-6 rounded-3xl w-48 h-48 mx-auto shadow-inner flex items-center justify-center border-4 border-slate-100">
                        <QrCode className="h-32 w-32 text-slate-800" />
                      </div>
                      <div>
                        <p className="text-sm font-bold opacity-70 mb-2">Escaneie o QR Code ou copie a linha digitável</p>
                        <div className={`p-4 rounded-xl font-mono text-xs break-all ${isGlass ? 'bg-white/5' : 'bg-slate-50'}`}>
                          00020126330014br.gov.bcb.pix0111000000000005204000053039865405{amount}5802BR5913GUIACOMERCIAL6009SAOPAULO62070503***6304{Math.floor(Math.random()*9999).toString().padStart(4, '0')}
                        </div>
                      </div>
                      <Button 
                        onClick={handlePayment} 
                        disabled={status !== 'idle'}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all"
                        style={{ backgroundColor: settings?.primary_color }}
                      >
                        {status === 'processing' ? 'Verificando...' : status === 'success' ? 'Pago!' : 'Confirmar Pagamento'}
                      </Button>
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
                        onClick={handlePayment} 
                        disabled={status !== 'idle'}
                        className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-sm shadow-xl hover:scale-[1.02] active:scale-95 transition-all mt-4"
                        style={{ backgroundColor: settings?.primary_color }}
                      >
                         {status === 'processing' ? 'Processando...' : 'Finalizar com Cartão'}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            <div className="flex items-center justify-center gap-6 opacity-40">
               <ShieldCheck className="h-10 w-10 text-emerald-500" />
               <div className="text-[10px] font-black uppercase leading-tight">
                 Transação 256-bit SSL<br/>Invisível & Protegida
               </div>
            </div>
          </div>

          {/* Lado Direito: Resumo */}
          <div className="md:col-span-2 space-y-6">
             <Card className={`border-none shadow-xl rounded-[2rem] overflow-hidden ${isGlass ? 'bg-white/5 border border-white/10 text-white' : 'bg-slate-100'}`}>
                <CardHeader>
                  <CardTitle className="text-sm font-black uppercase tracking-widest opacity-60">Resumo da Ordem</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-bold">{planName}</span>
                    <span className="font-black">R$ {amount}</span>
                  </div>
                  <div className="h-px bg-current opacity-10 my-2" />
                  <div className="flex justify-between items-center text-xl">
                    <span className="font-black uppercase tracking-tighter">Total</span>
                    <span className="font-black" style={{ color: settings?.primary_color }}>R$ {amount}</span>
                  </div>
                </CardContent>
                <div className="p-4 bg-black/20 text-center">
                   <p className="text-[10px] font-bold opacity-50 uppercase">{settings?.security_badge_text}</p>
                </div>
             </Card>

             <div className="p-6 rounded-3xl border-2 border-dashed border-slate-300 opacity-50 space-y-4">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-xs font-bold">Acesso imediato após confirmação</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5" />
                  <p className="text-xs font-bold">Nota fiscal enviada por e-mail</p>
                </div>
             </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
           <div className="flex items-center justify-center gap-2 text-[10px] font-bold opacity-30 uppercase">
             <Lock className="h-3 w-3" /> Secure Checkout by Antigravity Payment Engine
           </div>
        </div>
      </div>

      {status === 'success' && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 backdrop-blur-xl"
        >
          <div className="bg-white rounded-[3rem] p-12 text-center max-w-sm space-y-6">
             <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-10 w-10 text-emerald-600" />
             </div>
             <h2 className="text-2xl font-black text-slate-900 tracking-tight">Pagamento Sucesso!</h2>
             <p className="text-slate-500 font-bold text-sm">Sua assinatura foi ativada e você já pode começar a anunciar.</p>
             <Button onClick={() => navigate('/dashboard')} className="w-full h-14 rounded-2xl text-lg font-black uppercase tracking-widest shadow-xl">
               Ir para Dashboard
             </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}
