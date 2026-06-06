export type Role = "user" | "assistant";
export type ResponseStyle = "balanced" | "concise" | "detailed";
export type ServiceTier = "standard" | "flex" | "priority";
export type AuthStatus = "checking" | "authenticated" | "guest";
export type MessageStatus =
  | "thinking"
  | "streaming"
  | "complete"
  | "failed"
  | "stopped";
export type MessageFeedbackRating = "up" | "down";
export type ConversationFilter =
  | "all"
  | "starred"
  | "usedWeb"
  | "failed"
  | "today"
  | "week";

export type SessionUser = {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  roles?: string[];
};

export type ChatPreferences = {
  autoScroll: boolean;
  compactMessages: boolean;
  codeExecution: boolean;
  fileSearch: boolean;
  mapsGrounding: boolean;
  responseStyle: ResponseStyle;
  serviceTier: ServiceTier;
  showTimestamps: boolean;
  urlContext: boolean;
};

export type ImageAttachment = {
  id: string;
  name: string;
  mimeType: string;
  data: string;
  size: number;
};

export type GeneratedImage = {
  id: string;
  mimeType: string;
  data: string;
  alt: string;
};

export type MessageSource = {
  title: string;
  uri: string;
  type?: string;
};

export type MessageToolActivity = {
  type: "search" | "code" | "tool";
  title: string;
  detail?: string;
  code?: string;
  output?: string;
};

export type MessageMetadata = {
  activities?: MessageToolActivity[];
  latencyMs?: number;
  model?: string;
  requestId?: string;
  sources?: MessageSource[];
  statusReason?: string;
  tools?: {
    enabled?: string[];
    skipped?: string[];
  };
  usage?: {
    cachedContentTokenCount?: number;
    thoughtsTokenCount?: number;
    totalTokenCount?: number;
  };
};

export interface Message {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
  status?: MessageStatus;
  thinking?: boolean;
  attachments?: ImageAttachment[];
  generatedImages?: GeneratedImage[];
  metadata?: MessageMetadata;
  feedback?: MessageFeedbackRating;
}

export interface ChatThread {
  id: string;
  title: string;
  preview: string;
  timestamp: Date;
  starred?: boolean;
  messages: Message[];
}

export type StoredMessage = {
  id: string;
  role: Role;
  content: string;
  feedback?: MessageFeedbackRating;
  generatedImages?: GeneratedImage[];
  metadata?: MessageMetadata;
  status?: MessageStatus;
  timestamp: string;
};

export type StoredThread = Omit<ChatThread, "timestamp" | "messages"> & {
  timestamp: string;
  messages: StoredMessage[];
};
