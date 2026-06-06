import { StatusBar } from "expo-status-bar";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  type ListRenderItemInfo,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ChatComposer } from "@/components/quantum/ChatComposer";
import { AccountMenu } from "@/components/quantum/AccountMenu";
import { ConversationDrawer } from "@/components/quantum/ConversationDrawer";
import { EmptyState } from "@/components/quantum/EmptyState";
import { MessageBubble } from "@/components/quantum/MessageBubble";
import { QuantumOnboarding } from "@/components/quantum/QuantumOnboarding";
import { SettingsSheet } from "@/components/quantum/SettingsSheet";
import { TopBar } from "@/components/quantum/TopBar";
import { QUANTUM_CHAT_API_URL } from "@/constants/quantum";
import { useQuantumChat } from "@/hooks/useQuantumChat";
import {
  hasCompletedOnboarding,
  markOnboardingComplete,
} from "@/lib/onboarding";
import type { Message } from "@/types/quantum";

export default function Index() {
  const chat = useQuantumChat();
  const { actions } = chat;
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [onboardingVisible, setOnboardingVisible] = useState(false);

  useEffect(() => {
    let mounted = true;

    hasCompletedOnboarding()
      .then((completed) => {
        if (mounted && !completed) setOnboardingVisible(true);
      })
      .catch(() => {
        if (mounted) setOnboardingVisible(true);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const completeOnboarding = useCallback(() => {
    setOnboardingVisible(false);
    void markOnboardingComplete();
  }, []);

  const renderMessage = useCallback(
    ({ item }: ListRenderItemInfo<Message>) => (
      <MessageBubble
        copied={chat.copiedId === item.id}
        compact={chat.preferences.compactMessages}
        message={item}
        onCopy={actions.copyMessage}
        onFeedback={actions.rateMessage}
        onRegenerate={actions.regenerateResponse}
        showTimestamps={chat.preferences.showTimestamps}
      />
    ),
    [
      actions.copyMessage,
      actions.rateMessage,
      actions.regenerateResponse,
      chat.copiedId,
      chat.preferences.compactMessages,
      chat.preferences.showTimestamps,
    ],
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.root}
    >
      <StatusBar style="light" />
      <SafeAreaView edges={["top", "left", "right"]} style={styles.safeArea}>
        <TopBar
          activeThread={chat.activeThread}
          authStatus={chat.authStatus}
          conversationCount={chat.threads.length}
          isTyping={chat.isTyping}
          selectedModel={chat.selectedModel}
          sessionUser={chat.sessionUser}
          onNewConversation={actions.startNewConversation}
          onAccountPress={() => {
            if (chat.authStatus === "authenticated") {
              setAccountMenuOpen(true);
              return;
            }

            void actions.openLogin();
          }}
          onOpenSettings={() => actions.setSettingsOpen(true)}
          onOpenSidebar={() => actions.setSidebarOpen(true)}
          onSelectModel={actions.setSelectedModel}
        />

        <FlatList
          ref={chat.listRef}
          contentContainerStyle={[
            styles.messagesContent,
            chat.messages.length === 0 && styles.emptyMessagesContent,
          ]}
          data={chat.messages}
          keyExtractor={(item) => item.id}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            chat.hydrated ? (
              <EmptyState
                isLoading={false}
                onSuggestion={(suggestion) => actions.setInput(suggestion)}
              />
            ) : (
              <EmptyState isLoading onSuggestion={() => undefined} />
            )
          }
          renderItem={renderMessage}
        />

        <ChatComposer
          attachments={chat.attachments}
          input={chat.input}
          isTyping={chat.isTyping}
          notice={chat.notice}
          preferences={chat.preferences}
          webSearchEnabled={chat.webSearchEnabled}
          onAttach={actions.pickFiles}
          onInputChange={actions.setInput}
          onRemoveAttachment={actions.removeAttachment}
          onSend={() => void actions.sendMessage()}
          onStop={actions.stopResponse}
          onToggleCode={() =>
            actions.updatePreference(
              "codeExecution",
              !chat.preferences.codeExecution,
            )
          }
          onToggleMaps={() =>
            actions.updatePreference(
              "mapsGrounding",
              !chat.preferences.mapsGrounding,
            )
          }
          onToggleUrl={() =>
            actions.updatePreference("urlContext", !chat.preferences.urlContext)
          }
          onToggleWebSearch={() =>
            actions.setWebSearchEnabled(!chat.webSearchEnabled)
          }
        />
      </SafeAreaView>

      <ConversationDrawer
        activeThreadId={chat.activeThreadId}
        filter={chat.conversationFilter}
        open={chat.sidebarOpen}
        searchQuery={chat.searchQuery}
        threads={chat.filteredThreads}
        totalThreads={chat.threads.length}
        onClose={() => actions.setSidebarOpen(false)}
        onDeleteThread={actions.confirmDeleteThread}
        onFilterChange={actions.setConversationFilter}
        onNewConversation={actions.startNewConversation}
        onSearchChange={actions.setSearchQuery}
        onSelectThread={(threadId) => {
          actions.setActiveThreadId(threadId);
          actions.setSidebarOpen(false);
        }}
        onToggleStar={actions.toggleThreadStar}
      />

      <SettingsSheet
        authStatus={chat.authStatus}
        endpoint={QUANTUM_CHAT_API_URL}
        open={chat.settingsOpen}
        preferences={chat.preferences}
        selectedModel={chat.selectedModel}
        sessionUser={chat.sessionUser}
        threadsCount={chat.threads.length}
        webSearchEnabled={chat.webSearchEnabled}
        onClearConversations={actions.clearConversations}
        onClose={() => actions.setSettingsOpen(false)}
        onManageAccount={() => void actions.openAccount()}
        onPreferenceChange={actions.updatePreference}
        onResetPreferences={actions.resetPreferences}
        onSelectModel={actions.setSelectedModel}
        onSignIn={() => void actions.openLogin()}
        onSignOut={() => void actions.signOut()}
        onWebSearchChange={actions.setWebSearchEnabled}
      />

      <AccountMenu
        open={accountMenuOpen}
        user={chat.sessionUser}
        onClose={() => setAccountMenuOpen(false)}
        onManageAccount={() => void actions.openAccount()}
        onOpenSettings={() => actions.setSettingsOpen(true)}
        onSignOut={() => void actions.signOut()}
      />

      <QuantumOnboarding
        visible={onboardingVisible}
        onDone={completeOnboarding}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  emptyMessagesContent: {
    flexGrow: 1,
  },
  messagesContent: {
    paddingHorizontal: 13,
    paddingTop: 10,
  },
  root: {
    backgroundColor: "#0d0f14",
    flex: 1,
  },
  safeArea: {
    backgroundColor: "#0d0f14",
    flex: 1,
  },
});
