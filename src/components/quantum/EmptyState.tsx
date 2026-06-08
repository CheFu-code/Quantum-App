import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

import { QuantumLogo } from "@/components/QuantumLogo";

export function EmptyState({ isLoading }: { isLoading: boolean }) {
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.skeletonLogo} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
      </View>
    );
  }

  return (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={["rgba(138,180,248,0.18)", "rgba(197,138,249,0.16)"]}
        style={styles.emptyLogoFrame}
      >
        <QuantumLogo size={58} />
      </LinearGradient>
      <Text style={styles.emptyTitle}>Good to see you.</Text>
      <Text style={styles.emptySubtitle}>How can I help you today?</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyLogoFrame: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 26,
    borderWidth: 1,
    height: 86,
    justifyContent: "center",
    marginBottom: 18,
    width: 86,
  },
  skeletonLogo: {
    backgroundColor: "rgba(138, 180, 248, 0.12)",
    borderRadius: 26,
    height: 86,
    marginBottom: 22,
    width: 86,
  },
  skeletonSubtitle: {
    backgroundColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 999,
    height: 13,
    marginBottom: 24,
    width: 190,
  },
  skeletonTitle: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 999,
    height: 25,
    marginBottom: 10,
    width: 220,
  },
  emptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  emptySubtitle: {
    color: "#8a93a5",
    fontSize: 14,
    marginBottom: 22,
  },
  emptyTitle: {
    color: "#f4f7fb",
    fontSize: 26,
    fontWeight: "800",
    marginBottom: 5,
  },
});
