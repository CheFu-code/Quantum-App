import * as SecureStore from "expo-secure-store";

import type { SessionUser } from "@/types/quantum";

const STORAGE_KEY = "quantum-app-oauth-session";
const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  keychainService: "com.chefuinc.quantum.auth",
};

export type StoredAuthSession = {
  accessToken: string;
  expiresAt: number;
  issuedAt: number;
  idToken?: string;
  refreshToken?: string;
  scope?: string;
  tokenType?: string;
  user: SessionUser;
};

export async function loadStoredAuthSession() {
  return parseStoredAuthSession(await readStoredValue());
}

export async function saveStoredAuthSession(session: StoredAuthSession) {
  if (!(await canUseSecureStore())) return;

  await SecureStore.setItemAsync(
    STORAGE_KEY,
    JSON.stringify(session),
    SECURE_STORE_OPTIONS,
  );
}

export async function clearStoredAuthSession() {
  if (await canUseSecureStore()) {
    await SecureStore.deleteItemAsync(STORAGE_KEY, SECURE_STORE_OPTIONS);
  }
}

export function isStoredAuthSessionFresh(
  session: StoredAuthSession | null,
  marginSeconds = 60,
) {
  if (!session) return false;
  return session.expiresAt - marginSeconds > Math.floor(Date.now() / 1000);
}

function parseStoredAuthSession(value: string | null): StoredAuthSession | null {
  if (!value) return null;

  try {
    const parsed = JSON.parse(value) as Partial<StoredAuthSession>;
    const user = parsed.user;

    if (
      !parsed.accessToken ||
      typeof parsed.expiresAt !== "number" ||
      typeof parsed.issuedAt !== "number" ||
      !user?.uid ||
      !user.email
    ) {
      return null;
    }

    return {
      accessToken: parsed.accessToken,
      expiresAt: parsed.expiresAt,
      idToken: parsed.idToken,
      issuedAt: parsed.issuedAt,
      refreshToken: parsed.refreshToken,
      scope: parsed.scope,
      tokenType: parsed.tokenType,
      user: {
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        roles: Array.isArray(user.roles) ? user.roles.map(String) : [],
        uid: user.uid,
      },
    };
  } catch {
    return null;
  }
}

async function readStoredValue() {
  if (await canUseSecureStore()) {
    return SecureStore.getItemAsync(STORAGE_KEY, SECURE_STORE_OPTIONS);
  }

  return null;
}

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}
