import React, { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PlatformProvider } from "@/contexts/PlatformContext";
import { CartProvider } from "@/contexts/CartContext";

// Public Pages
const Index = React.lazy(() => import("./pages/Index"));
const Search = React.lazy(() => import("./pages/Search"));
const BusinessDetail = React.lazy(() => import("./pages/BusinessDetail"));
const Auth = React.lazy(() => import("./pages/Auth"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Blog = React.lazy(() => import("./pages/portal/Blog"));
const BlogPost = React.lazy(() => import("./pages/portal/BlogPost"));
const JobApplicationsPage = React.lazy(() => import("./pages/portal/JobApplications"));
const Categories = React.lazy(() => import("./pages/Categories"));
const Plans = React.lazy(() => import("./pages/Plans"));
const Checkout = React.lazy(() => import("./pages/Checkout"));
const Community = React.lazy(() => import("./pages/portal/Community"));
const CommunityProfile = React.lazy(() => import("./pages/portal/CommunityProfile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const Offers = React.lazy(() => import("./pages/Offers"));

// Lojista Dashboard
const DashboardHome = React.lazy(() => import("./pages/dashboard/DashboardHome"));
const DashboardBusiness = React.lazy(() => import("./pages/dashboard/DashboardBusiness"));
const DashboardProducts = React.lazy(() => import("./pages/dashboard/DashboardProducts"));
const DashboardMetrics = React.lazy(() => import("./pages/dashboard/DashboardMetrics"));
const DashboardConfig = React.lazy(() => import("./pages/dashboard/DashboardConfig"));
const DashboardJobs = React.lazy(() => import("./pages/dashboard/DashboardJobs"));
const DashboardServices = React.lazy(() => import("./pages/dashboard/DashboardServices"));
const DashboardAds = React.lazy(() => import("./pages/dashboard/DashboardAds"));
const DashboardCoupons = React.lazy(() => import("./pages/dashboard/DashboardCoupons"));
const DashboardFeed = React.lazy(() => import("./pages/dashboard/DashboardFeed"));
const DashboardStamps = React.lazy(() => import("./pages/dashboard/DashboardStamps"));
const DashboardEvents = React.lazy(() => import("./pages/dashboard/DashboardEvents"));

const AdminDashboard = React.lazy(() => import("./pages/admin/AdminDashboard"));
const AdminEmpresas = React.lazy(() => import("./pages/admin/AdminEmpresas"));
const AdminUsuarios = React.lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminCategorias = React.lazy(() => import("./pages/admin/AdminCategorias"));
const AdminBlog = React.lazy(() => import("./pages/admin/AdminBlog"));
const AdminBlogEditor = React.lazy(() => import("./pages/admin/AdminBlogEditor"));
const AdminBlogCategories = React.lazy(() => import("./pages/admin/AdminBlogCategories"));
const AdminConfig = React.lazy(() => import("./pages/admin/AdminConfig"));
const AdminIAConfig = React.lazy(() => import("./pages/admin/AdminIAConfig"));
const AdminReferences = React.lazy(() => import("./pages/admin/AdminReferences"));
const AdminMediaLibrary = React.lazy(() => import("./pages/admin/AdminMediaLibrary"));
const AdminJobs = React.lazy(() => import("./pages/admin/AdminJobs"));
const AdminPendentes = React.lazy(() => import("./pages/admin/AdminPendentes"));
const AdminPlanos = React.lazy(() => import("./pages/admin/AdminPlanos"));
const AdminBusinessEditor = React.lazy(() => import("./pages/admin/AdminBusinessEditor"));
const AdminCommunityModeration = React.lazy(() => import("./pages/admin/AdminCommunityModeration"));
import { LocalConciergeWidget } from "./components/LocalConciergeWidget";

const queryClient = new QueryClient();

const ProtectedRoute = ({ children, role }: { children: ReactNode, role?: string }) => {
  const { user, loading, userRole } = useAuth();
  
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/auth" />;
  
  // SUPERADMIN tem acesso irrestrito
  if (userRole === "SUPERADMIN") return <>{children}</>;
  
  if (role && userRole !== role) return <Navigate to="/" />;
  
  return <>{children}</>;
};

import ErrorBoundary from "./components/ErrorBoundary";

const PageLoader = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] bg-transparent">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
    <div className="font-bold text-sm text-muted-foreground animate-pulse uppercase tracking-widest">Carregando</div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <PlatformProvider>
          <CartProvider>
            <BrowserRouter>
              <AuthProvider>
                <HydrationGuard>
                  <LocalConciergeWidget />
                </HydrationGuard>
                <React.Suspense fallback={<PageLoader />}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/buscar" element={<Search />} />
                    <Route path="/negocio/:slug" element={<BusinessDetail />} />
                    <Route path="/comunidade" element={<Community />} />
                    <Route path="/comunidade/perfil/:id" element={<CommunityProfile />} />
                    <Route path="/noticias" element={<Blog />} />
                    <Route path="/blog" element={<Blog />} />
                    <Route path="/blog/:slug" element={<BlogPost />} />
                    <Route path="/vagas" element={<JobApplicationsPage />} />
                    <Route path="/categorias" element={<Categories />} />
                    <Route path="/planos" element={<Plans />} />
                    <Route path="/checkout" element={<Checkout />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/ofertas" element={<Offers />} />
                    <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

                    {/* Lojista Dashboard */}
                    <Route path="/dashboard" element={<ProtectedRoute role="LOJISTA"><DashboardHome /></ProtectedRoute>} />
                    <Route path="/dashboard/negocio" element={<ProtectedRoute role="LOJISTA"><DashboardBusiness /></ProtectedRoute>} />
                    <Route path="/dashboard/produtos" element={<ProtectedRoute role="LOJISTA"><DashboardProducts /></ProtectedRoute>} />
                    <Route path="/dashboard/servicos" element={<ProtectedRoute role="LOJISTA"><DashboardServices /></ProtectedRoute>} />
                    <Route path="/dashboard/vagas" element={<ProtectedRoute role="LOJISTA"><DashboardJobs /></ProtectedRoute>} />
                    <Route path="/dashboard/metricas" element={<ProtectedRoute role="LOJISTA"><DashboardMetrics /></ProtectedRoute>} />
                    <Route path="/dashboard/config" element={<ProtectedRoute role="LOJISTA"><DashboardConfig /></ProtectedRoute>} />
                    <Route path="/dashboard/anuncios" element={<ProtectedRoute role="LOJISTA"><DashboardAds /></ProtectedRoute>} />
                    <Route path="/dashboard/cupons" element={<ProtectedRoute role="LOJISTA"><DashboardCoupons /></ProtectedRoute>} />
                    <Route path="/dashboard/feed" element={<ProtectedRoute role="LOJISTA"><DashboardFeed /></ProtectedRoute>} />
                    <Route path="/dashboard/carimbo" element={<ProtectedRoute role="LOJISTA"><DashboardStamps /></ProtectedRoute>} />
                    <Route path="/dashboard/eventos" element={<ProtectedRoute role="LOJISTA"><DashboardEvents /></ProtectedRoute>} />

                    {/* Super Admin Dashboard */}
                    <Route path="/admin" element={<ProtectedRoute role="SUPERADMIN"><AdminDashboard /></ProtectedRoute>} />
                    <Route path="/admin/empresas" element={<ProtectedRoute role="SUPERADMIN"><AdminEmpresas /></ProtectedRoute>} />
                    <Route path="/admin/empresas/novo" element={<ProtectedRoute role="SUPERADMIN"><AdminBusinessEditor /></ProtectedRoute>} />
                    <Route path="/admin/empresas/editar/:slug" element={<ProtectedRoute role="SUPERADMIN"><AdminBusinessEditor /></ProtectedRoute>} />
                    <Route path="/admin/usuarios" element={<ProtectedRoute role="SUPERADMIN"><AdminUsuarios /></ProtectedRoute>} />
                    <Route path="/admin/categorias" element={<ProtectedRoute role="SUPERADMIN"><AdminCategorias /></ProtectedRoute>} />
                    <Route path="/admin/blog" element={<ProtectedRoute role="SUPERADMIN"><AdminBlog /></ProtectedRoute>} />
                    <Route path="/admin/blog/categorias" element={<ProtectedRoute role="SUPERADMIN"><AdminBlogCategories /></ProtectedRoute>} />
                    <Route path="/admin/blog/novo" element={<ProtectedRoute role="SUPERADMIN"><AdminBlogEditor /></ProtectedRoute>} />
                    <Route path="/admin/blog/editar/:slug" element={<ProtectedRoute role="SUPERADMIN"><AdminBlogEditor /></ProtectedRoute>} />
                    <Route path="/admin/config" element={<ProtectedRoute role="SUPERADMIN"><AdminConfig /></ProtectedRoute>} />
                    <Route path="/admin/ia" element={<ProtectedRoute role="SUPERADMIN"><AdminIAConfig /></ProtectedRoute>} />
                    <Route path="/admin/referencias" element={<ProtectedRoute role="SUPERADMIN"><AdminReferences /></ProtectedRoute>} />
                    <Route path="/admin/midias" element={<ProtectedRoute role="SUPERADMIN"><AdminMediaLibrary /></ProtectedRoute>} />
                    <Route path="/admin/vagas" element={<ProtectedRoute role="SUPERADMIN"><AdminJobs /></ProtectedRoute>} />
                    <Route path="/admin/pendentes" element={<ProtectedRoute role="SUPERADMIN"><AdminPendentes /></ProtectedRoute>} />
                    <Route path="/admin/planos" element={<ProtectedRoute role="SUPERADMIN"><AdminPlanos /></ProtectedRoute>} />
                    <Route path="/admin/moderacao" element={<ProtectedRoute role="SUPERADMIN"><AdminCommunityModeration /></ProtectedRoute>} />

                    {/* Catch-all */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </React.Suspense>
              </AuthProvider>
            </BrowserRouter>
          </CartProvider>
        </PlatformProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

const HydrationGuard = ({ children }: { children: React.ReactNode }) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <>{children}</>;
};

export default App;
