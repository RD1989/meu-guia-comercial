import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, Save, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

interface DaySchedule {
  open: string;
  close: string;
  closed: boolean;
}

interface BusinessHours {
  mon: DaySchedule;
  tue: DaySchedule;
  wed: DaySchedule;
  thu: DaySchedule;
  fri: DaySchedule;
  sat: DaySchedule;
  sun: DaySchedule;
}

const DEFAULT_HOURS: BusinessHours = {
  mon: { open: "08:00", close: "18:00", closed: false },
  tue: { open: "08:00", close: "18:00", closed: false },
  wed: { open: "08:00", close: "18:00", closed: false },
  thu: { open: "08:00", close: "18:00", closed: false },
  fri: { open: "08:00", close: "18:00", closed: false },
  sat: { open: "08:00", close: "18:00", closed: false },
  sun: { open: "08:00", close: "18:00", closed: true },
};

const DAY_LABELS: Record<keyof BusinessHours, string> = {
  mon: "Segunda",
  tue: "Terça",
  wed: "Quarta",
  thu: "Quinta",
  fri: "Sexta",
  sat: "Sábado",
  sun: "Domingo",
};

interface Props {
  initialHours?: any;
  onSave: (hours: BusinessHours) => Promise<void>;
  isSaving?: boolean;
}

export const BusinessScheduleConfig: React.FC<Props> = ({ initialHours, onSave, isSaving }) => {
  const [hours, setHours] = useState<BusinessHours>(DEFAULT_HOURS);

  useEffect(() => {
    if (initialHours && typeof initialHours === 'object') {
      setHours({ ...DEFAULT_HOURS, ...initialHours });
    }
  }, [initialHours]);

  const handleToggle = (day: keyof BusinessHours) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], closed: !prev[day].closed }
    }));
  };

  const handleTimeChange = (day: keyof BusinessHours, type: 'open' | 'close', value: string) => {
    setHours(prev => ({
      ...prev,
      [day]: { ...prev[day], [type]: value }
    }));
  };

  const handleSave = async () => {
    try {
      await onSave(hours);
      toast.success("Horários salvos com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar horários.");
    }
  };

  return (
    <Card className="border-0 shadow-xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
      <CardHeader className="bg-slate-50 border-b border-slate-100 p-8">
        <CardTitle className="text-xl font-black flex items-center gap-3">
          <div className="h-10 w-10 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
            <Calendar className="h-5 w-5" />
          </div>
          Horários de Funcionamento
        </CardTitle>
        <p className="text-xs text-muted-foreground font-medium mt-1">Configure os dias e horários em que seu estabelecimento está aberto para agendamentos e visitas.</p>
      </CardHeader>
      <CardContent className="p-8 space-y-6">
        <div className="space-y-4">
          {(Object.keys(DAY_LABELS) as Array<keyof BusinessHours>).map((day) => (
            <div key={day} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-primary/20 transition-all gap-4">
              <div className="flex items-center gap-4 min-w-[140px]">
                <Switch 
                  checked={!hours[day].closed} 
                  onCheckedChange={() => handleToggle(day)}
                  className="data-[state=checked]:bg-emerald-500"
                />
                <Label className="text-sm font-black uppercase tracking-widest text-slate-700">
                  {DAY_LABELS[day]}
                </Label>
              </div>

              {!hours[day].closed ? (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="time" 
                      value={hours[day].open}
                      onChange={(e) => handleTimeChange(day, 'open', e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-20"
                    />
                  </div>
                  <span className="text-xs font-black text-slate-300">ATÉ</span>
                  <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-slate-200">
                    <Clock className="h-3.5 w-3.5 text-slate-400" />
                    <input 
                      type="time" 
                      value={hours[day].close}
                      onChange={(e) => handleTimeChange(day, 'close', e.target.value)}
                      className="bg-transparent border-none focus:ring-0 text-sm font-bold text-slate-700 w-20"
                    />
                  </div>
                </div>
              ) : (
                <div className="text-[10px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 px-4 py-2 rounded-full border border-rose-100 italic">
                  Fechado / Folga
                </div>
              )}
            </div>
          ))}
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving} 
          className="w-full h-14 rounded-2xl font-black text-lg gap-2 shadow-xl shadow-primary/20 mt-4"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          SALVAR CONFIGURAÇÃO
        </Button>
      </CardContent>
    </Card>
  );
};
