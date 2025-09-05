"use client"

import { Alert } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Bell, X } from "lucide-react"

interface Notification {
  id: number
  type: "alert" | "info" | "warning"
  message: string
  time: string
}

interface NotificationsPanelProps {
  notifications: Notification[]
  showNotifications: boolean
  onClose: () => void
  onDismiss?: (id: number) => void
}

export function NotificationsPanel({ notifications, showNotifications, onClose, onDismiss }: NotificationsPanelProps) {
  if (!showNotifications) return null

  return (
    <Alert className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Bell className="w-4 h-4 mr-2" />
          <span className="font-semibold">Recent Notifications</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>
      <div className="mt-3 space-y-2">
        {notifications.map((notification) => (
          <div key={notification.id} className="flex items-start justify-between p-2 bg-muted/30 rounded">
            <div className="flex-1">
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge
                variant={
                  notification.type === "alert"
                    ? "destructive"
                    : notification.type === "warning"
                      ? "secondary"
                      : "default"
                }
              >
                {notification.type}
              </Badge>
              {onDismiss && (
                <Button variant="ghost" size="sm" onClick={() => onDismiss(notification.id)} className="h-6 w-6 p-0">
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </Alert>
  )
}
