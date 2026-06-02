import * as WebBrowser from "expo-web-browser";
import { useCallback, useEffect, useMemo, useState } from "react";

import { CHEFU_ACCOUNT_MANAGE_HREF } from "@/constants/quantum";
import {
  clearStoredAuthSession,
  isStoredAuthSessionFresh,
  loadStoredAuthSession,
  saveStoredAuthSession,
  type StoredAuthSession,
} from "@/lib/authStorage";
import { startQuantumSignIn } from "@/lib/oauth";
import type { AuthStatus } from "@/types/quantum";

export function useQuantumAuth() {
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [authNotice, setAuthNotice] = useState("");

  useEffect(() => {
    let mounted = true;

    loadStoredAuthSession()
      .then((storedSession) => {
        if (!mounted) return;

        if (!isStoredAuthSessionFresh(storedSession)) {
          setSession(null);
          setAuthStatus("guest");
          if (storedSession) void clearStoredAuthSession();
          return;
        }

        setSession(storedSession);
        setAuthStatus("authenticated");
      })
      .catch(() => {
        if (!mounted) return;
        setSession(null);
        setAuthStatus("guest");
      });

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!session) return;

    const delay = Math.max(
      0,
      (session.expiresAt - Math.floor(Date.now() / 1000) - 30) * 1000,
    );
    const timeout = setTimeout(() => {
      setSession(null);
      setAuthStatus("guest");
      setAuthNotice("Your CheFu session expired. Sign in again to sync.");
      void clearStoredAuthSession();
    }, delay);

    return () => clearTimeout(timeout);
  }, [session]);

  const signIn = useCallback(async () => {
    setAuthNotice("");
    setAuthStatus("checking");

    try {
      const nextSession = await startQuantumSignIn();

      if (!nextSession) {
        setAuthStatus(session ? "authenticated" : "guest");
        return;
      }

      await saveStoredAuthSession(nextSession);
      setSession(nextSession);
      setAuthStatus("authenticated");
      setAuthNotice("Signed in to CheFu Account.");
    } catch (error) {
      setAuthStatus(session ? "authenticated" : "guest");
      setAuthNotice(
        error instanceof Error
          ? error.message
          : "Could not sign in to CheFu Account.",
      );
    }
  }, [session]);

  const signOut = useCallback(async () => {
    await clearStoredAuthSession();
    setSession(null);
    setAuthStatus("guest");
    setAuthNotice("Signed out.");
  }, []);

  const openAccount = useCallback(async () => {
    await WebBrowser.openBrowserAsync(CHEFU_ACCOUNT_MANAGE_HREF);
  }, []);

  return useMemo(
    () => ({
      accessToken: session?.accessToken,
      authNotice,
      authStatus,
      openAccount,
      sessionUser: session?.user ?? null,
      signIn,
      signOut,
    }),
    [
      authNotice,
      authStatus,
      openAccount,
      session?.accessToken,
      session?.user,
      signIn,
      signOut,
    ],
  );
}
