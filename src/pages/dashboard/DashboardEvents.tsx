import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";
import { Plus, Calendar, Trash2, MapPin, Ticket, Users, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function DashboardEvents() {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    cover_image_url: "",
    event_date: "",
    event_end_date: "",
    location: "",
    is_free: true,
    price: "",
    max_attendees: "",
  });

  const { data: events = [], isLoading } = useQuery({
    queryKey: ["local-events", business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("local_events")
        .select("*")
        .eq("business_id", business!.id)
        .order("event_date", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const createEvent = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("local_events").insert({
        business_id: business!.id,
        title: form.title,
        description: form.description || null,
        cover_image_url: form.cover_image_url || null,
        event_date: new Date(form.event_date).toISOString(),
        event_end_date: form.event_end_date ? new Date(form.event_end_date).toISOString() : null,
        location: form.location || null,
        is_free: form.is_free,
        price: !form.is_free && form.price ? parseFloat(form.price) : null,
        max_attendees: form.max_attendees ? parseInt(form.max_attendees) : null,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-events"] });
      toast.success("Evento criado com sucesso!");
      setOpen(false);
      setForm({ title: "", description: "", cover_image_url: "", event_date: "", event_end_date: "", location: "", is_free: true, price: "", max_attendees: "" });
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  const deleteEvent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("local_events").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["local-events"] });
      toast.success("Evento removido.");
    },
  });

  const isPast = (dateStr: string) => new Date(dateStr) < new Date();

  return (
    <DashboardLayout title="Eventos Locais">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[900] text-slate-900 tracking-tighter">Eventos Locais</h2>
            <p className="text-sm text-slate-500 mt-1">Publique shows, promoções e inaugurações para sua comunidade.</p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/30"
          >
            <Plus className="h-4 w-4" /> Novo Evento
          </Button>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : events.length === 0 ? (
            <Card className="border-2 border-dashed border-slate-100 rounded-[2rem]">
              <CardContent className="p-16 text-center">
                <Calendar className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum evento cadastrado</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {events.map((event: any) => {
                const past = isPast(event.event_date);
                return (
                  <motion.div key={event.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <Card className={`border rounded-[2rem] overflow-hidden ${past ? "opacity-60" : "border-slate-100"}`}>
                      <div className="flex flex-col sm:flex-row">
                        {event.cover_image_url && (
                          <img src={event.cover_image_url} alt={event.title} className="w-full sm:w-40 h-40 object-cover" />
                        )}
                        <CardContent className="p-6 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <Badge className={`border-0 text-[8px] font-black ${past ? "bg-slate-100 text-slate-500" : "bg-purple-100 text-purple-700"}`}>
                                  {past ? "Encerrado" : "Próximo"}
                                </Badge>
                                {event.is_free ? (
                                  <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[8px] font-black">Grátis</Badge>
                                ) : (
                                  <Badge className="bg-amber-100 text-amber-700 border-0 text-[8px] font-black">R$ {event.price}</Badge>
                                )}
                              </div>
                              <h3 className="font-black text-slate-900 text-base">{event.title}</h3>
                              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400 font-medium">
                                <Calendar className="h-3.5 w-3.5" />
                                {format(new Date(event.event_date), "EEEE, dd 'de' MMMM • HH:mm", { locale: ptBR })}
                              </div>
                              {event.location && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-medium">
                                  <MapPin className="h-3.5 w-3.5" />
                                  {event.location}
                                </div>
                              )}
                              {event.max_attendees && (
                                <div className="flex items-center gap-1 mt-1 text-xs text-slate-400 font-medium">
                                  <Users className="h-3.5 w-3.5" />
                                  {event.current_attendees || 0} / {event.max_attendees} participantes
                                </div>
                              )}
                            </div>
                            <Button
                              size="icon" variant="ghost"
                              onClick={() => deleteEvent.mutate(event.id)}
                              className="h-8 w-8 text-slate-200 hover:text-red-500 rounded-xl shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900">Criar Evento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Título *</Label>
              <Input placeholder="Nome do evento" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="mt-1 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Início *</Label>
                <Input type="datetime-local" value={form.event_date} onChange={(e) => setForm({ ...form, event_date: e.target.value })} className="mt-1 rounded-xl" />
              </div>
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Término</Label>
                <Input type="datetime-local" value={form.event_end_date} onChange={(e) => setForm({ ...form, event_end_date: e.target.value })} className="mt-1 rounded-xl" />
              </div>
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Local</Label>
              <Input placeholder="Endereço do evento" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="mt-1 rounded-xl" />
            </div>
            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
              <Switch checked={form.is_free} onCheckedChange={(v) => setForm({ ...form, is_free: v })} />
              <Label className="text-sm font-bold text-slate-700">Evento Gratuito</Label>
            </div>
            {!form.is_free && (
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Preço (R$)</Label>
                <Input type="number" placeholder="0,00" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className="mt-1 rounded-xl" />
              </div>
            )}
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Vagas máximas</Label>
              <Input type="number" placeholder="Ilimitado" value={form.max_attendees} onChange={(e) => setForm({ ...form, max_attendees: e.target.value })} className="mt-1 rounded-xl" />
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Descrição</Label>
              <Textarea placeholder="Detalhes sobre o evento..." value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="mt-1 rounded-xl" rows={3} />
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">URL da imagem de capa</Label>
              <Input placeholder="https://..." value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} className="mt-1 rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button onClick={() => createEvent.mutate()} disabled={!form.title || !form.event_date || createEvent.isPending} className="rounded-xl bg-primary text-white font-black">
              {createEvent.isPending ? "Criando..." : "Criar Evento"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
