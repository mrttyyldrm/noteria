"use client";

import { Button } from "@/components/ui/button";
import {
  Item,
  ItemActions,
  ItemContent,
  ItemMedia,
  ItemTitle,
} from "@/components/ui/item";
import { CircleCheck, CircleAlert, Info, X } from "lucide-react";
import { createContext, useContext, useState } from "react";

interface NotificationTypes {
  message: string;
  type: "success" | "error" | "default";
}

interface NotificationContextTypes {
  notifications: NotificationTypes[];
  showNotification: (
    message: string,
    type?: "success" | "error" | "default",
  ) => void;
  removeNotification: (index: number) => void;
  clearAllNotifications: () => void;
}

const NotificationContextDefaultValues: NotificationContextTypes = {
  notifications: [],
  showNotification: () => {},
  removeNotification: () => {},
  clearAllNotifications: () => {},
};

const NotificationContext = createContext<NotificationContextTypes>(
  NotificationContextDefaultValues,
);

export function NotificationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [notifications, setNotifications] = useState<NotificationTypes[]>([]);

  const calculateTimeout = (message: string) => {
    return Math.max(message.length * 50, 5000);
  };

  const showNotification = (
    message: string,
    type: NotificationTypes["type"] = "error",
  ) => {
    const newNotification = {
      message: message,
      type: type,
    };
    setNotifications((prev) => [...prev, newNotification]);

    setTimeout(() => {
      setNotifications((prev) => prev.slice(1));
    }, calculateTimeout(message));
  };

  const removeNotification = (index: number) => {
    setNotifications((prev) => prev.filter((_, i) => i !== index));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };

  const value = {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
  };

  return (
    <NotificationContext.Provider value={value}>
      <Notifications />
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  return useContext(NotificationContext);
}

function Notifications() {
  const { notifications, removeNotification } = useNotification();

  return (
    <div className="z-50 fixed bottom-4 right-4 flex flex-col justify-end space-y-3">
      {notifications.map((notification: NotificationTypes, index: number) => (
        <Notification
          key={index}
          notification={notification}
          onRemove={() => removeNotification(index)}
        />
      ))}
    </div>
  );
}

function Notification({
  notification,
  onRemove,
}: {
  notification: NotificationTypes;
  onRemove: () => void;
}) {
  const notificationIcons = {
    success: <CircleCheck className="text-constructive" />,
    error: <CircleAlert className="text-destructive" />,
    default: <Info className="text-foreground" />,
  };

  return (
    <Item
      variant="outline"
      size="sm"
      className="bg-white min-w-sm max-w-md items-start transition-all duration-300 animate-fade-right"
    >
      <ItemContent className="flex flex-row items-center gap-2 my-auto">
        <ItemMedia className="mb-auto">
          {notificationIcons[notification.type]}
        </ItemMedia>
        <ItemTitle className="text-foreground">
          {notification.message}
        </ItemTitle>
      </ItemContent>
      <ItemActions>
        <Button variant="outline" size="icon-sm" onClick={onRemove}>
          <X className="size-4" />
        </Button>
      </ItemActions>
    </Item>
  );
}
