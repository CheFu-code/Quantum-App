import { Image } from "expo-image";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { QuantumIcon } from "@/components/QuantumIcon";
import type { SessionUser } from "@/types/quantum";

export function AccountMenu({
  open,
  user,
  onClose,
  onManageAccount,
  onOpenSettings,
  onSignOut,
}: {
  open: boolean;
  user: SessionUser | null;
  onClose: () => void;
  onManageAccount: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
}) {
  if (!user) return null;

  const displayName = user.displayName || "CheFu Account";

  function closeThen(action: () => void) {
    onClose();
    action();
  }

  return (
    <Modal animationType="fade" transparent visible={open}>
      <Pressable accessibilityLabel="Close account menu" onPress={onClose} style={styles.overlay}>
        <Pressable style={styles.menu}>
          <View style={styles.userRow}>
            <View style={styles.avatar}>
              {user.photoURL ? (
                <Image
                  contentFit="cover"
                  source={{ uri: user.photoURL }}
                  style={styles.avatarImage}
                />
              ) : (
                <Text style={styles.avatarText}>{getInitials(user)}</Text>
              )}
            </View>
            <View style={styles.userTextBlock}>
              <Text numberOfLines={1} style={styles.userName}>
                {displayName}
              </Text>
              <Text numberOfLines={1} style={styles.userEmail}>
                {user.email}
              </Text>
            </View>
          </View>
          <View style={styles.separator} />
          <MenuAction
            icon="account"
            label="Manage account"
            onPress={() => closeThen(onManageAccount)}
          />
          <MenuAction
            icon="settings"
            label="Quantum settings"
            onPress={() => closeThen(onOpenSettings)}
          />
          <View style={styles.separator} />
          <MenuAction
            danger
            icon="close"
            label="Sign out"
            onPress={() => closeThen(onSignOut)}
          />
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenuAction({
  danger = false,
  icon,
  label,
  onPress,
}: {
  danger?: boolean;
  icon: "account" | "close" | "settings";
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.actionRow}>
      <View style={[styles.actionIcon, danger && styles.dangerIcon]}>
        <QuantumIcon color={danger ? "#fca5a5" : "#d6dbe6"} name={icon} size={17} />
      </View>
      <Text style={[styles.actionLabel, danger && styles.dangerText]}>{label}</Text>
    </Pressable>
  );
}

function getInitials(user: SessionUser) {
  const source = user.displayName || user.email || "CheFu";
  const parts = source
    .replace(/@.*/, "")
    .split(/\s+|[._-]/)
    .filter(Boolean)
    .slice(0, 2);

  return (parts.map((part) => part[0]).join("") || "C").toUpperCase();
}

const styles = StyleSheet.create({
  actionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  actionLabel: {
    color: "#f4f7fb",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  actionRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 11,
    minHeight: 48,
    paddingHorizontal: 8,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "#1d2635",
    borderColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 23,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    overflow: "hidden",
    width: 46,
  },
  avatarImage: {
    height: "100%",
    width: "100%",
  },
  avatarText: {
    color: "#f4f7fb",
    fontSize: 16,
    fontWeight: "900",
  },
  dangerIcon: {
    backgroundColor: "rgba(248, 113, 113, 0.12)",
  },
  dangerText: {
    color: "#fca5a5",
  },
  menu: {
    alignSelf: "flex-end",
    backgroundColor: "#101722",
    borderColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 22,
    borderWidth: 1,
    marginRight: 12,
    marginTop: 64,
    maxWidth: 320,
    padding: 10,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 22,
    width: "82%",
  },
  overlay: {
    backgroundColor: "rgba(2, 6, 14, 0.52)",
    flex: 1,
  },
  separator: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    height: 1,
    marginVertical: 8,
  },
  userEmail: {
    color: "#8a93a5",
    fontSize: 12,
    marginTop: 2,
  },
  userName: {
    color: "#f4f7fb",
    fontSize: 15,
    fontWeight: "800",
  },
  userRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    padding: 8,
  },
  userTextBlock: {
    flex: 1,
    minWidth: 0,
  },
});
