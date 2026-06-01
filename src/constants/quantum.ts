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
const configuredChatApiUrl =
  (typeof process !== "undefined"
    ? process.env?.EXPO_PUBLIC_QUANTUM_CHAT_API_URL
    : undefined) ||
  (Constants.expoConfig?.extra as { quantumChatApiUrl?: string } | undefined)
    ?.quantumChatApiUrl ||
  DEFAULT_CHAT_API_URL;

export const QUANTUM_CHAT_API_URL = configuredChatApiUrl.trim();
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

export const RESPONSE_STYLES: Array<{
  id: ResponseStyle;
  label: string;
}> = [
  { id: "concise", label: "Concise" },
  { id: "balanced", label: "Balanced" },
  { id: "detailed", label: "Detailed" },
];

export const INFERENCE_TIERS: Array<{
  id: ServiceTier;
  label: string;
}> = [
  { id: "standard", label: "Standard" },
  { id: "flex", label: "Flex" },
  { id: "priority", label: "Priority" },
];

export const DEFAULT_CHAT_PREFERENCES: ChatPreferences = {
  autoScroll: true,
  compactMessages: false,
  codeExecution: false,
  enterToSend: true,
  fileSearch: false,
  mapsGrounding: false,
  responseStyle: "balanced",
  saveConversations: true,
  serviceTier: "standard",
  showTimestamps: true,
  urlContext: true,
};

export function resolveStoredModel(value: string | null): QuantumModel {
  return MODELS.find((model) => model.id === value) || MODELS[1];
}

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
