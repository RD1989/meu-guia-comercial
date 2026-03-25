import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";
import { useBusiness } from "./use-business";

export type Product = Tables<"products">;

export function useProducts() {
  const { user } = useAuth();
  const { business } = useBusiness();
  const queryClient = useQueryClient();

  const productsQuery = useQuery({
    queryKey: ["my-products", business?.id],
    enabled: !!business,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const addProduct = useMutation({
    mutationFn: async (product: { name: string; description: string; price: number; image_url?: string | null }) => {
      if (!business) throw new Error("Nenhum negócio encontrado");
      const { data, error } = await supabase
        .from("products")
        .insert({
          name: product.name,
          description: product.description,
          price: product.price,
          image_url: product.image_url ?? null,
          business_id: business.id,
          tenant_id: business.tenant_id,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast.success("Produto adicionado!");
    },
    onError: (err: Error) => toast.error(`Erro: ${err.message}`),
  });

  const updateProduct = useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"products"> & { id: string }) => {
      const { data, error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast.success("Produto atualizado!");
    },
    onError: (err: Error) => toast.error(`Erro: ${err.message}`),
  });

  const deleteProduct = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("products").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-products"] });
      toast.success("Produto removido!");
    },
    onError: (err: Error) => toast.error(`Erro: ${err.message}`),
  });

  return {
    products: productsQuery.data ?? [],
    isLoading: productsQuery.isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
