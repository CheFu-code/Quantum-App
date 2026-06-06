import * as Clipboard from "expo-clipboard";
import { Alert } from "react-native";
import type { Dispatch, MutableRefObject, SetStateAction } from "react";

import {
  DEFAULT_CHAT_PREFERENCES,
  MODELS,
  type QuantumModel,
} from "@/constants/quantum";
import { pickQuantumAttachments } from "@/lib/attachments";
import { deleteAccountConversation } from "@/lib/conversations";
import { requestQuantumReply } from "@/lib/quantumClient";
import {
  applyMessageFeedback,
  assistantContentFromResponse,
  createPendingTurn,
  createRegenerationTurn,
  finalizeAssistantMessageInThreads,
  replaceThreadMessages,
  toggleThreadStar as toggleThreadStarInThreads,
  upsertThread,
  type FinalizeAssistantMessageArgs,
} from "@/lib/threadMutations";
import type {
  AuthStatus,
  ChatPreferences,
  ChatThread,
  ConversationFilter,
  ImageAttachment,
  MessageFeedbackRating,
} from "@/types/quantum";

type ActiveRequest = {
  controller: AbortController;
  messageId: string;
  threadId: string;
};

type StateSetter<T> = Dispatch<SetStateAction<T>>;

export function useQuantumChatActions({
  accessToken,
  authStatus,
  activeRequestRef,
  activeThread,
  activeThreadId,
  attachments,
  input,
  isTyping,
  preferences,
  selectedModel,
  setActiveThreadId,
  setAttachments,
  setConversationFilter,
  setCopiedId,
  setInput,
  setIsTyping,
  setNotice,
  setPreferences,
  setSearchQuery,
  setSelectedModel,
  setSettingsOpen,
  setSidebarOpen,
  setThreads,
  setWebSearchEnabled,
  threads,
  webSearchEnabled,
  onOpenAccount,
  onSignIn,
  onSignOut,
}: {
  accessToken?: string;
  authStatus: AuthStatus;
  activeRequestRef: MutableRefObject<ActiveRequest | null>;
  activeThread?: ChatThread;
  activeThreadId: string;
  attachments: ImageAttachment[];
  input: string;
  isTyping: boolean;
  preferences: ChatPreferences;
  selectedModel: QuantumModel;
  setActiveThreadId: StateSetter<string>;
  setAttachments: StateSetter<ImageAttachment[]>;
  setConversationFilter: StateSetter<ConversationFilter>;
  setCopiedId: StateSetter<string | null>;
  setInput: StateSetter<string>;
  setIsTyping: StateSetter<boolean>;
  setNotice: StateSetter<string>;
  setPreferences: StateSetter<ChatPreferences>;
  setSearchQuery: StateSetter<string>;
  setSelectedModel: StateSetter<QuantumModel>;
  setSettingsOpen: StateSetter<boolean>;
  setSidebarOpen: StateSetter<boolean>;
  setThreads: StateSetter<ChatThread[]>;
  setWebSearchEnabled: StateSetter<boolean>;
  threads: ChatThread[];
  webSearchEnabled: boolean;
  onOpenAccount: () => Promise<void>;
  onSignIn: () => Promise<void>;
  onSignOut: () => Promise<void>;
}) {
  function updatePreference<Key extends keyof ChatPreferences>(
    key: Key,
    value: ChatPreferences[Key],
  ) {
    setPreferences((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function finalizeAssistantMessage(args: FinalizeAssistantMessageArgs) {
    setThreads((currentThreads) =>
      finalizeAssistantMessageInThreads(currentThreads, args),
    );
  }

  async function sendMessage(messageOverride?: string) {
    if (isTyping) return;

    const messageText = (messageOverride ?? input).trim();
    const activeAttachments = attachments;

    if (!messageText && activeAttachments.length === 0) return;

    const { assistantMessageId, priorMessages, thread, threadId } =
      createPendingTurn({
        activeThread,
        attachments: activeAttachments,
        messageText,
      });

    setThreads((current) => upsertThread(current, thread));
    setActiveThreadId(threadId);
    setInput("");
    setAttachments([]);
    setNotice("");
    setIsTyping(true);

    const controller = new AbortController();
    activeRequestRef.current = {
      controller,
      messageId: assistantMessageId,
      threadId,
    };

    try {
      const response = await requestQuantumReply({
        accessToken,
        attachments: activeAttachments,
        message: messageText,
        messages: priorMessages,
        preferences,
        selectedModel,
        signal: controller.signal,
        webSearchEnabled,
      });

      finalizeAssistantMessage({
        content: assistantContentFromResponse(response),
        createdAt: response.createdAt,
        generatedImages: response.generatedImages,
        messageId: assistantMessageId,
        metadata: response.metadata,
        status: "complete",
        threadId,
      });
    } catch (error) {
      const stopped = controller.signal.aborted;
      finalizeAssistantMessage({
        content: stopped
          ? "Response stopped."
          : error instanceof Error
            ? `I could not reach Quantum: ${error.message}`
            : "I could not reach Quantum. Please try again.",
        messageId: assistantMessageId,
        status: stopped ? "stopped" : "failed",
        statusReason: stopped
          ? "Stopped by user"
          : error instanceof Error
            ? error.message
            : "Unknown error",
        threadId,
      });
    } finally {
      if (activeRequestRef.current?.messageId === assistantMessageId) {
        activeRequestRef.current = null;
      }
      setIsTyping(false);
    }
  }

  async function regenerateResponse(messageId: string) {
    if (isTyping) return;

    const thread = threads.find((item) =>
      item.messages.some((message) => message.id === messageId),
    );
    if (!thread) return;

    const regenerationTurn = createRegenerationTurn(thread, messageId);
    if (!regenerationTurn) return;

    const {
      assistantMessage,
      assistantMessageId,
      previousMessages,
      userMessage,
    } = regenerationTurn;

    setActiveThreadId(thread.id);
    setThreads((current) =>
      replaceThreadMessages({
        messages: [...previousMessages, assistantMessage],
        threadId: thread.id,
        threads: current,
      }),
    );
    setIsTyping(true);

    const controller = new AbortController();
    activeRequestRef.current = {
      controller,
      messageId: assistantMessageId,
      threadId: thread.id,
    };

    try {
      const response = await requestQuantumReply({
        accessToken,
        attachments: userMessage.attachments || [],
        message: userMessage.content,
        messages: previousMessages.slice(0, -1),
        preferences,
        selectedModel,
        signal: controller.signal,
        webSearchEnabled,
      });

      finalizeAssistantMessage({
        content: assistantContentFromResponse(response),
        createdAt: response.createdAt,
        generatedImages: response.generatedImages,
        messageId: assistantMessageId,
        metadata: response.metadata,
        status: "complete",
        threadId: thread.id,
      });
    } catch (error) {
      const stopped = controller.signal.aborted;
      finalizeAssistantMessage({
        content: stopped
          ? "Response stopped."
          : error instanceof Error
            ? `I could not regenerate that response: ${error.message}`
            : "I could not regenerate that response. Please try again.",
        messageId: assistantMessageId,
        status: stopped ? "stopped" : "failed",
        statusReason: stopped
          ? "Stopped by user"
          : error instanceof Error
            ? error.message
            : "Unknown error",
        threadId: thread.id,
      });
    } finally {
      if (activeRequestRef.current?.messageId === assistantMessageId) {
        activeRequestRef.current = null;
      }
      setIsTyping(false);
    }
  }

  function stopResponse() {
    activeRequestRef.current?.controller.abort();
  }

  async function copyMessage(id: string, content: string) {
    await Clipboard.setStringAsync(content);
    setCopiedId(id);
    setNotice("Copied");
    setTimeout(() => {
      setCopiedId(null);
      setNotice("");
    }, 1600);
  }

  function rateMessage(messageId: string, rating: MessageFeedbackRating) {
    setThreads((current) =>
      applyMessageFeedback(current, messageId, rating),
    );
  }

  async function pickFiles() {
    try {
      const result = await pickQuantumAttachments(attachments.length);
      if (result.attachments.length > 0) {
        setAttachments((current) => [...current, ...result.attachments]);
      }
      setNotice(result.notice);
    } catch (error) {
      setNotice(
        error instanceof Error ? error.message : "Could not attach that file.",
      );
    }
  }

  function removeAttachment(attachmentId: string) {
    setAttachments((current) =>
      current.filter((attachment) => attachment.id !== attachmentId),
    );
  }

  function startNewConversation() {
    stopResponse();
    setActiveThreadId("");
    setInput("");
    setAttachments([]);
    setNotice(authStatus === "guest" ? "Started a guest conversation." : "");
    setSettingsOpen(false);
    setSidebarOpen(false);
  }

  function deleteThread(threadId: string) {
    const nextThreads = threads.filter((thread) => thread.id !== threadId);
    setThreads(nextThreads);
    if (accessToken) {
      deleteAccountConversation(accessToken, threadId).catch(() => {
        setNotice("Could not delete account conversation.");
      });
    }
    if (activeThreadId === threadId) {
      setActiveThreadId("");
      setInput("");
      setAttachments([]);
    }
  }

  function confirmDeleteThread(threadId: string) {
    Alert.alert("Delete conversation", "This conversation will be removed.", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => deleteThread(threadId),
        style: "destructive",
        text: "Delete",
      },
    ]);
  }

  function toggleThreadStar(threadId: string) {
    setThreads((current) => toggleThreadStarInThreads(current, threadId));
  }

  function clearConversations() {
    Alert.alert("Clear conversations", "All Quantum history will be removed.", [
      { style: "cancel", text: "Cancel" },
      {
        onPress: () => {
          setThreads([]);
          setActiveThreadId("");
          setNotice("Conversations cleared.");
        },
        style: "destructive",
        text: "Clear",
      },
    ]);
  }

  function resetPreferences() {
    setSelectedModel(MODELS[1]);
    setWebSearchEnabled(false);
    setPreferences(DEFAULT_CHAT_PREFERENCES);
    setNotice("Preferences reset.");
  }

  async function openLogin() {
    await onSignIn();
  }

  async function openAccount() {
    await onOpenAccount();
  }

  async function signOut() {
    stopResponse();
    setThreads([]);
    setActiveThreadId("");
    setInput("");
    setAttachments([]);
    setNotice("");
    setSettingsOpen(false);
    setSidebarOpen(false);
    await onSignOut();
  }

  return {
    clearConversations,
    confirmDeleteThread,
    copyMessage,
    openAccount,
    openLogin,
    pickFiles,
    rateMessage,
    regenerateResponse,
    removeAttachment,
    resetPreferences,
    sendMessage,
    setActiveThreadId,
    setConversationFilter,
    setInput,
    setSearchQuery,
    setSelectedModel,
    setSettingsOpen,
    setSidebarOpen,
    setWebSearchEnabled,
    signOut,
    startNewConversation,
    stopResponse,
    toggleThreadStar,
    updatePreference,
  };
}
