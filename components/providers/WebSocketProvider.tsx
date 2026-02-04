"use client";

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { useAuth } from "@clerk/nextjs";
import {
  ServerToClientEvents,
  ClientToServerEvents,
  WebSocketChatMessage,
  ReactionData,
  OnlineUser,
  NotificationData,
} from "@/types/websocket";

interface WebSocketContextType {
  isConnected: boolean;
  onlineUsers: OnlineUser[];
  notifications: NotificationData[];
  notificationCount: number;
  joinProject: (projectId: string) => void;
  leaveProject: (projectId: string) => void;
  onNewMessage: (callback: (data: { projectId: string; message: WebSocketChatMessage }) => void) => () => void;
  onNewReply: (callback: (data: { projectId: string; parentMessageId: string; reply: WebSocketChatMessage }) => void) => () => void;
  onNewReaction: (callback: (data: { projectId: string; messageId: string; reaction: ReactionData }) => void) => () => void;
  onReactionRemoved: (callback: (data: { projectId: string; messageId: string; reactionId: string; emoji: string; userId: string }) => void) => () => void;
  isUserOnline: (userId: string) => boolean;
  removeNotification: (notificationId: string) => void;
  clearAllNotifications: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

export function useWebSocket() {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error("useWebSocket must be used within a WebSocketProvider");
  }
  return context;
}

interface WebSocketProviderProps {
  children: React.ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState<OnlineUser[]>([]);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const joinedProjectsRef = useRef<Set<string>>(new Set());

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isLoaded || !isSignedIn) {
      return;
    }

    const connectSocket = async () => {
      try {
        const token = await getToken();
        if (!token) {
          console.error("No auth token available for WebSocket");
          return;
        }

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8001";

        const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(wsUrl, {
          auth: { token },
          path: "/socket.io",
          transports: ["websocket", "polling"],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
        });

        socket.on("connect", () => {
          console.log("🔌 WebSocket connected");
          setIsConnected(true);

          // Rejoin previously joined projects after reconnection
          const projectsToJoin = Array.from(joinedProjectsRef.current);
          console.log(`🔄 Rejoining ${projectsToJoin.length} projects:`, projectsToJoin);
          projectsToJoin.forEach((projectId) => {
            socket.emit("join_project", projectId);
          });
        });

        socket.on("disconnect", () => {
          console.log("🔌 WebSocket disconnected");
          setIsConnected(false);
        });

        socket.on("error", (data) => {
          console.error("WebSocket error:", data.message);
        });

        socket.on("joined_project", (data) => {
          console.log(`📥 Joined project: ${data.projectId}`);
          joinedProjectsRef.current.add(data.projectId);
        });

        socket.on("left_project", (data) => {
          console.log(`📤 Left project: ${data.projectId}`);
          joinedProjectsRef.current.delete(data.projectId);
        });

        // Global online presence listeners
        socket.on("global_online_users", (data) => {
          console.log(`👥 Global online users:`, data.users.length);
          setOnlineUsers(data.users);
        });

        socket.on("user_online", (data) => {
          console.log(`🟢 User came online:`, data.user.name);
          setOnlineUsers((prev) => {
            // Avoid duplicates
            if (prev.some((u) => u.id === data.user.id)) return prev;
            return [...prev, data.user];
          });
        });

        socket.on("user_offline", (data) => {
          console.log(`🔴 User went offline:`, data.userId);
          setOnlineUsers((prev) => prev.filter((u) => u.id !== data.userId));
        });

        // Notification listeners
        socket.on("pending_notifications", (data) => {
          console.log(`🔔 Received ${data.notifications.length} pending notifications`);
          setNotifications(data.notifications);
        });

        socket.on("notification", (data) => {
          console.log(`🔔 New notification:`, data.type);
          setNotifications((prev) => [data, ...prev]);
        });

        socketRef.current = socket;
      } catch (error) {
        console.error("Failed to connect WebSocket:", error);
      }
    };

    connectSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [isLoaded, isSignedIn, getToken]);

  const joinProject = useCallback((projectId: string) => {
    // Always store for potential reconnection
    joinedProjectsRef.current.add(projectId);
    
    if (socketRef.current?.connected) {
      console.log(`📤 Emitting join_project for: ${projectId}`);
      socketRef.current.emit("join_project", projectId);
    } else {
      console.log(`⏳ Socket not connected, queued join for: ${projectId}`);
    }
  }, []);

  const leaveProject = useCallback((projectId: string) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("leave_project", projectId);
    }
    joinedProjectsRef.current.delete(projectId);
  }, []);

  const onNewMessage = useCallback(
    (callback: (data: { projectId: string; message: WebSocketChatMessage }) => void) => {
      socketRef.current?.on("new_message", callback);
      return () => {
        socketRef.current?.off("new_message", callback);
      };
    },
    []
  );

  const onNewReply = useCallback(
    (callback: (data: { projectId: string; parentMessageId: string; reply: WebSocketChatMessage }) => void) => {
      socketRef.current?.on("new_reply", callback);
      return () => {
        socketRef.current?.off("new_reply", callback);
      };
    },
    []
  );

  const onNewReaction = useCallback(
    (callback: (data: { projectId: string; messageId: string; reaction: ReactionData }) => void) => {
      socketRef.current?.on("new_reaction", callback);
      return () => {
        socketRef.current?.off("new_reaction", callback);
      };
    },
    []
  );

  const onReactionRemoved = useCallback(
    (callback: (data: { projectId: string; messageId: string; reactionId: string; emoji: string; userId: string }) => void) => {
      socketRef.current?.on("reaction_removed", callback);
      return () => {
        socketRef.current?.off("reaction_removed", callback);
      };
    },
    []
  );

  const isUserOnline = useCallback((userId: string) => {
    return onlineUsers.some((u) => u.id === userId);
  }, [onlineUsers]);

  const removeNotification = useCallback(async (notificationId: string) => {
    // Optimistically remove from state
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
    
    // Call API to remove from Redis
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications/${notificationId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to remove notification:", response.status);
      }
    } catch (error) {
      console.error("Failed to remove notification:", error);
    }
  }, [getToken]);

  const clearAllNotifications = useCallback(async () => {
    // Optimistically clear state
    setNotifications([]);
    
    // Call API to clear from Redis
    try {
      const token = await getToken();
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/notifications`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!response.ok) {
        console.error("Failed to clear notifications:", response.status);
      }
    } catch (error) {
      console.error("Failed to clear notifications:", error);
    }
  }, [getToken]);

  return (
    <WebSocketContext.Provider
      value={{
        isConnected,
        onlineUsers,
        notifications,
        notificationCount: notifications.length,
        joinProject,
        leaveProject,
        onNewMessage,
        onNewReply,
        onNewReaction,
        onReactionRemoved,
        isUserOnline,
        removeNotification,
        clearAllNotifications,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
}
