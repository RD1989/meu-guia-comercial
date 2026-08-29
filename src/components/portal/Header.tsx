import { MapPin, Menu, LogOut, User, LayoutDashboard, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatform } from "@/contexts/PlatformContext";
import { CitySelector } from "@/components/portal/CitySelector";

export function Header() {
  const { user, signOut, isSuperAdmin, isAdmin, isLojista } = useAuth();
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

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-slate-100/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8 h-20 gap-4">
        
        {/* LOGO + CITY SELECTOR */}
        <div className="flex items-center gap-4 shrink-0">
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

          <div className="hidden sm:block">
            <CitySelector variant="header" />
          </div>
        </div>

        {/* Desktop nav - Fluid and centered without breaking at medium sizes */}
        <nav className="hidden xl:flex items-center gap-1 bg-slate-50/70 backdrop-blur-md border border-slate-100 p-1 rounded-2xl">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="px-4 py-2 text-[11px] font-[900] uppercase tracking-widest text-slate-500 hover:text-primary hover:bg-white rounded-xl transition-all"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Nav / Elite Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl border border-primary/10 h-10 px-3">
                    <LayoutDashboard className="h-3.5 w-3.5" /> Admin
                  </Button>
                </Link>
              )}
              {isLojista && !isAdmin && (
                <Link to="/dashboard">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-black uppercase text-[10px] tracking-widest hover:bg-primary/5 rounded-xl border border-primary/10 h-10 px-3">
                    <Store className="h-3.5 w-3.5" /> Painel Lojista
                  </Button>
                </Link>
              )}
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="text-slate-600 font-black uppercase text-[10px] tracking-widest gap-2 hover:bg-slate-50 rounded-xl h-10 px-3">
                  <User className="h-3.5 w-3.5" /> Perfil
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-xl h-10 w-10 p-0" title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="ghost" className="text-slate-600 hover:text-primary hover:bg-primary/5 rounded-xl px-5 font-black uppercase text-[10px] tracking-widest h-11">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-primary hover:bg-primary/90 text-white rounded-2xl px-6 font-black uppercase text-[10px] tracking-wider h-11 shadow-lg shadow-primary/20 border-none transition-all active:scale-95">
                  Anunciar Grátis
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu Toggle */}
        <Sheet>
          <SheetTrigger asChild className="xl:hidden">
            <Button variant="ghost" size="icon" className="rounded-2xl h-11 w-11 hover:bg-slate-50 border border-slate-100">
              <Menu className="h-5 w-5 text-slate-900" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[340px] p-0 border-none bg-white rounded-l-[2.5rem]">
            <SheetHeader className="p-6 bg-slate-50/50 border-b border-slate-100">
              <SheetTitle className="text-left flex items-center justify-start gap-3">
                 <div className="h-9 w-9 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                   <MapPin className="h-5 w-5 text-white" />
                 </div>
                 <span className="font-[900] text-slate-900 text-lg tracking-tight">
                   {config.platform_name}
                 </span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-6 flex flex-col gap-1 overflow-y-auto max-h-[calc(100vh-100px)]">
              <div className="mb-4 pb-4 border-b border-slate-100 sm:hidden">
                <p className="text-[10px] font-black uppercase tracking-wider text-slate-400 mb-2">Sua Cidade:</p>
                <CitySelector variant="drawer" />
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:bg-primary/5 hover:text-primary rounded-xl transition-all"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                {user ? (
                  <>
                    {isAdmin && (
                      <Link to="/admin" className="px-4 py-3.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 rounded-xl transition-all flex items-center gap-3">
                        <LayoutDashboard className="h-4 w-4" /> Painel Super Admin
                      </Link>
                    )}
                    {isLojista && (
                      <Link to="/dashboard" className="px-4 py-3.5 text-xs font-black uppercase tracking-widest text-primary bg-primary/5 border border-primary/10 rounded-xl transition-all flex items-center gap-3">
                        <Store className="h-4 w-4" /> Painel do Lojista
                      </Link>
                    )}
                    <Link to="/perfil" className="px-4 py-3.5 text-xs font-black uppercase tracking-widest text-slate-900 bg-slate-50 border border-slate-100 rounded-xl transition-all flex items-center gap-3">
                      <User className="h-4 w-4 text-slate-600" /> Meu Perfil
                    </Link>
                    <button onClick={handleSignOut} className="px-4 py-3.5 text-xs font-black uppercase tracking-widest text-rose-500 hover:bg-rose-50 rounded-xl transition-all flex items-center gap-3 text-left">
                      <LogOut className="h-4 w-4" /> Sair da Conta
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full border-slate-200 text-slate-600 rounded-xl h-12 font-black uppercase text-[10px] tracking-widest">
                        Entrar na Conta
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register">
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-12 font-black uppercase text-[10px] tracking-widest shadow-lg shadow-primary/20 border-none">
                        Anunciar Grátis
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
