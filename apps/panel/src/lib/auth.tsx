"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { getSupabase } from "./supabase";

/** Oturum açan kullanıcının profili + (varsa) hemşire kaydı. */
export interface PanelUser {
  id: string;
  fullName: string;
  email: string | null;
  role: string;
  specialty: string | null;
  nurseStatus: string | null;
}

interface AuthState {
  loading: boolean;
  session: Session | null;
  user: PanelUser | null;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState | null>(null);

/** Giriş gerektirmeyen yollar (auth guard bunları serbest bırakır). */
const PUBLIC_PATHS = ["/giris"];

async function loadPanelUser(userId: string): Promise<PanelUser | null> {
  const supabase = getSupabase();
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, email, role")
    .eq("id", userId)
    .maybeSingle();
  if (!profile) {
    return {
      id: userId,
      fullName: "",
      email: null,
      role: "nurse",
      specialty: null,
      nurseStatus: null,
    };
  }
  const { data: nurse } = await supabase
    .from("nurses")
    .select("specialty, status")
    .eq("id", userId)
    .maybeSingle();
  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    role: profile.role,
    specialty: nurse?.specialty ?? null,
    nurseStatus: nurse?.status ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<PanelUser | null>(null);

  useEffect(() => {
    const supabase = getSupabase();
    let mounted = true;

    // KRİTİK: onAuthStateChange callback'i içinde supabase sorgusu AWAIT EDİLMEZ —
    // supabase-js auth kilidi nedeniyle sayfa yenilemede ölümcül kilitlenme yaratır
    // ("Yükleniyor" da takılma). Profil, callback dışında (macrotask) yüklenir.
    const applySession = (s: Session | null) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
      if (!s) {
        setUser(null);
        return;
      }
      setTimeout(() => {
        loadPanelUser(s.user.id)
          .then((u) => {
            if (mounted) setUser(u);
          })
          .catch(() => {});
      }, 0);
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) =>
      applySession(s),
    );

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  // Auth guard: oturum yoksa ve sayfa public değilse /giris'e yönlendir.
  useEffect(() => {
    if (loading) return;
    const isPublic = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
    if (!session && !isPublic) router.replace("/giris");
    if (session && isPublic) router.replace("/");
  }, [loading, session, pathname, router]);

  const value = useMemo<AuthState>(
    () => ({
      loading,
      session,
      user,
      signIn: async (email, password) => {
        const supabase = getSupabase();
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        return { error: error?.message ?? null };
      },
      signOut: async () => {
        await getSupabase().auth.signOut();
        router.replace("/giris");
      },
    }),
    [loading, session, user, router],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
