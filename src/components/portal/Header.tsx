import { MapPin, Menu, LogOut, User, Sparkles, LayoutDashboard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatform } from "@/contexts/PlatformContext";

export function Header() {
  const { user, signOut, userRole } = useAuth();
  const { config } = usePlatform();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const navLinks = [
    { label: "Início", href: "/" },
    { label: "Categorias", href: "/buscar" },
    { label: "Blog", href: "/blog" },
  ];

  const isSuperAdmin = userRole === "SUPERADMIN";

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 md:px-6 h-16">
        <Link to="/" className="flex items-center gap-2 group transition-all">
          <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20 group-hover:scale-110 transition-transform">
            {config.platform_logo_url ? (
              <img src={config.platform_logo_url} alt="Logo" className="h-6 w-6 object-contain" />
            ) : (
              <MapPin className="h-5 w-5 text-white" />
            )}
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-slate-800 text-lg leading-none tracking-tight">
              {config.platform_name}
            </span>
            <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-0.5">
              {config.platform_city}
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-primary transition-all rounded-full hover:bg-slate-50"
            >
              {link.label}
            </Link>
          ))}
          
          <div className="h-6 w-px bg-slate-100 mx-2" />

          {user ? (
            <div className="flex items-center gap-2">
              {isSuperAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold hover:bg-primary/5 rounded-full border border-primary/20">
                    <LayoutDashboard className="h-4 w-4" /> Painel Admin
                  </Button>
                </Link>
              )}
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="px-4 text-slate-600 font-semibold gap-2 hover:bg-slate-100 rounded-full">
                  <User className="h-4 w-4" /> Perfil
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-400 hover:text-destructive gap-2 rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors">
                Entrar
              </Link>
              <Link to="/auth">
                <Button className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 rounded-full px-6 font-bold text-sm gap-2">
                  <Sparkles className="h-4 w-4" /> Divulgar Empresa
                </Button>
              </Link>
            </div>
          )}
        </nav>

        {/* Mobile menu */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
              <Menu className="h-6 w-6 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:w-[350px] p-0 border-none bg-slate-50">
            <SheetHeader className="p-6 bg-white border-b border-slate-100">
              <SheetTitle className="text-left flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold">
                  {config.platform_name.charAt(0)}
                </div>
                <div className="flex flex-col text-left">
                  <span className="text-lg font-black text-slate-800 leading-tight">{config.platform_name}</span>
                  <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">{config.platform_city}</span>
                </div>
              </SheetTitle>
            </SheetHeader>
            <div className="p-6 flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2 px-4">Navegação</span>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-6 py-4 text-base font-bold text-slate-700 hover:bg-white hover:text-primary rounded-2xl transition-all shadow-sm border border-transparent hover:border-slate-100"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4 px-4 block">Sua Conta</span>
                {user ? (
                  <div className="flex flex-col gap-2">
                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        className="px-6 py-4 text-base font-bold text-primary bg-primary/5 rounded-2xl transition-all border border-primary/10 flex items-center gap-3"
                      >
                        <LayoutDashboard className="h-5 w-5" /> Painel Admin
                      </Link>
                    )}
                    <Link
                      to="/perfil"
                      className="px-6 py-4 text-base font-bold text-slate-700 hover:bg-white rounded-2xl transition-all flex items-center gap-3"
                    >
                      <User className="h-5 w-5" /> Meu Perfil
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="px-6 py-4 text-base font-bold text-destructive hover:bg-red-50 rounded-2xl transition-all flex items-center gap-3 text-left"
                    >
                      <LogOut className="h-5 w-5" /> Sair do Sistema
                    </button>
                  </div>
                ) : (
                  <Link
                    to="/auth"
                    className="px-6 py-5 text-base font-black text-white bg-primary rounded-2xl transition-all flex items-center justify-center shadow-lg shadow-primary/20 gap-3"
                  >
                    <Sparkles className="h-5 w-5" /> Criar Conta Grátis
                  </Link>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
