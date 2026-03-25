import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Shield, User, MoreHorizontal, CheckCircle2, XCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export default function AdminUsuarios() {
  const queryClient = useQueryClient();

  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users"],
    queryFn: async () => {
      // Unimos perfis com seus papéis
      const { data, error } = await supabase
        .from("profiles")
        .select(`
          *,
          user_roles (role)
        `)
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string, role: string }) => {
      // Remove roles existentes e adiciona a nova (sistema simples de 1 role por user)
      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permissão atualizada com sucesso!");
    },
    onError: (error) => {
      toast.error("Erro ao atualizar permissão: " + error.message);
    }
  });

  const getRoleBadge = (roles: any[]) => {
    const role = roles?.[0]?.role || "USER";
    switch (role) {
      case "SUPERADMIN": return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">Super Admin</Badge>;
      case "ADMIN": return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200">Admin</Badge>;
      case "LOJISTA": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200">Lojista</Badge>;
      default: return <Badge variant="outline" className="text-slate-500">Usuário</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Cargos e Permissões</h1>
          <p className="text-slate-500">Gerencie quem pode acessar as áreas administrativas do sistema.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Usuário</TableHead>
                <TableHead className="font-semibold text-slate-700">E-mail</TableHead>
                <TableHead className="font-semibold text-slate-700">Data Cadastro</TableHead>
                <TableHead className="font-semibold text-slate-700">Cargo Atual</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : users?.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8 border border-slate-200">
                        <AvatarImage src={u.avatar_url} />
                        <AvatarFallback className="bg-slate-100 text-slate-400 text-xs">
                          {u.name?.charAt(0) || "U"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium text-slate-800">{u.name || "Sem nome"}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-xs">{u.email}</TableCell>
                  <TableCell className="text-slate-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString('pt-BR')}
                  </TableCell>
                  <TableCell>
                    {getRoleBadge(u.user_roles)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <div className="px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase">Trocar para</div>
                        <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "SUPERADMIN" })}>
                          <Shield className="h-4 w-4 mr-2 text-purple-600" /> Super Admin
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "ADMIN" })}>
                          <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" /> Administrador
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "LOJISTA" })}>
                          <Store className="h-4 w-4 mr-2 text-amber-600" /> Lojista
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "USER" })}>
                          <User className="h-4 w-4 mr-2 text-slate-600" /> Usuário Comum
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <XCircle className="h-4 w-4 mr-2" /> Banir Usuário
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
