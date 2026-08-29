import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { usePlatform } from "@/contexts/PlatformContext";
import { Briefcase, ArrowRight, DollarSign, Building2, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export function HomeJobsSection() {
  const navigate = useNavigate();
  const { currentCity } = usePlatform();

  const { data: jobs = [], isLoading } = useQuery({
    queryKey: ["home-jobs-highlight", currentCity],
    queryFn: async () => {
      let query = (supabase as any)
        .from("jobs")
        .select("*, businesses(name, slug, image_url, city)")
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(3);

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    }
  });

  if (!isLoading && jobs.length === 0) {
    return null; // Não ocupa espaço se não houver vagas
  }

  return (
    <section className="py-16 px-6 max-w-7xl mx-auto border-t border-slate-100 font-sans">
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-blue-500 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="h-4 w-4" /> Oportunidades Locais
          </div>
          <h2 className="text-2xl sm:text-3xl font-[900] text-slate-900 tracking-tight">
            Vagas Abertas na Cidade
          </h2>
        </div>
        <Link 
          to="/vagas" 
          className="inline-flex items-center gap-1.5 text-primary text-xs sm:text-sm font-bold hover:underline"
        >
          Ver Todas <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-40 rounded-3xl bg-slate-100 animate-pulse" />
          ))
        ) : (
          jobs.map((job: any, i: number) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              onClick={() => navigate("/vagas")}
              className="bg-white rounded-3xl p-6 border border-slate-200/80 hover:border-primary/40 hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between group shadow-sm"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Badge className="bg-blue-50 text-blue-700 border-none font-black text-[9px] uppercase px-2.5 py-0.5">
                    {job.job_type || "CLT"}
                  </Badge>
                  {job.salary && (
                    <span className="text-xs font-black text-emerald-600 flex items-center">
                      <DollarSign className="h-3.5 w-3.5" /> {job.salary}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-primary transition-colors line-clamp-1">
                    {job.title}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium flex items-center gap-1.5 mt-1">
                    <Building2 className="h-3.5 w-3.5 text-slate-400" />
                    <span className="truncate">{job.businesses?.name || "Empresa Local"}</span>
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                <span className="text-[10px] font-bold text-slate-400">
                  Publicada em {new Date(job.created_at).toLocaleDateString("pt-BR")}
                </span>
                <span className="text-xs font-bold text-primary group-hover:underline flex items-center gap-1">
                  Candidatar-se <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </section>
  );
}
