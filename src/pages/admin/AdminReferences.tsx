import React, { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Link as LinkIcon, 
  Plus, 
  Trash2, 
  FileText, 
  CheckCircle2, 
  Clock,
  Sparkles,
  ExternalLink,
  Search,
  Globe,
  Rss,
  Activity,
  ChevronRight,
  Zap
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

export default function AdminReferences() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("manual");
  const [isAdding, setIsAdding] = useState(false);

  // Estados para nova referência (Manual)
  const [newRef, setNewRef] = useState({ title: "", url: "", content: "", source_type: "url" });
  
  // Estados para nova fonte (Autopilot)
  const [newSource, setNewSource] = useState({ 
    name: "", 
    url: "", 
    type: "RSS", 
    tone_of_voice: "informativo",
    auto_publish: true 
  });

  const { data: references = [], isLoading: loadingRefs } = useQuery({
    queryKey: ["admin-ai-references"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("ai_references")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: sources = [], isLoading: loadingSources } = useQuery({
    queryKey: ["admin-news-sources"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("news_sources")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const addRefMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await (supabase as any).from("ai_references").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-references"] });
      toast.success("Referência manual adicionada!");
      setNewRef({ title: "", url: "", content: "", source_type: "url" });
      setIsAdding(false);
    }
  });

  const addSourceMutation = useMutation({
    mutationFn: async (payload: any) => {
      const { error } = await (supabase as any).from("news_sources").insert(payload);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news-sources"] });
      toast.success("Fonte de autopilot cadastrada!");
      setNewSource({ name: "", url: "", type: "RSS", tone_of_voice: "informativo", auto_publish: true });
      setIsAdding(false);
    }
  });

  const deleteRefMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("ai_references").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-ai-references"] });
      toast.success("Referência removida.");
    }
  });

  const deleteSourceMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("news_sources").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-news-sources"] });
      toast.success("Fonte removida.");
    }
  });

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
              <Sparkles className="h-8 w-8 text-primary" /> Hub de Conhecimento IA
            </h1>
            <p className="text-slate-500 font-medium italic">Gerencie o que o robô lê para criar seus conteúdos.</p>
          </div>
          <Button 
            onClick={() => setIsAdding(!isAdding)} 
            className="rounded-full px-8 font-black shadow-lg shadow-primary/20 gap-2 h-12"
          >
            {isAdding ? "Fechar Painel" : <><Plus className="h-4 w-4" /> Novo Item</>}
          </Button>
        </div>

        <Tabs defaultValue="manual" onValueChange={setActiveTab} className="w-full">
          <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 mb-8">
            <TabsTrigger value="manual" className="rounded-xl px-8 h-12 font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
              <FileText className="h-4 w-4 mr-2" /> Referências Manuais
            </TabsTrigger>
            <TabsTrigger value="autopilot" className="rounded-xl px-8 h-12 font-bold data-[state=active]:bg-slate-900 data-[state=active]:text-white">
              <Zap className="h-4 w-4 mr-2 text-primary" /> Fontes de Autopiloto
            </TabsTrigger>
          </TabsList>

          {isAdding && (
            <Card className="border-none shadow-2xl bg-white mb-10 overflow-hidden animate-in zoom-in-95 duration-300">
              <CardContent className="p-8">
                {activeTab === "manual" ? (
                  <form onSubmit={(e) => { e.preventDefault(); addRefMutation.mutate(newRef); }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Título Identificador</Label>
                        <Input 
                          placeholder="Ex: Nota oficial sobre o trânsito..." 
                          value={newRef.title}
                          onChange={(e) => setNewRef({...newRef, title: e.target.value})}
                          required
                          className="bg-slate-50 border-none h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">URL da Fonte (Opcional)</Label>
                        <Input 
                          placeholder="https://..." 
                          value={newRef.url}
                          onChange={(e) => setNewRef({...newRef, url: e.target.value})}
                          className="bg-slate-50 border-none h-12"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-black uppercase text-slate-400">Conteúdo para Análise da IA</Label>
                      <Textarea 
                        placeholder="Cole aqui o texto bruto que a IA deve transformar em artigo..." 
                        value={newRef.content}
                        onChange={(e) => setNewRef({...newRef, content: e.target.value})}
                        rows={6}
                        required
                        className="bg-slate-50 border-none font-medium p-4"
                      />
                    </div>
                    <Button type="submit" disabled={addRefMutation.isPending} className="w-full h-12 rounded-xl font-black">
                      {addRefMutation.isPending ? "Processando..." : "Salvar Referência Manual"}
                    </Button>
                  </form>
                ) : (
                  <form onSubmit={(e) => { e.preventDefault(); addSourceMutation.mutate(newSource); }} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Nome do Portal/Fonte</Label>
                        <Input 
                          placeholder="Ex: G1 Região, Blog da Cidade..." 
                          value={newSource.name}
                          onChange={(e) => setNewSource({...newSource, name: e.target.value})}
                          required
                          className="bg-slate-50 border-none h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">URL (RSS ou Link Principal)</Label>
                        <Input 
                          placeholder="https://feeds.feedburner.com/..." 
                          value={newSource.url}
                          onChange={(e) => setNewSource({...newSource, url: e.target.value})}
                          required
                          className="bg-slate-50 border-none h-12"
                        />
                      </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Tipo de Crawling</Label>
                        <Select value={newSource.type} onValueChange={(val) => setNewSource({...newSource, type: val as any})}>
                          <SelectTrigger className="bg-slate-50 border-none h-12">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="RSS">RSS Feed (Recomendado)</SelectItem>
                            <SelectItem value="SCRAPE">Scrape (Leitura de Site)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Publicação Automática</Label>
                        <div className="h-12 flex items-center gap-3 bg-slate-50 px-4 rounded-xl">
                          <Switch 
                            checked={newSource.auto_publish} 
                            onCheckedChange={(val) => setNewSource({...newSource, auto_publish: val})} 
                          />
                          <span className="text-xs font-bold">{newSource.auto_publish ? 'Direto no Site' : 'Salvar no Rascunho'}</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs font-black uppercase text-slate-400">Tom de Voz Específico</Label>
                        <Input 
                          value={newSource.tone_of_voice}
                          onChange={(e) => setNewSource({...newSource, tone_of_voice: e.target.value})}
                          className="bg-slate-50 border-none h-12"
                        />
                      </div>
                    </div>
                    <Button type="submit" disabled={addSourceMutation.isPending} className="w-full h-12 rounded-xl font-black bg-slate-900 border-none">
                      {addSourceMutation.isPending ? "Processando..." : "Ativar Robô para esta Fonte"}
                    </Button>
                  </form>
                )}
              </CardContent>
            </Card>
          )}

          <TabsContent value="manual" className="space-y-4">
             {loadingRefs ? (
              <div className="py-20 text-center"><Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : references.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic text-slate-400">
                Sem referências manuais.
              </div>
            ) : (
              references.map((item: any) => (
                <div key={item.id} className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm hover:shadow-lg transition-all flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-indigo-50 text-indigo-500 flex items-center justify-center">
                      <FileText className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="font-black text-slate-800">{item.title}</h3>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">{new Date(item.created_at).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteRefMutation.mutate(item.id)} className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-red-500 hover:bg-red-50">
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="autopilot" className="space-y-4">
            {loadingSources ? (
              <div className="py-20 text-center"><Sparkles className="h-8 w-8 animate-spin mx-auto text-primary" /></div>
            ) : sources.length === 0 ? (
              <div className="py-20 text-center bg-white rounded-[40px] border-2 border-dashed border-slate-100 italic text-slate-400">
                Nenhum robô configurado ainda.
              </div>
            ) : (
              sources.map((item: any) => (
                <div key={item.id} className="bg-slate-900 p-6 rounded-[32px] border border-slate-800 shadow-xl flex items-center justify-between group text-white">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                      {item.type === 'RSS' ? <Rss className="h-6 w-6" /> : <Globe className="h-6 w-6" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-black text-white">{item.name}</h3>
                        <Badge variant="secondary" className="bg-primary/20 text-primary border-none text-[9px] font-black">{item.type}</Badge>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate max-w-[300px] mt-1">{item.url}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="text-right hidden md:block">
                      <p className="text-[9px] font-black uppercase text-slate-500 mb-1">Última Sincronização</p>
                      <p className="text-xs font-bold text-slate-300 flex items-center justify-end gap-1">
                        <Clock className="h-3 w-3" /> {item.last_fetched_at ? new Date(item.last_fetched_at).toLocaleTimeString() : 'Nunca'}
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteSourceMutation.mutate(item.id)} className="text-slate-600 hover:text-red-400 hover:bg-white/5 h-12 w-12 rounded-full">
                      <Trash2 className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
