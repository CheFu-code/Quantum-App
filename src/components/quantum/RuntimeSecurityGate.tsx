import { LinearGradient } from "expo-linear-gradient";
import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuantumLogo } from "@/components/QuantumLogo";

export function RuntimeSecurityGate({
  reasons,
}: {
  reasons: string[];
}) {
  return (
    <LinearGradient colors={["#07111f", "#0d0f14"]} style={styles.root}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.card}>
          <QuantumLogo size={62} />
          <Text style={styles.title}>Quantum is locked</Text>
          <Text style={styles.body}>
            This device failed runtime security checks, so local session data has
            been cleared to protect your account.
          </Text>
          <View style={styles.reasonBox}>
            {(reasons.length ? reasons : ["Device security could not be verified."]).map(
              (reason) => (
                <Text key={reason} style={styles.reasonText}>
                  {reason}
                </Text>
              ),
            )}
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#aab8d3",
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
    textAlign: "center",
  },
  card: {
    alignItems: "center",
    borderColor: "rgba(242, 139, 130, 0.28)",
    borderRadius: 22,
    borderWidth: 1,
    margin: 18,
    padding: 22,
  },
  reasonBox: {
    backgroundColor: "rgba(242, 139, 130, 0.1)",
    borderRadius: 14,
    gap: 7,
    marginTop: 18,
    padding: 12,
    width: "100%",
  },
  reasonText: {
    color: "#f28b82",
    fontSize: 12,
    fontWeight: "800",
    lineHeight: 17,
  },
  root: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    justifyContent: "center",
  },
  title: {
    color: "#f4f7fb",
    fontSize: 25,
    fontWeight: "900",
    marginTop: 18,
    textAlign: "center",
  },
});
