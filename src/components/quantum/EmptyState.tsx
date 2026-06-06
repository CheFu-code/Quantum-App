import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { QuantumIcon } from "@/components/QuantumIcon";
import { QuantumLogo } from "@/components/QuantumLogo";
import { SUGGESTIONS } from "@/constants/quantumUi";

export function EmptyState({
  isLoading,
  onSuggestion,
}: {
  isLoading: boolean;
  onSuggestion: (text: string) => void;
}) {
  if (isLoading) {
    return (
      <View style={styles.emptyState}>
        <View style={styles.skeletonLogo} />
        <View style={styles.skeletonTitle} />
        <View style={styles.skeletonSubtitle} />
        <View style={styles.skeletonGrid}>
          {[0, 1, 2].map((item) => (
            <View key={item} style={styles.skeletonSuggestion}>
              <View style={styles.skeletonIcon} />
              <View style={styles.skeletonLine} />
            </View>
          ))}
        </View>
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
      <View style={styles.suggestionsGrid}>
        {SUGGESTIONS.map((suggestion) => (
          <Pressable
            key={suggestion.label}
            onPress={() => onSuggestion(suggestion.label)}
            style={styles.suggestionButton}
          >
            <View
              style={[
                styles.suggestionIcon,
                { backgroundColor: `${suggestion.tint}18` },
              ]}
            >
              <QuantumIcon
                color={suggestion.tint}
                name={suggestion.icon}
                size={17}
              />
            </View>
            <Text numberOfLines={2} style={styles.suggestionLabel}>
              {suggestion.label}
            </Text>
            <QuantumIcon color="#647084" name="chevron" size={15} />
          </Pressable>
        ))}
      </View>
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
  skeletonGrid: {
    gap: 10,
    maxWidth: 520,
    width: "100%",
  },
  skeletonIcon: {
    backgroundColor: "rgba(138, 180, 248, 0.14)",
    borderRadius: 12,
    height: 34,
    width: 34,
  },
  skeletonLine: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    flex: 1,
    height: 13,
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
  skeletonSuggestion: {
    alignItems: "center",
    backgroundColor: "#171b23",
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    width: "100%",
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
  suggestionButton: {
    alignItems: "center",
    backgroundColor: "#171b23",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 58,
    paddingHorizontal: 12,
    width: "100%",
  },
  suggestionIcon: {
    alignItems: "center",
    borderRadius: 12,
    height: 34,
    justifyContent: "center",
    width: 34,
  },
  suggestionLabel: {
    color: "#edf1f7",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  suggestionsGrid: {
    gap: 10,
    maxWidth: 520,
    width: "100%",
  },
});
