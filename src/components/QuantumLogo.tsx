import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";

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
      <LinearGradient
        colors={["#8ab4f8", "#c58af9", "#f28b82"]}
        end={{ x: 1, y: 1 }}
        start={{ x: 0, y: 0 }}
        style={[styles.gradient, { borderRadius: size * 0.35 }]}
      >
        <View
          style={[
            styles.inner,
            {
              borderRadius: size * 0.26,
              height: size * 0.72,
              width: size * 0.72,
            },
          ]}
        >
          <Text style={[styles.letter, { fontSize: size * 0.42 }]}>Q</Text>
          <View
            style={[
              styles.satellite,
              {
                height: size * 0.12,
                right: size * 0.14,
                top: size * 0.14,
                width: size * 0.12,
              },
            ]}
          />
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  gradient: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  inner: {
    alignItems: "center",
    backgroundColor: "rgba(13, 15, 20, 0.68)",
    borderColor: "rgba(255, 255, 255, 0.18)",
    borderWidth: 1,
    justifyContent: "center",
  },
  letter: {
    color: "#ffffff",
    fontWeight: "800",
    lineHeight: 24,
  },
  satellite: {
    backgroundColor: "#fdd663",
    borderRadius: 999,
    position: "absolute",
  },
  shell: {
    backgroundColor: "rgba(138, 180, 248, 0.2)",
    overflow: "hidden",
    shadowColor: "#8ab4f8",
    shadowOpacity: 0.28,
    shadowRadius: 18,
  },
});
