import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
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
import { Search, Plus, ExternalLink, MoreVertical, Edit, Trash } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

export default function AdminEmpresas() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: businesses, isLoading } = useQuery({
    queryKey: ["admin-businesses", searchTerm],
    queryFn: async () => {
      let query = supabase
        .from("businesses")
        .select("*, categories(name), profiles(name, email)");
      
      if (searchTerm) {
        query = query.ilike("name", `%${searchTerm}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Gerenciar Empresas</h1>
            <p className="text-slate-500">Visualize e administre todos os estabelecimentos da plataforma.</p>
          </div>
          <Button className="bg-primary hover:bg-primary/90">
            <Plus className="h-4 w-4 mr-2" /> Nova Empresa
          </Button>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por nome..." 
              className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select className="bg-slate-50 border-none rounded-md text-sm p-2 text-slate-600 focus:ring-primary/20">
            <option>Todas Categorias</option>
          </select>
          <select className="bg-slate-50 border-none rounded-md text-sm p-2 text-slate-600 focus:ring-primary/20">
            <option>Status: Todos</option>
            <option>Ativos</option>
            <option>Inativos</option>
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold text-slate-700">Empresa</TableHead>
                <TableHead className="font-semibold text-slate-700">Categoria</TableHead>
                <TableHead className="font-semibold text-slate-700">Proprietário</TableHead>
                <TableHead className="font-semibold text-slate-700">Status</TableHead>
                <TableHead className="font-semibold text-slate-700">Plano</TableHead>
                <TableHead className="text-right font-semibold text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Carregando empresas...
                  </TableCell>
                </TableRow>
              ) : businesses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10 text-slate-400">
                    Nenhuma empresa encontrada.
                  </TableCell>
                </TableRow>
              ) : businesses?.map((biz) => (
                <TableRow key={biz.id} className="hover:bg-slate-50/50 transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                        {biz.image_url ? (
                          <img src={biz.image_url} alt={biz.name} className="h-full w-full object-cover" />
                        ) : (
                          <Store className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                      <div>
                        <div className="font-medium text-slate-800">{biz.name}</div>
                        <div className="text-xs text-slate-500">/{biz.slug}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="font-normal text-slate-600">
                      {(biz.categories as any)?.name || "Sem categoria"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-slate-700 font-medium">{(biz.profiles as any)?.name || "Indefinido"}</div>
                    <div className="text-xs text-slate-400">{(biz.profiles as any)?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={biz.active ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100" : "bg-slate-100 text-slate-600"}>
                      {biz.active ? "Ativo" : "Inativo"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-bold text-primary">
                      {biz.plan_tier || "FREE"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem className="gap-2">
                          <Edit className="h-4 w-4" /> Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2">
                          <ExternalLink className="h-4 w-4" /> Ver no Guia
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 text-destructive">
                          <Trash className="h-4 w-4" /> Excluir
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
