import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Sparkles, 
  FileEdit, 
  Trash2, 
  Eye, 
  Search,
  CheckCircle2,
  Clock,
  Layout,
  FileText,
  Link,
  BarChart2,
  MoreVertical,
  ExternalLink,
  Filter,
  Image as ImageIcon
} from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminBlog() {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-posts", searchTerm],
    queryFn: async () => {
      let query = (supabase as any).from("blog_posts").select("*");
      if (searchTerm) {
        query = query.ilike("title", `%${searchTerm}%`);
      }
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "published": return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 gap-1"><CheckCircle2 className="h-3 w-3" /> <span>Publicado</span></Badge>;
      case "scheduled": return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 gap-1"><Clock className="h-3 w-3" /> <span>Agendado</span></Badge>;
      default: return <Badge variant="secondary" className="bg-slate-100 text-slate-600 gap-1"><FileEdit className="h-3 w-3" /> <span>Rascunho</span></Badge>;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Blog & Artigos</h1>
            <p className="text-slate-500">Crie conteúdo relevante para atrair tráfego e ajudar sua cidade.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
              <Plus className="h-4 w-4" /> Criar Manualmente
            </Button>
            <Button variant="outline" className="gap-2 border-primary/20 text-primary hover:bg-primary/5" onClick={() => navigate("/admin/ia/references")}>
              <Link className="h-4 w-4" /> Usar Referência
            </Button>
            <Button className="gap-2 bg-primary hover:bg-primary/90 shadow-sm" onClick={() => navigate("/admin/ia")}>
              <Sparkles className="h-4 w-4" /> Configurar IA
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-slate-100">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Buscar por título do artigo..." 
              className="pl-10 bg-slate-50 border-none focus-visible:ring-primary/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2 ml-auto">
            <Button variant="outline" size="sm" className="gap-2 border-slate-200">
              <Filter className="h-4 w-4" /> Filtrar
            </Button>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[
            { label: "Total de Posts", value: posts?.length || 0, icon: FileText, color: "text-blue-500" },
            { label: "Total de Visitas", value: posts?.reduce((acc: number, p: any) => acc + (p.views || 0), 0).toLocaleString() || 0, icon: Eye, color: "text-emerald-500" },
            { label: "Publicados", value: posts?.filter((p: any) => p.status === 'published').length || 0, icon: CheckCircle2, color: "text-primary" },
            { label: "Agendados/Draft", value: posts?.filter((p: any) => p.status !== 'published').length || 0, icon: Clock, color: "text-amber-500" },
          ].map((stat, i) => (
            <Card key={i} className="border-none shadow-sm bg-white overflow-hidden">
              <CardContent className="p-4 flex items-center gap-4">
                <div className={`p-2 rounded-lg bg-slate-50 ${stat.color}`}>
                  <stat.icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-xl font-black text-slate-800">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
          </div>
        ) : posts?.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center">
            <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-medium text-slate-800">Nenhum artigo ainda</h3>
            <p className="text-slate-500 max-w-xs mx-auto mt-2">Inicie seu blog hoje mesmo gerando um conteúdo profissional com Inteligência Artificial.</p>
            <Button className="mt-6 gap-2" onClick={() => navigate("/admin/ia")}>
              <Sparkles className="h-4 w-4" /> Começar com IA
            </Button>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="w-[100px]">Thumbnail</TableHead>
                  <TableHead className="min-w-[300px]">Artigo</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Métricas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts?.map((post: any) => (
                  <TableRow key={post.id} className="hover:bg-slate-50/50 transition-colors group">
                    <TableCell>
                      <div className="h-12 w-16 rounded-lg bg-slate-100 overflow-hidden border border-slate-200 relative">
                        {post.cover_image_url ? (
                          <img src={post.cover_image_url} alt="" className="h-full w-full object-cover" />
                        ) : (
                          <div className="flex items-center justify-center h-full"><ImageIcon className="h-4 w-4 text-slate-300" /></div>
                        )}
                        {post.ai_generated && (
                          <div className="absolute bottom-0 right-0 p-0.5 bg-primary rounded-tl">
                            <Sparkles className="h-2 w-2 text-white" />
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-bold text-slate-700 leading-tight line-clamp-1 group-hover:text-primary transition-colors cursor-pointer"
                           onClick={() => navigate(`/admin/blog/editor/${post.slug}`)}>
                          {post.title}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">/{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px] bg-slate-50 border-slate-200 text-slate-500">
                        {post.category || "Geral"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Eye className="h-3 w-3" /> {post.views || 0}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                          <Clock className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(post.status)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/admin/blog/editor/${post.slug}`)} className="gap-2">
                            <FileEdit className="h-4 w-4" /> Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2">
                            <ExternalLink className="h-4 w-4" /> Ver no Portal
                          </DropdownMenuItem>
                          <DropdownMenuItem className="gap-2 text-destructive">
                            <Trash2 className="h-4 w-4" /> Excluir
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
