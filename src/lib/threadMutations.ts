import { createId, previewText, sortThreads, threadTitle } from "@/lib/conversations";
import type {
  ChatThread,
  GeneratedImage,
  ImageAttachment,
  Message,
  MessageFeedbackRating,
} from "@/types/quantum";

export type FinalizeAssistantMessageArgs = {
  content: string;
  createdAt?: string;
  generatedImages?: Message["generatedImages"];
  messageId: string;
  metadata?: Message["metadata"];
  status: Message["status"];
  statusReason?: string;
  threadId: string;
};

export function createPendingTurn({
  activeThread,
  attachments,
  messageText,
}: {
  activeThread?: ChatThread;
  attachments: ImageAttachment[];
  messageText: string;
}) {
  const now = new Date();
  const threadId = activeThread?.id || createId("thread");
  const priorMessages = activeThread?.messages || [];
  const userMessage: Message = {
    id: createId("message"),
    role: "user",
    content: messageText,
    attachments,
    timestamp: now,
  };
  const assistantMessageId = createId("message");
  const assistantMessage: Message = {
    id: assistantMessageId,
    role: "assistant",
    content: "",
    status: "thinking",
    thinking: true,
    timestamp: now,
  };
  const thread: ChatThread = {
    id: threadId,
    messages: [...priorMessages, userMessage, assistantMessage],
    preview: previewText(messageText || attachments[0]?.name || ""),
    timestamp: now,
    title:
      activeThread?.title && priorMessages.length > 0
        ? activeThread.title
        : threadTitle(messageText || attachments[0]?.name || ""),
    starred: activeThread?.starred,
  };

  return {
    assistantMessageId,
    priorMessages,
    thread,
    threadId,
  };
}

export function createRegenerationTurn(thread: ChatThread, messageId: string) {
  const assistantIndex = thread.messages.findIndex(
    (message) => message.id === messageId,
  );
  const previousMessages = thread.messages.slice(0, assistantIndex);
  const userMessage = [...previousMessages]
    .reverse()
    .find((message) => message.role === "user");

  if (!userMessage) return null;

  const assistantMessageId = createId("message");
  const assistantMessage: Message = {
    id: assistantMessageId,
    role: "assistant",
    content: "",
    status: "thinking",
    thinking: true,
    timestamp: new Date(),
  };

  return {
    assistantMessage,
    assistantMessageId,
    previousMessages,
    userMessage,
  };
}

export function upsertThread(threads: ChatThread[], thread: ChatThread) {
  return sortThreads([
    thread,
    ...threads.filter((item) => item.id !== thread.id),
  ]);
}

export function replaceThreadMessages({
  messages,
  threadId,
  threads,
}: {
  messages: Message[];
  threadId: string;
  threads: ChatThread[];
}) {
  return sortThreads(
    threads.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            messages,
            timestamp: new Date(),
          }
        : thread,
    ),
  );
}

export function finalizeAssistantMessageInThreads(
  threads: ChatThread[],
  args: FinalizeAssistantMessageArgs,
) {
  const {
    content,
    createdAt,
    generatedImages,
    messageId,
    metadata,
    status,
    statusReason,
    threadId,
  } = args;
  const timestamp = createdAt ? new Date(createdAt) : new Date();

  return sortThreads(
    threads.map((thread) =>
      thread.id === threadId
        ? {
            ...thread,
            messages: thread.messages.map((message) =>
              message.id === messageId
                ? {
                    ...message,
                    content,
                    generatedImages,
                    metadata: {
                      ...metadata,
                      statusReason: statusReason || metadata?.statusReason,
                    },
                    status,
                    thinking: false,
                    timestamp,
                  }
                : message,
            ),
            preview: previewText(content || statusReason || ""),
            timestamp,
          }
        : thread,
    ),
  );
}

export function applyMessageFeedback(
  threads: ChatThread[],
  messageId: string,
  rating: MessageFeedbackRating,
) {
  return threads.map((thread) => ({
    ...thread,
    messages: thread.messages.map((message) =>
      message.id === messageId
        ? {
            ...message,
            feedback: message.feedback === rating ? undefined : rating,
          }
        : message,
    ),
  }));
}

export function toggleThreadStar(threads: ChatThread[], threadId: string) {
  return sortThreads(
    threads.map((thread) =>
      thread.id === threadId ? { ...thread, starred: !thread.starred } : thread,
    ),
  );
}

export function assistantContentFromResponse(response: {
  generatedImages: GeneratedImage[];
  message: string;
}) {
  return (
    response.message ||
    (response.generatedImages.length > 0
      ? "Here is the image I generated."
      : "Quantum returned an empty response.")
  );
}
