import { Linking, Pressable, StyleSheet, Text, View } from "react-native";

import { readableHost } from "@/lib/quantumPresentation";
import type { MessageSource } from "@/types/quantum";

export function SourceCards({ sources }: { sources: MessageSource[] }) {
  return (
    <View style={styles.sourcesBlock}>
      <Text style={styles.sourcesTitle}>Sources</Text>
      {sources.slice(0, 6).map((source, index) => (
        <Pressable
          key={`${source.uri}-${index}`}
          onPress={() => void Linking.openURL(source.uri)}
          style={styles.sourceCard}
        >
          <Text style={styles.sourceNumber}>{index + 1}</Text>
          <View style={styles.sourceTextBlock}>
            <Text numberOfLines={1} style={styles.sourceTitle}>
              {source.title || readableHost(source.uri)}
            </Text>
            <Text numberOfLines={1} style={styles.sourceHost}>
              {readableHost(source.uri)}
            </Text>
          </View>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  sourceCard: {
    alignItems: "center",
    backgroundColor: "rgba(138, 180, 248, 0.08)",
    borderColor: "rgba(138, 180, 248, 0.18)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 9,
  },
  sourceHost: {
    color: "#8a93a5",
    fontSize: 10,
  },
  sourceNumber: {
    backgroundColor: "rgba(138, 180, 248, 0.16)",
    borderRadius: 999,
    color: "#8ab4f8",
    fontSize: 11,
    fontWeight: "900",
    height: 23,
    lineHeight: 23,
    textAlign: "center",
    width: 23,
  },
  sourceTextBlock: {
    flex: 1,
  },
  sourceTitle: {
    color: "#edf1f7",
    fontSize: 12,
    fontWeight: "800",
  },
  sourcesBlock: {
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    borderTopWidth: 1,
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
  },
  sourcesTitle: {
    color: "#8a93a5",
    fontSize: 12,
    fontWeight: "900",
  },
});
