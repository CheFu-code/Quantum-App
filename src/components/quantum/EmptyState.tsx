import { LinearGradient } from "expo-linear-gradient";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

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
        <ActivityIndicator color="#8ab4f8" />
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
