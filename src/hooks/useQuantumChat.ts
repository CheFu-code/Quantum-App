import { useEffect, useMemo, useRef, useState } from "react";
import { type FlatList } from "react-native";

import {
  DEFAULT_CHAT_PREFERENCES,
  MODELS,
  type QuantumModel,
} from "@/constants/quantum";
import {
  loadAccountConversations,
  loadLocalConversations,
  saveAccountConversations,
  saveLocalConversations,
  sortThreads,
} from "@/lib/conversations";
import { matchesConversationFilter } from "@/lib/quantumPresentation";
import { useQuantumAuth } from "@/hooks/useQuantumAuth";
import { useQuantumChatActions } from "@/hooks/useQuantumChatActions";
import type {
  ChatPreferences,
  ChatThread,
  ConversationFilter,
  ImageAttachment,
  Message,
} from "@/types/quantum";

type ActiveRequest = {
  controller: AbortController;
  messageId: string;
  threadId: string;
};

export function useQuantumChat() {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [activeThreadId, setActiveThreadId] = useState("");
  const [input, setInput] = useState("");
  const [selectedModel, setSelectedModel] = useState<QuantumModel>(MODELS[1]);
  const [attachments, setAttachments] = useState<ImageAttachment[]>([]);
  const [preferences, setPreferences] = useState<ChatPreferences>(
    DEFAULT_CHAT_PREFERENCES,
  );
  const [webSearchEnabled, setWebSearchEnabled] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [conversationFilter, setConversationFilter] =
    useState<ConversationFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [notice, setNotice] = useState("");
  const listRef = useRef<FlatList<Message>>(null);
  const activeRequestRef = useRef<ActiveRequest | null>(null);
  const threadsRef = useRef<ChatThread[]>([]);
  const auth = useQuantumAuth();

  const activeThread = useMemo(
    () => threads.find((thread) => thread.id === activeThreadId),
    [activeThreadId, threads],
  );
  const messages = activeThread?.messages || [];
  const filteredThreads = useMemo(
    () =>
      sortThreads(threads).filter((thread) =>
        matchesConversationFilter(thread, searchQuery, conversationFilter),
      ),
    [conversationFilter, searchQuery, threads],
  );

  useEffect(() => {
    threadsRef.current = threads;
  }, [threads]);

  useEffect(() => {
    if (auth.authStatus === "checking") return;

    let mounted = true;

    async function loadConversations() {
      setHydrated(false);

      try {
        const localThreads = await loadLocalConversations();
        const fallbackThreads =
          localThreads.length > 0 ? localThreads : threadsRef.current;
        const savedThreads =
          auth.authStatus === "authenticated" && auth.accessToken
            ? await loadAccountConversations(auth.accessToken).then(
                (accountThreads) =>
                  accountThreads.length > 0 ? accountThreads : fallbackThreads,
              )
            : fallbackThreads;

        if (!mounted) return;
        setThreads(savedThreads);
        setActiveThreadId(savedThreads[0]?.id || "");
      } catch {
        if (!mounted) return;
        const fallbackThreads = threadsRef.current;
        setThreads(fallbackThreads);
        setActiveThreadId(fallbackThreads[0]?.id || "");
        setNotice(
          auth.authStatus === "authenticated"
            ? "Could not load account conversations."
            : "Could not load saved conversations.",
        );
      } finally {
        if (mounted) setHydrated(true);
      }
    }

    void loadConversations();

    return () => {
      mounted = false;
    };
  }, [auth.accessToken, auth.authStatus, auth.sessionUser?.uid]);

  useEffect(() => {
    if (!hydrated || isTyping || !preferences.saveConversations) return;

    const timeout = setTimeout(() => {
      saveLocalConversations(threads).catch(() => {
        setNotice("Could not save conversations.");
      });

      if (auth.authStatus === "authenticated" && auth.accessToken) {
        saveAccountConversations(auth.accessToken, threads).catch(() => {
          setNotice("Could not sync account conversations.");
        });
      }
    }, 600);

    return () => clearTimeout(timeout);
  }, [
    auth.accessToken,
    auth.authStatus,
    hydrated,
    isTyping,
    preferences.saveConversations,
    threads,
  ]);

  useEffect(() => {
    if (auth.authNotice) setNotice(auth.authNotice);
  }, [auth.authNotice]);

  useEffect(() => {
    if (!preferences.autoScroll || messages.length === 0) return;

    const timeout = setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 80);

    return () => clearTimeout(timeout);
  }, [messages.length, preferences.autoScroll]);

  const actions = useQuantumChatActions({
    accessToken: auth.accessToken,
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
    onOpenAccount: auth.openAccount,
    onSignIn: auth.signIn,
    onSignOut: auth.signOut,
  });

  return {
    activeThread,
    activeThreadId,
    attachments,
    conversationFilter,
    copiedId,
    filteredThreads,
    hydrated,
    input,
    isTyping,
    listRef,
    messages,
    notice,
    preferences,
    searchQuery,
    selectedModel,
    settingsOpen,
    sidebarOpen,
    threads,
    webSearchEnabled,
    actions,
    authStatus: auth.authStatus,
    sessionUser: auth.sessionUser,
  };
}
