import { useState } from "react";
import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/use-business";
import { toast } from "sonner";
import { Stamp, Users, Gift, Settings, QrCode, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function DashboardStamps() {
  const { business, updateBusiness } = useBusiness();
  const queryClient = useQueryClient();
  const [stampEnabled, setStampEnabled] = useState(business?.stamp_enabled ?? false);
  const [stampsRequired, setStampsRequired] = useState(String(business?.stamp_required ?? 10));
  const [stampReward, setStampReward] = useState(business?.stamp_reward ?? "Brinde especial");
  const [saving, setSaving] = useState(false);

  const { data: stampCards = [], isLoading } = useQuery({
    queryKey: ["stamp-cards", business?.id],
    enabled: !!business?.id,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("stamp_cards")
        .select("*, profiles:user_id(name, avatar_url)")
        .eq("business_id", business!.id)
        .order("stamps_current", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateBusiness.mutateAsync({
        stamp_enabled: stampEnabled,
        stamp_required: parseInt(stampsRequired) || 10,
        stamp_reward: stampReward,
      } as any);
    } finally {
      setSaving(false);
    }
  };

  const awardStamp = useMutation({
    mutationFn: async (userId: string) => {
      const card = stampCards.find((c: any) => c.user_id === userId);
      if (!card) return;
      const newCount = card.stamps_current + 1;
      const completed = newCount >= parseInt(stampsRequired);
      await (supabase as any)
        .from("stamp_cards")
        .update({
          stamps_current: completed ? 0 : newCount,
          completed_count: completed ? card.completed_count + 1 : card.completed_count,
        })
        .eq("id", card.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stamp-cards"] });
      toast.success("Carimbo adicionado!");
    }
  });

  return (
    <DashboardLayout title="Carimbo Digital">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-[900] text-slate-900 tracking-tighter">Carimbo Digital</h2>
          <p className="text-sm text-slate-500 mt-1">Fidelize clientes com um cartão de fidelidade digital.</p>
        </div>

        {/* Config */}
        <Card className="border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="p-8 pb-0">
            <div className="flex items-center justify-between">
              <CardTitle className="font-black text-slate-900 flex items-center gap-2">
                <Settings className="h-5 w-5 text-primary" />
                Configuração do Carimbo
              </CardTitle>
              <div className="flex items-center gap-2">
                <Switch
                  checked={stampEnabled}
                  onCheckedChange={setStampEnabled}
                />
                <span className="text-xs font-black uppercase tracking-widest text-slate-500">
                  {stampEnabled ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Carimbos para ganhar recompensa</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={stampsRequired}
                  onChange={(e) => setStampsRequired(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
              <div>
                <Label className="text-xs font-black uppercase tracking-widest">Recompensa</Label>
                <Input
                  placeholder="Ex: Café grátis"
                  value={stampReward}
                  onChange={(e) => setStampReward(e.target.value)}
                  className="mt-1 rounded-xl"
                />
              </div>
            </div>

            {/* Preview do Carimbo */}
            <div className="bg-slate-950 rounded-[2rem] p-6 text-center">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Preview do Carimbo</p>
              <div className="flex flex-wrap gap-2 justify-center mb-4">
                {Array.from({ length: Math.min(parseInt(stampsRequired) || 10, 12) }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-8 w-8 rounded-full border-2 flex items-center justify-center transition-all ${
                      i < 3 ? "bg-primary border-primary shadow-lg shadow-primary/30" : "border-white/20 bg-white/5"
                    }`}
                  >
                    {i < 3 && <Stamp className="h-4 w-4 text-white" />}
                  </div>
                ))}
                {parseInt(stampsRequired) > 12 && (
                  <span className="text-white/40 text-xs font-black self-center">+{parseInt(stampsRequired) - 12}</span>
                )}
              </div>
              <p className="text-xs font-bold text-slate-400">
                Ao completar {stampsRequired} carimbos: <span className="text-primary">{stampReward}</span>
              </p>
            </div>

            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full h-12 rounded-2xl bg-primary text-white font-black uppercase text-[10px] tracking-widest"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar Configurações"}
            </Button>
          </CardContent>
        </Card>

        {/* Clientes com Carimbo */}
        <Card className="border-none shadow-xl rounded-[2.5rem]">
          <CardHeader className="p-8 pb-4">
            <CardTitle className="font-black text-slate-900 flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Clientes com Carimbo ({stampCards.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8 pt-0">
            {isLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
            ) : stampCards.length === 0 ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                <Stamp className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Ainda sem clientes</p>
                <p className="text-xs text-slate-300 mt-1">Os clientes começarão a aparecer quando o carimbo for usado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {stampCards.map((card: any) => {
                  const progress = Math.round((card.stamps_current / (parseInt(stampsRequired) || 10)) * 100);
                  return (
                    <div key={card.id} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl">
                      <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary text-sm shrink-0">
                        {card.profiles?.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-black text-slate-900">{card.profiles?.name || "Cliente"}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-primary rounded-full"
                            />
                          </div>
                          <span className="text-[10px] font-black text-slate-400 whitespace-nowrap">
                            {card.stamps_current}/{parseInt(stampsRequired) || 10}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {card.completed_count > 0 && (
                          <Badge className="bg-emerald-100 text-emerald-700 border-0 text-[8px] font-black">
                            <Gift className="h-2.5 w-2.5 mr-0.5" /> {card.completed_count}x
                          </Badge>
                        )}
                        <Button
                          size="sm"
                          onClick={() => awardStamp.mutate(card.user_id)}
                          className="h-8 rounded-xl bg-primary text-white text-[10px] font-black uppercase tracking-widest px-3"
                        >
                          <Stamp className="h-3 w-3 mr-1" /> Carimbar
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
