"use client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Bell, Download, RefreshCw } from "lucide-react"

interface DashboardHeaderProps {
  notifications: Array<{
    id: number
    type: string
    message: string
    time: string
  }>
  onExport: () => void
  onRefresh: () => void
  isRefreshing: boolean
  showNotifications: boolean
  onToggleNotifications: () => void
}

export function DashboardHeader({
  notifications,
  onExport,
  onRefresh,
  isRefreshing,
  showNotifications,
  onToggleNotifications,
}: DashboardHeaderProps) {
  return (
    <div className="mb-6">
      <TooltipProvider>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-foreground mb-2">Patient Risk Dashboard</h1>
            <p className="text-muted-foreground">
              Monitor and analyze patient risk predictions across chronic conditions
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onToggleNotifications}
                  className="relative lg:flex hidden bg-transparent"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Alerts
                  {notifications.length > 0 && (
                    <Badge variant="destructive" className="ml-2 px-1 py-0 text-xs">
                      {notifications.length}
                    </Badge>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>View notifications and alerts</p>
              </TooltipContent>
            </Tooltip>

            <Button variant="outline" size="sm" onClick={onExport} className="lg:flex hidden bg-transparent">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>

            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isRefreshing}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </div>
      </TooltipProvider>
    </div>
  )
}
