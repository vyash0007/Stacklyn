"use client";

import React, { useState } from "react";
import { Bell, X, Users, AtSign, Reply, Inbox } from "lucide-react";
import { useWebSocket } from "@/components/providers/WebSocketProvider";
import { NotificationData, NotificationType } from "@/types/websocket";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  invite: <Users className="h-3 w-3" />,
  removed: <Users className="h-3 w-3" />,
  mention: <AtSign className="h-3 w-3" />,
  reply: <Reply className="h-3 w-3" />,
};

function NotificationItem({
  notification,
  onDismiss,
  onClick,
}: {
  notification: NotificationData;
  onDismiss: () => void;
  onClick: () => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <div
      className="group relative flex items-center gap-2.5 px-3 py-2 rounded-md border-l-2 border-l-primary/50 bg-card hover:bg-accent/50 cursor-pointer transition-all duration-200"
      onClick={onClick}
    >
      <div className="shrink-0 flex items-center justify-center h-6 w-6 rounded-full bg-muted text-muted-foreground">
        {notificationIcons[notification.type]}
      </div>
      <div className="flex-1 min-w-0 pr-5">
        <div className="flex items-center gap-2">
          <p className="text-xs font-medium text-foreground leading-tight truncate">{notification.title}</p>
          <span className="text-[10px] text-muted-foreground/60 shrink-0">{timeAgo}</span>
        </div>
        <p className="text-[11px] text-muted-foreground truncate mt-0.5">{notification.message}</p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 p-1.5 rounded-md opacity-0 group-hover:opacity-100 hover:bg-muted transition-all duration-200"
        aria-label="Dismiss notification"
      >
        <X className="h-3.5 w-3.5 text-muted-foreground" />
      </button>
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, notificationCount, removeNotification, clearAllNotifications } = useWebSocket();

  const handleNotificationClick = (notification: NotificationData) => {
    // Navigate based on notification type
    if (notification.type === "mention" || notification.type === "reply") {
      // Navigate to teams chat with the specific project and message
      const params = new URLSearchParams();
      if (notification.projectId) params.set('project', notification.projectId);
      if (notification.messageId) params.set('message', notification.messageId);
      const queryString = params.toString();
      router.push(`/workspace/teams${queryString ? `?${queryString}` : ''}`);
    } else if (notification.projectId) {
      // Navigate to project
      router.push(`/workspace/projects/${notification.projectId}`);
    }

    // Remove the notification
    removeNotification(notification.id);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative h-9 w-9">
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-semibold flex items-center justify-center shadow-sm">
              {notificationCount > 99 ? "99+" : notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[360px] p-0 shadow-lg border-border/50" align="end" sideOffset={8}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
            {notificationCount > 0 && (
              <span className="text-[10px] font-medium bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full">
                {notificationCount}
              </span>
            )}
          </div>
          {notificationCount > 0 && (
            <button
              className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
              onClick={clearAllNotifications}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Content */}
        <div className="max-h-[420px] overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4">
              <div className="h-12 w-12 rounded-full bg-muted/50 flex items-center justify-center mb-3">
                <Inbox className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium text-muted-foreground">No notifications</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">You're all caught up!</p>
            </div>
          ) : (
            <div className="p-2 space-y-1">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onDismiss={() => removeNotification(notification.id)}
                  onClick={() => handleNotificationClick(notification)}
                />
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
