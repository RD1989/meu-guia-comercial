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
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, ExternalLink, MoreVertical, Edit, Trash, Store, CheckCircle, XCircle } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export default function AdminEmpresas() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedStatus, setSelectedStatus] = useState("ALL");
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // 1. Buscar Categorias para o Filtro
  const { data: categories = [] } = useQuery({
    queryKey: ["admin-categories-filter"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name")
        .order("name");
      if (error) throw error;
      return data || [];
    }
  });

  // 2. Buscar Empresas com Filtros
  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["admin-businesses", searchTerm, selectedCategory, selectedStatus],
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select("*, categories(id, name), profiles(name, email)");
      
      if (searchTerm.trim()) {
        query = query.ilike("name", `%${searchTerm.trim()}%`);
      }

      if (selectedCategory !== "ALL") {
        query = query.eq("category_id", selectedCategory);
      }

      if (selectedStatus === "ACTIVE") {
        query = query.eq("active", true);
      } else if (selectedStatus === "INACTIVE") {
        query = query.eq("active", false);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  // 3. Mutação para Alternar Status Ativo/Inativo
  const toggleStatusMutation = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await supabase
        .from("businesses")
        .update({ active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success("Status do estabelecimento atualizado.");
    },
    onError: (err: any) => {
      toast.error("Erro ao alterar status: " + err.message);
    }
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-[900] text-slate-900 tracking-tight">Gerenciar Empresas</h1>
            <p className="text-xs text-slate-500 font-medium">Visualize e administre todos os estabelecimentos da plataforma.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90 text-white font-bold text-xs rounded-xl" onClick={() => navigate("/admin/empresas/novo")}>
            <Plus className="h-4 w-4 mr-2" /> Nova Empresa
          </Button>
        </div>

        {/* Filtros em Tempo Real */}
        <div className="flex flex-wrap items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome..." 
              className="pl-10 h-10 bg-slate-50 border-none text-xs font-bold rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <select 
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2.5 text-slate-700 focus:ring-primary/20 h-10"
          >
            <option value="ALL">Todas as Categorias</option>
            {categories.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select 
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border-none rounded-xl text-xs font-bold p-2.5 text-slate-700 focus:ring-primary/20 h-10"
          >
            <option value="ALL">Status: Todos</option>
            <option value="ACTIVE">Apenas Ativos</option>
            <option value="INACTIVE">Apenas Inativos</option>
          </select>
        </div>

        {/* Tabela de Empresas */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50/80">
              <TableRow>
                <TableHead className="font-bold text-xs text-slate-700">Empresa</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Categoria</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Cidade</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Proprietário</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-xs text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs font-bold">
                    Carregando estabelecimentos...
                  </TableCell>
                </TableRow>
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-400 text-xs font-bold">
                    Nenhuma empresa encontrada com os filtros selecionados.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((b: any) => (
                  <TableRow key={b.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {b.image_url ? (
                          <img src={b.image_url} alt={b.name} className="h-9 w-9 rounded-xl object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                            <Store className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-snug">{b.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">/{b.slug}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        {b.categories?.name || "Sem categoria"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 font-medium">
                      {b.city || "—"}
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-medium text-slate-800">{b.profiles?.name || "—"}</p>
                      <p className="text-[10px] text-slate-400">{b.profiles?.email || ""}</p>
                    </TableCell>

                    <TableCell>
                      <Badge className={b.active ? "bg-emerald-50 text-emerald-600 border-none font-bold text-[9px]" : "bg-rose-50 text-rose-600 border-none font-bold text-[9px]"}>
                        {b.active ? "Ativo" : "Inativo"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => toggleStatusMutation.mutate({ id: b.id, active: !b.active })}
                          className={`h-8 w-8 rounded-lg ${b.active ? "text-rose-500 hover:bg-rose-50" : "text-emerald-600 hover:bg-emerald-50"}`}
                          title={b.active ? "Desativar empresa" : "Ativar empresa"}
                        >
                          {b.active ? <XCircle className="h-4 w-4" /> : <CheckCircle className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => window.open(`/negocio/${b.slug}`, "_blank")}
                          className="h-8 w-8 rounded-lg text-slate-400 hover:text-primary"
                          title="Ver página pública"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Button>
                      </div>
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
