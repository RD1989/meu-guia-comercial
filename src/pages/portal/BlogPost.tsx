import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/portal/Header";
import { BottomTabBar } from "@/components/portal/BottomTabBar";
import { Loader2, Calendar, User, ArrowLeft, Share2, Sparkles, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import ReactMarkdown from 'react-markdown';
import { DUMMY_POSTS } from "@/data/dummy-data";

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

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const { data: post, isLoading, isError, error } = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("blog_posts")
        .select("*")
        .eq("slug", slug)
        .single();
      
      if (error) {
        // Fallback para Dummy Data se não encontrar no banco
        const dummyPost = DUMMY_POSTS.find(p => p.slug === slug);
        if (dummyPost) {
          return {
            ...dummyPost,
            cover_image_url: (dummyPost as any).cover_image_url || null,
            excerpt: (dummyPost as any).excerpt || null,
            category: (dummyPost as any).category || 'Geral',
            status: 'published',
            created_at: dummyPost.date,
            updated_at: dummyPost.date,
            ai_generated: true
          } as BlogPost;
        }
        throw error;
      }
      return data as BlogPost;
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-slate-500">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="font-medium">Carregando conteúdo...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-red-50 p-8 rounded-2xl border border-red-100 max-w-lg w-full">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-red-900 mb-2">Erro de Carregamento</h1>
          <p className="text-red-700 font-medium mb-6">{(error as any)?.message || "Não foi possível carregar a publicação."}</p>
          <Button onClick={() => navigate("/blog")} className="rounded-xl font-bold">Voltar para o Blog</Button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight mb-4">Post não encontrado</h1>
        <p className="text-slate-500 font-medium mb-8">O artigo procurado foi removido ou nunca existiu.</p>
        <Button onClick={() => navigate("/blog")} className="rounded-xl font-bold">Retornar ao Blog</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 md:pb-0 font-sans">
      <Header />
      
      <article className="max-w-4xl mx-auto px-6 pt-12 md:pt-16">
        <Button variant="ghost" onClick={() => navigate("/blog")} className="mb-8 p-0 hover:bg-transparent text-slate-500 hover:text-primary gap-2 font-bold transition-colors">
          <ArrowLeft className="h-4 w-4" /> Voltar para Artigos
        </Button>

        <header className="mb-10">
          <div className="flex flex-wrap gap-4 items-center mb-6">
            <Badge className="bg-primary/10 text-primary border-none px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest rounded-full">
              {post.category}
            </Badge>
            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-slate-400" /> {new Date(post.created_at).toLocaleDateString('pt-BR')}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-4 w-4 text-slate-400" /> 3 min leitura</span>
            </div>
          </div>

          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 leading-[1.15] mb-8 tracking-tight">
            {post.title}
          </h1>

          <div className="flex items-center justify-between pb-8 border-b border-slate-200">
             <div className="flex items-center gap-4">
               <div className="h-12 w-12 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 shadow-sm">
                 {post.ai_generated ? <Sparkles className="h-5 w-5 text-primary" /> : <User className="h-5 w-5" />}
               </div>
               <div>
                  <div className="text-sm font-bold text-slate-900 leading-none mb-1">
                    {post.ai_generated ? 'Inteligência Artificial' : 'Equipe Editorial'}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {post.ai_generated ? 'Agente de Conteúdo' : 'Autor Oficial'}
                  </div>
               </div>
             </div>
             <Button variant="outline" size="icon" className="rounded-xl h-12 w-12 border-slate-200 hover:text-primary hover:border-primary hover:bg-slate-50 transition-all shadow-sm">
               <Share2 className="h-4 w-4" />
             </Button>
          </div>
        </header>

        {post.cover_image_url && (
          <div className="mb-12 rounded-2xl overflow-hidden shadow-sm border border-slate-200 bg-white">
            <img src={post.cover_image_url} alt={post.title} className="w-full h-auto object-cover max-h-[450px]" />
          </div>
        )}

        <div className="bg-white rounded-2xl border border-slate-200 p-8 md:p-12 shadow-sm mb-12">
          <div className="prose prose-slate prose-lg max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:leading-relaxed prose-p:text-slate-600 prose-img:rounded-xl prose-a:text-primary font-medium">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </div>

        <section className="bg-white rounded-2xl p-8 md:p-10 mb-20 text-center border border-slate-200 shadow-sm">
          <h3 className="text-2xl font-bold text-slate-800 mb-3 tracking-tight">Informação útil?</h3>
          <p className="text-slate-500 font-medium mb-8 max-w-md mx-auto">
            Este conteúdo ajuda você a tomar melhores decisões. Siga nosso guia para mais novidades do comércio local.
          </p>
          <div className="flex justify-center gap-4">
             <Button className="bg-primary rounded-xl px-8 h-12 font-bold text-base shadow-none hover:bg-primary/90">
               Explorar mais empresas
             </Button>
          </div>
        </section>
      </article>

      <BottomTabBar />
    </div>
  );
}
