import * as AuthSession from "expo-auth-session";
import * as Crypto from "expo-crypto";
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
  picture?: unknown;
  photoURL?: unknown;
  roles?: unknown;
  sub?: unknown;
};

export async function startQuantumSignIn() {
  const nonce = await randomOAuthParam(32);
  const state = await randomOAuthParam(32);
  const request = new AuthSession.AuthRequest({
    clientId: QUANTUM_OAUTH_CLIENT_ID,
    extraParams: {
      nonce,
    },
    prompt: AuthSession.Prompt.Login,
    redirectUri: QUANTUM_AUTH_REDIRECT_URI,
    responseType: AuthSession.ResponseType.Code,
    scopes: QUANTUM_OAUTH_SCOPES,
    state,
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
  validateIdTokenClaims(tokenResponse.idToken, nonce);
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
    photoURL:
      typeof userInfo.picture === "string" && userInfo.picture.trim()
        ? userInfo.picture.trim()
        : typeof userInfo.photoURL === "string" && userInfo.photoURL.trim()
          ? userInfo.photoURL.trim()
          : undefined,
    roles: Array.isArray(userInfo.roles)
      ? userInfo.roles.map(String).filter(Boolean)
      : [],
    uid,
  };
}

function validateIdTokenClaims(idToken: string | null | undefined, nonce: string) {
  if (!idToken) {
    throw new Error("CheFu Account did not return an ID token.");
  }

  const claims = parseJwtPayload(idToken);
  const now = Math.floor(Date.now() / 1000);
  const issuer = CHEFU_API_BASE.replace(/\/$/, "");

  if (
    claims.iss !== issuer ||
    claims.aud !== QUANTUM_OAUTH_CLIENT_ID ||
    claims.nonce !== nonce ||
    claims.typ !== "id_token" ||
    typeof claims.sub !== "string" ||
    !claims.sub ||
    typeof claims.exp !== "number" ||
    typeof claims.iat !== "number" ||
    claims.exp <= now ||
    claims.iat > now + 60
  ) {
    throw new Error("CheFu Account returned an invalid ID token.");
  }
}

function parseJwtPayload(token: string) {
  const [, payload] = token.split(".");

  if (!payload) {
    throw new Error("CheFu Account returned a malformed ID token.");
  }

  try {
    return JSON.parse(decodeBase64Url(payload)) as Record<string, unknown>;
  } catch {
    throw new Error("CheFu Account returned a malformed ID token.");
  }
}

function decodeBase64Url(value: string) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary =
    typeof globalThis.atob === "function"
      ? globalThis.atob(padded)
      : decodeBase64(padded);
  const bytes = Array.from(binary, character =>
    `%${character.charCodeAt(0).toString(16).padStart(2, "0")}`,
  ).join("");

  return decodeURIComponent(bytes);
}

async function randomOAuthParam(size: number) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789._~-";
  const bytes = await Crypto.getRandomBytesAsync(size);

  return Array.from(bytes, byte => alphabet[byte % alphabet.length]).join("");
}

function decodeBase64(value: string) {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
  let buffer = 0;
  let bits = 0;
  let output = "";

  for (const character of value.replace(/=+$/, "")) {
    const index = alphabet.indexOf(character);
    if (index === -1) {
      throw new Error("CheFu Account returned a malformed ID token.");
    }

    buffer = (buffer << 6) | index;
    bits += 6;

    if (bits >= 8) {
      bits -= 8;
      output += String.fromCharCode((buffer >> bits) & 0xff);
    }
  }

  return output;
}
