import { SymbolView } from "expo-symbols";
import { StyleSheet, Text } from "react-native";

const ICONS = {
  add: { ios: "plus", android: "add", web: "add" },
  account: { ios: "person.circle", android: "account_circle", web: "account_circle" },
  attach: { ios: "paperclip", android: "attach_file", web: "attach_file" },
  brain: {
    ios: "brain.head.profile",
    android: "psychology",
    web: "psychology",
  },
  chevron: {
    ios: "chevron.right",
    android: "chevron_right",
    web: "chevron_right",
  },
  close: { ios: "xmark", android: "close", web: "close" },
  code: { ios: "terminal", android: "code", web: "code" },
  copy: { ios: "doc.on.doc", android: "content_copy", web: "content_copy" },
  delete: { ios: "trash", android: "delete", web: "delete" },
  document: { ios: "doc.text", android: "article", web: "article" },
  globe: { ios: "globe", android: "globe", web: "globe" },
  link: { ios: "link", android: "link", web: "link" },
  map: { ios: "map", android: "map", web: "map" },
  menu: { ios: "sidebar.left", android: "menu", web: "menu" },
  mic: { ios: "mic", android: "mic", web: "mic" },
  more: { ios: "ellipsis", android: "more_horiz", web: "more_horiz" },
  regenerate: {
    ios: "arrow.clockwise",
    android: "refresh",
    web: "refresh",
  },
  search: {
    ios: "magnifyingglass",
    android: "search",
    web: "search",
  },
  send: { ios: "paperplane.fill", android: "send", web: "send" },
  settings: { ios: "gearshape", android: "settings", web: "settings" },
  spark: { ios: "sparkles", android: "wand_stars", web: "wand_stars" },
  star: { ios: "star", android: "star_border", web: "star_border" },
  starFilled: { ios: "star.fill", android: "star", web: "star" },
  stop: { ios: "stop.fill", android: "stop", web: "stop" },
  thumbDown: {
    ios: "hand.thumbsdown",
    android: "thumb_down",
    web: "thumb_down",
  },
  thumbUp: {
    ios: "hand.thumbsup",
    android: "thumb_up",
    web: "thumb_up",
  },
} as const;

const FALLBACKS: Record<QuantumIconName, string> = {
  add: "+",
  account: "U",
  attach: "@",
  brain: "*",
  chevron: ">",
  close: "x",
  code: "</>",
  copy: "[]",
  delete: "-",
  document: "#",
  globe: "o",
  link: "~",
  map: "^",
  menu: "=",
  mic: "|",
  more: "...",
  regenerate: "R",
  search: "?",
  send: ">",
  settings: "*",
  spark: "*",
  star: "*",
  starFilled: "*",
  stop: "s",
  thumbDown: "-",
  thumbUp: "+",
};

export type QuantumIconName = keyof typeof ICONS;

export function QuantumIcon({
  color,
  name,
  size = 18,
}: {
  color: string;
  name: QuantumIconName;
  size?: number;
}) {
  return (
    <SymbolView
      name={ICONS[name] as never}
      size={size}
      tintColor={color}
      fallback={
        <Text style={[styles.fallback, { color, fontSize: size * 0.72 }]}>
          {FALLBACKS[name]}
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  fallback: {
    fontWeight: "800",
    lineHeight: 18,
    textAlign: "center",
  },
});
