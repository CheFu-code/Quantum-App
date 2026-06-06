import { useRouter } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";

export default function AuthCallbackScreen() {
  const router = useRouter();

  useEffect(() => {
    const timeout = setTimeout(() => {
      router.replace("/");
    }, 250);

    return () => clearTimeout(timeout);
  }, [router]);

  return (
    <View style={styles.root}>
      <ActivityIndicator color="#8AB4F8" size="large" />
      <Text style={styles.title}>Completing sign in</Text>
      <Text style={styles.body}>Returning you to Quantum...</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    color: "#AAB8D3",
    fontSize: 14,
    marginTop: 8,
  },
  root: {
    alignItems: "center",
    backgroundColor: "#07111F",
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#F4F8FF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 18,
  },
});
