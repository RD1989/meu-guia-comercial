import { useState, useEffect } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { usePlatform } from "@/contexts/PlatformContext";

const Auth = () => {
  const [searchParams] = useSearchParams();
  const initialMode = searchParams.get("mode");
  const [isLogin, setIsLogin] = useState(initialMode !== "register");
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const { config } = usePlatform();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/", { replace: true });
    }
  }, [user, navigate]);

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
          navigate("/");
        }
      } else {
        if (password.length < 6) {
          toast.error("A senha deve ter pelo menos 6 caracteres");
          setLoading(false);
          return;
        }
        const { error } = await signUp(email, password, name);
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

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Logo container matching reference */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
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
            {isLogin ? "Acessar o Painel" : "Cadastre sua Empresa"}
          </h2>
          <p className="text-sm text-slate-500 text-center mb-8">
            {isLogin
              ? "Entre com seus dados para gerenciar seus negócios"
              : "Preencha os dados abaixo para começar a anunciar"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-sm font-medium text-slate-700">Nome da Empresa / Responsável *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Sua Empresa"
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
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">Senha *</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="mt-1 h-12 rounded-lg border-slate-300 bg-white"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            
            <div className="pt-2">
               <Button type="submit" className="w-full h-12 rounded-lg font-bold text-base bg-primary hover:bg-primary/90 text-white shadow-none transition-colors" disabled={loading}>
                 {loading ? (
                   <Loader2 className="h-5 w-5 animate-spin" />
                 ) : isLogin ? (
                   "Entrar na conta"
                 ) : (
                   "Cadastrar Empresa"
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
    </div>
  );
};

export default Auth;
