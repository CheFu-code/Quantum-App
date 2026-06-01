import { StyleSheet, Switch, Text, View } from "react-native";

import { QuantumIcon, type QuantumIconName } from "@/components/QuantumIcon";

export function SwitchRow({
  icon,
  label,
  value,
  onValueChange,
}: {
  icon: QuantumIconName;
  label: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View style={styles.switchRow}>
      <QuantumIcon color={value ? "#8ab4f8" : "#8a93a5"} name={icon} size={18} />
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        onValueChange={onValueChange}
        thumbColor={value ? "#ffffff" : "#d6dbe6"}
        trackColor={{ false: "#28303d", true: "#8ab4f866" }}
        value={value}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  switchLabel: {
    color: "#edf1f7",
    flex: 1,
    fontSize: 14,
    fontWeight: "700",
  },
  switchRow: {
    alignItems: "center",
    backgroundColor: "rgba(100, 112, 132, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 8,
    minHeight: 52,
    paddingHorizontal: 12,
  },
});
