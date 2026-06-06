import * as SecureStore from "expo-secure-store";

const ONBOARDING_KEY = "quantum-app-onboarding-complete";

export async function hasCompletedOnboarding() {
  if (!(await canUseSecureStore())) return false;

  return (await SecureStore.getItemAsync(ONBOARDING_KEY)) === "true";
}

export async function markOnboardingComplete() {
  if (!(await canUseSecureStore())) return;

  await SecureStore.setItemAsync(ONBOARDING_KEY, "true");
}

async function canUseSecureStore() {
  try {
    return await SecureStore.isAvailableAsync();
  } catch {
    return false;
  }
}
