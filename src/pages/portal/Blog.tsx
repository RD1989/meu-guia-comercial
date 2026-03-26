import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Loader2, Calendar, User, ArrowRight, Sparkles, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { usePlatform } from "@/contexts/PlatformContext";

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category: string;
  status: string;
  ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export default function Blog() {
  const { config } = usePlatform();
  
  const { data: posts = [], isLoading, isError, error } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as BlogPost[];
    },
    retry: 1
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20 md:pb-0">
      <Header />
      
      <section className="bg-white border-b border-slate-200 py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full opacity-[0.02] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#0f172a 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-none text-[11px] font-bold uppercase tracking-widest px-4 py-1.5 rounded-full">
            Conteúdo Exclusivo
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight mb-6">Blog Corporativo</h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Insights, novidades e visões de mercado sobre {config.platform_city} gerados em alta performance.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
            <p className="font-medium">Carregando artigos...</p>
          </div>
        ) : isError ? (
          <div className="text-center py-20 bg-red-50 rounded-2xl border border-red-100 shadow-sm max-w-2xl mx-auto">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-900 mb-2">Erro ao carregar o Blog</h2>
            <p className="text-red-700 font-medium">{(error as any)?.message || "Ocorreu um erro interno de conexão."}</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
            <div className="h-16 w-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-400 border border-slate-100">
              <Sparkles className="h-8 w-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mb-2">Ainda não temos artigos publicados</h2>
            <p className="text-slate-500 font-medium">Volte em breve para conferir as atualizações da nossa plataforma.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-sm hover:border-primary/40 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300">
                <div className="relative h-56 overflow-hidden bg-slate-100">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-slate-300">
                      <Sparkles className="h-10 w-10" />
                    </div>
                  )}
                  <div className="absolute top-4 left-4">
                    <Badge className="bg-white/95 text-slate-800 border-none px-3 py-1 text-[10px] font-bold uppercase tracking-widest shadow-sm">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {post.ai_generated ? 'IA' : 'Admin'}</span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-6 leading-relaxed">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-100">
                    <span className="text-sm font-bold text-primary transition-colors">Ler Mais</span>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-primary transition-colors hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomTabBar />
    </div>
  );
}
