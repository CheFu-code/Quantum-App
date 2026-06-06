import { Stack } from "expo-router";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { RuntimeSecurityGate } from "@/components/quantum/RuntimeSecurityGate";
import { useRuntimeSecurity } from "@/hooks/useRuntimeSecurity";

export default function RootLayout() {
  const runtimeSecurity = useRuntimeSecurity();

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        {runtimeSecurity.blocked ? (
          <RuntimeSecurityGate reasons={runtimeSecurity.reasons} />
        ) : (
          <Stack screenOptions={{ headerShown: false }} />
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
