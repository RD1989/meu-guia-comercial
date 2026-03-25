import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesUpdate } from "@/integrations/supabase/types";

export type Business = Tables<"businesses">;

export function useBusiness() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const businessQuery = useQuery({
    queryKey: ["my-business", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("businesses")
        .select("*, reviews(count)")
        .eq("owner_id", user!.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const updateBusiness = useMutation({
    mutationFn: async (updates: TablesUpdate<"businesses">) => {
      if (!businessQuery.data) throw new Error("Nenhum negócio encontrado");
      const { data, error } = await supabase
        .from("businesses")
        .update(updates)
        .eq("id", businessQuery.data.id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-business"] });
      toast.success("Dados do negócio salvos com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao salvar: ${err.message}`);
    },
  });

  return {
    business: businessQuery.data,
    isLoading: businessQuery.isLoading,
    error: businessQuery.error,
    updateBusiness,
  };
}
