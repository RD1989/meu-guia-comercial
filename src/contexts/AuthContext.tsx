import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

type AppRole = "SUPERADMIN" | "ADMIN" | "LOJISTA" | "USER";
type AccountType = "consumidor" | "lojista";

// Prioridade correta: SUPERADMIN > ADMIN > LOJISTA > USER
const ROLE_PRIORITY: Record<string, number> = {
  SUPERADMIN: 4,
  ADMIN: 3,
  LOJISTA: 2,
  USER: 1,
};

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  userRole: AppRole | null;
  isSuperAdmin: boolean;
  isAdmin: boolean;
  isLojista: boolean;
  isConsumer: boolean;
  signUp: (email: string, password: string, name: string, accountType?: AccountType) => Promise<{ error: Error | null }>;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<AppRole | null>(null);

  const fetchUserRole = async (userId: string): Promise<AppRole> => {
    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId);

    if (data && data.length > 0) {
      // Seleciona a role de maior prioridade
      const sorted = data.sort(
        (a, b) => (ROLE_PRIORITY[b.role] ?? 0) - (ROLE_PRIORITY[a.role] ?? 0)
      );
      const highestRole = sorted[0].role as AppRole;
      setUserRole(highestRole);
      return highestRole;
    }

    setUserRole("USER");
    return "USER";
  };

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        if (session?.user) {
          // FIX: Aguarda fetchUserRole ANTES de setar loading = false
          await fetchUserRole(session.user.id);
        } else {
          setUserRole(null);
        }
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserRole(session.user.id);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, name: string, accountType: AccountType = "lojista") => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, account_type: accountType },
        emailRedirectTo: window.location.origin,
      },
    });
    return { error: error as Error | null };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUserRole(null);
  };

  const isSuperAdmin = userRole === "SUPERADMIN";
  const isAdmin = userRole === "ADMIN" || isSuperAdmin;
  const isLojista = userRole === "LOJISTA";
  const isConsumer = userRole === "USER";

  return (
    <AuthContext.Provider value={{
      session, user, loading, userRole,
      isSuperAdmin, isAdmin, isLojista, isConsumer,
      signUp, signIn, signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
