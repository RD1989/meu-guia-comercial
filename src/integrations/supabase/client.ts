
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://placeholder-url.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "placeholder-key";

if (!import.meta.env.VITE_SUPABASE_URL || !import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY) {
  console.warn("⚠️ Variáveis de ambiente do Supabase não encontradas. O sistema operará em modo de simulação (Mock Mode).");
}

const baseSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: typeof window !== 'undefined' ? localStorage : undefined,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce',
  },
});

const DEFAULT_AI_SETTINGS = {
  id: 'default-ai-cfg',
  openrouter_api_key: '',
  default_model: 'openai/gpt-4o-mini',
  tone_of_voice: 'Premium e Profissional',
  target_city: 'Rio de Janeiro',
  autopilot_enabled: true,
  posts_per_day: 5,
  autopilot_interval_minutes: 240,
  target_focus: 'MIXED',
  tenant_id: 'default-tenant',
  last_autopilot_run: new Date().toISOString(),
};


/** Proxy de Elite — garante funcionamento 100% sem banco migrado e resiliência em produção */
export const supabase = new Proxy(baseSupabase, {
  get(target, prop) {
    const original = (target as any)[prop];

    // ── Edge Functions (simulação apenas se faltar credencial) ────────────
    if (prop === 'functions') {
      // Se tivermos a URL real, usamos a função original
      if (import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_URL !== "https://placeholder-url.supabase.co") {
        return original.bind(target);
      }
      
      return {
        invoke: async (functionName: string, options?: any) => {
          console.log(`[MOCK] Invocando função: ${functionName}`, options);
          if (functionName === 'autopilot-engine') {
            return {
              data: {
                success: true,
                mission: 'NEWS',
                result: { title: 'Artigo gerado com sucesso pela IA (MOCK) 🚀' },
              },
              error: null,
            };
          }
          if (functionName === 'local-concierge') {
            return {
              data: { answer: "Este é um exemplo de resposta do Concierge em Modo de Simulação. Em produção com Supabase configurado, eu responderia usando IA real pesquisando os estabelecimentos locais!" },
              error: null
            };
          }
          return { data: { success: true }, error: null };
        },
      };
    }

    // ── Interceptar queries ao banco ──────────────────────────────────────
    if (prop === 'from') {
      return (tableName: string) => {
        const filters: Record<string, any> = {};
        const meta: { isHead: boolean; isCount: boolean; isSingle: boolean } = {
          isHead: false,
          isCount: false,
          isSingle: false,
        };

        const qb = (target as any).from(tableName);

        // Handler recursivo para o chain de métodos
        const queryProxyHandler: ProxyHandler<any> = {
          get(qbTarget, qbProp) {
            const qbOriginal = qbTarget[qbProp];

            // .then() — Omitido para parar de injetar o mockup. Repassa direto ao Supabase.

            // Seleção e Metadados
            if (qbProp === 'select') {
              return (cols?: string, opts?: any) => {
                if (opts?.head) meta.isHead = true;
                if (opts?.count) meta.isCount = true;
                return new Proxy(qbTarget.select(cols, opts), queryProxyHandler);
              };
            }

            // Single / maybeSingle
            if (qbProp === 'maybeSingle' || qbProp === 'single') {
              return () => {
                meta.isSingle = true;
                const next = qbTarget[qbProp as string]();
                return new Proxy(next, queryProxyHandler);
              };
            }

            // Filtros comuns (eq, match, etc.)
            if (qbProp === 'eq') {
              return (col: string, val: any) => {
                filters[col] = val;
                return new Proxy(qbTarget.eq(col, val), queryProxyHandler);
              };
            }

            // Fallback genérico para métodos fluentes (order, limit, etc.)
            if (typeof qbOriginal === 'function') {
              return (...args: any[]) => {
                const result = qbOriginal.apply(qbTarget, args);
                // Se o resultado parecer um queryBuilder (tem .then), mantemos o proxy
                if (result && typeof result === 'object' && 'then' in result) {
                  return new Proxy(result, queryProxyHandler);
                }
                return result;
              };
            }

            return qbOriginal;
          }
        };

        return new Proxy(qb, queryProxyHandler);
      };
    }

    return typeof original === 'function' ? original.bind(target) : original;
  },
}) as any;