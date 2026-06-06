import { StyleSheet, Text, View } from "react-native";

export function OfflineStatusBar({
  visible,
}: {
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.title}>No Internet Connection</Text>
      <Text style={styles.detail}>Reconnect to send messages or sync history.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#221a10",
    borderBottomColor: "rgba(251, 188, 5, 0.28)",
    borderBottomWidth: 1,
    borderTopColor: "rgba(251, 188, 5, 0.2)",
    borderTopWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 9,
  },
  detail: {
    color: "#d7b56d",
    fontSize: 12,
    lineHeight: 16,
    marginTop: 1,
  },
  title: {
    color: "#fbbc05",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
});
