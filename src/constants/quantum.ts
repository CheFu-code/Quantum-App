import Constants from "expo-constants";

import type {
  ChatPreferences,
  ResponseStyle,
  ServiceTier,
} from "@/types/quantum";

declare const process:
  | {
      env?: Record<string, string | undefined>;
    }
  | undefined;

const DEFAULT_CHAT_API_URL = "https://quantum.chefuinc.com/api/chat";
const DEFAULT_CHEFU_API_URL = "https://api.chefuinc.com";
const DEFAULT_CHEFU_ACCOUNT_URL = "https://myaccount.chefuinc.com";
const DEFAULT_QUANTUM_OAUTH_CLIENT_ID = "quantum-mobile";
const expoExtra = Constants.expoConfig?.extra as
  | {
      chefuAccountUrl?: string;
      chefuApiUrl?: string;
      quantumChatApiUrl?: string;
      quantumOauthClientId?: string;
    }
  | undefined;

const configuredChatApiUrl = readPublicConfig(
  "EXPO_PUBLIC_QUANTUM_CHAT_API_URL",
  expoExtra?.quantumChatApiUrl,
  DEFAULT_CHAT_API_URL,
);
const configuredChefuAccountUrl = readPublicConfig(
  "EXPO_PUBLIC_CHEFU_ACCOUNT_URL",
  expoExtra?.chefuAccountUrl,
  DEFAULT_CHEFU_ACCOUNT_URL,
);
const configuredChefuApiUrl = readPublicConfig(
  "EXPO_PUBLIC_CHEFU_API_URL",
  expoExtra?.chefuApiUrl,
  DEFAULT_CHEFU_API_URL,
);
const configuredQuantumOauthClientId = readPublicConfig(
  "EXPO_PUBLIC_QUANTUM_OAUTH_CLIENT_ID",
  expoExtra?.quantumOauthClientId,
  DEFAULT_QUANTUM_OAUTH_CLIENT_ID,
);

export const QUANTUM_CHAT_API_URL = normalizePublicUrl(
  configuredChatApiUrl,
  DEFAULT_CHAT_API_URL,
  { allowPath: true },
);
export const CHEFU_API_BASE = normalizePublicUrl(
  configuredChefuApiUrl,
  DEFAULT_CHEFU_API_URL,
  { allowPath: false },
);
export const CHEFU_ACCOUNT_BASE = normalizePublicUrl(
  configuredChefuAccountUrl,
  DEFAULT_CHEFU_ACCOUNT_URL,
  { allowPath: false },
);
export const CHEFU_ACCOUNT_MANAGE_HREF = `${CHEFU_ACCOUNT_BASE}/account`;
export const QUANTUM_OAUTH_CLIENT_ID = normalizeOauthClientId(
  configuredQuantumOauthClientId,
);
export const QUANTUM_OAUTH_SCOPES = [
  "openid",
  "profile",
  "email",
  "quantum:chat",
  "quantum:read",
];
export const MAX_ATTACHMENTS = 6;
export const MAX_ATTACHMENT_SIZE = 10 * 1024 * 1024;

export const SUPPORTED_ATTACHMENT_TYPES = [
  "image/*",
  "application/pdf",
  "text/*",
  "application/json",
  "application/sql",
  "application/typescript",
  "application/xml",
];

const SUPPORTED_ATTACHMENT_EXTENSIONS = new Set([
  "csv",
  "json",
  "md",
  "markdown",
  "ts",
  "tsx",
  "js",
  "jsx",
  "py",
  "sql",
  "txt",
  "xml",
  "yaml",
  "yml",
]);

const SUPPORTED_ATTACHMENT_MIME_TYPES = new Set([
  "application/json",
  "application/pdf",
  "application/sql",
  "application/typescript",
  "application/xml",
  "text/csv",
  "text/javascript",
  "text/jsx",
  "text/markdown",
  "text/plain",
  "text/tab-separated-values",
  "text/tsx",
  "text/typescript",
  "text/x-python",
  "text/x-sql",
  "text/xml",
  "text/yaml",
]);

export const MODELS = [
  {
    id: "flash",
    name: "Quantum Flash",
    badge: "Fast",
    color: "#81c995",
  },
  {
    id: "pro",
    name: "Quantum Pro",
    badge: "Balanced",
    color: "#8ab4f8",
  },
  {
    id: "ultra",
    name: "Quantum Ultra",
    badge: "Deep",
    color: "#c58af9",
  },
] as const;

export type QuantumModel = (typeof MODELS)[number];

export const RESPONSE_STYLES: {
  id: ResponseStyle;
  label: string;
}[] = [
  { id: "concise", label: "Concise" },
  { id: "balanced", label: "Balanced" },
  { id: "detailed", label: "Detailed" },
];

export const INFERENCE_TIERS: {
  id: ServiceTier;
  label: string;
}[] = [
  { id: "standard", label: "Standard" },
  { id: "flex", label: "Flex" },
  { id: "priority", label: "Priority" },
];

export const DEFAULT_CHAT_PREFERENCES: ChatPreferences = {
  autoScroll: true,
  compactMessages: false,
  codeExecution: false,
  fileSearch: false,
  mapsGrounding: false,
  responseStyle: "balanced",
  serviceTier: "standard",
  showTimestamps: true,
  urlContext: true,
};

export function resolveResponseStyle(value: unknown): ResponseStyle {
  return RESPONSE_STYLES.some((style) => style.id === value)
    ? (value as ResponseStyle)
    : DEFAULT_CHAT_PREFERENCES.responseStyle;
}

export function resolveServiceTier(value: unknown): ServiceTier {
  return INFERENCE_TIERS.some((tier) => tier.id === value)
    ? (value as ServiceTier)
    : DEFAULT_CHAT_PREFERENCES.serviceTier;
}

export function isSupportedAttachment({
  mimeType,
  name,
}: {
  mimeType?: string | null;
  name: string;
}) {
  if (mimeType?.startsWith("image/")) return true;
  if (mimeType?.startsWith("text/")) return true;
  if (mimeType && SUPPORTED_ATTACHMENT_MIME_TYPES.has(mimeType)) return true;

  const extension = name.split(".").pop()?.toLowerCase();
  return extension ? SUPPORTED_ATTACHMENT_EXTENSIONS.has(extension) : false;
}

function readPublicConfig(
  envName: string,
  expoValue: string | undefined,
  fallback: string,
) {
  return (
    (typeof process !== "undefined" ? process.env?.[envName] : undefined) ||
    expoValue ||
    fallback
  );
}

function normalizePublicUrl(
  value: string,
  fallback: string,
  { allowPath }: { allowPath: boolean },
) {
  try {
    const url = new URL(value.trim());

    if (
      url.username ||
      url.password ||
      url.hash ||
      (url.protocol !== "https:" && !isLocalHttpUrl(url))
    ) {
      throw new Error("Unsafe public URL.");
    }

    if (!allowPath) {
      url.pathname = "";
      url.search = "";
    }

    return url.toString().replace(/\/$/, "");
  } catch {
    return fallback.replace(/\/$/, "");
  }
}

function isLocalHttpUrl(url: URL) {
  return (
    url.protocol === "http:" &&
    ["localhost", "127.0.0.1", "10.0.2.2"].includes(url.hostname)
  );
}

function normalizeOauthClientId(value: string) {
  const normalized = value.trim();
  return /^[A-Za-z0-9._:-]{3,80}$/.test(normalized)
    ? normalized
    : DEFAULT_QUANTUM_OAUTH_CLIENT_ID;
}
