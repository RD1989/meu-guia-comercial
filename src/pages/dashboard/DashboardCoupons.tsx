import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";
import { Plus, Ticket, Trash2, Edit, Tag, Clock, Percent, Gift } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const DISCOUNT_ICONS: Record<string, any> = {
  percent: Percent,
  fixed: Tag,
  freebie: Gift,
};

const DISCOUNT_LABELS: Record<string, string> = {
  percent: "Desconto %",
  fixed: "Valor Fixo (R$)",
  freebie: "Brinde / Grátis",
};

export default function DashboardCoupons() {
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    discount_type: "percent",
    discount_value: "",
    code: "",
    valid_until: "",
    max_uses: "",
  });

  const { data: coupons = [], isLoading } = useQuery({
    queryKey: ["coupons", business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("coupons")
        .select("*")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const createCoupon = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any).from("coupons").insert({
        business_id: business!.id,
        title: form.title,
        description: form.description || null,
        discount_type: form.discount_type,
        discount_value: form.discount_value ? parseFloat(form.discount_value) : null,
        code: form.code || null,
        valid_until: form.valid_until ? new Date(form.valid_until).toISOString() : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        active: true,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Cupom criado com sucesso!");
      setOpen(false);
      setForm({ title: "", description: "", discount_type: "percent", discount_value: "", code: "", valid_until: "", max_uses: "" });
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  const toggleCoupon = useMutation({
    mutationFn: async ({ id, active }: { id: string; active: boolean }) => {
      const { error } = await (supabase as any).from("coupons").update({ active }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["coupons"] }),
  });

  const deleteCoupon = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any).from("coupons").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coupons"] });
      toast.success("Cupom removido.");
    },
  });

  const isExpired = (valid_until: string | null) => valid_until && new Date(valid_until) < new Date();

  return (
    <DashboardLayout title="Cupons & Promoções">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[900] text-slate-900 tracking-tighter">Cupons & Promoções</h2>
            <p className="text-sm text-slate-500 mt-1">Crie ofertas exclusivas para atrair e fidelizar clientes.</p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-primary/30"
          >
            <Plus className="h-4 w-4" /> Novo Cupom
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "Cupons Ativos", value: coupons.filter((c: any) => c.active && !isExpired(c.valid_until)).length, color: "emerald" },
            { label: "Total de Usos", value: coupons.reduce((a: number, c: any) => a + (c.current_uses || 0), 0), color: "primary" },
            { label: "Cupons Expirados", value: coupons.filter((c: any) => isExpired(c.valid_until)).length, color: "slate" },
          ].map((s, i) => (
            <Card key={i} className="border-none shadow-lg rounded-[2rem]">
              <CardContent className="p-6">
                <p className="text-xs font-black uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className="text-3xl font-[900] text-slate-900 tracking-tighter mt-1">{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Coupons List */}
        <div className="space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
              </div>
            ) : coupons.length === 0 ? (
              <Card className="border-2 border-dashed border-slate-100 rounded-[2rem]">
                <CardContent className="p-16 text-center">
                  <Ticket className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Nenhum cupom criado ainda</p>
                  <p className="text-xs text-slate-300 mt-2">Crie seu primeiro cupom para atrair clientes!</p>
                </CardContent>
              </Card>
            ) : (
              coupons.map((coupon: any) => {
                const Icon = DISCOUNT_ICONS[coupon.discount_type] || Ticket;
                const expired = isExpired(coupon.valid_until);
                return (
                  <motion.div
                    key={coupon.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <Card className={`border rounded-[2rem] overflow-hidden transition-all ${expired ? "opacity-60" : "border-slate-100"}`}>
                      <CardContent className="p-6 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-black text-slate-900 text-sm">{coupon.title}</p>
                            {expired && <Badge className="bg-red-100 text-red-600 border-0 text-[8px] font-black">Expirado</Badge>}
                            {coupon.code && (
                              <Badge className="bg-slate-100 text-slate-600 border-0 text-[8px] font-black font-mono">
                                {coupon.code}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">
                            {coupon.discount_type === "percent" && coupon.discount_value && `${coupon.discount_value}% de desconto`}
                            {coupon.discount_type === "fixed" && coupon.discount_value && `R$ ${coupon.discount_value} de desconto`}
                            {coupon.discount_type === "freebie" && "Brinde/Grátis"}
                            {coupon.valid_until && ` · Válido até ${format(new Date(coupon.valid_until), "dd/MM/yyyy", { locale: ptBR })}`}
                            {coupon.max_uses && ` · ${coupon.current_uses}/${coupon.max_uses} usos`}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center gap-2">
                            <Switch
                              checked={coupon.active}
                              onCheckedChange={(v) => toggleCoupon.mutate({ id: coupon.id, active: v })}
                              disabled={!!expired}
                            />
                            <span className="text-[10px] font-black text-slate-400 uppercase">{coupon.active ? "Ativo" : "Off"}</span>
                          </div>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => deleteCoupon.mutate(coupon.id)}
                            className="h-8 w-8 text-slate-300 hover:text-red-500 rounded-xl"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modal Criar Cupom */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="rounded-[2rem] max-w-md">
          <DialogHeader>
            <DialogTitle className="font-black text-slate-900">Criar Novo Cupom</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Título *</Label>
              <Input
                placeholder="Ex: 10% na primeira compra"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Tipo de Desconto</Label>
              <Select value={form.discount_type} onValueChange={(v) => setForm({ ...form, discount_type: v })}>
                <SelectTrigger className="mt-1 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">Porcentagem (%)</SelectItem>
                  <SelectItem value="fixed">Valor Fixo (R$)</SelectItem>
                  <SelectItem value="freebie">Brinde / Grátis</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {form.discount_type !== "freebie" && (
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">
                  {form.discount_type === "percent" ? "Percentual (%)" : "Valor (R$)"}
                </Label>
                <Input
                  type="number"
                  placeholder={form.discount_type === "percent" ? "10" : "20"}
                  value={form.discount_value}
                  onChange={(e) => setForm({ ...form, discount_value: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
            )}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Código (opcional)</Label>
                <Input
                  placeholder="PROMO10"
                  value={form.code}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                  className="mt-1 rounded-xl font-mono"
                />
              </div>
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Usos máximos</Label>
                <Input
                  type="number"
                  placeholder="Sem limite"
                  value={form.max_uses}
                  onChange={(e) => setForm({ ...form, max_uses: e.target.value })}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Válido até</Label>
              <Input
                type="datetime-local"
                value={form.valid_until}
                onChange={(e) => setForm({ ...form, valid_until: e.target.value })}
                className="mt-1 rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs font-black uppercase tracking-widest">Descrição</Label>
              <Textarea
                placeholder="Descreva os detalhes da promoção..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="mt-1 rounded-xl"
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} className="rounded-xl">Cancelar</Button>
            <Button
              onClick={() => createCoupon.mutate()}
              disabled={!form.title || createCoupon.isPending}
              className="rounded-xl bg-primary text-white font-black"
            >
              {createCoupon.isPending ? "Criando..." : "Criar Cupom"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
