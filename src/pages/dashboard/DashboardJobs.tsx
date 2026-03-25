import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { 
  Briefcase, 
  Users, 
  Sparkles, 
  ChevronRight, 
  FileText, 
  Download, 
  CheckCircle, 
  XCircle, 
  Clock,
  Zap,
  Loader2,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";

export default function DashboardJobs() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [analyzingId, setAnalyzingId] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<any>(null);

  // 1. Buscar Empresas do Lojista
  const { data: businesses } = useQuery({
    queryKey: ["my-businesses-jobs", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("businesses")
        .select("id, name")
        .eq("owner_id", user?.id);
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id
  });

  const businessIds = businesses?.map(b => b.id) || [];

  // 2. Buscar Vagas das Empresas
  const { data: jobs, isLoading } = useQuery({
    queryKey: ["my-jobs", businessIds],
    queryFn: async () => {
      if (businessIds.length === 0) return [];
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select("*, job_applications(*)")
        .in("business_id", businessIds)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: businessIds.length > 0
  });

  // 3. Mutação para IA Recrutadora
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
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-slate-900 flex items-center gap-3">
              <div className="p-2.5 bg-primary/10 rounded-2xl text-primary">
                 <Users className="h-8 w-8" />
              </div>
              Gestão de Talentos
            </h1>
            <p className="text-slate-500 mt-2 font-medium">Encontre os melhores profissionais para o seu negócio.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-20">
             <Loader2 className="h-10 w-10 text-primary animate-spin" />
          </div>
        ) : jobs?.length === 0 ? (
          <Card className="border-none shadow-sm bg-white p-20 text-center rounded-[40px]">
             <Briefcase className="h-20 w-20 text-slate-100 mx-auto mb-6" />
             <h3 className="text-2xl font-black text-slate-900 mb-2">Sem vagas abertas</h3>
             <p className="text-slate-400 mb-8 max-w-md mx-auto">Você ainda não publicou nenhuma vaga de emprego. Comece a contratar agora!</p>
             <Button className="bg-primary hover:bg-primary/90 text-white font-black rounded-2xl h-14 px-10">Publicar Primeira Vaga</Button>
          </Card>
        ) : (
          <div className="grid gap-8">
            {jobs?.map((job) => (
              <Card key={job.id} className="border-none shadow-xl bg-white overflow-hidden rounded-[40px] border border-slate-50 transition-all hover:shadow-2xl">
                <div className="grid md:grid-cols-3">
                  {/* Info da Vaga */}
                  <div className="p-10 bg-slate-50 border-r border-slate-100 flex flex-col justify-between">
                    <div className="space-y-4">
                      <Badge className="bg-primary/10 text-primary border-none font-black uppercase text-[10px] px-4 py-1 rounded-full">
                        {(job as any).job_type}
                      </Badge>
                      <h3 className="text-3xl font-black text-slate-900 leading-tight">{(job as any).title}</h3>
                      <div className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[11px] tracking-widest">
                        <Clock className="h-4 w-4 text-primary" /> Publicada em {new Date((job as any).created_at).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="pt-8 space-y-4">
                      <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                         <div>
                            <p className="text-[10px] font-black uppercase text-slate-400">Total de Candidatos</p>
                            <p className="text-2xl font-black text-slate-900">{(job as any).job_applications?.length || 0}</p>
                         </div>
                         <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white">
                            <Users className="h-6 w-6" />
                         </div>
                      </div>

                      <Dialog onOpenChange={(open) => !open && setAiResult(null)}>
                         <DialogTrigger asChild>
                            <Button 
                              onClick={() => job.job_applications?.length > 0 && recruiterMutation.mutate(job.id)}
                              disabled={!job.job_applications?.length || analyzingId === job.id}
                              className="w-full h-14 bg-primary hover:bg-primary/90 text-white font-black rounded-2xl gap-3 shadow-lg shadow-primary/20 group"
                            >
                               {analyzingId === job.id ? <Loader2 className="h-5 w-5 animate-spin" /> : <Sparkles className="h-5 w-5 group-hover:rotate-12 transition-transform" />}
                               Analisar com IA
                            </Button>
                         </DialogTrigger>
                         {aiResult && (
                           <DialogContent className="sm:max-w-[700px] border-none bg-white rounded-[40px] shadow-2xl p-0 overflow-hidden">
                              <div className="bg-slate-950 p-10 text-white relative">
                                 <div className="absolute top-0 right-0 p-10 opacity-10"><Zap className="h-32 w-32 text-primary" /></div>
                                 <Badge className="bg-primary text-white border-none mb-4 font-black uppercase text-[10px] px-4 py-1">Veredito da IA Recrutadora</Badge>
                                 <h2 className="text-4xl font-black">Top 3 Talentos Recomendados</h2>
                                 <p className="text-slate-400 mt-2 font-medium">{aiResult.overall_summary}</p>
                              </div>
                              <div className="p-10 space-y-6">
                                 {aiResult.top_candidates?.map((cand: any, i: number) => (
                                   <div key={i} className="flex items-start gap-4 p-6 bg-slate-50 rounded-3xl border border-slate-100 relative group transition-all hover:bg-white hover:shadow-xl">
                                      <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center text-xl font-black text-primary shadow-sm border border-slate-100">
                                         #{i + 1}
                                      </div>
                                      <div className="flex-1">
                                         <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-lg font-black text-slate-900">{cand.name}</h4>
                                            <Badge className="bg-green-500 text-white border-none font-black text-[12px]">{cand.score}% Fit</Badge>
                                         </div>
                                         <p className="text-sm text-slate-500 leading-relaxed italic">"{cand.feedback}"</p>
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
                  <div className="md:col-span-2 p-10">
                    <Tabs defaultValue="all">
                      <div className="flex items-center justify-between mb-8">
                        <TabsList className="bg-slate-100 p-1 rounded-2xl">
                          <TabsTrigger value="all" className="rounded-xl px-6 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Todos</TabsTrigger>
                          <TabsTrigger value="pending" className="rounded-xl px-6 font-bold">Pendentes</TabsTrigger>
                        </TabsList>
                      </div>

                      <TabsContent value="all" className="m-0">
                        <ScrollArea className="h-[400px] pr-4">
                          <div className="space-y-4">
                             {(job as any).job_applications?.length === 0 ? (
                               <div className="text-center py-20 text-slate-300 font-bold uppercase tracking-widest">Nenhuma candidatura ainda.</div>
                             ) : (
                               (job as any).job_applications?.map((app: any) => (
                                 <div key={app.id} className="p-6 bg-white border border-slate-100 rounded-3xl flex items-center justify-between group hover:border-primary/30 transition-all hover:bg-slate-50/50">
                                    <div className="flex items-center gap-4">
                                       <div className="h-14 w-14 bg-slate-900 rounded-2xl flex items-center justify-center text-white">
                                          <User className="h-7 w-7" />
                                       </div>
                                       <div>
                                          <h4 className="font-black text-slate-900 text-lg leading-tight">{app.candidate_name}</h4>
                                          <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{app.candidate_email}</p>
                                       </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                       {app.resume_url && (
                                         <Button 
                                           variant="ghost" 
                                           size="sm" 
                                           onClick={() => window.open(app.resume_url, "_blank")}
                                           className="text-slate-500 hover:text-primary hover:bg-white rounded-xl gap-2 font-bold"
                                         >
                                            <Download className="h-4 w-4" /> Currículo
                                         </Button>
                                       )}
                                       <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-400 hover:bg-white rounded-full">
                                          <Trash2 className="h-5 w-5" />
                                       </Button>
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

const User = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);
