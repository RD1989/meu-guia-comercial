import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, MapPin, Building2, Search, Filter, ArrowRight, Sparkles, DollarSign, Mail, Phone, Clock } from "lucide-react";
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
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { usePlatform } from "@/contexts/PlatformContext";

export default function JobApplicationsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const { currentCity } = usePlatform();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["public-jobs", currentCity],
    queryFn: async () => {
      let query = (supabase as any)
        .from("jobs")
        .select("*, businesses(name, address, city, image_url)")
        .eq("active", true)
        .order("created_at", { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  const filteredJobs = jobs.filter((job: any) => {
    const matchesSearch = 
      job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (job.businesses as any)?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesCity = !currentCity || (job.businesses as any)?.city === currentCity;
    return matchesSearch && matchesCity;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24 md:pb-12">
      <Header />

      {/* Header Hero */}
      <div className="bg-slate-950 text-white pt-32 pb-20 px-6 overflow-hidden relative">
         <div className="absolute -top-24 -right-24 h-64 w-64 bg-primary/20 rounded-full blur-3xl" />
         <div className="max-w-6xl mx-auto relative z-10">
           <Badge className="bg-primary/20 text-primary border-none mb-4 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
             <Sparkles className="h-4 w-4 mr-2 inline" /> Oportunidades em {currentCity || "Sua Região"}
           </Badge>
           <h1 className="text-4xl md:text-6xl font-[900] mb-4 leading-tight tracking-tight">
             Encontre seu próximo <span className="text-primary">desafio.</span>
           </h1>
           <p className="text-slate-400 text-base md:text-lg max-w-2xl font-medium">
             Conectamos os melhores talentos às empresas e comércios locais da nossa cidade.
           </p>
         </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-8 pb-12">
        {/* Barra de Busca */}
        <div className="bg-white p-3 sm:p-4 rounded-[2rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row gap-3 items-stretch">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input 
              placeholder="Qual cargo, profissão ou empresa você procura?" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="pl-12 h-12 bg-slate-50 border-none rounded-2xl w-full text-sm font-medium"
            />
          </div>
          <Button className="h-12 px-8 bg-slate-900 hover:bg-primary text-white font-black rounded-2xl text-xs uppercase tracking-wider gap-2 transition-all">
            <Filter className="h-4 w-4" /> Buscar Vagas
          </Button>
        </div>

        {/* Listagem de Vagas */}
        <div className="mt-10 space-y-4">
          {isLoading ? (
            <div className="flex justify-center p-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : filteredJobs.length === 0 ? (
            <div className="bg-white p-16 text-center rounded-[2.5rem] border border-slate-100 shadow-sm">
               <Briefcase className="h-14 w-14 text-slate-200 mx-auto mb-3" />
               <p className="text-slate-900 font-black text-lg">Nenhuma vaga aberta no momento</p>
               <p className="text-slate-400 text-xs mt-1">Tente buscar por outro termo ou volte mais tarde.</p>
            </div>
          ) : (
            filteredJobs.map((job: any, idx: number) => (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                key={job.id}
              >
                <Card className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-[2rem] border border-slate-100 p-6 sm:p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex items-start sm:items-center gap-4">
                      {job.businesses?.image_url ? (
                        <img src={job.businesses.image_url} alt={job.businesses.name} className="h-16 w-16 rounded-2xl object-cover shrink-0 shadow-sm" />
                      ) : (
                        <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-black shrink-0 text-xl">
                          <Briefcase className="h-7 w-7" />
                        </div>
                      )}
                      
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-xl font-[900] text-slate-900 tracking-tight">{job.title}</h2>
                          <Badge className="bg-slate-100 text-slate-600 border-none font-bold text-[9px] px-2.5 py-0.5 uppercase">
                            {job.job_type || "CLT"}
                          </Badge>
                        </div>
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Building2 className="h-3.5 w-3.5 text-primary" /> {job.businesses?.name || "Empresa Local"}
                          {job.businesses?.city && <span>• {job.businesses.city}</span>}
                        </p>
                        {job.salary && (
                          <p className="text-xs font-black text-emerald-600 flex items-center gap-1">
                            <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button className="rounded-2xl h-12 px-6 bg-primary hover:bg-primary/90 text-white font-black text-xs uppercase tracking-wider gap-2 shadow-lg shadow-primary/20">
                            Candidatar-se <ArrowRight className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px] rounded-3xl p-6 bg-white">
                          <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900">{job.title}</DialogTitle>
                            <DialogDescription className="text-xs text-slate-500 font-medium">
                              {job.businesses?.name} • {job.job_type}
                            </DialogDescription>
                          </DialogHeader>
                          
                          {job.description && (
                            <div className="py-2 space-y-1 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl">
                              <p className="font-bold text-slate-900">Sobre a vaga:</p>
                              <p className="leading-relaxed">{job.description}</p>
                              {job.requirements && (
                                <>
                                  <p className="font-bold text-slate-900 pt-2">Requisitos:</p>
                                  <p className="leading-relaxed">{job.requirements}</p>
                                </>
                              )}
                            </div>
                          )}

                          <ApplyJobForm jobId={job.id} />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))
          )}
        </div>
      </div>

      <BottomTabBar />
    </div>
  );
}
