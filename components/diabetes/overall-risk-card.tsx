"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle } from "lucide-react"

interface OverallRiskData {
  score: number
  level: string
}

interface OverallRiskCardProps {
  data: OverallRiskData
}

function getRiskColor(level: string): string {
  switch (level?.toLowerCase()) {
    case 'low':
      return 'bg-green-100 text-green-800'
    case 'moderate':
    case 'medium':
      return 'bg-yellow-100 text-yellow-800'
    case 'high':
      return 'bg-red-100 text-red-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function OverallRiskCard({ data }: OverallRiskCardProps) {
  if (!data) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Your Current Health Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="text-center p-6 bg-gray-50 rounded-lg">
            <p className="text-3xl font-bold text-gray-900">
              {(data.score * 100).toFixed(0)}%
            </p>
            <p className="text-sm text-gray-600 mt-1">Chance of Health Issues</p>
          </div>
          <div className={`text-center p-6 rounded-lg ${getRiskColor(data.level)}`}>
            <p className="text-3xl font-bold capitalize">
              {data.level} Risk
            </p>
            <p className="text-sm opacity-75 mt-1">Current Status</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
