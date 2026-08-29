import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export function useFavorites(businessId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. Buscar todos os favoritos do usuário
  const { data: favorites = [], isLoading } = useQuery({
    queryKey: ["user-favorites", user?.id],
    enabled: !!user?.id,
    queryFn: async () => {
      try {
        const { data, error } = await (supabase as any)
          .from("favorites")
          .select("*, businesses(*, categories(name))")
          .eq("user_id", user!.id)
          .order("created_at", { ascending: false });

        if (error) {
          // Fallback para localStorage caso a tabela ainda não tenha sido aplicada
          const local = localStorage.getItem(`favs_${user?.id}`);
          return local ? JSON.parse(local) : [];
        }
        return data || [];
      } catch {
        return [];
      }
    },
  });

  const isFavorited = businessId 
    ? favorites.some((f: any) => f.business_id === businessId || f.id === businessId)
    : false;

  // 2. Mutação para Alternar Favorito
  const toggleFavorite = useMutation({
    mutationFn: async (targetBusinessId: string) => {
      if (!user) {
        throw new Error("Faça login para salvar favoritos.");
      }

      if (isFavorited) {
        // Remover
        const { error } = await (supabase as any)
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("business_id", targetBusinessId);

        if (error) {
          // fallback local
          const local = (favorites || []).filter((f: any) => f.business_id !== targetBusinessId);
          localStorage.setItem(`favs_${user.id}`, JSON.stringify(local));
        }
        return { action: "removed" };
      } else {
        // Adicionar
        const { error } = await (supabase as any)
          .from("favorites")
          .insert([{ user_id: user.id, business_id: targetBusinessId }]);

        if (error) {
          // fallback local
          const local = [...favorites, { user_id: user.id, business_id: targetBusinessId }];
          localStorage.setItem(`favs_${user.id}`, JSON.stringify(local));
        }
        return { action: "added" };
      }
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ["user-favorites"] });
      if (res.action === "added") {
        toast.success("Adicionado aos seus favoritos!");
      } else {
        toast.info("Removido dos favoritos.");
      }
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao atualizar favoritos.");
    }
  });

  return {
    favorites,
    isFavorited,
    isLoading,
    toggleFavorite: (id?: string) => toggleFavorite.mutate(id || businessId!)
  };
}
