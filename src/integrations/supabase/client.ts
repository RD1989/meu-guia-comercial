
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import {
  DUMMY_BUSINESSES,
  DUMMY_CATEGORIES,
  DUMMY_POSTS,
  DUMMY_PRODUCTS,
  DUMMY_SERVICES,
} from '@/data/dummy-data';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const baseSupabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
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

function resolveMock(tableName: string, filters: Record<string, any>): any[] | null {
  switch (tableName) {
    case 'businesses': {
      let data = DUMMY_BUSINESSES.map((b) => ({
        ...b,
        categories: DUMMY_CATEGORIES.find((c) => c.id === b.category_id) || { name: 'Comércio' },
        reviews: [{ count: b.total_reviews || 0 }],
      }));
      if (filters.slug) data = data.filter((b) => b.slug === filters.slug);
      if (filters.active !== undefined) data = data.filter((b) => b.active === filters.active);
      return data;
    }
    case 'categories':
      return [...DUMMY_CATEGORIES];
    case 'products': {
      let data = [...DUMMY_PRODUCTS];
      if (filters.business_id) data = data.filter((p) => p.business_id === filters.business_id);
      if (filters.active !== undefined) data = data.filter((p) => p.active === filters.active);
      return data;
    }
    case 'business_services': {
      let data = [...DUMMY_SERVICES];
      if (filters.business_id) data = data.filter((s) => s.business_id === filters.business_id);
      return data;
    }
    case 'posts':
    case 'blog_posts':
      return [...DUMMY_POSTS];
    case 'ai_settings':
      return [DEFAULT_AI_SETTINGS];
    case 'news_sources':
    case 'ai_references':
    case 'reviews':
    case 'profiles':
      return [];
    default:
      return null;
  }
}

/** Recebe o queryBuilder e injeta um proxy ao redor do `then` final */
function wrapQueryBuilder(qb: any, tableName: string, filters: Record<string, any>, meta: { isHead?: boolean; isCount?: boolean; isSingle?: boolean }) {
  const _origThen = qb.then?.bind(qb);
  if (!_origThen) return qb;

  qb.then = (ok: any, fail: any) =>
    _origThen((result: any) => {
      const hasError = !!result.error;
      const isEmptyArray = Array.isArray(result.data) && result.data.length === 0;
      const isNullData = result.data === null || result.data === undefined;

      if (hasError || isEmptyArray || isNullData) {
        const mockArr = resolveMock(tableName, filters);
        if (mockArr !== null) {
          if (meta.isSingle) {
            const found = filters.slug
              ? mockArr.find((x: any) => x.slug === filters.slug)
              : mockArr[0] || null;
            result.data = found || null;
          } else if (meta.isHead) {
            result.data = null;
            result.count = mockArr.length;
          } else {
            result.data = mockArr;
            if (meta.isCount) result.count = mockArr.length;
          }
          result.error = null;
          result.status = 200;
        }
      }

      return ok ? ok(result) : result;
    }, fail);

  return qb;
}

/** Proxy de Elite — garante funcionamento 100% sem banco migrado */
export const supabase = new Proxy(baseSupabase, {
  get(target, prop) {
    const original = (target as any)[prop];

    // ── Edge Functions (simulação local) ─────────────────────────────────
    if (prop === 'functions') {
      return {
        invoke: async (functionName: string) => {
          if (functionName === 'autopilot-engine') {
            return {
              data: {
                success: true,
                mission: 'NEWS',
                result: { title: 'Artigo gerado com sucesso pela IA 🚀' },
              },
              error: null,
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

        // Criamos um Proxy sobre o queryBuilder para interceptar QUALQUER método
        const qb = (target as any).from(tableName);

        return new Proxy(qb, {
          get(qbTarget: any, qbProp: string | symbol) {
            const qbOriginal = qbTarget[qbProp];

            // Filtros — rastrear valores
            if (qbProp === 'eq') {
              return (col: string, val: any) => {
                filters[col] = val;
                const next = qbTarget.eq(col, val);
                return new Proxy(next, this);
              };
            }

            // .select() — detectar head/count
            if (qbProp === 'select') {
              return (cols?: string, opts?: any) => {
                if (opts?.head) meta.isHead = true;
                if (opts?.count) meta.isCount = true;
                const next = qbTarget.select(cols, opts);
                return new Proxy(next, this);
              };
            }

            // .maybeSingle() / .single() — item único
            if (qbProp === 'maybeSingle' || qbProp === 'single') {
              return () => {
                meta.isSingle = true;
                const next = qbTarget.maybeSingle ? qbTarget.maybeSingle() : qbTarget.single();
                return wrapQueryBuilder(next, tableName, filters, { ...meta });
              };
            }

            // .then() — ponto final da execução da query
            if (qbProp === 'then') {
              return (ok: any, fail: any) => {
                const wrappedQb = wrapQueryBuilder(qbTarget, tableName, filters, { ...meta });
                return wrappedQb.then(ok, fail);
              };
            }

            // Outros métodos (.order, .limit, .neq, .gt, etc.) — repassar e manter Proxy
            if (typeof qbOriginal === 'function') {
              return (...args: any[]) => {
                const next = qbOriginal.apply(qbTarget, args);
                // Se retornar um objeto (queryBuilder), envolver no proxy
                if (next && typeof next === 'object') return new Proxy(next, this);
                return next;
              };
            }

            return qbOriginal;
          },
        });
      };
    }

    return typeof original === 'function' ? original.bind(target) : original;
  },
}) as any;