import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { QuantumLogo } from "@/components/QuantumLogo";
import { IconButton } from "@/components/quantum/IconButton";
import { MODELS, type QuantumModel } from "@/constants/quantum";
import type { AuthStatus, SessionUser } from "@/types/quantum";

export function TopBar({
  authStatus,
  conversationCount,
  isTyping,
  selectedModel,
  sessionUser,
  onNewConversation,
  onAccountPress,
  onOpenSidebar,
  onSelectModel,
}: {
  authStatus: AuthStatus;
  conversationCount: number;
  isTyping: boolean;
  selectedModel: QuantumModel;
  sessionUser: SessionUser | null;
  onNewConversation: () => void;
  onAccountPress: () => void;
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
            Quantum
          </Text>
          <Text numberOfLines={1} style={styles.appSubtitle}>
            {subtitle}
          </Text>
        </View>
        <IconButton icon="add" label="New" onPress={onNewConversation} />
        <IconButton
          icon="account"
          label={authStatus === "authenticated" ? "Account" : "Sign in"}
          onPress={onAccountPress}
          tint={authStatus === "authenticated" ? "#81c995" : "#8ab4f8"}
        />
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
