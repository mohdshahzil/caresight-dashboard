"use client"

import { Card, CardHeader } from "@/components/ui/card"
import { Heart, Activity, Stethoscope, Bone } from "lucide-react"

interface OverviewCardsProps {
  patients: Array<{
    riskLevel: string
  }>
}

export function OverviewCards({ patients }: OverviewCardsProps) {
  const totalPatients = patients.length
  const highRiskCount = patients.filter((p) => p.riskLevel === "High").length
  const mediumRiskCount = patients.filter((p) => p.riskLevel === "Medium").length
  const lowRiskCount = patients.filter((p) => p.riskLevel === "Low").length

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Total Patients</p>
            <p className="text-2xl font-bold text-foreground">{totalPatients}</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Heart className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">High Risk</p>
            <p className="text-2xl font-bold text-destructive">{highRiskCount}</p>
          </div>
          <div className="w-8 h-8 bg-destructive/10 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-destructive" />
          </div>
        </CardHeader>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Medium Risk</p>
            <p className="text-2xl font-bold text-accent-foreground">{mediumRiskCount}</p>
          </div>
          <div className="w-8 h-8 bg-accent/10 rounded-lg flex items-center justify-center">
            <Stethoscope className="w-4 h-4 text-accent-foreground" />
          </div>
        </CardHeader>
      </Card>

      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Low Risk</p>
            <p className="text-2xl font-bold text-primary">{lowRiskCount}</p>
          </div>
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
            <Bone className="w-4 h-4 text-primary" />
          </div>
        </CardHeader>
      </Card>
    </div>
  )
}
