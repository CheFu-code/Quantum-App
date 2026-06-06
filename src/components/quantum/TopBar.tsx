import { Image } from "expo-image";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { QuantumLogo } from "@/components/QuantumLogo";
import { IconButton } from "@/components/quantum/IconButton";
import { MODELS, type QuantumModel } from "@/constants/quantum";
import type { AuthStatus, ChatThread, SessionUser } from "@/types/quantum";

export function TopBar({
  activeThread,
  authStatus,
  conversationCount,
  isTyping,
  selectedModel,
  sessionUser,
  onNewConversation,
  onAccountPress,
  onOpenSettings,
  onOpenSidebar,
  onSelectModel,
}: {
  activeThread?: ChatThread;
  authStatus: AuthStatus;
  conversationCount: number;
  isTyping: boolean;
  selectedModel: QuantumModel;
  sessionUser: SessionUser | null;
  onNewConversation: () => void;
  onAccountPress: () => void;
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
  onSelectModel: (model: QuantumModel) => void;
}) {
  const subtitle = isTyping
    ? "Thinking"
    : authStatus === "checking"
      ? "Checking account"
      : authStatus === "authenticated" && sessionUser
        ? sessionUser.email
        : conversationCount > 0
          ? `${conversationCount} guest chat${conversationCount === 1 ? "" : "s"}`
          : "Guest mode";

  return (
    <View style={styles.topBar}>
      <View style={styles.topRow}>
        <IconButton icon="menu" label="Conversations" onPress={onOpenSidebar} />
        <QuantumLogo size={34} />
        <View style={styles.topTitleBlock}>
          <Text numberOfLines={1} style={styles.appTitle}>
            {activeThread?.title || "Quantum"}
          </Text>
          <Text numberOfLines={1} style={styles.appSubtitle}>
            {subtitle}
          </Text>
        </View>
        <IconButton icon="add" label="New" onPress={onNewConversation} />
        {authStatus === "authenticated" && sessionUser ? (
          <Pressable
            accessibilityLabel="Open account menu"
            onPress={onAccountPress}
            style={styles.avatarButton}
          >
            {sessionUser.photoURL ? (
              <Image
                contentFit="cover"
                source={{ uri: sessionUser.photoURL }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{getInitials(sessionUser)}</Text>
            )}
          </Pressable>
        ) : (
          <IconButton
            icon="account"
            label={authStatus === "checking" ? "Checking account" : "Sign in"}
            onPress={onAccountPress}
            tint="#8ab4f8"
          />
        )}
        <IconButton icon="settings" label="Settings" onPress={onOpenSettings} />
      </View>
      <ScrollView
        contentContainerStyle={styles.modelRailContent}
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.modelRail}
      >
        {MODELS.map((model) => (
          <Pressable
            key={model.id}
            onPress={() => onSelectModel(model)}
            style={[
              styles.modelChip,
              selectedModel.id === model.id && {
                borderColor: model.color,
                backgroundColor: `${model.color}1f`,
              },
            ]}
          >
            <Text
              style={[
                styles.modelChipText,
                selectedModel.id === model.id && { color: model.color },
              ]}
            >
              {model.badge}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  appSubtitle: {
    color: "#8a93a5",
    fontSize: 11,
    marginTop: 1,
  },
  appTitle: {
    color: "#f4f7fb",
    fontSize: 16,
    fontWeight: "800",
  },
  avatarButton: {
    alignItems: "center",
    backgroundColor: "rgba(129, 201, 149, 0.1)",
    borderColor: "rgba(129, 201, 149, 0.24)",
    borderRadius: 12,
    borderWidth: 1,
    height: 39,
    justifyContent: "center",
    overflow: "hidden",
    width: 39,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  avatarText: {
    color: "#f4f7fb",
    fontSize: 12,
    fontWeight: "900",
  },
  modelChip: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    borderWidth: 1,
    height: 28,
    justifyContent: "center",
    paddingHorizontal: 10,
  },
  modelChipText: {
    color: "#8a93a5",
    fontSize: 11,
    fontWeight: "800",
  },
  modelRail: {
    marginTop: 2,
    maxHeight: 32,
    width: "100%",
  },
  modelRailContent: {
    gap: 7,
    paddingBottom: 8,
    paddingHorizontal: 12,
  },
  topBar: {
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    borderBottomWidth: 1,
    minHeight: 96,
    paddingTop: 8,
  },
  topRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 12,
  },
  topTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
});

function getInitials(user: SessionUser) {
  const source = user.displayName || user.email || "CheFu";
  const parts = source
    .replace(/@.*/, "")
    .split(/\s+|[._-]/)
    .filter(Boolean)
    .slice(0, 2);

  return (parts.map((part) => part[0]).join("") || "C").toUpperCase();
}
