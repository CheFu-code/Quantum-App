import { Pressable, StyleSheet, Text } from "react-native";

import { QuantumIcon, type QuantumIconName } from "@/components/QuantumIcon";

export function ToolChip({
  active,
  icon,
  label,
  tint,
  onPress,
}: {
  active: boolean;
  icon: QuantumIconName;
  label: string;
  tint: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.toolChip,
        active && { backgroundColor: `${tint}1f`, borderColor: tint },
      ]}
    >
      <QuantumIcon color={active ? tint : "#8a93a5"} name={icon} size={15} />
      <Text style={[styles.toolChipText, active && { color: tint }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  toolChip: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 6,
    marginRight: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  toolChipText: {
    color: "#8a93a5",
    fontSize: 12,
    fontWeight: "800",
  },
});
