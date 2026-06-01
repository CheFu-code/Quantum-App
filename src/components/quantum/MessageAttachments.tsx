import { Image } from "expo-image";
import { StyleSheet, Text, View } from "react-native";

import { QuantumIcon } from "@/components/QuantumIcon";
import type { ImageAttachment } from "@/types/quantum";

export function AttachmentPreviewList({
  attachments,
}: {
  attachments: ImageAttachment[];
}) {
  return (
    <View style={styles.attachmentPreviewList}>
      {attachments.map((attachment) =>
        attachment.mimeType.startsWith("image/") ? (
          <View key={attachment.id} style={styles.attachmentImageFrame}>
            <Image
              contentFit="cover"
              source={{
                uri: `data:${attachment.mimeType};base64,${attachment.data}`,
              }}
              style={styles.attachmentImage}
            />
            <Text numberOfLines={1} style={styles.attachmentImageLabel}>
              {attachment.name}
            </Text>
          </View>
        ) : (
          <View key={attachment.id} style={styles.filePill}>
            <QuantumIcon color="#8ab4f8" name="document" size={15} />
            <Text numberOfLines={1} style={styles.filePillText}>
              {attachment.name}
            </Text>
          </View>
        ),
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  attachmentImage: {
    height: 120,
    width: 170,
  },
  attachmentImageFrame: {
    backgroundColor: "rgba(138, 180, 248, 0.09)",
    borderColor: "rgba(138, 180, 248, 0.22)",
    borderRadius: 14,
    borderWidth: 1,
    overflow: "hidden",
  },
  attachmentImageLabel: {
    color: "#d6dbe6",
    fontSize: 11,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  attachmentPreviewList: {
    gap: 8,
    marginBottom: 8,
  },
  filePill: {
    alignItems: "center",
    backgroundColor: "rgba(138, 180, 248, 0.09)",
    borderColor: "rgba(138, 180, 248, 0.22)",
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  filePillText: {
    color: "#d6dbe6",
    flex: 1,
    fontSize: 12,
  },
});
