// WebSocket event types for chat (matching backend types)

export interface WebSocketChatMessage {
  id: string;
  content: string;
  created_at: Date | string | null;
  updated_at: Date | string | null;
  parent_message_id: string | null;
  user: {
    id: string;
    name: string | null;
    image_url: string | null;
    role: string | null;
  } | null;
  replies_count?: number;
}

export interface ReactionData {
  id: string;
  message_id: string;
  emoji: string;
  user: {
    id: string;
    name: string | null;
    image_url: string | null;
  };
}

// Server to Client events
export interface ServerToClientEvents {
  new_message: (data: { projectId: string; message: WebSocketChatMessage }) => void;
  new_reply: (data: { projectId: string; parentMessageId: string; reply: WebSocketChatMessage }) => void;
  new_reaction: (data: { projectId: string; messageId: string; reaction: ReactionData }) => void;
  reaction_removed: (data: { projectId: string; messageId: string; reactionId: string; emoji: string; userId: string }) => void;
  error: (data: { message: string }) => void;
  joined_project: (data: { projectId: string }) => void;
  left_project: (data: { projectId: string }) => void;
}

// Client to Server events
export interface ClientToServerEvents {
  join_project: (projectId: string) => void;
  leave_project: (projectId: string) => void;
}
