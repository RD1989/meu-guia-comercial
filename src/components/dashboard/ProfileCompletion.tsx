import { motion } from "framer-motion";
import { CheckCircle2, Circle, ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Business {
  name?: string;
  description?: string;
  phone?: string;
  image_url?: string;
  address?: string;
  gallery_urls?: string[];
  opening_hours?: any;
  whatsapp?: string;
  plan_tier?: string;
}

interface CheckItem {
  label: string;
  done: boolean;
  link: string;
  points: number;
}

interface ProfileCompletionProps {
  business: Business;
}

function getChecklist(b: Business): CheckItem[] {
  return [
    {
      label: "Foto de capa do negócio",
      done: !!b.image_url,
      link: "/dashboard/negocio",
      points: 20,
    },
    {
      label: "Descrição completa",
      done: !!b.description && b.description.length > 30,
      link: "/dashboard/negocio",
      points: 15,
    },
    {
      label: "Endereço cadastrado",
      done: !!b.address,
      link: "/dashboard/negocio",
      points: 15,
    },
    {
      label: "WhatsApp configurado",
      done: !!b.whatsapp || !!b.phone,
      link: "/dashboard/negocio",
      points: 20,
    },
    {
      label: "Galeria com fotos",
      done: Array.isArray(b.gallery_urls) && b.gallery_urls.length > 0,
      link: "/dashboard/negocio",
      points: 15,
    },
    {
      label: "Horários de funcionamento",
      done: !!b.opening_hours && Object.keys(b.opening_hours).length > 0,
      link: "/dashboard/negocio",
      points: 15,
    },
  ];
}

export function ProfileCompletion({ business }: ProfileCompletionProps) {
  const checklist = getChecklist(business);
  const totalPoints = checklist.reduce((sum, i) => sum + i.points, 0);
  const earnedPoints = checklist.filter((i) => i.done).reduce((sum, i) => sum + i.points, 0);
  const percent = Math.round((earnedPoints / totalPoints) * 100);
  const doneCount = checklist.filter((i) => i.done).length;

  if (percent === 100) return null; // Não exibe se completo

  const firstPending = checklist.find((i) => !i.done);

  return (
    <Card className="border-none shadow-xl shadow-amber-100/50 rounded-[2.5rem] bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
      <CardHeader className="pb-2 p-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-amber-400/20 flex items-center justify-center">
              <Zap className="h-5 w-5 text-amber-600 fill-amber-500" />
            </div>
            <div>
              <CardTitle className="text-lg font-black text-slate-900 tracking-tight">
                Complete seu Perfil
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {doneCount} de {checklist.length} etapas concluídas
              </p>
            </div>
          </div>
          <span className="text-3xl font-[900] text-amber-600 tracking-tighter">{percent}%</span>
        </div>
      </CardHeader>
      <CardContent className="p-8 pt-0 space-y-5">
        {/* Progress Bar */}
        <div className="h-3 bg-white/70 rounded-full overflow-hidden border border-amber-100">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percent}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-[0_0_10px_rgba(245,158,11,0.5)]"
          />
        </div>

        {/* Checklist */}
        <div className="space-y-2">
          {checklist.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              {item.done ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
              ) : (
                <Circle className="h-5 w-5 text-slate-300 shrink-0" />
              )}
              <span
                className={`text-xs font-bold flex-1 ${
                  item.done ? "text-slate-400 line-through" : "text-slate-700"
                }`}
              >
                {item.label}
              </span>
              <span className="text-[9px] font-black uppercase tracking-widest text-amber-500">
                +{item.points}pts
              </span>
            </div>
          ))}
        </div>

        {/* CTA para o próximo passo */}
        {firstPending && (
          <Link to={firstPending.link}>
            <Button className="w-full h-12 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-black uppercase text-[10px] tracking-widest gap-2 shadow-lg shadow-amber-400/30 transition-all active:scale-95">
              Completar: {firstPending.label}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  );
}
