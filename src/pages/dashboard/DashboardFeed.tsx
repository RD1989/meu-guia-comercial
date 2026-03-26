import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";
import { Plus, Image, Megaphone, Tag, Calendar, Trash2, Heart, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const POST_TYPE_CONFIG = {
  update: { label: "Novidade", color: "bg-blue-100 text-blue-700", icon: Megaphone },
  promo: { label: "Promoção", color: "bg-primary/10 text-primary", icon: Tag },
  event: { label: "Evento", color: "bg-purple-100 text-purple-700", icon: Calendar },
};

export default function DashboardFeed() {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    content: "",
    image_url: "",
    post_type: "update",
    promo_until: "",
    event_date: "",
  });

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["business-posts", business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("business_posts")
        .select("*")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createPost = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("business_posts").insert({
        business_id: business!.id,
        content: form.content,
        image_url: form.image_url || null,
        post_type: form.post_type,
        promo_until: form.promo_until ? new Date(form.promo_until).toISOString() : null,
        event_date: form.event_date ? new Date(form.event_date).toISOString() : null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-posts"] });
      toast.success("Post publicado!");
      setOpen(false);
      setForm({ content: "", image_url: "", post_type: "update", promo_until: "", event_date: "" });
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  const deletePost = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("business_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business-posts"] });
      toast.success("Post removido.");
    },
  });

  return (
    <DashboardLayout title="Feed do Negócio">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[900] text-slate-900 tracking-tighter">Feed do Negócio</h2>
            <p className="text-sm text-slate-500 mt-1">Publique novidades, promoções e eventos para seus clientes.</p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/30"
          >
            <Plus className="h-4 w-4" /> Publicar
          </Button>
        </div>

        {/* Posts */}
        <div className="space-y-4 max-w-2xl">
          {isLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : posts.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-100 rounded-[2rem]">
              <CardContent className="p-16 text-center">
                <Megaphone className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum post ainda</p>
                <p className="text-xs text-slate-300 mt-2">Compartilhe novidades com seus clientes!</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {posts.map((post: any) => {
                const typeConfig = POST_TYPE_CONFIG[post.post_type as keyof typeof POST_TYPE_CONFIG];
                const Icon = typeConfig?.icon || Megaphone;
                return (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}>
                    <Card className="border border-slate-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {post.image_url && (
                        <img src={post.image_url} alt="Post" className="w-full h-48 object-cover" />
                      )}
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-3">
                              <span className={`inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${typeConfig?.color}`}>
                                <Icon className="h-3 w-3" /> {typeConfig?.label}
                              </span>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: ptBR })}
                              </span>
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{post.content}</p>
                            {post.event_date && (
                              <div className="flex items-center gap-1 mt-3 text-xs text-purple-600 font-bold">
                                <Calendar className="h-3.5 w-3.5" />
                                Evento: {new Date(post.event_date).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", hour: "2-digit", minute: "2-digit" })}
                              </div>
                            )}
                            {post.promo_until && (
                              <div className="flex items-center gap-1 mt-3 text-xs text-primary font-bold">
                                <Tag className="h-3.5 w-3.5" />
                                Promoção válida até: {new Date(post.promo_until).toLocaleDateString("pt-BR")}
                              </div>
                            )}
                          </div>
                          <Button
                            size="icon" variant="ghost"
                            onClick={() => deletePost.mutate(post.id)}
                            className="h-8 w-8 text-slate-200 hover:text-red-500 rounded-xl shrink-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50">
                          <Heart className="h-4 w-4 text-slate-300" />
                          <span className="text-xs text-slate-400 font-bold">{post.likes || 0} curtidas</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modal */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900">Criar Publicação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Tipo</Label>
              <Select value={form.post_type} onValueChange={(v) => setForm({ ...form, post_type: v })}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="update">📣 Novidade</SelectItem>
                  <SelectItem value="promo">🏷️ Promoção</SelectItem>
                  <SelectItem value="event">📅 Evento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Texto *</Label>
              <Textarea
                placeholder="O que você quer compartilhar com seus clientes?"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="mt-1 rounded-xl"
                rows={4}
              />
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">URL da Imagem (opcional)</Label>
              <Input
                placeholder="https://..."
                value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            {form.post_type === "event" && (
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Data/hora do Evento</Label>
                <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="mt-1 rounded-xl" />
              </div>
            )}
            {form.post_type === "promo" && (
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Promoção válida até</Label>
                <Input type="datetime-local" value={form.promo_until} onChange={(e) => setForm({ ...form, promo_until: e.target.value })} className="mt-1 rounded-xl" />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={() => createPost.mutate()}
              disabled={!form.content || createPost.isPending}
              className="rounded-xl bg-primary text-white font-black"
            >
              {createPost.isPending ? "Publicando..." : "Publicar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
