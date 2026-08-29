import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate, useLocation } from "react-router-dom";
import { Loader2, Eye, EyeOff, KeyRound, Store, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { usePlatform } from "@/contexts/PlatformContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(initialMode !== "register");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [accountType, setAccountType] = useState<"consumidor" | "lojista">("lojista");

  // Forgot Password state
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);

  const { signIn, signUp, user, userRole } = useAuth();
  const { config } = usePlatform();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/";

  useEffect(() => {
    if (user && userRole) {
      // Redireciona para a rota de origem ou para o destino adequado ao perfil
      if (from !== "/" && from !== "/auth") {
        navigate(from, { replace: true });
      } else if (userRole === "LOJISTA") {
        navigate("/dashboard", { replace: true });
      } else if (userRole === "SUPERADMIN" || userRole === "ADMIN") {
        navigate("/admin", { replace: true });
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, userRole, navigate, from]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await signIn(email, password);
        if (error) {
          toast.error(error.message === "Invalid login credentials" 
            ? "E-mail ou senha incorretos" 
            : error.message);
        } else {
          toast.success("Login realizado com sucesso!");
          // Redirect é tratado pelo useEffect acima
        }
      } else {
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name, accountType);
        if (error) {
          toast.error(error.message);
        } else {
          toast.success("Conta criada! Verifique seu e-mail para confirmar.");
        }
      }
    } catch (err) {
      toast.error("Ocorreu um erro. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Informe seu e-mail cadastrado.");
      return;
    }
    setForgotLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(forgotEmail, {
        redirectTo: `${window.location.origin}/perfil`,
      });
      if (error) throw error;
      toast.success("E-mail de recuperação enviado! Verifique sua caixa de entrada.");
      setForgotOpen(false);
      setForgotEmail("");
    } catch (err: any) {
      toast.error(err.message || "Erro ao solicitar recuperação de senha.");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo container matching reference */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 group">
            {config.platform_logo_url ? (
              <img src={config.platform_logo_url} alt="Logo" className="h-10 object-contain" />
            ) : (
              <span className="font-extrabold text-slate-800 text-2xl tracking-tight">
                <span className="text-primary mr-1">📍</span>
                {config.platform_name}
              </span>
            )}
          </Link>
        </div>

        {/* Clean White Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 sm:p-10">
          <h2 className="text-2xl font-bold text-slate-900 text-center mb-2">
            {isLogin ? "Acessar o Painel" : "Criar sua Conta"}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            {isLogin
              ? "Entre com seus dados para acessar a plataforma"
              : "Escolha como deseja usar a plataforma"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Seletor de Tipo de Conta — só no cadastro */}
            {!isLogin && (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setAccountType("consumidor")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    accountType === "consumidor"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <ShoppingBag className="h-6 w-6" />
                  <span className="text-xs font-bold uppercase tracking-wide">Consumidor</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Buscar, avaliar e agendar</span>
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("lojista")}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                    accountType === "lojista"
                      ? "border-primary bg-primary/5 text-primary shadow-sm"
                      : "border-slate-200 text-slate-500 hover:border-slate-300"
                  }`}
                >
                  <Store className="h-6 w-6" />
                  <span className="text-xs font-bold uppercase tracking-wide">Lojista</span>
                  <span className="text-[10px] text-slate-400 leading-tight">Anunciar minha empresa</span>
                </button>
              </div>
            )}

            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">
                  {accountType === "lojista" ? "Nome da Empresa / Responsável *" : "Seu Nome Completo *"}
                </Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={accountType === "lojista" ? "Sua Empresa" : "Seu nome"}
                  className="mt-1 h-12 rounded-lg border-slate-300 bg-white"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">Email *</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1 h-12 rounded-lg border-slate-300 bg-white"
                required
                disabled={loading}
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha *</Label>
                {isLogin && (
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email);
                      setForgotOpen(true);
                    }}
                    className="text-xs text-primary font-bold hover:underline"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative mt-1">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="h-12 rounded-lg border-slate-300 bg-white pr-11"
                  required
                  minLength={6}
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            
            <div className="pt-2">
               <Button type="submit" className="w-full h-12 rounded-lg font-bold text-base bg-primary hover:bg-primary/90 text-white shadow-none transition-colors" disabled={loading}>
                 {loading ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                 ) : isLogin ? (
                   "Entrar na conta"
                 ) : accountType === "lojista" ? (
                   "Cadastrar como Lojista"
                 ) : (
                   "Cadastrar como Consumidor"
                 )}
               </Button>
            </div>
          </form>

          <div className="mt-8 text-center text-sm">
            <span className="text-slate-500">
              {isLogin ? "Ainda não tem cadastro?" : "Já tem uma conta?"}
            </span>{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="font-bold text-primary hover:text-primary/80 transition-colors"
              disabled={loading}
            >
              {isLogin ? "Cadastre-se" : "Fazer login"}
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl bg-white p-6">
          <DialogHeader>
            <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-2">
              <KeyRound className="h-5 w-5" />
            </div>
            <DialogTitle className="text-xl font-black text-slate-900">Recuperar Senha</DialogTitle>
            <DialogDescription className="text-slate-500 text-sm">
              Digite seu e-mail cadastrado para enviarmos um link seguro de redefinição de senha.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleForgotPassword} className="space-y-4 mt-2">
            <div>
              <Label htmlFor="forgot-email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Seu E-mail</Label>
              <Input
                id="forgot-email"
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1 h-12 rounded-xl"
                required
                disabled={forgotLoading}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-0 mt-4">
              <Button type="button" variant="outline" onClick={() => setForgotOpen(false)} className="rounded-xl h-11">
                Cancelar
              </Button>
              <Button type="submit" className="bg-primary hover:bg-primary/90 text-white rounded-xl h-11 font-bold" disabled={forgotLoading}>
                {forgotLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                Enviar Link
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Auth;
