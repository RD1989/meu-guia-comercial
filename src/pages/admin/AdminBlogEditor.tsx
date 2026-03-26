import React, { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  ArrowLeft, 
  Save, 
  Sparkles, 
  Image as ImageIcon, 
  Eye, 
  ChevronRight,
  RefreshCw,
  Search,
  HelpCircle,
  FileText
} from "lucide-react";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

export default function AdminBlogEditor() {
  const { slug: existingSlug } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [activeTab, setActiveTab] = useState("editor");

  const [post, setPost] = useState({
    title: "",
    slug: "",
    content: "",
    excerpt: "",
    cover_image_url: "",
    category: "Geral",
    status: "draft",
    tags: [] as string[],
    seo_title: "",
    seo_description: "",
    ai_generated: false
  });

  const { data: blogCategories = [] } = useQuery({
    queryKey: ["admin-blog-categories-list"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).from("blog_categories").select("*");
      if (error) return [];
      return data;
    }
  });

  useEffect(() => {
    if (existingSlug) {
      fetchPost();
    }
  }, [existingSlug]);

  const fetchPost = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("blog_posts")
      .select("*")
      .eq("slug", existingSlug)
      .single();
    
    if (data) setPost(data);
    setLoading(false);
  };

  const handleGenerateAI = async () => {
    if (!post.title) {
      toast.error("Informe um tema ou título para a IA começar!");
      return;
    }

    setGenerating(true);
    try {
      // Chamada para a Edge Function que integra com OpenRouter
      const { data, error } = await supabase.functions.invoke("generate-article", {
        body: { topic: post.title }
      });

      if (error) throw error;

      setPost(prev => ({
        ...prev,
        ...data,
        ai_generated: true,
        slug: data.title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '')
      }));

      toast.success("Artigo gerado com sucesso pela IA!");
    } catch (error: any) {
      toast.error("Erro na geração: " + error.message);
      console.error(error);
    } finally {
      setGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!post.title || !post.slug) {
      toast.error("Título e Slug são obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("blog_posts")
        .upsert({
          ...post,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      toast.success("Artigo salvo!");
      navigate("/admin/blog");
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => navigate("/admin/blog")} className="gap-2 text-slate-500">
            <ArrowLeft className="h-4 w-4" /> Voltar
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setActiveTab(activeTab === "editor" ? "preview" : "editor")} className="gap-2">
              <Eye className="h-4 w-4" /> {activeTab === "editor" ? "Prévia" : "Editar"}
            </Button>
            <Button onClick={handleSave} disabled={loading} className="gap-2 bg-primary px-8">
              <Save className="h-4 w-4" /> {loading ? "Salvando..." : "Salvar Artigo"}
            </Button>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden min-h-[500px]">
              <CardHeader className="border-b border-slate-50 py-3">
                <div className="flex items-center justify-between">
                  <div className="flex bg-slate-100 p-1 rounded-lg">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab("editor")}
                      className={`h-8 px-4 text-xs font-bold rounded-md ${activeTab === "editor" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <FileText className="h-3 w-3 mr-2" /> Editor
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setActiveTab("preview")}
                      className={`h-8 px-4 text-xs font-bold rounded-md ${activeTab === "preview" ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"}`}
                    >
                      <Eye className="h-3 w-3 mr-2" /> Prévia Visual
                    </Button>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleGenerateAI}
                    disabled={generating}
                    className="text-primary hover:text-primary hover:bg-primary/5 gap-2 text-xs font-bold"
                  >
                    {generating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    Polir com IA
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {activeTab === "editor" ? (
                  <div className="p-6 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="title" className="text-xs font-bold text-slate-400 uppercase">Título do Artigo</Label>
                      <Input 
                        id="title" 
                        value={post.title} 
                        onChange={(e) => setPost({...post, title: e.target.value})}
                        placeholder="Ex: 5 Melhores Pizzarias em São Paulo..." 
                        className="text-2xl font-black py-8 border-none bg-slate-50/30 focus-visible:ring-0 placeholder:text-slate-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="content" className="text-xs font-bold text-slate-400 uppercase">Conteúdo (Markdown)</Label>
                      <Textarea 
                        id="content" 
                        value={post.content} 
                        onChange={(e) => setPost({...post, content: e.target.value})}
                        placeholder="Escreva seu artigo aqui..."
                        className="font-mono text-base leading-relaxed bg-transparent border-none focus-visible:ring-0 min-h-[400px] resize-none scrollbar-hide active:bg-slate-50/20 transition-colors"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="p-8 prose prose-slate max-w-none prose-headings:font-black prose-p:leading-relaxed prose-img:rounded-2xl">
                    <h1 className="text-4xl font-black text-slate-900 mb-6">{post.title || "Sem Título"}</h1>
                    {post.cover_image_url && (
                      <img src={post.cover_image_url} alt="" className="w-full h-72 object-cover rounded-2xl mb-8 shadow-lg shadow-slate-200" />
                    )}
                    <div className="whitespace-pre-wrap text-slate-700 text-lg leading-relaxed">
                      {post.content || "Nenhum conteúdo para visualizar ainda."}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-lg">Configurações de SEO</CardTitle>
                    <Badge variant="outline" className="text-emerald-500 bg-emerald-50 border-emerald-100 uppercase text-[9px]">Otimizado</Badge>
                  </div>
                  <HelpCircle className="h-4 w-4 text-slate-300" />
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Mockup do Google */}
                <div className="space-y-3">
                  <Label className="text-xs font-bold text-slate-400 uppercase">Prévia no Google Search</Label>
                  <div className="p-4 bg-white border border-slate-100 rounded-xl shadow-sm space-y-1.5 font-sans overflow-hidden">
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 truncate">
                      <div className="h-4 w-4 rounded-full bg-slate-100 flex items-center justify-center text-[8px]">G</div>
                      <span>{window.location.host} › blog › {post.slug || "exemplo-post"}</span>
                    </div>
                    <div className="text-xl text-[#1a0dab] hover:underline cursor-pointer line-clamp-1 truncate">
                      {post.seo_title || post.title || "Título do Artigo Principal"}
                    </div>
                    <div className="text-sm text-[#4d5156] line-clamp-2 leading-snug">
                       <span className="text-[#70757a]">{format(new Date(), 'dd/MM/yyyy')} — </span>
                       {post.seo_description || post.excerpt || "O resumo do seu artigo aparecerá aqui nos resultados de busca do Google. Certifique-se de incluir palavras-chave relevantes."}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="seo_title" className="text-xs font-bold">Título SEO</Label>
                      <span className={`text-[10px] ${(post.seo_title?.length || 0) > 60 ? 'text-amber-500' : 'text-slate-400'}`}>
                        {post.seo_title?.length || 0}/60
                      </span>
                    </div>
                    <Input 
                      id="seo_title" 
                      value={post.seo_title} 
                      onChange={(e) => setPost({...post, seo_title: e.target.value})} 
                      placeholder="Título curto e impactante"
                      className="bg-slate-50 border-none h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="slug_edit" className="text-xs font-bold">Slug (URL)</Label>
                    </div>
                    <Input 
                      id="slug_edit" 
                      value={post.slug} 
                      onChange={(e) => setPost({...post, slug: e.target.value})} 
                      className="bg-slate-50 border-none h-11 font-mono text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="seo_description" className="text-xs font-bold">Meta Descritor (Snippet)</Label>
                    <span className={`text-[10px] ${(post.seo_description?.length || 0) > 160 ? 'text-amber-500' : 'text-slate-400'}`}>
                      {post.seo_description?.length || 0}/160
                    </span>
                  </div>
                  <Textarea 
                    id="seo_description" 
                    value={post.seo_description} 
                    onChange={(e) => setPost({...post, seo_description: e.target.value})} 
                    rows={3} 
                    placeholder="Certifique-se de preencher para melhorar o clique nas buscas."
                    className="bg-slate-50 border-none resize-none px-4 py-3 leading-relaxed"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Publicação</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold">Estado</Label>
                  <Select value={post.status} onValueChange={(val) => setPost({...post, status: val})}>
                    <SelectTrigger className="bg-slate-50 border-none h-10">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="published">Publicado</SelectItem>
                      <SelectItem value="scheduled">Agendado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] font-bold">Categoria</Label>
                  <Select value={post.category} onValueChange={(val) => setPost({...post, category: val})}>
                    <SelectTrigger className="bg-slate-50 border-none h-10">
                      <SelectValue placeholder="Selecione uma categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Geral">Geral</SelectItem>
                      {blogCategories.map((cat: any) => (
                        <SelectItem key={cat.id} value={cat.name}>{cat.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Imagem de Capa</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="h-44 w-full bg-slate-50 rounded-xl flex items-center justify-center border-2 border-dashed border-slate-100 overflow-hidden relative group">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt="Capa" className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  ) : (
                    <div className="text-center">
                      <ImageIcon className="h-8 w-8 text-slate-200 mx-auto" />
                      <p className="text-[10px] text-slate-300 mt-2">Clique para adicionar</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                    <Button variant="secondary" size="sm" className="gap-2 text-[10px] font-bold">
                      <RefreshCw className="h-3 w-3" /> Alterar Foto
                    </Button>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400">URL da Imagem</Label>
                  <Input 
                    placeholder="https://..." 
                    value={post.cover_image_url} 
                    onChange={(e) => setPost({...post, cover_image_url: e.target.value})}
                    className="text-[10px] bg-slate-50 border-none h-8"
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white overflow-hidden">
              <CardHeader className="border-b border-slate-50 py-3">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400">Resumo (Excerpt)</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <Textarea 
                  value={post.excerpt} 
                  onChange={(e) => setPost({...post, excerpt: e.target.value})} 
                  placeholder="Um parágrafo curto que convida o leitor..."
                  rows={5}
                  className="text-xs border-none bg-slate-50/50 resize-none leading-relaxed"
                />
                <p className="text-[10px] text-slate-400 mt-2 italic">Aparece na listagem principal do blog.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
