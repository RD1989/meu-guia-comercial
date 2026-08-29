import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  Search, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar,
  CheckCircle2,
  XCircle
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function AdminJobs() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: "",
    business_id: "",
    description: "",
    requirements: "",
    salary_range: "",
    job_type: "CLT"
  });

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["admin-jobs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select("*, businesses(name)")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: businesses } = useQuery({
    queryKey: ["admin-businesses-simple"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("active", true);
      if (error) throw error;
      return data;
    }
  });

  const addJobMutation = useMutation({
    mutationFn: async (job: typeof newJob) => {
      const { error } = await (supabase as any).from("jobs").insert([job]);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Vaga de emprego publicada com sucesso!");
      setIsAddDialogOpen(false);
      setNewJob({ title: "", business_id: "", description: "", requirements: "", salary_range: "", job_type: "CLT" });
    },
    onError: (err) => toast.error("Erro ao publicar: " + err.message)
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("jobs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
      toast.success("Vaga removida.");
    }
  });

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.businesses as any)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="p-8 space-y-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl text-primary">
                <Briefcase className="h-7 w-7" />
              </div>
              Vagas de Emprego
            </h1>
            <p className="text-slate-500 mt-1">Gerencie as oportunidades de trabalho oferecidas pelos lojistas.</p>
          </div>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-6 rounded-2xl gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95">
                <Plus className="h-5 w-5" /> Nova Vaga
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-none bg-white rounded-[32px] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Anunciar Vaga</DialogTitle>
                <DialogDescription>Preencha os detalhes da nova oportunidade local.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Título da Vaga</Label>
                  <Input 
                    value={newJob.title} 
                    onChange={e => setNewJob(p => ({...p, title: e.target.value}))}
                    placeholder="Ex: Vendedor de Loja, Garçom..."
                    className="bg-slate-50 border-none h-11"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Empresa Contratante</Label>
                  <Select value={newJob.business_id} onValueChange={val => setNewJob(p => ({...p, business_id: val}))}>
                    <SelectTrigger className="bg-slate-50 border-none h-11">
                      <SelectValue placeholder="Selecione a empresa" />
                    </SelectTrigger>
                    <SelectContent>
                      {businesses?.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-slate-400">Tipo (CLT, Freelance...)</Label>
                    <Input 
                      value={newJob.job_type} 
                      onChange={e => setNewJob(p => ({...p, job_type: e.target.value}))}
                      placeholder="Ex: CLT"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-xs font-bold uppercase text-slate-400">Faixa Salarial (Opcional)</Label>
                    <Input 
                      value={newJob.salary_range} 
                      onChange={e => setNewJob(p => ({...p, salary_range: e.target.value}))}
                      placeholder="Ex: R$ 2.000 - R$ 2.500"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-xs font-bold uppercase text-slate-400">Descrição/Requisitos</Label>
                  <Textarea 
                    value={newJob.description} 
                    onChange={e => setNewJob(p => ({...p, description: e.target.value}))}
                    placeholder="Descreva as funções e o que a empresa busca..."
                    className="bg-slate-50 border-none min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="ghost" onClick={() => setIsAddDialogOpen(false)} className="rounded-xl font-bold">Cancelar</Button>
                <Button 
                  onClick={() => addJobMutation.mutate(newJob)}
                  disabled={!newJob.title || !newJob.business_id}
                  className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl"
                >
                  Publicar Vaga
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          <Input 
            placeholder="Buscar por cargo ou empresa..." 
            className="pl-12 h-14 bg-white border-none shadow-sm rounded-2xl w-full"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="grid gap-6">
          {isLoading ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs?.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[32px] border border-dashed border-slate-200">
              <Briefcase className="h-16 w-16 text-slate-200 mx-auto mb-4" />
              <p className="text-slate-400 font-bold">Nenhuma vaga encontrada.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(jobs as any)?.map((job: any) => (
                <Card key={job.id} className="border-none shadow-sm bg-white hover:shadow-xl transition-all group overflow-hidden rounded-[32px] border border-slate-50">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                        <Briefcase className="h-6 w-6" />
                      </div>
                      <Badge variant="secondary" className="bg-green-50 text-green-600 border-none font-bold uppercase text-[9px]">
                        {job.job_type}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl font-black mt-4 leading-tight">{job.title}</CardTitle>
                    <div className="flex items-center gap-2 text-slate-400 pt-1">
                      <Building2 className="h-3 w-3" />
                      <span className="text-xs font-bold uppercase tracking-wider">{(job.businesses as any)?.name}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                      {job.description || "Sem descrição disponível."}
                    </p>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400">
                        <DollarSign className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase">{job.salary_range || 'A combinar'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 justify-end">
                        <Calendar className="h-3 w-3 text-primary" />
                        <span className="text-[10px] font-black uppercase">
                          {new Date(job.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center gap-2">
                         {job.is_active ? (
                           <Badge className="bg-green-500 text-white border-none gap-1 py-1 rounded-full text-[9px] font-black uppercase">
                             <CheckCircle2 className="h-3 w-3" /> Ativa
                           </Badge>
                         ) : (
                           <Badge className="bg-slate-200 text-slate-500 border-none gap-1 py-1 rounded-full text-[9px] font-black uppercase">
                             <XCircle className="h-3 w-3" /> Pausada
                           </Badge>
                         )}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => deleteJobMutation.mutate(job.id)} className="text-slate-300 hover:text-red-400 hover:bg-red-50 h-10 w-10 rounded-full transition-colors">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
