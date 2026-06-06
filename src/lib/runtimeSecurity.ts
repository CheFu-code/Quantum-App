import * as Device from "expo-device";
import { Platform } from "react-native";

declare const __DEV__: boolean;

export type RuntimeSecurityVerdict =
  | {
      blocked: false;
      reasons: string[];
      status: "trusted" | "warning";
    }
  | {
      blocked: true;
      reasons: string[];
      status: "blocked";
    };

export async function evaluateRuntimeSecurity(): Promise<RuntimeSecurityVerdict> {
  const reasons: string[] = [];
  const rooted = await isRootedOrJailbroken();
  const insecureBuild = hasInsecureAndroidBuildTags();

  if (rooted) reasons.push("Root or jailbreak indicators were detected.");
  if (insecureBuild) reasons.push("The Android system build is signed with test keys.");
  if (!Device.isDevice) reasons.push("This app is running on an emulator or simulator.");

  const shouldBlock = rooted || (!__DEV__ && insecureBuild);

  if (shouldBlock) {
    return {
      blocked: true,
      reasons,
      status: "blocked",
    };
  }

  return {
    blocked: false,
    reasons,
    status: reasons.length > 0 ? "warning" : "trusted",
  };
}

async function isRootedOrJailbroken() {
  try {
    return await Device.isRootedExperimentalAsync();
  } catch {
    return false;
  }
}

function hasInsecureAndroidBuildTags() {
  if (Platform.OS !== "android") return false;

  const fingerprint = Device.osBuildFingerprint?.toLowerCase() || "";
  const buildId = Device.osBuildId?.toLowerCase() || "";

  return fingerprint.includes("test-keys") || buildId.includes("test-keys");
}
