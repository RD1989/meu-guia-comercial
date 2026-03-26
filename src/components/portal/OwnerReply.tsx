import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MessageSquare, Loader2, CheckCircle2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface OwnerReplyProps {
  reviewId: string;
  existingReply?: string | null;
  replyAt?: string | null;
  isOwner: boolean;
}

export function OwnerReply({ reviewId, existingReply, replyAt, isOwner }: OwnerReplyProps) {
  const [editing, setEditing] = useState(false);
  const [reply, setReply] = useState(existingReply || "");
  const queryClient = useQueryClient();

  const saveReply = useMutation({
    mutationFn: async () => {
      const { error } = await (supabase as any)
        .from("reviews")
        .update({ owner_reply: reply, owner_reply_at: new Date().toISOString() })
        .eq("id", reviewId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      queryClient.invalidateQueries({ queryKey: ["business-detail"] });
      toast.success("Resposta publicada com sucesso!");
      setEditing(false);
    },
    onError: (e: any) => toast.error(`Erro: ${e.message}`),
  });

  // Se não é dono e não há resposta, retorna null
  if (!isOwner && !existingReply) return null;

  return (
    <div className="mt-3 ml-4 pl-4 border-l-2 border-primary/20">
      {existingReply && !editing ? (
        <div>
          <div className="flex items-center gap-2 mb-2">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">Resposta do Proprietário</span>
            {replyAt && (
              <span className="text-[9px] text-slate-400 font-medium">
                · {formatDistanceToNow(new Date(replyAt), { addSuffix: true, locale: ptBR })}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{existingReply}</p>
          {isOwner && (
            <button
              onClick={() => setEditing(true)}
              className="mt-2 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
            >
              Editar resposta
            </button>
          )}
        </div>
      ) : isOwner ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">
              {existingReply ? "Editar Resposta" : "Responder como Proprietário"}
            </span>
          </div>
          <Textarea
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder="Escreva uma resposta pública para esta avaliação..."
            className="text-xs rounded-xl min-h-[80px]"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={() => saveReply.mutate()}
              disabled={!reply.trim() || saveReply.isPending}
              className="h-8 rounded-xl bg-primary text-white font-black text-[10px] uppercase tracking-widest px-4"
            >
              {saveReply.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <><CheckCircle2 className="h-3 w-3 mr-1" /> Publicar</>}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { setEditing(false); setReply(existingReply || ""); }}
              className="h-8 rounded-xl text-slate-400 text-[10px] font-black uppercase"
            >
              Cancelar
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
