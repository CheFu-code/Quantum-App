import { StyleSheet, Text } from "react-native";

export function SectionLabel({ label }: { label: string }) {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  sectionLabel: {
    color: "#8a93a5",
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 9,
    marginTop: 18,
    textTransform: "uppercase",
  },
});
