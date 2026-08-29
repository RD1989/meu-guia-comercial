import React from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { AnimatedPage } from "@/components/admin/AnimatedPage";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, ShieldAlert, Clock, Eye, MessageSquare, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

const AdminCommunityModeration = () => {
  const { data: pendingPosts, isLoading, refetch } = useQuery({
    queryKey: ["pending-community-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("community_posts")
        .select(`
          *,
          profiles(name, avatar_url)
        `)
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  const handleAction = async (postId: string, status: 'published' | 'rejected') => {
    const { error } = await supabase
      .from("community_posts")
      .update({ status })
      .eq("id", postId);

    if (error) {
      toast.error("Erro ao atualizar status");
      return;
    }

    toast.success(status === 'published' ? "Post aprovado!" : "Post rejeitado.");
    refetch();
  };

  return (
    <AdminLayout>
      <AnimatedPage>
        <div className="space-y-8 p-6 lg:p-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-3xl font-[900] text-slate-900 tracking-tighter">Moderação de Comunidade</h2>
              <p className="text-slate-500 mt-1 font-medium">Revise as postagens que aguardam aprovação manual ou da IA.</p>
            </div>
            <div className="h-12 px-6 rounded-2xl bg-amber-50 border border-amber-100 flex items-center gap-2 text-amber-600 font-black uppercase text-[10px] tracking-widest">
               <ShieldAlert className="h-4 w-4" /> {pendingPosts?.length || 0} Pendentes
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-48 bg-slate-50 rounded-[2.5rem]" />)}
              </div>
            ) : pendingPosts?.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-100 p-20 text-center rounded-[3rem]">
                 <div className="h-16 w-16 bg-slate-50 rounded-3xl flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 className="h-8 w-8 text-slate-300" />
                 </div>
                 <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Tudo limpo por aqui! Nenhuma postagem pendente.</p>
              </Card>
            ) : (
              pendingPosts?.map((post: any) => (
                <Card key={post.id} className="border border-slate-100 shadow-sm rounded-[2.5rem] overflow-hidden bg-white hover:border-primary/20 transition-all">
                  <div className="flex flex-col md:flex-row">
                    {/* Media Preview */}
                    <div className="w-full md:w-64 aspect-square bg-slate-50 overflow-hidden relative">
                       {post.media_urls?.[0] ? (
                         post.media_type === 'video' ? (
                           <video src={post.media_urls[0]} className="w-full h-full object-cover" controls />
                         ) : (
                           <img src={post.media_urls[0]} className="w-full h-full object-cover" />
                         )
                       ) : (
                         <div className="h-full w-full flex items-center justify-center text-slate-200">
                            <Eye className="h-12 w-12" />
                         </div>
                       )}
                    </div>

                    {/* Content & Meta */}
                    <div className="flex-1 p-8 flex flex-col justify-between gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                             <div className="h-10 w-10 rounded-xl bg-slate-900 overflow-hidden flex items-center justify-center text-white font-black text-xs">
                                {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="w-full h-full object-cover" /> : post.profiles?.name?.[0]}
                             </div>
                             <div>
                                <p className="font-black text-slate-900 text-sm leading-none">{post.profiles?.name}</p>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1.5 flex items-center gap-1">
                                   <Clock className="h-3 w-3" /> {new Date(post.created_at).toLocaleDateString('pt-BR')} às {new Date(post.created_at).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </p>
                             </div>
                          </div>
                          <Badge className="bg-amber-100 text-amber-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-full">Aguardando IA</Badge>
                        </div>
                        
                        <p className="text-slate-600 text-sm italic border-l-4 border-slate-100 pl-4 py-1 leading-relaxed">
                          "{post.content}"
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-50">
                        <div className="flex gap-4">
                           <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                              <MessageSquare className="h-4 w-4" /> Comentários: {post.comments_count || 0}
                           </div>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline"
                            onClick={() => handleAction(post.id, 'rejected')}
                            className="h-12 px-6 rounded-2xl border-slate-100 text-rose-500 hover:bg-rose-50 font-black uppercase text-[10px] tracking-widest gap-2"
                          >
                             <XCircle className="h-4 w-4" /> Rejeitar
                          </Button>
                          <Button 
                            onClick={() => handleAction(post.id, 'published')}
                            className="h-12 px-8 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-emerald-500/20"
                          >
                             <CheckCircle2 className="h-4 w-4" /> Aprovar Post
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </AnimatedPage>
    </AdminLayout>
  );
};

export default AdminCommunityModeration;
