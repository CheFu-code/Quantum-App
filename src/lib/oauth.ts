import * as AuthSession from "expo-auth-session";
import * as WebBrowser from "expo-web-browser";

import {
  CHEFU_API_BASE,
  QUANTUM_OAUTH_CLIENT_ID,
  QUANTUM_OAUTH_SCOPES,
} from "@/constants/quantum";
import type { StoredAuthSession } from "@/lib/authStorage";
import type { SessionUser } from "@/types/quantum";

WebBrowser.maybeCompleteAuthSession();

const AUTH_DISCOVERY = {
  authorizationEndpoint: `${CHEFU_API_BASE}/oauth/authorize`,
  tokenEndpoint: `${CHEFU_API_BASE}/oauth/token`,
  userInfoEndpoint: `${CHEFU_API_BASE}/oauth/userinfo`,
};

export const QUANTUM_AUTH_REDIRECT_URI = AuthSession.makeRedirectUri({
  path: "auth",
  scheme: "quantum",
});

type OAuthUserInfo = {
  email?: unknown;
  name?: unknown;
  roles?: unknown;
  sub?: unknown;
};

export async function startQuantumSignIn() {
  const request = new AuthSession.AuthRequest({
    clientId: QUANTUM_OAUTH_CLIENT_ID,
    redirectUri: QUANTUM_AUTH_REDIRECT_URI,
    responseType: AuthSession.ResponseType.Code,
    scopes: QUANTUM_OAUTH_SCOPES,
    usePKCE: true,
  });

  const result = await request.promptAsync(AUTH_DISCOVERY);
  if (result.type === "cancel" || result.type === "dismiss") return null;

  if (result.type !== "success") {
    throw new Error("Sign in could not be completed.");
  }

  const code = result.params.code;
  const codeVerifier = request.codeVerifier;

  if (!code || !codeVerifier) {
    throw new Error("Sign in response did not include the expected code.");
  }

  const tokenResponse = await AuthSession.exchangeCodeAsync(
    {
      clientId: QUANTUM_OAUTH_CLIENT_ID,
      code,
      extraParams: {
        code_verifier: codeVerifier,
      },
      redirectUri: QUANTUM_AUTH_REDIRECT_URI,
    },
    AUTH_DISCOVERY,
  );
  const userInfo = await fetchQuantumUserInfo(tokenResponse.accessToken);
  const user = normalizeSessionUser(userInfo);

  if (!user) {
    throw new Error("CheFu Account did not return a Quantum user.");
  }

  return {
    accessToken: tokenResponse.accessToken,
    expiresAt:
      tokenResponse.issuedAt + (tokenResponse.expiresIn || 60 * 60),
    idToken: tokenResponse.idToken,
    issuedAt: tokenResponse.issuedAt,
    scope: tokenResponse.scope,
    tokenType: tokenResponse.tokenType,
    user,
  } satisfies StoredAuthSession;
}

export async function fetchQuantumUserInfo(accessToken: string) {
  return AuthSession.fetchUserInfoAsync(
    { accessToken },
    AUTH_DISCOVERY,
  ) as Promise<OAuthUserInfo>;
}

function normalizeSessionUser(userInfo: OAuthUserInfo): SessionUser | null {
  const uid = typeof userInfo.sub === "string" ? userInfo.sub.trim() : "";
  const email =
    typeof userInfo.email === "string" ? userInfo.email.trim() : "";

  if (!uid || !email) return null;

  return {
    displayName:
      typeof userInfo.name === "string" && userInfo.name.trim()
        ? userInfo.name.trim()
        : undefined,
    email,
    roles: Array.isArray(userInfo.roles)
      ? userInfo.roles.map(String).filter(Boolean)
      : [],
    uid,
  };
}
