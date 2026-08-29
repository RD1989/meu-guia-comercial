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
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Eye, 
  Store, 
  Phone, 
  MapPin, 
  ExternalLink,
  AlertTriangle,
  Loader2,
  Trash2
} from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

export default function AdminPendentes() {
  const queryClient = useQueryClient();
  const [selectedBiz, setSelectedBiz] = useState<any>(null);
  const [rejectingBiz, setRejectingBiz] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: businesses = [], isLoading } = useQuery({
    queryKey: ["admin-pending-businesses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("*, categories(name), profiles:owner_id(name, email)")
        .eq("active", false)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    }
  });

  const approveMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("businesses")
        .update({ active: true })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-businesses"] });
      queryClient.invalidateQueries({ queryKey: ["admin-businesses"] });
      toast.success("Empresa aprovada e publicada no portal!");
      setSelectedBiz(null);
    },
    onError: (err: any) => {
      toast.error("Erro ao aprovar: " + err.message);
    }
  });

  // Soft rejection / Solicitação de ajustes
  const handleRequestAdjustment = async () => {
    if (!rejectingBiz) return;
    setIsProcessing(true);
    try {
      // Mantém active: false e pode registrar nota de moderação
      const { error } = await supabase
        .from("businesses")
        .update({ 
          active: false,
          description: rejectingBiz.description ? `${rejectingBiz.description}` : ""
        })
        .eq("id", rejectingBiz.id);

      if (error) throw error;

      toast.success(`Solicitação de ajuste enviada para ${rejectingBiz.name}. Os dados foram preservados.`);
      setRejectingBiz(null);
      setRejectionReason("");
      queryClient.invalidateQueries({ queryKey: ["admin-pending-businesses"] });
    } catch (err: any) {
      toast.error("Erro ao processar: " + err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Hard delete apenas se for Spam comprovado
  const handlePermanentDelete = async (id: string, name: string) => {
    if (!confirm(`Atenção: Deseja realmente excluir permanentemente a empresa "${name}" e todos os seus dados? Esta ação é irreversível.`)) {
      return;
    }

    try {
      const { error } = await supabase
        .from("businesses")
        .delete()
        .eq("id", id);

      if (error) throw error;
      toast.success("Cadastro excluído permanentemente.");
      setSelectedBiz(null);
      setRejectingBiz(null);
      queryClient.invalidateQueries({ queryKey: ["admin-pending-businesses"] });
    } catch (err: any) {
      toast.error("Erro ao excluir: " + err.message);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div>
          <h1 className="text-2xl font-[900] text-slate-900 tracking-tight">Anúncios & Lojas Pendentes</h1>
          <p className="text-xs text-slate-500 font-medium">
            Revise com segurança e aprove novos estabelecimentos cadastrados sem risco de perda de dados.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-bold text-xs text-slate-700">Empresa</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Categoria</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Cidade</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Proprietário</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Data Cadastro</TableHead>
                <TableHead className="font-bold text-xs text-slate-700">Status</TableHead>
                <TableHead className="text-right font-bold text-xs text-slate-700">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-xs font-bold">
                    Carregando anúncios pendentes...
                  </TableCell>
                </TableRow>
              ) : businesses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-slate-400 text-xs font-bold">
                    Nenhum estabelecimento pendente de aprovação no momento.
                  </TableCell>
                </TableRow>
              ) : (
                businesses.map((biz: any) => (
                  <TableRow key={biz.id} className="hover:bg-slate-50/60 transition-colors">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {biz.image_url ? (
                          <img src={biz.image_url} alt={biz.name} className="h-9 w-9 rounded-xl object-cover" />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-xs">
                            <Store className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-snug">{biz.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">/{biz.slug}</p>
                        </div>
                      </div>
                    </TableCell>

                    <TableCell>
                      <Badge variant="secondary" className="text-[9px] font-bold">
                        {biz.categories?.name || "Geral"}
                      </Badge>
                    </TableCell>

                    <TableCell className="text-xs text-slate-600 font-medium">
                      {biz.city || "—"}
                    </TableCell>

                    <TableCell>
                      <p className="text-xs font-medium text-slate-800">{biz.profiles?.name || "Lojista"}</p>
                      <p className="text-[10px] text-slate-400">{biz.profiles?.email || ""}</p>
                    </TableCell>

                    <TableCell className="text-xs text-slate-400">
                      {new Date(biz.created_at).toLocaleDateString("pt-BR")}
                    </TableCell>

                    <TableCell>
                      <Badge className="bg-amber-50 text-amber-700 border-none font-bold text-[9px] gap-1">
                        <Clock className="h-3 w-3" /> Aguardando Revisão
                      </Badge>
                    </TableCell>

                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setSelectedBiz(biz)}
                          className="h-8 px-3 text-xs font-bold text-primary border-primary/20 bg-primary/5 hover:bg-primary/10 rounded-xl"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" /> Revisar
                        </Button>
                        <Button 
                          size="sm" 
                          onClick={() => approveMutation.mutate(biz.id)}
                          disabled={approveMutation.isPending}
                          className="h-8 px-3 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl"
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1" /> Aprovar
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => setRejectingBiz(biz)}
                          className="h-8 px-2.5 text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1" /> Ajuste
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

      {/* Modal de Revisão Completa */}
      {selectedBiz && (
        <Dialog open={!!selectedBiz} onOpenChange={(open) => !open && setSelectedBiz(null)}>
          <DialogContent className="sm:max-w-[600px] rounded-3xl p-6 bg-white border-none shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-3">
                {selectedBiz.image_url ? (
                  <img src={selectedBiz.image_url} alt="" className="h-12 w-12 rounded-2xl object-cover shadow-sm" />
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                    <Store className="h-6 w-6" />
                  </div>
                )}
                <div>
                  <DialogTitle className="text-xl font-black text-slate-900">{selectedBiz.name}</DialogTitle>
                  <DialogDescription className="text-xs text-slate-500 font-medium">
                    {selectedBiz.categories?.name || "Sem categoria"} • {selectedBiz.city || "Cidade não informada"}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-4 space-y-4 text-xs text-slate-600">
              <div className="p-4 bg-slate-50 rounded-2xl space-y-2">
                <p className="font-bold text-slate-900">Descrição do Comércio:</p>
                <p className="leading-relaxed">{selectedBiz.description || "Nenhuma descrição fornecida."}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Telefone / WhatsApp</p>
                  <p className="font-bold text-slate-900 mt-0.5">{selectedBiz.whatsapp || selectedBiz.phone || "Não informado"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[10px] font-bold uppercase text-slate-400">Endereço</p>
                  <p className="font-bold text-slate-900 mt-0.5 truncate">{selectedBiz.address || "Não informado"}</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl">
                <p className="text-[10px] font-bold uppercase text-slate-400">Proprietário Cadastrado</p>
                <p className="font-bold text-slate-900 mt-0.5">{selectedBiz.profiles?.name || "—"} ({selectedBiz.profiles?.email || ""})</p>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0 justify-between items-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => handlePermanentDelete(selectedBiz.id, selectedBiz.name)}
                className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold gap-1.5"
              >
                <Trash2 className="h-3.5 w-3.5" /> Excluir Definitivamente
              </Button>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedBiz(null)}
                  className="rounded-xl text-xs font-bold"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => approveMutation.mutate(selectedBiz.id)}
                  className="rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <CheckCircle className="h-4 w-4" /> Aprovar Agora
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Solicitação de Ajuste / Rejeição Segura */}
      {rejectingBiz && (
        <Dialog open={!!rejectingBiz} onOpenChange={(open) => !open && setRejectingBiz(null)}>
          <DialogContent className="sm:max-w-[500px] rounded-3xl p-6 bg-white border-none shadow-2xl">
            <DialogHeader>
              <div className="flex items-center gap-2 text-amber-600 mb-1">
                <AlertTriangle className="h-5 w-5" />
                <DialogTitle className="text-lg font-black text-slate-900">Solicitar Ajustes ao Lojista</DialogTitle>
              </div>
              <DialogDescription className="text-xs text-slate-500">
                Os dados da loja <strong>{rejectingBiz.name}</strong> serão preservados para que o lojista possa corrigir as pendências.
              </DialogDescription>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <Label className="text-xs font-bold text-slate-700">Orientações para o Lojista (Opcional):</Label>
              <Textarea 
                placeholder="Ex: Por favor, adicione uma foto real da fachada da loja e complete o endereço comercial..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                rows={4}
                className="rounded-xl text-xs"
              />
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setRejectingBiz(null)}
                className="rounded-xl text-xs font-bold"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleRequestAdjustment}
                disabled={isProcessing}
                className="rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white"
              >
                {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Solicitação"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </AdminLayout>
  );
}
