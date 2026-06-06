import { LinearGradient } from "expo-linear-gradient";
import { useState } from "react";
import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { QuantumIcon } from "@/components/QuantumIcon";
import { IconButton } from "@/components/quantum/IconButton";
import { ToolChip } from "@/components/quantum/ToolChip";
import type { ChatPreferences, ImageAttachment } from "@/types/quantum";

export function ChatComposer({
  attachments,
  input,
  isTyping,
  notice,
  preferences,
  webSearchEnabled,
  onAttach,
  onInputChange,
  onRemoveAttachment,
  onSend,
  onStop,
  onToggleCode,
  onToggleMaps,
  onToggleUrl,
  onToggleWebSearch,
}: {
  attachments: ImageAttachment[];
  input: string;
  isTyping: boolean;
  notice: string;
  preferences: ChatPreferences;
  webSearchEnabled: boolean;
  onAttach: () => void;
  onInputChange: (value: string) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onSend: () => void;
  onStop: () => void;
  onToggleCode: () => void;
  onToggleMaps: () => void;
  onToggleUrl: () => void;
  onToggleWebSearch: () => void;
}) {
  const canSend = Boolean(input.trim() || attachments.length > 0);
  const [toolMenuOpen, setToolMenuOpen] = useState(false);
  const activeToolCount = [
    webSearchEnabled,
    preferences.urlContext,
    preferences.codeExecution,
    preferences.mapsGrounding,
  ].filter(Boolean).length;

  return (
    <SafeAreaView edges={["bottom"]} style={styles.composerSafeArea}>
      <View style={styles.composerWrap}>
        {attachments.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.composerAttachmentRail}
          >
            {attachments.map((attachment) => (
              <Pressable
                key={attachment.id}
                onPress={() => onRemoveAttachment(attachment.id)}
                style={styles.composerAttachment}
              >
                <QuantumIcon
                  color="#8ab4f8"
                  name={
                    attachment.mimeType.startsWith("image/")
                      ? "spark"
                      : "document"
                  }
                  size={15}
                />
                <Text numberOfLines={1} style={styles.composerAttachmentText}>
                  {attachment.name}
                </Text>
                <QuantumIcon color="#8a93a5" name="close" size={13} />
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.inputBox}>
          <View style={styles.moreButtonWrap}>
            <IconButton
              icon="more"
              label="More actions"
              onPress={() => setToolMenuOpen((open) => !open)}
            />
            {activeToolCount > 0 ? (
              <View style={styles.activeToolBadge}>
                <Text style={styles.activeToolBadgeText}>{activeToolCount}</Text>
              </View>
            ) : null}
          </View>
          <TextInput
            multiline
            onChangeText={onInputChange}
            placeholder="Ask Quantum anything..."
            placeholderTextColor="#697386"
            style={styles.textInput}
            textAlignVertical="top"
            value={input}
          />
          <Pressable
            accessibilityLabel={isTyping ? "Stop response" : "Send message"}
            disabled={!isTyping && !canSend}
            onPress={isTyping ? onStop : onSend}
            style={[
              styles.sendButton,
              !isTyping && !canSend && styles.disabledSendButton,
            ]}
          >
            <LinearGradient
              colors={
                isTyping
                  ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0.08)"]
                  : ["#8ab4f8", "#c58af9"]
              }
              style={styles.sendButtonGradient}
            >
              <QuantumIcon
                color={isTyping ? "#d6dbe6" : "#0d0f14"}
                name={isTyping ? "stop" : "send"}
                size={17}
              />
            </LinearGradient>
          </Pressable>
        </View>
        {toolMenuOpen ? (
          <View style={styles.toolMenu}>
            <ToolChip
              active={false}
              icon="attach"
              label="Attach file"
              onPress={() => {
                setToolMenuOpen(false);
                onAttach();
              }}
              tint="#c58af9"
            />
            <ToolChip
              active={webSearchEnabled}
              icon="globe"
              label="Search"
              onPress={onToggleWebSearch}
              tint="#81c995"
            />
            <ToolChip
              active={preferences.urlContext}
              icon="link"
              label="URL"
              onPress={onToggleUrl}
              tint="#8ab4f8"
            />
            <ToolChip
              active={preferences.codeExecution}
              icon="code"
              label="Code"
              onPress={onToggleCode}
              tint="#fdd663"
            />
            <ToolChip
              active={preferences.mapsGrounding}
              icon="map"
              label="Maps"
              onPress={onToggleMaps}
              tint="#f28b82"
            />
          </View>
        ) : null}
        {notice ? <Text style={styles.notice}>{notice}</Text> : null}
        <Text style={styles.disclaimer}>
          Quantum can make mistakes. Check important information.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  composerAttachment: {
    alignItems: "center",
    backgroundColor: "rgba(100, 112, 132, 0.16)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 999,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    marginRight: 8,
    maxWidth: 220,
    paddingHorizontal: 10,
    paddingVertical: 7,
  },
  composerAttachmentRail: {
    marginBottom: 7,
  },
  composerAttachmentText: {
    color: "#d6dbe6",
    flexShrink: 1,
    fontSize: 12,
  },
  composerSafeArea: {
    backgroundColor: "#0d0f14",
  },
  composerWrap: {
    borderTopColor: "rgba(255, 255, 255, 0.06)",
    borderTopWidth: 1,
    paddingHorizontal: 12,
    paddingTop: 10,
  },
  disabledSendButton: {
    opacity: 0.38,
  },
  disclaimer: {
    color: "rgba(138, 147, 165, 0.58)",
    fontSize: 10,
    paddingBottom: 4,
    paddingTop: 6,
    textAlign: "center",
  },
  inputBox: {
    alignItems: "flex-end",
    backgroundColor: "#171b23",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 21,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 8,
  },
  activeToolBadge: {
    alignItems: "center",
    backgroundColor: "#8ab4f8",
    borderRadius: 8,
    height: 16,
    justifyContent: "center",
    position: "absolute",
    right: -3,
    top: -3,
    width: 16,
  },
  activeToolBadgeText: {
    color: "#0d0f14",
    fontSize: 9,
    fontWeight: "900",
  },
  moreButtonWrap: {
    position: "relative",
  },
  notice: {
    color: "#fdd663",
    fontSize: 11,
    paddingTop: 7,
    textAlign: "center",
  },
  sendButton: {
    borderRadius: 15,
    height: 43,
    overflow: "hidden",
    width: 43,
  },
  sendButtonGradient: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  textInput: {
    color: "#f4f7fb",
    flex: 1,
    fontSize: 15,
    lineHeight: 21,
    maxHeight: 130,
    minHeight: 40,
    paddingHorizontal: 0,
    paddingVertical: 9,
  },
  toolMenu: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingTop: 8,
  },
});
