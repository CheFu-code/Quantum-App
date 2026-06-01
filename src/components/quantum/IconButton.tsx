import { Pressable, StyleSheet } from "react-native";

import { QuantumIcon, type QuantumIconName } from "@/components/QuantumIcon";

export function IconButton({
  icon,
  label,
  tint = "#d6dbe6",
  onPress,
}: {
  icon: QuantumIconName;
  label: string;
  tint?: string;
  onPress: () => void;
}) {
  return (
    <Pressable accessibilityLabel={label} onPress={onPress} style={styles.iconBtn}>
      <QuantumIcon color={tint} name={icon} size={18} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconBtn: {
    alignItems: "center",
    backgroundColor: "rgba(100, 112, 132, 0.13)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 12,
    borderWidth: 1,
    height: 39,
    justifyContent: "center",
    width: 39,
  },
});
