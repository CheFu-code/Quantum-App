import type {
  ChatThread,
  ConversationFilter,
  Message,
  MessageSource,
  MessageToolActivity,
} from "@/types/quantum";

export function statusLabel(message: Message) {
  if (message.status === "failed") return "Failed";
  if (message.status === "stopped") return "Stopped";
  if (message.status === "streaming") return "Writing";
  if (message.status === "thinking" || message.thinking) return "Thinking";
  return "";
}

export function summarizeActivities(activities: MessageToolActivity[]) {
  const searches = activities.filter((activity) => activity.type === "search").length;
  const codeRuns = activities.filter((activity) => activity.type === "code").length;
  const tools = activities.length - searches - codeRuns;
  const parts = [
    searches ? `${searches} search${searches === 1 ? "" : "es"}` : "",
    codeRuns ? `${codeRuns} code run${codeRuns === 1 ? "" : "s"}` : "",
    tools ? `${tools} tool step${tools === 1 ? "" : "s"}` : "",
  ].filter(Boolean);

  return (
    parts.join(", ") ||
    `${activities.length} step${activities.length === 1 ? "" : "s"}`
  );
}

export function normalizeActivities(activities: MessageToolActivity[]) {
  const seen = new Set<string>();

  return activities.filter((activity) => {
    const key = [
      activity.type,
      activity.title,
      activity.detail || "",
      activity.code || "",
      activity.output || "",
    ].join(":");

    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function normalizeSources(sources: MessageSource[]) {
  const seen = new Set<string>();

  return sources.filter((source) => {
    try {
      const url = new URL(source.uri);
      if (!["http:", "https:"].includes(url.protocol)) return false;
      const href = url.toString();
      if (seen.has(href)) return false;
      seen.add(href);
      return true;
    } catch {
      return false;
    }
  });
}

export function readableHost(value: string) {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return "Source";
  }
}

export function matchesConversationFilter(
  thread: ChatThread,
  searchQuery: string,
  filter: ConversationFilter,
) {
  const query = searchQuery.trim().toLowerCase();
  const searchableText = [
    thread.title,
    thread.preview,
    ...thread.messages.map((message) => message.content),
  ]
    .join(" ")
    .toLowerCase();

  if (query && !searchableText.includes(query)) return false;

  const ageMs = Date.now() - thread.timestamp.getTime();

  if (filter === "starred") return Boolean(thread.starred);
  if (filter === "usedWeb") {
    return thread.messages.some((message) =>
      message.metadata?.tools?.enabled?.some((tool) =>
        ["searchGrounding", "urlContext", "mapsGrounding", "fileSearch"].includes(
          tool,
        ),
      ),
    );
  }
  if (filter === "failed") {
    return thread.messages.some(
      (message) => message.status === "failed" || message.status === "stopped",
    );
  }
  if (filter === "today") return ageMs < 24 * 60 * 60 * 1000;
  if (filter === "week") return ageMs < 7 * 24 * 60 * 60 * 1000;

  return true;
}
