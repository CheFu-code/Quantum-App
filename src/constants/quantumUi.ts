import type { QuantumIconName } from "@/components/QuantumIcon";
import type { ConversationFilter } from "@/types/quantum";

export const SUGGESTIONS: Array<{
  icon: QuantumIconName;
  label: string;
  tint: string;
}> = [
  {
    icon: "brain",
    label: "Explain dark matter",
    tint: "#8ab4f8",
  },
  {
    icon: "code",
    label: "Write a REST API",
    tint: "#81c995",
  },
  {
    icon: "globe",
    label: "Summarize the news",
    tint: "#fdd663",
  },
  {
    icon: "document",
    label: "Draft a proposal",
    tint: "#c58af9",
  },
];

export const CONVERSATION_FILTERS: Array<{
  id: ConversationFilter;
  label: string;
}> = [
  { id: "all", label: "All" },
  { id: "starred", label: "Starred" },
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "usedWeb", label: "Tools" },
  { id: "failed", label: "Failed" },
];
