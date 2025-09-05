"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { Heart, Activity, Stethoscope, Bone, BarChart3, Download, RefreshCw, Bell, Settings } from "lucide-react"

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  onExport: () => void
  onRefresh: () => void
  isRefreshing: boolean
  notifications: Array<any>
  onToggleNotifications: () => void
}

export function DashboardSidebar({
  activeTab,
  onTabChange,
  onExport,
  onRefresh,
  isRefreshing,
  notifications,
  onToggleNotifications,
}: DashboardSidebarProps) {
  return (
    <div className="w-full lg:w-64 bg-sidebar border-b lg:border-r lg:border-b-0 border-sidebar-border lg:min-h-screen">
      <div className="p-4 lg:p-6">
        <div className="flex items-center justify-between lg:justify-start space-x-2 mb-6 lg:mb-8">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-sidebar-primary rounded-lg flex items-center justify-center">
              <Heart className="w-5 h-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-sidebar-foreground">CareSight</span>
          </div>

          <div className="flex items-center space-x-2 lg:hidden">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" onClick={onToggleNotifications} className="relative">
                    <Bell className="w-4 h-4" />
                    {notifications.length > 0 && (
                      <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full text-xs flex items-center justify-center text-destructive-foreground">
                        {notifications.length}
                      </span>
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <Link href="/explainability">
              <Button variant="ghost" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>

        <nav className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <Button
            variant={activeTab === "maternal" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("maternal")}
          >
            <Heart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Maternal Care</span>
            <span className="sm:hidden">Maternal</span>
          </Button>
          <Button
            variant={activeTab === "cardiovascular" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("cardiovascular")}
          >
            <Activity className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Cardiovascular</span>
            <span className="sm:hidden">Cardio</span>
          </Button>
          <Button
            variant={activeTab === "diabetes" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("diabetes")}
          >
            <Stethoscope className="w-4 h-4 mr-2" />
            Diabetes
          </Button>
          <Button
            variant={activeTab === "arthritis" ? "default" : "ghost"}
            className="w-full justify-start"
            onClick={() => onTabChange("arthritis")}
          >
            <Bone className="w-4 h-4 mr-2" />
            Arthritis
          </Button>
        </nav>

        <div className="hidden lg:block mt-8">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-sidebar-foreground">Quick Actions</h4>
          </div>
          <div className="space-y-2">
            <Link href="/explainability">
              <Button variant="ghost" size="sm" className="w-full justify-start">
                <BarChart3 className="w-4 h-4 mr-2" />
                AI Explanations
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
            <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onRefresh}>
              <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
