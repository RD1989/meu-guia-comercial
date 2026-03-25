import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Loader2, Calendar, User, ArrowLeft, Share2, Sparkles, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-4xl font-black text-slate-800 mb-4">Post não encontrado</h1>
        <Button onClick={() => navigate("/blog")} className="rounded-full">Voltar para o Blog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20 md:pb-0">
      <Header />
      
      <article className="max-w-4xl mx-auto px-6 pt-12 md:pt-20">
        <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-8 p-0 hover:bg-transparent text-slate-400 hover:text-primary gap-2 font-bold uppercase text-[10px] tracking-widest">
          <ArrowLeft className="h-4 w-4" /> Voltar para lista
        </Button>

        <header className="mb-12">
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-[10px] font-black uppercase tracking-widest">
              {post.category}
            </Badge>
            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4" /> 5 min de leitura</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-black text-slate-900 leading-[1.1] mb-8 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pb-8 border-b border-slate-100">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg">
                 {post.ai_generated ? <Sparkles className="h-6 w-6" /> : <User className="h-6 w-6" />}
               </div>
               <div>
                  <div className="text-sm font-black text-slate-800 leading-none mb-1">
                    {post.ai_generated ? 'Inteligência Artificial' : 'Equipe Editorial'}
                  </div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider italic">
                    {post.ai_generated ? 'Agente de Conteúdo OpenRouter' : 'Editor Chefe'}
                  </div>
               </div>
             </div>
             <Button variant="outline" size="icon" className="rounded-2xl h-12 w-12 border-slate-100 hover:text-primary hover:border-primary transition-all">
               <Share2 className="h-5 w-5" />
             </Button>
          </div>
        </header>

        {post.cover_image_url && (
          <div className="mb-12 rounded-[40px] overflow-hidden shadow-2xl shadow-slate-200">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-auto object-cover max-h-[500px]" />
          </div>
        )}

        <div className="prose prose-slate prose-lg max-w-none prose-headings:font-black prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-600 prose-img:rounded-[32px] mb-20 font-medium">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>

        <section className="bg-slate-50 rounded-[40px] p-8 md:p-12 mb-20 text-center border border-slate-100">
          <h3 className="text-2xl font-black text-slate-800 mb-4">Gostou deste artigo?</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            Este conteúdo foi gerado automaticamente pela nossa IA para manter você sempre informado sobre os melhores negócios da região.
          </p>
          <div className="flex justify-center gap-4">
             <Button className="bg-primary rounded-full px-8 font-bold shadow-lg shadow-primary/20">Seguir Guia no Instagram</Button>
          </div>
        </section>
      </article>

      <BottomTabBar />
    </div>
  );
}
