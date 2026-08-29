import React, { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Shield, 
  User, 
  MoreHorizontal, 
  CheckCircle2, 
  XCircle, 
  Search, 
  Filter, 
  Store,
  Users,
  ShieldAlert,
  Loader2
} from "lucide-react";
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("ALL");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin-users", searchTerm, selectedRole],
    queryFn: async () => {
      let query = supabase
        .from("profiles")
        .select(`
          *,
          user_roles (role)
        `)
        .order("created_at", { ascending: false });
      
      if (searchTerm.trim()) {
        query = query.or(`name.ilike.%${searchTerm.trim()}%,email.ilike.%${searchTerm.trim()}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ userId, role, userName }: { userId: string, role: string, userName?: string }) => {
      if (role === "SUPERADMIN") {
        if (!confirm(`Atenção: Você está concedendo acesso TOTAL de Superadmin para ${userName || 'este usuário'}. Deseja prosseguir?`)) {
          return;
        }
      }

      await supabase.from("user_roles").delete().eq("user_id", userId);
      const { error } = await supabase.from("user_roles").insert({ user_id: userId, role });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      toast.success("Permissão de acesso atualizada!");
    },
    onError: (error: any) => {
      toast.error("Erro ao atualizar permissão: " + error.message);
    }
  });

  const filteredUsers = users.filter((u: any) => {
    const role = u.user_roles?.[0]?.role || "USER";
    if (selectedRole === "ALL") return true;
    return role === selectedRole;
  });

  const stats = {
    total: users.length,
    superadmins: users.filter((u: any) => u.user_roles?.[0]?.role === "SUPERADMIN" || u.user_roles?.[0]?.role === "ADMIN").length,
    lojistas: users.filter((u: any) => u.user_roles?.[0]?.role === "LOJISTA").length,
    consumidores: users.filter((u: any) => !u.user_roles?.[0]?.role || u.user_roles?.[0]?.role === "USER").length,
  };

  const getRoleBadge = (roles: any[]) => {
    const role = roles?.[0]?.role || "USER";
    switch (role) {
      case "SUPERADMIN": return <Badge className="bg-purple-100 text-purple-700 border-none font-bold text-[9px]">Super Admin</Badge>;
      case "ADMIN": return <Badge className="bg-blue-100 text-blue-700 border-none font-bold text-[9px]">Admin</Badge>;
      case "LOJISTA": return <Badge className="bg-amber-100 text-amber-700 border-none font-bold text-[9px]">Lojista</Badge>;
      default: return <Badge variant="secondary" className="text-slate-500 font-bold text-[9px]">Consumidor</Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-[900] text-slate-900 tracking-tight">Gestão de Usuários & Permissões</h1>
          <p className="text-xs text-slate-500 font-medium">Controle cargos de acesso, lojistas e administradores do portal.</p>
        </div>

        {/* 4 Cards de Resumo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-none shadow-sm rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Total de Contas</span>
              <Users className="h-4 w-4 text-slate-400" />
            </div>
            <p className="text-2xl font-[900] text-slate-900 mt-2">{stats.total}</p>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Lojistas</span>
              <Store className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-2xl font-[900] text-amber-600 mt-2">{stats.lojistas}</p>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Consumidores</span>
              <User className="h-4 w-4 text-primary" />
            </div>
            <p className="text-2xl font-[900] text-slate-900 mt-2">{stats.consumidores}</p>
          </Card>
          <Card className="border-none shadow-sm rounded-2xl p-4 bg-white">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase text-slate-400">Administradores</span>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            <p className="text-2xl font-[900] text-purple-700 mt-2">{stats.superadmins}</p>
          </Card>
        </div>

        {/* Barra de Busca e Filtro de Cargo */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome ou e-mail..." 
              className="pl-10 h-10 bg-slate-50 border-none text-xs font-bold rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2.5 text-slate-700 focus:ring-primary/20 h-10"
          >
            <option value="ALL">Todos os Cargos</option>
            <option value="SUPERADMIN">Super Administrador</option>
            <option value="ADMIN">Administrador</option>
            <option value="LOJISTA">Lojista</option>
            <option value="USER">Consumidor</option>
          </select>
        </div>

        {/* Tabela de Usuários */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs text-slate-700">Usuário</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">E-mail</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Data Cadastro</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Cargo Atual</TableHead>
                <TableHead className="text-right font-bold text-xs text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-xs font-bold">
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-400 text-xs font-bold">
                    Nenhum usuário encontrado com os termos pesquisados.
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((u: any) => (
                  <TableRow key={u.id} className="hover:bg-slate-50/50 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border border-slate-200">
                          <AvatarImage src={u.avatar_url} />
                          <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-xs">
                            {u.name?.charAt(0) || "U"}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-bold text-xs text-slate-800">{u.name || "Sem nome"}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600 font-mono text-xs">{u.email}</TableCell>
                    <TableCell className="text-slate-500 text-xs font-medium">
                      {new Date(u.created_at).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      {getRoleBadge(u.user_roles)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-slate-100 rounded-lg">
                            <MoreHorizontal className="h-4 w-4 text-slate-500" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl shadow-xl p-1.5 bg-white border-slate-100">
                          <div className="px-2 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-wider">Alterar Cargo</div>
                          <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "SUPERADMIN", userName: u.name })} className="rounded-xl text-xs font-bold py-2 cursor-pointer">
                            <Shield className="h-4 w-4 mr-2 text-purple-600" /> Super Admin
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "ADMIN", userName: u.name })} className="rounded-xl text-xs font-bold py-2 cursor-pointer">
                            <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" /> Administrador
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "LOJISTA", userName: u.name })} className="rounded-xl text-xs font-bold py-2 cursor-pointer">
                            <Store className="h-4 w-4 mr-2 text-amber-600" /> Lojista
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => updateRoleMutation.mutate({ userId: u.id, role: "USER", userName: u.name })} className="rounded-xl text-xs font-bold py-2 cursor-pointer">
                            <User className="h-4 w-4 mr-2 text-slate-600" /> Consumidor
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </AdminLayout>
  );
}
