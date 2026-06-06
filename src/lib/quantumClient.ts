import {
  QUANTUM_CHAT_API_URL,
  type QuantumModel,
} from "@/constants/quantum";
import { assertSecureBackendUrl } from "@/lib/secureTransport";
import type {
  ChatPreferences,
  ImageAttachment,
  Message,
  MessageMetadata,
} from "@/types/quantum";

type QuantumResponsePayload = {
  createdAt?: string;
  images?: Message["generatedImages"];
  message?: string;
  metadata?: MessageMetadata;
};

const QUANTUM_REQUEST_TIMEOUT_MS = 60_000;

export async function requestQuantumReply({
  accessToken,
  attachments,
  message,
  messages,
  preferences,
  selectedModel,
  signal,
  webSearchEnabled,
}: {
  accessToken?: string;
  attachments: ImageAttachment[];
  message: string;
  messages: Message[];
  preferences: ChatPreferences;
  selectedModel: QuantumModel;
  signal: AbortSignal;
  webSearchEnabled: boolean;
}) {
  assertSecureBackendUrl(QUANTUM_CHAT_API_URL);
  const requestSignal = createTimeoutSignal(signal, QUANTUM_REQUEST_TIMEOUT_MS);
  let response: Response;

  try {
    response = await fetch(QUANTUM_CHAT_API_URL, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-chefu-app": "quantum",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
      },
      signal: requestSignal.signal,
      body: JSON.stringify({
        attachments: attachments.map(({ data, mimeType, name, size }) => ({
          data,
          mimeType,
          name,
          size,
        })),
        history: buildVisibleHistory(messages),
        message: message || "Describe the attached file.",
        model: selectedModel.id,
        responseStyle: preferences.responseStyle,
        serviceTier: preferences.serviceTier,
        tools: {
          codeExecution: preferences.codeExecution,
          fileSearch: preferences.fileSearch,
          mapsGrounding: preferences.mapsGrounding,
          urlContext: preferences.urlContext,
        },
        webSearch: webSearchEnabled,
      }),
    });
  } catch (error) {
    if (requestSignal.timedOut() && !signal.aborted) {
      throw new Error("Quantum timed out. Please try again.");
    }

    throw error;
  } finally {
    requestSignal.cleanup();
  }

  const data = (await response.json().catch(() => null)) as
    | (QuantumResponsePayload & { error?: string })
    | null;

  if (!response.ok) {
    throw new Error(
      data?.error || `Quantum returned HTTP ${response.status}.`,
    );
  }

  return {
    createdAt: data?.createdAt,
    generatedImages: normalizeGeneratedImages(data?.images),
    message: data?.message || "",
    metadata: data?.metadata,
  };
}

function createTimeoutSignal(signal: AbortSignal, timeoutMs: number) {
  const controller = new AbortController();
  let timeoutHit = false;
  const abortFromCaller = () => controller.abort();
  const timeout = setTimeout(() => {
    timeoutHit = true;
    controller.abort();
  }, timeoutMs);

  if (signal.aborted) {
    abortFromCaller();
  } else {
    signal.addEventListener("abort", abortFromCaller, { once: true });
  }

  return {
    cleanup() {
      clearTimeout(timeout);
      signal.removeEventListener("abort", abortFromCaller);
    },
    signal: controller.signal,
    timedOut() {
      return timeoutHit;
    },
  };
}

function buildVisibleHistory(messages: Message[]) {
  return messages
    .slice(-12)
    .filter(
      (message) =>
        (message.role === "user" || message.role === "assistant") &&
        message.status !== "failed" &&
        message.status !== "thinking" &&
        message.status !== "streaming",
    )
    .map((message) => ({
      role: message.role,
      content: sanitizeHistoryContent(message.content),
    }))
    .filter((message) => message.content.trim().length > 0)
    .slice(-8);
}

function sanitizeHistoryContent(value: string) {
  return value
    .replace(/^```[\w-]*\n[\s\S]*?\n```\s*/g, "")
    .replace(/\n{2,}#{2,3}\s+Sources\s*\n[\s\S]+$/i, "")
    .trim();
}

function normalizeGeneratedImages(images: QuantumResponsePayload["images"]) {
  if (!Array.isArray(images)) return [];

  return images
    .filter((image) =>
      Boolean(image?.data && image.mimeType?.startsWith("image/")),
    )
    .map((image, index) => ({
      id: image.id || `generated-image-${index}`,
      mimeType: image.mimeType || "image/png",
      data: image.data || "",
      alt: image.alt || `Generated image ${index + 1}`,
    }));
}
