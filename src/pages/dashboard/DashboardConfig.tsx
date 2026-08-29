import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { usePlanLimits } from "@/hooks/use-plan-limits";
import { useBusiness } from "@/hooks/use-business";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { 
  CreditCard, 
  Shield, 
  Lock, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Loader2,
  KeyRound,
  Eye,
  EyeOff
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DashboardConfig() {
  const { user } = useAuth();
  const { limits, isPlanActive } = usePlanLimits();
  const { business } = useBusiness();
  const navigate = useNavigate();

  // Change Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword) {
      toast.error("Digite a nova senha.");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres.");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }

    setPassLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success("Senha alterada com sucesso!");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      toast.error("Erro ao alterar senha: " + err.message);
    } finally {
      setPassLoading(false);
    }
  };

  const planTierNames: Record<string, string> = {
    FREE: "Plano Gratuito",
    BASIC: "Plano Essencial",
    PRO: "Plano Profissional (PRO)",
    MAX: "Plano Diamante (MAX)",
  };

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-3xl space-y-6 font-sans">
        <div>
          <h2 className="text-2xl font-[900] text-slate-900 tracking-tight">Configurações da Conta</h2>
          <p className="text-xs text-slate-500 font-medium mt-1">Gerencie seus dados de acesso, segurança e plano de assinatura.</p>
        </div>

        {/* 1. Card do Plano de Assinatura Atual */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-primary/10 rounded-xl text-primary">
                  <CreditCard className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-black text-slate-900">Plano & Assinatura</CardTitle>
                  <CardDescription className="text-xs text-slate-500">Recursos e limites disponíveis para o seu estabelecimento.</CardDescription>
                </div>
              </div>
              <Badge className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 ${
                limits.tier === 'FREE' ? 'bg-slate-100 text-slate-600' : 'bg-primary text-white shadow-md shadow-primary/20'
              }`}>
                {planTierNames[limits.tier] || "Gratuito"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400">Fotos no Catálogo</span>
                <p className="text-sm font-black text-slate-900 mt-1">Até {limits.maxPhotos} fotos</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400">Produtos no Menu</span>
                <p className="text-sm font-black text-slate-900 mt-1">Até {limits.maxProducts} itens</p>
              </div>
              <div className="p-3.5 bg-slate-50 rounded-2xl">
                <span className="text-[10px] font-bold uppercase text-slate-400">Prioridade de Busca</span>
                <p className="text-sm font-black text-slate-900 mt-1">{limits.priority}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <p className="text-xs text-slate-500 font-medium">
                Deseja desbloquear mais fotos, vídeos e destaque máximo nas buscas da cidade?
              </p>
              <Button 
                onClick={() => navigate("/planos")}
                className="w-full sm:w-auto rounded-2xl h-11 px-6 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-primary/20 shrink-0"
              >
                <Sparkles className="h-4 w-4" /> Mudar de Plano
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 2. Dados Pessoais & Conta */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-slate-100 rounded-xl text-slate-700">
                <Shield className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900">Dados do Perfil</CardTitle>
                <CardDescription className="text-xs text-slate-500">Informações vinculadas ao seu login.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nome de Cadastro</Label>
                <Input 
                  value={user?.user_metadata?.name || "Lojista"} 
                  disabled 
                  className="bg-slate-50 rounded-xl text-xs font-bold text-slate-600 border-none"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">E-mail de Login</Label>
                <Input 
                  value={user?.email || ""} 
                  disabled 
                  className="bg-slate-50 rounded-xl text-xs font-mono text-slate-600 border-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 3. Alteração de Senha Segura */}
        <Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
          <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base font-black text-slate-900">Segurança & Senha</CardTitle>
                <CardDescription className="text-xs text-slate-500">Atualize sua senha de acesso a qualquer momento.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Nova Senha</Label>
                <div className="relative">
                  <Input 
                    type={showPass ? "text" : "password"} 
                    placeholder="Mínimo 6 caracteres"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10 rounded-xl text-xs font-bold bg-slate-50 border-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-slate-700">Confirmar Nova Senha</Label>
                <Input 
                  type={showPass ? "text" : "password"} 
                  placeholder="Repita a nova senha"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="rounded-xl text-xs font-bold bg-slate-50 border-none"
                />
              </div>

              <Button
                type="submit"
                disabled={passLoading}
                className="rounded-2xl h-11 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider"
              >
                {passLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Lock className="h-3.5 w-3.5 mr-2" />}
                Atualizar Senha
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
