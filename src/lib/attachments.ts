import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";

import {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
  SUPPORTED_ATTACHMENT_TYPES,
  isSupportedAttachment,
} from "@/constants/quantum";
import { createId } from "@/lib/conversations";
import type { ImageAttachment } from "@/types/quantum";

export async function pickQuantumAttachments(currentCount: number) {
  const availableSlots = MAX_ATTACHMENTS - currentCount;
  if (availableSlots <= 0) {
    return {
      attachments: [],
      notice: `You can attach up to ${MAX_ATTACHMENTS} files.`,
    };
  }

  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: true,
    type: SUPPORTED_ATTACHMENT_TYPES,
  });

  if (result.canceled) {
    return { attachments: [], notice: "" };
  }

  const selectedAssets = result.assets.slice(0, availableSlots);
  const attachments: ImageAttachment[] = [];
  let skippedUnsupported = false;
  let skippedOversized = false;

  for (const asset of selectedAssets) {
    const name = asset.name || "Attachment";
    const mimeType = asset.mimeType || mimeTypeFromName(name);
    const size = asset.size || 0;

    if (!isSupportedAttachment({ mimeType, name })) {
      skippedUnsupported = true;
      continue;
    }

    if (size > MAX_ATTACHMENT_SIZE) {
      skippedOversized = true;
      continue;
    }

    const data = asset.base64
      ? stripDataUrlPrefix(asset.base64)
      : await FileSystem.readAsStringAsync(asset.uri, {
          encoding: FileSystem.EncodingType.Base64,
        });

    attachments.push({
      id: createId("attachment"),
      data,
      mimeType,
      name,
      size,
    });
  }

  const notices = [
    result.assets.length > availableSlots
      ? `Only ${availableSlots} more file${availableSlots === 1 ? "" : "s"} can be attached.`
      : "",
    skippedUnsupported ? "Some selected files are not supported." : "",
    skippedOversized ? "Attachments must be 10 MB or smaller." : "",
  ].filter(Boolean);

  return {
    attachments,
    notice: notices[0] || "",
  };
}

function stripDataUrlPrefix(value: string) {
  const commaIndex = value.indexOf(",");
  return value.startsWith("data:") && commaIndex >= 0
    ? value.slice(commaIndex + 1)
    : value;
}

function mimeTypeFromName(name: string) {
  const extension = name.split(".").pop()?.toLowerCase();
  switch (extension) {
    case "csv":
      return "text/csv";
    case "json":
      return "application/json";
    case "md":
    case "markdown":
      return "text/markdown";
    case "pdf":
      return "application/pdf";
    case "py":
      return "text/x-python";
    case "sql":
      return "application/sql";
    case "ts":
    case "tsx":
      return "application/typescript";
    case "xml":
      return "application/xml";
    case "js":
    case "jsx":
      return "text/javascript";
    default:
      return "text/plain";
  }
}
