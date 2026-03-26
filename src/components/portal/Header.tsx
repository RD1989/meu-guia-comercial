import { MapPin, Menu, LogOut, User, LayoutDashboard } from "lucide-react";
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
    { label: "Empresas", href: "/buscar" },
    { label: "Categorias", href: "/categorias" },
    { label: "Ofertas", href: "/ofertas" },
    { label: "Comunidade", href: "/comunidade" },
    { label: "Blog", href: "/blog" },
    { label: "Planos", href: "/planos" },
  ];

  const isSuperAdmin = userRole === "SUPERADMIN";

  return (
    <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-2xl border-b border-white/20 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-10 h-20">
        
        {/* LOGO ELITE */}
        <Link to="/" className="flex items-center gap-3 group transition-all shrink-0">
          <div className="flex items-center justify-center transition-transform group-hover:scale-105">
            {config.platform_logo_url ? (
              <img src={config.platform_logo_url} alt="Logo" className="h-10 object-contain" />
            ) : (
              <span className="font-[900] text-slate-900 text-xl tracking-tighter flex items-center">
                 <div className="h-8 w-8 rounded-xl bg-primary flex items-center justify-center mr-2 shadow-lg shadow-primary/20">
                   <MapPin className="h-5 w-5 text-white" />
                 </div>
                 {config.platform_name}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop nav - High Fidelity Spacing */}
        <nav className="hidden lg:flex items-center gap-1 absolute left-1/2 -translate-x-1/2 bg-slate-50/50 backdrop-blur-md border border-slate-100 p-1 rounded-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-5 py-2 text-[11px] font-[900] uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-white rounded-xl transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Nav / Elite Buttons */}
        <div className="hidden md:flex items-center gap-4 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl border border-primary/10 h-10 px-4">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Painel
                  </Button>
                </Link>
              )}
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="text-slate-600 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 rounded-xl h-10 px-4">
                  <User className="h-3.5 w-3.5" /> Perfil
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl h-10 w-10 p-0" title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest h-12">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-8 font-black uppercase text-[10px] tracking-[0.15em] h-12 shadow-[0_10px_25px_-5px_rgba(255,107,44,0.4)] border-none transition-all active:scale-95">
                  Anunciar Grátis
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu Toggle */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-2xl h-12 w-12 hover:bg-slate-50 border border-slate-100">
              <Menu className="h-6 w-6 text-slate-900" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[320px] p-0 border-none bg-white rounded-l-[3rem]">
            <SheetHeader className="p-8 bg-slate-50/50 border-b border-slate-100">
              <SheetTitle className="text-left flex items-center justify-start gap-4">
                 <div className="h-10 w-10 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                   <MapPin className="h-6 w-6 text-white" />
                 </div>
                 <span className="font-[900] text-slate-900 text-xl tracking-tighter">
                   {config.platform_name}
                 </span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-8 flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-5 py-4 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-primary/5 hover:text-primary rounded-2xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-12 flex flex-col gap-4">
                {user ? (
                  <>
                    <Link to="/perfil" className="px-5 py-5 text-xs font-black uppercase tracking-widest text-slate-900 bg-slate-50 border border-slate-100 rounded-2xl transition-all flex items-center gap-4">
                      <User className="h-5 w-5 text-primary" /> Meu Perfil
                    </Link>
                    <button onClick={handleSignOut} className="px-5 py-5 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-2xl transition-all flex items-center gap-4 text-left">
                      <LogOut className="h-5 w-5" /> Sair do Sistema
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-600 rounded-2xl h-14 font-black uppercase text-[11px] tracking-widest">
                        Entrar na Conta
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-2xl h-14 font-black uppercase text-[11px] tracking-widest shadow-xl shadow-primary/30 border-none">
                        Anunciar Agora
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
