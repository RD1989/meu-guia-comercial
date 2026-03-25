import React, { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2, Loader2, Clock, DollarSign } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";

const DashboardServices = () => {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [isAdding, setIsAdding] = useState(false);
  const [newService, setNewService] = useState({ name: "", price: "", duration: "30" });

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["my-services", business?.id],
    enabled: !!business,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("business_services")
        .select("*")
        .eq("business_id", business!.id)
        .order("name");
      if (error) throw error;
      return data;
    },
  });

  const createService = useMutation({
    mutationFn: async (service: any) => {
      const { data, error } = await (supabase as any)
        .from("business_services")
        .insert([{ ...service, business_id: business!.id }])
        .select();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      toast.success("Serviço adicionado!");
      setIsAdding(false);
      setNewService({ name: "", price: "", duration: "30" });
    },
  });

  const deleteService = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from("business_services")
        .delete()
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-services"] });
      toast.success("Serviço removido");
    },
  });

  const handleAdd = () => {
    if (!newService.name) return;
    createService.mutate({
      name: newService.name,
      price: parseFloat(newService.price) || 0,
      duration_minutes: parseInt(newService.duration) || 30
    });
  };

  return (
    <DashboardLayout title="Gestão de Serviços">
      <div className="max-w-2xl space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm text-muted-foreground">Cadastre os serviços que podem ser agendados pelos clientes.</p>
          <Button onClick={() => setIsAdding(true)} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Novo Serviço
          </Button>
        </div>

        {isAdding && (
          <Card className="border-primary/20 bg-primary/5 animate-in fade-in slide-in-from-top-2">
            <CardHeader><CardTitle className="text-sm">Novo Serviço</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label className="text-xs">Nome do Serviço</Label>
                  <Input value={newService.name} onChange={(e) => setNewService(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Corte de Cabelo" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Preço (R$)</Label>
                  <Input type="number" value={newService.price} onChange={(e) => setNewService(p => ({ ...p, price: e.target.value }))} placeholder="0.00" className="rounded-xl" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Duração (minutos)</Label>
                  <Input type="number" value={newService.duration} onChange={(e) => setNewService(p => ({ ...p, duration: e.target.value }))} className="rounded-xl" />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} disabled={createService.isPending} className="flex-1 rounded-xl">Salvar</Button>
                <Button variant="ghost" onClick={() => setIsAdding(false)} className="rounded-xl">Cancelar</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex justify-center py-10"><Loader2 className="animate-spin" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {services.map((service: any) => (
              <Card key={service.id} className="p-4 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm">{service.name}</h4>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {service.duration_minutes} min
                    </span>
                    <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <DollarSign className="h-3 w-3" /> R$ {service.price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteService.mutate(service.id)} className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))}
            {services.length === 0 && !isAdding && (
              <Card className="p-12 text-center border-dashed">
                <p className="text-sm text-muted-foreground">Nenhum serviço cadastrado.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default DashboardServices;
