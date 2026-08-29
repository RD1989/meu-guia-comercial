import { useState } from "react";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Check, Sparkles, Building2, Megaphone, Loader2, Edit3, Plus, Shield } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SubscriptionPlan {
  id: string;
  name: string;
  slug: string;
  tier: "FREE" | "PRO" | "MAX";
  description: string;
  monthly_price: number;
  annual_price: number;
  features: string[];
  max_photos: number;
  max_products: number;
  has_ai: boolean;
  has_menu: boolean;
  has_booking: boolean;
  is_featured: boolean;
  is_active: boolean;
  sort_order: number;
}

export default function AdminPlanos() {
  const queryClient = useQueryClient();
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [featuresText, setFeaturesText] = useState("");

  const { data: plans = [], isLoading } = useQuery({
    queryKey: ["admin-subscription-plans"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("subscription_plans")
        .select("*")
        .order("sort_order", { ascending: true });

      if (error) throw error;
      return (data || []) as SubscriptionPlan[];
    }
  });

  const saveMutation = useMutation({
    mutationFn: async (planData: Partial<SubscriptionPlan>) => {
      const featuresArray = featuresText
        .split("\n")
        .map(f => f.trim())
        .filter(f => f.length > 0);

      const payload = {
        ...planData,
        features: featuresArray,
        updated_at: new Date().toISOString()
      };

      if (planData.id) {
        const { error } = await (supabase as any)
          .from("subscription_plans")
          .update(payload)
          .eq("id", planData.id);
        if (error) throw error;
      } else {
        const { error } = await (supabase as any)
          .from("subscription_plans")
          .insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-subscription-plans"] });
      queryClient.invalidateQueries({ queryKey: ["subscription-plans"] });
      toast.success("Plano salvo com sucesso no banco de dados!");
      setIsDialogOpen(false);
      setEditingPlan(null);
    },
    onError: (err: any) => {
      toast.error("Erro ao salvar plano: " + err.message);
    }
  });

  const handleOpenEdit = (plan: SubscriptionPlan) => {
    setEditingPlan({ ...plan });
    setFeaturesText(plan.features ? plan.features.join("\n") : "");
    setIsDialogOpen(true);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case "MAX": return Megaphone;
      case "PRO": return Sparkles;
      default: return Building2;
    }
  };

  return (
    <AdminLayout>
      <div className="p-8 space-y-8 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-[900] text-slate-900 tracking-tight">Planos e Assinaturas</h1>
            <p className="text-slate-500 font-medium">Gerencie pacotes, limites de recursos e preços cobrados dos lojistas.</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : plans.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-slate-200">
            <Shield className="h-10 w-10 text-slate-300 mx-auto mb-3" />
            <h3 className="font-bold text-slate-700">Nenhum plano configurado</h3>
            <p className="text-sm text-slate-400 max-w-sm mx-auto mt-1 mb-4">Execute as migrações mais recentes no Supabase para carregar os planos padrão.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans.map((plan) => {
              const Icon = getTierIcon(plan.tier);
              const isPro = plan.tier === "PRO";
              const isMax = plan.tier === "MAX";

              return (
                <Card 
                  key={plan.id} 
                  className={`relative rounded-3xl border transition-all duration-300 ${
                    plan.is_featured 
                      ? 'border-primary ring-2 ring-primary/20 shadow-xl' 
                      : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {plan.is_featured && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Mais Popular
                    </div>
                  )}

                  <CardHeader className="p-6">
                    <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-4 ${
                      isMax ? 'bg-indigo-50 text-indigo-600' : isPro ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'
                    }`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <CardTitle className="text-xl font-bold text-slate-900">{plan.name}</CardTitle>
                    <CardDescription className="text-xs text-slate-500 font-medium">{plan.description}</CardDescription>
                  </CardHeader>

                  <CardContent className="p-6 pt-0 space-y-6">
                    <div className="p-4 bg-slate-50 rounded-2xl">
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-[900] text-slate-900">R$ {Number(plan.monthly_price).toFixed(2)}</span>
                        <span className="text-xs font-bold text-slate-500">/mês</span>
                      </div>
                      <div className="text-[11px] font-bold text-slate-400 mt-1">
                        Anual: R$ {Number(plan.annual_price).toFixed(2)}/mês
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Recursos Inclusos:</p>
                      <ul className="space-y-2.5">
                        {plan.features.map((feature, i) => (
                          <li key={i} className="flex items-start gap-2 text-xs font-semibold text-slate-600 leading-snug">
                            <Check className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center gap-2">
                      <Button 
                        onClick={() => handleOpenEdit(plan)}
                        className="w-full rounded-xl font-bold gap-2 text-xs h-11"
                        variant={plan.is_featured ? "default" : "outline"}
                      >
                        <Edit3 className="h-3.5 w-3.5" /> Editar Configurações
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Plan Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px] rounded-3xl p-8 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-xl font-black text-slate-900">
              Editar Plano: {editingPlan?.name}
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 font-medium">
              Altere os preços, recursos e limites que serão aplicados aos lojistas no portal.
            </DialogDescription>
          </DialogHeader>

          {editingPlan && (
            <div className="space-y-5 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase text-slate-600">Nome do Plano</Label>
                  <Input 
                    value={editingPlan.name} 
                    onChange={(e) => setEditingPlan({ ...editingPlan, name: e.target.value })}
                    className="mt-1 font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-slate-600">Slug Identificador</Label>
                  <Input 
                    value={editingPlan.slug} 
                    disabled
                    className="mt-1 bg-slate-50 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase text-slate-600">Descrição Curta</Label>
                <Input 
                  value={editingPlan.description || ""} 
                  onChange={(e) => setEditingPlan({ ...editingPlan, description: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase text-slate-600">Preço Mensal (R$)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingPlan.monthly_price} 
                    onChange={(e) => setEditingPlan({ ...editingPlan, monthly_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 font-bold text-primary"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-slate-600">Preço no Plano Anual (R$/mês)</Label>
                  <Input 
                    type="number"
                    step="0.01"
                    value={editingPlan.annual_price} 
                    onChange={(e) => setEditingPlan({ ...editingPlan, annual_price: parseFloat(e.target.value) || 0 })}
                    className="mt-1 font-bold text-emerald-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-bold uppercase text-slate-600">Máximo de Fotos</Label>
                  <Input 
                    type="number"
                    value={editingPlan.max_photos} 
                    onChange={(e) => setEditingPlan({ ...editingPlan, max_photos: parseInt(e.target.value) || 0 })}
                    className="mt-1 font-bold"
                  />
                </div>
                <div>
                  <Label className="text-xs font-bold uppercase text-slate-600">Máximo de Produtos</Label>
                  <Input 
                    type="number"
                    value={editingPlan.max_products} 
                    onChange={(e) => setEditingPlan({ ...editingPlan, max_products: parseInt(e.target.value) || 0 })}
                    className="mt-1 font-bold"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <Label className="text-xs font-bold text-slate-700">Módulo de Cardápio Digital / Catálogo</Label>
                  <Switch 
                    checked={editingPlan.has_menu} 
                    onCheckedChange={(val) => setEditingPlan({ ...editingPlan, has_menu: val })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <Label className="text-xs font-bold text-slate-700">Módulo de Agendamento Online</Label>
                  <Switch 
                    checked={editingPlan.has_booking} 
                    onCheckedChange={(val) => setEditingPlan({ ...editingPlan, has_booking: val })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <Label className="text-xs font-bold text-slate-700">Acesso a Ferramentas de IA (Recrutador / Criador)</Label>
                  <Switch 
                    checked={editingPlan.has_ai} 
                    onCheckedChange={(val) => setEditingPlan({ ...editingPlan, has_ai: val })}
                  />
                </div>
                <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                  <Label className="text-xs font-bold text-slate-700">Destacar como "Mais Popular"</Label>
                  <Switch 
                    checked={editingPlan.is_featured} 
                    onCheckedChange={(val) => setEditingPlan({ ...editingPlan, is_featured: val })}
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs font-bold uppercase text-slate-600">Lista de Recursos (1 por linha)</Label>
                <Textarea 
                  rows={5}
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  placeholder="Perfil Básico&#10;1 Foto na Galeria&#10;WhatsApp no Perfil"
                  className="mt-1 text-xs font-medium"
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="rounded-xl">
              Cancelar
            </Button>
            <Button 
              onClick={() => editingPlan && saveMutation.mutate(editingPlan)}
              disabled={saveMutation.isPending}
              className="bg-primary hover:bg-primary/90 text-white rounded-xl font-bold"
            >
              {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
