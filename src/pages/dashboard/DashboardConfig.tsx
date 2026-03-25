import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Shield, Bell } from "lucide-react";

const DashboardConfig = () => {
  const { user } = useAuth();

  return (
    <DashboardLayout title="Configurações">
      <div className="max-w-2xl space-y-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" />
              Conta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">E-mail</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium text-foreground">Nome</p>
                <p className="text-xs text-muted-foreground">{user?.user_metadata?.name || "—"}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-primary" />
              Assinatura
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Plano Atual</p>
                <p className="text-xs text-muted-foreground">Gratuito</p>
              </div>
              <Button variant="outline" size="sm" className="rounded-xl" disabled>
                Gerenciar Plano
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-2">
              Integração com Stripe em breve.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4 text-primary" />
              Notificações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Configurações de notificações estarão disponíveis em breve.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default DashboardConfig;
