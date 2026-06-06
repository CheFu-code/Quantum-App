import { CHEFU_API_BASE } from "@/constants/quantum";
import { secureBackendFetch } from "@/lib/secureTransport";
import type { ChatThread, StoredThread } from "@/types/quantum";

export function formatTime(date: Date) {
  const diff = Date.now() - date.getTime();
  if (diff < 1000 * 60) return "Just now";
  if (diff < 1000 * 60 * 60) return `${Math.floor(diff / (1000 * 60))}m ago`;
  if (diff < 1000 * 60 * 60 * 24) {
    return `${Math.floor(diff / (1000 * 60 * 60))}h ago`;
  }
  return `${Math.floor(diff / (1000 * 60 * 60 * 24))}d ago`;
}

export function createId(prefix: string) {
  const maybeCrypto = globalThis.crypto as
    | { randomUUID?: () => string }
    | undefined;
  const randomId =
    maybeCrypto?.randomUUID?.() ||
    `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `${prefix}-${randomId}`;
}

export function threadTitle(input: string) {
  const words = input
    .replace(/\s+/g, " ")
    .trim()
    .split(" ")
    .filter(Boolean)
    .slice(0, 7)
    .join(" ");

  if (!words) return "New conversation";
  return words.length > 46 ? `${words.slice(0, 43)}...` : words;
}

export function previewText(input: string) {
  const normalized = input.replace(/\s+/g, " ").trim();
  return normalized.length > 64 ? `${normalized.slice(0, 61)}...` : normalized;
}

export function sortThreads(threads: ChatThread[]) {
  return [...threads].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
}

export function parseStoredThreads(value: string | null): ChatThread[] {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value) as StoredThread[];
    if (!Array.isArray(parsed)) return [];

    return sortThreads(
      parsed
        .filter((thread) => thread.id && Array.isArray(thread.messages))
        .map((thread) => ({
          ...thread,
          timestamp: new Date(thread.timestamp),
          messages: thread.messages.map((message) => ({
            ...message,
            status:
              message.status === "thinking" || message.status === "streaming"
                ? "stopped"
                : message.status,
            thinking: false,
            timestamp: new Date(message.timestamp),
          })),
        })),
    );
  } catch {
    return [];
  }
}

export function toStoredThreads(threads: ChatThread[]) {
  return threads.map((thread): StoredThread => ({
    ...thread,
    timestamp: thread.timestamp.toISOString(),
    messages: thread.messages.map((message) => ({
      id: message.id,
      role: message.role,
      content: message.content,
      feedback: message.feedback,
      generatedImages: message.generatedImages,
      metadata: message.metadata,
      status:
        message.status === "thinking" || message.status === "streaming"
          ? "stopped"
          : message.status,
      timestamp: message.timestamp.toISOString(),
    })),
  }));
}

export async function loadAccountConversations(accessToken: string) {
  const response = await secureBackendFetch(
    `${CHEFU_API_BASE}/quantum/conversations`,
    {
      headers: accountHeaders(accessToken),
    },
  );

  if (!response.ok) {
    throw new Error("Could not load account conversations.");
  }

  const data = (await response.json().catch(() => null)) as {
    conversations?: StoredThread[];
  } | null;

  return parseStoredThreads(JSON.stringify(data?.conversations || []));
}

export async function saveAccountConversations(
  accessToken: string,
  threads: ChatThread[],
) {
  if (threads.length === 0) {
    const response = await secureBackendFetch(
      `${CHEFU_API_BASE}/quantum/conversations`,
      {
        body: JSON.stringify({ conversations: [] }),
        headers: {
          "Content-Type": "application/json",
          ...accountHeaders(accessToken),
        },
        method: "PUT",
      },
    );

    if (!response.ok) {
      throw new Error("Could not clear account conversations.");
    }

    return;
  }

  await Promise.all(
    toStoredThreads(threads).map(async (conversation) => {
      const response = await secureBackendFetch(
        `${CHEFU_API_BASE}/quantum/conversations/${encodeURIComponent(conversation.id)}`,
        {
          body: JSON.stringify({ conversation }),
          headers: {
            "Content-Type": "application/json",
            ...accountHeaders(accessToken),
          },
          method: "PUT",
        },
      );

      if (!response.ok) {
        throw new Error("Could not save account conversations.");
      }
    }),
  );
}

export async function deleteAccountConversation(
  accessToken: string,
  threadId: string,
) {
  const response = await secureBackendFetch(
    `${CHEFU_API_BASE}/quantum/conversations/${encodeURIComponent(threadId)}`,
    {
      headers: accountHeaders(accessToken),
      method: "DELETE",
    },
  );

  if (!response.ok) {
    throw new Error("Could not delete account conversation.");
  }
}

function accountHeaders(accessToken: string) {
  return {
    Accept: "application/json",
    Authorization: `Bearer ${accessToken}`,
    "x-chefu-app": "quantum",
  };
}
