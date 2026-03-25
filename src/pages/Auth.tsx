import { useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already logged in
  if (user) {
    navigate("/", { replace: true });
    return null;
  }

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
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <MapPin className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-xl tracking-tight">Meu Guia</span>
        </Link>

        <Card className="p-6">
          <h2 className="text-lg font-bold text-foreground text-center mb-1">
            {isLogin ? "Entrar na conta" : "Criar conta"}
          </h2>
          <p className="text-xs text-muted-foreground text-center mb-6">
            {isLogin
              ? "Acesse sua conta para gerenciar seu negócio"
              : "Crie sua conta para começar"}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <Label htmlFor="name" className="text-xs">Nome completo</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Seu nome"
                  className="mt-1.5 h-11 rounded-xl"
                  required={!isLogin}
                  disabled={loading}
                />
              </div>
            )}
            <div>
              <Label htmlFor="email" className="text-xs">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                className="mt-1.5 h-11 rounded-xl"
                required
                disabled={loading}
              />
            </div>
            <div>
              <Label htmlFor="password" className="text-xs">Senha</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="mt-1.5 h-11 rounded-xl"
                required
                minLength={6}
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl font-semibold" disabled={loading}>
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Criar conta"
              )}
            </Button>
          </form>

          <p className="text-xs text-muted-foreground text-center mt-4">
            {isLogin ? "Não tem conta?" : "Já tem conta?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-medium hover:underline"
              disabled={loading}
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </button>
          </p>
        </Card>
      </div>
    </div>
  );
};

export default Auth;
