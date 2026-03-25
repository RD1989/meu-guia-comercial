import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Loader2, Calendar, User, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { usePlatform } from "@/contexts/PlatformContext";

export default function Blog() {
  const { config } = usePlatform();
  
  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["blog-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("status", "published")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20 md:pb-0">
      <Header />
      
      <section className="bg-white border-b border-slate-100 py-20 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', size: '20px 20px' }} />
        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <Badge className="mb-6 bg-primary/10 text-primary border-none text-[10px] font-black uppercase tracking-widest px-4 py-2">
            Conteúdo Exclusivo
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-6">Blog {config.platform_name}</h1>
          <p className="text-slate-500 text-lg md:text-xl font-medium max-w-2xl mx-auto">
            Dicas, novidades e os melhores roteiros de {config.platform_city} escritos por nossa inteligência artificial.
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-6 py-16">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <div className="h-20 w-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <Sparkles className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-800 mb-2">Ainda não temos artigos</h2>
            <p className="text-slate-500">Volte em breve para conferir as novidades da nossa inteligência artificial.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Link key={post.id} to={`/blog/${post.slug}`} className="group flex flex-col h-full bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                <div className="relative h-64 overflow-hidden">
                  {post.cover_image_url ? (
                    <img 
                      src={post.cover_image_url} 
                      alt={post.title} 
                      className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-slate-100 flex items-center justify-center text-slate-300">
                      <Sparkles className="h-12 w-12" />
                    </div>
                  )}
                  <div className="absolute top-6 left-6">
                    <Badge className="bg-white/90 text-primary border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest shadow-xl">
                      {post.category}
                    </Badge>
                  </div>
                </div>
                
                <div className="p-8 flex flex-col flex-1">
                  <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">
                    <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
                    <span className="flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> {post.ai_generated ? 'IA Writer' : 'Admin'}</span>
                  </div>
                  
                  <h3 className="text-2xl font-black text-slate-800 mb-4 group-hover:text-primary transition-colors leading-tight line-clamp-2">
                    {post.title}
                  </h3>
                  
                  <p className="text-slate-500 text-sm font-medium line-clamp-3 mb-8 leading-relaxed">
                    {post.excerpt || post.content.substring(0, 150) + "..."}
                  </p>
                  
                  <div className="mt-auto flex items-center justify-between">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Ler Artigo Completo</span>
                    <div className="h-10 w-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shadow-inner border border-slate-100">
                      <ArrowRight className="h-5 w-5" />
                    </div>
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
