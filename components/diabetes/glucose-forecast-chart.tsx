"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from "recharts"
import { TrendingUp } from "lucide-react"

interface ForecastData {
  day: number
  p10?: number
  p50?: number
  p90?: number
}

interface GlucoseForecastChartProps {
  data: ForecastData[]
}

export function GlucoseForecastChart({ data }: GlucoseForecastChartProps) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Your Glucose Levels - Next 90 Days
        </CardTitle>
        <CardDescription>
          AI prediction of how your glucose levels may change over the next 3 months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          config={{
            p10: { label: "Best Case", color: "#10b981" },
            p50: { label: "Most Likely", color: "#3b82f6" },
            p90: { label: "Worst Case", color: "#ef4444" }
          }} 
          className="h-80"
        >
          <AreaChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="day" 
              label={{ value: "Day", position: "insideBottom", offset: 0 }} 
            />
            <YAxis 
              label={{ value: "mg/dL", angle: -90, position: "insideLeft" }} 
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area 
              type="monotone" 
              dataKey="p10" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.2} 
              name="Best Case Scenario" 
            />
            <Area 
              type="monotone" 
              dataKey="p50" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3} 
              name="Most Likely" 
            />
            <Area 
              type="monotone" 
              dataKey="p90" 
              stroke="#ef4444" 
              fill="#ef4444" 
              fillOpacity={0.2} 
              name="Worst Case Scenario" 
            />
            <Legend />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
