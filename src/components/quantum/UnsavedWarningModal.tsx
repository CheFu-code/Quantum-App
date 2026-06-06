import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export function UnsavedWarningModal({
  open,
  onProceed,
  onSignIn,
  onDismiss,
}: {
  open: boolean;
  onProceed: () => void;
  onSignIn: () => void;
  onDismiss: () => void;
}) {
  return (
    <Modal animationType="fade" transparent visible={open}>
      <View style={styles.overlay}>
        <SafeAreaView edges={["bottom"]} style={styles.container}>
          <Pressable onPress={onDismiss} style={styles.dismiss} />
          <View style={styles.card}>
            <Text style={styles.title}>Unsaved Conversation</Text>
            <Text style={styles.message}>
              Your current conversation will be lost if you create a new one without signing in. Sign in to save and access your conversations anytime.
            </Text>
            
            <View style={styles.actionContainer}>
              <Pressable
                onPress={() => {
                  onSignIn();
                  onDismiss();
                }}
                style={styles.primaryButton}
              >
                <Text style={styles.primaryButtonText}>Sign In / Sign Up</Text>
              </Pressable>
              
              <Pressable
                onPress={() => {
                  onProceed();
                }}
                style={styles.secondaryButton}
              >
                <Text style={styles.secondaryButtonText}>Continue Without Saving</Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  actionContainer: {
    gap: 10,
    marginTop: 20,
  },
  card: {
    backgroundColor: "#10141b",
    borderColor: "rgba(138, 180, 248, 0.22)",
    borderRadius: 20,
    borderWidth: 1,
    marginHorizontal: 16,
    padding: 20,
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  dismiss: {
    flex: 1,
  },
  message: {
    color: "#8a93a5",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 10,
  },
  overlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    flex: 1,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#8ab4f8",
    borderRadius: 14,
    justifyContent: "center",
    padding: 14,
  },
  primaryButtonText: {
    color: "#0d0f14",
    fontSize: 15,
    fontWeight: "900",
  },
  secondaryButton: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    borderWidth: 1,
    justifyContent: "center",
    padding: 14,
  },
  secondaryButtonText: {
    color: "#d6dbe6",
    fontSize: 15,
    fontWeight: "800",
  },
  title: {
    color: "#f4f7fb",
    fontSize: 18,
    fontWeight: "900",
  },
});
