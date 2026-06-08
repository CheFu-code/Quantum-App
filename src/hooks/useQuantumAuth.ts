import * as WebBrowser from "expo-web-browser";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import { AppState } from "react-native";

import { CHEFU_ACCOUNT_MANAGE_HREF } from "@/constants/quantum";
import {
  clearStoredAuthSession,
  isStoredAuthSessionFresh,
  loadStoredAuthSession,
  saveStoredAuthSession,
  type StoredAuthSession,
} from "@/lib/authStorage";
import { authErrorMessage } from "@/lib/authErrors";
import {
  refreshQuantumSession,
  revokeQuantumSession,
  startQuantumSignIn,
} from "@/lib/oauth";
import type { AuthStatus } from "@/types/quantum";

export function useQuantumAuth() {
  const [session, setSession] = useState<StoredAuthSession | null>(null);
  const [authStatus, setAuthStatus] = useState<AuthStatus>("checking");
  const [authNotice, setAuthNotice] = useState("");
  const operationRef = useRef(0);

  const restoreStoredSession = useCallback(async () => {
    const operationId = nextAuthOperation(operationRef);
    setAuthStatus("checking");

    try {
      const storedSession = await loadStoredAuthSession();

      if (!isStoredAuthSessionFresh(storedSession)) {
        const refreshedSession = await refreshStoredSession(storedSession);
        if (!isCurrentAuthOperation(operationRef, operationId)) return;

        if (refreshedSession) {
          setSession(refreshedSession);
          setAuthStatus("authenticated");
          return;
        }

        setSession(null);
        setAuthStatus("guest");
        if (storedSession) {
          setAuthNotice("Your CheFu session expired. Sign in again to sync.");
          void clearStoredAuthSession();
        }
        return;
      }

      if (!isCurrentAuthOperation(operationRef, operationId)) return;
      setSession(storedSession);
      setAuthStatus("authenticated");
    } catch {
      if (!isCurrentAuthOperation(operationRef, operationId)) return;
      setSession(null);
      setAuthStatus("guest");
    }
  }, []);

  useEffect(() => {
    void restoreStoredSession();
  }, [restoreStoredSession]);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void restoreStoredSession();
        return;
      }

      nextAuthOperation(operationRef);
      setSession(null);
      setAuthStatus("checking");
      setAuthNotice("");
    });

    return () => subscription.remove();
  }, [restoreStoredSession]);

  useEffect(() => {
    if (!session) return;

    const delay = Math.max(
      0,
      (session.expiresAt - Math.floor(Date.now() / 1000) - 30) * 1000,
    );
    let active = true;
    const operationId = operationRef.current;
    const timeout = setTimeout(async () => {
      const refreshedSession = await refreshStoredSession(session);
      if (!active || !isCurrentAuthOperation(operationRef, operationId)) return;

      if (refreshedSession) {
        setSession(refreshedSession);
        setAuthStatus("authenticated");
        return;
      }

      setSession(null);
      setAuthStatus("guest");
      setAuthNotice("Your CheFu session expired. Sign in again to sync.");
      void clearStoredAuthSession();
    }, delay);

    return () => {
      active = false;
      clearTimeout(timeout);
    };
  }, [session]);

  const signIn = useCallback(async () => {
    const operationId = nextAuthOperation(operationRef);
    setAuthNotice("");
    setAuthStatus("checking");

    try {
      const nextSession = await startQuantumSignIn();
      if (!isCurrentAuthOperation(operationRef, operationId)) return;

      if (!nextSession) {
        setAuthStatus(session ? "authenticated" : "guest");
        return;
      }

      await saveStoredAuthSession(nextSession);
      setSession(nextSession);
      setAuthStatus("authenticated");
      setAuthNotice("Signed in to CheFu Account.");
    } catch (error) {
      if (!isCurrentAuthOperation(operationRef, operationId)) return;
      setAuthStatus(session ? "authenticated" : "guest");
      setAuthNotice(authErrorMessage(error));
    }
  }, [session]);

  const signOut = useCallback(async () => {
    nextAuthOperation(operationRef);
    await revokeQuantumSession(session).catch(() => undefined);
    await clearStoredAuthSession();
    setSession(null);
    setAuthStatus("guest");
    setAuthNotice("Signed out.");
  }, [session]);

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

function nextAuthOperation(operationRef: MutableRefObject<number>) {
  operationRef.current += 1;
  return operationRef.current;
}

function isCurrentAuthOperation(
  operationRef: MutableRefObject<number>,
  operationId: number,
) {
  return operationRef.current === operationId;
}

async function refreshStoredSession(session: StoredAuthSession | null) {
  if (!session?.refreshToken) return null;

  try {
    const refreshedSession = await refreshQuantumSession(session);
    if (refreshedSession) await saveStoredAuthSession(refreshedSession);
    return refreshedSession;
  } catch {
    await clearStoredAuthSession();
    return null;
  }
}
