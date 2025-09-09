"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, Legend, Tooltip as RechartsTooltip, ResponsiveContainer } from "recharts"
import { AlertTriangle } from "lucide-react"
import React, { useState } from "react"

interface RiskFactorsChartProps {
  riskFactors: Record<string, {
    impact: string
    multiplier: number
    value: number
  }>
  horizonRisks: Record<string, any>
}

const CONTEXT_COLORS = ["#10b981", "#6366f1", "#f59e42"] // green, indigo, orange
const RISK_COLORS = ["#ef4444", "#3b82f6"] // red, blue
const HORIZON_KEYS = ["7d", "14d", "30d", "60d", "90d"]

export function RiskFactorsChart({ riskFactors, horizonRisks }: RiskFactorsChartProps) {
  const [selectedHorizon, setSelectedHorizon] = useState("7d")
  const horizonData = horizonRisks?.[`horizon_${selectedHorizon}`] || {}

  // Prepare context factors
  const contextEntries = Object.entries(riskFactors).map(([factor, data], i) => ({
    name: factor.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: Math.abs(data.multiplier),
    group: "Context",
    color: CONTEXT_COLORS[i % CONTEXT_COLORS.length],
    raw: data
  }))

  // Prepare risk components for the selected horizon
  const riskEntries = [
    {
      name: "Hyperglycemia Risk",
      value: isNaN(horizonData?.hyper_risk) ? 0 : Math.abs(horizonData?.hyper_risk ?? 0),
      group: "Risk",
      color: RISK_COLORS[0],
      raw: { impact: 'high_risk', value: horizonData?.hyper_risk }
    },
    {
      name: "Hypoglycemia Risk",
      value: isNaN(horizonData?.hypo_risk) ? 0 : Math.abs(horizonData?.hypo_risk ?? 0),
      group: "Risk",
      color: RISK_COLORS[1],
      raw: { impact: 'low_risk', value: horizonData?.hypo_risk }
    }
  ]

  // Combine and normalize
  const allEntries = [...contextEntries, ...riskEntries]
  const total = allEntries.reduce((sum, e) => sum + e.value, 0) || 1
  const normalizedEntries = allEntries.map(e => ({ ...e, percent: e.value / total }))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-blue-600" />
          Risk Factor Analysis
        </CardTitle>
        <CardDescription>
          Key context factors and risk components influencing your diabetes risk for the selected period
        </CardDescription>
      </CardHeader>
      <CardContent>
        {/* Horizon Tabs */}
        <div className="mb-6 flex gap-2 justify-center">
          {HORIZON_KEYS.map(hk => (
            <button
              key={hk}
              className={`px-3 py-1 rounded ${selectedHorizon === hk ? 'bg-blue-100 text-blue-800 font-bold' : 'bg-gray-100 text-gray-700'}`}
              onClick={() => setSelectedHorizon(hk)}
            >
              {hk.replace('d', ' days')}
            </button>
          ))}
        </div>
        {/* Removed pie chart for a cleaner, less cramped UI */}
        {/* Breakdown table */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {normalizedEntries.map((factor, index) => {
            let valueDisplay = '';
            let extraNote = '';
            if (factor.name === 'Insulin Adherence') {
              valueDisplay = factor.raw.value === 1 ? 'Insulin is administered on time' : 'Insulin is not administered on time as needed';
            } else if (factor.name === 'Insulin Dose') {
              valueDisplay = `${factor.raw.value ?? 'N/A'} units/day`;
              extraNote = 'This is the average insulin dose taken by the user.';
            } else if (factor.name === 'Sleep Quality') {
              valueDisplay = (typeof factor.raw.value === 'number' && factor.raw.value < 1)
                ? (factor.raw.value * 100).toFixed(0) + '%'
                : factor.raw.value?.toString() ?? 'N/A';
            } else if (factor.group === 'Risk') {
              valueDisplay = (factor.raw.value === undefined || isNaN(factor.raw.value))
                ? 'N/A'
                : `${Math.round(factor.raw.value * 100)}%`;
            } else {
              valueDisplay = factor.raw.value?.toString() ?? 'N/A';
            }
            return (
              <div
                key={factor.name}
                className={`p-4 rounded-lg border ${factor.group === 'Risk' ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium text-gray-900">{factor.name}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 border ml-2">{factor.group}</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">
                  {valueDisplay}
                </div>
                {extraNote && <div className="text-xs text-gray-500 mb-1">{extraNote}</div>}
                <span className={`text-xs ${factor.raw.impact === 'high_risk' ? 'text-red-700' : 'text-green-700'}`}>{factor.raw.impact?.replace('_', ' ') || ''} impact</span>
              </div>
            )
          })}
        </div>
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">Understanding Your Risk Factors</h4>
          <div className="text-sm text-blue-800 space-y-1">
            <p>• <span className="text-red-600 font-medium">Red factors</span> increase your diabetes risk</p>
            <p>• <span className="text-green-600 font-medium">Green factors</span> help protect against diabetes risk</p>
            <p>• Focus on improving the red factors through lifestyle changes and medical management</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
