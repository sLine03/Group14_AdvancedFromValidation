import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────────────

type AuthContextType = {
  session: Session | null;         // null = not signed in
  user: User | null;               // shortcut for session?.user
  isLoading: boolean;              // true while loading session from storage
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

// ── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ── Provider ──────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
 
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true); // true until we know if a session exists

  
  useEffect(() => {
    // 1. Load any existing session from AsyncStorage (set by a previous sign-in)
    //    This is how "stay logged in" works — we check storage before showing any screen.
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setSession(session);
      })
      .catch(() => {
        setSession(null);
      })
      .finally(() => {
        setIsLoading(false);
      });

   
    const {
      data: { subscription },} = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    // Clean up the subscription when the provider unmounts
    return () => subscription.unsubscribe();
  }, []);

  // ── Auth functions ──────────────────────────────────────────────────────────

  // Week 12 - Class Code
  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    // On success: onAuthStateChange fires → session state updates → AuthGuard redirects
  };

  // Week 12 - Class Code
  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // On success: onAuthStateChange fires → session state updates → AuthGuard redirects
  };

  
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    // On success: onAuthStateChange fires with session = null → AuthGuard redirects to /login
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user: session?.user ?? null,
        isLoading,
        signIn,
        signUp,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ── Hook ──────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be called inside <AuthProvider>");
  }
  return context;
};