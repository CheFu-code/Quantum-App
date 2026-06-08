import type { ConversationFilter } from "@/types/quantum";


export const CONVERSATION_FILTERS: {
  id: ConversationFilter;
  label: string;
}[] = [
  { id: "all", label: "All" },
  { id: "starred", label: "Starred" },
  { id: "today", label: "Today" },
  { id: "week", label: "Week" },
  { id: "usedWeb", label: "Tools" },
  { id: "failed", label: "Failed" },
];
