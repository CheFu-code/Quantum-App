import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { QuantumLogo } from "@/components/QuantumLogo";
import { IconButton } from "@/components/quantum/IconButton";
import { MODELS, type QuantumModel } from "@/constants/quantum";
import type { ChatThread } from "@/types/quantum";

export function TopBar({
  activeThread,
  conversationCount,
  isTyping,
  selectedModel,
  onNewConversation,
  onOpenSettings,
  onOpenSidebar,
  onSelectModel,
}: {
  activeThread?: ChatThread;
  conversationCount: number;
  isTyping: boolean;
  selectedModel: QuantumModel;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  onOpenSidebar: () => void;
  onSelectModel: (model: QuantumModel) => void;
}) {
  return (
    <View style={styles.topBar}>
      <IconButton icon="menu" label="Conversations" onPress={onOpenSidebar} />
      <QuantumLogo size={34} />
      <View style={styles.topTitleBlock}>
        <Text numberOfLines={1} style={styles.appTitle}>
          {activeThread?.title || "Quantum"}
        </Text>
        <Text numberOfLines={1} style={styles.appSubtitle}>
          {isTyping ? "Thinking" : `${conversationCount} local chats`}
        </Text>
      </View>
      <IconButton icon="add" label="New" onPress={onNewConversation} />
      <IconButton icon="settings" label="Settings" onPress={onOpenSettings} />
      <ScrollView
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
    marginLeft: 6,
    paddingHorizontal: 10,
  },
  modelChipText: {
    color: "#8a93a5",
    fontSize: 11,
    fontWeight: "800",
  },
  modelRail: {
    display: "none",
  },
  topBar: {
    alignItems: "center",
    borderBottomColor: "rgba(255, 255, 255, 0.06)",
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 62,
    paddingHorizontal: 12,
  },
  topTitleBlock: {
    flex: 1,
    minWidth: 0,
  },
});
