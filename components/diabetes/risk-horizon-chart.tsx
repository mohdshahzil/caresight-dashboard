"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from "recharts"
import { BarChart3 } from "lucide-react"

interface HorizonRiskData {
  horizon: string
  risk: number
  level?: string
}

interface RiskHorizonChartProps {
  data: HorizonRiskData[]
}

export function RiskHorizonChart({ data }: RiskHorizonChartProps) {
  if (!data || data.length === 0) {
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Your Health Risk Over Time
        </CardTitle>
        <CardDescription>
          How likely you are to have health complications in the coming weeks and months
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer 
          config={{
            risk: { label: "Risk Score", color: "#8b5cf6" }
          }} 
          className="h-72"
        >
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="horizon" 
              label={{ value: "Days from now", position: "insideBottom", offset: 0 }}
              tickFormatter={(value) => `${value} days`}
            />
            <YAxis 
              domain={[0, 1]} 
              label={{ value: "Risk Level", angle: -90, position: "insideLeft" }}
              tickFormatter={(value) => `${(value * 100).toFixed(0)}%`}
            />
            <ChartTooltip 
              content={<ChartTooltipContent />}
              formatter={(value: any, name: string) => [
                `${(Number(value) * 100).toFixed(1)}% risk`,
                "Health Risk"
              ]}
              labelFormatter={(label) => `In ${label} days`}
            />
            <Bar 
              dataKey="risk" 
              fill="#8b5cf6" 
              radius={[4, 4, 0, 0]}
              name="Health Risk"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
