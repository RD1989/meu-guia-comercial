import { useBusiness } from "./use-business";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type PlanTier = "FREE" | "BASIC" | "PRO" | "MAX";

export interface PlanLimits {
  tier: PlanTier;
  maxPhotos: number;
  maxVideos: number;
  maxProducts: number;
  hasIA: boolean;
  hasMenu: boolean;
  hasBooking: boolean;
  priority: "Padrão" | "Alta" | "Máxima";
}

const PLAN_CONFIGS: Record<PlanTier, PlanLimits> = {
  FREE: {
    tier: "FREE",
    maxPhotos: 1,
    maxVideos: 0,
    maxProducts: 3,
    hasIA: false,
    hasMenu: false,
    hasBooking: false,
    priority: "Padrão",
  },
  BASIC: {
    tier: "BASIC",
    maxPhotos: 20,
    maxVideos: 1,
    maxProducts: 50,
    hasIA: true,
    hasMenu: true,
    hasBooking: false,
    priority: "Alta",
  },
  PRO: {
    tier: "PRO",
    maxPhotos: 50,
    maxVideos: 5,
    maxProducts: 200,
    hasIA: true,
    hasMenu: true,
    hasBooking: true,
    priority: "Alta",
  },
  MAX: {
    tier: "MAX",
    maxPhotos: 1000,
    maxVideos: 1000,
    maxProducts: 1000,
    hasIA: true,
    hasMenu: true,
    hasBooking: true,
    priority: "Máxima",
  },
};

export function usePlanLimits() {
  const { business } = useBusiness();

  const tenantQuery = useQuery({
    queryKey: ["tenant-plan", business?.tenant_id],
    enabled: !!business?.tenant_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("plan_tier, plan_status")
        .eq("id", business!.tenant_id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const tier = (tenantQuery.data?.plan_tier as PlanTier) || "FREE";
  const limits = PLAN_CONFIGS[tier];

  return {
    limits,
    isLoading: tenantQuery.isLoading,
    isPlanActive: tenantQuery.data?.plan_status === "ACTIVE",
  };
}
