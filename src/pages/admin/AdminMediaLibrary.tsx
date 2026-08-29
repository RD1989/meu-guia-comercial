import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Sparkles,
  Link as LinkIcon,
  Search,
  Filter
} from "lucide-react";
import { toast } from "sonner";

export default function AdminMediaLibrary() {
  const queryClient = useQueryClient();
  const [newMedia, setNewMedia] = useState({ title: "", media_url: "", category: "Geral" });
  const [isAdding, setIsAdding] = useState(false);

  const { data: mediaItems = [], isLoading } = useQuery({
    queryKey: ["admin-ai-media"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ai_media_library")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const addMutation = useMutation({
    mutationFn: async (payload: typeof newMedia) => {
      const { error } = await (supabase as any).from("ai_media_library").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-media"] });
      toast.success("Mídia adicionada com sucesso!");
      setNewMedia({ title: "", media_url: "", category: "Geral" });
      setIsAdding(false);
    },
    onError: (err: any) => toast.error("Erro: " + err.message)
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("ai_media_library").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-media"] });
      toast.success("Mídia removida.");
    }
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <ImageIcon className="h-8 w-8 text-primary" /> Galeria de Mídias IA
            </h1>
            <p className="text-slate-500 font-medium text-lg">Organize as imagens que a IA poderá usar em suas postagens.</p>
          </div>
          <Button 
            onClick={() => setIsAdding(!isAdding)} 
            className="rounded-full px-8 h-12 font-black shadow-lg shadow-primary/20 gap-2"
          >
            {isAdding ? "Cancelar" : <><Plus className="h-5 w-5" /> Adicionar Mídia</>}
          </Button>
        </div>

        {isAdding && (
          <Card className="border-none shadow-2xl shadow-slate-200 bg-white overflow-hidden animate-in fade-in slide-in-from-top-4">
            <CardHeader className="bg-slate-50 border-b border-slate-100">
              <CardTitle className="text-lg font-black text-slate-800">Nova Mídia de Apoio</CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <form onSubmit={(e) => { e.preventDefault(); addMutation.mutate(newMedia); }} className="grid md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-6">
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">Título / Descrição</Label>
                    <Input 
                      placeholder="Ex: Fachada de Restaurante Moderno..." 
                      value={newMedia.title}
                      onChange={(e) => setNewMedia({...newMedia, title: e.target.value})}
                      required
                      className="rounded-2xl border-slate-200 h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-slate-700">URL da Imagem (Link Direto)</Label>
                    <div className="relative">
                      <Input 
                        placeholder="https://..." 
                        value={newMedia.media_url}
                        onChange={(e) => setNewMedia({...newMedia, media_url: e.target.value})}
                        required
                        className="rounded-2xl border-slate-200 h-12 pr-10"
                      />
                      <LinkIcon className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    </div>
                  </div>
                </div>
                <div className="space-y-6">
                  <div className="h-full aspect-video md:aspect-auto md:h-[136px] bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                    {newMedia.media_url ? (
                      <img src={newMedia.media_url} alt="Preview" className="w-full h-full object-cover" onError={(e: any) => e.target.src = ''} />
                    ) : (
                      <ImageIcon className="h-10 w-10 text-slate-200" />
                    )}
                  </div>
                  <Button type="submit" disabled={addMutation.isPending} className="w-full rounded-full h-12 font-black shadow-xl shadow-primary/20">
                    {addMutation.isPending ? "Salvando..." : "Salvar na Galeria"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-20 text-center"><Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
          ) : mediaItems.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic text-slate-400 flex flex-col items-center gap-4">
              <ImageIcon className="h-12 w-12 opacity-20" />
              Nenhuma mídia na biblioteca.
            </div>
          ) : (
            mediaItems.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-[40px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2">
                <div className="aspect-[4/3] overflow-hidden bg-slate-100">
                  <img src={item.media_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                </div>
                <div className="p-6">
                  <h3 className="font-extrabold text-slate-800 text-sm line-clamp-1 mb-1">{item.title}</h3>
                  <div className="flex items-center justify-between">
                     <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{item.category}</span>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 rounded-full text-slate-300 hover:text-destructive hover:bg-destructive/5"
                        onClick={() => deleteMutation.mutate(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                  </div>
                </div>
                <div className="absolute top-4 left-4">
                   <div className="bg-white/90 backdrop-blur-md p-2 rounded-xl shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <LinkIcon className="h-3.5 w-3.5 text-primary" />
                   </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
