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
    { label: "Blog", href: "/blog" },
    { label: "Planos", href: "/planos" },
  ];

  const isSuperAdmin = userRole === "SUPERADMIN";

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-100 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 h-20">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-2 group transition-all shrink-0">
          <div className="flex items-center justify-center">
            {config.platform_logo_url ? (
              <img src={config.platform_logo_url} alt="Logo" className="h-8 object-contain" />
            ) : (
              <span className="font-extrabold text-slate-800 text-xl tracking-tight flex items-center">
                 <MapPin className="h-6 w-6 text-primary mr-1" />
                 {config.platform_name}
              </span>
            )}
          </div>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className="text-sm font-semibold text-slate-500 hover:text-primary transition-colors py-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Nav / Buttons */}
        <div className="hidden md:flex items-center gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-3">
              {isSuperAdmin && (
                <Link to="/admin">
                  <Button variant="ghost" size="sm" className="gap-2 text-primary font-bold hover:bg-primary/5 rounded-lg border border-transparent">
                    <LayoutDashboard className="h-4 w-4" /> Admin
                  </Button>
                </Link>
              )}
              <Link to="/perfil">
                <Button variant="ghost" size="sm" className="text-slate-600 font-semibold gap-2 hover:bg-slate-100 rounded-lg">
                  <User className="h-4 w-4" /> Perfil
                </Button>
              </Link>
              <Button variant="ghost" size="sm" onClick={handleSignOut} className="text-slate-400 hover:text-destructive gap-2 rounded-lg" title="Sair">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link to="/auth">
                <Button variant="outline" className="border-primary text-primary hover:bg-primary hover:text-white rounded-lg px-6 font-bold text-sm h-10 shadow-none">
                  Entrar
                </Button>
              </Link>
              <Link to="/auth?mode=register">
                <Button className="bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl px-7 font-black text-sm h-11 shadow-lg shadow-amber-500/20 border-none transition-all active:scale-95">
                  Anunciar Grátis
                </Button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu Toggle */}
        <Sheet>
          <SheetTrigger asChild className="lg:hidden">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-100">
              <Menu className="h-7 w-7 text-slate-700" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] p-0 border-none bg-white">
            <SheetHeader className="p-6 bg-slate-50 border-b border-slate-100">
              <SheetTitle className="text-left flex items-center justify-start gap-3">
                 <MapPin className="h-6 w-6 text-primary" />
                 <span className="font-extrabold text-slate-800 text-lg tracking-tight">
                   {config.platform_name}
                 </span>
              </SheetTitle>
            </SheetHeader>
            <div className="p-6 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 text-base font-bold text-slate-600 hover:bg-slate-50 hover:text-primary rounded-xl transition-all border border-transparent"
                >
                  {link.label}
                </Link>
              ))}
              
              <div className="mt-8 flex flex-col gap-3">
                {user ? (
                  <>
                    <Link to="/perfil" className="px-4 py-3 text-base font-bold text-slate-700 border border-slate-200 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-3">
                      <User className="h-5 w-5 text-slate-400" /> Meu Perfil
                    </Link>
                    <button onClick={handleSignOut} className="px-4 py-3 text-base font-bold text-destructive hover:bg-red-50 rounded-xl transition-all flex items-center gap-3 text-left">
                      <LogOut className="h-5 w-5" /> Sair
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/auth">
                      <Button variant="outline" className="w-full border-primary text-primary hover:bg-primary/5 rounded-xl h-12 font-bold text-sm">
                        Entrar na Conta
                      </Button>
                    </Link>
                    <Link to="/auth?mode=register">
                      <Button className="w-full bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl h-12 font-bold text-sm shadow-none">
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
