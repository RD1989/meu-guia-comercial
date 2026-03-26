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
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Eye } from "lucide-react";
import { toast } from "sonner";

export default function AdminPendentes() {
  const { data: businesses, isLoading, refetch } = useQuery({
    queryKey: ["admin-pending-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, categories(name)")
        .eq("active", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const handleApprove = async (id: string) => {
    try {
      const { error } = await supabase
        .from("businesses")
        .update({ active: true })
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Empresa aprovada com sucesso!");
      refetch();
    } catch (err: any) {
      toast.error("Erro ao aprovar: " + err.message);
    }
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tem certeza que deseja rejeitar este anúncio?")) return;
    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast.success("Anúncio removido.");
      refetch();
    } catch (err: any) {
      toast.error("Erro ao rejeitar: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Anúncios Pendentes</h1>
          <p className="text-slate-500">Revise e aprove novos estabelecimentos cadastrados na plataforma.</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Empresa</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">Carregando...</TableCell>
                </TableRow>
              ) : businesses?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-10 text-slate-400">Nenhum anúncio pendente.</TableCell>
                </TableRow>
              ) : businesses?.map((biz) => (
                <TableRow key={biz.id}>
                  <TableCell className="font-medium">{biz.name}</TableCell>
                  <TableCell>{(biz.categories as any)?.name}</TableCell>
                  <TableCell>{new Date(biz.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1">
                      <Clock className="h-3 w-3" /> Pendente
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="outline" size="sm" className="h-8 text-primary border-primary/20 bg-primary/5">
                      <Eye className="h-4 w-4 mr-1" /> Revisar
                    </Button>
                    <Button 
                      size="sm" 
                      className="h-8 bg-emerald-600 hover:bg-emerald-700"
                      onClick={() => handleApprove(biz.id)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" /> Aprovar
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleReject(biz.id)}
                    >
                      <XCircle className="h-4 w-4 mr-1" /> Rejeitar
                    </Button>
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
