import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AdminSidebar } from "./AdminSidebar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Apenas SUPERADMIN pode acessar rotas /admin neste sistema centralizado
  if (!user || userRole !== "SUPERADMIN") {
    return <Navigate to="/auth" />;
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-slate-50">
        <AdminSidebar />
        <SidebarInset className="flex w-full flex-col">
          <header className="flex h-16 items-center border-b border-border bg-white px-6">
            <SidebarTrigger className="text-slate-500 hover:text-primary transition-colors" />
            <div className="ml-4 flex items-center gap-2">
              <span className="text-sm font-medium text-slate-600">Área Administrativa</span>
            </div>
            <div className="ml-auto">
              <span className="text-xs text-slate-400 italic">SaaS Professional Edition</span>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-0">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
