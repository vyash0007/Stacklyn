"use client";

import { useWebSocket } from "@/components/providers/WebSocketProvider";

// Helper to generate avatar initials and color from name
const getAvatarProps = (name?: string | null) => {
  if (!name) return { initial: "?", color: "bg-gray-500" };
  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-amber-500",
    "bg-yellow-500",
    "bg-lime-500",
    "bg-green-500",
    "bg-emerald-500",
    "bg-teal-500",
    "bg-cyan-500",
    "bg-sky-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-violet-500",
    "bg-purple-500",
    "bg-fuchsia-500",
    "bg-pink-500",
    "bg-rose-500",
  ];
  const charCode = name.charCodeAt(0) || 0;
  return {
    initial: name.charAt(0).toUpperCase(),
    color: colors[charCode % colors.length],
  };
};

interface UserAvatarProps {
  userId: string;
  name?: string | null;
  imageUrl?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  showOnlineStatus?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-10 h-10 text-base",
  lg: "w-12 h-12 text-lg",
};

const dotSizeClasses = {
  xs: "w-2 h-2",
  sm: "w-2.5 h-2.5",
  md: "w-3 h-3",
  lg: "w-3.5 h-3.5",
};

export function UserAvatar({
  userId,
  name,
  imageUrl,
  size = "md",
  showOnlineStatus = true,
  className = "",
}: UserAvatarProps) {
  const { isUserOnline } = useWebSocket();
  const isOnline = showOnlineStatus && isUserOnline(userId);
  const { initial, color } = getAvatarProps(name);

  return (
    <div className={`relative inline-block ${className}`}>
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || "User"}
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
      ) : (
        <div
          className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center text-white font-medium`}
        >
          {initial}
        </div>
      )}
      {showOnlineStatus && (
        <span
          className={`absolute bottom-0 right-0 ${dotSizeClasses[size]} rounded-full border-2 border-white dark:border-gray-900 ${
            isOnline ? "bg-green-500" : "bg-gray-400"
          }`}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}
