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
import Index from "./pages/Index";
import Search from "./pages/Search";
import BusinessDetail from "./pages/BusinessDetail";
import News from "./pages/News";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Blog from "./pages/portal/Blog";
import BlogPost from "./pages/portal/BlogPost";
import JobApplicationsPage from "./pages/portal/JobApplications";
import Categories from "./pages/Categories";
import Plans from "./pages/Plans";
import NotFound from "./pages/NotFound";

// Lojista Dashboard
import DashboardHome from "./pages/dashboard/DashboardHome";
import DashboardBusiness from "./pages/dashboard/DashboardBusiness";
import DashboardProducts from "./pages/dashboard/DashboardProducts";
import DashboardMetrics from "./pages/dashboard/DashboardMetrics";
import DashboardConfig from "./pages/dashboard/DashboardConfig";
import DashboardJobs from "./pages/dashboard/DashboardJobs";
import DashboardServices from "./pages/dashboard/DashboardServices";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminEmpresas from "./pages/admin/AdminEmpresas";
import AdminUsuarios from "./pages/admin/AdminUsuarios";
import AdminCategorias from "./pages/admin/AdminCategorias";
import AdminBlog from "./pages/admin/AdminBlog";
import AdminBlogEditor from "./pages/admin/AdminBlogEditor";
import AdminConfig from "./pages/admin/AdminConfig";
import AdminIAConfig from "./pages/admin/AdminIAConfig";
import AdminReferences from "./pages/admin/AdminReferences";
import AdminMediaLibrary from "./pages/admin/AdminMediaLibrary";
import AdminJobs from "@/pages/admin/AdminJobs";
import AdminPendentes from "./pages/admin/AdminPendentes";
import AdminPlanos from "./pages/admin/AdminPlanos";
import AdminBusinessEditor from "./pages/admin/AdminBusinessEditor";
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

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <PlatformProvider>
        <CartProvider>
          <BrowserRouter>
            <AuthProvider>
              <LocalConciergeWidget />
              <Routes>
              {/* Public Portal */}
              <Route path="/" element={<Index />} />
              <Route path="/buscar" element={<Search />} />
              <Route path="/negocio/:slug" element={<BusinessDetail />} />
              <Route path="/noticias" element={<Blog />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/vagas" element={<JobApplicationsPage />} />
              <Route path="/categorias" element={<Categories />} />
              <Route path="/planos" element={<Plans />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />

              {/* Lojista Dashboard */}
              <Route path="/dashboard" element={<ProtectedRoute role="LOJISTA"><DashboardHome /></ProtectedRoute>} />
              <Route path="/dashboard/negocio" element={<ProtectedRoute role="LOJISTA"><DashboardBusiness /></ProtectedRoute>} />
              <Route path="/dashboard/produtos" element={<ProtectedRoute role="LOJISTA"><DashboardProducts /></ProtectedRoute>} />
              <Route path="/dashboard/servicos" element={<ProtectedRoute role="LOJISTA"><DashboardServices /></ProtectedRoute>} />
              <Route path="/dashboard/vagas" element={<ProtectedRoute role="LOJISTA"><DashboardJobs /></ProtectedRoute>} />
              <Route path="/dashboard/metricas" element={<ProtectedRoute role="LOJISTA"><DashboardMetrics /></ProtectedRoute>} />
              <Route path="/dashboard/config" element={<ProtectedRoute role="LOJISTA"><DashboardConfig /></ProtectedRoute>} />

              {/* Super Admin Dashboard */}
              <Route path="/admin" element={<ProtectedRoute role="SUPERADMIN"><AdminDashboard /></ProtectedRoute>} />
              <Route path="/admin/empresas" element={<ProtectedRoute role="SUPERADMIN"><AdminEmpresas /></ProtectedRoute>} />
              <Route path="/admin/empresas/novo" element={<ProtectedRoute role="SUPERADMIN"><AdminBusinessEditor /></ProtectedRoute>} />
              <Route path="/admin/empresas/editar/:slug" element={<ProtectedRoute role="SUPERADMIN"><AdminBusinessEditor /></ProtectedRoute>} />
              <Route path="/admin/usuarios" element={<ProtectedRoute role="SUPERADMIN"><AdminUsuarios /></ProtectedRoute>} />
              <Route path="/admin/categorias" element={<ProtectedRoute role="SUPERADMIN"><AdminCategorias /></ProtectedRoute>} />
              <Route path="/admin/blog" element={<ProtectedRoute role="SUPERADMIN"><AdminBlog /></ProtectedRoute>} />
              <Route path="/admin/blog/novo" element={<ProtectedRoute role="SUPERADMIN"><AdminBlogEditor /></ProtectedRoute>} />
              <Route path="/admin/blog/editar/:slug" element={<ProtectedRoute role="SUPERADMIN"><AdminBlogEditor /></ProtectedRoute>} />
              <Route path="/admin/config" element={<ProtectedRoute role="SUPERADMIN"><AdminConfig /></ProtectedRoute>} />
              <Route path="/admin/ia" element={<ProtectedRoute role="SUPERADMIN"><AdminIAConfig /></ProtectedRoute>} />
              <Route path="/admin/referencias" element={<ProtectedRoute role="SUPERADMIN"><AdminReferences /></ProtectedRoute>} />
              <Route path="/admin/midias" element={<ProtectedRoute role="SUPERADMIN"><AdminMediaLibrary /></ProtectedRoute>} />
              <Route path="/admin/vagas" element={<ProtectedRoute role="SUPERADMIN"><AdminJobs /></ProtectedRoute>} />
              <Route path="/admin/pendentes" element={<ProtectedRoute role="SUPERADMIN"><AdminPendentes /></ProtectedRoute>} />
              <Route path="/admin/planos" element={<ProtectedRoute role="SUPERADMIN"><AdminPlanos /></ProtectedRoute>} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AuthProvider>
        </BrowserRouter>
      </CartProvider>
    </PlatformProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
