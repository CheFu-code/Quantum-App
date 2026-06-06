import { Image } from "expo-image";
import { memo } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { QuantumLogo } from "@/components/QuantumLogo";
import { ActivityLog } from "@/components/quantum/ActivityLog";
import { AttachmentPreviewList } from "@/components/quantum/MessageAttachments";
import {
  getContentSignals,
  QuantumMarkdown,
} from "@/components/quantum/QuantumMarkdown";
import { SourceCards } from "@/components/quantum/SourceCards";
import { TinyAction } from "@/components/quantum/TinyAction";
import { formatTime } from "@/lib/conversations";
import {
  normalizeActivities,
  normalizeSources,
  statusLabel,
} from "@/lib/quantumPresentation";
import type {
  Message,
  MessageFeedbackRating,
} from "@/types/quantum";

export const MessageBubble = memo(function MessageBubble({
  copied,
  compact,
  message,
  showTimestamps,
  onCopy,
  onFeedback,
  onRegenerate,
}: {
  copied: boolean;
  compact: boolean;
  message: Message;
  showTimestamps: boolean;
  onCopy: (id: string, content: string) => void | Promise<void>;
  onFeedback: (messageId: string, rating: MessageFeedbackRating) => void;
  onRegenerate: (messageId: string) => void;
}) {
  const isUser = message.role === "user";
  const sources = normalizeSources(message.metadata?.sources || []);
  const activities = normalizeActivities(message.metadata?.activities || []);
  const answerSignals = getAnswerSignals(message.content, {
    hasActivities: activities.length > 0,
    hasSources: sources.length > 0,
  });

  if (isUser) {
    return (
      <View style={styles.userRow}>
        <View style={[styles.userBubble, compact && styles.compactBubble]}>
          {message.attachments && message.attachments.length > 0 && (
            <AttachmentPreviewList attachments={message.attachments} />
          )}
          {message.content ? (
            <Text selectable style={styles.userText}>
              {message.content}
            </Text>
          ) : null}
          {showTimestamps && (
            <Text style={styles.userTimestamp}>{formatTime(message.timestamp)}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.assistantRow}>
      <View style={styles.avatar}>
        <QuantumLogo size={25} />
      </View>
      <View style={styles.assistantContent}>
        <View style={[styles.assistantBubble, compact && styles.compactBubble]}>
          {activities.length > 0 && <ActivityLog activities={activities} />}
          {message.thinking && !message.content ? (
            <View style={styles.thinkingRow}>
              <ActivityIndicator color="#8ab4f8" size="small" />
              <Text style={styles.thinkingText}>Thinking</Text>
            </View>
          ) : null}
          {answerSignals.length > 0 && (
            <AnswerSignalRail signals={answerSignals} />
          )}
          {message.content ? (
            <QuantumMarkdown compact={compact} content={message.content} />
          ) : null}
          {message.thinking && message.content ? (
            <View style={styles.streamingRow}>
              <ActivityIndicator color="#8ab4f8" size="small" />
              <Text style={styles.streamingText}>Writing</Text>
            </View>
          ) : null}
          {message.generatedImages && message.generatedImages.length > 0 && (
            <View style={styles.generatedImages}>
              {message.generatedImages.map((image) => (
                <View key={image.id} style={styles.generatedImageFrame}>
                  <Image
                    contentFit="contain"
                    source={{ uri: `data:${image.mimeType};base64,${image.data}` }}
                    style={styles.generatedImage}
                  />
                  <Text numberOfLines={2} style={styles.generatedCaption}>
                    {image.alt}
                  </Text>
                </View>
              ))}
            </View>
          )}
          {sources.length > 0 && <SourceCards sources={sources} />}
        </View>
        <View style={styles.messageActions}>
          <TinyAction
            active={copied}
            icon="copy"
            label="Copy"
            onPress={() => void onCopy(message.id, message.content)}
          />
          <TinyAction
            active={message.feedback === "up"}
            icon="thumbUp"
            label="Good"
            onPress={() => onFeedback(message.id, "up")}
          />
          <TinyAction
            active={message.feedback === "down"}
            icon="thumbDown"
            label="Bad"
            onPress={() => onFeedback(message.id, "down")}
          />
          <TinyAction
            icon="regenerate"
            label="Regenerate"
            onPress={() => onRegenerate(message.id)}
          />
          {showTimestamps && (
            <Text style={styles.assistantTimestamp}>
              {statusLabel(message)}
              {statusLabel(message) ? " / " : ""}
              {formatTime(message.timestamp)}
            </Text>
          )}
        </View>
      </View>
    </View>
  );
});

function AnswerSignalRail({ signals }: { signals: string[] }) {
  return (
    <View style={styles.signalRail}>
      {signals.map(signal => (
        <View key={signal} style={styles.signalChip}>
          <Text style={styles.signalText}>{signal}</Text>
        </View>
      ))}
    </View>
  );
}

function getAnswerSignals(
  content: string,
  {
    hasActivities,
    hasSources,
  }: {
    hasActivities: boolean;
    hasSources: boolean;
  },
) {
  return Array.from(
    new Set([
      ...getContentSignals(content),
      hasActivities ? "Tools" : "",
      hasSources ? "Sources" : "",
    ].filter(Boolean)),
  );
}

const styles = StyleSheet.create({
  assistantBubble: {
    backgroundColor: "#171b23",
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 18,
    borderTopLeftRadius: 6,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  assistantContent: {
    flex: 1,
    minWidth: 0,
  },
  assistantRow: {
    flexDirection: "row",
    gap: 9,
    marginBottom: 18,
  },
  assistantTimestamp: {
    color: "#697386",
    fontSize: 10,
    marginLeft: "auto",
  },
  avatar: {
    alignItems: "center",
    backgroundColor: "rgba(138, 180, 248, 0.08)",
    borderColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 999,
    borderWidth: 1,
    height: 31,
    justifyContent: "center",
    width: 31,
  },
  compactBubble: {
    paddingHorizontal: 11,
    paddingVertical: 9,
  },
  generatedCaption: {
    color: "#8a93a5",
    fontSize: 11,
    lineHeight: 15,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  generatedImage: {
    aspectRatio: 1,
    width: "100%",
  },
  generatedImageFrame: {
    backgroundColor: "rgba(100, 112, 132, 0.12)",
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 15,
    borderWidth: 1,
    overflow: "hidden",
  },
  generatedImages: {
    gap: 10,
    marginTop: 12,
  },
  messageActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    marginTop: 5,
    paddingHorizontal: 2,
  },
  signalChip: {
    backgroundColor: "rgba(138, 180, 248, 0.08)",
    borderColor: "rgba(138, 180, 248, 0.16)",
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  signalRail: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 9,
  },
  signalText: {
    color: "#a8c7fa",
    fontSize: 10,
    fontWeight: "900",
  },
  streamingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    marginTop: 5,
  },
  streamingText: {
    color: "#8a93a5",
    fontSize: 12,
    fontWeight: "800",
  },
  thinkingRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  thinkingText: {
    color: "#8a93a5",
    fontSize: 14,
    fontWeight: "700",
  },
  userBubble: {
    backgroundColor: "rgba(138, 180, 248, 0.13)",
    borderColor: "rgba(138, 180, 248, 0.22)",
    borderRadius: 18,
    borderTopRightRadius: 6,
    borderWidth: 1,
    maxWidth: "88%",
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  userRow: {
    alignItems: "flex-end",
    marginBottom: 18,
  },
  userText: {
    color: "#f4f7fb",
    fontSize: 15,
    lineHeight: 22,
  },
  userTimestamp: {
    color: "rgba(214, 219, 230, 0.48)",
    fontSize: 10,
    marginTop: 6,
    textAlign: "right",
  },
});
