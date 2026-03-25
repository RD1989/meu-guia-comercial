import { useAuth } from "@/contexts/AuthContext";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogOut, User, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const Profile = () => {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  if (!loading && !user) {
    navigate("/auth", { replace: true });
    return null;
  }

  const handleSignOut = async () => {
    await signOut();
    toast.success("Logout realizado com sucesso!");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      <Header />

      <div className="max-w-lg mx-auto px-4 py-8">
        <h1 className="text-xl font-bold text-foreground mb-6">Meu Perfil</h1>

        <Card className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground">
                {user?.user_metadata?.name || "Usuário"}
              </p>
              <div className="flex items-center gap-1 text-muted-foreground">
                <Mail className="h-3 w-3" />
                <span className="text-xs">{user?.email}</span>
              </div>
            </div>
          </div>

          <Button
            variant="outline"
            className="w-full h-11 rounded-xl gap-2 text-destructive hover:text-destructive"
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            Sair da conta
          </Button>
        </Card>
      </div>

      <BottomTabBar />
    </div>
  );
};

export default Profile;
