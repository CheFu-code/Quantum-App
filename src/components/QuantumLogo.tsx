import { Image } from "expo-image";
import { StyleSheet, View } from "react-native";

const QUANTUM_LOGO = require("../../assets/images/quantum-logo.png");

export function QuantumLogo({ size = 36 }: { size?: number }) {
  return (
    <View
      style={[
        styles.shell,
        {
          borderRadius: size * 0.35,
          height: size,
          width: size,
        },
      ]}
    >
      <Image
        accessibilityLabel="Quantum"
        contentFit="contain"
        source={QUANTUM_LOGO}
        style={styles.logo}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  logo: {
    height: "100%",
    width: "100%",
  },
  shell: {
    backgroundColor: "rgba(138, 180, 248, 0.06)",
    overflow: "hidden",
    shadowColor: "#8ab4f8",
    shadowOpacity: 0.34,
    shadowRadius: 16,
  },
});
