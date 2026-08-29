import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  FileText, 
  Download, 
  Clock,
  Zap,
  Loader2,
  Trash2,
  Plus,
  DollarSign,
  Mail,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardJobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);
  const [openCreate, setOpenCreate] = useState(false);

  // Form State para Nova Vaga
  const [jobForm, setJobForm] = useState({
    title: "",
    job_type: "CLT",
    salary: "",
    description: "",
    requirements: "",
    contact_email: "",
    contact_whatsapp: ""
  });

  // 1. Buscar Empresas do Lojista
  const { data: businesses = [] } = useQuery({
    queryKey: ["my-businesses-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("owner_id", user?.id);
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id
  });

  const primaryBusiness = businesses[0];
  const businessIds = businesses.map(b => b.id);

  // 2. Buscar Vagas das Empresas
  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["my-jobs", businessIds],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select("*, job_applications(*)")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: businessIds.length > 0
  });

  // 3. Mutação para Criar Nova Vaga
  const createJobMutation = useMutation({
    mutationFn: async () => {
      if (!primaryBusiness) throw new Error("Cadastre sua empresa primeiro.");
      if (!jobForm.title.trim()) throw new Error("Título da vaga é obrigatório.");

      const { data, error } = await (supabase as any)
        .from("jobs")
        .insert([{
          business_id: primaryBusiness.id,
          title: jobForm.title,
          job_type: jobForm.job_type,
          salary: jobForm.salary || "A Combinar",
          description: jobForm.description,
          requirements: jobForm.requirements,
          contact_email: jobForm.contact_email,
          contact_whatsapp: jobForm.contact_whatsapp,
          active: true
        }])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Vaga de emprego publicada com sucesso!");
      setOpenCreate(false);
      setJobForm({
        title: "",
        job_type: "CLT",
        salary: "",
        description: "",
        requirements: "",
        contact_email: "",
        contact_whatsapp: ""
      });
    },
    onError: (err: any) => {
      toast.error("Erro ao criar vaga: " + err.message);
    }
  });

  // 4. Mutação para Excluir Vaga
  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      const { error } = await (supabase as any)
        .from("jobs")
        .delete()
        .eq("id", jobId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      toast.success("Vaga removida.");
    },
    onError: (err: any) => {
      toast.error("Erro ao remover vaga: " + err.message);
    }
  });

  // 5. Mutação para IA Recrutadora
  const recruiterMutation = useMutation({
    mutationFn: async (jobId: string) => {
      setAnalyzingId(jobId);
      const { data, error } = await supabase.functions.invoke("ai-recruiter", {
        body: { job_id: jobId }
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setAiResult(data);
      toast.success("Análise de talentos concluída pela IA!");
    },
    onError: (err: any) => {
      toast.error("Erro na análise IA: " + err.message);
    },
    onSettled: () => setAnalyzingId(null)
  });

  return (
    <DashboardLayout title="Gestão de Vagas">
      <div className="p-6 md:p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-[900] text-slate-900 flex items-center gap-3 tracking-tight">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                 <Users className="h-8 w-8" />
              </div>
              Gestão de Talentos & Vagas
            </h1>
            <p className="text-slate-500 mt-2 font-medium text-xs">Publique oportunidades e encontre os melhores profissionais da cidade.</p>
          </div>

          <Button 
            onClick={() => setOpenCreate(true)}
            className="h-12 px-6 rounded-2xl bg-primary hover:bg-primary/90 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/30"
          >
            <Plus className="h-4 w-4" /> Publicar Nova Vaga
          </Button>
        </div>

        {/* Modal de Criação de Vaga */}
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogContent className="sm:max-w-[600px] rounded-3xl p-8 bg-white border-none shadow-2xl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Briefcase className="h-6 w-6 text-primary" /> Publicar Vaga de Emprego
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 font-medium">
                Sua oportunidade será exibida no portal da cidade para milhares de candidatos.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold">Título do Cargo</Label>
                <Input 
                  value={jobForm.title}
                  onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                  placeholder="Ex: Atendente de Balcão, Cozinheiro, Tosador"
                  className="rounded-xl font-bold text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">Tipo de Contrato</Label>
                  <select 
                    value={jobForm.job_type}
                    onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                    className="w-full h-10 rounded-xl border bg-slate-50 px-3 text-xs font-bold"
                  >
                    <option value="CLT">CLT (Efetivo)</option>
                    <option value="PJ">PJ (Prestador)</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Meio Período">Meio Período</option>
                    <option value="Freelancer">Freelancer / Diária</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">Faixa Salarial</Label>
                  <Input 
                    value={jobForm.salary}
                    onChange={(e) => setJobForm({ ...jobForm, salary: e.target.value })}
                    placeholder="Ex: R$ 2.200,00 ou A Combinar"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">Descrição da Função & Atividades</Label>
                <Textarea 
                  value={jobForm.description}
                  onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                  placeholder="Descreva as principais responsabilidades do dia a dia..."
                  rows={3}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-bold">Requisitos & Diferenciais</Label>
                <Textarea 
                  value={jobForm.requirements}
                  onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                  placeholder="Ex: Experiência prévia de 1 ano, ensino médio completo, pontualidade..."
                  rows={2}
                  className="rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-bold">E-mail para Currículos</Label>
                  <Input 
                    type="email"
                    value={jobForm.contact_email}
                    onChange={(e) => setJobForm({ ...jobForm, contact_email: e.target.value })}
                    placeholder="vagas@suaempresa.com"
                    className="rounded-xl text-xs"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-bold">WhatsApp de Contato</Label>
                  <Input 
                    value={jobForm.contact_whatsapp}
                    onChange={(e) => setJobForm({ ...jobForm, contact_whatsapp: e.target.value })}
                    placeholder="11999998888"
                    className="rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="gap-2 sm:gap-0">
              <Button 
                variant="outline" 
                onClick={() => setOpenCreate(false)}
                className="rounded-xl font-bold text-xs"
              >
                Cancelar
              </Button>
              <Button 
                onClick={() => createJobMutation.mutate()}
                disabled={createJobMutation.isPending || !jobForm.title}
                className="rounded-xl font-bold text-xs bg-primary text-white"
              >
                {createJobMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publicar Oportunidade"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="flex justify-center p-20">
             <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <Card className="border-none shadow-sm bg-white p-16 text-center rounded-[2.5rem]">
             <Briefcase className="h-16 w-16 text-slate-200 mx-auto mb-4" />
             <h3 className="text-xl font-black text-slate-900 mb-1">Nenhuma vaga aberta</h3>
             <p className="text-slate-400 mb-6 text-xs max-w-sm mx-auto">Você ainda não publicou nenhuma vaga de emprego. Comece a contratar agora!</p>
             <Button 
               onClick={() => setOpenCreate(true)}
               className="bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-12 px-8 text-xs uppercase tracking-wider"
             >
               Publicar Primeira Vaga
             </Button>
          </Card>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job: any) => (
              <Card key={job.id} className="border-none shadow-xl bg-white overflow-hidden rounded-[2.5rem] border border-slate-50 transition-all hover:shadow-2xl">
                <div className="grid md:grid-cols-3">
                  {/* Info da Vaga */}
                  <div className="p-8 bg-slate-50 border-r border-slate-100 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[10px] px-3 py-1 rounded-full">
                          {job.job_type || "CLT"}
                        </Badge>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => deleteJobMutation.mutate(job.id)}
                          className="text-slate-300 hover:text-rose-500 h-8 w-8 rounded-lg" 
                          title="Remover vaga"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <h3 className="text-2xl font-black text-slate-900 leading-tight">{job.title}</h3>
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                        <Clock className="h-3.5 w-3.5 text-primary" /> Publicada em {new Date(job.created_at).toLocaleDateString("pt-BR")}
                      </div>
                      {job.salary && (
                        <p className="text-xs font-black text-emerald-600">Salário: {job.salary}</p>
                      )}
                    </div>

                    <div className="pt-6 space-y-3">
                      <div className="flex items-center justify-between p-3.5 bg-white rounded-2xl border border-slate-100 shadow-sm">
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Total de Candidatos</p>
                            <p className="text-xl font-black text-slate-900">{job.job_applications?.length || 0}</p>
                         </div>
                         <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <Users className="h-5 w-5" />
                         </div>
                      </div>

                      <Dialog onOpenChange={(open) => !open && setAiResult(null)}>
                         <DialogTrigger asChild>
                            <Button 
                              onClick={() => job.job_applications?.length > 0 && recruiterMutation.mutate(job.id)}
                              disabled={!job.job_applications?.length || analyzingId === job.id}
                              className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-black rounded-xl gap-2 shadow-lg shadow-primary/20 text-xs"
                            >
                               {analyzingId === job.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                               Analisar Candidatos com IA
                            </Button>
                         </DialogTrigger>
                         {aiResult && (
                           <DialogContent className="sm:max-w-[650px] border-none bg-white rounded-[2.5rem] shadow-2xl p-0 overflow-hidden">
                              <div className="bg-slate-950 p-8 text-white relative">
                                 <div className="absolute top-0 right-0 p-8 opacity-10"><Zap className="h-28 w-28 text-primary" /></div>
                                 <Badge className="bg-primary text-white border-none mb-3 font-black uppercase text-[10px] px-3 py-1">Veredito da IA Recrutadora</Badge>
                                 <h2 className="text-2xl font-black">Top Talentos Recomendados</h2>
                                 <p className="text-slate-400 mt-1 font-medium text-xs">{aiResult.overall_summary}</p>
                              </div>
                              <div className="p-8 space-y-4 max-h-[400px] overflow-y-auto">
                                 {aiResult.top_candidates?.map((cand: any, i: number) => (
                                   <div key={i} className="flex items-start gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-lg">
                                      <div className="h-10 w-10 bg-white rounded-xl flex items-center justify-center text-base font-black text-primary shadow-sm border border-slate-100 shrink-0">
                                         #{i + 1}
                                      </div>
                                      <div className="flex-1 min-w-0">
                                         <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-base font-black text-slate-900">{cand.name}</h4>
                                            <Badge className="bg-emerald-500 text-white border-none font-black text-[10px]">{cand.score}% Fit</Badge>
                                         </div>
                                         <p className="text-xs text-slate-500 leading-relaxed italic">"{cand.feedback}"</p>
                                      </div>
                                   </div>
                                 ))}
                              </div>
                           </DialogContent>
                         )}
                      </Dialog>
                    </div>
                  </div>

                  {/* Lista de Candidatos */}
                  <div className="md:col-span-2 p-8">
                    <Tabs defaultValue="all">
                      <div className="flex items-center justify-between mb-6">
                        <TabsList className="bg-slate-100 p-1 rounded-xl">
                          <TabsTrigger value="all" className="rounded-lg px-4 font-bold text-xs data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            Todos ({job.job_applications?.length || 0})
                          </TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="all" className="m-0">
                        <ScrollArea className="h-[320px] pr-4">
                          <div className="space-y-3">
                             {job.job_applications?.length === 0 ? (
                               <div className="text-center py-16 text-slate-300 font-bold uppercase tracking-widest text-xs">
                                 Nenhuma candidatura recebida ainda.
                               </div>
                             ) : (
                               job.job_applications?.map((app: any) => (
                                 <div key={app.id} className="p-4 bg-white border border-slate-100 rounded-2xl flex items-center justify-between group hover:border-primary/30 transition-all hover:bg-slate-50/50">
                                    <div className="flex items-center gap-3">
                                       <div className="h-10 w-10 bg-slate-900 rounded-xl flex items-center justify-center text-white shrink-0">
                                          <Users className="h-5 w-5" />
                                       </div>
                                       <div>
                                          <h4 className="font-black text-slate-900 text-sm leading-tight">{app.candidate_name}</h4>
                                          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{app.candidate_email}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                       {app.resume_url && (
                                         <Button 
                                           variant="ghost" 
                                           size="sm" 
                                           onClick={() => window.open(app.resume_url, "_blank")}
                                           className="text-slate-600 hover:text-primary hover:bg-white rounded-xl gap-1.5 font-bold text-xs"
                                         >
                                            <Download className="h-3.5 w-3.5" /> Currículo
                                         </Button>
                                       )}
                                    </div>
                                 </div>
                               ))
                             )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                    </Tabs>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
