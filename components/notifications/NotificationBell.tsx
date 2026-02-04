"use client";

import React, { useState } from "react";
import { Bell, X, Users, AtSign, Reply } from "lucide-react";
import { useWebSocket } from "@/components/providers/WebSocketProvider";
import { NotificationData, NotificationType } from "@/types/websocket";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

const notificationIcons: Record<NotificationType, React.ReactNode> = {
  invite: <Users className="h-4 w-4 text-blue-500" />,
  removed: <Users className="h-4 w-4 text-red-500" />,
  mention: <AtSign className="h-4 w-4 text-purple-500" />,
  reply: <Reply className="h-4 w-4 text-green-500" />,
};

const notificationColors: Record<NotificationType, string> = {
  invite: "bg-blue-500/10 border-blue-500/20",
  removed: "bg-red-500/10 border-red-500/20",
  mention: "bg-purple-500/10 border-purple-500/20",
  reply: "bg-green-500/10 border-green-500/20",
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
      className={`relative p-3 rounded-lg border cursor-pointer hover:bg-accent/50 transition-colors ${notificationColors[notification.type]}`}
      onClick={onClick}
    >
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismiss();
        }}
        className="absolute top-2 right-2 p-1 hover:bg-background/50 rounded-full transition-colors"
      >
        <X className="h-3 w-3 text-muted-foreground" />
      </button>
      <div className="flex items-start gap-3 pr-6">
        <div className="mt-0.5">
          {notificationIcons[notification.type]}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium">{notification.title}</p>
          <p className="text-xs text-muted-foreground line-clamp-2">{notification.message}</p>
          <p className="text-xs text-muted-foreground mt-1">{timeAgo}</p>
        </div>
      </div>
    </div>
  );
}

export function NotificationBell() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const { notifications, notificationCount, removeNotification, clearAllNotifications } = useWebSocket();

  const handleNotificationClick = (notification: NotificationData) => {
    // Navigate based on notification type
    if (notification.projectId) {
      if (notification.type === "mention" || notification.type === "reply") {
        // Navigate to project chat
        router.push(`/workspace/${notification.projectId}?tab=chat`);
      } else {
        // Navigate to project
        router.push(`/workspace/${notification.projectId}`);
      }
    }
    
    // Remove the notification
    removeNotification(notification.id);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {notificationCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center font-medium">
              {notificationCount > 9 ? "9+" : notificationCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {notificationCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground hover:text-foreground h-auto py-1 px-2"
              onClick={clearAllNotifications}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
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
