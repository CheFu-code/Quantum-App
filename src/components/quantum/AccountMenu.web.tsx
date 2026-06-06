import { CheFuUserDropdown } from "chefu-ui";
import { Modal, Pressable, StyleSheet, View } from "react-native";

import { CHEFU_ACCOUNT_MANAGE_HREF } from "@/constants/quantum";
import type { SessionUser } from "@/types/quantum";

export function AccountMenu({
  open,
  user,
  onClose,
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

  return (
    <Modal animationType="fade" transparent visible={open}>
      <Pressable accessibilityLabel="Close account menu" onPress={onClose} style={styles.overlay}>
        <View style={styles.menu}>
          <CheFuUserDropdown
            accountHref={CHEFU_ACCOUNT_MANAGE_HREF}
            actions={[
              {
                label: "Quantum settings",
                onClick: () => {
                  onClose();
                  onOpenSettings();
                },
              },
            ]}
            menuPlacement="bottom"
            onSignOut={() => {
              onClose();
              onSignOut();
            }}
            showUserDetails
            user={{
              displayName: user.displayName,
              email: user.email,
              photoURL: user.photoURL,
            }}
            variant="neutral"
          />
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menu: {
    alignItems: "flex-end",
    marginRight: 12,
    marginTop: 64,
  },
  overlay: {
    backgroundColor: "rgba(2, 6, 14, 0.52)",
    flex: 1,
  },
});
