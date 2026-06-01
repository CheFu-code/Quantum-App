import { Pressable, StyleSheet } from "react-native";

import { QuantumIcon, type QuantumIconName } from "@/components/QuantumIcon";

export function TinyAction({
  active,
  icon,
  label,
  onPress,
}: {
  active?: boolean;
  icon: QuantumIconName;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      onPress={onPress}
      style={[styles.tinyAction, active && styles.activeTinyAction]}
    >
      <QuantumIcon color={active ? "#8ab4f8" : "#8a93a5"} name={icon} size={14} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  activeTinyAction: {
    backgroundColor: "rgba(138, 180, 248, 0.12)",
  },
  tinyAction: {
    alignItems: "center",
    borderRadius: 9,
    height: 30,
    justifyContent: "center",
    width: 30,
  },
});
