import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Building2, Search, Filter, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ApplyJobForm } from "@/components/portal/ApplyJobForm";
import { motion } from "framer-motion";

export default function JobApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");

  const { data: jobs, isLoading } = useQuery({
    queryKey: ["public-jobs"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("jobs")
        .select("*, businesses(name, address)")
        .eq("is_active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const filteredJobs = jobs?.filter(job => 
    job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (job.businesses as any)?.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header Estilizado */}
      <div className="bg-slate-950 text-white py-16 md:py-24 px-6 overflow-hidden relative">
         <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 rounded-full blur-3xl" />
         <div className="max-w-6xl mx-auto relative z-10">
           <Badge className="bg-primary/20 text-primary border-none mb-6 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
             <Sparkles className="h-4 w-4 mr-2" /> Oportunidades Locais
           </Badge>
           <h1 className="text-4xl md:text-7xl font-black mb-6 leading-tight">Encontre seu próximo <span className="text-primary">desafio.</span></h1>
           <p className="text-slate-400 text-lg md:text-xl max-w-2xl font-medium">Conectamos os melhores talentos às empresas de elite da nossa cidade.</p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-10 pb-20">
        {/* Barra de Busca de Elite */}
        <div className="bg-white p-4 rounded-[32px] shadow-2xl shadow-slate-200 border border-slate-100 flex flex-col md:flex-row gap-4 items-stretch">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Qual cargo ou empresa você procura?" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 h-14 bg-slate-50 border-none rounded-2xl w-full text-lg font-medium"
            />
          </div>
          <Button className="h-14 px-10 bg-slate-900 hover:bg-primary text-white font-black rounded-2xl shadow-xl shadow-slate-200 gap-2 transition-all active:scale-95">
            <Filter className="h-5 w-5" /> Explorar Vagas
          </Button>
        </div>

        {/* Listagem de Vagas */}
        <div className="mt-12 space-y-6">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs?.length === 0 ? (
            <div className="bg-white p-20 text-center rounded-[40px] border-2 border-dashed border-slate-100">
               <Briefcase className="h-16 w-16 text-slate-200 mx-auto mb-4" />
               <p className="text-slate-400 font-bold text-xl uppercase tracking-tighter">Nenhuma vaga aberta neste momento.</p>
            </div>
          ) : (
            filteredJobs?.map((job, idx) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                key={job.id}
              >
                <Card className="border-none shadow-sm bg-white hover:shadow-xl transition-all group overflow-hidden rounded-[40px] border border-slate-50 cursor-default">
                  <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="flex items-center gap-6 flex-1">
                      <div className="h-20 w-20 rounded-3xl bg-slate-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-inner">
                        <Briefcase className="h-10 w-10" />
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h2 className="text-2xl font-black text-slate-900 group-hover:text-primary transition-colors">{job.title}</h2>
                           <Badge variant="secondary" className="bg-slate-100 text-slate-500 border-none font-black text-[9px] px-3 py-1 uppercase">{job.job_type}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">
                           <div className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {(job.businesses as any)?.name}</div>
                           <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {(job.businesses as any)?.address || 'Localização Ocorrida'}</div>
                           <div className="flex items-center gap-1.5 text-primary"><Sparkles className="h-3.5 w-3.5" /> {job.salary_range || 'A combinar'}</div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="flex-1 md:flex-none h-14 px-8 bg-slate-900 hover:bg-primary text-white font-black rounded-3xl gap-2 shadow-xl shadow-slate-100 transition-all active:scale-95 group">
                            Candidatar-se <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px] border-none bg-white rounded-[40px] shadow-2xl p-0 overflow-hidden">
                          <div className="bg-slate-900 p-8 text-white relative">
                             <div className="absolute top-0 right-0 p-8 opacity-10"><Briefcase className="h-24 w-24 text-primary" /></div>
                             <h3 className="text-3xl font-black mb-2">Seus Dados</h3>
                             <p className="text-slate-400 font-medium">Candidatura para <strong>{job.title}</strong></p>
                          </div>
                          <div className="p-8">
                            <ApplyJobForm jobId={job.id} jobTitle={job.title} />
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
);
