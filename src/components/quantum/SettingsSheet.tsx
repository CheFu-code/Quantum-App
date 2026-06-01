import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { IconButton } from "@/components/quantum/IconButton";
import { SectionLabel } from "@/components/quantum/SectionLabel";
import { SwitchRow } from "@/components/quantum/SwitchRow";
import {
  INFERENCE_TIERS,
  MODELS,
  RESPONSE_STYLES,
  type QuantumModel,
} from "@/constants/quantum";
import type { ChatPreferences, ServiceTier } from "@/types/quantum";

export function SettingsSheet({
  endpoint,
  open,
  preferences,
  selectedModel,
  threadsCount,
  webSearchEnabled,
  onClearConversations,
  onClose,
  onPreferenceChange,
  onResetPreferences,
  onSelectModel,
  onWebSearchChange,
}: {
  endpoint: string;
  open: boolean;
  preferences: ChatPreferences;
  selectedModel: QuantumModel;
  threadsCount: number;
  webSearchEnabled: boolean;
  onClearConversations: () => void;
  onClose: () => void;
  onPreferenceChange: <Key extends keyof ChatPreferences>(
    key: Key,
    value: ChatPreferences[Key],
  ) => void;
  onResetPreferences: () => void;
  onSelectModel: (model: QuantumModel) => void;
  onWebSearchChange: (value: boolean) => void;
}) {
  return (
    <Modal animationType="slide" transparent visible={open}>
      <View style={styles.sheetOverlay}>
        <Pressable onPress={onClose} style={styles.sheetDismiss} />
        <SafeAreaView edges={["bottom"]} style={styles.settingsSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle}>Settings</Text>
            <IconButton icon="close" label="Close" onPress={onClose} />
          </View>
          <ScrollView showsVerticalScrollIndicator={false}>
            <SectionLabel label="Model" />
            <View style={styles.segmentGroup}>
              {MODELS.map((model) => (
                <Pressable
                  key={model.id}
                  onPress={() => onSelectModel(model)}
                  style={[
                    styles.segmentButton,
                    selectedModel.id === model.id && {
                      backgroundColor: `${model.color}1f`,
                      borderColor: model.color,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      selectedModel.id === model.id && { color: model.color },
                    ]}
                  >
                    {model.badge}
                  </Text>
                </Pressable>
              ))}
            </View>

            <SectionLabel label="Tools" />
            <SwitchRow
              icon="globe"
              label="Search"
              value={webSearchEnabled}
              onValueChange={onWebSearchChange}
            />
            <SwitchRow
              icon="link"
              label="URL context"
              value={preferences.urlContext}
              onValueChange={(value) => onPreferenceChange("urlContext", value)}
            />
            <SwitchRow
              icon="code"
              label="Code execution"
              value={preferences.codeExecution}
              onValueChange={(value) =>
                onPreferenceChange("codeExecution", value)
              }
            />
            <SwitchRow
              icon="map"
              label="Maps"
              value={preferences.mapsGrounding}
              onValueChange={(value) =>
                onPreferenceChange("mapsGrounding", value)
              }
            />

            <SectionLabel label="Response" />
            <View style={styles.segmentGroup}>
              {RESPONSE_STYLES.map((style) => (
                <Pressable
                  key={style.id}
                  onPress={() => onPreferenceChange("responseStyle", style.id)}
                  style={[
                    styles.segmentButton,
                    preferences.responseStyle === style.id &&
                      styles.activeSegmentButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      preferences.responseStyle === style.id &&
                        styles.activeSegmentText,
                    ]}
                  >
                    {style.label}
                  </Text>
                </Pressable>
              ))}
            </View>
            <View style={styles.segmentGroup}>
              {INFERENCE_TIERS.map((tier) => (
                <Pressable
                  key={tier.id}
                  onPress={() =>
                    onPreferenceChange("serviceTier", tier.id as ServiceTier)
                  }
                  style={[
                    styles.segmentButton,
                    preferences.serviceTier === tier.id &&
                      styles.activeSegmentButton,
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      preferences.serviceTier === tier.id &&
                        styles.activeSegmentText,
                    ]}
                  >
                    {tier.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <SectionLabel label="Display" />
            <SwitchRow
              icon="spark"
              label="Auto scroll"
              value={preferences.autoScroll}
              onValueChange={(value) => onPreferenceChange("autoScroll", value)}
            />
            <SwitchRow
              icon="document"
              label="Compact messages"
              value={preferences.compactMessages}
              onValueChange={(value) =>
                onPreferenceChange("compactMessages", value)
              }
            />
            <SwitchRow
              icon="settings"
              label="Timestamps"
              value={preferences.showTimestamps}
              onValueChange={(value) =>
                onPreferenceChange("showTimestamps", value)
              }
            />
            <SwitchRow
              icon="star"
              label="Save conversations"
              value={preferences.saveConversations}
              onValueChange={(value) =>
                onPreferenceChange("saveConversations", value)
              }
            />

            <SectionLabel label="Data" />
            <View style={styles.endpointBox}>
              <Text style={styles.endpointLabel}>Chat endpoint</Text>
              <Text selectable numberOfLines={2} style={styles.endpointText}>
                {endpoint}
              </Text>
            </View>
            <Pressable onPress={onResetPreferences} style={styles.secondaryAction}>
              <Text style={styles.secondaryActionText}>Reset preferences</Text>
            </Pressable>
            <Pressable onPress={onClearConversations} style={styles.dangerAction}>
              <Text style={styles.dangerActionText}>
                Clear {threadsCount} conversation{threadsCount === 1 ? "" : "s"}
              </Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  activeSegmentButton: {
    backgroundColor: "rgba(138, 180, 248, 0.16)",
    borderColor: "#8ab4f8",
  },
  activeSegmentText: {
    color: "#8ab4f8",
  },
  dangerAction: {
    alignItems: "center",
    borderColor: "rgba(242, 139, 130, 0.35)",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 10,
    padding: 13,
  },
  dangerActionText: {
    color: "#f28b82",
    fontWeight: "800",
  },
  endpointBox: {
    backgroundColor: "rgba(100, 112, 132, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
  },
  endpointLabel: {
    color: "#8a93a5",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  endpointText: {
    color: "#d6dbe6",
    fontSize: 12,
    lineHeight: 17,
  },
  secondaryAction: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 14,
    borderWidth: 1,
    marginTop: 14,
    padding: 13,
  },
  secondaryActionText: {
    color: "#d6dbe6",
    fontWeight: "800",
  },
  segmentButton: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 8,
  },
  segmentGroup: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 4,
  },
  segmentText: {
    color: "#8a93a5",
    fontSize: 12,
    fontWeight: "800",
  },
  settingsSheet: {
    backgroundColor: "#10141b",
    borderTopColor: "rgba(255, 255, 255, 0.08)",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderTopWidth: 1,
    maxHeight: "88%",
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  sheetDismiss: {
    flex: 1,
  },
  sheetHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sheetOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.45)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheetTitle: {
    color: "#f4f7fb",
    fontSize: 20,
    fontWeight: "900",
  },
});
