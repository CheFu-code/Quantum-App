import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuantumIcon } from "@/components/QuantumIcon";
import { QuantumLogo } from "@/components/QuantumLogo";
import { IconButton } from "@/components/quantum/IconButton";
import { CONVERSATION_FILTERS } from "@/constants/quantumUi";
import { formatTime } from "@/lib/conversations";
import type { ChatThread, ConversationFilter } from "@/types/quantum";

export function ConversationDrawer({
  activeThreadId,
  filter,
  open,
  searchQuery,
  threads,
  totalThreads,
  onClose,
  onDeleteThread,
  onFilterChange,
  onNewConversation,
  onOpenSettings,
  onSearchChange,
  onSelectThread,
  onToggleStar,
}: {
  activeThreadId: string;
  filter: ConversationFilter;
  open: boolean;
  searchQuery: string;
  threads: ChatThread[];
  totalThreads: number;
  onClose: () => void;
  onDeleteThread: (threadId: string) => void;
  onFilterChange: (filter: ConversationFilter) => void;
  onNewConversation: () => void;
  onOpenSettings: () => void;
  onSearchChange: (value: string) => void;
  onSelectThread: (threadId: string) => void;
  onToggleStar: (threadId: string) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open}>
      <View style={styles.modalOverlay}>
        <SafeAreaView edges={["top", "bottom"]} style={styles.drawer}>
          <View style={styles.drawerHeader}>
            <QuantumLogo size={36} />
            <View style={styles.drawerTitleBlock}>
              <Text style={styles.drawerTitle}>Conversations</Text>
              <Text style={styles.drawerSubtitle}>
                {totalThreads} conversation{totalThreads === 1 ? "" : "s"}
              </Text>
            </View>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          <View style={styles.drawerActionButtons}>
            <Pressable onPress={onNewConversation} style={styles.newThreadButton}>
              <QuantumIcon color="#0d0f14" name="add" size={17} />
              <Text style={styles.newThreadText}>New conversation</Text>
            </Pressable>
            <Pressable onPress={onOpenSettings} style={styles.settingsButton}>
              <QuantumIcon color="#8ab4f8" name="settings" size={17} />
              <Text style={styles.settingsButtonText}>Settings</Text>
            </Pressable>
          </View>
          <View style={styles.searchBox}>
            <QuantumIcon color="#8a93a5" name="search" size={16} />
            <TextInput
              onChangeText={onSearchChange}
              placeholder="Search conversations"
              placeholderTextColor="#697386"
              style={styles.searchInput}
              value={searchQuery}
            />
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.filterRail}
          >
            {CONVERSATION_FILTERS.map((item) => (
              <Pressable
                key={item.id}
                onPress={() => onFilterChange(item.id)}
                style={[
                  styles.filterChip,
                  filter === item.id && styles.activeFilterChip,
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    filter === item.id && styles.activeFilterChipText,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <ScrollView style={styles.threadList}>
            {threads.length === 0 ? (
              <Text style={styles.emptyThreadText}>No conversations found.</Text>
            ) : (
              threads.map((thread) => (
                <View
                  key={thread.id}
                  style={[
                    styles.threadItem,
                    activeThreadId === thread.id && styles.activeThreadItem,
                  ]}
                >
                  <Pressable
                    onPress={() => onSelectThread(thread.id)}
                    style={styles.threadMain}
                  >
                    <Text numberOfLines={1} style={styles.threadTitle}>
                      {thread.title}
                    </Text>
                    <Text numberOfLines={2} style={styles.threadPreview}>
                      {thread.preview || "New conversation"}
                    </Text>
                    <Text style={styles.threadTime}>
                      {formatTime(thread.timestamp)}
                    </Text>
                  </Pressable>
                  <View style={styles.threadActions}>
                    <IconButton
                      icon={thread.starred ? "starFilled" : "star"}
                      label="Star"
                      onPress={() => onToggleStar(thread.id)}
                      tint={thread.starred ? "#fdd663" : "#8a93a5"}
                    />
                    <IconButton
                      icon="delete"
                      label="Delete"
                      onPress={() => onDeleteThread(thread.id)}
                      tint="#f28b82"
                    />
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
        <Pressable onPress={onClose} style={styles.drawerDismiss} />
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  activeFilterChip: {
    backgroundColor: "rgba(138, 180, 248, 0.16)",
    borderColor: "#8ab4f8",
  },
  activeFilterChipText: {
    color: "#8ab4f8",
  },
  activeThreadItem: {
    borderColor: "rgba(138, 180, 248, 0.55)",
  },
  drawer: {
    backgroundColor: "#10141b",
    borderRightColor: "rgba(255, 255, 255, 0.08)",
    borderRightWidth: 1,
    maxWidth: 390,
    minWidth: 318,
    paddingHorizontal: 14,
    width: "82%",
  },
  drawerActionButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 13,
  },
  drawerDismiss: {
    flex: 1,
  },
  drawerHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingBottom: 16,
    paddingTop: 8,
  },
  drawerSubtitle: {
    color: "#8a93a5",
    fontSize: 11,
  },
  drawerTitle: {
    color: "#f4f7fb",
    fontSize: 18,
    fontWeight: "800",
  },
  drawerTitleBlock: {
    flex: 1,
  },
  emptyThreadText: {
    color: "#8a93a5",
    fontSize: 13,
    padding: 18,
    textAlign: "center",
  },
  filterChip: {
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    borderWidth: 1,
    marginRight: 8,
    paddingHorizontal: 13,
    paddingVertical: 8,
  },
  filterChipText: {
    color: "#8a93a5",
    fontSize: 12,
    fontWeight: "700",
  },
  filterRail: {
    flexGrow: 0,
    marginBottom: 12,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    flexDirection: "row",
  },
  newThreadButton: {
    alignItems: "center",
    backgroundColor: "#8ab4f8",
    borderRadius: 15,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 13,
  },
  newThreadText: {
    color: "#0d0f14",
    fontSize: 14,
    fontWeight: "900",
  },
  searchBox: {
    alignItems: "center",
    backgroundColor: "#171b23",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
    paddingHorizontal: 11,
  },
  searchInput: {
    color: "#f4f7fb",
    flex: 1,
    fontSize: 14,
    minHeight: 42,
  },
  settingsButton: {
    alignItems: "center",
    backgroundColor: "rgba(138, 180, 248, 0.1)",
    borderColor: "#8ab4f8",
    borderRadius: 15,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    padding: 13,
  },
  settingsButtonText: {
    color: "#8ab4f8",
    fontSize: 14,
    fontWeight: "900",
  },
  threadActions: {
    alignItems: "center",
    gap: 6,
  },
  threadItem: {
    backgroundColor: "#171b23",
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    marginBottom: 10,
    padding: 10,
  },
  threadList: {
    flex: 1,
  },
  threadMain: {
    flex: 1,
    minHeight: 76,
  },
  threadPreview: {
    color: "#8a93a5",
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
  },
  threadTime: {
    color: "#647084",
    fontSize: 10,
    marginTop: 8,
  },
  threadTitle: {
    color: "#f4f7fb",
    fontSize: 14,
    fontWeight: "800",
  },
});
