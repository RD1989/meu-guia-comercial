import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2, MessageSquare } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { usePlatform } from "@/contexts/PlatformContext";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

interface AddReviewModalProps {
  businessId: string;
  businessName: string;
  tenantId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const AddReviewModal: React.FC<AddReviewModalProps> = ({ 
  businessId, 
  businessName, 
  tenantId,
  isOpen, 
  onClose 
}) => {
  const { user } = useAuth();
  const { config } = usePlatform();
  const [rating, setRating] = useState(5);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const queryClient = useQueryClient();

  const handleSubmit = async () => {
    if (!user) {
      toast.error("Você precisa estar logado para avaliar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("reviews")
        .insert({
          business_id: businessId,
          user_id: user.id,
          rating,
          comment: comment.trim() || null,
          tenant_id: tenantId
        });

      if (error) throw error;

      toast.success("Avaliação enviada com sucesso! Obrigado por seu feedback.");
      queryClient.invalidateQueries({ queryKey: ["business-reviews", businessId] });
      queryClient.invalidateQueries({ queryKey: ["business", businessId] });
      onClose();
      setComment("");
      setRating(5);
    } catch (error: any) {
      toast.error(`Erro ao enviar avaliação: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md rounded-[2rem] border-0 shadow-2xl overflow-hidden">
        <DialogHeader className="space-y-3">
          <div className="h-12 w-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-2">
            <Star className="h-6 w-6 fill-primary" />
          </div>
          <DialogTitle className="text-2xl font-black tracking-tight">Avaliar {businessName}</DialogTitle>
          <DialogDescription className="text-sm text-slate-500 font-medium">
            Sua opinião ajuda outros usuários e melhora a qualidade do guia.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-8">
          {/* Star Selection */}
          <div className="flex flex-col items-center gap-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Sua Nota</p>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  onClick={() => setRating(star)}
                  className="transition-transform active:scale-90 focus:outline-none"
                >
                  <Star 
                    className={`h-10 w-10 transition-colors ${
                      (hoveredRating || rating) >= star 
                        ? "fill-amber-400 text-amber-400" 
                        : "text-slate-200 fill-slate-50"
                    }`} 
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
               <MessageSquare className="h-4 w-4 text-slate-400" />
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu Comentário (Opcional)</p>
            </div>
            <Textarea 
              placeholder="Conte como foi sua experiência neste estabelecimento..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="min-h-[120px] rounded-2xl border-slate-100 bg-slate-50/50 focus-visible:ring-primary/20 p-4"
            />
          </div>
        </div>

        <div className="flex flex-col gap-3 pb-2">
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting} 
            className="h-14 rounded-2xl font-black text-lg shadow-xl shadow-primary/20 gap-2"
          >
            {isSubmitting ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              "PUBLICAR AVALIAÇÃO"
            )}
          </Button>
          <Button 
            variant="ghost" 
            onClick={onClose} 
            className="h-10 text-slate-400 font-bold hover:bg-transparent hover:text-slate-600 transition-colors"
          >
            CANCELAR
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
